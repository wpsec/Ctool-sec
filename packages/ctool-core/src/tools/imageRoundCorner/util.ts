import { createCanvasContext, loadImage } from "../imageShared/util";

export const createRoundedImage = async (src: string, radius: number) => {
    const image = await loadImage(src);
    const maxRadius = Math.min(image.width, image.height) / 2;
    const currentRadius = Math.max(0, Math.min(radius, maxRadius));
    const { canvas, context } = createCanvasContext(image.width, image.height);

    context.beginPath();
    context.moveTo(currentRadius, 0);
    context.lineTo(canvas.width - currentRadius, 0);
    context.quadraticCurveTo(canvas.width, 0, canvas.width, currentRadius);
    context.lineTo(canvas.width, canvas.height - currentRadius);
    context.quadraticCurveTo(canvas.width, canvas.height, canvas.width - currentRadius, canvas.height);
    context.lineTo(currentRadius, canvas.height);
    context.quadraticCurveTo(0, canvas.height, 0, canvas.height - currentRadius);
    context.lineTo(0, currentRadius);
    context.quadraticCurveTo(0, 0, currentRadius, 0);
    context.closePath();
    context.clip();
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/png");
};
