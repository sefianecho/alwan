import { float, max, min } from "../constants";

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


/**
 * Bounds a number between a lower bound and an upper bound.
 *
 * @param {number} number - Any number.
 * @param {number} upperBound - Max.
 * @param {number} lowerBound - Min.
 * @returns {number}
 */
export const boundNumber = (number, upperBound, lowerBound) => min(max(number, lowerBound || 0), upperBound || 100);