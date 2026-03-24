<template>
    <div class="ctool-video-to-gif">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-video-to-gif-toolbar">
                <div class="ctool-video-to-gif-desc">视频转 GIF（浏览器端 ffmpeg）</div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="running ? '转换中...' : '开始转换'" :disabled="!ready || !videoFile || running" @click="convertHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
            <div class="ctool-video-to-gif-options">
                <div class="ctool-video-to-gif-field">
                    <div class="ctool-video-to-gif-label">视频文件</div>
                    <input type="file" accept="video/*" @change="fileChangeHandle" />
                    <div class="ctool-video-to-gif-file-name" v-if="videoFileName">{{ videoFileName }}</div>
                </div>
                <div class="ctool-video-to-gif-field">
                    <div class="ctool-video-to-gif-label">起始秒</div>
                    <InputNumber v-model="startSecond" :min="0" :max="3600" />
                </div>
                <div class="ctool-video-to-gif-field">
                    <div class="ctool-video-to-gif-label">截取时长(秒)</div>
                    <InputNumber v-model="durationSecond" :min="1" :max="120" />
                </div>
            </div>
            <div class="ctool-video-to-gif-status">{{ statusText }}</div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <div class="ctool-video-to-gif-layout" :style="{ height: `${height}px` }">
                <Card class="ctool-video-to-gif-card" title="原视频">
                    <div class="ctool-video-to-gif-preview">
                        <video v-if="videoPreviewUrl" controls :src="videoPreviewUrl" />
                        <div v-else class="ctool-video-to-gif-empty">请上传视频</div>
                    </div>
                </Card>
                <Card class="ctool-video-to-gif-card" title="GIF 结果">
                    <div class="ctool-video-to-gif-preview">
                        <img v-if="gifUrl" :src="gifUrl" alt="gif-result" />
                        <div v-else class="ctool-video-to-gif-empty">暂无转换结果</div>
                    </div>
                </Card>
            </div>
        </HeightResize>
        <Card title="下载">
            <a v-if="gifUrl" :href="gifUrl" :download="gifName">下载 {{ gifName }}</a>
            <span v-else class="ctool-video-to-gif-empty">请先转换</span>
        </Card>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import Message from "@/helper/message";
import { createLoadedFFmpeg } from "@/tools/mediaShared/ffmpeg";

const ready = ref(false);
const running = ref(false);
const statusText = ref("加载 ffmpeg 中...");
const ffmpegRef = ref<any>(null);
const fetchFileRef = ref<((file?: string | Blob | File) => Promise<Uint8Array>) | null>(null);

const videoFile = ref<File | null>(null);
const videoFileName = ref("");
const videoPreviewUrl = ref("");
const gifUrl = ref("");
const startSecond = ref(0);
const durationSecond = ref(3);

const gifName = computed(() => {
    const base = (videoFileName.value || "video").replace(/\.[^.]+$/, "");
    return `${base}.gif`;
});

const revokePreviewUrl = () => {
    if (videoPreviewUrl.value) {
        URL.revokeObjectURL(videoPreviewUrl.value);
        videoPreviewUrl.value = "";
    }
};

const revokeGifUrl = () => {
    if (gifUrl.value) {
        URL.revokeObjectURL(gifUrl.value);
        gifUrl.value = "";
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
    revokePreviewUrl();
    revokeGifUrl();
});

const fileChangeHandle = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] || null;
    videoFile.value = file;
    videoFileName.value = file?.name || "";
    revokePreviewUrl();
    if (file) {
        videoPreviewUrl.value = URL.createObjectURL(file);
    }
};

const convertHandle = async () => {
    if (!videoFile.value || !ffmpegRef.value || !fetchFileRef.value) {
        return;
    }
    running.value = true;
    revokeGifUrl();
    statusText.value = "开始转换...";

    try {
        const inputName = videoFile.value.name;
        const outputName = "output.gif";
        await ffmpegRef.value.writeFile(inputName, await fetchFileRef.value(videoFile.value));
        await ffmpegRef.value.exec([
            "-i",
            inputName,
            "-t",
            `${durationSecond.value}`,
            "-ss",
            `${startSecond.value}`,
            outputName,
        ]);
        const data = await ffmpegRef.value.readFile(outputName);
        gifUrl.value = URL.createObjectURL(new Blob([data], { type: "image/gif" }));
        ffmpegRef.value.deleteFile(inputName);
        ffmpegRef.value.deleteFile(outputName);
        statusText.value = "转换完成";
    } catch (error) {
        statusText.value = "转换失败";
        Message.error(`转换失败: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        running.value = false;
    }
};

const clearHandle = () => {
    revokeGifUrl();
    statusText.value = ready.value ? "ffmpeg 已就绪" : statusText.value;
};
</script>

<style>
.ctool-video-to-gif {
    height: 100%;
}

.ctool-video-to-gif-toolbar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
}

.ctool-video-to-gif-desc {
    font-size: .95rem;
}

.ctool-video-to-gif-options {
    display: grid;
    grid-template-columns: 1.2fr .6fr .6fr;
    gap: 10px;
    margin-top: 10px;
}

.ctool-video-to-gif-field {
    min-width: 0;
}

.ctool-video-to-gif-label {
    margin-bottom: 4px;
    font-size: .8rem;
    color: var(--ctool-info-color);
}

.ctool-video-to-gif-file-name {
    margin-top: 4px;
    font-size: .8rem;
    color: var(--ctool-info-color);
}

.ctool-video-to-gif-status {
    margin-top: 10px;
    padding: 8px 10px;
    border-radius: var(--border-radius);
    background: var(--ctool-background-color);
    font-size: .8rem;
    color: var(--ctool-info-color);
}

.ctool-video-to-gif-layout {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px;
}

.ctool-video-to-gif-card,
.ctool-video-to-gif-preview {
    min-height: 0;
    height: 100%;
}

.ctool-video-to-gif-card .ctool-card-body {
    height: 100%;
}

.ctool-video-to-gif-preview {
    display: flex;
    align-items: center;
    justify-content: center;
}

.ctool-video-to-gif-preview video,
.ctool-video-to-gif-preview img {
    width: 100%;
    max-height: 100%;
    object-fit: contain;
}

.ctool-video-to-gif-empty {
    color: var(--ctool-info-color);
    font-size: .9rem;
}

@media (max-width: 960px) {
    .ctool-video-to-gif-toolbar {
        flex-direction: column;
    }

    .ctool-video-to-gif-options,
    .ctool-video-to-gif-layout {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
