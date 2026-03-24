<template>
    <div class="ctool-dir-tree">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-dir-tree-toolbar">
                <div>
                    <div class="ctool-dir-tree-desc">{{ $t("dirTree_description") }}</div>
                    <div class="ctool-dir-tree-hint">
                        {{ action.current.folderName ? $t("dirTree_selected_folder", [action.current.folderName]) : $t("dirTree_local_hint") }}
                    </div>
                </div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="$t('dirTree_select_folder')" @click="folderInput?.click()" />
                    <Button :size="'small'" :type="'primary'" :text="$t('dirTree_generate')" @click="generateHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
            <div style="display: none;">
                <input ref="folderInput" type="file" multiple webkitdirectory directory @change="handleFolderChange" />
            </div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <div class="ctool-dir-tree-layout" :style="{ height: `${height}px` }">
                <div class="ctool-dir-tree-left">
                    <Card :title="$t('dirTree_paths_title')" class="ctool-dir-tree-card">
                        <div class="ctool-dir-tree-fill">
                            <Textarea
                                v-model="action.current.paths"
                                :height="'100%'"
                                :placeholder="$t('dirTree_paths_placeholder')"
                                disable-clear
                            />
                        </div>
                    </Card>
                    <Card :title="$t('dirTree_exclude_title')" class="ctool-dir-tree-card">
                        <div class="ctool-dir-tree-fill">
                            <Textarea
                                v-model="action.current.exclude"
                                :height="'100%'"
                                :placeholder="$t('dirTree_exclude_placeholder')"
                                disable-clear
                            />
                        </div>
                    </Card>
                </div>
                <Card :title="$t('dirTree_output_title')" class="ctool-dir-tree-card">
                    <div class="ctool-dir-tree-fill">
                        <Textarea
                            :model-value="action.current.output"
                            :height="'100%'"
                            :placeholder="$t('dirTree_output_placeholder')"
                            readonly
                            copy
                            disable-clear
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
import { buildTreeText } from "./util";

const action = useAction(await initialize({
    paths: "",
    exclude: "",
    output: "",
    folderName: "",
}, { paste: false }));

const folderInput = $ref<HTMLInputElement | null>(null);

const handleFolderChange = () => {
    const files = folderInput?.files;
    if (!files || files.length < 1) {
        return;
    }
    action.current.paths = Array.from(files)
        .map(file => file.webkitRelativePath || file.name)
        .join("\n");
    action.current.folderName = files[0].webkitRelativePath.split("/")[0] || "";
    action.save();
};

const generateHandle = () => {
    if (!action.current.paths.trim()) {
        return Message.error($t("dirTree_error_empty"));
    }
    const result = buildTreeText(action.current.paths, action.current.exclude);
    action.current.output = result || $t("dirTree_output_empty");
    action.success({ message: "" });
};

const clearHandle = () => {
    action.current.paths = "";
    action.current.exclude = "";
    action.current.output = "";
    action.current.folderName = "";
    if (folderInput) {
        folderInput.value = "";
    }
    action.save();
};

watch(() => action.current, () => action.save(), { deep: true });
</script>

<style>
.ctool-dir-tree {
    height: 100%;
}

.ctool-dir-tree-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.ctool-dir-tree-desc {
    font-size: .95rem;
}

.ctool-dir-tree-hint {
    margin-top: 4px;
    font-size: .75rem;
    color: var(--ctool-info-color);
}

.ctool-dir-tree-layout {
    display: grid;
    grid-template-columns: minmax(280px, 1fr) minmax(0, 1fr);
    gap: 5px;
}

.ctool-dir-tree-left {
    display: grid;
    grid-template-rows: minmax(0, 1fr) 150px;
    gap: 5px;
}

.ctool-dir-tree-card,
.ctool-dir-tree-fill {
    min-height: 0;
    height: 100%;
}

.ctool-dir-tree-card .ctool-card-body {
    height: 100%;
}

@media (max-width: 960px) {
    .ctool-dir-tree-toolbar {
        flex-direction: column;
    }

    .ctool-dir-tree-layout {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
