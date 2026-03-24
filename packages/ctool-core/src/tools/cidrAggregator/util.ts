import { Netmask } from "netmask";
import ip6 from "ip6";

export type CidrAggregatorIpKind = "both" | "ipv4" | "ipv6";

interface Interval {
    start: bigint;
    end: bigint;
}

export interface CidrAggregatorResult {
    ipv4Ranges: string[];
    ipv6Ranges: string[];
    invalidTokens: string[];
    inputCount: number;
    acceptedCount: number;
    mergedCount: number;
}

const ipv4ReservedCidrs = [
    "0.0.0.0/8",
    "10.0.0.0/8",
    "100.64.0.0/10",
    "127.0.0.0/8",
    "169.254.0.0/16",
    "172.16.0.0/12",
    "192.0.0.0/24",
    "192.0.2.0/24",
    "192.168.0.0/16",
    "198.18.0.0/15",
    "198.51.100.0/24",
    "203.0.113.0/24",
    "224.0.0.0/4",
    "240.0.0.0/4",
    "255.255.255.255/32",
];

const ipv6ReservedCidrs = [
    "::/128",
    "::1/128",
    "::ffff:0:0/96",
    "64:ff9b::/96",
    "100::/64",
    "2001::/32",
    "2001:2::/48",
    "2001:db8::/32",
    "2001:10::/28",
    "fc00::/7",
    "fe80::/10",
    "ff00::/8",
];

const tokenizeInput = (input: string) => {
    return input
        .split(/[\s,]+/g)
        .map(item => item.trim())
        .filter(Boolean);
};

const ipv4ToBigInt = (value: string) => {
    return value.split(".").reduce((result, item) => {
        return (result << 8n) + BigInt(Number.parseInt(item, 10));
    }, 0n);
};

const bigIntToIpv4 = (value: bigint) => {
    return [
        Number((value >> 24n) & 255n),
        Number((value >> 16n) & 255n),
        Number((value >> 8n) & 255n),
        Number(value & 255n),
    ].join(".");
};

const normalizeIpv6MappedIpv4 = (value: string) => {
    const matched = value.match(/^(.*:)(\d{1,3}(?:\.\d{1,3}){3})$/);
    if (!matched) {
        return value;
    }

    const prefix = matched[1];
    const octets = matched[2].split(".").map(item => Number.parseInt(item, 10));
    if (octets.length !== 4 || octets.some(item => Number.isNaN(item) || item < 0 || item > 255)) {
        throw new Error("invalid ipv6");
    }

    const high = ((octets[0] << 8) | octets[1]).toString(16);
    const low = ((octets[2] << 8) | octets[3]).toString(16);
    return `${prefix}${high}:${low}`;
};

const normalizeIpv6Address = (value: string) => {
    let address = value.trim();
    if (address.startsWith("[") && address.endsWith("]")) {
        address = address.slice(1, -1);
    }

    const zoneIndex = address.indexOf("%");
    if (zoneIndex !== -1) {
        address = address.slice(0, zoneIndex);
    }

    address = normalizeIpv6MappedIpv4(address);
    ip6.validate(address);
    return ip6.normalize(address);
};

const normalizeIpv6ToBigInt = (normalizedValue: string) => {
    return normalizedValue.split(":").reduce((result, item) => {
        return (result << 16n) + BigInt(Number.parseInt(item, 16));
    }, 0n);
};

const ipv6ToBigInt = (value: string) => {
    return normalizeIpv6ToBigInt(normalizeIpv6Address(value));
};

const bigIntToIpv6 = (value: bigint) => {
    const groups: string[] = [];
    for (let index = 0; index < 8; index++) {
        const shift = BigInt((7 - index) * 16);
        groups.push(((value >> shift) & 0xffffn).toString(16).padStart(4, "0"));
    }
    return ip6.abbreviate(groups.join(":"));
};

const maskBits = (value: bigint, bits: number, prefix: number) => {
    if (prefix <= 0) {
        return 0n;
    }
    const suffix = BigInt(bits - prefix);
    return (value >> suffix) << suffix;
};

const parseIpv4Token = (token: string): Interval => {
    const block = new Netmask(token.includes("/") ? token : `${token}/32`);
    return {
        start: ipv4ToBigInt(block.base),
        end: ipv4ToBigInt(block.broadcast || block.base),
    };
};

const parseIpv6Token = (token: string): Interval => {
    const parts = token.split("/");
    if (parts.length > 2) {
        throw new Error("invalid ipv6");
    }
    const [addressRaw, prefixRaw] = parts;
    const address = addressRaw.trim();
    const prefixText = prefixRaw === undefined ? undefined : prefixRaw.trim();
    const prefix = prefixText === undefined ? 128 : Number.parseInt(prefixText, 10);

    if (!address || (prefixText !== undefined && !/^\d+$/.test(prefixText)) || !Number.isInteger(prefix) || prefix < 0 || prefix > 128) {
        throw new Error("invalid ipv6");
    }

    let value = 0n;
    try {
        value = ipv6ToBigInt(address);
    } catch {
        throw new Error("invalid ipv6");
    }
    const start = maskBits(value, 128, prefix);
    const size = 1n << BigInt(128 - prefix);

    return {
        start,
        end: start + size - 1n,
    };
};

const mergeIntervals = (items: Interval[]) => {
    if (items.length < 2) {
        return items;
    }

    const sorted = items.slice().sort((prev, next) => {
        if (prev.start === next.start) {
            return prev.end < next.end ? -1 : 1;
        }
        return prev.start < next.start ? -1 : 1;
    });

    const merged: Interval[] = [sorted[0]];
    for (let index = 1; index < sorted.length; index++) {
        const current = sorted[index];
        const last = merged[merged.length - 1];

        if (current.start <= last.end + 1n) {
            last.end = current.end > last.end ? current.end : last.end;
            continue;
        }
        merged.push({ ...current });
    }

    return merged;
};

const rangeToCidrs = (startValue: bigint, end: bigint, bits: number, stringify: (value: bigint) => string) => {
    const result: string[] = [];
    let start = startValue;

    while (start <= end) {
        let prefix = bits;

        while (prefix > 0) {
            const nextPrefix = prefix - 1;
            const blockSize = 1n << BigInt(bits - nextPrefix);
            if (start % blockSize !== 0n) {
                break;
            }
            if (start + blockSize - 1n > end) {
                break;
            }
            prefix = nextPrefix;
        }

        result.push(`${stringify(start)}/${prefix}`);
        start += 1n << BigInt(bits - prefix);
    }

    return result;
};

const reservedIpv4Ranges = ipv4ReservedCidrs.map(parseIpv4Token);
const reservedIpv6Ranges = ipv6ReservedCidrs.map(parseIpv6Token);

const isReserved = (value: Interval, reservedRanges: Interval[]) => {
    return reservedRanges.some(item => value.start >= item.start && value.end <= item.end);
};

export const aggregateCidrs = (
    input: string,
    ipKind: CidrAggregatorIpKind,
    excludeReserved: boolean,
): CidrAggregatorResult => {
    const tokens = tokenizeInput(input);
    const invalidTokens: string[] = [];
    const ipv4Intervals: Interval[] = [];
    const ipv6Intervals: Interval[] = [];

    for (const token of tokens) {
        try {
            if (token.includes(":")) {
                if (ipKind === "ipv4") {
                    continue;
                }
                const interval = parseIpv6Token(token);
                if (!excludeReserved || !isReserved(interval, reservedIpv6Ranges)) {
                    ipv6Intervals.push(interval);
                }
                continue;
            }

            if (ipKind === "ipv6") {
                continue;
            }

            const interval = parseIpv4Token(token);
            if (!excludeReserved || !isReserved(interval, reservedIpv4Ranges)) {
                ipv4Intervals.push(interval);
            }
        } catch (error) {
            console.error(error);
            invalidTokens.push(token);
        }
    }

    const mergedIpv4 = mergeIntervals(ipv4Intervals);
    const mergedIpv6 = mergeIntervals(ipv6Intervals);
    const ipv4Ranges = mergedIpv4.flatMap(item => rangeToCidrs(item.start, item.end, 32, bigIntToIpv4));
    const ipv6Ranges = mergedIpv6.flatMap(item => rangeToCidrs(item.start, item.end, 128, bigIntToIpv6));

    return {
        ipv4Ranges,
        ipv6Ranges,
        invalidTokens,
        inputCount: tokens.length,
        acceptedCount: ipv4Intervals.length + ipv6Intervals.length,
        mergedCount: ipv4Ranges.length + ipv6Ranges.length,
    };
};
