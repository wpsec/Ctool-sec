<template>
    <div class="ctool-htpasswd">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-htpasswd-toolbar">
                <div>
                    <div class="ctool-htpasswd-desc">{{ $t("htpasswd_description") }}</div>
                    <div class="ctool-htpasswd-hint">{{ $t("htpasswd_hint") }}</div>
                </div>
                <Align>
                    <Button :size="'small'" :type="'primary'" :text="$t('htpasswd_generate')" @click="generateHandle" />
                    <Button :size="'small'" :text="$t('main_ui_clear')" @click="clearHandle" />
                </Align>
            </div>
            <div class="ctool-htpasswd-options">
                <div class="ctool-htpasswd-field">
                    <div class="ctool-htpasswd-label">{{ $t("htpasswd_username") }}</div>
                    <Input v-model="action.current.username" :placeholder="$t('htpasswd_username_placeholder')" />
                </div>
                <div class="ctool-htpasswd-field">
                    <div class="ctool-htpasswd-label">{{ $t("htpasswd_password") }}</div>
                    <Input v-model="action.current.password" :placeholder="$t('htpasswd_password_placeholder')" />
                </div>
                <div class="ctool-htpasswd-field">
                    <div class="ctool-htpasswd-label">{{ $t("htpasswd_method") }}</div>
                    <Select v-model="action.current.method" :options="methodOptions" />
                </div>
                <div class="ctool-htpasswd-field" v-if="action.current.method === 'bcrypt'">
                    <div class="ctool-htpasswd-label">{{ $t("htpasswd_bcrypt_cost") }}</div>
                    <InputNumber v-model="action.current.bcryptCost" :min="4" :max="15" />
                </div>
            </div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <div class="ctool-htpasswd-layout" :style="{ height: `${height}px` }">
                <Card :title="$t('htpasswd_output_title')" class="ctool-htpasswd-card">
                    <div class="ctool-htpasswd-fill">
                        <Textarea
                            :model-value="action.current.output"
                            :height="'100%'"
                            :placeholder="$t('htpasswd_output_placeholder')"
                            readonly
                            copy
                        />
                    </div>
                </Card>
                <Card :title="$t('htpasswd_nginx_title')" class="ctool-htpasswd-card">
                    <div class="ctool-htpasswd-fill">
                        <Textarea
                            :model-value="nginxConfig"
                            :height="'100%'"
                            :placeholder="$t('htpasswd_nginx_placeholder')"
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
import { createHtpasswdLine, HtpasswdMethod, htpasswdMethodOptions, nginxBasicAuthSnippet } from "./util";

const action = useAction(await initialize({
    username: "admin",
    password: "password123",
    method: "bcrypt" as HtpasswdMethod,
    bcryptCost: 10,
    output: "",
}, { paste: false }));

const methodOptions = $computed(() => {
    return htpasswdMethodOptions.map(item => ({
        value: item.value,
        label: $t(item.labelKey),
    }));
});

const nginxConfig = $computed(() => nginxBasicAuthSnippet);

const generateHandle = () => {
    const username = action.current.username.trim();
    const password = action.current.password;

    if (!username) {
        return Message.error($t("htpasswd_error_username"));
    }
    if (!password) {
        return Message.error($t("htpasswd_error_password"));
    }

    try {
        action.current.output = createHtpasswdLine(
            username,
            password,
            action.current.method,
            action.current.bcryptCost,
        );
        action.success({ message: "" });
    } catch (error) {
        console.error(error);
        Message.error($t("htpasswd_error_generate"));
    }
};

const clearHandle = () => {
    action.current.output = "";
    action.save();
};

if (!action.current.output) {
    generateHandle();
}

watch(() => action.current, () => action.save(), { deep: true });
</script>

<style>
.ctool-htpasswd {
    height: 100%;
}

.ctool-htpasswd-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.ctool-htpasswd-desc {
    font-size: .95rem;
}

.ctool-htpasswd-hint {
    margin-top: 4px;
    font-size: .75rem;
    color: var(--ctool-info-color);
}

.ctool-htpasswd-options {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin-top: 10px;
}

.ctool-htpasswd-field {
    min-width: 0;
}

.ctool-htpasswd-label {
    margin-bottom: 4px;
    font-size: .8rem;
    color: var(--ctool-info-color);
}

.ctool-htpasswd-layout {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px;
}

.ctool-htpasswd-card,
.ctool-htpasswd-fill {
    min-height: 0;
    height: 100%;
}

.ctool-htpasswd-card .ctool-card-body {
    height: 100%;
}

@media (max-width: 960px) {
    .ctool-htpasswd-toolbar {
        flex-direction: column;
    }

    .ctool-htpasswd-options,
    .ctool-htpasswd-layout {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
