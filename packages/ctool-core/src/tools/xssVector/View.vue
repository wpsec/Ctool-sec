<template>
    <div class="ctool-xss-vector">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-xss-vector-toolbar">
                <div class="ctool-xss-vector-desc">{{ $t("xssVector_description") }}</div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="$t('xssVector_generate')" @click="generateHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <div class="ctool-xss-vector-layout" :style="{ height: `${height}px` }">
                <Card :title="$t('xssVector_input_title')" class="ctool-xss-vector-card">
                    <div class="ctool-xss-vector-fill">
                        <Textarea
                            v-model="action.current.input"
                            :height="'100%'"
                            :placeholder="$t('xssVector_input_placeholder')"
                        />
                    </div>
                </Card>
                <Card :title="$t('xssVector_output_title')" class="ctool-xss-vector-card">
                    <div class="ctool-xss-vector-fill">
                        <Textarea
                            :model-value="action.current.output"
                            :height="'100%'"
                            :placeholder="$t('xssVector_output_placeholder')"
                            readonly
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
import { generateXssVectors } from "./util";

const action = useAction(await initialize({
    input: "alert()",
    output: "",
}, { paste: false }));

const generateHandle = () => {
    if (!action.current.input.trim()) {
        return Message.error($t("xssVector_error_empty"));
    }
    action.current.output = generateXssVectors(action.current.input.trim()).join("\n\n");
    action.success({ message: "" });
};

const clearHandle = () => {
    action.current.output = "";
    action.save();
};

if (!action.current.output) {
    action.current.output = generateXssVectors(action.current.input).join("\n\n");
}

watch(() => action.current, () => action.save(), { deep: true });
</script>

<style>
.ctool-xss-vector {
    height: 100%;
}

.ctool-xss-vector-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.ctool-xss-vector-desc {
    font-size: .95rem;
}

.ctool-xss-vector-layout {
    display: grid;
    grid-template-columns: minmax(280px, 1fr) minmax(0, 1.2fr);
    gap: 5px;
}

.ctool-xss-vector-card,
.ctool-xss-vector-fill {
    min-height: 0;
    height: 100%;
}

.ctool-xss-vector-card .ctool-card-body {
    height: 100%;
}

@media (max-width: 960px) {
    .ctool-xss-vector-toolbar {
        flex-direction: column;
    }

    .ctool-xss-vector-layout {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
