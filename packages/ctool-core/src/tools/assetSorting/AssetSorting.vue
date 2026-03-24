<template>
    <div class="ctool-asset-sorting">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-asset-sorting-toolbar">
                <div class="ctool-asset-sorting-intro">
                    <div class="ctool-asset-sorting-desc">{{ $t("assetSorting_description") }}</div>
                    <div class="ctool-asset-sorting-hint">{{ $t("assetSorting_root_domain_hint") }}</div>
                </div>
                <Button
                    :type="'general'"
                    :size="'small'"
                    :text="$t('main_ui_clear')"
                    :disabled="action.current.input === ''"
                    @click="action.current.input = ''"
                />
            </div>
            <div class="ctool-asset-sorting-stats">
                <div class="ctool-asset-sorting-stat" v-for="item in stats" :key="item.key">
                    <div class="ctool-asset-sorting-stat-label">{{ item.label }}</div>
                    <div class="ctool-asset-sorting-stat-value">{{ item.count }}</div>
                </div>
            </div>
        </Card>

        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <div class="ctool-asset-sorting-layout" :style="{ height: `${height}px` }">
                <Card class="ctool-asset-sorting-input-card" :title="$t('assetSorting_input_title')">
                    <div class="ctool-asset-sorting-fill">
                        <Textarea
                            :height="'100%'"
                            v-model="action.current.input"
                            :placeholder="$t('assetSorting_input_placeholder')"
                            disable-clear
                        />
                    </div>
                </Card>

                <div class="ctool-asset-sorting-output-grid">
                    <Card
                        class="ctool-asset-sorting-output-card"
                        v-for="section in sections"
                        :key="section.key"
                        :title="section.title"
                    >
                        <template #extra>
                            <Align>
                                <span class="ctool-asset-sorting-count">{{ section.items.length }}</span>
                                <Button
                                    :size="'small'"
                                    :type="'primary'"
                                    :text="$t('main_ui_copy')"
                                    :disabled="section.text === ''"
                                    @click="$copy(section.text)"
                                />
                            </Align>
                        </template>
                        <div class="ctool-asset-sorting-fill">
                            <Textarea
                                :height="'100%'"
                                :model-value="section.text"
                                :placeholder="$t('assetSorting_output_placeholder')"
                                readonly
                                disable-clear
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
import { watch } from "vue";
import { extractAssets } from "./util";

const action = useAction(await initialize({
    input: "",
}));

const result = $computed(() => extractAssets(action.current.input));

const sections = $computed(() => {
    return [
        {
            key: "urls",
            title: $t("assetSorting_urls"),
            items: result.urls,
            text: result.urls.join("\n"),
        },
        {
            key: "subdomains",
            title: $t("assetSorting_subdomains"),
            items: result.subdomains,
            text: result.subdomains.join("\n"),
        },
        {
            key: "ips",
            title: $t("assetSorting_ips"),
            items: result.ips,
            text: result.ips.join("\n"),
        },
        {
            key: "rootDomains",
            title: $t("assetSorting_root_domains"),
            items: result.rootDomains,
            text: result.rootDomains.join("\n"),
        },
    ];
});

const stats = $computed(() => {
    return sections.map(item => {
        return {
            key: item.key,
            label: item.title,
            count: item.items.length,
        };
    });
});

watch(() => action.current.input, () => {
    action.save();
});
</script>

<style>
.ctool-asset-sorting {
    height: 100%;
}

.ctool-asset-sorting-toolbar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
}

.ctool-asset-sorting-intro {
    min-width: 0;
}

.ctool-asset-sorting-desc {
    font-size: .95rem;
}

.ctool-asset-sorting-hint {
    margin-top: 4px;
    font-size: .75rem;
    color: var(--ctool-info-color);
}

.ctool-asset-sorting-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin-top: 10px;
}

.ctool-asset-sorting-stat {
    padding: 10px;
    border: 1px dashed var(--ctool-border-color);
    border-radius: var(--border-radius);
    background-color: var(--ctool-form-element-background-color);
}

.ctool-asset-sorting-stat-label {
    font-size: .75rem;
    color: var(--ctool-info-color);
}

.ctool-asset-sorting-stat-value {
    margin-top: 4px;
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.1;
}

.ctool-asset-sorting-layout {
    display: grid;
    grid-template-columns: minmax(280px, 1.05fr) minmax(0, 1.45fr);
    gap: 5px;
}

.ctool-asset-sorting-output-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px;
}

.ctool-asset-sorting-input-card,
.ctool-asset-sorting-output-grid,
.ctool-asset-sorting-output-card {
    min-height: 0;
    height: 100%;
}

.ctool-asset-sorting-input-card .ctool-card-body,
.ctool-asset-sorting-output-card .ctool-card-body {
    height: 100%;
}

.ctool-asset-sorting-fill {
    height: 100%;
}

.ctool-asset-sorting-count {
    min-width: 1.6rem;
    text-align: center;
    font-size: .875rem;
    color: var(--ctool-info-color);
}

@media (max-width: 960px) {
    .ctool-asset-sorting-stats,
    .ctool-asset-sorting-output-grid,
    .ctool-asset-sorting-layout {
        grid-template-columns: minmax(0, 1fr);
    }

    .ctool-asset-sorting-layout {
        height: auto !important;
    }
}
</style>
