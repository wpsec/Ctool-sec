<template>
    <div class="ctool-random-user-agent">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-random-user-agent-toolbar">
                <div>
                    <div class="ctool-random-user-agent-desc">{{ $t("randomUserAgent_description") }}</div>
                    <div class="ctool-random-user-agent-hint">{{ $t("randomUserAgent_hint") }}</div>
                </div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="$t('randomUserAgent_generate')" @click="generateHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
            <div class="ctool-random-user-agent-options">
                <div class="ctool-random-user-agent-field">
                    <div class="ctool-random-user-agent-label">{{ $t("randomUserAgent_count") }}</div>
                    <InputNumber v-model="action.current.count" :min="1" :max="200" />
                </div>
                <div class="ctool-random-user-agent-field ctool-random-user-agent-field-span">
                    <div class="ctool-random-user-agent-label">{{ $t("randomUserAgent_browsers") }}</div>
                    <Checkbox v-model="action.current.browsers" :options="browserItems" border />
                </div>
                <div class="ctool-random-user-agent-field ctool-random-user-agent-field-span">
                    <div class="ctool-random-user-agent-label">{{ $t("randomUserAgent_platforms") }}</div>
                    <Checkbox v-model="action.current.platforms" :options="platformItems" border />
                </div>
            </div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <Card :title="$t('randomUserAgent_output_title')">
                <Textarea
                    :height="`${height}px`"
                    :model-value="action.current.output"
                    :placeholder="$t('randomUserAgent_output_placeholder')"
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
import { browserOptions, generateUserAgents, platformOptions } from "./util";

const action = useAction(await initialize({
    count: 20,
    browsers: ["chrome", "edge", "firefox", "safari"],
    platforms: ["windows", "mac", "linux", "android", "ios"],
    output: "",
}, { paste: false }));

const browserItems = $computed(() => {
    return browserOptions.map(item => ({
        value: item.value,
        label: $t(`randomUserAgent_browser_${item.value}`),
    }));
});

const platformItems = $computed(() => {
    return platformOptions.map(item => ({
        value: item.value,
        label: $t(`randomUserAgent_platform_${item.value}`),
    }));
});

const generateHandle = () => {
    const count = Number.isFinite(action.current.count) ? Math.max(1, Math.floor(action.current.count)) : 0;

    if (count < 1) {
        return Message.error($t("randomUserAgent_error_count"));
    }
    if (action.current.browsers.length < 1) {
        return Message.error($t("randomUserAgent_error_browser"));
    }
    if (action.current.platforms.length < 1) {
        return Message.error($t("randomUserAgent_error_platform"));
    }
    action.current.output = generateUserAgents(
        count,
        action.current.browsers,
        action.current.platforms,
    ).join("\n");
    action.success({ message: "" });
};

const clearHandle = () => {
    action.current.output = "";
    action.save();
};

watch(() => action.current, () => action.save(), { deep: true });
</script>

<style>
.ctool-random-user-agent {
    height: 100%;
}

.ctool-random-user-agent-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.ctool-random-user-agent-desc {
    font-size: .95rem;
}

.ctool-random-user-agent-hint {
    margin-top: 4px;
    font-size: .75rem;
    color: var(--ctool-info-color);
}

.ctool-random-user-agent-options {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin-top: 10px;
}

.ctool-random-user-agent-field-span {
    grid-column: span 2;
}

.ctool-random-user-agent-label {
    margin-bottom: 4px;
    font-size: .8rem;
    color: var(--ctool-info-color);
}

@media (max-width: 960px) {
    .ctool-random-user-agent-toolbar {
        flex-direction: column;
    }

    .ctool-random-user-agent-options {
        grid-template-columns: minmax(0, 1fr);
    }

    .ctool-random-user-agent-field-span {
        grid-column: span 1;
    }
}
</style>
