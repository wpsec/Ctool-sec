<template>
    <div class="ctool-sqlite-browser">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-sqlite-browser-toolbar">
                <div>
                    <div class="ctool-sqlite-browser-desc">SQLite 本地浏览器（表预览 + 自定义 SQL）</div>
                    <div class="ctool-sqlite-browser-file" v-if="action.current.fileName">{{ action.current.fileName }}</div>
                </div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="'执行 SQL'" :disabled="!dbRef" @click="runSqlHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
            <div class="ctool-sqlite-browser-options">
                <input type="file" accept=".sqlite,.db,.sqlite3,application/octet-stream" @change="fileChangeHandle" />
                <Select
                    v-model="action.current.selectedTable"
                    :options="tableOptions"
                    :disabled="!dbRef || tableOptions.length === 0"
                    @change="tableChangeHandle"
                />
            </div>
            <div class="ctool-sqlite-browser-query">
                <Textarea
                    v-model="action.current.query"
                    :height="'80px'"
                    placeholder="输入 SQL 查询，例如: select * from sqlite_master limit 20;"
                />
            </div>
        </Card>

        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <Card :title="`结果 (${action.current.rows.length} 行)`">
                <div class="ctool-sqlite-browser-result" :style="{ height: `${height}px` }">
                    <table class="ctool-sqlite-browser-table" v-if="action.current.columns.length">
                        <thead>
                            <tr>
                                <th v-for="column in action.current.columns" :key="column">{{ column }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(row, rowIndex) in action.current.rows" :key="rowIndex">
                                <td v-for="(cell, cellIndex) in row" :key="`${rowIndex}-${cellIndex}`" :title="cell">{{ cell || "-" }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="ctool-sqlite-browser-empty" v-else>暂无结果</div>
                </div>
            </Card>
        </HeightResize>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { initialize, useAction } from "@/store/action";
import Message from "@/helper/message";
import { getTables, loadSqlJs, querySql, quoteIdentifier } from "./util";

const action = useAction(await initialize({
    fileName: "",
    tables: [] as string[],
    selectedTable: "",
    query: "",
    columns: [] as string[],
    rows: [] as string[][],
}, { paste: false }));

const dbRef = ref<any>(null);

const tableOptions = computed(() => {
    return action.current.tables.map(item => {
        return { value: item, label: item };
    });
});

const renderTablePreview = (table: string) => {
    if (!dbRef.value) {
        return;
    }
    const sql = `select * from ${quoteIdentifier(table)} limit 500;`;
    const result = querySql(dbRef.value, sql);
    action.current.query = sql;
    action.current.columns = result.columns;
    action.current.rows = result.rows;
};

const fileChangeHandle = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) {
        return;
    }

    try {
        const [buffer, SQL] = await Promise.all([file.arrayBuffer(), loadSqlJs()]);
        const db = new SQL.Database(new Uint8Array(buffer));
        const tables = getTables(db);
        action.current.fileName = file.name;
        dbRef.value = db;
        action.current.tables = tables;
        action.current.selectedTable = tables[0] || "";
        if (action.current.selectedTable) {
            renderTablePreview(action.current.selectedTable);
        }
        action.success({ message: "" });
    } catch (error) {
        Message.error(`加载 SQLite 失败: ${error instanceof Error ? error.message : String(error)}`);
    }
};

const tableChangeHandle = () => {
    if (!action.current.selectedTable) {
        return;
    }
    try {
        renderTablePreview(action.current.selectedTable);
        action.save();
    } catch (error) {
        Message.error(`预览失败: ${error instanceof Error ? error.message : String(error)}`);
    }
};

const runSqlHandle = () => {
    if (!dbRef.value) {
        return Message.error("请先加载 sqlite 文件");
    }
    if (!action.current.query.trim()) {
        return Message.error("请输入 SQL");
    }
    try {
        const result = querySql(dbRef.value, action.current.query);
        action.current.columns = result.columns;
        action.current.rows = result.rows;
        action.success({ message: "" });
    } catch (error) {
        Message.error(`SQL 执行失败: ${error instanceof Error ? error.message : String(error)}`);
    }
};

const clearHandle = () => {
    action.current.query = "";
    action.current.columns = [];
    action.current.rows = [];
    action.save();
};
</script>

<style>
.ctool-sqlite-browser {
    height: 100%;
}

.ctool-sqlite-browser-toolbar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
}

.ctool-sqlite-browser-desc {
    font-size: .95rem;
}

.ctool-sqlite-browser-file {
    margin-top: 4px;
    font-size: .8rem;
    color: var(--ctool-info-color);
    word-break: break-all;
}

.ctool-sqlite-browser-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 10px;
}

.ctool-sqlite-browser-query {
    margin-top: 10px;
}

.ctool-sqlite-browser-result {
    overflow: auto;
}

.ctool-sqlite-browser-table {
    width: 100%;
    border-collapse: collapse;
}

.ctool-sqlite-browser-table th,
.ctool-sqlite-browser-table td {
    border: 1px solid var(--ctool-border-color);
    padding: 6px 8px;
    font-size: .8rem;
    text-align: left;
    max-width: 320px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.ctool-sqlite-browser-table th {
    position: sticky;
    top: 0;
    background: var(--ctool-card-background-color);
    z-index: 1;
}

.ctool-sqlite-browser-empty {
    color: var(--ctool-info-color);
    font-size: .9rem;
}

@media (max-width: 960px) {
    .ctool-sqlite-browser-toolbar {
        flex-direction: column;
    }

    .ctool-sqlite-browser-options {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
