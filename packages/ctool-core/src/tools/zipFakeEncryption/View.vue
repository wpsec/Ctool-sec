<template>
    <div class="ctool-zip-fake-encryption">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-zip-fake-encryption-toolbar">
                <div>
                    <div class="ctool-zip-fake-encryption-desc">
                        ZIP 伪加密：仅修改 ZIP 加密标志位，不会真正加密文件内容。
                    </div>
                    <div class="ctool-zip-fake-encryption-file" v-if="action.current.fileName">
                        当前文件：{{ action.current.fileName }}
                    </div>
                </div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="'生成伪加密 ZIP'" :disabled="!action.current.fileBuffer" @click="convertHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
            <div class="ctool-zip-fake-encryption-options">
                <input class="ctool-zip-fake-encryption-file-input" type="file" accept=".zip,application/zip" @change="fileChangeHandle" />
            </div>
            <div class="ctool-zip-fake-encryption-download" v-if="action.current.outputUrl">
                <a :href="action.current.outputUrl" :download="action.current.outputName">下载 {{ action.current.outputName }}</a>
            </div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <Card title="处理结果">
                <Textarea :height="`${height}px`" :model-value="action.current.result" readonly copy />
            </Card>
        </HeightResize>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from "vue";
import { initialize, useAction } from "@/store/action";
import Message from "@/helper/message";
import { buildPseudoEncryptedFileName, buildZipPseudoEncrypted } from "./util";

const action = useAction(await initialize({
    fileName: "",
    fileBuffer: null as ArrayBuffer | null,
    outputName: "",
    outputUrl: "",
    result: "",
}, { paste: false }));

const revokeOutputUrl = () => {
    if (!action.current.outputUrl) {
        return;
    }
    URL.revokeObjectURL(action.current.outputUrl);
    action.current.outputUrl = "";
};

const fileChangeHandle = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    revokeOutputUrl();
    action.current.outputName = "";
    action.current.result = "";

    if (!file) {
        action.current.fileName = "";
        action.current.fileBuffer = null;
        return;
    }

    action.current.fileName = file.name;
    action.current.fileBuffer = await file.arrayBuffer();
};

const convertHandle = () => {
    if (!action.current.fileBuffer) {
        return Message.error("请先上传 ZIP 文件");
    }

    try {
        const result = buildZipPseudoEncrypted(action.current.fileBuffer);
        revokeOutputUrl();
        action.current.outputName = buildPseudoEncryptedFileName(action.current.fileName || "archive.zip");
        action.current.outputUrl = URL.createObjectURL(new Blob([result.outputBuffer], { type: "application/zip" }));
        action.current.result = [
            `处理完成，共 ${result.totalEntries} 个文件条目。`,
            `已新增伪加密标记: ${result.updatedEntries} 项。`,
            `原本已带加密标记: ${result.alreadyEncryptedEntries} 项。`,
            "",
            "提示：伪加密仅设置 ZIP 头部标志位，文件内容本身并未加密。",
        ].join("\n");
        action.success({ message: "" });
    } catch (error) {
        action.current.result = `处理失败: ${error instanceof Error ? error.message : String(error)}`;
        Message.error(action.current.result);
    }
};

const clearHandle = () => {
    revokeOutputUrl();
    action.current.fileName = "";
    action.current.fileBuffer = null;
    action.current.outputName = "";
    action.current.result = "";
    action.save();
};

onBeforeUnmount(() => {
    revokeOutputUrl();
});
</script>

<style>
.ctool-zip-fake-encryption {
    height: 100%;
}

.ctool-zip-fake-encryption-toolbar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
}

.ctool-zip-fake-encryption-desc {
    font-size: .95rem;
}

.ctool-zip-fake-encryption-file {
    margin-top: 4px;
    font-size: .8rem;
    color: var(--ctool-info-color);
    word-break: break-all;
}

.ctool-zip-fake-encryption-options {
    margin-top: 10px;
}

.ctool-zip-fake-encryption-file-input {
    width: 100%;
}

.ctool-zip-fake-encryption-download {
    margin-top: 10px;
    font-size: .9rem;
}

@media (max-width: 960px) {
    .ctool-zip-fake-encryption-toolbar {
        flex-direction: column;
    }
}
</style>
