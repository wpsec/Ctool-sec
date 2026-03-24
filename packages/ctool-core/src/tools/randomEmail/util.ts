export const characterGroups = [
    {
        value: "number",
        chars: "0123456789",
    },
    {
        value: "lowercase",
        chars: "abcdefghijklmnopqrstuvwxyz",
    },
    {
        value: "uppercase",
        chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    },
] as const;

const randomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const buildCharset = (selected: string[], customChars: string) => {
    const presets = characterGroups
        .filter(item => selected.includes(item.value))
        .map(item => item.chars)
        .join("");
    return `${presets}${customChars}`;
};

export const generateEmails = (
    count: number,
    minLength: number,
    maxLength: number,
    suffix: string,
    charset: string,
) => {
    return Array.from({ length: count }).map(() => {
        const length = randomInt(minLength, maxLength);
        let localPart = "";
        for (let index = 0; index < length; index++) {
            localPart += charset[randomInt(0, charset.length - 1)];
        }
        return `${localPart}@${suffix}`;
    });
};
