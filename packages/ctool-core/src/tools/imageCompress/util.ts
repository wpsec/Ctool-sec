import { createCanvasContext, loadImage } from "../imageShared/util";

export const compressImage = async (src: string, quality: number, mime: string) => {
    const image = await loadImage(src);
    const { canvas, context } = createCanvasContext(image.width, image.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL(mime, Math.max(0.05, Math.min(1, quality / 100)));
};
