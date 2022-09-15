import { App } from "../components/App";
import { Inputs } from "../components/Inputs";
import { Palette } from "../components/Palette";
import { Preview } from "../components/Preview";
import { Reference } from "../components/Reference";
import { Sliders } from "../components/Sliders";
import { Swatches } from "../components/Swatches";
import { createElement } from "../utils/dom";
import { merge, objectIterator } from "../utils/object";
import { setColorAndTriggerEvents } from "../utils/util";


const CONTAINER_CLASSNAME = 'alwan__container';

/**
 * Create and initialize components.
 *
 * @param {Element} reference - Picker Reference element.
 * @param {Object} alwan - Alwan Instance.
 * @returns {Object}
 */
export const createComponents = (reference, alwan) => {

    /**
     * Creates a container element.
     *
     * @param {HTMLElement} parent - Element to append the created container to.
     * @returns {HTMLElement}
     */
    const createContainer = (parent) => createElement('', CONTAINER_CLASSNAME, parent);


    let ref = Reference(reference, alwan);
    let app = App(alwan);

    let root = app.$;

    let palette = Palette(root, alwan);

    let container = createContainer(root);
    
    let preview = Preview(container, alwan);
    let sliders = Sliders(container, alwan);
    let inputs = Inputs(createContainer(root), alwan);
    let swatches = Swatches(root, alwan);

    return {
        ref,
        app,
        palette,
        preview,
        sliders,
        inputs,
        swatches
    }
}

/**
 * Initialize components.
 *
 * @param {Object} alwan - Instance.
 * @param {Object} options - Alwan options.
 */
export const initialize = (alwan, options) => {

    options = options || {};

    let config = alwan.config;
    let color = options.color;

    merge(config, options);

    objectIterator(alwan._c, component => {
        let init = component.init;

        if (init) {
            init(config);
        }
    });

    /**
     * Initialize color.
     */
    if (color) {
        setColorAndTriggerEvents(alwan, color);
    }
}