<template>
    <div class="ctool-chart-line">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-chart-line-toolbar">
                <div>
                    <div class="ctool-chart-line-desc">{{ $t("chartLine_description") }}</div>
                    <div class="ctool-chart-line-hint">{{ $t("chartLine_hint") }}</div>
                </div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="$t('chartLine_render')" @click="renderHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
            <div class="ctool-chart-line-options">
                <div class="ctool-chart-line-field">
                    <div class="ctool-chart-line-label">{{ $t("chartLine_title") }}</div>
                    <Input v-model="action.current.title" :placeholder="$t('chartLine_title_placeholder')" />
                </div>
                <div class="ctool-chart-line-field ctool-chart-line-field-span">
                    <div class="ctool-chart-line-label">{{ $t("chartLine_x_axis") }}</div>
                    <Input v-model="action.current.xAxisInput" :placeholder="$t('chartLine_x_axis_placeholder')" />
                </div>
                <div class="ctool-chart-line-field">
                    <div class="ctool-chart-line-label">{{ $t("chartLine_smooth") }}</div>
                    <Bool v-model="action.current.smooth" border :label="$t('chartLine_smooth_label')" />
                </div>
                <div class="ctool-chart-line-field">
                    <div class="ctool-chart-line-label">{{ $t("chartLine_legend") }}</div>
                    <Bool v-model="action.current.legendShow" border :label="$t('chartLine_legend_label')" />
                </div>
            </div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <div class="ctool-chart-line-layout" :style="{ height: `${height}px` }">
                <Card :title="$t('chartLine_data_title')" class="ctool-chart-line-card">
                    <div class="ctool-chart-line-fill">
                        <Textarea
                            v-model="action.current.dataInput"
                            :height="'100%'"
                            :placeholder="$t('chartLine_data_placeholder')"
                        />
                    </div>
                </Card>
                <div class="ctool-chart-line-preview-layout">
                    <Card :title="$t('chartLine_preview_title')" class="ctool-chart-line-card">
                        <div class="ctool-chart-line-preview" v-html="action.current.svg || emptySvg"></div>
                    </Card>
                    <Card :title="$t('chartLine_svg_title')" class="ctool-chart-line-card">
                        <div class="ctool-chart-line-fill">
                            <Textarea
                                :model-value="action.current.svg"
                                :height="'100%'"
                                :placeholder="$t('chartLine_svg_placeholder')"
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
import { createLineChartSvg, parseLineSeries, parseXAxis } from "./util";

const defaultSeriesInput = `{
  "测试数据一": [120, 132, 101, 134, 90, 230, 210],
  "测试数据二": [220, 182, 191, 234, 290, 330, 310],
  "测试数据三": [150, 232, 201, 154, 190, 330, 410]
}`;

const emptySvg = `<div style="height:100%;display:flex;align-items:center;justify-content:center;color:var(--ctool-info-color);">${$t("chartLine_preview_placeholder")}</div>`;

const action = useAction(await initialize({
    title: "展示数据",
    xAxisInput: "Mon, Tue, Wed, Thu, Fri, Sat, Sun",
    dataInput: defaultSeriesInput,
    smooth: false,
    legendShow: true,
    svg: "",
}, { paste: false }));

const renderHandle = () => {
    try {
        const xAxis = parseXAxis(action.current.xAxisInput);
        const series = parseLineSeries(action.current.dataInput);
        if (xAxis.length < 1) {
            return Message.error($t("chartLine_error_x_axis"));
        }
        action.current.svg = createLineChartSvg(
            action.current.title,
            xAxis,
            series,
            action.current.smooth,
            action.current.legendShow,
        );
        action.success({ message: "" });
    } catch (error) {
        console.error(error);
        Message.error($t("chartLine_error_data"));
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
.ctool-chart-line {
    height: 100%;
}

.ctool-chart-line-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.ctool-chart-line-desc {
    font-size: .95rem;
}

.ctool-chart-line-hint {
    margin-top: 4px;
    font-size: .75rem;
    color: var(--ctool-info-color);
}

.ctool-chart-line-options {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin-top: 10px;
}

.ctool-chart-line-field-span {
    grid-column: span 2;
}

.ctool-chart-line-label {
    margin-bottom: 4px;
    font-size: .8rem;
    color: var(--ctool-info-color);
}

.ctool-chart-line-layout {
    display: grid;
    grid-template-columns: minmax(320px, 1fr) minmax(0, 1.2fr);
    gap: 5px;
}

.ctool-chart-line-preview-layout {
    display: grid;
    grid-template-rows: minmax(200px, 1fr) minmax(0, .9fr);
    gap: 5px;
    min-height: 0;
}

.ctool-chart-line-card,
.ctool-chart-line-fill {
    min-height: 0;
    height: 100%;
}

.ctool-chart-line-card .ctool-card-body {
    height: 100%;
}

.ctool-chart-line-preview {
    height: 100%;
    background: #fff;
    border: 1px solid var(--ctool-border-color);
    border-radius: var(--border-radius);
    overflow: hidden;
}

@media (max-width: 960px) {
    .ctool-chart-line-toolbar {
        flex-direction: column;
    }

    .ctool-chart-line-options,
    .ctool-chart-line-layout,
    .ctool-chart-line-preview-layout {
        grid-template-columns: minmax(0, 1fr);
    }

    .ctool-chart-line-field-span {
        grid-column: span 1;
    }
}
</style>
