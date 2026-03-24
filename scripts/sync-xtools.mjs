import { execFileSync } from "child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "..");

const sourceRoot = process.argv[2] ? resolve(process.argv[2]) : "";

if (!sourceRoot) {
    console.error("Usage: pnpm run sync:xtools /path/to/xtools-main");
    process.exit(1);
}

const requiredFiles = ["package.json", "next.config.js", "src", "public"];
for (const file of requiredFiles) {
    if (!existsSync(join(sourceRoot, file))) {
        console.error(`xtools-main source is invalid, missing: ${file}`);
        process.exit(1);
    }
}

const sourceNodeModules = join(sourceRoot, "node_modules");
if (!existsSync(sourceNodeModules)) {
    console.error("xtools-main/node_modules not found. Please install dependencies in xtools-main first.");
    process.exit(1);
}

const tempRoot = join(repoRoot, ".cache", "xtools-main-sync");
const outputRoot = join(repoRoot, "packages", "ctool-core", "public", "xtools");

rmSync(tempRoot, { recursive: true, force: true });
mkdirSync(tempRoot, { recursive: true });

cpSync(sourceRoot, tempRoot, {
    recursive: true,
    filter: (src) => {
        const relative = src.slice(sourceRoot.length).replace(/^\/+/, "");
        if (!relative) {
            return true;
        }
        return ![
            "node_modules",
            ".git",
            ".next",
            "out",
            "dist",
            "coverage",
        ].some((item) => relative === item || relative.startsWith(`${item}/`));
    },
});

symlinkSync(sourceNodeModules, join(tempRoot, "node_modules"), "dir");

const patchChartPage = (relativePath, dependencyNeedle) => {
    const file = join(tempRoot, relativePath);
    let content = readFileSync(file, "utf8");
    content = content.replace(`import * as echarts from 'echarts';\n`, "");
    content = content.replace(
        `type ECharts = ReturnType<typeof echarts.init>;`,
        `type ECharts = { setOption: (option: any) => void; resize: () => void; dispose?: () => void };`,
    );
    content = content.replace(
        `  const echartRef = useRef<ECharts>(null!);`,
        `  const echartRef = useRef<ECharts>(null!);\n  const [chartReady, setChartReady] = useState(0);`,
    );
    content = content.replace(dependencyNeedle, dependencyNeedle.replace("]);", `, chartReady]);`));
    content = content.replace(
        `  useEffect(() => {
    if (domWrapRef.current) {
      //@ts-ignore
      echartRef.current = echarts.init(domWrapRef.current, null, {
        renderer: 'canvas',
      });

      const resize = () => echartRef.current.resize();
      window.addEventListener('resize', resize);
      return () => window.removeEventListener('resize', resize);
    }
  }, []);`,
        `  useEffect(() => {
    let active = true;
    let resize = () => {};
    let chart: ECharts | null = null;

    const setup = async () => {
      if (!domWrapRef.current) {
        return;
      }
      const echarts = await import('echarts');
      if (!active || !domWrapRef.current) {
        return;
      }
      chart = echarts.init(domWrapRef.current, null, {
        renderer: 'canvas',
      }) as ECharts;
      echartRef.current = chart;
      resize = () => chart?.resize();
      window.addEventListener('resize', resize);
      setChartReady((value) => value + 1);
    };

    void setup();

    return () => {
      active = false;
      window.removeEventListener('resize', resize);
      chart?.dispose?.();
    };
  }, []);`,
    );
    writeFileSync(file, content);
};

patchChartPage("src/pages/chart_nightingale.tsx", "  }, [chartData, labelShow, radius, borderSx, legendShow, title]);");
patchChartPage("src/pages/chart_line.tsx", "  }, [chartData, legendShow, title, smooth, options]);");
patchChartPage("src/pages/chart_radar.tsx", "  }, [chartData, legendShow, title, options, shape]);");

const nextConfigPath = join(tempRoot, "next.config.js");
let nextConfig = readFileSync(nextConfigPath, "utf8");

if (!nextConfig.includes(`const path = require('path');`)) {
    nextConfig = `const path = require('path');\n${nextConfig}`;
}

if (!nextConfig.includes("trailingSlash: true")) {
    nextConfig = nextConfig.replace(
        "reactStrictMode: false,",
        "reactStrictMode: false,\n  trailingSlash: true,",
    );
}

nextConfig = nextConfig.replace(
    /basePath:\s*process\.env\.NODE_ENV === 'production' \? '\/tools' : '',/,
    "basePath: '/xtools',",
);

nextConfig = nextConfig.replace(
    /webpack:\s*\(config\)\s*=>\s*\{/,
    "webpack: (config, { isServer }) => {",
);

nextConfig = nextConfig.replace(
    "config.resolve.fallback = { fs: false };",
    `config.resolve.fallback = { fs: false };
    if (isServer) {
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        echarts: path.resolve(__dirname, 'build-tools/echarts-server-stub.js'),
      };
    }`,
);

writeFileSync(nextConfigPath, nextConfig);

const buildToolsDir = join(tempRoot, "build-tools");
mkdirSync(buildToolsDir, { recursive: true });
writeFileSync(
    join(buildToolsDir, "echarts-server-stub.js"),
    `const noop = () => {};
const chart = () => ({ setOption: noop, resize: noop, dispose: noop });
module.exports = { init: chart };
module.exports.default = module.exports;
`,
);

execFileSync("npm", ["run", "build"], {
    cwd: tempRoot,
    stdio: "inherit",
});

rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(dirname(outputRoot), { recursive: true });
cpSync(join(tempRoot, "out"), outputRoot, { recursive: true });
rmSync(tempRoot, { recursive: true, force: true });

console.log(`xtools assets synced to ${outputRoot}`);
