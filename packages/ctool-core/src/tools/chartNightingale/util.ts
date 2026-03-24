import { chartPalette, clampNumber, escapeXml, parseObjectExpression } from "../chartShared/util";

export interface NightingaleItem {
    name: string;
    value: number;
    color: string;
}

export const parseNightingaleData = (input: string): NightingaleItem[] => {
    const raw = parseObjectExpression<Record<string, number>>(input);
    const entries = Object.entries(raw);
    if (entries.length < 1) {
        throw new Error("empty data");
    }

    return entries.map(([name, value], index) => {
        const numberValue = Number(value);
        if (!Number.isFinite(numberValue) || numberValue < 0) {
            throw new Error(`invalid value: ${name}`);
        }
        return {
            name,
            value: numberValue,
            color: chartPalette[index % chartPalette.length],
        };
    });
};

const polarPoint = (cx: number, cy: number, radius: number, angle: number) => {
    return {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
    };
};

const describeArcPath = (
    cx: number,
    cy: number,
    innerRadius: number,
    outerRadius: number,
    startAngle: number,
    endAngle: number,
) => {
    const outerStart = polarPoint(cx, cy, outerRadius, startAngle);
    const outerEnd = polarPoint(cx, cy, outerRadius, endAngle);
    const innerEnd = polarPoint(cx, cy, innerRadius, endAngle);
    const innerStart = polarPoint(cx, cy, innerRadius, startAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

    return [
        `M ${outerStart.x} ${outerStart.y}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
        `L ${innerEnd.x} ${innerEnd.y}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
        "Z",
    ].join(" ");
};

export const createNightingaleSvg = (
    title: string,
    data: NightingaleItem[],
    labelShow: boolean,
    legendShow: boolean,
) => {
    const width = 920;
    const height = 560;
    const centerX = width / 2;
    const centerY = height / 2 + 10;
    const innerRadius = 58;
    const maxOuter = 210;
    const minOuter = 98;

    const maxValue = Math.max(...data.map(item => item.value), 1);
    const angleStep = (Math.PI * 2) / data.length;
    const startOffset = -Math.PI / 2;

    const petals = data.map((item, index) => {
        const start = startOffset + angleStep * index;
        const end = start + angleStep;
        const outer = minOuter + (maxOuter - minOuter) * clampNumber(item.value / maxValue, 0, 1);
        const path = describeArcPath(centerX, centerY, innerRadius, outer, start, end);
        const mid = (start + end) / 2;
        const label = polarPoint(centerX, centerY, outer + 18, mid);

        return `
            <path d="${path}" fill="${item.color}" fill-opacity="0.8" stroke="#ffffff" stroke-width="2" />
            ${labelShow ? `<text x="${label.x}" y="${label.y}" text-anchor="middle" font-size="12" fill="#344054">${escapeXml(item.name)} ${item.value}</text>` : ""}
        `;
    }).join("");

    const legend = legendShow
        ? `<g transform="translate(72, ${height - 28})">
            ${data.map((item, index) => {
            const x = index * 150;
            return `
                        <rect x="${x}" y="-10" width="12" height="12" rx="2" fill="${item.color}" />
                        <text x="${x + 18}" y="0" font-size="12" fill="#344054">${escapeXml(item.name)}</text>
                    `;
        }).join("")}
        </g>`
        : "";

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
        <rect width="${width}" height="${height}" fill="#ffffff" />
        <text x="60" y="38" font-size="20" font-weight="600" fill="#182230">${escapeXml(title || "Nightingale Chart")}</text>
        <circle cx="${centerX}" cy="${centerY}" r="${innerRadius}" fill="#f8fafc" stroke="#dce3ed" />
        ${petals}
        ${legend}
    </svg>`;
};
