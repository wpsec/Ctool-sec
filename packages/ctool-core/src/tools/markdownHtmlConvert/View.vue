<template>
    <div class="ctool-markdown-html-convert">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-markdown-html-convert-toolbar">
                <div>
                    <div class="ctool-markdown-html-convert-desc">{{ $t("markdownHtmlConvert_description") }}</div>
                    <div class="ctool-markdown-html-convert-hint">{{ $t("markdownHtmlConvert_hint") }}</div>
                </div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="$t('markdownHtmlConvert_convert')" @click="convertHandle" />
                    <Button :size="'small'" :text="$t('markdownHtmlConvert_upload')" @click="fileInput?.click()" />
                    <Button :size="'small'" :text="$t('markdownHtmlConvert_export')" @click="exportHandle" />
                    <Button :size="'small'" :text="$t('markdownHtmlConvert_swap')" @click="swapHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
            <div class="ctool-markdown-html-convert-options">
                <div class="ctool-markdown-html-convert-label">{{ $t("markdownHtmlConvert_mode_title") }}</div>
                <Radio v-model="action.current.mode" :options="modeOptions" />
                <input ref="fileInput" style="display: none;" type="file" :accept="modeMeta.inputAccept" @change="handleFileChange" />
            </div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <div class="ctool-markdown-html-convert-layout" :style="{ height: `${height}px` }">
                <Card :title="$t(`markdownHtmlConvert_${action.current.mode}_input_title`)" class="ctool-markdown-html-convert-card">
                    <div class="ctool-markdown-html-convert-fill">
                        <Textarea
                            v-model="action.current.input"
                            :height="'100%'"
                            :placeholder="$t(`markdownHtmlConvert_${action.current.mode}_input_placeholder`)"
                        />
                    </div>
                </Card>
                <Card :title="$t(`markdownHtmlConvert_${action.current.mode}_output_title`)" class="ctool-markdown-html-convert-card">
                    <div class="ctool-markdown-html-convert-fill">
                        <Textarea
                            :model-value="action.current.output"
                            :height="'100%'"
                            :placeholder="$t(`markdownHtmlConvert_${action.current.mode}_output_placeholder`)"
                            readonly
                            copy
                        />
                    </div>
                </Card>
            </div>
        </HeightResize>
    </div>
</template>

<script setup lang="ts">
import { initialize, useAction } from "@/store/action";
import Message from "@/helper/message";
import Text from "@/helper/text";
import { watch } from "vue";
import { convertMarkdownHtml, getModeMeta, MarkdownHtmlConvertMode } from "./util";

const action = useAction(await initialize({
    mode: "markdown_to_html" as MarkdownHtmlConvertMode,
    input: "# Ctool-sec\n\n- markdown\n- html",
    output: "",
}, { paste: false }));

const fileInput = $ref<HTMLInputElement | null>(null);

const modeOptions = $computed(() => {
    return [
        { value: "markdown_to_html", label: $t("markdownHtmlConvert_mode_markdown_to_html") },
        { value: "html_to_markdown", label: $t("markdownHtmlConvert_mode_html_to_markdown") },
    ];
});

const modeMeta = $computed(() => getModeMeta(action.current.mode));

const convertHandle = () => {
    if (!action.current.input.trim()) {
        return Message.error($t("markdownHtmlConvert_error_empty"));
    }
    try {
        action.current.output = convertMarkdownHtml(action.current.input, action.current.mode);
        action.success({ message: "" });
    } catch (error) {
        console.error(error);
        Message.error($t("markdownHtmlConvert_error_convert"));
    }
};

const clearHandle = () => {
    action.current.input = "";
    action.current.output = "";
    if (fileInput) {
        fileInput.value = "";
    }
    action.save();
};

const swapHandle = () => {
    action.current.mode = action.current.mode === "markdown_to_html" ? "html_to_markdown" : "markdown_to_html";
    action.current.input = action.current.output;
    action.current.output = "";
    if (fileInput) {
        fileInput.value = "";
    }
    action.save();
};

const exportHandle = () => {
    if (!action.current.output.trim()) {
        return Message.error($t("markdownHtmlConvert_error_output_empty"));
    }
    Text.fromString(action.current.output).setExtension(modeMeta.outputExtension).toDown();
};

const handleFileChange = async () => {
    const file = fileInput?.files?.[0];
    if (!file) {
        return;
    }
    action.current.input = await file.text();
    action.save();
};

if (!action.current.output) {
    action.current.output = convertMarkdownHtml(action.current.input, action.current.mode);
}

watch(() => action.current, () => action.save(), { deep: true });
</script>

<style>
.ctool-markdown-html-convert {
    height: 100%;
}

.ctool-markdown-html-convert-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.ctool-markdown-html-convert-desc {
    font-size: .95rem;
}

.ctool-markdown-html-convert-hint {
    margin-top: 4px;
    font-size: .75rem;
    color: var(--ctool-info-color);
}

.ctool-markdown-html-convert-options {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
}

.ctool-markdown-html-convert-label {
    font-size: .8rem;
    color: var(--ctool-info-color);
}

.ctool-markdown-html-convert-layout {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px;
}

.ctool-markdown-html-convert-card,
.ctool-markdown-html-convert-fill {
    min-height: 0;
    height: 100%;
}

.ctool-markdown-html-convert-card .ctool-card-body {
    height: 100%;
}

@media (max-width: 960px) {
    .ctool-markdown-html-convert-toolbar,
    .ctool-markdown-html-convert-options {
        flex-direction: column;
        align-items: flex-start;
    }

    .ctool-markdown-html-convert-layout {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
