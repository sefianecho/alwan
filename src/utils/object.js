export const { keys, assign: merge, setPrototypeOf, prototype } = Object;

/**
 * Iterate in an object.
 * If any callback function return a value different then null or undefined,
 * then stop iteration and return that value.
 *
 * @param {Object} object - Any object.
 * @param {Function} fn - A Callback function.
 * @returns {any}
 */
export const objectIterator = (object, fn) => {
    let props = keys(object);
    for (const prop of props) {
       fn(object[prop], prop);
    }
}

/**
 * Checks if obj1 keys and values equal to obj2's keys and values.
 *
 * @param {Object} obj1 - Any object.
 * @param {Object} obj2 - Any object.
 * @returns {Boolean}
 */
export const isEqual = (obj1, obj2) => {
    if (obj1 && obj2) {
        return keys(obj1).every(key => obj1[key] === obj2[key]);
    }
    return false;
}