import { createCanvasContext, loadImage } from "../imageShared/util";

export interface WatermarkOptions {
    text: string;
    color: string;
    fontSize: number;
    gapX: number;
    gapY: number;
    offsetX: number;
    offsetY: number;
}

const createWatermarkTile = (options: WatermarkOptions) => {
    const width = Math.max(options.gapX, options.fontSize * Math.max(options.text.length, 2));
    const height = Math.max(options.gapY, options.fontSize * 3);
    const { canvas, context } = createCanvasContext(width, height);
    context.clearRect(0, 0, width, height);
    context.translate(width / 2, height / 2);
    context.rotate((-20 * Math.PI) / 180);
    context.fillStyle = options.color;
    context.font = `${Math.max(8, options.fontSize)}px sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(options.text, 0, 0);
    return canvas;
};

export const createWatermarkedImage = async (src: string, options: WatermarkOptions) => {
    const image = await loadImage(src);
    const { canvas, context } = createCanvasContext(image.width, image.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const tile = createWatermarkTile(options);
    const pattern = context.createPattern(tile, "repeat");
    if (!pattern) {
        throw new Error("Pattern create failed");
    }
    context.save();
    context.translate(options.offsetX, options.offsetY);
    context.fillStyle = pattern;
    context.fillRect(-options.offsetX, -options.offsetY, canvas.width + Math.abs(options.offsetX), canvas.height + Math.abs(options.offsetY));
    context.restore();
    return canvas.toDataURL("image/png");
};
