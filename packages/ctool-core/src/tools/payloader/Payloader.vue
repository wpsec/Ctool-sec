<template>
    <div class="ctool-payloader">
        <Card class="ctool-payloader-header">
            <div class="ctool-payloader-header-row">
                <input
                    class="ctool-payloader-search"
                    v-model="searchQuery"
                    :placeholder="$t(`payloader_search_placeholder`)"
                />
                <div class="ctool-payloader-segment">
                    <button
                        class="ctool-payloader-segment-item"
                        :class="{ active: activeTab === 'payloads' }"
                        @click="activeTab = 'payloads'"
                    >
                        {{ $t("payloader_tab_payloads") }}
                    </button>
                    <button
                        class="ctool-payloader-segment-item"
                        :class="{ active: activeTab === 'tools' }"
                        @click="activeTab = 'tools'"
                    >
                        {{ $t("payloader_tab_tools") }}
                    </button>
                </div>
                <div class="ctool-payloader-mode">
                    <span class="ctool-payloader-mode-label">{{ $t("payloader_mode") }}</span>
                    <button
                        class="ctool-payloader-mode-item"
                        :class="{ active: bypassMode === 'normal' }"
                        @click="bypassMode = 'normal'"
                    >
                        {{ $t("payloader_mode_normal") }}
                    </button>
                    <button
                        class="ctool-payloader-mode-item"
                        :class="{ active: bypassMode === 'waf' }"
                        @click="bypassMode = 'waf'"
                    >
                        {{ $t("payloader_mode_waf") }}
                    </button>
                    <button
                        class="ctool-payloader-mode-item"
                        :class="{ active: bypassMode === 'edr' }"
                        @click="bypassMode = 'edr'"
                    >
                        {{ $t("payloader_mode_edr") }}
                    </button>
                </div>
                <button class="ctool-payloader-vars-btn" @click="showVariables = !showVariables">
                    {{ $t("payloader_variables") }}
                </button>
            </div>
            <div class="ctool-payloader-vars" v-if="showVariables">
                <div class="ctool-payloader-vars-item" v-for="variable in globalVariables" :key="variable.key">
                    <div class="ctool-payloader-vars-top">
                        <span class="ctool-payloader-vars-key">{{ "{" + variable.key + "}" }}</span>
                        <span class="ctool-payloader-vars-desc">{{ text(variable.description) }}</span>
                    </div>
                    <input class="ctool-payloader-vars-input" v-model="variable.value" />
                </div>
            </div>
        </Card>

        <div class="ctool-payloader-main">
            <Card
                class="ctool-payloader-list-card"
                :title="activeTab === 'payloads' ? $t(`payloader_tab_payloads`) : $t(`payloader_tab_tools`)"
            >
                <template #extra>{{ listCount }}</template>
                <div class="ctool-payloader-list" v-if="activeTab === 'payloads'">
                    <button
                        class="ctool-payloader-list-item"
                        :class="{ active: selectedPayloadId === item.id }"
                        v-for="item in filteredPayloads"
                        :key="item.id"
                        @click="selectedPayloadId = item.id"
                    >
                        <div class="ctool-payloader-list-item-title">{{ text(item.name) }}</div>
                        <div class="ctool-payloader-list-item-meta">
                            {{ text(item.category) }}<template v-if="item.subCategory"> / {{ text(item.subCategory) }}</template>
                        </div>
                    </button>
                    <div class="ctool-payloader-list-empty" v-if="filteredPayloads.length === 0">
                        {{ $t("payloader_no_result") }}
                    </div>
                </div>
                <div class="ctool-payloader-list" v-else>
                    <button
                        class="ctool-payloader-list-item"
                        :class="{ active: selectedToolId === item.id }"
                        v-for="item in filteredTools"
                        :key="item.id"
                        @click="selectedToolId = item.id"
                    >
                        <div class="ctool-payloader-list-item-title">{{ text(item.name) }}</div>
                        <div class="ctool-payloader-list-item-meta">{{ text(item.category) }}</div>
                    </button>
                    <div class="ctool-payloader-list-empty" v-if="filteredTools.length === 0">
                        {{ $t("payloader_no_result") }}
                    </div>
                </div>
            </Card>

            <Card class="ctool-payloader-detail-card" :title="$t(`payloader_detail`)">
                <div class="ctool-payloader-detail" v-if="activeTab === 'payloads' && selectedPayload">
                    <h3 class="ctool-payloader-title">{{ text(selectedPayload.name) }}</h3>
                    <p class="ctool-payloader-desc">{{ text(selectedPayload.description) }}</p>

                    <div class="ctool-payloader-meta">
                        <div>{{ $t("payloader_category") }}: {{ text(selectedPayload.category) }}</div>
                        <div v-if="selectedPayload.subCategory">
                            {{ $t("payloader_subcategory") }}: {{ text(selectedPayload.subCategory) }}
                        </div>
                    </div>

                    <div class="ctool-payloader-tags" v-if="selectedPayload.tags?.length">
                        <span class="ctool-payloader-tag" v-for="tag in selectedPayload.tags" :key="tag">{{ tag }}</span>
                    </div>

                    <div class="ctool-payloader-section" v-if="selectedPayload.prerequisites?.length">
                        <h4>{{ $t("payloader_prerequisites") }}</h4>
                        <ul class="ctool-payloader-list-ul">
                            <li v-for="item in selectedPayload.prerequisites" :key="text(item)">
                                {{ text(item) }}
                            </li>
                        </ul>
                    </div>

                    <div class="ctool-payloader-section">
                        <h4>{{ $t("payloader_commands") }}</h4>
                        <div class="ctool-payloader-fallback" v-if="payloadModeFallback !== ''">
                            {{ payloadModeFallback }}
                        </div>
                        <div class="ctool-payloader-command" v-for="(command, index) in payloadCommands" :key="index">
                            <div class="ctool-payloader-command-top">
                                <div class="ctool-payloader-command-title">
                                    {{ text(command.title) }}
                                </div>
                                <button
                                    class="ctool-payloader-copy"
                                    @click="copyCommand(command.command)"
                                >
                                    {{ $t("payloader_copy") }}
                                </button>
                            </div>
                            <div class="ctool-payloader-command-desc" v-if="command.description">
                                {{ text(command.description) }}
                            </div>
                            <pre><code>{{ replaceVariables(command.command) }}</code></pre>
                        </div>
                    </div>

                    <div class="ctool-payloader-section" v-if="selectedPayload.opsecTips?.length">
                        <h4>{{ $t("payloader_opsec") }}</h4>
                        <ul class="ctool-payloader-list-ul">
                            <li v-for="item in selectedPayload.opsecTips" :key="text(item)">
                                {{ text(item) }}
                            </li>
                        </ul>
                    </div>

                    <div class="ctool-payloader-section" v-if="selectedPayload.references?.length">
                        <h4>{{ $t("payloader_references") }}</h4>
                        <ul class="ctool-payloader-list-ul">
                            <li v-for="link in selectedPayload.references" :key="link">
                                <a :href="link" target="_blank" rel="noopener noreferrer">{{ link }}</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="ctool-payloader-detail" v-else-if="activeTab === 'tools' && selectedTool">
                    <h3 class="ctool-payloader-title">{{ text(selectedTool.name) }}</h3>
                    <p class="ctool-payloader-desc">{{ text(selectedTool.description) }}</p>
                    <div class="ctool-payloader-meta">
                        <div>{{ $t("payloader_category") }}: {{ text(selectedTool.category) }}</div>
                    </div>

                    <div class="ctool-payloader-section" v-if="selectedTool.installation">
                        <h4>{{ $t("payloader_installation") }}</h4>
                        <div class="ctool-payloader-command">
                            <div class="ctool-payloader-command-top">
                                <div class="ctool-payloader-command-title">{{ $t("payloader_installation") }}</div>
                                <button class="ctool-payloader-copy" @click="copyCommand(text(selectedTool.installation))">
                                    {{ $t("payloader_copy") }}
                                </button>
                            </div>
                            <pre><code>{{ replaceVariables(text(selectedTool.installation)) }}</code></pre>
                        </div>
                    </div>

                    <div class="ctool-payloader-section">
                        <h4>{{ $t("payloader_commands") }}</h4>
                        <div class="ctool-payloader-command" v-for="(command, index) in selectedTool.commands" :key="index">
                            <div class="ctool-payloader-command-top">
                                <div class="ctool-payloader-command-title">
                                    {{ text(command.name) }}
                                </div>
                                <button
                                    class="ctool-payloader-copy"
                                    @click="copyCommand(command.command)"
                                >
                                    {{ $t("payloader_copy") }}
                                </button>
                            </div>
                            <div class="ctool-payloader-command-desc">{{ text(command.description) }}</div>
                            <pre><code>{{ replaceVariables(command.command) }}</code></pre>
                        </div>
                    </div>

                    <div class="ctool-payloader-section" v-if="selectedTool.references?.length">
                        <h4>{{ $t("payloader_references") }}</h4>
                        <ul class="ctool-payloader-list-ul">
                            <li v-for="link in selectedTool.references" :key="link">
                                <a :href="link" target="_blank" rel="noopener noreferrer">{{ link }}</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="ctool-payloader-detail-empty" v-else>
                    {{ $t("payloader_no_result_detail") }}
                </div>
            </Card>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import useSetting from "@/store/setting";
import { DEFAULT_LOCALE } from "@/i18n";
import { copy } from "@/helper/clipboard";
import type { I18nText, PayloadExecution, PayloadItem, ToolCommand } from "../../../../../Payloader/src/types";
import { webPayloads } from "../../../../../Payloader/src/data/webPayloads";
import { intranetPayloads } from "../../../../../Payloader/src/data/intranetPayloads";
import { toolCommands } from "../../../../../Payloader/src/data/toolCommands";

type ActiveTab = "payloads" | "tools";
type BypassMode = "normal" | "waf" | "edr";
type DisplayLang = "zh" | "en";

interface GlobalVariable {
    key: string;
    value: string;
    description: I18nText;
}

const setting = useSetting();
const activeTab = ref<ActiveTab>("payloads");
const bypassMode = ref<BypassMode>("normal");
const searchQuery = ref("");
const showVariables = ref(false);

const globalVariables = ref<GlobalVariable[]>([
    { key: "TARGET_IP", value: "192.168.1.100", description: { zh: "目标IP地址", en: "Target IP Address" } },
    { key: "TARGET_DOMAIN", value: "target.com", description: { zh: "目标域名", en: "Target Domain" } },
    { key: "ATTACKER_IP", value: "10.10.14.5", description: { zh: "攻击者IP", en: "Attacker IP" } },
    { key: "USERNAME", value: "admin", description: { zh: "用户名", en: "Username" } },
    { key: "PASSWORD", value: "password123", description: { zh: "密码", en: "Password" } },
    { key: "DOMAIN", value: "corp.local", description: { zh: "域名", en: "Domain" } },
]);

const payloadSource: PayloadItem[] = [...webPayloads, ...intranetPayloads];
const toolSource: ToolCommand[] = toolCommands;

const locale = computed<DisplayLang>(() => {
    const currentLocale = setting.items.locale === "_default" ? DEFAULT_LOCALE : setting.items.locale;
    return currentLocale === "en" ? "en" : "zh";
});

const textByLang = (value: I18nText | undefined | null, lang: DisplayLang): string => {
    if (value === undefined || value === null) {
        return "";
    }
    if (typeof value === "string") {
        return value;
    }
    return lang === "en" ? value.en || value.zh : value.zh || value.en;
};

const text = (value: I18nText | undefined | null): string => {
    return textByLang(value, locale.value);
};

const buildPayloadSearchString = (item: PayloadItem, lang: DisplayLang): string => {
    const parts: string[] = [
        textByLang(item.name, lang),
        textByLang(item.description, lang),
        textByLang(item.category, lang),
        textByLang(item.subCategory, lang),
        ...(item.tags || []),
    ];
    (item.prerequisites || []).forEach(prerequisite => {
        parts.push(textByLang(prerequisite, lang));
    });
    (item.execution || []).forEach(execution => {
        parts.push(textByLang(execution.title, lang), textByLang(execution.description, lang), execution.command || "");
    });
    (item.wafBypass || []).forEach(execution => {
        parts.push(textByLang(execution.title, lang), textByLang(execution.description, lang), execution.command || "");
    });
    (item.edrBypass || []).forEach(execution => {
        parts.push(textByLang(execution.title, lang), textByLang(execution.description, lang), execution.command || "");
    });
    return parts.join(" ").toLowerCase();
};

const buildToolSearchString = (item: ToolCommand, lang: DisplayLang): string => {
    const parts: string[] = [textByLang(item.name, lang), textByLang(item.description, lang), textByLang(item.category, lang)];
    item.commands.forEach(command => {
        parts.push(textByLang(command.name, lang), textByLang(command.description, lang), command.command || "");
    });
    return parts.join(" ").toLowerCase();
};

const payloadSearchIndex = payloadSource.map(item => {
    return {
        item,
        zh: buildPayloadSearchString(item, "zh"),
        en: buildPayloadSearchString(item, "en"),
    };
});

const toolSearchIndex = toolSource.map(item => {
    return {
        item,
        zh: buildToolSearchString(item, "zh"),
        en: buildToolSearchString(item, "en"),
    };
});

const selectedPayloadId = ref<string>(payloadSource[0]?.id || "");
const selectedToolId = ref<string>(toolSource[0]?.id || "");

const normalizedQuery = computed(() => searchQuery.value.trim().toLowerCase());

const filteredPayloads = computed<PayloadItem[]>(() => {
    const query = normalizedQuery.value;
    if (query === "") {
        return payloadSource;
    }
    const lang = locale.value;
    return payloadSearchIndex.filter(item => item[lang].includes(query)).map(item => item.item);
});

const filteredTools = computed<ToolCommand[]>(() => {
    const query = normalizedQuery.value;
    if (query === "") {
        return toolSource;
    }
    const lang = locale.value;
    return toolSearchIndex.filter(item => item[lang].includes(query)).map(item => item.item);
});

watch(
    filteredPayloads,
    (items) => {
        if (!items.find(item => item.id === selectedPayloadId.value)) {
            selectedPayloadId.value = items[0]?.id || "";
        }
    },
    { immediate: true },
);

watch(
    filteredTools,
    (items) => {
        if (!items.find(item => item.id === selectedToolId.value)) {
            selectedToolId.value = items[0]?.id || "";
        }
    },
    { immediate: true },
);

const selectedPayload = computed<PayloadItem | null>(() => {
    return filteredPayloads.value.find(item => item.id === selectedPayloadId.value) || null;
});

const selectedTool = computed<ToolCommand | null>(() => {
    return filteredTools.value.find(item => item.id === selectedToolId.value) || null;
});

const payloadCommands = computed<PayloadExecution[]>(() => {
    const payload = selectedPayload.value;
    if (!payload) {
        return [];
    }
    if (bypassMode.value === "waf" && payload.wafBypass && payload.wafBypass.length > 0) {
        return payload.wafBypass;
    }
    if (bypassMode.value === "edr" && payload.edrBypass && payload.edrBypass.length > 0) {
        return payload.edrBypass;
    }
    return payload.execution || [];
});

const payloadModeFallback = computed(() => {
    const payload = selectedPayload.value;
    if (!payload || bypassMode.value === "normal") {
        return "";
    }
    const hasModePayload =
        (bypassMode.value === "waf" && payload.wafBypass && payload.wafBypass.length > 0) ||
        (bypassMode.value === "edr" && payload.edrBypass && payload.edrBypass.length > 0);
    if (hasModePayload) {
        return "";
    }
    const modeName = bypassMode.value === "waf" ? $t("payloader_mode_waf") : $t("payloader_mode_edr");
    return $t("payloader_mode_fallback", [modeName, $t("payloader_mode_normal")]);
});

const listCount = computed(() => {
    return activeTab.value === "payloads" ? filteredPayloads.value.length : filteredTools.value.length;
});

const replaceVariables = (command: string) => {
    return globalVariables.value.reduce((result, variable) => {
        return result.replace(new RegExp(`\\{${variable.key}\\}`, "g"), variable.value);
    }, command);
};

const copyCommand = (command: string) => {
    const content = replaceVariables(command);
    copy(content);
};
</script>

<style scoped>
.ctool-payloader {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 5px;
    overflow: hidden;
}

.ctool-payloader-header {
    flex: none;
}

.ctool-payloader-header-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.ctool-payloader-search {
    flex: 1;
    min-width: 230px;
    margin-bottom: 0;
    height: 34px;
}

.ctool-payloader-segment {
    display: inline-flex;
    border: 1px solid var(--ctool-border-color);
    border-radius: var(--ctool-radius-size);
    overflow: hidden;
}

.ctool-payloader-segment-item {
    margin: 0;
    border-radius: 0;
    border-width: 0;
    border-right: 1px solid var(--ctool-border-color);
    padding: 0.3rem 0.8rem;
    background: var(--ctool-form-element-background-color);
    color: var(--ctool-info-color);
}

.ctool-payloader-segment-item:last-child {
    border-right: 0;
}

.ctool-payloader-segment-item.active {
    background: var(--ctool-primary);
    border-color: var(--ctool-primary);
    color: #fff;
}

.ctool-payloader-mode {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
}

.ctool-payloader-mode-label {
    font-size: 0.8rem;
    color: var(--ctool-info-color);
}

.ctool-payloader-mode-item {
    margin: 0;
    padding: 0.2rem 0.6rem;
    border: 1px dashed var(--ctool-border-color);
    border-radius: var(--ctool-radius-size);
    background: var(--ctool-form-element-background-color);
    color: var(--ctool-info-color);
    font-size: 0.78rem;
}

.ctool-payloader-mode-item.active {
    border-color: var(--ctool-primary);
    color: var(--ctool-primary);
}

.ctool-payloader-vars-btn {
    margin-left: auto;
    margin-bottom: 0;
    padding: 0.3rem 0.8rem;
    font-size: 0.85rem;
}

.ctool-payloader-vars {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px dashed var(--ctool-border-color);
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
}

.ctool-payloader-vars-item {
    background: var(--ctool-block-title-bg-color);
    border-radius: var(--ctool-radius-size);
    border: 1px solid var(--ctool-border-color);
    padding: 8px;
}

.ctool-payloader-vars-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 6px;
}

.ctool-payloader-vars-key {
    font-family: monospace;
    font-size: 0.75rem;
    color: var(--ctool-primary);
}

.ctool-payloader-vars-desc {
    font-size: 0.75rem;
    color: var(--ctool-info-color);
}

.ctool-payloader-vars-input {
    margin-bottom: 0;
    height: 30px;
}

.ctool-payloader-main {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: minmax(280px, 28%) minmax(0, 1fr);
    gap: 5px;
}

.ctool-payloader-list-card,
.ctool-payloader-detail-card {
    min-height: 0;
}

.ctool-payloader-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 100%;
    overflow: auto;
    padding-right: 4px;
}

.ctool-payloader-list-item {
    width: 100%;
    margin: 0;
    text-align: left;
    border: 1px solid var(--ctool-border-color);
    border-radius: var(--ctool-radius-size);
    background: var(--ctool-form-element-background-color);
    padding: 8px;
}

.ctool-payloader-list-item.active {
    border-color: var(--ctool-primary);
    background: var(--ctool-block-title-bg-color);
}

.ctool-payloader-list-item-title {
    font-size: 0.86rem;
    color: var(--color);
    line-height: 1.35;
}

.ctool-payloader-list-item-meta {
    margin-top: 2px;
    font-size: 0.74rem;
    color: var(--ctool-info-color);
}

.ctool-payloader-list-empty {
    color: var(--ctool-info-color);
    text-align: center;
    padding: 16px 8px;
    font-size: 0.85rem;
}

.ctool-payloader-detail {
    height: 100%;
    overflow: auto;
    padding-right: 4px;
}

.ctool-payloader-detail-empty {
    color: var(--ctool-info-color);
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.9rem;
}

.ctool-payloader-title {
    margin-bottom: 6px;
    font-size: 1rem;
}

.ctool-payloader-desc {
    margin-bottom: 8px;
    color: var(--ctool-info-color);
    font-size: 0.85rem;
    line-height: 1.5;
}

.ctool-payloader-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 0.8rem;
    color: var(--ctool-info-color);
    margin-bottom: 8px;
}

.ctool-payloader-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 8px;
}

.ctool-payloader-tag {
    border: 1px dashed var(--ctool-border-color);
    border-radius: 999px;
    padding: 2px 8px;
    font-size: 0.72rem;
    color: var(--ctool-info-color);
}

.ctool-payloader-section {
    margin-bottom: 12px;
}

.ctool-payloader-section h4 {
    margin-bottom: 6px;
    font-size: 0.9rem;
}

.ctool-payloader-fallback {
    margin-bottom: 8px;
    padding: 6px 8px;
    border-radius: var(--ctool-radius-size);
    border: 1px dashed var(--ctool-border-color);
    color: var(--ctool-info-color);
    font-size: 0.78rem;
}

.ctool-payloader-command {
    border: 1px solid var(--ctool-border-color);
    border-radius: var(--ctool-radius-size);
    margin-bottom: 8px;
    overflow: hidden;
}

.ctool-payloader-command-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background: var(--ctool-block-title-bg-color);
    border-bottom: 1px solid var(--ctool-border-color);
}

.ctool-payloader-command-title {
    font-size: 0.85rem;
    font-weight: 600;
}

.ctool-payloader-copy {
    margin: 0;
    font-size: 0.74rem;
    padding: 0.18rem 0.5rem;
    border: 1px solid var(--ctool-border-color);
    background: var(--ctool-form-element-background-color);
    border-radius: var(--ctool-radius-size);
    color: var(--ctool-info-color);
}

.ctool-payloader-command-desc {
    padding: 8px;
    font-size: 0.78rem;
    color: var(--ctool-info-color);
}

.ctool-payloader-command pre {
    margin: 0;
    padding: 8px;
    border-top: 1px dashed var(--ctool-border-color);
    overflow: auto;
    background: var(--ctool-form-element-background-color);
}

.ctool-payloader-command code {
    font-size: 0.76rem;
    font-family: monospace;
    white-space: pre-wrap;
    word-break: break-word;
}

.ctool-payloader-list-ul {
    margin: 0;
    padding-left: 18px;
    color: var(--ctool-info-color);
    font-size: 0.82rem;
}

.ctool-payloader-list-ul li {
    margin-bottom: 4px;
}

@media (max-width: 980px) {
    .ctool-payloader-main {
        grid-template-columns: 1fr;
        grid-template-rows: minmax(180px, 34%) minmax(0, 1fr);
    }

    .ctool-payloader-vars {
        grid-template-columns: 1fr;
    }
}
</style>
