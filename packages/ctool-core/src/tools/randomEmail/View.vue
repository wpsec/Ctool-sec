<template>
    <div class="ctool-random-email">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-random-email-toolbar">
                <div>
                    <div class="ctool-random-email-desc">{{ $t("randomEmail_description") }}</div>
                    <div class="ctool-random-email-hint">{{ $t("randomEmail_hint") }}</div>
                </div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="$t('randomEmail_generate')" @click="generateHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
            <div class="ctool-random-email-options">
                <div class="ctool-random-email-field">
                    <div class="ctool-random-email-label">{{ $t("randomEmail_count") }}</div>
                    <InputNumber v-model="action.current.count" :min="1" :max="200" />
                </div>
                <div class="ctool-random-email-field">
                    <div class="ctool-random-email-label">{{ $t("randomEmail_min_length") }}</div>
                    <InputNumber v-model="action.current.minLength" :min="1" :max="64" />
                </div>
                <div class="ctool-random-email-field">
                    <div class="ctool-random-email-label">{{ $t("randomEmail_max_length") }}</div>
                    <InputNumber v-model="action.current.maxLength" :min="1" :max="64" />
                </div>
                <div class="ctool-random-email-field">
                    <div class="ctool-random-email-label">{{ $t("randomEmail_suffix") }}</div>
                    <Input v-model="action.current.suffix" :placeholder="$t('randomEmail_suffix_placeholder')" />
                </div>
                <div class="ctool-random-email-field ctool-random-email-field-span">
                    <div class="ctool-random-email-label">{{ $t("randomEmail_charset") }}</div>
                    <Checkbox v-model="action.current.characterSets" :options="charsetOptions" border />
                </div>
                <div class="ctool-random-email-field ctool-random-email-field-span">
                    <div class="ctool-random-email-label">{{ $t("randomEmail_custom_chars") }}</div>
                    <Input v-model="action.current.customChars" :placeholder="$t('randomEmail_custom_chars_placeholder')" />
                </div>
            </div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <Card :title="$t('randomEmail_output_title')">
                <Textarea
                    :height="`${height}px`"
                    :model-value="action.current.output"
                    :placeholder="$t('randomEmail_output_placeholder')"
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
import { buildCharset, characterGroups, generateEmails } from "./util";

const action = useAction(await initialize({
    count: 10,
    minLength: 8,
    maxLength: 16,
    suffix: "gmail.com",
    characterSets: ["number", "lowercase"],
    customChars: "",
    output: "",
}, { paste: false }));

const charsetOptions = $computed(() => {
    return characterGroups.map(item => {
        return {
            value: item.value,
            label: $t(`randomEmail_charset_${item.value}`),
        };
    });
});

const generateHandle = () => {
    const suffix = action.current.suffix.trim().replace(/^@+/, "");
    const charset = buildCharset(action.current.characterSets, action.current.customChars);
    const count = Number.isFinite(action.current.count) ? Math.max(1, Math.floor(action.current.count)) : 0;
    const minLength = Number.isFinite(action.current.minLength) ? Math.max(1, Math.floor(action.current.minLength)) : 0;
    const maxLength = Number.isFinite(action.current.maxLength) ? Math.max(1, Math.floor(action.current.maxLength)) : 0;

    if (count < 1 || minLength < 1 || maxLength < 1) {
        return Message.error($t("randomEmail_error_number"));
    }
    if (minLength > maxLength) {
        return Message.error($t("randomEmail_error_length"));
    }
    if (!suffix) {
        return Message.error($t("randomEmail_error_suffix"));
    }
    if (!charset) {
        return Message.error($t("randomEmail_error_charset"));
    }

    action.current.suffix = suffix;
    action.current.output = generateEmails(
        count,
        minLength,
        maxLength,
        suffix,
        charset,
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
.ctool-random-email {
    height: 100%;
}

.ctool-random-email-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.ctool-random-email-desc {
    font-size: .95rem;
}

.ctool-random-email-hint {
    margin-top: 4px;
    font-size: .75rem;
    color: var(--ctool-info-color);
}

.ctool-random-email-options {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin-top: 10px;
}

.ctool-random-email-field {
    min-width: 0;
}

.ctool-random-email-field-span {
    grid-column: span 2;
}

.ctool-random-email-label {
    margin-bottom: 4px;
    font-size: .8rem;
    color: var(--ctool-info-color);
}

@media (max-width: 960px) {
    .ctool-random-email-toolbar {
        flex-direction: column;
    }

    .ctool-random-email-options {
        grid-template-columns: minmax(0, 1fr);
    }

    .ctool-random-email-field-span {
        grid-column: span 1;
    }
}
</style>
