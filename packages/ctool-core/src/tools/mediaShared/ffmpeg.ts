import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import coreJsUrl from "@ffmpeg/core?url";
import coreWasmUrl from "@ffmpeg/core/wasm?url";

export interface LoadedFFmpeg {
    ffmpeg: any;
    fetchFile: (file?: string | Blob | File) => Promise<Uint8Array>;
}

export const createLoadedFFmpeg = async (onLog?: (message: string) => void): Promise<LoadedFFmpeg> => {
    const ffmpeg = new FFmpeg();

    if (onLog) {
        ffmpeg.on("log", ({ message }: { message: string }) => {
            onLog(message || "");
        });
    }

    await ffmpeg.load({
        coreURL: await toBlobURL(coreJsUrl, "text/javascript"),
        wasmURL: await toBlobURL(coreWasmUrl, "application/wasm"),
    });

    return {
        ffmpeg,
        fetchFile,
    };
};
