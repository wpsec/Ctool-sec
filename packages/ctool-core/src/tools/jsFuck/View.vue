<template>
    <div class="ctool-js-fuck">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-js-fuck-toolbar">
                <div class="ctool-js-fuck-desc">{{ $t("jsFuck_description") }}</div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="$t('jsFuck_encode')" @click="encodeHandle" />
                    <Button :size="'small'" :type="'primary'" :text="$t('jsFuck_decode')" @click="decodeHandle" />
                    <Button :size="'small'" :text="$t('jsFuck_swap')" @click="swapHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
            <div class="ctool-js-fuck-options">
                <label class="ctool-js-fuck-option-item">
                    <input type="checkbox" v-model="action.current.wrapWithEval" />
                    <span>{{ $t("jsFuck_wrap_eval") }}</span>
                </label>
            </div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <div class="ctool-js-fuck-layout" :style="{ height: `${height}px` }">
                <Card :title="$t('jsFuck_input_title')" class="ctool-js-fuck-card">
                    <div class="ctool-js-fuck-fill">
                        <Textarea
                            v-model="action.current.input"
                            :height="'100%'"
                            :placeholder="$t('jsFuck_input_placeholder')"
                            copy
                        />
                    </div>
                </Card>
                <Card :title="$t('jsFuck_output_title')" class="ctool-js-fuck-card">
                    <div class="ctool-js-fuck-fill">
                        <Textarea
                            v-model="action.current.output"
                            :height="'100%'"
                            :placeholder="$t('jsFuck_output_placeholder')"
                            copy
                        />
                    </div>
                </Card>
            </div>
        </HeightResize>
    </div>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { initialize, useAction } from "@/store/action";
import Message from "@/helper/message";
import { decodeJsFuck, encodeJsFuck } from "./util";

const action = useAction(await initialize({
    input: "",
    output: "",
    wrapWithEval: false,
}, { paste: false }));

const encodeHandle = () => {
    if (!action.current.input.trim()) {
        return Message.error($t("jsFuck_error_input_empty"));
    }
    action.current.output = encodeJsFuck(action.current.input, action.current.wrapWithEval);
    action.success({ message: "" });
};

const decodeHandle = () => {
    if (!action.current.input.trim()) {
        return Message.error($t("jsFuck_error_input_empty"));
    }
    try {
        action.current.output = decodeJsFuck(action.current.input);
        action.success({ message: "" });
    } catch (error) {
        Message.error(`${$t("jsFuck_error_decode_failed")}: ${error instanceof Error ? error.message : String(error)}`);
    }
};

const swapHandle = () => {
    const { input, output } = action.current;
    action.current.input = output;
    action.current.output = input;
    action.save();
};

const clearHandle = () => {
    action.current.input = "";
    action.current.output = "";
    action.save();
};

watch(() => action.current, () => action.save(), { deep: true });
</script>

<style>
.ctool-js-fuck {
    height: 100%;
}

.ctool-js-fuck-toolbar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
}

.ctool-js-fuck-desc {
    font-size: .95rem;
}

.ctool-js-fuck-options {
    margin-top: 10px;
}

.ctool-js-fuck-option-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: .85rem;
}

.ctool-js-fuck-layout {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px;
}

.ctool-js-fuck-card,
.ctool-js-fuck-fill {
    min-height: 0;
    height: 100%;
}

.ctool-js-fuck-card .ctool-card-body {
    height: 100%;
}

@media (max-width: 960px) {
    .ctool-js-fuck-toolbar,
    .ctool-js-fuck-layout {
        grid-template-columns: minmax(0, 1fr);
        flex-direction: column;
    }
}
</style>
