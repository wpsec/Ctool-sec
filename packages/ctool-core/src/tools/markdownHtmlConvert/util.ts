export type MarkdownHtmlConvertMode = "markdown_to_html" | "html_to_markdown";

export const getModeMeta = (mode: MarkdownHtmlConvertMode) => {
    if (mode === "markdown_to_html") {
        return {
            inputAccept: ".md,.markdown,.txt",
            outputExtension: "html",
        };
    }
    return {
        inputAccept: ".html,.htm,.txt",
        outputExtension: "md",
    };
};

const escapeHtml = (value: string) => {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
};

const applyInlineMarkdown = (value: string) => {
    return escapeHtml(value)
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>`)
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/__([^_]+)__/g, "<strong>$1</strong>")
        .replace(/\*([^*]+)\*/g, "<em>$1</em>")
        .replace(/_([^_]+)_/g, "<em>$1</em>");
};

export const markdownToHtml = (markdown: string) => {
    const lines = markdown.replace(/\r\n/g, "\n").split("\n");
    const result: string[] = [];
    let index = 0;

    const flushParagraph = (buffer: string[]) => {
        if (buffer.length < 1) {
            return;
        }
        result.push(`<p>${applyInlineMarkdown(buffer.join("<br>"))}</p>`);
        buffer.length = 0;
    };

    const paragraph: string[] = [];

    while (index < lines.length) {
        const line = lines[index];

        if (/^```/.test(line)) {
            flushParagraph(paragraph);
            const fence = line;
            const language = fence.replace(/^```/, "").trim();
            const code: string[] = [];
            index++;
            while (index < lines.length && !/^```/.test(lines[index])) {
                code.push(lines[index]);
                index++;
            }
            result.push(`<pre><code${language ? ` class="language-${escapeHtml(language)}"` : ""}>${escapeHtml(code.join("\n"))}</code></pre>`);
            index++;
            continue;
        }

        if (line.trim() === "") {
            flushParagraph(paragraph);
            index++;
            continue;
        }

        const heading = line.match(/^(#{1,6})\s+(.*)$/);
        if (heading) {
            flushParagraph(paragraph);
            result.push(`<h${heading[1].length}>${applyInlineMarkdown(heading[2])}</h${heading[1].length}>`);
            index++;
            continue;
        }

        if (/^>\s?/.test(line)) {
            flushParagraph(paragraph);
            const quote: string[] = [];
            while (index < lines.length && /^>\s?/.test(lines[index])) {
                quote.push(lines[index].replace(/^>\s?/, ""));
                index++;
            }
            result.push(`<blockquote><p>${applyInlineMarkdown(quote.join("<br>"))}</p></blockquote>`);
            continue;
        }

        if (/^(-|\*|\+)\s+/.test(line)) {
            flushParagraph(paragraph);
            const items: string[] = [];
            while (index < lines.length && /^(-|\*|\+)\s+/.test(lines[index])) {
                items.push(`<li>${applyInlineMarkdown(lines[index].replace(/^(-|\*|\+)\s+/, ""))}</li>`);
                index++;
            }
            result.push(`<ul>${items.join("")}</ul>`);
            continue;
        }

        if (/^\d+\.\s+/.test(line)) {
            flushParagraph(paragraph);
            const items: string[] = [];
            while (index < lines.length && /^\d+\.\s+/.test(lines[index])) {
                items.push(`<li>${applyInlineMarkdown(lines[index].replace(/^\d+\.\s+/, ""))}</li>`);
                index++;
            }
            result.push(`<ol>${items.join("")}</ol>`);
            continue;
        }

        if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) {
            flushParagraph(paragraph);
            result.push("<hr>");
            index++;
            continue;
        }

        paragraph.push(line);
        index++;
    }

    flushParagraph(paragraph);
    return result.join("\n");
};

const textFromChildren = (node: Node, convert: (child: Node, depth?: number) => string, depth = 0) => {
    return Array.from(node.childNodes).map(child => convert(child, depth)).join("");
};

const normalizeMarkdown = (value: string) => {
    return value
        .replace(/\n{3,}/g, "\n\n")
        .replace(/[ \t]+\n/g, "\n")
        .trim();
};

export const htmlToMarkdown = (html: string) => {
    const document = new DOMParser().parseFromString(html, "text/html");

    const convertNode = (node: Node, depth = 0): string => {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent || "";
        }
        if (node.nodeType !== Node.ELEMENT_NODE) {
            return "";
        }

        const element = node as HTMLElement;
        const tag = element.tagName.toLowerCase();
        const inner = textFromChildren(element, convertNode, depth).trim();

        switch (tag) {
        case "h1":
        case "h2":
        case "h3":
        case "h4":
        case "h5":
        case "h6":
            return `${"#".repeat(Number(tag[1]))} ${inner}\n\n`;
        case "p":
            return `${inner}\n\n`;
        case "br":
            return "\n";
        case "strong":
        case "b":
            return `**${inner}**`;
        case "em":
        case "i":
            return `*${inner}*`;
        case "code":
            if (element.parentElement?.tagName.toLowerCase() === "pre") {
                return inner;
            }
            return `\`${inner}\``;
        case "pre":
            return `\`\`\`\n${element.textContent || ""}\n\`\`\`\n\n`;
        case "a":
            return `[${inner || element.getAttribute("href") || ""}](${element.getAttribute("href") || ""})`;
        case "blockquote":
            return `${inner.split("\n").filter(Boolean).map(line => `> ${line}`).join("\n")}\n\n`;
        case "ul":
            return `${Array.from(element.children).map(child => `- ${textFromChildren(child, convertNode, depth + 1).trim()}`).join("\n")}\n\n`;
        case "ol":
            return `${Array.from(element.children).map((child, index) => `${index + 1}. ${textFromChildren(child, convertNode, depth + 1).trim()}`).join("\n")}\n\n`;
        case "img":
            return `![${element.getAttribute("alt") || ""}](${element.getAttribute("src") || ""})`;
        case "hr":
            return "---\n\n";
        default:
            return `${textFromChildren(element, convertNode, depth)}${tag === "div" ? "\n" : ""}`;
        }
    };

    return normalizeMarkdown(textFromChildren(document.body, convertNode));
};

export const convertMarkdownHtml = (input: string, mode: MarkdownHtmlConvertMode) => {
    return mode === "markdown_to_html" ? markdownToHtml(input) : htmlToMarkdown(input);
};
