<template>
    <div class="ctool-chart-nightingale">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-chart-nightingale-toolbar">
                <div>
                    <div class="ctool-chart-nightingale-desc">{{ $t("chartNightingale_description") }}</div>
                    <div class="ctool-chart-nightingale-hint">{{ $t("chartNightingale_hint") }}</div>
                </div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="$t('chartNightingale_render')" @click="renderHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
            <div class="ctool-chart-nightingale-options">
                <div class="ctool-chart-nightingale-field">
                    <div class="ctool-chart-nightingale-label">{{ $t("chartNightingale_title") }}</div>
                    <Input v-model="action.current.title" :placeholder="$t('chartNightingale_title_placeholder')" />
                </div>
                <div class="ctool-chart-nightingale-field">
                    <div class="ctool-chart-nightingale-label">{{ $t("chartNightingale_legend") }}</div>
                    <Bool v-model="action.current.legendShow" border :label="$t('chartNightingale_legend_label')" />
                </div>
                <div class="ctool-chart-nightingale-field">
                    <div class="ctool-chart-nightingale-label">{{ $t("chartNightingale_label") }}</div>
                    <Bool v-model="action.current.labelShow" border :label="$t('chartNightingale_label_label')" />
                </div>
            </div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <div class="ctool-chart-nightingale-layout" :style="{ height: `${height}px` }">
                <Card :title="$t('chartNightingale_data_title')" class="ctool-chart-nightingale-card">
                    <div class="ctool-chart-nightingale-fill">
                        <Textarea
                            v-model="action.current.dataInput"
                            :height="'100%'"
                            :placeholder="$t('chartNightingale_data_placeholder')"
                        />
                    </div>
                </Card>
                <div class="ctool-chart-nightingale-preview-layout">
                    <Card :title="$t('chartNightingale_preview_title')" class="ctool-chart-nightingale-card">
                        <div class="ctool-chart-nightingale-preview" v-html="action.current.svg || emptySvg"></div>
                    </Card>
                    <Card :title="$t('chartNightingale_svg_title')" class="ctool-chart-nightingale-card">
                        <div class="ctool-chart-nightingale-fill">
                            <Textarea
                                :model-value="action.current.svg"
                                :height="'100%'"
                                :placeholder="$t('chartNightingale_svg_placeholder')"
                                readonly
                                copy
                            />
                        </div>
                    </Card>
                </div>
            </div>
        </HeightResize>
    </div>
</template>

<script setup lang="ts">
import { initialize, useAction } from "@/store/action";
import Message from "@/helper/message";
import { watch } from "vue";
import { createNightingaleSvg, parseNightingaleData } from "./util";

const defaultDataInput = `{
  "rose 1": 40,
  "rose 2": 38,
  "rose 3": 32,
  "rose 4": 30,
  "rose 5": 28,
  "rose 6": 26,
  "rose 7": 22,
  "rose 8": 18
}`;

const emptySvg = `<div style="height:100%;display:flex;align-items:center;justify-content:center;color:var(--ctool-info-color);">${$t("chartNightingale_preview_placeholder")}</div>`;

const action = useAction(await initialize({
    title: "展示数据",
    legendShow: true,
    labelShow: true,
    dataInput: defaultDataInput,
    svg: "",
}, { paste: false }));

const renderHandle = () => {
    try {
        const data = parseNightingaleData(action.current.dataInput);
        action.current.svg = createNightingaleSvg(
            action.current.title,
            data,
            action.current.labelShow,
            action.current.legendShow,
        );
        action.success({ message: "" });
    } catch (error) {
        console.error(error);
        Message.error($t("chartNightingale_error_data"));
    }
};

const clearHandle = () => {
    action.current.svg = "";
    action.save();
};

if (!action.current.svg) {
    renderHandle();
}

watch(() => action.current, () => action.save(), { deep: true });
</script>

<style>
.ctool-chart-nightingale {
    height: 100%;
}

.ctool-chart-nightingale-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.ctool-chart-nightingale-desc {
    font-size: .95rem;
}

.ctool-chart-nightingale-hint {
    margin-top: 4px;
    font-size: .75rem;
    color: var(--ctool-info-color);
}

.ctool-chart-nightingale-options {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin-top: 10px;
}

.ctool-chart-nightingale-label {
    margin-bottom: 4px;
    font-size: .8rem;
    color: var(--ctool-info-color);
}

.ctool-chart-nightingale-layout {
    display: grid;
    grid-template-columns: minmax(320px, 1fr) minmax(0, 1.2fr);
    gap: 5px;
}

.ctool-chart-nightingale-preview-layout {
    display: grid;
    grid-template-rows: minmax(220px, 1fr) minmax(0, .9fr);
    gap: 5px;
    min-height: 0;
}

.ctool-chart-nightingale-card,
.ctool-chart-nightingale-fill {
    min-height: 0;
    height: 100%;
}

.ctool-chart-nightingale-card .ctool-card-body {
    height: 100%;
}

.ctool-chart-nightingale-preview {
    height: 100%;
    background: #fff;
    border: 1px solid var(--ctool-border-color);
    border-radius: var(--border-radius);
    overflow: hidden;
}

@media (max-width: 960px) {
    .ctool-chart-nightingale-toolbar {
        flex-direction: column;
    }

    .ctool-chart-nightingale-options,
    .ctool-chart-nightingale-layout,
    .ctool-chart-nightingale-preview-layout {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
