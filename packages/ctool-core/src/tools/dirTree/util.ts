type Node = {
    name: string;
    type: "directory" | "file";
    children?: Node[];
};

const sortNodes = (items: Node[]) => {
    return items.sort((current, next) => {
        if (current.type !== next.type) {
            return current.type === "directory" ? -1 : 1;
        }
        return current.name.localeCompare(next.name);
    });
};

const isExcluded = (path: string, patterns: string[]) => {
    return patterns.some(pattern => {
        if (!pattern.trim()) {
            return false;
        }
        try {
            return new RegExp(pattern).test(path);
        } catch {
            return path.includes(pattern);
        }
    });
};

export const normalizePaths = (input: string) => {
    return input
        .split(/\r?\n/)
        .map(line => line.trim().replace(/^[./\\]+/, "").replace(/\\/g, "/"))
        .filter(Boolean);
};

export const buildTreeText = (pathInput: string, excludeInput: string) => {
    const paths = normalizePaths(pathInput);
    const patterns = excludeInput
        .split(/\r?\n/)
        .map(item => item.trim())
        .filter(Boolean);

    const root: Node = {
        name: "root",
        type: "directory",
        children: [],
    };

    for (const path of paths) {
        if (isExcluded(path, patterns)) {
            continue;
        }

        const segments = path.split("/").filter(Boolean);
        if (segments.length === 0) {
            continue;
        }

        let current = root;
        segments.forEach((segment, index) => {
            const isFile = index === segments.length - 1;
            current.children = current.children || [];

            let node = current.children.find(item => item.name === segment);
            if (!node) {
                node = {
                    name: segment,
                    type: isFile ? "file" : "directory",
                    ...(isFile ? {} : { children: [] }),
                };
                current.children.push(node);
            }
            current = node;
        });
    }

    const render = (items: Node[], prefix = ""): string => {
        return sortNodes(items)
            .map((item, index) => {
                const isLast = index === items.length - 1;
                const line = `${prefix}${isLast ? "└─ " : "├─ "}${item.name}`;
                if (item.type === "file" || !item.children?.length) {
                    return line;
                }
                const childPrefix = `${prefix}${isLast ? "   " : "│  "}`;
                return `${line}\n${render(item.children, childPrefix)}`;
            })
            .join("\n");
    };

    return render(root.children || []);
};
