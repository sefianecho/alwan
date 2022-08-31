/**
 * Iterate in an object, stop and return false if callback function returns true.
 *
 * @param {Object} object - Any object.
 * @param {CallableFunction} fn - Any Callback function.
 * @returns 
 */
export const objectIterator = (object, fn) => {

    for (const key in object) {
        if (Object.hasOwnProperty.call(object, key)) {
            if (fn(key, object[key], object)) {
                return false;
            }
        }
    }

    return true;
}


/**
 * Merges two or more objects together into the target object.
 *
 * @param {Object} target - Object that will receive the new properties.
 * @param  {...Object} sources - Objects containing additional properties to merge in.
 * @returns 
 */
export const merge = (target, ...sources) => Object.assign(target, ...sources);