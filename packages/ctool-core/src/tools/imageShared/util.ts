import Text from "@/helper/text";

export const imageMimeOptions = [
    { value: "image/png", label: "PNG", extension: "png" },
    { value: "image/jpeg", label: "JPEG", extension: "jpg" },
    { value: "image/webp", label: "WEBP", extension: "webp" },
] as const;

export const formatFileSize = (size: number) => {
    if (size === 0) {
        return "0 B";
    }
    const units = ["B", "KB", "MB", "GB", "TB"];
    const digitGroups = Math.floor(Math.log10(size) / Math.log10(1024));
    return `${(size / Math.pow(1024, digitGroups)).toFixed(2)} ${units[digitGroups]}`;
};

export const readFileAsDataUrl = async (file: File) => {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => resolve(`${event.target?.result || ""}`);
        reader.onerror = () => reject(new Error("File read error"));
        reader.readAsDataURL(file);
    });
};

export const loadImage = async (src: string) => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Image load error"));
        image.src = src;
    });
};

export const createCanvasContext = (width: number, height: number) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
        throw new Error("Canvas context unavailable");
    }
    return { canvas, context };
};

export const downloadImage = (dataUrl: string, fileName: string) => {
    Text.fromBase64(dataUrl).setFileName(fileName).toDown();
};

export const getDataUrlSize = (dataUrl: string) => {
    return Text.fromBase64(dataUrl).toUint8Array().length;
};

export const ensureImageDataUrl = (value: string, mime = "image/png") => {
    const input = value.trim();
    if (!input) {
        return "";
    }
    return input.startsWith("data:") ? input : `data:${mime};base64,${input}`;
};
