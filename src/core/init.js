import { merge } from "../utils/object"
import { components } from "./component";

/**
 * Initialize instance.
 *
 * @param {object} alwan - Instance.
 * @param {object} options - Alwan options.
 */
export const initialize = (alwan, options) => {
    let config = merge(alwan.config, options);
    alwan._components = components(alwan);
    alwan._reference._init(config);
    alwan._components._app._setup(config, alwan);
    alwan._color._set(config.color);
}