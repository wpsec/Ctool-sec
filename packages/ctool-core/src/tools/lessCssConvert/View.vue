<template>
    <div class="ctool-less-css-convert">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-less-css-convert-toolbar">
                <div>
                    <div class="ctool-less-css-convert-desc">{{ $t("lessCssConvert_description") }}</div>
                    <div class="ctool-less-css-convert-hint">{{ $t("lessCssConvert_hint") }}</div>
                </div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="$t('lessCssConvert_convert')" @click="convertHandle" />
                    <Button :size="'small'" :text="$t('lessCssConvert_upload')" @click="fileInput?.click()" />
                    <Button :size="'small'" :text="$t('lessCssConvert_export')" @click="exportHandle" />
                    <Button :size="'small'" :text="$t('lessCssConvert_swap')" @click="swapHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
            <div class="ctool-less-css-convert-options">
                <div class="ctool-less-css-convert-field ctool-less-css-convert-field-span">
                    <div class="ctool-less-css-convert-label">{{ $t("lessCssConvert_mode_title") }}</div>
                    <Radio v-model="action.current.mode" :options="modeOptions" />
                </div>
                <div class="ctool-less-css-convert-field" v-if="action.current.mode === 'css_to_less'">
                    <div class="ctool-less-css-convert-label">{{ $t("lessCssConvert_auto_variable") }}</div>
                    <Bool v-model="action.current.autoVariable" border :label="$t('lessCssConvert_auto_variable_label')" />
                </div>
                <input ref="fileInput" style="display: none;" type="file" :accept="modeMeta.inputAccept" @change="handleFileChange" />
            </div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <div class="ctool-less-css-convert-layout" :style="{ height: `${height}px` }">
                <Card :title="$t(`lessCssConvert_${action.current.mode}_input_title`)" class="ctool-less-css-convert-card">
                    <div class="ctool-less-css-convert-fill">
                        <Textarea
                            v-model="action.current.input"
                            :height="'100%'"
                            :placeholder="$t(`lessCssConvert_${action.current.mode}_input_placeholder`)"
                        />
                    </div>
                </Card>
                <Card :title="$t(`lessCssConvert_${action.current.mode}_output_title`)" class="ctool-less-css-convert-card">
                    <div class="ctool-less-css-convert-fill">
                        <Textarea
                            :model-value="action.current.output"
                            :height="'100%'"
                            :placeholder="$t(`lessCssConvert_${action.current.mode}_output_placeholder`)"
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
import { convertLessCss, getModeMeta, LessCssMode } from "./util";

const action = useAction(await initialize({
    mode: "less_to_css" as LessCssMode,
    autoVariable: true,
    input: "@primary: #345AFF;\n.button { color: @primary; border: 1px solid @primary; }",
    output: "",
}, { paste: false }));

const fileInput = $ref<HTMLInputElement | null>(null);

const modeOptions = $computed(() => {
    return [
        { value: "less_to_css", label: $t("lessCssConvert_mode_less_to_css") },
        { value: "css_to_less", label: $t("lessCssConvert_mode_css_to_less") },
    ];
});

const modeMeta = $computed(() => getModeMeta(action.current.mode));

const convertHandle = () => {
    if (!action.current.input.trim()) {
        return Message.error($t("lessCssConvert_error_empty"));
    }
    try {
        action.current.output = convertLessCss(
            action.current.input,
            action.current.mode,
            action.current.autoVariable,
        );
        action.success({ message: "" });
    } catch (error) {
        console.error(error);
        Message.error($t("lessCssConvert_error_convert"));
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
    action.current.mode = action.current.mode === "less_to_css" ? "css_to_less" : "less_to_css";
    action.current.input = action.current.output;
    action.current.output = "";
    if (fileInput) {
        fileInput.value = "";
    }
    action.save();
};

const exportHandle = () => {
    if (!action.current.output.trim()) {
        return Message.error($t("lessCssConvert_error_output_empty"));
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
    convertHandle();
}

watch(() => action.current, () => action.save(), { deep: true });
</script>

<style>
.ctool-less-css-convert {
    height: 100%;
}

.ctool-less-css-convert-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.ctool-less-css-convert-desc {
    font-size: .95rem;
}

.ctool-less-css-convert-hint {
    margin-top: 4px;
    font-size: .75rem;
    color: var(--ctool-info-color);
}

.ctool-less-css-convert-options {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin-top: 10px;
}

.ctool-less-css-convert-field-span {
    grid-column: span 3;
}

.ctool-less-css-convert-label {
    margin-bottom: 4px;
    font-size: .8rem;
    color: var(--ctool-info-color);
}

.ctool-less-css-convert-layout {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px;
}

.ctool-less-css-convert-card,
.ctool-less-css-convert-fill {
    min-height: 0;
    height: 100%;
}

.ctool-less-css-convert-card .ctool-card-body {
    height: 100%;
}

@media (max-width: 960px) {
    .ctool-less-css-convert-toolbar {
        flex-direction: column;
    }

    .ctool-less-css-convert-options,
    .ctool-less-css-convert-layout {
        grid-template-columns: minmax(0, 1fr);
    }

    .ctool-less-css-convert-field-span {
        grid-column: span 1;
    }
}
</style>
