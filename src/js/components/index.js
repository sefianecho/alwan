import { createElement } from "../utils/dom";
import { App } from "./App";
import { Inputs } from "./Inputs";
import { Palette } from "./Palette";
import { Preview } from "./Preview";
import { Reference } from "./Reference"
import { Sliders } from "./Sliders";

const CONTAINER_CLASSNAME = 'talwin__container';

/**
 * Creates a container element.
 *
 * @param {HTMLElement} parent - Element to append the created container to.
 * @returns {HTMLElement}
 */
const createContainer = (parent) => createElement('', CONTAINER_CLASSNAME, parent);




export const createComponents = (reference, talwin) => {
    let ref = Reference(reference, talwin);
    let app = App(talwin);
    let root = app.el;

    let palette = Palette(root, talwin);

    let container = createContainer(root);
    let preview = Preview(container, talwin);
    let sliders = Sliders(container, talwin);

    let inputs = Inputs(createContainer(root), talwin);

    return {
        ref,
        app,
        palette,
        preview,
        sliders,
        inputs,
    }
}