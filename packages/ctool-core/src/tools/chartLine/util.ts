import { chartPalette, escapeXml, parseObjectExpression } from "../chartShared/util";

export interface LineSeries {
    name: string;
    values: number[];
    color: string;
}

const axisTicks = 5;

export const parseXAxis = (input: string) => {
    return input
        .replace(/，/g, ",")
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);
};

export const parseLineSeries = (input: string): LineSeries[] => {
    const raw = parseObjectExpression<Record<string, number[]>>(input);
    const entries = Object.entries(raw);

    if (entries.length < 1) {
        throw new Error("empty series");
    }

    return entries.map(([name, values], index) => {
        const points = Array.isArray(values) ? values.map(value => Number(value)) : [];
        if (points.length < 1 || points.some(value => !Number.isFinite(value))) {
            throw new Error(`invalid series: ${name}`);
        }
        return {
            name,
            values: points,
            color: chartPalette[index % chartPalette.length],
        };
    });
};

const buildSmoothPath = (points: Array<{ x: number; y: number }>) => {
    if (points.length < 2) {
        return "";
    }
    const first = points[0];
    let path = `M ${first.x} ${first.y}`;

    for (let index = 1; index < points.length; index++) {
        const prev = points[index - 1];
        const current = points[index];
        const midX = (prev.x + current.x) / 2;
        path += ` Q ${midX} ${prev.y}, ${current.x} ${current.y}`;
    }

    return path;
};

export const createLineChartSvg = (
    title: string,
    xAxis: string[],
    series: LineSeries[],
    smooth: boolean,
    legendShow: boolean,
) => {
    const width = 980;
    const height = 520;
    const padding = {
        left: 70,
        right: 40,
        top: 70,
        bottom: 70,
    };

    const maxPoints = Math.max(
        xAxis.length,
        ...series.map(item => item.values.length),
    );
    const labels = xAxis.length < maxPoints
        ? Array.from({ length: maxPoints }).map((_, index) => xAxis[index] || `${index + 1}`)
        : xAxis;

    const values = series.flatMap(item => item.values);
    const minValue = Math.min(0, ...values);
    let maxValue = Math.max(...values);
    if (maxValue <= minValue) {
        maxValue = minValue + 1;
    }

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const xStep = labels.length > 1 ? chartWidth / (labels.length - 1) : 0;

    const valueToY = (value: number) => {
        return padding.top + (1 - (value - minValue) / (maxValue - minValue)) * chartHeight;
    };

    const gridLines = Array.from({ length: axisTicks + 1 }).map((_, index) => {
        const ratio = index / axisTicks;
        const y = padding.top + ratio * chartHeight;
        const value = maxValue - ratio * (maxValue - minValue);
        return `
            <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#e7edf5" />
            <text x="${padding.left - 12}" y="${y + 4}" text-anchor="end" font-size="12" fill="#5d6b7d">${value.toFixed(0)}</text>
        `;
    }).join("");

    const xLabels = labels.map((label, index) => {
        const x = padding.left + index * xStep;
        return `<text x="${x}" y="${height - padding.bottom + 26}" text-anchor="middle" font-size="12" fill="#5d6b7d">${escapeXml(label)}</text>`;
    }).join("");

    const seriesSvg = series.map(item => {
        const points = labels.map((_, index) => {
            const value = item.values[index] ?? item.values[item.values.length - 1];
            return {
                x: padding.left + index * xStep,
                y: valueToY(value),
                value,
            };
        });
        const path = smooth
            ? buildSmoothPath(points.map(point => ({ x: point.x, y: point.y })))
            : "";
        const polyline = points.map(point => `${point.x},${point.y}`).join(" ");
        const pointMarks = points.map(point => `
            <circle cx="${point.x}" cy="${point.y}" r="3.4" fill="${item.color}" />
            <title>${escapeXml(item.name)}: ${point.value}</title>
        `).join("");

        return `
            ${smooth
                ? `<path d="${path}" fill="none" stroke="${item.color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />`
                : `<polyline points="${polyline}" fill="none" stroke="${item.color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />`
            }
            ${pointMarks}
        `;
    }).join("");

    const legend = legendShow
        ? `<g transform="translate(${padding.left},${height - 26})">
            ${series.map((item, index) => {
            const x = index * 140;
            return `
                        <rect x="${x}" y="-10" width="12" height="12" rx="2" fill="${item.color}" />
                        <text x="${x + 18}" y="0" font-size="12" fill="#344054">${escapeXml(item.name)}</text>
                    `;
        }).join("")}
        </g>`
        : "";

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
        <rect width="${width}" height="${height}" fill="#ffffff" />
        <text x="${padding.left}" y="38" font-size="20" font-weight="600" fill="#182230">${escapeXml(title || "Line Chart")}</text>
        <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}" stroke="#8c9bab" />
        <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="#8c9bab" />
        ${gridLines}
        ${xLabels}
        ${seriesSvg}
        ${legend}
    </svg>`;
};
