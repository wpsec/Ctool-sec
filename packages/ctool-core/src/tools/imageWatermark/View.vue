<template>
    <div class="ctool-image-watermark">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-image-watermark-toolbar">
                <div>
                    <div class="ctool-image-watermark-desc">{{ $t("imageWatermark_description") }}</div>
                    <div class="ctool-image-watermark-hint">{{ $t("imageWatermark_hint") }}</div>
                </div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="$t('imageWatermark_generate')" @click="generateHandle" />
                    <Button :size="'small'" :text="$t('imageWatermark_select_image')" @click="fileInput?.click()" />
                    <Button :size="'small'" :text="$t('imageWatermark_download')" @click="downloadHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
            <div class="ctool-image-watermark-options">
                <div class="ctool-image-watermark-field">
                    <div class="ctool-image-watermark-label">{{ $t("imageWatermark_text") }}</div>
                    <Input v-model="action.current.text" :placeholder="$t('imageWatermark_text_placeholder')" />
                </div>
                <div class="ctool-image-watermark-field">
                    <div class="ctool-image-watermark-label">{{ $t("imageWatermark_color") }}</div>
                    <input v-model="action.current.color" class="ctool-image-watermark-color" type="color" />
                </div>
                <div class="ctool-image-watermark-field">
                    <div class="ctool-image-watermark-label">{{ $t("imageWatermark_font_size") }}</div>
                    <InputNumber v-model="action.current.fontSize" :min="8" :max="128" />
                </div>
                <div class="ctool-image-watermark-field">
                    <div class="ctool-image-watermark-label">{{ $t("imageWatermark_gap_x") }}</div>
                    <InputNumber v-model="action.current.gapX" :min="20" :max="500" />
                </div>
                <div class="ctool-image-watermark-field">
                    <div class="ctool-image-watermark-label">{{ $t("imageWatermark_gap_y") }}</div>
                    <InputNumber v-model="action.current.gapY" :min="20" :max="500" />
                </div>
                <div class="ctool-image-watermark-field">
                    <div class="ctool-image-watermark-label">{{ $t("imageWatermark_offset_x") }}</div>
                    <InputNumber v-model="action.current.offsetX" :min="-500" :max="500" />
                </div>
                <div class="ctool-image-watermark-field">
                    <div class="ctool-image-watermark-label">{{ $t("imageWatermark_offset_y") }}</div>
                    <InputNumber v-model="action.current.offsetY" :min="-500" :max="500" />
                </div>
                <input ref="fileInput" type="file" style="display: none;" accept="image/*" @change="handleFileChange" />
            </div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <div class="ctool-image-watermark-layout" :style="{ height: `${height}px` }">
                <Card :title="$t('imageWatermark_source_title')" class="ctool-image-watermark-card">
                    <div class="ctool-image-watermark-preview">
                        <img v-if="action.current.input" :src="action.current.input" />
                        <div v-else class="ctool-image-watermark-empty">{{ $t("imageWatermark_source_placeholder") }}</div>
                    </div>
                </Card>
                <Card :title="$t('imageWatermark_output_title')" class="ctool-image-watermark-card">
                    <div class="ctool-image-watermark-preview">
                        <img v-if="action.current.output" :src="action.current.output" />
                        <div v-else class="ctool-image-watermark-empty">{{ $t("imageWatermark_output_placeholder") }}</div>
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
import { downloadImage, readFileAsDataUrl } from "../imageShared/util";
import { createWatermarkedImage } from "./util";

const action = useAction(await initialize({
    input: "",
    output: "",
    text: "Watermark",
    color: "#000000",
    fontSize: 24,
    gapX: 140,
    gapY: 120,
    offsetX: 0,
    offsetY: 0,
    fileName: "watermark.png",
}, { paste: false }));

const fileInput = $ref<HTMLInputElement | null>(null);

const handleFileChange = async () => {
    const file = fileInput?.files?.[0];
    if (!file) {
        return;
    }
    action.current.input = await readFileAsDataUrl(file);
    action.current.fileName = `watermark-${file.name.replace(/\.[^.]+$/, "")}.png`;
    await generateHandle();
};

const generateHandle = async () => {
    if (!action.current.input) {
        return Message.error($t("imageWatermark_error_empty"));
    }
    if (!action.current.text.trim()) {
        return Message.error($t("imageWatermark_error_text_empty"));
    }
    try {
        action.current.output = await createWatermarkedImage(action.current.input, {
            text: action.current.text.trim(),
            color: action.current.color,
            fontSize: action.current.fontSize,
            gapX: action.current.gapX,
            gapY: action.current.gapY,
            offsetX: action.current.offsetX,
            offsetY: action.current.offsetY,
        });
        action.success({ message: "" });
    } catch (error) {
        console.error(error);
        Message.error($t("imageWatermark_error_generate"));
    }
};

const downloadHandle = () => {
    if (!action.current.output) {
        return Message.error($t("imageWatermark_error_output_empty"));
    }
    downloadImage(action.current.output, action.current.fileName);
};

const clearHandle = () => {
    action.current.input = "";
    action.current.output = "";
    if (fileInput) {
        fileInput.value = "";
    }
    action.save();
};

watch(() => action.current, () => action.save(), { deep: true });
</script>

<style>
.ctool-image-watermark {
    height: 100%;
}

.ctool-image-watermark-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.ctool-image-watermark-desc {
    font-size: .95rem;
}

.ctool-image-watermark-hint {
    margin-top: 4px;
    font-size: .75rem;
    color: var(--ctool-info-color);
}

.ctool-image-watermark-options {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin-top: 10px;
}

.ctool-image-watermark-label {
    margin-bottom: 4px;
    font-size: .8rem;
    color: var(--ctool-info-color);
}

.ctool-image-watermark-color {
    width: 100%;
    height: var(--ctool-form-item-height);
}

.ctool-image-watermark-layout {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px;
}

.ctool-image-watermark-card,
.ctool-image-watermark-preview {
    min-height: 0;
    height: 100%;
}

.ctool-image-watermark-card .ctool-card-body {
    height: 100%;
}

.ctool-image-watermark-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
}

.ctool-image-watermark-preview img {
    max-width: 100%;
    max-height: 100%;
}

.ctool-image-watermark-empty {
    color: var(--ctool-info-color);
}

@media (max-width: 960px) {
    .ctool-image-watermark-toolbar {
        flex-direction: column;
    }

    .ctool-image-watermark-options,
    .ctool-image-watermark-layout {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
