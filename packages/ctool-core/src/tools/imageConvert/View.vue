<template>
    <div class="ctool-image-convert">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-image-convert-toolbar">
                <div>
                    <div class="ctool-image-convert-desc">{{ $t("imageConvert_description") }}</div>
                    <div class="ctool-image-convert-hint">{{ $t("imageConvert_hint", [rawSize, outputSize]) }}</div>
                </div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="$t('imageConvert_generate')" @click="generateHandle" />
                    <Button :size="'small'" :text="$t('imageConvert_select_image')" @click="fileInput?.click()" />
                    <Button :size="'small'" :text="$t('imageConvert_download')" @click="downloadHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
            <div class="ctool-image-convert-options">
                <div class="ctool-image-convert-label">{{ $t("imageConvert_format") }}</div>
                <Select v-model="action.current.mime" :options="mimeOptions" />
                <input ref="fileInput" type="file" style="display: none;" accept="image/*" @change="handleFileChange" />
            </div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <div class="ctool-image-convert-layout" :style="{ height: `${height}px` }">
                <Card :title="$t('imageConvert_source_title')" class="ctool-image-convert-card">
                    <div class="ctool-image-convert-preview">
                        <img v-if="action.current.input" :src="action.current.input" />
                        <div v-else class="ctool-image-convert-empty">{{ $t("imageConvert_source_placeholder") }}</div>
                    </div>
                </Card>
                <Card :title="$t('imageConvert_output_title')" class="ctool-image-convert-card">
                    <div class="ctool-image-convert-preview">
                        <img v-if="action.current.output" :src="action.current.output" />
                        <div v-else class="ctool-image-convert-empty">{{ $t("imageConvert_output_placeholder") }}</div>
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
import { convertImageType, getImageExtension } from "./util";

const action = useAction(await initialize({
    input: "",
    output: "",
    mime: "image/png",
    rawSize: 0,
    fileName: "converted.png",
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
    action.current.fileName = `converted-${file.name.replace(/\.[^.]+$/, "")}.${getImageExtension(action.current.mime)}`;
    await generateHandle();
};

const generateHandle = async () => {
    if (!action.current.input) {
        return Message.error($t("imageConvert_error_empty"));
    }
    try {
        action.current.output = await convertImageType(action.current.input, action.current.mime);
        action.current.fileName = `converted.${getImageExtension(action.current.mime)}`;
        action.success({ message: "" });
    } catch (error) {
        console.error(error);
        Message.error($t("imageConvert_error_generate"));
    }
};

const downloadHandle = () => {
    if (!action.current.output) {
        return Message.error($t("imageConvert_error_output_empty"));
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

watch(() => action.current.mime, () => {
    action.current.fileName = `converted.${getImageExtension(action.current.mime)}`;
});

watch(() => action.current, () => action.save(), { deep: true });
</script>

<style>
.ctool-image-convert {
    height: 100%;
}

.ctool-image-convert-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.ctool-image-convert-desc {
    font-size: .95rem;
}

.ctool-image-convert-hint {
    margin-top: 4px;
    font-size: .75rem;
    color: var(--ctool-info-color);
}

.ctool-image-convert-options {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
}

.ctool-image-convert-label {
    font-size: .8rem;
    color: var(--ctool-info-color);
}

.ctool-image-convert-layout {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px;
}

.ctool-image-convert-card,
.ctool-image-convert-preview {
    min-height: 0;
    height: 100%;
}

.ctool-image-convert-card .ctool-card-body {
    height: 100%;
}

.ctool-image-convert-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
}

.ctool-image-convert-preview img {
    max-width: 100%;
    max-height: 100%;
}

.ctool-image-convert-empty {
    color: var(--ctool-info-color);
}

@media (max-width: 960px) {
    .ctool-image-convert-toolbar,
    .ctool-image-convert-options {
        flex-direction: column;
        align-items: flex-start;
    }

    .ctool-image-convert-layout {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
