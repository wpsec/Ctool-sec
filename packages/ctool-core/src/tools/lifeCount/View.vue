<template>
    <div class="ctool-life-count">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-life-count-toolbar">
                <div>
                    <div class="ctool-life-count-desc">{{ $t("lifeCount_description") }}</div>
                    <div class="ctool-life-count-hint">{{ $t("lifeCount_hint") }}</div>
                </div>
                <Align>
                    <div class="ctool-life-count-field">
                        <div class="ctool-life-count-label">{{ $t("lifeCount_birth_date") }}</div>
                        <input v-model="action.current.birthDate" class="ctool-life-count-native-input" type="date" />
                    </div>
                    <div class="ctool-life-count-field">
                        <div class="ctool-life-count-label">{{ $t("lifeCount_retirement_age") }}</div>
                        <InputNumber v-model="action.current.retirementAge" :min="1" :max="100" />
                    </div>
                </Align>
            </div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <div v-if="error" class="ctool-life-count-error" :style="{ height: `${height}px` }">{{ error }}</div>
            <div v-else-if="analysis" class="ctool-life-count-layout" :style="{ height: `${height}px` }">
                <div class="ctool-life-count-left">
                    <Card :title="$t('lifeCount_past_title')" class="ctool-life-count-card">
                        <div class="ctool-life-count-stats">
                            <div v-for="item in pastStats" :key="item.key" class="ctool-life-count-stat">
                                <div class="ctool-life-count-stat-value">{{ analysis.pastTime[item.key] }}</div>
                                <div class="ctool-life-count-stat-label">{{ item.label }}</div>
                            </div>
                        </div>
                    </Card>
                    <Card :title="$t('lifeCount_remaining_title')" class="ctool-life-count-card">
                        <div class="ctool-life-count-stats">
                            <div v-for="item in pastStats" :key="item.key" class="ctool-life-count-stat">
                                <div class="ctool-life-count-stat-value">{{ analysis.remainingTime[item.key] }}</div>
                                <div class="ctool-life-count-stat-label">{{ item.label }}</div>
                            </div>
                        </div>
                    </Card>
                    <Card :title="$t('lifeCount_legend_title')" class="ctool-life-count-card">
                        <div class="ctool-life-count-legend">
                            <div v-for="item in legendItems" :key="item.key" class="ctool-life-count-legend-item">
                                <span class="ctool-life-count-legend-color" :style="{ backgroundColor: item.color }"></span>
                                <span>{{ item.label }}</span>
                                <span class="ctool-life-count-legend-value">{{ analysis.summary[item.key] }}</span>
                            </div>
                        </div>
                    </Card>
                </div>
                <Card :title="$t('lifeCount_matrix_title')" class="ctool-life-count-card">
                    <div class="ctool-life-count-matrix-wrap">
                        <div class="ctool-life-count-matrix">
                            <div
                                v-for="(item, index) in analysis.blocks"
                                :key="index"
                                class="ctool-life-count-block"
                                :style="{ backgroundColor: colorMap[item] }"
                            ></div>
                        </div>
                    </div>
                </Card>
            </div>
            <div v-else class="ctool-life-count-empty" :style="{ height: `${height}px` }">{{ $t("lifeCount_empty") }}</div>
        </HeightResize>
    </div>
</template>

<script setup lang="ts">
import { initialize, useAction } from "@/store/action";
import { onMounted, onUnmounted, watch } from "vue";
import dayjs from "dayjs";
import { analyzeLife } from "./util";

const action = useAction(await initialize({
    birthDate: "",
    retirementAge: 60,
}, { paste: false }));

let now = $ref(dayjs());

let timer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
    timer = setInterval(() => {
        now = dayjs();
    }, 1000);
});

onUnmounted(() => {
    timer && clearInterval(timer);
});

const pastStats = $computed(() => {
    return [
        { key: "years", label: $t("lifeCount_years") },
        { key: "months", label: $t("lifeCount_months") },
        { key: "days", label: $t("lifeCount_days") },
        { key: "hours", label: $t("lifeCount_hours") },
        { key: "minutes", label: $t("lifeCount_minutes") },
        { key: "seconds", label: $t("lifeCount_seconds") },
    ] as const;
});

const colorMap = {
    past: "#98c3b9",
    sleep: "#c1e8f9",
    work: "#ab9f93",
    children: "#e3a6ab",
    parents: "#7ea1b7",
    remain: "#e2e2e2",
} as const;

const legendItems = $computed(() => {
    return [
        { key: "past", color: colorMap.past, label: $t("lifeCount_legend_past") },
        { key: "sleep", color: colorMap.sleep, label: $t("lifeCount_legend_sleep") },
        { key: "work", color: colorMap.work, label: $t("lifeCount_legend_work") },
        { key: "children", color: colorMap.children, label: $t("lifeCount_legend_children") },
        { key: "parents", color: colorMap.parents, label: $t("lifeCount_legend_parents") },
        { key: "remain", color: colorMap.remain, label: $t("lifeCount_legend_remain") },
    ] as const;
});

const error = $computed(() => {
    if (!action.current.birthDate) {
        return "";
    }
    try {
        analyzeLife(action.current.birthDate, action.current.retirementAge, now);
        return "";
    } catch (error) {
        return $error(error);
    }
});

const analysis = $computed(() => {
    if (!action.current.birthDate || error) {
        return null;
    }
    return analyzeLife(action.current.birthDate, action.current.retirementAge, now);
});

watch(() => action.current, () => action.save(), { deep: true });
</script>

<style>
.ctool-life-count {
    height: 100%;
}

.ctool-life-count-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.ctool-life-count-desc {
    font-size: .95rem;
}

.ctool-life-count-hint {
    margin-top: 4px;
    font-size: .75rem;
    color: var(--ctool-info-color);
}

.ctool-life-count-field {
    min-width: 0;
}

.ctool-life-count-label {
    margin-bottom: 4px;
    font-size: .8rem;
    color: var(--ctool-info-color);
}

.ctool-life-count-native-input {
    height: var(--ctool-form-item-height);
    min-width: 180px;
}

.ctool-life-count-layout {
    display: grid;
    grid-template-columns: minmax(320px, .95fr) minmax(0, 1.05fr);
    gap: 5px;
}

.ctool-life-count-left {
    display: grid;
    grid-template-rows: repeat(3, minmax(0, auto));
    gap: 5px;
}

.ctool-life-count-card .ctool-card-body {
    height: 100%;
}

.ctool-life-count-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
}

.ctool-life-count-stat {
    padding: 10px;
    border: 1px solid var(--ctool-border-color);
    border-radius: var(--border-radius);
}

.ctool-life-count-stat-value {
    font-size: 1.1rem;
    font-weight: 600;
}

.ctool-life-count-stat-label {
    margin-top: 4px;
    font-size: .75rem;
    color: var(--ctool-info-color);
}

.ctool-life-count-legend {
    display: grid;
    gap: 8px;
}

.ctool-life-count-legend-item {
    display: grid;
    grid-template-columns: 14px 1fr auto;
    align-items: center;
    gap: 8px;
}

.ctool-life-count-legend-color {
    width: 14px;
    height: 14px;
    border-radius: 3px;
}

.ctool-life-count-legend-value {
    color: var(--ctool-info-color);
}

.ctool-life-count-matrix-wrap {
    height: 100%;
    overflow-y: auto;
}

.ctool-life-count-matrix {
    display: grid;
    grid-template-columns: repeat(20, minmax(0, 1fr));
    gap: 6px;
}

.ctool-life-count-block {
    aspect-ratio: 1 / 1;
    border-radius: 3px;
}

.ctool-life-count-error,
.ctool-life-count-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ctool-info-color);
}

@media (max-width: 960px) {
    .ctool-life-count-toolbar {
        flex-direction: column;
    }

    .ctool-life-count-layout {
        grid-template-columns: minmax(0, 1fr);
    }

    .ctool-life-count-stats {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
</style>
