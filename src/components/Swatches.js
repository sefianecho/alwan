import { caretSVG } from "../assets/svg";
import { COLLAPSE_BUTTON_CLASSNAME, COLLAPSE_CLASSNAME, SWATCHES_CLASSNAME, SWATCH_CLASSNAME } from "../classnames";
import { CHANGE, CLICK, COLOR, COLOR_PROPERTY } from "../constants";
import { createButton, createElement, parent, removeElement, setCustomProperty, setHTML, toggleClassName } from "../utils/dom";
import { int } from "../utils/number";
import { isString } from "../utils/string";
import { isset } from "../utils/util";

/**
 * Creates swatches component.
 *
 * @param {Element} root - Element to append the palette element to.
 * @param {object} alwan - Picker Instance.
 * @param {object} events - Event binder.
 * @returns {object} - Swatches component.
 */
export const Swatches = (root, alwan, events) => {

    /**
     * Swatches container.
     *
     * @type {Element}
     */
    let container;

    /**
     * Swatches array.
     *
     * @type {array<string>}
     */
    let swatches;

    /**
     * Button.
     *
     * @type {HTMLButtonElement}
     */
    let collapseButton;

    /**
     * Swatches array length.
     *
     * @type {number}
     */
    let swatchesLength;

    /**
     * Indicate whether swatches container is collapsible.
     *
     * @type {boolean}
     */
    let isCollapsible

    /**
     * Swatches API.
     */
    const self = {
        /**
         * Initialize swatches.
         *
         * @param {Object} options - Alwan options.
         */
        _init(options = {}, instance) {
            alwan = instance || alwan;

            swatches = options.swatches || swatches;
            isCollapsible = options.collapseSwatches;
            isCollapsible = isset(isCollapsible) ? isCollapsible : false;

            if (Array.isArray(swatches)) {

                swatchesLength = swatches.length;

                if (swatchesLength) {
                    // Create swatches container.
                    if (! container) {
                        container = createElement('', SWATCHES_CLASSNAME, root);
                    } else {
                        // Initialize container.
                        setHTML(container, '');
                    }

                    // Create swatch button.
                    swatches.forEach(color => {
                        setCustomProperty(
                            createButton(SWATCH_CLASSNAME, container),
                            COLOR_PROPERTY,
                            color
                        );
                    });

                    // Create or remove the collapse button depend if the collapseSwatches,
                    // option changes.
                    if (isCollapsible) {
                        if (! collapseButton) {
                            collapseButton = createButton(COLLAPSE_BUTTON_CLASSNAME, root, { _content: caretSVG });
                        }
                    } else {
                        collapseButton = removeElement(collapseButton);
                    }
                    toggleClassName(container, COLLAPSE_CLASSNAME, isCollapsible);
                } else {
                    // Remove everything if the swatches array is empty.
                    container = removeElement(container);
                    collapseButton = removeElement(collapseButton);
                }
            }
        },
        /**
         * Adds a swatch button.
         *
         * @param {String} color - Color.
         */
        _add(color) {
            if (isString(color)) {
                swatchesLength = swatches.push(color);
                if (swatchesLength > 1) {
                    setCustomProperty(
                        createButton(SWATCH_CLASSNAME, container),
                        COLOR_PROPERTY, color
                    );
                } else {
                    // Initialize component, if calling add swatches on an empty array.
                    self._init();
                }
            }
        },
        /**
         * Removes a swatch button.
         *
         * @param {String|Number} swatch - Color or Swatch Index.
         */
        _remove(swatch) {
            let index = swatches.findIndex((color, index) => swatch === color || int(swatch) === index);

            if (index > -1) {
                swatchesLength--;
                // Remove swatch button.
                removeElement(container.children[index]);
                // Remove color from swatches array.
                swatches.splice(index, 1);

                if (! swatchesLength) {
                    // Initialize component, if calling remove swatches on an array that,
                    // has only one value.
                    self._init();
                }
            }
        }
    };

    /**
     * Handles clicks in the swatches container or the collapse button.
     *
     * @param {MouseEvent} e - Event.
     */
    const handleClick = ({ target }) => {
        if (target === collapseButton) {
            toggleClassName(container, COLLAPSE_CLASSNAME);
        }else if(parent(target) === container) {
            alwan._color._set(target.style.getPropertyValue(COLOR_PROPERTY));
            alwan._events._dispatch(COLOR, target);
            alwan._events._dispatch(CHANGE, target);
        }
    }

    /**
     * Bind events.
     */
    events._bind(root, CLICK, handleClick);


    return self;
}