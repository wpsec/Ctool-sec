<template>
    <div class="ctool-leet-convert">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-leet-convert-toolbar">
                <div class="ctool-leet-convert-desc">{{ $t("leetConvert_description") }}</div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="$t('leetConvert_convert')" @click="convertHandle" />
                    <Button :size="'small'" :text="$t('leetConvert_refresh')" @click="refreshHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
            <div class="ctool-leet-convert-options">
                <div class="ctool-leet-convert-label">{{ $t("leetConvert_mode_title") }}</div>
                <Radio v-model="action.current.mode" :options="modeOptions" @change="modeChangeHandle" />
            </div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <div class="ctool-leet-convert-layout" :style="{ height: `${height}px` }">
                <Card :title="$t('leetConvert_input_title')" class="ctool-leet-convert-card">
                    <div class="ctool-leet-convert-fill">
                        <Textarea
                            v-model="action.current.input"
                            :height="'100%'"
                            :placeholder="$t('leetConvert_input_placeholder')"
                        />
                    </div>
                </Card>
                <Card :title="$t('leetConvert_output_title')" class="ctool-leet-convert-card">
                    <div class="ctool-leet-convert-fill">
                        <Textarea
                            :model-value="action.current.output"
                            :height="'100%'"
                            :placeholder="$t('leetConvert_output_placeholder')"
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
import { convertLeet, LeetMode } from "./util";

const action = useAction(await initialize({
    mode: "easy" as LeetMode,
    input: "",
    output: "",
}, { paste: false }));

const modeOptions = $computed(() => {
    return [
        { value: "easy", label: $t("leetConvert_mode_easy") },
        { value: "complex", label: $t("leetConvert_mode_complex") },
    ];
});

const transform = () => {
    action.current.output = convertLeet(action.current.input, action.current.mode);
    action.success({ message: "" });
};

const convertHandle = () => {
    if (!action.current.input.trim()) {
        return Message.error($t("leetConvert_error_empty"));
    }
    transform();
};

const refreshHandle = () => {
    if (!action.current.input.trim()) {
        return Message.error($t("leetConvert_error_empty"));
    }
    transform();
};

const clearHandle = () => {
    action.current.input = "";
    action.current.output = "";
    action.current.mode = "easy";
    action.save();
};

const modeChangeHandle = () => {
    if (!action.current.input.trim()) {
        action.current.output = "";
        action.save();
        return;
    }
    transform();
};

watch(() => action.current, () => action.save(), { deep: true });
</script>

<style>
.ctool-leet-convert {
    height: 100%;
}

.ctool-leet-convert-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.ctool-leet-convert-desc {
    font-size: .95rem;
}

.ctool-leet-convert-options {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
}

.ctool-leet-convert-label {
    font-size: .8rem;
    color: var(--ctool-info-color);
}

.ctool-leet-convert-layout {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px;
}

.ctool-leet-convert-card,
.ctool-leet-convert-fill {
    min-height: 0;
    height: 100%;
}

.ctool-leet-convert-card .ctool-card-body {
    height: 100%;
}

@media (max-width: 960px) {
    .ctool-leet-convert-toolbar,
    .ctool-leet-convert-options {
        flex-direction: column;
        align-items: flex-start;
    }

    .ctool-leet-convert-layout {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
