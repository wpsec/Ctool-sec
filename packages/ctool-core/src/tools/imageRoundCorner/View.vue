<template>
    <div class="ctool-image-round-corner">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-image-round-corner-toolbar">
                <div>
                    <div class="ctool-image-round-corner-desc">{{ $t("imageRoundCorner_description") }}</div>
                    <div class="ctool-image-round-corner-hint">{{ $t("imageRoundCorner_hint") }}</div>
                </div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="$t('imageRoundCorner_generate')" @click="generateHandle" />
                    <Button :size="'small'" :text="$t('imageRoundCorner_select_image')" @click="fileInput?.click()" />
                    <Button :size="'small'" :text="$t('imageRoundCorner_download')" @click="downloadHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
            <div class="ctool-image-round-corner-options">
                <div class="ctool-image-round-corner-label">{{ $t("imageRoundCorner_radius") }}</div>
                <InputNumber v-model="action.current.radius" :min="0" :max="500" />
                <input ref="fileInput" type="file" style="display: none;" accept="image/*" @change="handleFileChange" />
            </div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <div class="ctool-image-round-corner-layout" :style="{ height: `${height}px` }">
                <Card :title="$t('imageRoundCorner_source_title')" class="ctool-image-round-corner-card">
                    <div class="ctool-image-round-corner-preview">
                        <img v-if="action.current.input" :src="action.current.input" />
                        <div v-else class="ctool-image-round-corner-empty">{{ $t("imageRoundCorner_source_placeholder") }}</div>
                    </div>
                </Card>
                <Card :title="$t('imageRoundCorner_output_title')" class="ctool-image-round-corner-card">
                    <div class="ctool-image-round-corner-preview">
                        <img v-if="action.current.output" :src="action.current.output" />
                        <div v-else class="ctool-image-round-corner-empty">{{ $t("imageRoundCorner_output_placeholder") }}</div>
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
import { createRoundedImage } from "./util";

const action = useAction(await initialize({
    input: "",
    output: "",
    radius: 40,
    fileName: "rounded.png",
}, { paste: false }));

const fileInput = $ref<HTMLInputElement | null>(null);

const handleFileChange = async () => {
    const file = fileInput?.files?.[0];
    if (!file) {
        return;
    }
    action.current.input = await readFileAsDataUrl(file);
    action.current.fileName = `rounded-${file.name.replace(/\.[^.]+$/, "")}.png`;
    await generateHandle();
};

const generateHandle = async () => {
    if (!action.current.input) {
        return Message.error($t("imageRoundCorner_error_empty"));
    }
    try {
        action.current.output = await createRoundedImage(action.current.input, action.current.radius);
        action.success({ message: "" });
    } catch (error) {
        console.error(error);
        Message.error($t("imageRoundCorner_error_generate"));
    }
};

const downloadHandle = () => {
    if (!action.current.output) {
        return Message.error($t("imageRoundCorner_error_output_empty"));
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
.ctool-image-round-corner {
    height: 100%;
}

.ctool-image-round-corner-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.ctool-image-round-corner-desc {
    font-size: .95rem;
}

.ctool-image-round-corner-hint {
    margin-top: 4px;
    font-size: .75rem;
    color: var(--ctool-info-color);
}

.ctool-image-round-corner-options {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
}

.ctool-image-round-corner-label {
    font-size: .8rem;
    color: var(--ctool-info-color);
}

.ctool-image-round-corner-layout {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px;
}

.ctool-image-round-corner-card,
.ctool-image-round-corner-preview {
    min-height: 0;
    height: 100%;
}

.ctool-image-round-corner-card .ctool-card-body {
    height: 100%;
}

.ctool-image-round-corner-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
}

.ctool-image-round-corner-preview img {
    max-width: 100%;
    max-height: 100%;
}

.ctool-image-round-corner-empty {
    color: var(--ctool-info-color);
}

@media (max-width: 960px) {
    .ctool-image-round-corner-toolbar,
    .ctool-image-round-corner-options {
        flex-direction: column;
        align-items: flex-start;
    }

    .ctool-image-round-corner-layout {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
