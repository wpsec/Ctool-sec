<template>
    <div class="ctool-random-ip-generator">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-random-ip-generator-toolbar">
                <div>
                    <div class="ctool-random-ip-generator-desc">{{ $t("randomIpGenerator_description") }}</div>
                    <div class="ctool-random-ip-generator-hint">{{ $t("randomIpGenerator_hint") }}</div>
                </div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="$t('randomIpGenerator_generate')" @click="generateHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
            <div class="ctool-random-ip-generator-options">
                <div class="ctool-random-ip-generator-label">{{ $t("randomIpGenerator_count") }}</div>
                <InputNumber v-model="action.current.count" :min="1" :max="200" />
            </div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <Card :title="$t('randomIpGenerator_output_title')">
                <Textarea
                    :height="`${height}px`"
                    :model-value="action.current.output"
                    :placeholder="$t('randomIpGenerator_output_placeholder')"
                    readonly
                    copy
                />
            </Card>
        </HeightResize>
    </div>
</template>

<script setup lang="ts">
import { initialize, useAction } from "@/store/action";
import Message from "@/helper/message";
import { watch } from "vue";
import { generateRandomIpv4List } from "./util";

const action = useAction(await initialize({
    count: 24,
    output: "",
}, { paste: false }));

const generateHandle = () => {
    const count = Number.isFinite(action.current.count) ? Math.max(1, Math.floor(action.current.count)) : 0;
    if (count < 1) {
        return Message.error($t("randomIpGenerator_error_count"));
    }
    action.current.output = generateRandomIpv4List(count).join("\n");
    action.success({ message: "" });
};

const clearHandle = () => {
    action.current.output = "";
    action.save();
};

if (!action.current.output) {
    action.current.output = generateRandomIpv4List(action.current.count).join("\n");
}

watch(() => action.current, () => action.save(), { deep: true });
</script>

<style>
.ctool-random-ip-generator {
    height: 100%;
}

.ctool-random-ip-generator-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.ctool-random-ip-generator-desc {
    font-size: .95rem;
}

.ctool-random-ip-generator-hint {
    margin-top: 4px;
    font-size: .75rem;
    color: var(--ctool-info-color);
}

.ctool-random-ip-generator-options {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
}

.ctool-random-ip-generator-label {
    font-size: .8rem;
    color: var(--ctool-info-color);
}

@media (max-width: 960px) {
    .ctool-random-ip-generator-toolbar,
    .ctool-random-ip-generator-options {
        flex-direction: column;
        align-items: flex-start;
    }
}
</style>
