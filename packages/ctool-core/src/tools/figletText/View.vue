<template>
    <div class="ctool-figlet-text">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-figlet-text-toolbar">
                <div>
                    <div class="ctool-figlet-text-desc">{{ $t("figletText_description") }}</div>
                    <div class="ctool-figlet-text-hint">{{ $t("figletText_hint") }}</div>
                </div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="$t('figletText_generate')" @click="generateHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
            <div class="ctool-figlet-text-options">
                <div class="ctool-figlet-text-field">
                    <div class="ctool-figlet-text-label">{{ $t("figletText_style") }}</div>
                    <Select v-model="action.current.style" :options="styleOptions" />
                </div>
                <div class="ctool-figlet-text-field">
                    <div class="ctool-figlet-text-label">{{ $t("figletText_spacing") }}</div>
                    <InputNumber v-model="action.current.spacing" :min="1" :max="4" />
                </div>
                <div class="ctool-figlet-text-field">
                    <div class="ctool-figlet-text-label">{{ $t("figletText_uppercase") }}</div>
                    <Bool v-model="action.current.uppercase" border :label="$t('figletText_uppercase_label')" />
                </div>
            </div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <div class="ctool-figlet-text-layout" :style="{ height: `${height}px` }">
                <Card :title="$t('figletText_input_title')" class="ctool-figlet-text-card">
                    <div class="ctool-figlet-text-fill">
                        <Textarea
                            v-model="action.current.input"
                            :height="'100%'"
                            :placeholder="$t('figletText_input_placeholder')"
                        />
                    </div>
                </Card>
                <Card :title="$t('figletText_output_title')" class="ctool-figlet-text-card">
                    <div class="ctool-figlet-text-fill">
                        <Textarea
                            :model-value="action.current.output"
                            :height="'100%'"
                            :placeholder="$t('figletText_output_placeholder')"
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
import { FigletStyle, renderFiglet } from "./util";

const action = useAction(await initialize({
    input: "Ctool-sec",
    style: "block" as FigletStyle,
    spacing: 1,
    uppercase: true,
    output: "",
}, { paste: false }));

const styleOptions = $computed(() => {
    return [
        { value: "block", label: $t("figletText_style_block") },
        { value: "hash", label: $t("figletText_style_hash") },
        { value: "dot", label: $t("figletText_style_dot") },
    ];
});

const generateHandle = () => {
    if (!action.current.input.trim()) {
        return Message.error($t("figletText_error_empty"));
    }
    action.current.output = renderFiglet(
        action.current.input,
        action.current.style,
        action.current.spacing,
        action.current.uppercase,
    );
    action.success({ message: "" });
};

const clearHandle = () => {
    action.current.output = "";
    action.save();
};

if (!action.current.output) {
    generateHandle();
}

watch(() => action.current, () => action.save(), { deep: true });
</script>

<style>
.ctool-figlet-text {
    height: 100%;
}

.ctool-figlet-text-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.ctool-figlet-text-desc {
    font-size: .95rem;
}

.ctool-figlet-text-hint {
    margin-top: 4px;
    font-size: .75rem;
    color: var(--ctool-info-color);
}

.ctool-figlet-text-options {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin-top: 10px;
}

.ctool-figlet-text-field {
    min-width: 0;
}

.ctool-figlet-text-label {
    margin-bottom: 4px;
    font-size: .8rem;
    color: var(--ctool-info-color);
}

.ctool-figlet-text-layout {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px;
}

.ctool-figlet-text-card,
.ctool-figlet-text-fill {
    min-height: 0;
    height: 100%;
}

.ctool-figlet-text-card .ctool-card-body {
    height: 100%;
}

@media (max-width: 960px) {
    .ctool-figlet-text-toolbar {
        flex-direction: column;
    }

    .ctool-figlet-text-options,
    .ctool-figlet-text-layout {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
