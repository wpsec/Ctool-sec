<template>
    <div class="ctool-audio-format-convert">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-audio-format-convert-toolbar">
                <div class="ctool-audio-format-convert-desc">音频格式转换（浏览器端 ffmpeg）</div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="converting ? '转换中...' : '开始转换'" :disabled="!file || !ready || converting" @click="convertHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
            <div class="ctool-audio-format-convert-options">
                <div class="ctool-audio-format-convert-field">
                    <div class="ctool-audio-format-convert-label">文件</div>
                    <input type="file" accept="audio/*" @change="fileChangeHandle" />
                    <div class="ctool-audio-format-convert-file-name" v-if="fileName">{{ fileName }}</div>
                </div>
                <div class="ctool-audio-format-convert-field">
                    <div class="ctool-audio-format-convert-label">目标格式</div>
                    <Select v-model="target" :options="formatOptions" />
                </div>
            </div>
            <div class="ctool-audio-format-convert-status">{{ statusText }}</div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <div class="ctool-audio-format-convert-layout" :style="{ height: `${height}px` }">
                <Card class="ctool-audio-format-convert-card" title="预览">
                    <div class="ctool-audio-format-convert-preview">
                        <audio v-if="outputUrl" controls :src="outputUrl" />
                        <div v-else class="ctool-audio-format-convert-empty">暂无结果</div>
                    </div>
                </Card>
                <Card class="ctool-audio-format-convert-card" title="下载">
                    <div class="ctool-audio-format-convert-preview">
                        <a v-if="outputUrl" :href="outputUrl" :download="outputName">下载 {{ outputName }}</a>
                        <div v-else class="ctool-audio-format-convert-empty">请先转换</div>
                    </div>
                </Card>
            </div>
        </HeightResize>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import Message from "@/helper/message";
import { createLoadedFFmpeg } from "@/tools/mediaShared/ffmpeg";

interface FormatOption {
    label: string;
    value: string;
    mime: string;
}

const formatOptions: FormatOption[] = [
    { label: "AAC", value: "aac", mime: "audio/aac" },
    { label: "OGA", value: "oga", mime: "audio/ogg" },
    { label: "WAV", value: "wav", mime: "audio/wav" },
    { label: "MP3", value: "mp3", mime: "audio/mpeg" },
];

const ready = ref(false);
const converting = ref(false);
const statusText = ref("加载 ffmpeg 中...");
const file = ref<File | null>(null);
const fileName = ref("");
const target = ref("mp3");
const outputUrl = ref("");
const ffmpegRef = ref<any>(null);
const fetchFileRef = ref<((file?: string | Blob | File) => Promise<Uint8Array>) | null>(null);

const outputName = computed(() => {
    const base = (fileName.value || "audio").replace(/\.[^.]+$/, "");
    return `${base}.${target.value}`;
});

const revokeOutputUrl = () => {
    if (outputUrl.value) {
        URL.revokeObjectURL(outputUrl.value);
        outputUrl.value = "";
    }
};

onMounted(async () => {
    try {
        const loaded = await createLoadedFFmpeg((message: string) => {
            statusText.value = message || statusText.value;
        });
        ffmpegRef.value = loaded.ffmpeg;
        fetchFileRef.value = loaded.fetchFile;
        ready.value = true;
        statusText.value = "ffmpeg 已就绪";
    } catch (error) {
        statusText.value = "ffmpeg 加载失败";
        Message.error(`ffmpeg 加载失败: ${error instanceof Error ? error.message : String(error)}`);
    }
});

onUnmounted(() => {
    revokeOutputUrl();
});

const fileChangeHandle = (event: Event) => {
    const targetElement = event.target as HTMLInputElement;
    const selected = targetElement.files?.[0] || null;
    file.value = selected;
    fileName.value = selected?.name || "";
};

const convertHandle = async () => {
    if (!file.value || !ffmpegRef.value || !fetchFileRef.value) {
        return;
    }
    converting.value = true;
    statusText.value = "开始转换...";
    revokeOutputUrl();

    const inputName = file.value.name;
    const outputFileName = outputName.value;

    try {
        await ffmpegRef.value.writeFile(inputName, await fetchFileRef.value(file.value));
        await ffmpegRef.value.exec(["-i", inputName, outputFileName]);
        const data = await ffmpegRef.value.readFile(outputFileName);
        const option = formatOptions.find(item => item.value === target.value);
        outputUrl.value = URL.createObjectURL(new Blob([data], { type: option?.mime || "application/octet-stream" }));
        ffmpegRef.value.deleteFile(inputName);
        ffmpegRef.value.deleteFile(outputFileName);
        statusText.value = "转换完成";
    } catch (error) {
        statusText.value = "转换失败";
        Message.error(`转换失败: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        converting.value = false;
    }
};

const clearHandle = () => {
    revokeOutputUrl();
    statusText.value = ready.value ? "ffmpeg 已就绪" : statusText.value;
};
</script>

<style>
.ctool-audio-format-convert {
    height: 100%;
}

.ctool-audio-format-convert-toolbar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
}

.ctool-audio-format-convert-desc {
    font-size: .95rem;
}

.ctool-audio-format-convert-options {
    display: grid;
    grid-template-columns: 1fr .7fr;
    gap: 10px;
    margin-top: 10px;
}

.ctool-audio-format-convert-field {
    min-width: 0;
}

.ctool-audio-format-convert-label {
    margin-bottom: 4px;
    font-size: .8rem;
    color: var(--ctool-info-color);
}

.ctool-audio-format-convert-file-name {
    margin-top: 4px;
    font-size: .8rem;
    color: var(--ctool-info-color);
}

.ctool-audio-format-convert-status {
    margin-top: 10px;
    padding: 8px 10px;
    border-radius: var(--border-radius);
    background: var(--ctool-background-color);
    font-size: .8rem;
    color: var(--ctool-info-color);
}

.ctool-audio-format-convert-layout {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px;
}

.ctool-audio-format-convert-card,
.ctool-audio-format-convert-preview {
    min-height: 0;
    height: 100%;
}

.ctool-audio-format-convert-card .ctool-card-body {
    height: 100%;
}

.ctool-audio-format-convert-preview {
    display: flex;
    align-items: center;
    justify-content: center;
}

.ctool-audio-format-convert-empty {
    color: var(--ctool-info-color);
    font-size: .9rem;
}

@media (max-width: 960px) {
    .ctool-audio-format-convert-toolbar {
        flex-direction: column;
    }

    .ctool-audio-format-convert-options,
    .ctool-audio-format-convert-layout {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
