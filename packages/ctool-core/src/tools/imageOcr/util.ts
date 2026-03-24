declare global {
    interface Window {
        Tesseract?: {
            createWorker: (...args: any[]) => Promise<any>;
        };
    }
}

const TESSERACT_SCRIPT = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
const DEFAULT_LANG = "eng+chi_sim+rus+deu+fra+jpn+kor";

let scriptPromise: Promise<void> | null = null;

const loadScript = (): Promise<void> => {
    if (typeof window === "undefined") {
        return Promise.reject(new Error("window is undefined"));
    }
    if (window.Tesseract) {
        return Promise.resolve();
    }
    if (scriptPromise) {
        return scriptPromise;
    }
    scriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = TESSERACT_SCRIPT;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("tesseract script load failed"));
        document.head.appendChild(script);
    });
    return scriptPromise;
};

export const recognizeImageText = async (
    file: File,
    onProgress: (status: string) => void,
): Promise<string> => {
    await loadScript();
    if (!window.Tesseract) {
        throw new Error("Tesseract not found");
    }

    const imageUrl = URL.createObjectURL(file);
    const worker = await window.Tesseract.createWorker(DEFAULT_LANG, 1, {
        logger: (info: { status?: string; progress?: number }) => {
            const status = info.status || "";
            const progress = typeof info.progress === "number" ? `${(info.progress * 100).toFixed(2)}%` : "";
            onProgress(progress ? `${status} ${progress}` : status);
        },
    });

    try {
        const result = await worker.recognize(imageUrl);
        return result?.data?.text || "";
    } finally {
        URL.revokeObjectURL(imageUrl);
        await worker.terminate();
    }
};
