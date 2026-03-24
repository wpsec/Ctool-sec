export const defaultFoodText = [
    "黄焖鸡",
    "牛肉粉",
    "老乡鸡",
    "KFC",
    "牛腩饭",
    "鳗鱼饭",
    "袁记云饺",
].join("\n");

export const getFoodCandidates = (value: string) => {
    return value
        .split(/\r?\n/)
        .map(item => item.trim())
        .filter(Boolean);
};

export const pickRandomFood = (value: string) => {
    const candidates = getFoodCandidates(value);
    if (candidates.length < 1) {
        return "";
    }
    return candidates[Math.floor(Math.random() * candidates.length)];
};
