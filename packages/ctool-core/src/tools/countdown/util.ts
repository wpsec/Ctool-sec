export const countdownPresets = [
    { label: "1m", seconds: 60 },
    { label: "5m", seconds: 300 },
    { label: "10m", seconds: 600 },
    { label: "30m", seconds: 1800 },
    { label: "1h", seconds: 3600 },
    { label: "2h", seconds: 7200 },
    { label: "4h", seconds: 14400 },
    { label: "8h", seconds: 28800 },
    { label: "1d", seconds: 86400 },
    { label: "2d", seconds: 172800 },
] as const;

export const clampUnit = (value: number, max: number) => {
    if (!Number.isFinite(value)) {
        return 0;
    }
    return Math.max(0, Math.min(max, Math.floor(value)));
};

export const createTargetTime = (days: number, hours: number, minutes: number, seconds: number) => {
    return Date.now() + ((((days * 24) + hours) * 60 + minutes) * 60 + seconds) * 1000;
};

export const parseDuration = (targetTime: number, now: number) => {
    const remaining = Math.max(0, targetTime - now);
    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return {
        completed: remaining <= 0,
        days,
        hours,
        minutes,
        seconds,
    };
};
