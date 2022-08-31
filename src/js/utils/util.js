/**
 * Checks if a value is a string.
 *
 * @param {Any} value - Value.
 * @returns {Boolean}
 */
export const isString = value => typeof value === 'string';

/**
 * Checks if a value is not undefined or null.
 *
 * @param {Any} value - Value.
 * @returns {Boolean}
 */
export const isSet = value => value != null;