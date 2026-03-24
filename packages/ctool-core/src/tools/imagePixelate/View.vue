<template>
    <div class="ctool-image-pixelate">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-image-pixelate-toolbar">
                <div>
                    <div class="ctool-image-pixelate-desc">{{ $t("imagePixelate_description") }}</div>
                    <div class="ctool-image-pixelate-hint">{{ $t("imagePixelate_hint") }}</div>
                </div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="$t('imagePixelate_generate')" @click="generateHandle" />
                    <Button :size="'small'" :text="$t('imagePixelate_select_image')" @click="fileInput?.click()" />
                    <Button :size="'small'" :text="$t('imagePixelate_download')" @click="downloadHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
            <div class="ctool-image-pixelate-options">
                <div class="ctool-image-pixelate-label">{{ $t("imagePixelate_size") }}</div>
                <InputNumber v-model="action.current.size" :min="1" :max="100" />
                <input ref="fileInput" type="file" style="display: none;" accept="image/*" @change="handleFileChange" />
            </div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <div class="ctool-image-pixelate-layout" :style="{ height: `${height}px` }">
                <Card :title="$t('imagePixelate_source_title')" class="ctool-image-pixelate-card">
                    <div class="ctool-image-pixelate-preview">
                        <img v-if="action.current.input" :src="action.current.input" />
                        <div v-else class="ctool-image-pixelate-empty">{{ $t("imagePixelate_source_placeholder") }}</div>
                    </div>
                </Card>
                <Card :title="$t('imagePixelate_output_title')" class="ctool-image-pixelate-card">
                    <div class="ctool-image-pixelate-preview">
                        <img v-if="action.current.output" :src="action.current.output" />
                        <div v-else class="ctool-image-pixelate-empty">{{ $t("imagePixelate_output_placeholder") }}</div>
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
import { createPixelatedImage } from "./util";

const action = useAction(await initialize({
    input: "",
    output: "",
    size: 10,
    fileName: "pixelated.png",
}, { paste: false }));

const fileInput = $ref<HTMLInputElement | null>(null);

const handleFileChange = async () => {
    const file = fileInput?.files?.[0];
    if (!file) {
        return;
    }
    action.current.input = await readFileAsDataUrl(file);
    action.current.fileName = `pixelated-${file.name.replace(/\.[^.]+$/, "")}.png`;
    await generateHandle();
};

const generateHandle = async () => {
    if (!action.current.input) {
        return Message.error($t("imagePixelate_error_empty"));
    }
    try {
        action.current.output = await createPixelatedImage(action.current.input, action.current.size);
        action.success({ message: "" });
    } catch (error) {
        console.error(error);
        Message.error($t("imagePixelate_error_generate"));
    }
};

const downloadHandle = () => {
    if (!action.current.output) {
        return Message.error($t("imagePixelate_error_output_empty"));
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
.ctool-image-pixelate {
    height: 100%;
}

.ctool-image-pixelate-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.ctool-image-pixelate-desc {
    font-size: .95rem;
}

.ctool-image-pixelate-hint {
    margin-top: 4px;
    font-size: .75rem;
    color: var(--ctool-info-color);
}

.ctool-image-pixelate-options {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
}

.ctool-image-pixelate-label {
    font-size: .8rem;
    color: var(--ctool-info-color);
}

.ctool-image-pixelate-layout {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px;
}

.ctool-image-pixelate-card,
.ctool-image-pixelate-preview {
    min-height: 0;
    height: 100%;
}

.ctool-image-pixelate-card .ctool-card-body {
    height: 100%;
}

.ctool-image-pixelate-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
}

.ctool-image-pixelate-preview img {
    max-width: 100%;
    max-height: 100%;
}

.ctool-image-pixelate-empty {
    color: var(--ctool-info-color);
}

@media (max-width: 960px) {
    .ctool-image-pixelate-toolbar,
    .ctool-image-pixelate-options {
        flex-direction: column;
        align-items: flex-start;
    }

    .ctool-image-pixelate-layout {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
