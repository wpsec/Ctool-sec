export type LeetMode = "easy" | "complex";

const easyMap: Record<string, string> = {
    a: "4",
    b: "8",
    e: "3",
    g: "6",
    i: "1",
    l: "1",
    o: "0",
    s: "5",
    t: "7",
};

const complexMap: Record<string, string[]> = {
    a: ["4", "@", "/-\\", "^"],
    b: ["8", "|3", "13", "I3"],
    c: ["<", "(", "[", "{"],
    d: ["|)", "[)", "I>", "|]"],
    e: ["3", "[-", "|=-", "&"],
    f: ["|=", "/=", "|#", "ph"],
    g: ["6", "9", "(_+", "C-"],
    h: ["#", "|-|", "[-]", "/-/"],
    i: ["1", "!", "|", "]["],
    j: ["_|", "]", "._|", ",_|"],
    k: ["|<", "|(", "1<", ">|"],
    l: ["1", "|_", "|", "7"],
    m: ["/\\/\\", "|\\/|", "[V]", "/V\\"],
    n: ["|\\|", "/\\/", "[\\]", "^/"],
    o: ["0", "()", "[]", "<>"],
    p: ["|*", "|>", "|o", "|^"],
    q: ["0_", "(_)", "<|", "()_"],
    r: ["|2", "/2", "|?", "I2"],
    s: ["5", "$", "2", "ehs"],
    t: ["7", "+", "-|-", "']['"],
    u: ["|_|", "(_)", "L|", "v"],
    v: ["\\/", "\\|", "|/"],
    w: ["\\/\\/", "\\V/", "\\X/", "vv"],
    x: ["><", "}{", ")(", "]["],
    y: ["`/", "\\|/", "j", "\\//"],
    z: ["2", "7_", "-/_", ">_"],
};

const pick = (items: string[]) => {
    return items[Math.floor(Math.random() * items.length)];
};

export const convertLeet = (value: string, mode: LeetMode) => {
    if (mode === "easy") {
        return value
            .split("")
            .map(char => easyMap[char.toLowerCase()] || char)
            .join("");
    }
    return value
        .split("")
        .map(char => {
            const candidates = complexMap[char.toLowerCase()];
            return candidates ? pick(candidates) : char;
        })
        .join("");
};
