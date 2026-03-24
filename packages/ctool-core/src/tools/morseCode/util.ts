const MORSE_MAP: Record<string, string> = {
    A: ".-",
    B: "-...",
    C: "-.-.",
    D: "-..",
    E: ".",
    F: "..-.",
    G: "--.",
    H: "....",
    I: "..",
    J: ".---",
    K: "-.-",
    L: ".-..",
    M: "--",
    N: "-.",
    O: "---",
    P: ".--.",
    Q: "--.-",
    R: ".-.",
    S: "...",
    T: "-",
    U: "..-",
    V: "...-",
    W: ".--",
    X: "-..-",
    Y: "-.--",
    Z: "--..",
    "0": "-----",
    "1": ".----",
    "2": "..---",
    "3": "...--",
    "4": "....-",
    "5": ".....",
    "6": "-....",
    "7": "--...",
    "8": "---..",
    "9": "----.",
    ".": ".-.-.-",
    ",": "--..--",
    "?": "..--..",
    "'": ".----.",
    "!": "-.-.--",
    "/": "-..-.",
    "(": "-.--.",
    ")": "-.--.-",
    "&": ".-...",
    ":": "---...",
    ";": "-.-.-.",
    "=": "-...-",
    "+": ".-.-.",
    "-": "-....-",
    "_": "..--.-",
    "\"": ".-..-.",
    "$": "...-..-",
    "@": ".--.-.",
};

const REVERSE_MAP = Object.entries(MORSE_MAP).reduce<Record<string, string>>((result, [key, value]) => {
    result[value] = key;
    return result;
}, {});

export const encodeMorse = (input: string) => {
    return input
        .split(/\r?\n/)
        .map(line => {
            return line
                .toUpperCase()
                .split("")
                .map(char => {
                    if (char === " ") {
                        return "/";
                    }
                    return MORSE_MAP[char] || char;
                })
                .join(" ");
        })
        .join("\n");
};

export const decodeMorse = (input: string) => {
    return input
        .split(/\r?\n/)
        .map(line => {
            return line
                .trim()
                .split(/\s+/)
                .map(token => {
                    if (token === "/" || token === "|") {
                        return " ";
                    }
                    return REVERSE_MAP[token] || token;
                })
                .join("")
                .replace(/\s{2,}/g, " ")
                .trimEnd();
        })
        .join("\n");
};
