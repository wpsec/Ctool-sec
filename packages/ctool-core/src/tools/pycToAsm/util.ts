import wasm from "./vendor/pycdas";

export const decompilePycToAsm = (filename: string, buffer: ArrayBuffer): string => {
    return wasm.ccall(
        "decompile",
        "string",
        ["string", "array", "number"],
        [filename, new Uint8Array(buffer, 0, buffer.byteLength), buffer.byteLength],
    );
};
