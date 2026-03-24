<template>
    <div class="ctool-file-identify">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-file-identify-toolbar">
                <div>
                    <div class="ctool-file-identify-desc">{{ $t("fileIdentify_description") }}</div>
                    <div class="ctool-file-identify-hint">{{ $t("fileIdentify_hint") }}</div>
                </div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="$t('fileIdentify_select_file')" @click="fileInput?.click()" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
            <div class="ctool-file-identify-meta">
                <div class="ctool-file-identify-item">
                    <div class="ctool-file-identify-label">{{ $t("fileIdentify_name") }}</div>
                    <div class="ctool-file-identify-value">{{ action.current.fileName || "-" }}</div>
                </div>
                <div class="ctool-file-identify-item">
                    <div class="ctool-file-identify-label">{{ $t("fileIdentify_size") }}</div>
                    <div class="ctool-file-identify-value">{{ formatFileSize(action.current.fileSize) }}</div>
                </div>
                <div class="ctool-file-identify-item">
                    <div class="ctool-file-identify-label">{{ $t("fileIdentify_extension") }}</div>
                    <div class="ctool-file-identify-value">{{ action.current.fileExtension || "-" }}</div>
                </div>
                <div class="ctool-file-identify-item">
                    <div class="ctool-file-identify-label">{{ $t("fileIdentify_text_kind") }}</div>
                    <div class="ctool-file-identify-value">{{ textKindLabel }}</div>
                </div>
            </div>
            <input ref="fileInput" style="display: none;" type="file" @change="handleFileChange" />
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <div class="ctool-file-identify-layout" :style="{ height: `${height}px` }">
                <Card :title="$t('fileIdentify_result_title')" class="ctool-file-identify-card">
                    <div class="ctool-file-identify-fill">
                        <div v-if="action.current.matches.length > 0" class="ctool-file-identify-table">
                            <Table :columns="columns" :lists="action.current.matches" border />
                        </div>
                        <div v-else class="ctool-file-identify-empty">{{ $t("fileIdentify_result_empty") }}</div>
                    </div>
                </Card>
                <div class="ctool-file-identify-preview">
                    <Card :title="$t('fileIdentify_hex_title')" class="ctool-file-identify-card">
                        <div class="ctool-file-identify-fill">
                            <Textarea
                                :model-value="action.current.hexPreview"
                                :height="'100%'"
                                :placeholder="$t('fileIdentify_hex_placeholder')"
                                readonly
                                copy
                            />
                        </div>
                    </Card>
                    <Card :title="$t('fileIdentify_ascii_title')" class="ctool-file-identify-card">
                        <div class="ctool-file-identify-fill">
                            <Textarea
                                :model-value="action.current.asciiPreview"
                                :height="'100%'"
                                :placeholder="$t('fileIdentify_ascii_placeholder')"
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
import { watch } from "vue";
import { detectFileMatches, detectTextKind, formatFileSize, getFileExtension, toAsciiPreview, toHexPreview } from "./util";

const action = useAction(await initialize({
    fileName: "",
    fileSize: 0,
    fileExtension: "",
    textKind: "unknown",
    matches: [] as { extension: string; mime: string; typename: string }[],
    hexPreview: "",
    asciiPreview: "",
}, { paste: false }));

const fileInput = $ref<HTMLInputElement | null>(null);

const columns = $computed(() => {
    return [
        { title: $t("fileIdentify_column_extension"), key: "extension", width: 140 },
        { title: $t("fileIdentify_column_mime"), key: "mime", width: 220 },
        { title: $t("fileIdentify_column_type"), key: "typename" },
    ];
});

const textKindLabel = $computed(() => {
    return $t(`fileIdentify_text_kind_${action.current.textKind}`);
});

const clearHandle = () => {
    action.current.fileName = "";
    action.current.fileSize = 0;
    action.current.fileExtension = "";
    action.current.textKind = "unknown";
    action.current.matches = [];
    action.current.hexPreview = "";
    action.current.asciiPreview = "";
    if (fileInput) {
        fileInput.value = "";
    }
    action.save();
};

const handleFileChange = async () => {
    const file = fileInput?.files?.[0];
    if (!file) {
        return;
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    action.current.fileName = file.name;
    action.current.fileSize = file.size;
    action.current.fileExtension = getFileExtension(file.name);
    action.current.textKind = detectTextKind(bytes);
    action.current.matches = detectFileMatches(bytes);
    action.current.hexPreview = toHexPreview(bytes, 128);
    action.current.asciiPreview = toAsciiPreview(bytes, 128);
    action.success({ message: "" });
};

watch(() => action.current, () => action.save(), { deep: true });
</script>

<style>
.ctool-file-identify {
    height: 100%;
}

.ctool-file-identify-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.ctool-file-identify-desc {
    font-size: .95rem;
}

.ctool-file-identify-hint {
    margin-top: 4px;
    font-size: .75rem;
    color: var(--ctool-info-color);
}

.ctool-file-identify-meta {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin-top: 10px;
}

.ctool-file-identify-item {
    min-width: 0;
}

.ctool-file-identify-label {
    margin-bottom: 4px;
    font-size: .8rem;
    color: var(--ctool-info-color);
}

.ctool-file-identify-value {
    min-height: 32px;
    padding: 6px 10px;
    border: 1px solid var(--ctool-border-color);
    border-radius: var(--border-radius);
    background-color: var(--ctool-background-color);
    word-break: break-all;
    font-family: var(--ctool-family-monospace);
    font-size: .85rem;
}

.ctool-file-identify-layout {
    display: grid;
    grid-template-columns: minmax(320px, 1.2fr) minmax(0, 1fr);
    gap: 5px;
}

.ctool-file-identify-preview {
    display: grid;
    grid-template-rows: repeat(2, minmax(0, 1fr));
    gap: 5px;
    min-height: 0;
}

.ctool-file-identify-card,
.ctool-file-identify-fill {
    min-height: 0;
    height: 100%;
}

.ctool-file-identify-card .ctool-card-body {
    height: 100%;
}

.ctool-file-identify-table,
.ctool-file-identify-empty {
    height: 100%;
}

.ctool-file-identify-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ctool-info-color);
}

@media (max-width: 960px) {
    .ctool-file-identify-toolbar {
        flex-direction: column;
    }

    .ctool-file-identify-meta,
    .ctool-file-identify-layout,
    .ctool-file-identify-preview {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
