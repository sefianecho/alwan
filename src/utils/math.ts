export const int = parseInt;
export const { min, max, abs, round, PI } = Math;

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
