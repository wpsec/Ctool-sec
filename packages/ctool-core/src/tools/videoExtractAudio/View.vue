<template>
    <div class="ctool-video-extract-audio">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-video-extract-audio-toolbar">
                <div class="ctool-video-extract-audio-desc">提取视频中的音频并导出为 WAV</div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="running ? '提取中...' : '开始提取'" :disabled="running || !videoFile" @click="extractHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
            <div class="ctool-video-extract-audio-file">
                <input type="file" accept="video/*" @change="fileChangeHandle" />
                <div class="ctool-video-extract-audio-file-name" v-if="videoFileName">{{ videoFileName }}</div>
            </div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <div class="ctool-video-extract-audio-layout" :style="{ height: `${height}px` }">
                <Card class="ctool-video-extract-audio-card" title="音频预览">
                    <div class="ctool-video-extract-audio-preview">
                        <audio v-if="audioUrl" controls :src="audioUrl" />
                        <div v-else class="ctool-video-extract-audio-empty">暂无提取结果</div>
                    </div>
                </Card>
                <Card class="ctool-video-extract-audio-card" title="下载">
                    <div class="ctool-video-extract-audio-preview">
                        <a v-if="audioUrl" :href="audioUrl" :download="downloadName">下载 {{ downloadName }}</a>
                        <div v-else class="ctool-video-extract-audio-empty">请先提取音频</div>
                    </div>
                </Card>
            </div>
        </HeightResize>
    </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";
import Message from "@/helper/message";
import { bufferToWave } from "@/tools/mediaShared/bufferToWave";

const videoFile = ref<File | null>(null);
const videoFileName = ref("");
const audioUrl = ref("");
const running = ref(false);

const downloadName = computed(() => {
    const baseName = (videoFileName.value || "audio").replace(/\.[^.]+$/, "");
    return `${baseName}.wav`;
});

const revokeAudioUrl = () => {
    if (audioUrl.value) {
        URL.revokeObjectURL(audioUrl.value);
        audioUrl.value = "";
    }
};

onUnmounted(() => {
    revokeAudioUrl();
});

const fileChangeHandle = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] || null;
    videoFile.value = file;
    videoFileName.value = file?.name || "";
};

const extractHandle = async () => {
    if (!videoFile.value) {
        return Message.error("请先上传视频");
    }
    running.value = true;
    revokeAudioUrl();
    try {
        const buffer = await videoFile.value.arrayBuffer();
        const audioContext = new AudioContext();
        const decoded = await audioContext.decodeAudioData(buffer.slice(0));
        const wavBlob = bufferToWave(decoded, decoded.sampleRate * decoded.duration);
        audioUrl.value = URL.createObjectURL(wavBlob);
        await audioContext.close();
        Message.success("提取完成");
    } catch (error) {
        Message.error(`提取失败: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        running.value = false;
    }
};

const clearHandle = () => {
    revokeAudioUrl();
};
</script>

<style>
.ctool-video-extract-audio {
    height: 100%;
}

.ctool-video-extract-audio-toolbar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
}

.ctool-video-extract-audio-desc {
    font-size: .95rem;
}

.ctool-video-extract-audio-file {
    margin-top: 10px;
}

.ctool-video-extract-audio-file-name {
    margin-top: 4px;
    font-size: .8rem;
    color: var(--ctool-info-color);
}

.ctool-video-extract-audio-layout {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px;
}

.ctool-video-extract-audio-card,
.ctool-video-extract-audio-preview {
    min-height: 0;
    height: 100%;
}

.ctool-video-extract-audio-card .ctool-card-body {
    height: 100%;
}

.ctool-video-extract-audio-preview {
    display: flex;
    align-items: center;
    justify-content: center;
}

.ctool-video-extract-audio-empty {
    color: var(--ctool-info-color);
    font-size: .9rem;
}

@media (max-width: 960px) {
    .ctool-video-extract-audio-toolbar {
        flex-direction: column;
    }

    .ctool-video-extract-audio-layout {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
