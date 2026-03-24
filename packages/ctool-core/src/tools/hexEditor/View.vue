<template>
    <div class="ctool-hex-editor">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-hex-editor-toolbar">
                <div>
                    <div class="ctool-hex-editor-desc">{{ $t("hexEditor_description") }}</div>
                    <div class="ctool-hex-editor-hint">{{ $t("hexEditor_hint") }}</div>
                </div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="$t('hexEditor_select_file')" @click="fileInput?.click()" />
                    <Button :size="'small'" :text="$t('hexEditor_format')" @click="formatHandle" />
                    <Button :size="'small'" :text="$t('hexEditor_restore')" @click="restoreHandle" />
                    <Button :size="'small'" :text="$t('hexEditor_download')" @click="downloadHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
            <div class="ctool-hex-editor-options">
                <div class="ctool-hex-editor-field">
                    <div class="ctool-hex-editor-label">{{ $t("hexEditor_file_name") }}</div>
                    <div class="ctool-hex-editor-value">{{ action.current.fileName || "-" }}</div>
                </div>
                <div class="ctool-hex-editor-field">
                    <div class="ctool-hex-editor-label">{{ $t("hexEditor_size") }}</div>
                    <div class="ctool-hex-editor-value">{{ formatFileSize(action.current.byteLength) }}</div>
                </div>
                <div class="ctool-hex-editor-field">
                    <div class="ctool-hex-editor-label">{{ $t("hexEditor_bytes_per_row") }}</div>
                    <InputNumber v-model="action.current.bytesPerRow" :min="8" :max="32" />
                </div>
            </div>
            <input ref="fileInput" style="display: none;" type="file" @change="handleFileChange" />
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <div class="ctool-hex-editor-layout" :style="{ height: `${height}px` }">
                <Card :title="$t('hexEditor_input_title')" class="ctool-hex-editor-card">
                    <div class="ctool-hex-editor-fill">
                        <Textarea
                            v-model="action.current.currentHex"
                            :height="'100%'"
                            :placeholder="$t('hexEditor_input_placeholder')"
                        />
                    </div>
                </Card>
                <div class="ctool-hex-editor-preview">
                    <Card :title="$t('hexEditor_dump_title')" class="ctool-hex-editor-card">
                        <div class="ctool-hex-editor-fill">
                            <Textarea
                                :model-value="action.current.hexDump"
                                :height="'100%'"
                                :placeholder="$t('hexEditor_dump_placeholder')"
                                readonly
                                copy
                            />
                        </div>
                    </Card>
                    <Card :title="$t('hexEditor_ascii_title')" class="ctool-hex-editor-card">
                        <div class="ctool-hex-editor-fill">
                            <Textarea
                                :model-value="action.current.asciiPreview"
                                :height="'100%'"
                                :placeholder="$t('hexEditor_ascii_placeholder')"
                                readonly
                                copy
                            />
                        </div>
                    </Card>
                </div>
            </div>
        </HeightResize>
    </div>
</template>

<script setup lang="ts">
import { initialize, useAction } from "@/store/action";
import Message from "@/helper/message";
import { watch } from "vue";
import { bytesToAscii, bytesToEditorHex, createHexDump, downloadBinary, formatFileSize, parseHexInput } from "./util";

const action = useAction(await initialize({
    fileName: "",
    originalHex: "",
    currentHex: "",
    hexDump: "",
    asciiPreview: "",
    byteLength: 0,
    bytesPerRow: 16,
}, { paste: false }));

const fileInput = $ref<HTMLInputElement | null>(null);

const updatePreview = (bytes: Uint8Array) => {
    action.current.byteLength = bytes.length;
    action.current.hexDump = createHexDump(bytes, action.current.bytesPerRow);
    action.current.asciiPreview = bytesToAscii(bytes);
};

const clearHandle = () => {
    action.current.fileName = "";
    action.current.originalHex = "";
    action.current.currentHex = "";
    action.current.hexDump = "";
    action.current.asciiPreview = "";
    action.current.byteLength = 0;
    if (fileInput) {
        fileInput.value = "";
    }
    action.save();
};

const formatHandle = () => {
    try {
        const bytes = parseHexInput(action.current.currentHex);
        action.current.currentHex = bytesToEditorHex(bytes, action.current.bytesPerRow);
        updatePreview(bytes);
        action.success({ message: "" });
    } catch (error) {
        console.error(error);
        Message.error($t("hexEditor_error_invalid"));
    }
};

const restoreHandle = () => {
    action.current.currentHex = action.current.originalHex;
    try {
        updatePreview(parseHexInput(action.current.currentHex));
        action.save();
    } catch (error) {
        console.error(error);
    }
};

const downloadHandle = () => {
    try {
        const bytes = parseHexInput(action.current.currentHex);
        if (bytes.length < 1) {
            return Message.error($t("hexEditor_error_empty"));
        }
        downloadBinary(bytes, action.current.fileName ? `edited_${action.current.fileName}` : "hex-editor.bin");
    } catch (error) {
        console.error(error);
        Message.error($t("hexEditor_error_invalid"));
    }
};

const handleFileChange = async () => {
    const file = fileInput?.files?.[0];
    if (!file) {
        return;
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const formatted = bytesToEditorHex(bytes, action.current.bytesPerRow);
    action.current.fileName = file.name;
    action.current.originalHex = formatted;
    action.current.currentHex = formatted;
    updatePreview(bytes);
    action.success({ message: "" });
};

watch(() => action.current.bytesPerRow, () => {
    try {
        updatePreview(parseHexInput(action.current.currentHex));
        action.save();
    } catch (error) {
        console.error(error);
    }
});

watch(() => action.current, () => action.save(), { deep: true });
</script>

<style>
.ctool-hex-editor {
    height: 100%;
}

.ctool-hex-editor-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.ctool-hex-editor-desc {
    font-size: .95rem;
}

.ctool-hex-editor-hint {
    margin-top: 4px;
    font-size: .75rem;
    color: var(--ctool-info-color);
}

.ctool-hex-editor-options {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) minmax(180px, .6fr);
    gap: 10px;
    margin-top: 10px;
}

.ctool-hex-editor-field {
    min-width: 0;
}

.ctool-hex-editor-label {
    margin-bottom: 4px;
    font-size: .8rem;
    color: var(--ctool-info-color);
}

.ctool-hex-editor-value {
    min-height: 32px;
    padding: 6px 10px;
    border: 1px solid var(--ctool-border-color);
    border-radius: var(--border-radius);
    background-color: var(--ctool-background-color);
    word-break: break-all;
    font-family: var(--ctool-family-monospace);
    font-size: .85rem;
}

.ctool-hex-editor-layout {
    display: grid;
    grid-template-columns: minmax(320px, 1fr) minmax(320px, 1fr);
    gap: 5px;
}

.ctool-hex-editor-preview {
    display: grid;
    grid-template-rows: repeat(2, minmax(0, 1fr));
    gap: 5px;
    min-height: 0;
}

.ctool-hex-editor-card,
.ctool-hex-editor-fill {
    min-height: 0;
    height: 100%;
}

.ctool-hex-editor-card .ctool-card-body {
    height: 100%;
}

@media (max-width: 960px) {
    .ctool-hex-editor-toolbar,
    .ctool-hex-editor-options,
    .ctool-hex-editor-layout,
    .ctool-hex-editor-preview {
        grid-template-columns: minmax(0, 1fr);
        flex-direction: column;
    }
}
</style>
