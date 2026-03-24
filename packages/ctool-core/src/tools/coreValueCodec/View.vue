<template>
    <div class="ctool-core-value-codec">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-core-value-codec-toolbar">
                <div class="ctool-core-value-codec-desc">{{ $t("coreValueCodec_description") }}</div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="$t('coreValueCodec_encode')" @click="encodeHandle" />
                    <Button :size="'small'" :type="'primary'" :text="$t('coreValueCodec_decode')" @click="decodeHandle" />
                    <Button :size="'small'" :text="$t('coreValueCodec_swap')" @click="swapHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <div class="ctool-core-value-codec-layout" :style="{ height: `${height}px` }">
                <Card :title="$t('coreValueCodec_text_title')" class="ctool-core-value-codec-card">
                    <div class="ctool-core-value-codec-fill">
                        <Textarea
                            v-model="action.current.text"
                            :height="'100%'"
                            :placeholder="$t('coreValueCodec_text_placeholder')"
                            copy
                        />
                    </div>
                </Card>
                <Card :title="$t('coreValueCodec_value_title')" class="ctool-core-value-codec-card">
                    <div class="ctool-core-value-codec-fill">
                        <Textarea
                            v-model="action.current.value"
                            :height="'100%'"
                            :placeholder="$t('coreValueCodec_value_placeholder')"
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
import { decodeCoreValue, encodeCoreValue } from "./util";

const action = useAction(await initialize({
    text: "",
    value: "",
}, { paste: false }));

const encodeHandle = () => {
    if (!action.current.text.trim()) {
        return Message.error($t("coreValueCodec_error_text_empty"));
    }
    try {
        action.current.value = encodeCoreValue(action.current.text);
        action.success({ message: "" });
    } catch (error) {
        console.error(error);
        Message.error($t("coreValueCodec_error_encode"));
    }
};

const decodeHandle = () => {
    if (!action.current.value.trim()) {
        return Message.error($t("coreValueCodec_error_value_empty"));
    }
    try {
        action.current.text = decodeCoreValue(action.current.value);
        action.success({ message: "" });
    } catch (error) {
        console.error(error);
        Message.error($t("coreValueCodec_error_decode"));
    }
};

const swapHandle = () => {
    const { text, value } = action.current;
    action.current.text = value;
    action.current.value = text;
    action.save();
};

const clearHandle = () => {
    action.current.text = "";
    action.current.value = "";
    action.save();
};

watch(() => action.current, () => action.save(), { deep: true });
</script>

<style>
.ctool-core-value-codec {
    height: 100%;
}

.ctool-core-value-codec-toolbar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
}

.ctool-core-value-codec-desc {
    font-size: .95rem;
}

.ctool-core-value-codec-layout {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px;
}

.ctool-core-value-codec-card,
.ctool-core-value-codec-fill {
    min-height: 0;
    height: 100%;
}

.ctool-core-value-codec-card .ctool-card-body {
    height: 100%;
}

@media (max-width: 960px) {
    .ctool-core-value-codec-toolbar {
        flex-direction: column;
    }

    .ctool-core-value-codec-layout {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
