import dayjs, { Dayjs } from "dayjs";

export interface LifeTimeStat {
    years: string;
    months: string;
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
}

export interface LifeMatrixAnalysis {
    pastTime: LifeTimeStat;
    remainingTime: LifeTimeStat;
    blocks: string[];
    summary: Record<string, number>;
}

const LIFETIME_YEARS = 80;
const TOTAL_BLOCKS = 400;
const DAYS_PER_BLOCK = (365 * LIFETIME_YEARS) / TOTAL_BLOCKS;
const HOURS_PER_BLOCK = DAYS_PER_BLOCK * 24;
const CHILD_AGE = 28;

const formatStat = (start: Dayjs, end: Dayjs): LifeTimeStat => {
    return {
        years: end.diff(start, "year", true).toFixed(1),
        months: end.diff(start, "month", true).toFixed(1),
        days: end.diff(start, "day", true).toFixed(1),
        hours: end.diff(start, "hour", true).toFixed(1),
        minutes: end.diff(start, "minute", true).toFixed(1),
        seconds: end.diff(start, "second", true).toFixed(1),
    };
};

const clampBlock = (value: number) => {
    return Math.max(0, Math.min(TOTAL_BLOCKS, Math.round(value)));
};

export const analyzeLife = (birthDate: string, retirementAge: number, now = dayjs()): LifeMatrixAnalysis => {
    const birth = dayjs(birthDate);
    if (!birth.isValid()) {
        throw new Error("Invalid birth date");
    }
    if (birth.isAfter(now)) {
        throw new Error("Birth date can not be in the future");
    }
    if (retirementAge < 1) {
        throw new Error("Invalid retirement age");
    }

    const lifetime = birth.add(LIFETIME_YEARS, "year");
    const pastDays = now.diff(birth, "day");
    const remainingDays = Math.max(lifetime.diff(now, "day", true), 0);
    const workDays = Math.max(birth.add(retirementAge, "year").diff(now, "day", true), 0);
    const childrenDays = Math.max(birth.add(CHILD_AGE + 18, "year").diff(now, "day", true), 0);
    const parentDays = Math.max(birth.add(LIFETIME_YEARS - CHILD_AGE, "year").diff(now, "day", true), 0);

    const summary = {
        past: clampBlock(pastDays / DAYS_PER_BLOCK),
        sleep: clampBlock((remainingDays * 8) / HOURS_PER_BLOCK),
        work: clampBlock((((workDays * 5) / 7) * 8) / HOURS_PER_BLOCK),
        children: clampBlock((childrenDays * 5) / HOURS_PER_BLOCK),
        parents: clampBlock(((parentDays / 31) * 24) / HOURS_PER_BLOCK),
        remain: 0,
    };

    const usedBlocks = summary.past + summary.sleep + summary.work + summary.children + summary.parents;
    summary.remain = Math.max(TOTAL_BLOCKS - usedBlocks, 0);

    const blocks = [
        ...Array.from({ length: summary.past }).map(() => "past"),
        ...Array.from({ length: summary.sleep }).map(() => "sleep"),
        ...Array.from({ length: summary.work }).map(() => "work"),
        ...Array.from({ length: summary.children }).map(() => "children"),
        ...Array.from({ length: summary.parents }).map(() => "parents"),
        ...Array.from({ length: summary.remain }).map(() => "remain"),
    ].slice(0, TOTAL_BLOCKS);

    return {
        pastTime: formatStat(birth, now),
        remainingTime: formatStat(now, lifetime),
        blocks,
        summary,
    };
};
