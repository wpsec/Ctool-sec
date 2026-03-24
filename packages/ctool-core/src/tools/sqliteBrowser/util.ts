declare global {
    interface Window {
        initSqlJs?: (options: { locateFile: (file: string) => string }) => Promise<any>;
    }
}

const SQL_JS_SCRIPT = "https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/sql-wasm.js";
const SQL_JS_BASE = "https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist";

let scriptPromise: Promise<void> | null = null;
let sqlPromise: Promise<any> | null = null;

const loadScript = (): Promise<void> => {
    if (typeof window === "undefined") {
        return Promise.reject(new Error("window is undefined"));
    }
    if (window.initSqlJs) {
        return Promise.resolve();
    }
    if (scriptPromise) {
        return scriptPromise;
    }
    scriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = SQL_JS_SCRIPT;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("sql.js script load failed"));
        document.head.appendChild(script);
    });
    return scriptPromise;
};

export const loadSqlJs = async (): Promise<any> => {
    if (sqlPromise) {
        return sqlPromise;
    }
    sqlPromise = (async () => {
        await loadScript();
        if (!window.initSqlJs) {
            throw new Error("initSqlJs not found");
        }
        return window.initSqlJs({
            locateFile: (file: string) => `${SQL_JS_BASE}/${file}`,
        });
    })();
    return sqlPromise;
};

const safeCell = (value: unknown): string => {
    if (value === null || value === undefined) {
        return "";
    }
    if (typeof value === "string") {
        return value;
    }
    if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
        return String(value);
    }
    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
};

export interface SqliteQueryResult {
    columns: string[];
    rows: string[][];
}

export const getTables = (db: any): string[] => {
    const result = db.exec("select name from sqlite_master where type = 'table';");
    const tables = result[0]?.values?.map((value: unknown[]) => String(value[0])) || [];
    return ["sqlite_master", ...tables];
};

export const querySql = (db: any, sql: string): SqliteQueryResult => {
    const result = db.exec(sql);
    const first = result[0];
    if (!first) {
        return { columns: [], rows: [] };
    }
    const columns = (first.columns || []).map((item: unknown) => String(item));
    const rows = (first.values || []).map((line: unknown[]) => {
        return line.map(cell => safeCell(cell));
    });
    return { columns, rows };
};

export const quoteIdentifier = (name: string): string => {
    return `"${name.replace(/"/g, "\"\"")}"`;
};
