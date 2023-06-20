import { caretSVG } from "../assets/svg";
import { COLLAPSE_BUTTON_CLASSNAME, COLLAPSE_CLASSNAME, SWATCHES_CLASSNAME, SWATCH_CLASSNAME } from "../constants/classnames";
import { parseColor } from "../colors/parser";
import { CHANGE, CLICK, COLOR } from "../constants/globals";
import { createButton, createElement, customProperty, removeElement, toggleClassName } from "../utils/dom";
import { int } from "../utils/number";
import { addEvent } from "../core/events/binder";
import { isArray } from "../utils/object";

/**
 * Creates color swatches buttons.
 *
 * @param {Element} ref - Element to append the swatches container to.
 * @param {object} alwan - Picker Instance.
 * @returns {object} - Swatches component.
 */
export const Swatches = (ref, alwan) => {

    /**
     * Swatches container.
     *
     * @type {HTMLDivElement | null}
     */
    let container;

    /**
     * Swatches array.
     *
     * @type {Array<string>}
     */
    let swatchesArray;

    /**
     * Button.
     *
     * @type {HTMLButtonElement | null}
     */
    let collapseButton;

    /**
     * Swatches API.
     */
    return {
        /**
         * Creates color swatches.
         *
         * @param {object} param0 - Alwan options.
         * @param {object} instance - Alwan instance.
         */
        _init({ swatches, toggleSwatches }, instance) {
            alwan = instance || alwan;
            swatchesArray = [];

            if (isArray(swatches)) {
                swatchesArray = swatches;
                container = removeElement(container);
                collapseButton = removeElement(collapseButton);

                if (swatches.length) {
                    // Create swatches container.
                    container = createElement('', SWATCHES_CLASSNAME, ref);
                    // Create swatch buttons.
                    swatches.forEach(color => {
                        customProperty(
                            createButton(SWATCH_CLASSNAME, container),
                            COLOR,
                            parseColor(color, true)
                        );
                    });

                    // Create or remove the collapse button depend if the toggleSwatches,
                    // option changes.
                    if (toggleSwatches) {
                        collapseButton = createButton(COLLAPSE_BUTTON_CLASSNAME, ref, { html: caretSVG });
                        /**
                         * Handles toggle swatches button click.
                         */
                        addEvent(collapseButton, CLICK, () => toggleClassName(container, COLLAPSE_CLASSNAME));
                    }
                    /**
                     * Handles clicks in the swatches container.
                     */
                    addEvent(container, CLICK, ({ target }) => {
                        if(target !== container) {
                            if (alwan._color._set(customProperty(target, COLOR))) {
                                alwan._events._dispatch(COLOR, target);
                                alwan._events._dispatch(CHANGE, target);
                            }
                        }
                    });
                }
            }
        },

        /**
         * Adds color swatches.
         *
         * @param {Array<string | object>} swatches - Color swatches array to add.
         */
        _add(swatches) {
            alwan.config.swatches = [ ...swatchesArray, ...swatches ];
            this._init(alwan.config);
        },

        /**
         * Removes color swatches.
         *
         * @param {Array<string | number | object} swatches - Color swatches or their index to remove.
         */
        _remove(swatches) {
            alwan.config.swatches = swatchesArray.filter((swatch, index) => ! swatches.some((item) => item === swatch || int(item) === index));
            this._init(alwan.config);
        }
    };
}