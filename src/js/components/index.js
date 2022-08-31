import { createElement } from "../utils/dom";
import { App } from "./App";
import { Palette } from "./Palette";
import { Reference } from "./Reference"
import { Sliders } from "./Sliders";

const CONTAINER_CLASSNAME = 'talwin__container';

/**
 * Creates a container element.
 *
 * @param {HTMLElement} parent - Element to append the created container to.
 * @param {CallableFunction} fn - Callback function.
 * @returns {HTMLElement}
 */
const createContainer = (parent) => createElement('', CONTAINER_CLASSNAME, parent);




export const createComponents = (reference, talwin) => {
    let ref = Reference(reference, talwin);
    let app = App(talwin);
    let root = app.el;

    let palette = Palette(root, talwin);

    let container = createContainer(root);
    let sliders = Sliders(container, talwin);


    return {
        ref,
        app,
        palette,
        sliders,
    }
}