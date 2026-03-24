<template>
    <div class="ctool-image-ocr">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-image-ocr-toolbar">
                <div class="ctool-image-ocr-desc">图片 OCR 识别（Tesseract.js，本地浏览器执行）</div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="running ? '识别中...' : '开始识别'" :disabled="running || !selectedFile" @click="recognizeHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
            <div class="ctool-image-ocr-file">
                <input type="file" accept="image/*" @change="fileChangeHandle" />
                <div class="ctool-image-ocr-file-name" v-if="fileName">{{ fileName }}</div>
            </div>
            <div class="ctool-image-ocr-status">{{ statusText || "请选择图片后开始识别" }}</div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <Card title="识别文本">
                <Textarea :height="`${height}px`" v-model="action.current.output" readonly copy />
            </Card>
        </HeightResize>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { initialize, useAction } from "@/store/action";
import Message from "@/helper/message";
import { recognizeImageText } from "./util";

const action = useAction(await initialize({
    output: "",
}, { paste: false }));

const selectedFile = ref<File | null>(null);
const fileName = ref("");
const statusText = ref("");
const running = ref(false);

const fileChangeHandle = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] || null;
    selectedFile.value = file;
    fileName.value = file?.name || "";
};

const recognizeHandle = async () => {
    if (!selectedFile.value) {
        return Message.error("请先上传图片");
    }
    running.value = true;
    statusText.value = "初始化 OCR 引擎...";
    action.current.output = "";
    try {
        action.current.output = await recognizeImageText(selectedFile.value, (message: string) => {
            statusText.value = message;
        });
        statusText.value = "识别完成";
        action.success({ message: "" });
    } catch (error) {
        statusText.value = "识别失败";
        Message.error(`OCR 失败: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        running.value = false;
    }
};

const clearHandle = () => {
    action.current.output = "";
    statusText.value = "";
    action.save();
};
</script>

<style>
.ctool-image-ocr {
    height: 100%;
}

.ctool-image-ocr-toolbar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
}

.ctool-image-ocr-desc {
    font-size: .95rem;
}

.ctool-image-ocr-file {
    margin-top: 10px;
}

.ctool-image-ocr-file-name {
    margin-top: 4px;
    font-size: .8rem;
    color: var(--ctool-info-color);
}

.ctool-image-ocr-status {
    margin-top: 10px;
    padding: 8px 10px;
    border-radius: var(--border-radius);
    background: var(--ctool-background-color);
    font-size: .8rem;
    color: var(--ctool-info-color);
}

@media (max-width: 960px) {
    .ctool-image-ocr-toolbar {
        flex-direction: column;
    }
}
</style>
