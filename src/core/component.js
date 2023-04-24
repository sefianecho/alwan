import { ALWAN_CLASSNAME, CONTAINER_CLASSNAME } from "../constants/classnames";
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

    /**
     * Creates a new container element.
     *
     * @returns {Element} - Container Element.
     */
    const createContainer = () => {
        return createElement('', CONTAINER_CLASSNAME, root);
    }

    const _app = App(root, alwan, events);
    const _palette = Palette(root, alwan, events);
    const container = createContainer();
    const _utility = Utility(container, alwan, events);
    const _sliders = Sliders(container, alwan, events);
    const _inputs = Inputs(createContainer(), alwan, events);
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
 * Checks if components are shared.
 *
 * @param {object} components - Alwan components.
 * @returns {boolean} - True if components are shared.
 */
export const isShared = (components) => {
    return !!sharedComponents && components === sharedComponents;
}

/**
 * Destroys components.
 *
 * @param {object} components - Alwan components.
 * @returns {void}
 */
export const destroyComponents = (components) => {
    if (isShared(components)) {
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
export const useComponents = (alwan) => {
    let { _components, config: { shared }} = alwan;

    // Alwan already has components.
    if (_components) {
        // Nothing is changing, if components are shared and the option shared is true,
        // or the components are not shared and the option shared is false
        // then just return the current compoenents.
        if ((isShared(_components)) === shared) {
            return _components;
        }

        // Force close the picker before destroying its components.
        _components._app._toggle(alwan, false, true);
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