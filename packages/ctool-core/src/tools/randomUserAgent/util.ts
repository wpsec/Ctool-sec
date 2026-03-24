const browsers = {
    chrome: "Chrome",
    edge: "Edge",
    firefox: "Firefox",
    safari: "Safari",
} as const;

const platforms = {
    windows: {
        label: "Windows",
        token: "Windows NT 10.0; Win64; x64",
        mobile: false,
    },
    mac: {
        label: "macOS",
        token: "Macintosh; Intel Mac OS X 10_15_7",
        mobile: false,
    },
    linux: {
        label: "Linux",
        token: "X11; Linux x86_64",
        mobile: false,
    },
    android: {
        label: "Android",
        token: "Linux; Android 14; Pixel 8 Pro",
        mobile: true,
    },
    ios: {
        label: "iOS",
        token: "iPhone; CPU iPhone OS 17_4 like Mac OS X",
        mobile: true,
    },
} as const;

const pick = <T>(items: readonly T[]) => {
    return items[Math.floor(Math.random() * items.length)];
};

const chromeVersions = ["122.0.6261.112", "123.0.6312.86", "124.0.6367.91", "125.0.6422.61"];
const edgeVersions = ["122.0.2365.92", "123.0.2420.81", "124.0.2478.67"];
const firefoxVersions = ["123.0", "124.0", "125.0"];
const safariVersions = ["17.3", "17.4", "17.5"];
const iosSafariVersions = ["17.3", "17.4"];

const buildChrome = (platformKey: keyof typeof platforms) => {
    const platform = platforms[platformKey];
    const version = pick(chromeVersions);
    if (platformKey === "ios") {
        return `Mozilla/5.0 (${platform.token}) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/${version} Mobile/15E148 Safari/604.1`;
    }
    if (platform.mobile) {
        return `Mozilla/5.0 (${platform.token}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version} Mobile Safari/537.36`;
    }
    return `Mozilla/5.0 (${platform.token}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version} Safari/537.36`;
};

const buildEdge = (platformKey: keyof typeof platforms) => {
    const platform = platforms[platformKey];
    if (platform.mobile || platformKey === "ios") {
        return buildChrome(platformKey);
    }
    const version = pick(edgeVersions);
    return `Mozilla/5.0 (${platform.token}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version} Safari/537.36 Edg/${version}`;
};

const buildFirefox = (platformKey: keyof typeof platforms) => {
    const platform = platforms[platformKey];
    const version = pick(firefoxVersions);
    if (platformKey === "ios") {
        return `Mozilla/5.0 (${platform.token}) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/${version} Mobile/15E148 Safari/605.1.15`;
    }
    if (platform.mobile) {
        return `Mozilla/5.0 (${platform.token}; rv:${version}) Gecko/${version} Firefox/${version}`;
    }
    return `Mozilla/5.0 (${platform.token}; rv:${version}) Gecko/20100101 Firefox/${version}`;
};

const buildSafari = (platformKey: keyof typeof platforms) => {
    if (!["mac", "ios"].includes(platformKey)) {
        return buildChrome(platformKey);
    }
    if (platformKey === "ios") {
        const version = pick(iosSafariVersions);
        return `Mozilla/5.0 (${platforms.ios.token}) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${version} Mobile/15E148 Safari/604.1`;
    }
    const version = pick(safariVersions);
    return `Mozilla/5.0 (${platforms.mac.token}) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${version} Safari/605.1.15`;
};

const builders = {
    chrome: buildChrome,
    edge: buildEdge,
    firefox: buildFirefox,
    safari: buildSafari,
} as const;

export const browserOptions = Object.entries(browsers).map(([value, label]) => ({ value, label }));
export const platformOptions = Object.entries(platforms).map(([value, item]) => ({ value, label: item.label }));

export const generateUserAgents = (
    count: number,
    selectedBrowsers: string[],
    selectedPlatforms: string[],
) => {
    return Array.from({ length: count }).map(() => {
        const browser = pick(selectedBrowsers as (keyof typeof builders)[]);
        const platform = pick(selectedPlatforms as (keyof typeof platforms)[]);
        return builders[browser](platform);
    });
};
