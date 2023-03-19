export const { parseFloat: float, parseInt: int, isFinite: isNumeric } = Number;
export const { min, max, abs, round, PI } = Math;

/**
 * Keeps a number in a range.
 *
 * @param {number} number - A number to keep it between two numbers.
 * @param {number} upperBound - Max.
 * @param {number} lowerBound - Min.
 * @returns {number}
 */
export const confineNumber = (number, upperBound = 100, lowerBound = 0) => {
    return min(max(number, lowerBound), upperBound);
}

/**
 * Angle value in degrees, it must be between 0 and 360.
 *
 * @param {number} angle - Angle.
 * @returns {Number}
 */
export const normalizeAngle = angle => {
    return (round(angle) % 360 + 360) % 360;
}