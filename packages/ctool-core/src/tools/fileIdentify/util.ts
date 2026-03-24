import { filetypeinfo } from "magic-bytes.js";

export interface FileIdentifyMatch {
    extension: string;
    mime: string;
    typename: string;
}

const printableRegExp = /^[\x09\x0a\x0d\x20-\x7e]$/;

export const formatFileSize = (size: number) => {
    if (!Number.isFinite(size) || size < 1) {
        return "0 B";
    }
    const units = ["B", "KB", "MB", "GB"];
    let value = size;
    let index = 0;

    while (value >= 1024 && index < units.length - 1) {
        value /= 1024;
        index++;
    }

    return `${value >= 100 || index === 0 ? value.toFixed(0) : value.toFixed(2)} ${units[index]}`;
};

export const getFileExtension = (fileName: string) => {
    const matched = fileName.trim().match(/\.([^.]+)$/);
    return matched?.[1]?.toLowerCase() || "";
};

export const toHexPreview = (bytes: Uint8Array, limit = 64) => {
    return Array.from(bytes.slice(0, limit))
        .map(item => item.toString(16).padStart(2, "0").toUpperCase())
        .join(" ");
};

export const toAsciiPreview = (bytes: Uint8Array, limit = 64) => {
    return Array.from(bytes.slice(0, limit))
        .map(item => {
            const char = String.fromCharCode(item);
            return printableRegExp.test(char) ? char : ".";
        })
        .join("");
};

export const detectTextKind = (bytes: Uint8Array) => {
    if (bytes.length < 1) {
        return "unknown";
    }

    const sample = bytes.slice(0, Math.min(bytes.length, 512));
    let printable = 0;

    for (const value of sample) {
        const char = String.fromCharCode(value);
        if (printableRegExp.test(char)) {
            printable++;
        }
    }

    const ratio = printable / sample.length;
    if (ratio > 0.9) {
        return "text";
    }
    if (ratio < 0.3) {
        return "binary";
    }
    return "unknown";
};

export const detectFileMatches = (bytes: Uint8Array): FileIdentifyMatch[] => {
    const infos = filetypeinfo(Array.from(bytes.slice(0, Math.min(bytes.length, 4100)))) as FileIdentifyMatch[];
    const unique = new Map<string, FileIdentifyMatch>();

    for (const item of infos) {
        const match = {
            extension: item.extension || "",
            mime: item.mime || "",
            typename: item.typename || "",
        };
        unique.set(`${match.extension}|${match.mime}|${match.typename}`, match);
    }

    return Array.from(unique.values());
};
