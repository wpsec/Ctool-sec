export type ShuffleMode = "characters" | "paragraphs";

const shuffle = <T>(items: T[]) => {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index--) {
        const next = Math.floor(Math.random() * (index + 1));
        [result[index], result[next]] = [result[next], result[index]];
    }
    return result;
};

export const shuffleText = (value: string, mode: ShuffleMode) => {
    const lines = value.split("\n");
    if (mode === "paragraphs") {
        return shuffle(lines).join("\n");
    }
    return lines
        .map(line => shuffle(Array.from(line)).join(""))
        .join("\n");
};
