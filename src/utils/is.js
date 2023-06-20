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
 * Checks if a value is not undefined or null.
 *
 * @param {Any} value - Value.
 * @returns {Boolean}
 */
export const isset = value => value != null;