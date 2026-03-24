<template>
    <div class="ctool-git-reference">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-git-reference-toolbar">
                <div>
                    <div class="ctool-git-reference-desc">{{ $t("gitReference_description") }}</div>
                    <div class="ctool-git-reference-hint">{{ $t("gitReference_hint") }}</div>
                </div>
                <Align>
                    <Input
                        v-model="action.current.keyword"
                        :placeholder="$t('gitReference_search_placeholder')"
                        :width="320"
                    />
                    <Button :size="'small'" :text="$t('gitReference_clear_search')" @click="clearHandle" />
                </Align>
            </div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <Card :title="$t('gitReference_commands_title')">
                <div class="ctool-git-reference-scroll" :style="{ height: `${height}px` }">
                    <div v-if="filteredSections.length < 1 && filteredGlossary.length < 1" class="ctool-git-reference-empty">
                        {{ $t("gitReference_empty") }}
                    </div>
                    <div v-for="section in filteredSections" :key="section.id" class="ctool-git-reference-section">
                        <div class="ctool-git-reference-section-title">{{ section.title }}</div>
                        <Table :columns="columns" :lists="section.items" border>
                            <template #column="{ row }">
                                <td>
                                    <pre class="ctool-git-reference-command">{{ row.command }}</pre>
                                </td>
                                <td>{{ row.description }}</td>
                            </template>
                        </Table>
                    </div>
                    <div v-if="filteredGlossary.length > 0" class="ctool-git-reference-section">
                        <div class="ctool-git-reference-section-title">{{ $t("gitReference_glossary_title") }}</div>
                        <Table :columns="glossaryColumns" :lists="filteredGlossary" border>
                            <template #column="{ row }">
                                <td>
                                    <code>{{ row.term }}</code>
                                </td>
                                <td>{{ row.description }}</td>
                            </template>
                        </Table>
                    </div>
                </div>
            </Card>
        </HeightResize>
    </div>
</template>

<script setup lang="ts">
import { initialize, useAction } from "@/store/action";
import { watch } from "vue";
import { gitGlossary, gitReferenceSections } from "./data";

const action = useAction(await initialize({
    keyword: "",
}, { paste: false }));

const columns = $computed(() => {
    return [
        { title: $t("gitReference_command"), key: "command", width: 320 },
        { title: $t("gitReference_description_col"), key: "description" },
    ];
});

const glossaryColumns = $computed(() => {
    return [
        { title: $t("gitReference_term"), key: "term", width: 220 },
        { title: $t("gitReference_description_col"), key: "description" },
    ];
});

const normalizedKeyword = $computed(() => action.current.keyword.trim().toLowerCase());

const includesKeyword = (value: string) => {
    return value.toLowerCase().includes(normalizedKeyword);
};

const filteredSections = $computed(() => {
    if (!normalizedKeyword) {
        return gitReferenceSections;
    }
    return gitReferenceSections
        .map(section => {
            const items = section.items.filter(item => {
                return includesKeyword(section.title) || includesKeyword(item.command) || includesKeyword(item.description);
            });
            return { ...section, items };
        })
        .filter(section => section.items.length > 0);
});

const filteredGlossary = $computed(() => {
    if (!normalizedKeyword) {
        return gitGlossary;
    }
    return gitGlossary.filter(item => {
        return includesKeyword(item.term) || includesKeyword(item.description);
    });
});

const clearHandle = () => {
    action.current.keyword = "";
    action.save();
};

watch(() => action.current, () => action.save(), { deep: true });
</script>

<style>
.ctool-git-reference {
    height: 100%;
}

.ctool-git-reference-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.ctool-git-reference-desc {
    font-size: .95rem;
}

.ctool-git-reference-hint {
    margin-top: 4px;
    font-size: .75rem;
    color: var(--ctool-info-color);
}

.ctool-git-reference-scroll {
    overflow-y: auto;
}

.ctool-git-reference-section + .ctool-git-reference-section {
    margin-top: 16px;
}

.ctool-git-reference-section-title {
    margin-bottom: 8px;
    font-weight: 600;
}

.ctool-git-reference-command {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: var(--ctool-family-monospace);
    font-size: .85rem;
}

.ctool-git-reference-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--ctool-info-color);
}

@media (max-width: 960px) {
    .ctool-git-reference-toolbar {
        flex-direction: column;
    }
}
</style>
