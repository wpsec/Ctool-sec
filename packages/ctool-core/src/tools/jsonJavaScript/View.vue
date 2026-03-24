<template>
    <div class="ctool-json-javascript">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-json-javascript-toolbar">
                <div>
                    <div class="ctool-json-javascript-desc">{{ $t("jsonJavaScript_description") }}</div>
                    <div class="ctool-json-javascript-hint">{{ $t("jsonJavaScript_hint") }}</div>
                </div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="$t('jsonJavaScript_convert')" @click="convertHandle" />
                    <Button :size="'small'" :text="$t('jsonJavaScript_upload')" @click="fileInput?.click()" />
                    <Button :size="'small'" :text="$t('jsonJavaScript_export')" @click="exportHandle" />
                    <Button :size="'small'" :text="$t('jsonJavaScript_swap')" @click="swapHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
            <div class="ctool-json-javascript-options">
                <div class="ctool-json-javascript-label">{{ $t("jsonJavaScript_mode_title") }}</div>
                <Radio v-model="action.current.mode" :options="modeOptions" />
                <input ref="fileInput" style="display: none;" type="file" :accept="modeMeta.inputAccept" @change="handleFileChange" />
            </div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <div class="ctool-json-javascript-layout" :style="{ height: `${height}px` }">
                <Card :title="$t(`jsonJavaScript_${action.current.mode}_input_title`)" class="ctool-json-javascript-card">
                    <div class="ctool-json-javascript-fill">
                        <Textarea
                            v-model="action.current.input"
                            :height="'100%'"
                            :placeholder="$t(`jsonJavaScript_${action.current.mode}_input_placeholder`)"
                        />
                    </div>
                </Card>
                <Card :title="$t(`jsonJavaScript_${action.current.mode}_output_title`)" class="ctool-json-javascript-card">
                    <div class="ctool-json-javascript-fill">
                        <Textarea
                            :model-value="action.current.output"
                            :height="'100%'"
                            :placeholder="$t(`jsonJavaScript_${action.current.mode}_output_placeholder`)"
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
import { convertJsonJavaScript, getModeMeta, JsonJavaScriptMode } from "./util";

const action = useAction(await initialize({
    mode: "json_to_js" as JsonJavaScriptMode,
    input: "",
    output: "",
}, { paste: false }));

const fileInput = $ref<HTMLInputElement | null>(null);

const modeOptions = $computed(() => {
    return [
        { value: "json_to_js", label: $t("jsonJavaScript_mode_json_to_js") },
        { value: "js_to_json", label: $t("jsonJavaScript_mode_js_to_json") },
    ];
});

const modeMeta = $computed(() => getModeMeta(action.current.mode));

const convertHandle = () => {
    if (!action.current.input.trim()) {
        return Message.error($t("jsonJavaScript_error_empty"));
    }
    try {
        action.current.output = convertJsonJavaScript(action.current.input, action.current.mode);
        action.success({ message: "" });
    } catch (error) {
        console.error(error);
        Message.error($t("jsonJavaScript_error_convert"));
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
    action.current.mode = action.current.mode === "json_to_js" ? "js_to_json" : "json_to_js";
    action.current.input = action.current.output;
    action.current.output = "";
    if (fileInput) {
        fileInput.value = "";
    }
    action.save();
};

const exportHandle = () => {
    if (!action.current.output.trim()) {
        return Message.error($t("jsonJavaScript_error_output_empty"));
    }
    Text.fromString(action.current.output).setExtension(modeMeta.outputExtension).toDown();
};

const handleFileChange = async () => {
    const file = fileInput?.files?.[0];
    if (!file) {
        return;
    }
    const text = await file.text();
    action.current.input = text;
    action.save();
};

watch(() => action.current, () => action.save(), { deep: true });
</script>

<style>
.ctool-json-javascript {
    height: 100%;
}

.ctool-json-javascript-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.ctool-json-javascript-desc {
    font-size: .95rem;
}

.ctool-json-javascript-hint {
    margin-top: 4px;
    font-size: .75rem;
    color: var(--ctool-info-color);
}

.ctool-json-javascript-options {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
}

.ctool-json-javascript-label {
    font-size: .8rem;
    color: var(--ctool-info-color);
}

.ctool-json-javascript-layout {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px;
}

.ctool-json-javascript-card,
.ctool-json-javascript-fill {
    min-height: 0;
    height: 100%;
}

.ctool-json-javascript-card .ctool-card-body {
    height: 100%;
}

@media (max-width: 960px) {
    .ctool-json-javascript-toolbar,
    .ctool-json-javascript-options {
        flex-direction: column;
        align-items: flex-start;
    }

    .ctool-json-javascript-layout {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
