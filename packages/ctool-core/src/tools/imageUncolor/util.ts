import { createCanvasContext, loadImage } from "../imageShared/util";

export const convertImageToGrayscale = async (src: string) => {
    const image = await loadImage(src);
    const { canvas, context } = createCanvasContext(image.width, image.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    for (let index = 0; index < imageData.data.length; index += 4) {
        const average = (imageData.data[index] + imageData.data[index + 1] + imageData.data[index + 2]) / 3;
        imageData.data[index] = average;
        imageData.data[index + 1] = average;
        imageData.data[index + 2] = average;
    }
    context.putImageData(imageData, 0, 0);
    return canvas.toDataURL("image/png");
};
