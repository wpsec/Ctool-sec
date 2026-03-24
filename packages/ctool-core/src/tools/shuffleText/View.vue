<template>
    <div class="ctool-shuffle-text">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-shuffle-text-toolbar">
                <div>
                    <div class="ctool-shuffle-text-desc">{{ $t("shuffleText_description") }}</div>
                    <div class="ctool-shuffle-text-hint">{{ $t("shuffleText_hint") }}</div>
                </div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="$t('shuffleText_generate')" @click="generateHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
            <div class="ctool-shuffle-text-options">
                <div class="ctool-shuffle-text-label">{{ $t("shuffleText_mode_title") }}</div>
                <Radio v-model="action.current.mode" :options="modeOptions" />
            </div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <div class="ctool-shuffle-text-layout" :style="{ height: `${height}px` }">
                <Card :title="$t('shuffleText_input_title')" class="ctool-shuffle-text-card">
                    <div class="ctool-shuffle-text-fill">
                        <Textarea
                            v-model="action.current.input"
                            :height="'100%'"
                            :placeholder="$t('shuffleText_input_placeholder')"
                        />
                    </div>
                </Card>
                <Card :title="$t('shuffleText_output_title')" class="ctool-shuffle-text-card">
                    <div class="ctool-shuffle-text-fill">
                        <Textarea
                            :model-value="action.current.output"
                            :height="'100%'"
                            :placeholder="$t('shuffleText_output_placeholder')"
                            readonly
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
import { shuffleText, ShuffleMode } from "./util";

const action = useAction(await initialize({
    mode: "characters" as ShuffleMode,
    input: "",
    output: "",
}, { paste: false }));

const modeOptions = $computed(() => {
    return [
        { value: "characters", label: $t("shuffleText_mode_characters") },
        { value: "paragraphs", label: $t("shuffleText_mode_paragraphs") },
    ];
});

const generateHandle = () => {
    if (!action.current.input.trim()) {
        return Message.error($t("shuffleText_error_empty"));
    }
    action.current.output = shuffleText(action.current.input, action.current.mode);
    action.success({ message: "" });
};

const clearHandle = () => {
    action.current.input = "";
    action.current.output = "";
    action.current.mode = "characters";
    action.save();
};

watch(() => action.current, () => action.save(), { deep: true });
</script>

<style>
.ctool-shuffle-text {
    height: 100%;
}

.ctool-shuffle-text-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.ctool-shuffle-text-desc {
    font-size: .95rem;
}

.ctool-shuffle-text-hint {
    margin-top: 4px;
    font-size: .75rem;
    color: var(--ctool-info-color);
}

.ctool-shuffle-text-options {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
}

.ctool-shuffle-text-label {
    font-size: .8rem;
    color: var(--ctool-info-color);
}

.ctool-shuffle-text-layout {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px;
}

.ctool-shuffle-text-card,
.ctool-shuffle-text-fill {
    min-height: 0;
    height: 100%;
}

.ctool-shuffle-text-card .ctool-card-body {
    height: 100%;
}

@media (max-width: 960px) {
    .ctool-shuffle-text-toolbar,
    .ctool-shuffle-text-options {
        flex-direction: column;
        align-items: flex-start;
    }

    .ctool-shuffle-text-layout {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
