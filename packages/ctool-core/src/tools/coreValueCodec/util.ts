const values = "富强民主文明和谐自由平等公正法治爱国敬业诚信友善";

const assertValue = (condition: boolean, message = "Assert Error") => {
    if (!condition) {
        throw new Error(message);
    }
};

const randomBoolean = () => {
    return Math.random() >= 0.5;
};

const strToUtf8Hex = (value: string) => {
    const safePattern = /[A-Za-z0-9-_.!~*'()]/g;
    const normalized = value.replace(safePattern, char => {
        return char.codePointAt(0)?.toString(16) || "";
    });
    return encodeURIComponent(normalized).replace(/%/g, "").toUpperCase();
};

const utf8HexToStr = (value: string) => {
    assertValue(typeof value === "string", "Invalid UTF-8 payload");
    assertValue((value.length & 1) === 0, "Invalid UTF-8 payload");

    const buffer: string[] = [];
    for (let index = 0; index < value.length; index++) {
        if ((index & 1) === 0) {
            buffer.push("%");
        }
        buffer.push(value[index]);
    }
    return decodeURIComponent(buffer.join(""));
};

const hexToDuo = (value: string) => {
    const duo: number[] = [];

    for (const char of value) {
        const current = Number.parseInt(char, 16);
        if (Number.isNaN(current)) {
            throw new Error("Invalid hex character");
        }
        if (current < 10) {
            duo.push(current);
            continue;
        }
        if (randomBoolean()) {
            duo.push(10, current - 10);
        } else {
            duo.push(11, current - 6);
        }
    }
    return duo;
};

const duoToHex = (duo: number[]) => {
    const hex: number[] = [];
    let index = 0;

    while (index < duo.length) {
        if (duo[index] < 10) {
            hex.push(duo[index]);
        } else {
            assertValue(index + 1 < duo.length, "Invalid core value payload");
            if (duo[index] === 10) {
                index++;
                hex.push(duo[index] + 10);
            } else {
                index++;
                hex.push(duo[index] + 6);
            }
        }
        index++;
    }

    return hex.map(value => value.toString(16).toUpperCase()).join("");
};

const duoToValues = (duo: number[]) => {
    return duo.map(value => values[2 * value] + values[2 * value + 1]).join("");
};

export const encodeCoreValue = (value: string) => {
    return duoToValues(hexToDuo(strToUtf8Hex(value)));
};

export const decodeCoreValue = (value: string) => {
    const duo: number[] = [];

    for (const char of value) {
        const index = values.indexOf(char);
        if (index < 0 || (index & 1) === 1) {
            continue;
        }
        duo.push(index >> 1);
    }

    const hex = duoToHex(duo);
    assertValue((hex.length & 1) === 0, "Invalid core value payload");
    return utf8HexToStr(hex);
};
