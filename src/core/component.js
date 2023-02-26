import { ALWAN_CLASSNAME, CONTAINER_CLASSNAME } from "../classnames";
import { App } from "../components/App";
import { Inputs } from "../components/Inputs";
import { Palette } from "../components/Palette";
import { Sliders } from "../components/Sliders";
import { Swatches } from "../components/Swatches";
import { Utility } from "../components/Utility";
import { body, createElement } from "../utils/dom";
import { Binder } from "./events/binder";

/**
 * Shared Components.
 */
let sharedComponents = null;

/**
 * Number of instances that uses the shared components.
 */
let instanceCount = 0;

/**
 * Creates components.
 *
 * @param {Alwan} alwan - Alwan instance.
 * @returns {object} alwan components.
 */
const createComponents = (alwan) => {
    const events = Binder();
    const root = createElement('', ALWAN_CLASSNAME, body());

    const _app = App(root, alwan, events);
    const _palette = Palette(root, alwan, events);
    const container = createElement('', CONTAINER_CLASSNAME, root);
    const _utility = Utility(container, alwan, events);
    const _sliders = Sliders(container, alwan, events);
    const _inputs = Inputs(createElement('', CONTAINER_CLASSNAME, root), alwan, events);
    const _swatches = Swatches(root, alwan, events);

    return {
        _app,
        _palette,
        _utility,
        _sliders,
        _inputs,
        _swatches
    }
}

/**
 * Destroys components.
 *
 * @param {object} components - Alwan components.
 * @returns {void}
 */
export const destroyComponents = (components) => {
    if (sharedComponents === components) {
        instanceCount--;
        if (instanceCount > 0) {
            return;
        }
        sharedComponents = null;
    }

    components._app._destroy();
    components = {};
}

/**
 * Gets components.
 *
 * @param {Alwan} alwan - Alwan instance.
 * @returns {object} components.
 */
export const components = (alwan) => {
    let { _components, config: { shared }} = alwan;

    // Alwan already has components.
    if (_components) {
        // Nothing is changing, if components are shared and the option shared is true,
        // or the components are non-shared and the option shared is false
        // then just return the current compoenents.
        if ((sharedComponents === _components) === shared) {
            return _components;
        }
        // If something changed, either the components were shared,
        // and the option shared is false which means set the components as,
        // non-shared or the coponents were non-shared and we want to share them.
        // in either cases we need to destroy the current components.
        destroyComponents(_components);
    }

    if (shared) {
        // Create components and set them to sharedComponents.
        if (! sharedComponents) {
            sharedComponents = createComponents(alwan);
        }
        // Increase the instances that uses this shared components.
        instanceCount++;

        return sharedComponents;
    }

    // Create components.
    return createComponents(alwan);
}