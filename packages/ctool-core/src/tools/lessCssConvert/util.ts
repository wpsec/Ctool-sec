export type LessCssMode = "less_to_css" | "css_to_less";

export const getModeMeta = (mode: LessCssMode) => {
    if (mode === "less_to_css") {
        return {
            inputAccept: ".less,.txt,.css",
            outputExtension: "css",
        };
    }
    return {
        inputAccept: ".css,.txt,.less",
        outputExtension: "less",
    };
};

const normalizeLineBreak = (value: string) => value.replace(/\r\n/g, "\n");

export const lessToCssLite = (input: string) => {
    const source = normalizeLineBreak(input);
    const variables: Record<string, string> = {};

    source.replace(/^\s*@([a-zA-Z0-9_-]+)\s*:\s*([^;]+);\s*$/gm, (_, name: string, value: string) => {
        variables[name] = value.trim();
        return _;
    });

    let css = source.replace(/^\s*@([a-zA-Z0-9_-]+)\s*:\s*([^;]+);\s*$/gm, "");
    for (const [name, value] of Object.entries(variables)) {
        css = css.replace(new RegExp(`@${name}\\b`, "g"), value);
    }

    return css
        .split("\n")
        .map(item => item.replace(/\s+$/g, ""))
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
};

const findTopColorValues = (input: string) => {
    const matches = input.match(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/g) || [];
    const counter = new Map<string, number>();
    for (const color of matches) {
        counter.set(color, (counter.get(color) || 0) + 1);
    }
    return Array.from(counter.entries())
        .filter(([, count]) => count > 1)
        .sort((prev, next) => next[1] - prev[1])
        .slice(0, 6);
};

export const cssToLessLite = (input: string, autoVariable = true) => {
    const source = normalizeLineBreak(input).trim();
    if (!autoVariable) {
        return source;
    }

    const topColors = findTopColorValues(source);
    if (topColors.length < 1) {
        return source;
    }

    const variables: Array<{ name: string; value: string }> = topColors.map((item, index) => ({
        name: `color-${index + 1}`,
        value: item[0],
    }));

    let less = source;
    for (const variable of variables) {
        less = less.replace(new RegExp(variable.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), `@${variable.name}`);
    }

    const header = variables.map(variable => `@${variable.name}: ${variable.value};`).join("\n");
    return `${header}\n\n${less}`.trim();
};

export const convertLessCss = (input: string, mode: LessCssMode, autoVariable = true) => {
    return mode === "less_to_css"
        ? lessToCssLite(input)
        : cssToLessLite(input, autoVariable);
};
