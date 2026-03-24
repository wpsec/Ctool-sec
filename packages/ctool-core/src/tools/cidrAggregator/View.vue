<template>
    <div class="ctool-cidr-aggregator">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-cidr-aggregator-toolbar">
                <div>
                    <div class="ctool-cidr-aggregator-desc">{{ $t("cidrAggregator_description") }}</div>
                    <div class="ctool-cidr-aggregator-hint">{{ $t("cidrAggregator_hint") }}</div>
                </div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="$t('cidrAggregator_aggregate')" @click="aggregateHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
            <div class="ctool-cidr-aggregator-options">
                <div class="ctool-cidr-aggregator-field ctool-cidr-aggregator-span">
                    <div class="ctool-cidr-aggregator-label">{{ $t("cidrAggregator_ip_kind") }}</div>
                    <Radio v-model="action.current.ipKind" :options="ipKindOptions" />
                </div>
                <div class="ctool-cidr-aggregator-field">
                    <div class="ctool-cidr-aggregator-label">{{ $t("cidrAggregator_reserved") }}</div>
                    <Bool v-model="action.current.excludeReserved" border :label="$t('cidrAggregator_reserved_label')" />
                </div>
                <div class="ctool-cidr-aggregator-summary">
                    <div>{{ $t("cidrAggregator_input_count", [action.current.inputCount]) }}</div>
                    <div>{{ $t("cidrAggregator_accepted_count", [action.current.acceptedCount]) }}</div>
                    <div>{{ $t("cidrAggregator_output_count", [action.current.mergedCount]) }}</div>
                </div>
            </div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <div class="ctool-cidr-aggregator-layout" :style="{ height: `${height}px` }">
                <Card :title="$t('cidrAggregator_input_title')" class="ctool-cidr-aggregator-card">
                    <div class="ctool-cidr-aggregator-fill">
                        <Textarea
                            v-model="action.current.input"
                            :height="'100%'"
                            :placeholder="$t('cidrAggregator_input_placeholder')"
                        />
                    </div>
                </Card>
                <div class="ctool-cidr-aggregator-output">
                    <Card :title="$t('cidrAggregator_output_title')" class="ctool-cidr-aggregator-card">
                        <div class="ctool-cidr-aggregator-fill">
                            <Textarea
                                :model-value="action.current.output"
                                :height="'100%'"
                                :placeholder="$t('cidrAggregator_output_placeholder')"
                                readonly
                                copy
                            />
                        </div>
                    </Card>
                    <Card :title="$t('cidrAggregator_invalid_title')" class="ctool-cidr-aggregator-card">
                        <div class="ctool-cidr-aggregator-fill">
                            <Textarea
                                :model-value="action.current.invalid"
                                :height="'100%'"
                                :placeholder="$t('cidrAggregator_invalid_placeholder')"
                                readonly
                                copy
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
import Message from "@/helper/message";
import { watch } from "vue";
import { aggregateCidrs, CidrAggregatorIpKind } from "./util";

const sampleInput = [
    "1.1.1.0/25",
    "1.1.1.128/25",
    "1.1.2.1",
    "2606:4700:4700::/126",
    "2606:4700:4700::4/126",
].join("\n");

const action = useAction(await initialize({
    input: sampleInput,
    ipKind: "both" as CidrAggregatorIpKind,
    excludeReserved: false,
    output: "",
    invalid: "",
    inputCount: 0,
    acceptedCount: 0,
    mergedCount: 0,
}, { paste: false }));

const ipKindOptions = $computed(() => {
    return [
        { value: "both", label: $t("cidrAggregator_ip_kind_both") },
        { value: "ipv4", label: $t("cidrAggregator_ip_kind_ipv4") },
        { value: "ipv6", label: $t("cidrAggregator_ip_kind_ipv6") },
    ];
});

const aggregateHandle = () => {
    if (!action.current.input.trim()) {
        return Message.error($t("cidrAggregator_error_empty"));
    }

    const result = aggregateCidrs(
        action.current.input,
        action.current.ipKind,
        action.current.excludeReserved,
    );

    action.current.output = [
        action.current.ipKind !== "ipv6" ? result.ipv4Ranges.join("\n") : "",
        action.current.ipKind !== "ipv4" ? result.ipv6Ranges.join("\n") : "",
    ].filter(Boolean).join("\n");
    action.current.invalid = result.invalidTokens.join("\n");
    action.current.inputCount = result.inputCount;
    action.current.acceptedCount = result.acceptedCount;
    action.current.mergedCount = result.mergedCount;
    action.success({ message: "" });
};

const clearHandle = () => {
    action.current.output = "";
    action.current.invalid = "";
    action.current.inputCount = 0;
    action.current.acceptedCount = 0;
    action.current.mergedCount = 0;
    action.save();
};

if (!action.current.output) {
    aggregateHandle();
}

watch(() => action.current, () => action.save(), { deep: true });
</script>

<style>
.ctool-cidr-aggregator {
    height: 100%;
}

.ctool-cidr-aggregator-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.ctool-cidr-aggregator-desc {
    font-size: .95rem;
}

.ctool-cidr-aggregator-hint {
    margin-top: 4px;
    font-size: .75rem;
    color: var(--ctool-info-color);
}

.ctool-cidr-aggregator-options {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin-top: 10px;
}

.ctool-cidr-aggregator-span {
    grid-column: span 2;
}

.ctool-cidr-aggregator-label {
    margin-bottom: 4px;
    font-size: .8rem;
    color: var(--ctool-info-color);
}

.ctool-cidr-aggregator-summary {
    display: grid;
    align-content: end;
    gap: 4px;
    font-size: .85rem;
    color: var(--ctool-info-color);
}

.ctool-cidr-aggregator-layout {
    display: grid;
    grid-template-columns: minmax(320px, 1fr) minmax(320px, 1fr);
    gap: 5px;
}

.ctool-cidr-aggregator-output {
    display: grid;
    grid-template-rows: minmax(0, 1fr) minmax(160px, .6fr);
    gap: 5px;
    min-height: 0;
}

.ctool-cidr-aggregator-card,
.ctool-cidr-aggregator-fill {
    min-height: 0;
    height: 100%;
}

.ctool-cidr-aggregator-card .ctool-card-body {
    height: 100%;
}

@media (max-width: 960px) {
    .ctool-cidr-aggregator-toolbar,
    .ctool-cidr-aggregator-options,
    .ctool-cidr-aggregator-layout,
    .ctool-cidr-aggregator-output {
        grid-template-columns: minmax(0, 1fr);
        flex-direction: column;
    }

    .ctool-cidr-aggregator-span {
        grid-column: span 1;
    }
}
</style>
