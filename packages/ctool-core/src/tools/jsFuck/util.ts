import { JSFuck } from "./jsfuck";

export const encodeJsFuck = (input: string, wrapWithEval: boolean): string => {
    return JSFuck.encode(input, wrapWithEval);
};

export const decodeJsFuck = (input: string): string => {
    const source = input.trim();
    if (!source) {
        return "";
    }
    const value = (0, eval)(source);
    if (typeof value === "string") {
        return value;
    }
    if (value === undefined) {
        return "undefined";
    }
    if (value === null) {
        return "null";
    }
    if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
        return String(value);
    }
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
};
