import { createCanvasContext, loadImage } from "../imageShared/util";

export const createPixelatedImage = async (src: string, size: number) => {
    const image = await loadImage(src);
    const pixelSize = Math.max(1, Math.floor(size));
    const { canvas, context } = createCanvasContext(image.width, image.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    for (let top = 0; top < canvas.height; top += pixelSize) {
        for (let left = 0; left < canvas.width; left += pixelSize) {
            let red = 0;
            let green = 0;
            let blue = 0;
            let alpha = 0;
            let count = 0;

            for (let offsetY = 0; offsetY < pixelSize && top + offsetY < canvas.height; offsetY++) {
                for (let offsetX = 0; offsetX < pixelSize && left + offsetX < canvas.width; offsetX++) {
                    const index = ((top + offsetY) * canvas.width + left + offsetX) * 4;
                    red += imageData.data[index];
                    green += imageData.data[index + 1];
                    blue += imageData.data[index + 2];
                    alpha += imageData.data[index + 3];
                    count++;
                }
            }

            const avgRed = red / count;
            const avgGreen = green / count;
            const avgBlue = blue / count;
            const avgAlpha = alpha / count;

            for (let offsetY = 0; offsetY < pixelSize && top + offsetY < canvas.height; offsetY++) {
                for (let offsetX = 0; offsetX < pixelSize && left + offsetX < canvas.width; offsetX++) {
                    const index = ((top + offsetY) * canvas.width + left + offsetX) * 4;
                    imageData.data[index] = avgRed;
                    imageData.data[index + 1] = avgGreen;
                    imageData.data[index + 2] = avgBlue;
                    imageData.data[index + 3] = avgAlpha;
                }
            }
        }
    }

    context.putImageData(imageData, 0, 0);
    return canvas.toDataURL("image/png");
};
