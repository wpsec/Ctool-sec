<template>
    <div class="ctool-image-to-base64">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-image-to-base64-toolbar">
                <div>
                    <div class="ctool-image-to-base64-desc">{{ $t("imageToBase64_description") }}</div>
                    <div class="ctool-image-to-base64-hint">{{ $t("imageToBase64_hint") }}</div>
                </div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="$t('imageToBase64_convert')" @click="convertHandle" />
                    <Button v-if="action.current.mode === 'encode'" :size="'small'" :text="$t('imageToBase64_select_image')" @click="fileInput?.click()" />
                    <Button v-if="action.current.mode === 'decode' && action.current.decodeOutput" :size="'small'" :text="$t('imageToBase64_download_image')" @click="downloadHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
            <div class="ctool-image-to-base64-options">
                <div class="ctool-image-to-base64-label">{{ $t("imageToBase64_mode_title") }}</div>
                <Radio v-model="action.current.mode" :options="modeOptions" />
                <input ref="fileInput" type="file" style="display: none;" accept="image/*" @change="handleFileChange" />
            </div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <div class="ctool-image-to-base64-layout" :style="{ height: `${height}px` }">
                <Card v-if="action.current.mode === 'encode'" :title="$t('imageToBase64_source_image')" class="ctool-image-to-base64-card">
                    <div class="ctool-image-to-base64-preview">
                        <img v-if="action.current.encodeInput" :src="action.current.encodeInput" />
                        <div v-else class="ctool-image-to-base64-empty">{{ $t("imageToBase64_source_placeholder") }}</div>
                    </div>
                </Card>
                <Card v-else :title="$t('imageToBase64_input_title')" class="ctool-image-to-base64-card">
                    <div class="ctool-image-to-base64-fill">
                        <Textarea
                            v-model="action.current.decodeInput"
                            :height="'100%'"
                            :placeholder="$t('imageToBase64_input_placeholder')"
                        />
                    </div>
                </Card>
                <Card v-if="action.current.mode === 'encode'" :title="$t('imageToBase64_output_title')" class="ctool-image-to-base64-card">
                    <div class="ctool-image-to-base64-fill">
                        <Textarea
                            :model-value="action.current.encodeOutput"
                            :height="'100%'"
                            :placeholder="$t('imageToBase64_output_placeholder')"
                            readonly
                            copy
                        />
                    </div>
                </Card>
                <Card v-else :title="$t('imageToBase64_preview_title')" class="ctool-image-to-base64-card">
                    <div class="ctool-image-to-base64-preview">
                        <img v-if="action.current.decodeOutput" :src="action.current.decodeOutput" />
                        <div v-else class="ctool-image-to-base64-empty">{{ $t("imageToBase64_preview_placeholder") }}</div>
                    </div>
                </Card>
            </div>
        </HeightResize>
    </div>
</template>

<script setup lang="ts">
import { initialize, useAction } from "@/store/action";
import Message from "@/helper/message";
import { watch } from "vue";
import { downloadImage, ensureImageDataUrl, readFileAsDataUrl } from "../imageShared/util";

const action = useAction(await initialize({
    mode: "encode",
    encodeInput: "",
    encodeOutput: "",
    decodeInput: "",
    decodeOutput: "",
    fileName: "image.png",
}, { paste: false }));

const fileInput = $ref<HTMLInputElement | null>(null);

const modeOptions = $computed(() => {
    return [
        { value: "encode", label: $t("imageToBase64_mode_encode") },
        { value: "decode", label: $t("imageToBase64_mode_decode") },
    ];
});

const handleFileChange = async () => {
    const file = fileInput?.files?.[0];
    if (!file) {
        return;
    }
    action.current.encodeInput = await readFileAsDataUrl(file);
    action.current.fileName = file.name || "image.png";
    action.save();
};

const convertHandle = () => {
    if (action.current.mode === "encode") {
        if (!action.current.encodeInput) {
            return Message.error($t("imageToBase64_error_image_empty"));
        }
        action.current.encodeOutput = action.current.encodeInput;
        action.success({ message: "" });
        return;
    }
    if (!action.current.decodeInput.trim()) {
        return Message.error($t("imageToBase64_error_base64_empty"));
    }
    action.current.decodeOutput = ensureImageDataUrl(action.current.decodeInput);
    action.success({ message: "" });
};

const downloadHandle = () => {
    if (!action.current.decodeOutput) {
        return Message.error($t("imageToBase64_error_preview_empty"));
    }
    downloadImage(action.current.decodeOutput, `decoded-${action.current.fileName}`);
};

const clearHandle = () => {
    action.current.encodeInput = "";
    action.current.encodeOutput = "";
    action.current.decodeInput = "";
    action.current.decodeOutput = "";
    if (fileInput) {
        fileInput.value = "";
    }
    action.save();
};

watch(() => action.current, () => action.save(), { deep: true });
</script>

<style>
.ctool-image-to-base64 {
    height: 100%;
}

.ctool-image-to-base64-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.ctool-image-to-base64-desc {
    font-size: .95rem;
}

.ctool-image-to-base64-hint {
    margin-top: 4px;
    font-size: .75rem;
    color: var(--ctool-info-color);
}

.ctool-image-to-base64-options {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
}

.ctool-image-to-base64-label {
    font-size: .8rem;
    color: var(--ctool-info-color);
}

.ctool-image-to-base64-layout {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px;
}

.ctool-image-to-base64-card,
.ctool-image-to-base64-fill,
.ctool-image-to-base64-preview {
    min-height: 0;
    height: 100%;
}

.ctool-image-to-base64-card .ctool-card-body {
    height: 100%;
}

.ctool-image-to-base64-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
}

.ctool-image-to-base64-preview img {
    max-width: 100%;
    max-height: 100%;
}

.ctool-image-to-base64-empty {
    color: var(--ctool-info-color);
}

@media (max-width: 960px) {
    .ctool-image-to-base64-toolbar,
    .ctool-image-to-base64-options {
        flex-direction: column;
        align-items: flex-start;
    }

    .ctool-image-to-base64-layout {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
