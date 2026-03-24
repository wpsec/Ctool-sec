<template>
    <div class="ctool-chart-radar">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-chart-radar-toolbar">
                <div>
                    <div class="ctool-chart-radar-desc">{{ $t("chartRadar_description") }}</div>
                    <div class="ctool-chart-radar-hint">{{ $t("chartRadar_hint") }}</div>
                </div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="$t('chartRadar_render')" @click="renderHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
            <div class="ctool-chart-radar-options">
                <div class="ctool-chart-radar-field">
                    <div class="ctool-chart-radar-label">{{ $t("chartRadar_title") }}</div>
                    <Input v-model="action.current.title" :placeholder="$t('chartRadar_title_placeholder')" />
                </div>
                <div class="ctool-chart-radar-field">
                    <div class="ctool-chart-radar-label">{{ $t("chartRadar_shape") }}</div>
                    <Select v-model="action.current.shape" :options="shapeOptions" />
                </div>
                <div class="ctool-chart-radar-field">
                    <div class="ctool-chart-radar-label">{{ $t("chartRadar_legend") }}</div>
                    <Bool v-model="action.current.legendShow" border :label="$t('chartRadar_legend_label')" />
                </div>
            </div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <div class="ctool-chart-radar-layout" :style="{ height: `${height}px` }">
                <div class="ctool-chart-radar-input-layout">
                    <Card :title="$t('chartRadar_indicator_title')" class="ctool-chart-radar-card">
                        <div class="ctool-chart-radar-fill">
                            <Textarea
                                v-model="action.current.indicatorInput"
                                :height="'100%'"
                                :placeholder="$t('chartRadar_indicator_placeholder')"
                            />
                        </div>
                    </Card>
                    <Card :title="$t('chartRadar_data_title')" class="ctool-chart-radar-card">
                        <div class="ctool-chart-radar-fill">
                            <Textarea
                                v-model="action.current.dataInput"
                                :height="'100%'"
                                :placeholder="$t('chartRadar_data_placeholder')"
                            />
                        </div>
                    </Card>
                </div>
                <div class="ctool-chart-radar-preview-layout">
                    <Card :title="$t('chartRadar_preview_title')" class="ctool-chart-radar-card">
                        <div class="ctool-chart-radar-preview" v-html="action.current.svg || emptySvg"></div>
                    </Card>
                    <Card :title="$t('chartRadar_svg_title')" class="ctool-chart-radar-card">
                        <div class="ctool-chart-radar-fill">
                            <Textarea
                                :model-value="action.current.svg"
                                :height="'100%'"
                                :placeholder="$t('chartRadar_svg_placeholder')"
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
import { createRadarChartSvg, parseRadarIndicators, parseRadarSeries, RadarShape } from "./util";

const defaultIndicatorInput = `[
  { name: "Sales", max: 6500 },
  { name: "Administration", max: 16000 },
  { name: "Information", max: 30000 },
  { name: "Customer", max: 38000 },
  { name: "Development", max: 52000 },
  { name: "Marketing", max: 25000 }
]`;

const defaultDataInput = `{
  "测试数据一": [4200, 3000, 20000, 35000, 50000, 18000],
  "测试数据二": [5000, 14000, 28000, 26000, 42000, 21000]
}`;

const emptySvg = `<div style="height:100%;display:flex;align-items:center;justify-content:center;color:var(--ctool-info-color);">${$t("chartRadar_preview_placeholder")}</div>`;

const action = useAction(await initialize({
    title: "展示数据",
    shape: "polygon" as RadarShape,
    legendShow: true,
    indicatorInput: defaultIndicatorInput,
    dataInput: defaultDataInput,
    svg: "",
}, { paste: false }));

const shapeOptions = $computed(() => {
    return [
        { value: "polygon", label: $t("chartRadar_shape_polygon") },
        { value: "circle", label: $t("chartRadar_shape_circle") },
    ];
});

const renderHandle = () => {
    try {
        const indicators = parseRadarIndicators(action.current.indicatorInput);
        const series = parseRadarSeries(action.current.dataInput, indicators.length);
        action.current.svg = createRadarChartSvg(
            action.current.title,
            indicators,
            series,
            action.current.shape,
            action.current.legendShow,
        );
        action.success({ message: "" });
    } catch (error) {
        console.error(error);
        Message.error($t("chartRadar_error_data"));
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
.ctool-chart-radar {
    height: 100%;
}

.ctool-chart-radar-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.ctool-chart-radar-desc {
    font-size: .95rem;
}

.ctool-chart-radar-hint {
    margin-top: 4px;
    font-size: .75rem;
    color: var(--ctool-info-color);
}

.ctool-chart-radar-options {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin-top: 10px;
}

.ctool-chart-radar-label {
    margin-bottom: 4px;
    font-size: .8rem;
    color: var(--ctool-info-color);
}

.ctool-chart-radar-layout {
    display: grid;
    grid-template-columns: minmax(320px, 1fr) minmax(0, 1.2fr);
    gap: 5px;
}

.ctool-chart-radar-input-layout,
.ctool-chart-radar-preview-layout {
    display: grid;
    grid-template-rows: repeat(2, minmax(0, 1fr));
    gap: 5px;
    min-height: 0;
}

.ctool-chart-radar-card,
.ctool-chart-radar-fill {
    min-height: 0;
    height: 100%;
}

.ctool-chart-radar-card .ctool-card-body {
    height: 100%;
}

.ctool-chart-radar-preview {
    height: 100%;
    background: #fff;
    border: 1px solid var(--ctool-border-color);
    border-radius: var(--border-radius);
    overflow: hidden;
}

@media (max-width: 960px) {
    .ctool-chart-radar-toolbar {
        flex-direction: column;
    }

    .ctool-chart-radar-options,
    .ctool-chart-radar-layout,
    .ctool-chart-radar-input-layout,
    .ctool-chart-radar-preview-layout {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
