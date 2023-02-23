/**
 * Checks if a value is a string.
 *
 * @param {unknown} value - Value to check.
 * @returns {boolean} Whether value is a string.
 */
export const isString = (value) => {
    return typeof value === 'string';
}

/**
 * Trims a string.
 *
 * @param {string} str - String to trim.
 * @returns {string} trimmed string
 */
export const trimString = (str) => {
    return str.trim();
}