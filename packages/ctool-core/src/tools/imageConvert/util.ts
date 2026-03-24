import { createCanvasContext, imageMimeOptions, loadImage } from "../imageShared/util";

export const convertImageType = async (src: string, mime: string) => {
    const image = await loadImage(src);
    const { canvas, context } = createCanvasContext(image.width, image.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL(mime, 0.92);
};

export const getImageExtension = (mime: string) => {
    return imageMimeOptions.find(item => item.value === mime)?.extension || "png";
};
