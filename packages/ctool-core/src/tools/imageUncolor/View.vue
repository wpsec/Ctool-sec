<template>
    <div class="ctool-image-uncolor">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-image-uncolor-toolbar">
                <div>
                    <div class="ctool-image-uncolor-desc">{{ $t("imageUncolor_description") }}</div>
                    <div class="ctool-image-uncolor-hint">{{ $t("imageUncolor_hint") }}</div>
                </div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="$t('imageUncolor_generate')" @click="generateHandle" />
                    <Button :size="'small'" :text="$t('imageUncolor_select_image')" @click="fileInput?.click()" />
                    <Button :size="'small'" :text="$t('imageUncolor_download')" @click="downloadHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
            <input ref="fileInput" type="file" style="display: none;" accept="image/*" @change="handleFileChange" />
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <div class="ctool-image-uncolor-layout" :style="{ height: `${height}px` }">
                <Card :title="$t('imageUncolor_source_title')" class="ctool-image-uncolor-card">
                    <div class="ctool-image-uncolor-preview">
                        <img v-if="action.current.input" :src="action.current.input" />
                        <div v-else class="ctool-image-uncolor-empty">{{ $t("imageUncolor_source_placeholder") }}</div>
                    </div>
                </Card>
                <Card :title="$t('imageUncolor_output_title')" class="ctool-image-uncolor-card">
                    <div class="ctool-image-uncolor-preview">
                        <img v-if="action.current.output" :src="action.current.output" />
                        <div v-else class="ctool-image-uncolor-empty">{{ $t("imageUncolor_output_placeholder") }}</div>
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
import { convertImageToGrayscale } from "./util";

const action = useAction(await initialize({
    input: "",
    output: "",
    fileName: "grayscale.png",
}, { paste: false }));

const fileInput = $ref<HTMLInputElement | null>(null);

const handleFileChange = async () => {
    const file = fileInput?.files?.[0];
    if (!file) {
        return;
    }
    action.current.input = await readFileAsDataUrl(file);
    action.current.fileName = `grayscale-${file.name.replace(/\.[^.]+$/, "")}.png`;
    await generateHandle();
};

const generateHandle = async () => {
    if (!action.current.input) {
        return Message.error($t("imageUncolor_error_empty"));
    }
    try {
        action.current.output = await convertImageToGrayscale(action.current.input);
        action.success({ message: "" });
    } catch (error) {
        console.error(error);
        Message.error($t("imageUncolor_error_generate"));
    }
};

const downloadHandle = () => {
    if (!action.current.output) {
        return Message.error($t("imageUncolor_error_output_empty"));
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
.ctool-image-uncolor {
    height: 100%;
}

.ctool-image-uncolor-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.ctool-image-uncolor-desc {
    font-size: .95rem;
}

.ctool-image-uncolor-hint {
    margin-top: 4px;
    font-size: .75rem;
    color: var(--ctool-info-color);
}

.ctool-image-uncolor-layout {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px;
}

.ctool-image-uncolor-card,
.ctool-image-uncolor-preview {
    min-height: 0;
    height: 100%;
}

.ctool-image-uncolor-card .ctool-card-body {
    height: 100%;
}

.ctool-image-uncolor-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
}

.ctool-image-uncolor-preview img {
    max-width: 100%;
    max-height: 100%;
}

.ctool-image-uncolor-empty {
    color: var(--ctool-info-color);
}

@media (max-width: 960px) {
    .ctool-image-uncolor-toolbar {
        flex-direction: column;
    }

    .ctool-image-uncolor-layout {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
