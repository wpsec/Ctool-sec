import wasm from "./vendor/pycdc";

export const decompilePycToPy = (filename: string, buffer: ArrayBuffer): string => {
    return wasm.ccall(
        "decompile",
        "string",
        ["string", "array", "number"],
        [filename, new Uint8Array(buffer, 0, buffer.byteLength), buffer.byteLength],
    );
};
