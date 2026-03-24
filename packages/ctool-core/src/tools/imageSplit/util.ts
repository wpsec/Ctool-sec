import { createCanvasContext, loadImage } from "../imageShared/util";

export const splitImage = async (src: string, rows: number, cols: number, mime: string) => {
    const image = await loadImage(src);
    const pieceWidth = Math.floor(image.width / cols);
    const pieceHeight = Math.floor(image.height / rows);
    const results: string[] = [];

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const { canvas, context } = createCanvasContext(pieceWidth, pieceHeight);
            context.drawImage(
                image,
                col * pieceWidth,
                row * pieceHeight,
                pieceWidth,
                pieceHeight,
                0,
                0,
                pieceWidth,
                pieceHeight,
            );
            results.push(canvas.toDataURL(mime, 0.92));
        }
    }
    return results;
};
