import { chartPalette, clampNumber, escapeXml, parseObjectExpression } from "../chartShared/util";

export type RadarShape = "polygon" | "circle";

export interface RadarIndicator {
    name: string;
    max: number;
}

export interface RadarSeries {
    name: string;
    values: number[];
    color: string;
}

export const parseRadarIndicators = (input: string): RadarIndicator[] => {
    const raw = parseObjectExpression<Array<{ name: string; max: number }>>(input);
    if (!Array.isArray(raw) || raw.length < 3) {
        throw new Error("invalid indicators");
    }
    return raw.map(item => {
        const max = Number(item.max);
        if (!item?.name || !Number.isFinite(max) || max <= 0) {
            throw new Error(`invalid indicator: ${item?.name || ""}`);
        }
        return {
            name: `${item.name}`,
            max,
        };
    });
};

export const parseRadarSeries = (input: string, dimensionCount: number): RadarSeries[] => {
    const raw = parseObjectExpression<Record<string, number[]>>(input);
    const entries = Object.entries(raw);
    if (entries.length < 1) {
        throw new Error("empty series");
    }

    return entries.map(([name, values], index) => {
        const points = Array.isArray(values) ? values.map(value => Number(value)) : [];
        if (points.length !== dimensionCount || points.some(value => !Number.isFinite(value))) {
            throw new Error(`invalid series: ${name}`);
        }
        return {
            name,
            values: points,
            color: chartPalette[index % chartPalette.length],
        };
    });
};

const pointByAngle = (cx: number, cy: number, radius: number, angle: number) => {
    return {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
    };
};

const polarPolygon = (cx: number, cy: number, radius: number, count: number) => {
    return Array.from({ length: count }).map((_, index) => {
        const angle = -Math.PI / 2 + (Math.PI * 2 * index) / count;
        return pointByAngle(cx, cy, radius, angle);
    });
};

export const createRadarChartSvg = (
    title: string,
    indicators: RadarIndicator[],
    series: RadarSeries[],
    shape: RadarShape,
    legendShow: boolean,
) => {
    const width = 920;
    const height = 560;
    const centerX = width / 2;
    const centerY = height / 2 + 20;
    const radius = 185;
    const levels = 5;
    const count = indicators.length;

    const grid = Array.from({ length: levels }).map((_, index) => {
        const ratio = (index + 1) / levels;
        const currentRadius = radius * ratio;
        if (shape === "circle") {
            return `<circle cx="${centerX}" cy="${centerY}" r="${currentRadius}" fill="none" stroke="#e7edf5" />`;
        }
        const points = polarPolygon(centerX, centerY, currentRadius, count)
            .map(item => `${item.x},${item.y}`)
            .join(" ");
        return `<polygon points="${points}" fill="none" stroke="#e7edf5" />`;
    }).join("");

    const axis = indicators.map((item, index) => {
        const angle = -Math.PI / 2 + (Math.PI * 2 * index) / count;
        const end = pointByAngle(centerX, centerY, radius, angle);
        const label = pointByAngle(centerX, centerY, radius + 24, angle);
        return `
            <line x1="${centerX}" y1="${centerY}" x2="${end.x}" y2="${end.y}" stroke="#d1dae6" />
            <text x="${label.x}" y="${label.y}" text-anchor="middle" font-size="12" fill="#5d6b7d">${escapeXml(item.name)}</text>
        `;
    }).join("");

    const dataPolygons = series.map(item => {
        const points = item.values.map((value, index) => {
            const max = indicators[index].max;
            const normalized = clampNumber(value / max, 0, 1);
            const angle = -Math.PI / 2 + (Math.PI * 2 * index) / count;
            return pointByAngle(centerX, centerY, radius * normalized, angle);
        });
        const pointsText = points.map(point => `${point.x},${point.y}`).join(" ");
        const marks = points.map(point => `<circle cx="${point.x}" cy="${point.y}" r="3" fill="${item.color}" />`).join("");

        return `
            <polygon points="${pointsText}" fill="${item.color}" fill-opacity="0.2" stroke="${item.color}" stroke-width="2" />
            ${marks}
        `;
    }).join("");

    const legend = legendShow
        ? `<g transform="translate(90, ${height - 28})">
            ${series.map((item, index) => {
            const x = index * 160;
            return `
                        <rect x="${x}" y="-10" width="12" height="12" rx="2" fill="${item.color}" />
                        <text x="${x + 18}" y="0" font-size="12" fill="#344054">${escapeXml(item.name)}</text>
                    `;
        }).join("")}
        </g>`
        : "";

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
        <rect width="${width}" height="${height}" fill="#ffffff" />
        <text x="60" y="38" font-size="20" font-weight="600" fill="#182230">${escapeXml(title || "Radar Chart")}</text>
        ${grid}
        ${axis}
        ${dataPolygons}
        ${legend}
    </svg>`;
};
