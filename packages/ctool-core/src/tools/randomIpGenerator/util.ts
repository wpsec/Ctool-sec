const randomOctet = () => Math.floor(Math.random() * 256);

export const generateRandomIpv4 = () => {
    return `${randomOctet()}.${randomOctet()}.${randomOctet()}.${randomOctet()}`;
};

export const generateRandomIpv4List = (count: number) => {
    return Array.from({ length: count }).map(() => generateRandomIpv4());
};
