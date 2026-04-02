import { toASCII } from "punycode/";

export interface AssetSortingResult {
    urls: string[]
    subdomains: string[]
    ips: string[]
    rootDomains: string[]
}

const MULTI_PART_PUBLIC_SUFFIXES = new Set([
    "ac.cn",
    "ac.id",
    "ac.in",
    "ac.jp",
    "ac.kr",
    "ac.nz",
    "ac.uk",
    "ac.za",
    "asn.au",
    "biz.tr",
    "club.tw",
    "co.id",
    "co.in",
    "co.jp",
    "co.kr",
    "co.nz",
    "co.uk",
    "co.za",
    "com.au",
    "com.br",
    "com.cn",
    "com.hk",
    "com.mx",
    "com.my",
    "com.sg",
    "com.tr",
    "com.tw",
    "edu.au",
    "edu.br",
    "edu.cn",
    "edu.hk",
    "edu.in",
    "edu.my",
    "edu.sg",
    "edu.tw",
    "edu.za",
    "firm.in",
    "game.tw",
    "gen.in",
    "go.id",
    "go.jp",
    "go.kr",
    "gob.mx",
    "gov.au",
    "gov.br",
    "gov.cn",
    "gov.hk",
    "gov.in",
    "gov.my",
    "gov.sg",
    "gov.uk",
    "govt.nz",
    "gov.za",
    "gr.jp",
    "id.au",
    "idv.hk",
    "idv.tw",
    "ind.in",
    "iwi.nz",
    "lg.jp",
    "maori.nz",
    "mil.id",
    "mil.in",
    "mil.kr",
    "mil.tw",
    "mil.za",
    "ne.jp",
    "ne.kr",
    "net.au",
    "net.br",
    "net.cn",
    "net.hk",
    "net.in",
    "net.mx",
    "net.my",
    "net.nz",
    "net.sg",
    "net.tr",
    "net.tw",
    "net.za",
    "nic.in",
    "or.id",
    "or.jp",
    "or.kr",
    "org.au",
    "org.br",
    "org.cn",
    "org.hk",
    "org.in",
    "org.mx",
    "org.my",
    "org.nz",
    "org.sg",
    "org.tr",
    "org.tw",
    "org.uk",
    "org.za",
    "per.sg",
    "pol.tr",
    "res.in",
    "sch.id",
    "sch.uk",
    "tsk.tr",
    "web.id",
]);

const COMMON_SECOND_LEVEL_REGISTRIES = new Set([
    "ac",
    "co",
    "com",
    "edu",
    "firm",
    "gen",
    "go",
    "gob",
    "gov",
    "id",
    "idv",
    "mil",
    "ne",
    "net",
    "nic",
    "or",
    "org",
    "res",
    "sch",
    "web",
]);

const URL_REGEXP = /\b(?:(?:https?|ftp|ws|wss):\/\/)[^\s<>"'`]+/gi;
const TOKEN_REGEXP = /[^\s<>"'`]+/gu;
const EDGE_TRIM_REGEXP = /^[\s"'`([{<,;]+|[\s"'`)\]}>.,;]+$/g;

const dedupePush = (target: string[], seen: Set<string>, value: string) => {
    if (value === "" || seen.has(value)) {
        return;
    }
    seen.add(value);
    target.push(value);
};

const cleanEdge = (value: string) => {
    return value.replace(EDGE_TRIM_REGEXP, "").trim();
};

const trimTrailingUrlPunctuation = (value: string) => {
    const pairMap: Record<string, string> = {
        ")": "(",
        "]": "[",
        "}": "{",
    };

    let current = value;
    while (current.length > 0) {
        const last = current[current.length - 1];
        if (".,;:'\"".includes(last)) {
            current = current.slice(0, -1);
            continue;
        }
        if (!(last in pairMap)) {
            break;
        }
        const open = pairMap[last];
        const openCount = current.split(open).length - 1;
        const closeCount = current.split(last).length - 1;
        if (closeCount > openCount) {
            current = current.slice(0, -1);
            continue;
        }
        break;
    }
    return current;
};

const normalizeHost = (value: string) => {
    let current = cleanEdge(value)
        .replace(/^\*\./, "")
        .replace(/^\.+/, "")
        .replace(/\.+$/, "")
        .trim();

    if (current.startsWith("[") && current.endsWith("]")) {
        current = current.slice(1, -1);
    }

    if (current === "") {
        return "";
    }

    try {
        current = toASCII(current);
    } catch (_) {
    }

    return current.toLowerCase();
};

const isValidIPv4 = (value: string) => {
    const parts = value.split(".");
    if (parts.length !== 4) {
        return false;
    }
    return parts.every(part => {
        if (!/^\d{1,3}$/.test(part)) {
            return false;
        }
        const num = Number(part);
        return num >= 0 && num <= 255;
    });
};

const isValidIPv6 = (value: string) => {
    const current = value.toLowerCase();
    if (!current.includes(":") || current.includes(":::") || !/^[0-9a-f:.]+$/i.test(current)) {
        return false;
    }
    if ((current.match(/::/g) || []).length > 1) {
        return false;
    }

    const hasIpv4Tail = current.includes(".");
    let main = current;
    if (hasIpv4Tail) {
        const lastColonIndex = current.lastIndexOf(":");
        if (lastColonIndex < 0) {
            return false;
        }
        const ipv4Tail = current.slice(lastColonIndex + 1);
        if (!isValidIPv4(ipv4Tail)) {
            return false;
        }
        main = current.slice(0, lastColonIndex);
    }

    const groups = main.split(":");
    if (current.includes("::")) {
        if (groups.length > (hasIpv4Tail ? 7 : 8)) {
            return false;
        }
    } else {
        if (groups.some(group => group === "")) {
            return false;
        }
        if (groups.length !== (hasIpv4Tail ? 6 : 8)) {
            return false;
        }
    }

    return groups.filter(group => group !== "").every(group => /^[0-9a-f]{1,4}$/i.test(group));
};

const isValidDomain = (value: string) => {
    if (value === "" || value.length > 253 || value.includes("..")) {
        return false;
    }
    if (isValidIPv4(value) || isValidIPv6(value)) {
        return false;
    }

    const labels = value.split(".");
    if (labels.length < 2) {
        return false;
    }

    const tld = labels[labels.length - 1];
    if (!/^(?:[a-z]{2,63}|xn--[a-z0-9-]{2,59})$/i.test(tld)) {
        return false;
    }

    return labels.every(label => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label));
};

const getRootDomain = (host: string) => {
    const labels = host.split(".");
    if (labels.length < 2) {
        return "";
    }

    const tld = labels[labels.length - 1];
    const secondLevel = labels[labels.length - 2];
    const suffix = `${secondLevel}.${tld}`;
    const shouldUseThreeLabels =
        labels.length > 2
        && (
            MULTI_PART_PUBLIC_SUFFIXES.has(suffix)
            || (tld.length === 2 && COMMON_SECOND_LEVEL_REGISTRIES.has(secondLevel))
        );

    return labels.slice(shouldUseThreeLabels ? -3 : -2).join(".");
};

const extractHostCandidate = (token: string) => {
    let current = cleanEdge(token);
    if (current === "") {
        return "";
    }

    if (current.includes("@")) {
        current = current.slice(current.lastIndexOf("@") + 1);
    }

    current = current.split(/[/?#]/, 1)[0];

    if (current.startsWith("[")) {
        const closeIndex = current.indexOf("]");
        if (closeIndex !== -1) {
            return current.slice(0, closeIndex + 1);
        }
    }

    const colonCount = (current.match(/:/g) || []).length;
    if (colonCount === 1) {
        const [host, port] = current.split(":");
        if (/^\d+$/.test(port || "")) {
            current = host;
        }
    }

    return current;
};

export const extractAssets = (input: string): AssetSortingResult => {
    const result: AssetSortingResult = {
        urls: [],
        subdomains: [],
        ips: [],
        rootDomains: [],
    };

    const seen = {
        urls: new Set<string>(),
        subdomains: new Set<string>(),
        ips: new Set<string>(),
        rootDomains: new Set<string>(),
    };

    const registerHost = (rawHost: string) => {
        const host = normalizeHost(rawHost);
        if (host === "") {
            return;
        }

        if (isValidIPv4(host) || isValidIPv6(host)) {
            dedupePush(result.ips, seen.ips, host);
            return;
        }

        if (!isValidDomain(host)) {
            return;
        }

        const rootDomain = getRootDomain(host);
        if (rootDomain === "") {
            return;
        }

        dedupePush(result.rootDomains, seen.rootDomains, rootDomain);
        if (host !== rootDomain) {
            dedupePush(result.subdomains, seen.subdomains, host);
        }
    };

    const urlMatches = input.match(URL_REGEXP) || [];
    urlMatches.forEach(rawUrl => {
        const cleanUrl = trimTrailingUrlPunctuation(rawUrl);
        if (cleanUrl === "") {
            return;
        }
        dedupePush(result.urls, seen.urls, cleanUrl);
        try {
            registerHost(new URL(cleanUrl).hostname);
        } catch (_) {
        }
    });

    const residue = input.replace(URL_REGEXP, " ");
    const tokens = residue.match(TOKEN_REGEXP) || [];
    tokens.forEach(token => {
        const hostCandidate = extractHostCandidate(token);
        if (hostCandidate !== "") {
            registerHost(hostCandidate);
        }
    });

    return result;
};
