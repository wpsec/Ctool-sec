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

export const bytesToEditorHex = (bytes: Uint8Array, bytesPerRow = 16) => {
    const rows: string[] = [];
    for (let index = 0; index < bytes.length; index += bytesPerRow) {
        rows.push(
            Array.from(bytes.slice(index, index + bytesPerRow))
                .map(item => item.toString(16).padStart(2, "0").toUpperCase())
                .join(" "),
        );
    }
    return rows.join("\n");
};

export const parseHexInput = (value: string) => {
    const cleaned = value
        .replace(/0x/gi, "")
        .replace(/[^0-9a-f]/gi, "");

    if (cleaned.length < 1) {
        return new Uint8Array();
    }
    if (cleaned.length % 2 !== 0) {
        throw new Error("odd length");
    }

    const bytes = new Uint8Array(cleaned.length / 2);
    for (let index = 0; index < cleaned.length; index += 2) {
        bytes[index / 2] = Number.parseInt(cleaned.slice(index, index + 2), 16);
    }
    return bytes;
};

export const bytesToAscii = (bytes: Uint8Array) => {
    return Array.from(bytes)
        .map(item => item >= 0x20 && item <= 0x7e ? String.fromCharCode(item) : ".")
        .join("");
};

export const createHexDump = (bytes: Uint8Array, bytesPerRow = 16) => {
    const rows: string[] = [];
    for (let offset = 0; offset < bytes.length; offset += bytesPerRow) {
        const row = bytes.slice(offset, offset + bytesPerRow);
        const hex = Array.from(row)
            .map(item => item.toString(16).padStart(2, "0").toUpperCase())
            .join(" ")
            .padEnd(bytesPerRow * 3 - 1, " ");
        const ascii = Array.from(row)
            .map(item => item >= 0x20 && item <= 0x7e ? String.fromCharCode(item) : ".")
            .join("");

        rows.push(`${offset.toString(16).padStart(8, "0").toUpperCase()}  ${hex}  ${ascii}`);
    }
    return rows.join("\n");
};

export const downloadBinary = (bytes: Uint8Array, fileName: string) => {
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/octet-stream" }));
    const link = document.createElement("a");
    link.style.display = "none";
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
