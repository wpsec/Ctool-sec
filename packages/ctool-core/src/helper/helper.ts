import platform from "./platform"

const LEGACY_REPOSITORY_PREFIXES = [
    "https://github.com/baiy/ctool",
    "https://github.com/baiy/Ctool",
] as const;

const CURRENT_REPOSITORY_PREFIX = "https://github.com/wpsec/Ctool-sec";

export const normalizeExternalUrl = (url: string = "") => {
    let result = url;
    for (const prefix of LEGACY_REPOSITORY_PREFIXES) {
        if (result.startsWith(prefix)) {
            return `${CURRENT_REPOSITORY_PREFIX}${result.slice(prefix.length)}`;
        }
    }
    return result;
}

export const openUrl = (url: string = window.location.href) => {
    platform.runtime.openUrl(normalizeExternalUrl(url))
}

export const optionMap = (items: string[] | number[], prefix = "") => {
    return items.map((item: string | number) => {
        return {value: item, label: $t(`${prefix}${item}`)}
    })
}
