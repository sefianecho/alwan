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