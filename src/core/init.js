import { merge } from "../utils/object"
import { isset } from "../utils/util";
import { components } from "./component";

/**
 * Initialize instance.
 *
 * @param {object} alwan - Instance.
 * @param {object} options - Alwan options.
 */
export const initialize = (alwan, options) => {
    let config = merge(alwan.config, options);
    let color = options.color;
    let { _set, _update } = alwan._color;

    alwan._components = components(alwan);
    alwan._reference._init(config);
    alwan._components._app._setup(config, alwan);

    if (isset(color)) {
        _set(color);
    } else {
        // To update inputs values.
        _update();
    }
}