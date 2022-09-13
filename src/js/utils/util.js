import { CHANGE, COLOR, max, min } from "../constants";

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
export const isset = value => value != null;


/**
 * Bounds a number between a lower bound and an upper bound.
 *
 * @param {number} number - Any number.
 * @param {number} upperBound - Max.
 * @param {number} lowerBound - Min.
 * @returns {number}
 */
export const boundNumber = (number, upperBound, lowerBound) => min(max(number, lowerBound || 0), upperBound || 100);


/**
 * Sets color, if color state changes then trigger color and change events.
 *
 * @param {Object} talwin - Instance.
 * @param {String} color - Color.
 * @param {Element|Object} source - Event source.
 */
export const setColorAndTriggerEvents = (talwin, color, source) => {
    if (talwin._clr.updateByString(color, true)) {
        let emit = talwin._e.emit;
        emit(COLOR, source);
        emit(CHANGE, source);
    }
}