import * as monaco from "monaco-editor";
import formatter from "@/tools/code/formatter";

// 自定义右键菜单
const lists = [
    "ctool_multiple_selection",
    "ctool_beautify",
    "ctool_compress",
    "ctool_line_wrapping",
    "ctool_line_number",
    "ctool_goto",
    "ctool_search",
] as const;

type contextMenuType = (typeof lists)[number];
type menuHandle = (ed: monaco.editor.ICodeEditor, id: contextMenuType, result?: any) => any;

const menuDefinition = (): {
    id: contextMenuType;
    label: string;
    contextMenuGroupId?: string;
    enable?: boolean;
    run?: menuHandle;
}[] => {
    return [
        // 列选择
        {
            id: "ctool_multiple_selection",
            label: $t(`component_editor_multiple`),
            contextMenuGroupId: "1_modification",
            enable: true,
            run: (ed, id) => {
                ed.trigger(id, "editor.action.insertCursorAtEndOfEachLineSelected", "");
            },
        },
        // 查找/替换
        {
            id: "ctool_search",
            label: $t(`component_editor_search`),
            contextMenuGroupId: "1_modification",
            enable: true,
            run: (ed, id) => {
                ed.trigger(id, "editor.action.startFindReplaceAction", null);
            },
        },
        // 跳转
        {
            id: "ctool_goto",
            label: $t(`component_editor_goto`),
            contextMenuGroupId: "1_modification",
            enable: true,
            run: ed => ed.trigger("", "editor.action.gotoLine", null),
        },
        // 格式化
        {
            id: "ctool_beautify",
            label: $t(`code_beautify`),
            run: async ed => {
                const lang = ed.getModel()?.getLanguageId() || "";
                if (!formatter.isEnable(lang, "beautify") || ed.getValue() === "") {
                    return;
                }
                const result = await formatter.simple(lang, "beautify", ed.getValue());
                if (result !== ed.getValue()) {
                    ed.setValue(result);
                }
            },
        },
        // 压缩
        {
            id: "ctool_compress",
            label: $t(`code_compress`),
            run: async ed => {
                const lang = ed.getModel()?.getLanguageId() || "";
                if (!formatter.isEnable(lang, "compress") || ed.getValue() === "") {
                    return;
                }
                const result = await formatter.simple(lang, "compress", ed.getValue());
                if (result !== ed.getValue()) {
                    ed.setValue(result);
                }
            },
        },
        // 自动换行
        {
            id: "ctool_line_wrapping",
            label: $t(`component_editor_line_wrapping`),
            enable: true,
            run: ed => {
                ed.updateOptions({ wordWrap: ed.getRawOptions().wordWrap === "off" ? "on" : "off" });
                return ed.getRawOptions().wordWrap === "on";
            },
        },
        // 显示行号
        {
            id: "ctool_line_number",
            label: $t(`component_editor_line_number`),
            enable: true,
            run: ed => {
                ed.updateOptions({ lineNumbers: ed.getRawOptions().lineNumbers === "off" ? "on" : "off" });
                return ed.getRawOptions().lineNumbers === "on";
            },
        },
    ];
};

class contextMenu {
    private editor: monaco.editor.IStandaloneCodeEditor;
    private disposed = false;
    private removeDefaultMenuTimer: ReturnType<typeof setTimeout> | null = null;
    private disposables: monaco.IDisposable[] = [];
    private contextKeys: Map<string, ReturnType<monaco.editor.IStandaloneCodeEditor["createContextKey"]>> = new Map();

    private handles: { [key in contextMenuType]?: menuHandle } = {};

    constructor(editor: monaco.editor.IStandaloneCodeEditor) {
        this.editor = editor;
        this.initMenu();
        this.disposables.push(this.editor.onDidChangeModelLanguage(e => {
            if (this.disposed) {
                return;
            }
            this.toggle("ctool_beautify", formatter.isEnable(e.newLanguage, "beautify"));
            this.toggle("ctool_compress", formatter.isEnable(e.newLanguage, "compress"));
            this.removeDefaultMenu();
        }));
        this.disposables.push(this.editor.onDidDispose(() => this.dispose()));
        this.removeDefaultMenu();
    }

    private removeDefaultMenu() {
        if (this.removeDefaultMenuTimer) {
            clearTimeout(this.removeDefaultMenuTimer);
        }
        this.removeDefaultMenuTimer = setTimeout(() => {
            if (this.disposed) {
                return;
            }
            // 移除多余右键菜单
            this.setContextKey("editorHasDocumentFormattingProvider", false);
            // this.editor.createContextKey("editorHasDocumentSymbolProvider", false);
            this.setContextKey("editorHasReferenceProvider", false);
            this.setContextKey("editorHasDefinitionProvider", false);
            this.setContextKey("editorHasDocumentSelectionFormattingProvider", false);
            this.setContextKey("editorHasMultipleDocumentFormattingProvider", false);
            this.setContextKey("editorHasMultipleDocumentSelectionFormattingProvider", false);
        }, 200);
    }

    initMenu() {
        if (this.disposed) {
            return;
        }
        let index = 1000;
        menuDefinition().forEach(item => {
            const action: monaco.editor.IActionDescriptor = {
                id: item.id,
                precondition: item.id,
                label: item.label,
                contextMenuGroupId: item.contextMenuGroupId || "ctool",
                contextMenuOrder: index++,
                run: editor => {
                    if (this.disposed) {
                        return;
                    }
                    if (item.run) {
                        const result = item.run(editor, item.id);
                        this.handles[item.id]?.(editor, item.id, result);
                        return;
                    }
                    this.handles[item.id]?.(editor, item.id);
                },
            };
            this.toggle(item.id, !!item.enable);
            this.editor.addAction(action);
        });
    }

    setHandle(id: contextMenuType, handle: menuHandle) {
        this.handles[id] = handle;
    }

    private setContextKey(id: string, status: boolean) {
        if (this.disposed) {
            return null;
        }
        const key = this.contextKeys.get(id);
        if (key) {
            key.set(status);
            return key;
        }
        try {
            const created = this.editor.createContextKey(id, status);
            this.contextKeys.set(id, created);
            return created;
        } catch {
            return null;
        }
    }

    toggle(id: contextMenuType, status: boolean) {
        return this.setContextKey(id, status);
    }

    dispose() {
        if (this.disposed) {
            return;
        }
        this.disposed = true;
        if (this.removeDefaultMenuTimer) {
            clearTimeout(this.removeDefaultMenuTimer);
            this.removeDefaultMenuTimer = null;
        }
        this.disposables.forEach(item => item.dispose());
        this.disposables = [];
        this.contextKeys.clear();
        Object.keys(this.handles).forEach(key => {
            delete this.handles[key as contextMenuType];
        });
    }
}

export default contextMenu;
