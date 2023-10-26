export const int = parseInt;
export const { min, max, abs, round, PI, sign } = Math;

/**
 * Keeps a number in a range.
 *
 * @param number - A number to keep it between two numbers.
 * @param upperBound - Max.
 * @param lowerBound - Min.
 * @returns - Bound number.
 */
export const boundNumber = (number: number, upperBound = 100, lowerBound = 0) =>
    number > upperBound ? upperBound : number < lowerBound ? lowerBound : number;

/**
 * Angle value in degrees, it must be between 0 and 360.
 *
 * @param angle - Angle.
 * @returns - Normalized angle.
 */
export const normalizeAngle = (angle: number) => {
    angle %= 360;
    return round(angle < 0 ? angle + 360 : angle);
};

/**
 * Gets floating number precision.
 *
 * @param num - Number.
 * @param n - 10 ^ numbers behind floating point.
 * @returns - Floating number precision.
 */
export const precision = (num: number, n = 1): number =>
    round(num * n) / n !== num ? precision(num, n * 10) : n;

/**
 * Rounds a number by a given precision.
 *
 * @param num - A Number.
 * @param precision - Number precision as 10^precision.
 * @returns - Rounded number.
 */
export const roundBy = (num: number, precision: number) => round(num * precision) / precision;
