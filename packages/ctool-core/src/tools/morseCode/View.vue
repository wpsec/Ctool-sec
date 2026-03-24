<template>
    <div class="ctool-morse-code">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-morse-code-toolbar">
                <div class="ctool-morse-code-desc">{{ $t("morseCode_description") }}</div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="$t('morseCode_encode')" @click="encodeHandle" />
                    <Button :size="'small'" :type="'primary'" :text="$t('morseCode_decode')" @click="decodeHandle" />
                    <Button :size="'small'" :text="$t('morseCode_swap')" @click="swapHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <div class="ctool-morse-code-layout" :style="{ height: `${height}px` }">
                <Card :title="$t('morseCode_text_title')" class="ctool-morse-code-card">
                    <div class="ctool-morse-code-fill">
                        <Textarea
                            v-model="action.current.text"
                            :height="'100%'"
                            :placeholder="$t('morseCode_text_placeholder')"
                            copy
                        />
                    </div>
                </Card>
                <Card :title="$t('morseCode_morse_title')" class="ctool-morse-code-card">
                    <div class="ctool-morse-code-fill">
                        <Textarea
                            v-model="action.current.morse"
                            :height="'100%'"
                            :placeholder="$t('morseCode_morse_placeholder')"
                            copy
                        />
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
import { decodeMorse, encodeMorse } from "./util";

const action = useAction(await initialize({
    text: "",
    morse: "",
}, { paste: false }));

const encodeHandle = () => {
    if (!action.current.text.trim()) {
        return Message.error($t("morseCode_error_text_empty"));
    }
    action.current.morse = encodeMorse(action.current.text);
    action.success({ message: "" });
};

const decodeHandle = () => {
    if (!action.current.morse.trim()) {
        return Message.error($t("morseCode_error_morse_empty"));
    }
    action.current.text = decodeMorse(action.current.morse);
    action.success({ message: "" });
};

const swapHandle = () => {
    const { text, morse } = action.current;
    action.current.text = morse;
    action.current.morse = text;
    action.save();
};

const clearHandle = () => {
    action.current.text = "";
    action.current.morse = "";
    action.save();
};

watch(() => action.current, () => action.save(), { deep: true });
</script>

<style>
.ctool-morse-code {
    height: 100%;
}

.ctool-morse-code-toolbar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
}

.ctool-morse-code-desc {
    font-size: .95rem;
}

.ctool-morse-code-layout {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px;
}

.ctool-morse-code-card,
.ctool-morse-code-fill {
    min-height: 0;
    height: 100%;
}

.ctool-morse-code-card .ctool-card-body {
    height: 100%;
}

@media (max-width: 960px) {
    .ctool-morse-code-toolbar,
    .ctool-morse-code-layout {
        grid-template-columns: minmax(0, 1fr);
        flex-direction: column;
    }
}
</style>
