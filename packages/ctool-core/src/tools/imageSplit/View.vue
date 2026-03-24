<template>
    <div class="ctool-image-split">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-image-split-toolbar">
                <div>
                    <div class="ctool-image-split-desc">{{ $t("imageSplit_description") }}</div>
                    <div class="ctool-image-split-hint">{{ $t("imageSplit_hint") }}</div>
                </div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="$t('imageSplit_generate')" @click="generateHandle" />
                    <Button :size="'small'" :text="$t('imageSplit_select_image')" @click="fileInput?.click()" />
                    <Button :size="'small'" :text="$t('imageSplit_download_all')" @click="downloadAllHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
            <div class="ctool-image-split-options">
                <div class="ctool-image-split-field">
                    <div class="ctool-image-split-label">{{ $t("imageSplit_rows") }}</div>
                    <InputNumber v-model="action.current.rows" :min="1" :max="10" />
                </div>
                <div class="ctool-image-split-field">
                    <div class="ctool-image-split-label">{{ $t("imageSplit_cols") }}</div>
                    <InputNumber v-model="action.current.cols" :min="1" :max="10" />
                </div>
                <div class="ctool-image-split-field">
                    <div class="ctool-image-split-label">{{ $t("imageSplit_format") }}</div>
                    <Select v-model="action.current.mime" :options="mimeOptions" />
                </div>
                <input ref="fileInput" type="file" style="display: none;" accept="image/*" @change="handleFileChange" />
            </div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <div class="ctool-image-split-body" :style="{ height: `${height}px` }">
                <div v-if="pieces.length < 1" class="ctool-image-split-empty">{{ $t("imageSplit_empty") }}</div>
                <div
                    v-else
                    class="ctool-image-split-grid"
                    :style="{ gridTemplateColumns: `repeat(${action.current.cols}, minmax(0, 1fr))` }"
                >
                    <div v-for="(item, index) in pieces" :key="index" class="ctool-image-split-piece" @click="downloadPieceHandle(item, index)">
                        <img :src="item" />
                    </div>
                </div>
            </div>
        </HeightResize>
    </div>
</template>

<script setup lang="ts">
import { initialize, useAction } from "@/store/action";
import Message from "@/helper/message";
import { watch } from "vue";
import { downloadImage, imageMimeOptions, readFileAsDataUrl } from "../imageShared/util";
import { getImageExtension } from "../imageConvert/util";
import { splitImage } from "./util";

const action = useAction(await initialize({
    input: "",
    rows: 3,
    cols: 3,
    mime: "image/png",
    pieces: [] as string[],
    baseName: "split-image",
}, { paste: false }));

const fileInput = $ref<HTMLInputElement | null>(null);

const mimeOptions = imageMimeOptions.map(item => ({
    value: item.value,
    label: item.label,
}));

const pieces = $computed(() => action.current.pieces || []);

const handleFileChange = async () => {
    const file = fileInput?.files?.[0];
    if (!file) {
        return;
    }
    action.current.input = await readFileAsDataUrl(file);
    action.current.baseName = file.name.replace(/\.[^.]+$/, "") || "split-image";
    await generateHandle();
};

const generateHandle = async () => {
    if (!action.current.input) {
        return Message.error($t("imageSplit_error_empty"));
    }
    try {
        action.current.pieces = await splitImage(action.current.input, action.current.rows, action.current.cols, action.current.mime);
        action.success({ message: "" });
    } catch (error) {
        console.error(error);
        Message.error($t("imageSplit_error_generate"));
    }
};

const downloadPieceHandle = (piece: string, index: number) => {
    downloadImage(piece, `${action.current.baseName}-${index + 1}.${getImageExtension(action.current.mime)}`);
};

const downloadAllHandle = async () => {
    if (pieces.length < 1) {
        return Message.error($t("imageSplit_error_output_empty"));
    }
    for (let index = 0; index < pieces.length; index++) {
        downloadPieceHandle(pieces[index], index);
        await new Promise(resolve => setTimeout(resolve, 120));
    }
};

const clearHandle = () => {
    action.current.input = "";
    action.current.pieces = [];
    if (fileInput) {
        fileInput.value = "";
    }
    action.save();
};

watch(() => action.current, () => action.save(), { deep: true });
</script>

<style>
.ctool-image-split {
    height: 100%;
}

.ctool-image-split-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.ctool-image-split-desc {
    font-size: .95rem;
}

.ctool-image-split-hint {
    margin-top: 4px;
    font-size: .75rem;
    color: var(--ctool-info-color);
}

.ctool-image-split-options {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin-top: 10px;
}

.ctool-image-split-label {
    margin-bottom: 4px;
    font-size: .8rem;
    color: var(--ctool-info-color);
}

.ctool-image-split-body {
    overflow-y: auto;
}

.ctool-image-split-grid {
    display: grid;
    gap: 6px;
}

.ctool-image-split-piece {
    cursor: pointer;
}

.ctool-image-split-piece img {
    display: block;
    width: 100%;
    border-radius: var(--border-radius);
}

.ctool-image-split-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--ctool-info-color);
}

@media (max-width: 960px) {
    .ctool-image-split-toolbar {
        flex-direction: column;
    }

    .ctool-image-split-options {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
