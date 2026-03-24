import figlet from "./vendor/figlet";
import Big from "./vendor/fonts/Big";
import Block from "./vendor/fonts/Block";
import Doom from "./vendor/fonts/Doom";
import Slant from "./vendor/fonts/Slant";
import Small from "./vendor/fonts/Small";
import Standard from "./vendor/fonts/Standard";

export type FigletFont = "Standard" | "Slant" | "Big" | "Block" | "Doom" | "Small";
export type LegacyFigletStyle = "block" | "hash" | "dot";
export type FigletStyle = FigletFont | LegacyFigletStyle;

const fontDataMap: Record<FigletFont, string> = {
    Standard,
    Slant,
    Big,
    Block,
    Doom,
    Small,
};

const legacyStyleMap: Record<LegacyFigletStyle, FigletFont> = {
    block: "Standard",
    hash: "Block",
    dot: "Small",
};

const parsedFonts = new Set<string>();

const normalizeFont = (style: FigletStyle): FigletFont => {
    if (style in legacyStyleMap) {
        return legacyStyleMap[style as LegacyFigletStyle];
    }
    if (style in fontDataMap) {
        return style as FigletFont;
    }
    return "Standard";
};

const ensureFontsRegistered = () => {
    for (const [fontName, fontData] of Object.entries(fontDataMap) as [FigletFont, string][]) {
        if (parsedFonts.has(fontName)) {
            continue;
        }
        figlet.parseFont(fontName, fontData);
        parsedFonts.add(fontName);
    }
};

const addSpacing = (input: string, spacing: number) => {
    const gap = Math.max(0, spacing - 1);
    if (gap <= 0) {
        return input;
    }
    return input.split("").join(" ".repeat(gap));
};

const renderLine = (line: string, font: FigletFont, spacing: number, uppercase: boolean) => {
    const text = addSpacing(uppercase ? line.toUpperCase() : line, spacing);
    if (!text) {
        return "";
    }
    return figlet.textSync(text, {
        font,
        horizontalLayout: "fitted",
        verticalLayout: "fitted",
    });
};

export const renderFiglet = (
    input: string,
    style: FigletStyle,
    spacing = 1,
    uppercase = true,
) => {
    ensureFontsRegistered();
    const font = normalizeFont(style);
    const lines = input.replace(/\r\n/g, "\n").split("\n");
    return lines
        .map(line => renderLine(line, font, spacing, uppercase))
        .join("\n\n");
};
