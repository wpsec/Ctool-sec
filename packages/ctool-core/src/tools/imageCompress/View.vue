<template>
    <div class="ctool-image-compress">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-image-compress-toolbar">
                <div>
                    <div class="ctool-image-compress-desc">{{ $t("imageCompress_description") }}</div>
                    <div class="ctool-image-compress-hint">{{ $t("imageCompress_hint", [rawSize, outputSize]) }}</div>
                </div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="$t('imageCompress_generate')" @click="generateHandle" />
                    <Button :size="'small'" :text="$t('imageCompress_select_image')" @click="fileInput?.click()" />
                    <Button :size="'small'" :text="$t('imageCompress_download')" @click="downloadHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
            <div class="ctool-image-compress-options">
                <div class="ctool-image-compress-field">
                    <div class="ctool-image-compress-label">{{ $t("imageCompress_quality") }}</div>
                    <InputNumber v-model="action.current.quality" :min="1" :max="100" />
                </div>
                <div class="ctool-image-compress-field">
                    <div class="ctool-image-compress-label">{{ $t("imageCompress_format") }}</div>
                    <Select v-model="action.current.mime" :options="mimeOptions" />
                </div>
                <input ref="fileInput" type="file" style="display: none;" accept="image/*" @change="handleFileChange" />
            </div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <div class="ctool-image-compress-layout" :style="{ height: `${height}px` }">
                <Card :title="$t('imageCompress_source_title')" class="ctool-image-compress-card">
                    <div class="ctool-image-compress-preview">
                        <img v-if="action.current.input" :src="action.current.input" />
                        <div v-else class="ctool-image-compress-empty">{{ $t("imageCompress_source_placeholder") }}</div>
                    </div>
                </Card>
                <Card :title="$t('imageCompress_output_title')" class="ctool-image-compress-card">
                    <div class="ctool-image-compress-preview">
                        <img v-if="action.current.output" :src="action.current.output" />
                        <div v-else class="ctool-image-compress-empty">{{ $t("imageCompress_output_placeholder") }}</div>
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
import { downloadImage, formatFileSize, getDataUrlSize, imageMimeOptions, readFileAsDataUrl } from "../imageShared/util";
import { compressImage } from "./util";
import { getImageExtension } from "../imageConvert/util";

const action = useAction(await initialize({
    input: "",
    output: "",
    quality: 60,
    mime: "image/jpeg",
    rawSize: 0,
    fileName: "compressed.jpg",
}, { paste: false }));

const fileInput = $ref<HTMLInputElement | null>(null);

const mimeOptions = imageMimeOptions.map(item => ({
    value: item.value,
    label: item.label,
}));

const rawSize = $computed(() => formatFileSize(action.current.rawSize));
const outputSize = $computed(() => (action.current.output ? formatFileSize(getDataUrlSize(action.current.output)) : "-"));

const handleFileChange = async () => {
    const file = fileInput?.files?.[0];
    if (!file) {
        return;
    }
    action.current.input = await readFileAsDataUrl(file);
    action.current.rawSize = file.size;
    action.current.fileName = `compressed-${file.name.replace(/\.[^.]+$/, "")}.${getImageExtension(action.current.mime)}`;
    await generateHandle();
};

const generateHandle = async () => {
    if (!action.current.input) {
        return Message.error($t("imageCompress_error_empty"));
    }
    try {
        action.current.output = await compressImage(action.current.input, action.current.quality, action.current.mime);
        action.current.fileName = `compressed.${getImageExtension(action.current.mime)}`;
        action.success({ message: "" });
    } catch (error) {
        console.error(error);
        Message.error($t("imageCompress_error_generate"));
    }
};

const downloadHandle = () => {
    if (!action.current.output) {
        return Message.error($t("imageCompress_error_output_empty"));
    }
    downloadImage(action.current.output, action.current.fileName);
};

const clearHandle = () => {
    action.current.input = "";
    action.current.output = "";
    action.current.rawSize = 0;
    if (fileInput) {
        fileInput.value = "";
    }
    action.save();
};

watch(() => action.current, () => action.save(), { deep: true });
</script>

<style>
.ctool-image-compress {
    height: 100%;
}

.ctool-image-compress-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.ctool-image-compress-desc {
    font-size: .95rem;
}

.ctool-image-compress-hint {
    margin-top: 4px;
    font-size: .75rem;
    color: var(--ctool-info-color);
}

.ctool-image-compress-options {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-top: 10px;
}

.ctool-image-compress-label {
    margin-bottom: 4px;
    font-size: .8rem;
    color: var(--ctool-info-color);
}

.ctool-image-compress-layout {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px;
}

.ctool-image-compress-card,
.ctool-image-compress-preview {
    min-height: 0;
    height: 100%;
}

.ctool-image-compress-card .ctool-card-body {
    height: 100%;
}

.ctool-image-compress-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
}

.ctool-image-compress-preview img {
    max-width: 100%;
    max-height: 100%;
}

.ctool-image-compress-empty {
    color: var(--ctool-info-color);
}

@media (max-width: 960px) {
    .ctool-image-compress-toolbar {
        flex-direction: column;
    }

    .ctool-image-compress-options,
    .ctool-image-compress-layout {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
