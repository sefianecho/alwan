import { merge } from "../utils/object"
import { isset } from "../utils/util";
import { useComponents, isShared } from "./component";

/**
 * Initialize instance.
 *
 * @param {object} alwan - Instance.
 * @param {object} options - Alwan options.
 */
export const initialize = (alwan, options = {}) => {
    let config = merge(alwan.config, options);
    let { color, disabled } = options;
    let { _set, _update } = alwan._color;
    let app;

    alwan._components = useComponents(alwan);
    alwan._reference._init(config);
    app = alwan._components._app;

    if (isShared(alwan._components)) {
        app._toggle(null, false);
    }

    app._setup(config, alwan);
    alwan._reference._setDisabled(disabled);

    if (isset(color)) {
        _set(color);
    }

    // To update inputs values.
    _update();
}