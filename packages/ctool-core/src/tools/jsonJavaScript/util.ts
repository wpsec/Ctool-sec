export type JsonJavaScriptMode = "json_to_js" | "js_to_json";

const evaluateJavaScript = (value: string) => {
    return new Function(`return (${value})`)();
};

export const convertJsonJavaScript = (value: string, mode: JsonJavaScriptMode) => {
    if (mode === "json_to_js") {
        return JSON.stringify(JSON.parse(value), null, 2);
    }
    return JSON.stringify(evaluateJavaScript(value), null, 2);
};

export const getModeMeta = (mode: JsonJavaScriptMode) => {
    if (mode === "json_to_js") {
        return {
            inputExtension: ".json",
            outputExtension: ".js",
            inputAccept: ".json,application/json,text/json",
        };
    }
    return {
        inputExtension: ".js",
        outputExtension: ".json",
        inputAccept: ".js,text/javascript,application/javascript,text/plain",
    };
};
