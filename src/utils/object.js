export const { keys, assign: merge, setPrototypeOf, prototype } = Object;
export const { from: toArray, isArray } = Array;

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
 * Deep merge options.
 *
 * @param {object} config - Alwan config object.
 * @param {object} options - User options.
 */
export const mergeOptions = (config, options) => {
    objectIterator(options, (val, key) => {
        if (key in config) {
            if (typeof val === 'object' && !isArray(val)) {
                config[key] = merge({}, config[key]);
                mergeOptions(config[key], val);
            } else {
                config[key] = options[key];
            }
        }
    });
}