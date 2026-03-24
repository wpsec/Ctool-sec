<template>
    <div class="ctool-countdown">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-countdown-toolbar">
                <div>
                    <div class="ctool-countdown-desc">{{ $t("countdown_description") }}</div>
                    <div class="ctool-countdown-hint">{{ $t("countdown_hint") }}</div>
                </div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="$t('countdown_start')" @click="submitHandle" />
                    <Button :size="'small'" :text="$t('countdown_reset')" @click="resetHandle" />
                </Align>
            </div>
            <div class="ctool-countdown-options">
                <div class="ctool-countdown-field">
                    <div class="ctool-countdown-label">{{ $t("countdown_days") }}</div>
                    <InputNumber v-model="action.current.days" :min="0" :max="365" />
                </div>
                <div class="ctool-countdown-field">
                    <div class="ctool-countdown-label">{{ $t("countdown_hours") }}</div>
                    <InputNumber v-model="action.current.hours" :min="0" :max="23" />
                </div>
                <div class="ctool-countdown-field">
                    <div class="ctool-countdown-label">{{ $t("countdown_minutes") }}</div>
                    <InputNumber v-model="action.current.minutes" :min="0" :max="59" />
                </div>
                <div class="ctool-countdown-field">
                    <div class="ctool-countdown-label">{{ $t("countdown_seconds") }}</div>
                    <InputNumber v-model="action.current.seconds" :min="0" :max="59" />
                </div>
            </div>
            <div class="ctool-countdown-presets">
                <Button
                    v-for="item in presetItems"
                    :key="item.seconds"
                    :size="'small'"
                    :text="item.label"
                    @click="presetHandle(item.seconds)"
                />
            </div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <Card :title="$t('countdown_title')">
                <div class="ctool-countdown-body" :style="{ height: `${height}px` }">
                    <div class="ctool-countdown-current">{{ $t("countdown_current_time", [currentTime]) }}</div>
                    <div class="ctool-countdown-digits">
                        <div v-for="item in durationItems" :key="item.key" class="ctool-countdown-digit">
                            <div class="ctool-countdown-digit-value">{{ `${item.value}`.padStart(2, "0") }}</div>
                            <div class="ctool-countdown-digit-label">{{ item.label }}</div>
                        </div>
                    </div>
                    <div class="ctool-countdown-status">
                        {{ duration.completed ? $t("countdown_completed") : $t("countdown_target_time", [targetTime]) }}
                    </div>
                </div>
            </Card>
        </HeightResize>
    </div>
</template>

<script setup lang="ts">
import { initialize, useAction } from "@/store/action";
import Message from "@/helper/message";
import dayjs from "dayjs";
import { onMounted, onUnmounted, watch } from "vue";
import { clampUnit, countdownPresets, createTargetTime, parseDuration } from "./util";

const action = useAction(await initialize({
    days: 0,
    hours: 0,
    minutes: 5,
    seconds: 0,
    targetTime: Date.now() + 5 * 60 * 1000,
}, { paste: false }));

let now = $ref(Date.now());
let timer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
    timer = setInterval(() => {
        now = Date.now();
    }, 200);
});

onUnmounted(() => {
    timer && clearInterval(timer);
});

const currentTime = $computed(() => dayjs(now).format("YYYY-MM-DD HH:mm:ss"));
const targetTime = $computed(() => dayjs(action.current.targetTime).format("YYYY-MM-DD HH:mm:ss"));
const duration = $computed(() => parseDuration(action.current.targetTime, now));

const durationItems = $computed(() => {
    return [
        { key: "days", label: $t("countdown_days"), value: duration.days },
        { key: "hours", label: $t("countdown_hours"), value: duration.hours },
        { key: "minutes", label: $t("countdown_minutes"), value: duration.minutes },
        { key: "seconds", label: $t("countdown_seconds"), value: duration.seconds },
    ];
});

const presetItems = $computed(() => {
    return countdownPresets.map(item => ({
        ...item,
        label: $t(`countdown_preset_${item.label}`),
    }));
});

const submitHandle = () => {
    const days = clampUnit(action.current.days, 365);
    const hours = clampUnit(action.current.hours, 23);
    const minutes = clampUnit(action.current.minutes, 59);
    const seconds = clampUnit(action.current.seconds, 59);
    if (days + hours + minutes + seconds < 1) {
        return Message.error($t("countdown_error_empty"));
    }
    action.current.days = days;
    action.current.hours = hours;
    action.current.minutes = minutes;
    action.current.seconds = seconds;
    action.current.targetTime = createTargetTime(days, hours, minutes, seconds);
    action.success({ message: "" });
};

const presetHandle = (seconds: number) => {
    action.current.days = Math.floor(seconds / 86400);
    action.current.hours = Math.floor((seconds % 86400) / 3600);
    action.current.minutes = Math.floor((seconds % 3600) / 60);
    action.current.seconds = seconds % 60;
    action.current.targetTime = Date.now() + seconds * 1000;
    action.success({ message: "" });
};

const resetHandle = () => {
    action.current.days = 0;
    action.current.hours = 0;
    action.current.minutes = 5;
    action.current.seconds = 0;
    action.current.targetTime = Date.now() + 5 * 60 * 1000;
    action.save();
};

watch(() => action.current, () => action.save(), { deep: true });
</script>

<style>
.ctool-countdown {
    height: 100%;
}

.ctool-countdown-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.ctool-countdown-desc {
    font-size: .95rem;
}

.ctool-countdown-hint {
    margin-top: 4px;
    font-size: .75rem;
    color: var(--ctool-info-color);
}

.ctool-countdown-options {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin-top: 10px;
}

.ctool-countdown-label {
    margin-bottom: 4px;
    font-size: .8rem;
    color: var(--ctool-info-color);
}

.ctool-countdown-presets {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
}

.ctool-countdown-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.ctool-countdown-current,
.ctool-countdown-status {
    color: var(--ctool-info-color);
}

.ctool-countdown-digits {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    width: 100%;
    max-width: 720px;
    margin: 24px 0;
}

.ctool-countdown-digit {
    padding: 18px 12px;
    border: 1px solid var(--ctool-border-color);
    border-radius: var(--border-radius);
    text-align: center;
}

.ctool-countdown-digit-value {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1;
}

.ctool-countdown-digit-label {
    margin-top: 8px;
    color: var(--ctool-info-color);
}

@media (max-width: 960px) {
    .ctool-countdown-toolbar {
        flex-direction: column;
    }

    .ctool-countdown-options,
    .ctool-countdown-digits {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
</style>
