export const chartPalette = [
    "#5470c6",
    "#91cc75",
    "#fac858",
    "#ee6666",
    "#73c0de",
    "#3ba272",
    "#fc8452",
    "#9a60b4",
    "#ea7ccc",
    "#6a9ee6",
];

export const parseObjectExpression = <T>(input: string): T => {
    const source = input.trim();
    if (!source) {
        throw new Error("empty input");
    }
    const fn = new Function(`return (${source});`);
    return fn() as T;
};

export const clampNumber = (value: number, min: number, max: number) => {
    if (!Number.isFinite(value)) {
        return min;
    }
    return Math.min(max, Math.max(min, value));
};

export const escapeXml = (value: string) => {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
};
