<template>
    <div class="ctool-eat-what">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-eat-what-toolbar">
                <div>
                    <div class="ctool-eat-what-desc">{{ $t("eatWhat_description") }}</div>
                    <div class="ctool-eat-what-hint">{{ $t("eatWhat_hint", [candidateCount]) }}</div>
                </div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="$t('eatWhat_pick')" @click="pickHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <div class="ctool-eat-what-layout" :style="{ height: `${height}px` }">
                <Card :title="$t('eatWhat_input_title')" class="ctool-eat-what-card">
                    <div class="ctool-eat-what-fill">
                        <Textarea
                            v-model="action.current.input"
                            :height="'100%'"
                            :placeholder="$t('eatWhat_input_placeholder')"
                        />
                    </div>
                </Card>
                <Card :title="$t('eatWhat_output_title')" class="ctool-eat-what-card">
                    <div class="ctool-eat-what-result">
                        <div class="ctool-eat-what-result-text">{{ action.current.output || $t("eatWhat_output_placeholder") }}</div>
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
import { defaultFoodText, getFoodCandidates, pickRandomFood } from "./util";

const action = useAction(await initialize({
    input: defaultFoodText,
    output: "",
}, { paste: false }));

const candidateCount = $computed(() => getFoodCandidates(action.current.input).length);

const pickHandle = () => {
    if (candidateCount < 1) {
        return Message.error($t("eatWhat_error_empty"));
    }
    action.current.output = pickRandomFood(action.current.input);
    action.success({ message: "" });
};

const clearHandle = () => {
    action.current.output = "";
    action.save();
};

watch(() => action.current, () => action.save(), { deep: true });
</script>

<style>
.ctool-eat-what {
    height: 100%;
}

.ctool-eat-what-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.ctool-eat-what-desc {
    font-size: .95rem;
}

.ctool-eat-what-hint {
    margin-top: 4px;
    font-size: .75rem;
    color: var(--ctool-info-color);
}

.ctool-eat-what-layout {
    display: grid;
    grid-template-columns: minmax(280px, 1fr) minmax(0, .9fr);
    gap: 5px;
}

.ctool-eat-what-card,
.ctool-eat-what-fill {
    min-height: 0;
    height: 100%;
}

.ctool-eat-what-card .ctool-card-body {
    height: 100%;
}

.ctool-eat-what-result {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 20px;
}

.ctool-eat-what-result-text {
    text-align: center;
    font-size: 2rem;
    font-weight: 700;
    line-height: 1.4;
    word-break: break-word;
}

@media (max-width: 960px) {
    .ctool-eat-what-toolbar {
        flex-direction: column;
    }

    .ctool-eat-what-layout {
        grid-template-columns: minmax(0, 1fr);
    }

    .ctool-eat-what-result-text {
        font-size: 1.5rem;
    }
}
</style>
