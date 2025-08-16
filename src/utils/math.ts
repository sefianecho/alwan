export const { min, max, abs, round, PI } = Math;

export const clamp = (value: number, end = 100, start = 0) =>
    value > end ? end : value < start ? start : value;

export const normalizeAngle = (angle: number) => {
    angle %= 360;
    return round(angle < 0 ? angle + 360 : angle);
};

export const toDecimal = (hex: string) => parseInt(hex, 16);
