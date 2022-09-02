import { App } from "../components/App";
import { Inputs } from "../components/Inputs";
import { Palette } from "../components/Palette";
import { Preview } from "../components/Preview";
import { Reference } from "../components/Reference";
import { Sliders } from "../components/Sliders";
import { Swatches } from "../components/Swatches";
import { createElement } from "../utils/dom";


const CONTAINER_CLASSNAME = 'talwin__container';

/**
 * Create and initialize components.
 *
 * @param {Element} reference - Picker Reference element.
 * @param {Object} talwin - Talwin Instance.
 * @returns {Object}
 */
export const createComponents = (reference, talwin) => {

    /**
     * Creates a container element.
     *
     * @param {HTMLElement} parent - Element to append the created container to.
     * @returns {HTMLElement}
     */
    const createContainer = (parent) => createElement('', CONTAINER_CLASSNAME, parent);


    let ref = Reference(reference, talwin);
    let app = App(talwin);
    let root = app.root;

    let palette = Palette(root, talwin);

    let container = createContainer(root);
    let preview = Preview(container, talwin);
    let sliders = Sliders(container, talwin);

    let inputs = Inputs(createContainer(root), talwin);
    let swatches = Swatches(root, talwin);

    let components = {
        ref,
        app,
        palette,
        preview,
        sliders,
        inputs,
        swatches
    }


    return components;
}