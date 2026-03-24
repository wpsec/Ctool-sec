<template>
    <div class="ctool-pyc-to-asm">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-pyc-to-asm-toolbar">
                <div class="ctool-pyc-to-asm-desc">PYC 反汇编为 Python 字节码指令</div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="running ? '反汇编中...' : '开始反汇编'" :disabled="running || !action.current.fileBuffer" @click="decompileHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
            <div class="ctool-pyc-to-asm-file">
                <input type="file" accept=".pyc,application/octet-stream" @change="fileChangeHandle" />
                <div class="ctool-pyc-to-asm-file-name" v-if="action.current.fileName">{{ action.current.fileName }}</div>
            </div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <Card title="反汇编结果">
                <Textarea :height="`${height}px`" v-model="action.current.output" readonly copy />
            </Card>
        </HeightResize>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { initialize, useAction } from "@/store/action";
import Message from "@/helper/message";
import { decompilePycToAsm } from "./util";

const action = useAction(await initialize({
    fileName: "",
    fileBuffer: null as ArrayBuffer | null,
    output: "",
}, { paste: false }));

const running = ref(false);

const fileChangeHandle = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) {
        return;
    }
    action.current.fileName = file.name;
    action.current.fileBuffer = await file.arrayBuffer();
};

const decompileHandle = async () => {
    if (!action.current.fileBuffer || !action.current.fileName) {
        return Message.error("请先选择 pyc 文件");
    }
    running.value = true;
    try {
        await new Promise(resolve => setTimeout(resolve, 30));
        action.current.output = decompilePycToAsm(action.current.fileName, action.current.fileBuffer);
        action.success({ message: "" });
    } catch (error) {
        Message.error(`反汇编失败: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        running.value = false;
    }
};

const clearHandle = () => {
    action.current.output = "";
    action.save();
};
</script>

<style>
.ctool-pyc-to-asm {
    height: 100%;
}

.ctool-pyc-to-asm-toolbar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
}

.ctool-pyc-to-asm-desc {
    font-size: .95rem;
}

.ctool-pyc-to-asm-file {
    margin-top: 10px;
}

.ctool-pyc-to-asm-file-name {
    margin-top: 4px;
    font-size: .8rem;
    color: var(--ctool-info-color);
}

@media (max-width: 960px) {
    .ctool-pyc-to-asm-toolbar {
        flex-direction: column;
    }
}
</style>
