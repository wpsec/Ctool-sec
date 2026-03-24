<template>
    <div class="ctool-video-frame-capture">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-video-frame-capture-toolbar">
                <div class="ctool-video-frame-capture-desc">视频抽帧（浏览器端 ffmpeg）</div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="extracting ? '提取中...' : '开始提取'" :disabled="!ready || !videoFile || extracting" @click="extractHandle" />
                    <Button :size="'small'" :text="'打包下载'" :disabled="frames.length === 0 || downloading" @click="downloadAllHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
            <div class="ctool-video-frame-capture-options">
                <div class="ctool-video-frame-capture-field">
                    <div class="ctool-video-frame-capture-label">视频文件</div>
                    <input type="file" accept="video/*" @change="fileChangeHandle" />
                    <div class="ctool-video-frame-capture-file-name" v-if="videoFileName">{{ videoFileName }}</div>
                </div>
                <div class="ctool-video-frame-capture-field">
                    <div class="ctool-video-frame-capture-label">帧率(FPS)</div>
                    <InputNumber v-model="fps" :min="1" :max="30" />
                </div>
                <div class="ctool-video-frame-capture-field">
                    <div class="ctool-video-frame-capture-label">预计帧数</div>
                    <Input :model-value="estimatedFrameCountText" readonly />
                </div>
            </div>
            <div class="ctool-video-frame-capture-status">{{ statusText }}</div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <Card :title="`截图结果 (${frames.length})`">
                <div class="ctool-video-frame-capture-grid" :style="{ height: `${height}px` }">
                    <div class="ctool-video-frame-capture-item" v-for="frame in frames" :key="frame.name">
                        <img :src="frame.url" :alt="frame.name" />
                        <a :href="frame.url" :download="frame.name">{{ frame.name }}</a>
                    </div>
                    <div v-if="frames.length === 0" class="ctool-video-frame-capture-empty">暂无截图结果</div>
                </div>
            </Card>
        </HeightResize>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import Message from "@/helper/message";
import { createLoadedFFmpeg } from "@/tools/mediaShared/ffmpeg";

interface FrameItem {
    name: string;
    url: string;
    data: Uint8Array;
}

const JSZIP_ESM_URL = "https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm";

const ready = ref(false);
const extracting = ref(false);
const downloading = ref(false);
const statusText = ref("加载 ffmpeg 中...");
const ffmpegRef = ref<any>(null);
const fetchFileRef = ref<((file?: string | Blob | File) => Promise<Uint8Array>) | null>(null);

const videoFile = ref<File | null>(null);
const videoFileName = ref("");
const fps = ref(3);
const videoDuration = ref(0);
const frames = ref<FrameItem[]>([]);

const estimatedFrameCountText = computed(() => {
    if (!videoDuration.value) {
        return "0";
    }
    return `${Math.floor(videoDuration.value * fps.value)}`;
});

const cleanupFrames = () => {
    frames.value.forEach(frame => URL.revokeObjectURL(frame.url));
    frames.value = [];
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
    cleanupFrames();
});

const fileChangeHandle = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] || null;
    videoFile.value = file;
    videoFileName.value = file?.name || "";
    cleanupFrames();
    videoDuration.value = 0;

    if (file) {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
            videoDuration.value = Number.isFinite(video.duration) ? video.duration : 0;
            URL.revokeObjectURL(video.src);
        };
        video.src = URL.createObjectURL(file);
    }
};

const extractHandle = async () => {
    if (!videoFile.value || !ffmpegRef.value || !fetchFileRef.value) {
        return;
    }
    extracting.value = true;
    cleanupFrames();
    statusText.value = "开始提取...";

    try {
        const inputName = videoFile.value.name;
        await ffmpegRef.value.writeFile(inputName, await fetchFileRef.value(videoFile.value));
        await ffmpegRef.value.exec([
            "-i",
            inputName,
            "-vf",
            `fps=${fps.value}`,
            "-f",
            "image2",
            "frame_%04d.png",
        ]);

        const expected = Math.max(1, Math.floor((videoDuration.value || 0) * fps.value) + 4);
        const list: FrameItem[] = [];
        for (let i = 1; i <= expected; i++) {
            const name = `frame_${String(i).padStart(4, "0")}.png`;
            try {
                const data = await ffmpegRef.value.readFile(name);
                list.push({
                    name,
                    data,
                    url: URL.createObjectURL(new Blob([data], { type: "image/png" })),
                });
                ffmpegRef.value.deleteFile(name);
            } catch {
                // ignore missing frame
            }
        }
        ffmpegRef.value.deleteFile(inputName);
        frames.value = list;
        statusText.value = `提取完成，共 ${list.length} 帧`;
    } catch (error) {
        statusText.value = "提取失败";
        Message.error(`提取失败: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        extracting.value = false;
    }
};

const downloadAllHandle = async () => {
    if (frames.value.length === 0) {
        return;
    }
    downloading.value = true;
    try {
        const JSZipModule = await import(/* @vite-ignore */ JSZIP_ESM_URL);
        const JSZip = JSZipModule.default;
        const zip = new JSZip();
        frames.value.forEach(frame => {
            zip.file(frame.name, frame.data);
        });
        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const a = document.createElement("a");
        a.href = url;
        a.download = "frames.zip";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        Message.error(`打包失败: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        downloading.value = false;
    }
};

const clearHandle = () => {
    cleanupFrames();
    statusText.value = ready.value ? "ffmpeg 已就绪" : statusText.value;
};
</script>

<style>
.ctool-video-frame-capture {
    height: 100%;
}

.ctool-video-frame-capture-toolbar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
}

.ctool-video-frame-capture-desc {
    font-size: .95rem;
}

.ctool-video-frame-capture-options {
    display: grid;
    grid-template-columns: 1.2fr .4fr .5fr;
    gap: 10px;
    margin-top: 10px;
}

.ctool-video-frame-capture-field {
    min-width: 0;
}

.ctool-video-frame-capture-label {
    margin-bottom: 4px;
    font-size: .8rem;
    color: var(--ctool-info-color);
}

.ctool-video-frame-capture-file-name {
    margin-top: 4px;
    font-size: .8rem;
    color: var(--ctool-info-color);
}

.ctool-video-frame-capture-status {
    margin-top: 10px;
    padding: 8px 10px;
    border-radius: var(--border-radius);
    background: var(--ctool-background-color);
    font-size: .8rem;
    color: var(--ctool-info-color);
}

.ctool-video-frame-capture-grid {
    overflow: auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 8px;
}

.ctool-video-frame-capture-item {
    border: 1px solid var(--ctool-border-color);
    border-radius: var(--border-radius);
    padding: 6px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.ctool-video-frame-capture-item img {
    width: 100%;
    height: 140px;
    object-fit: contain;
    background: var(--ctool-background-color);
}

.ctool-video-frame-capture-empty {
    color: var(--ctool-info-color);
    font-size: .9rem;
}

@media (max-width: 960px) {
    .ctool-video-frame-capture-toolbar {
        flex-direction: column;
    }

    .ctool-video-frame-capture-options {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
