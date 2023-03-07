import { checkSVG, clipboardSVG } from "../assets/svg";
import { COPY_BUTTON_CLASSNAME, PREVIEW_CLASSNAME } from "../constants/classnames";
import { CLICK, COLOR_PROPERTY, FOCUS_OUT, HTML, INPUT, INSERT_BEFORE_FIRST_CHILD, MOUSE_OUT, ROOT } from "../constants/globals";
import { createButton, createElement, insertElement, removeElement, setCustomProperty, setHTML } from "../utils/dom";

/**
 * Creates utility component.
 *
 * @param {Element} parent - Container.
 * @param {Alwan} alwan - Alwan instance.
 * @param {object} events - Event binder.
 * @returns {object} Utility component.
 */
export const Utility = (parent, alwan, events) => {
    /**
     * Preview color.
     *
     * @type {Element}
     */
    let previewElement;

    /**
     * Copy button.
     *
     * @type {HTMLButtonElement}
     */
    let copyButton;

    /**
     * Indicate whether color is copied.
     */
    let isCopied;

    /**
     * API.
     */
    const self = {
        /**
         * Initialize utility component.
         *
         * @param {object} param0 - Alwan options.
         * @param {object} instance - Alwan instance.
         */
        _init({ preview, copy }, instance) {
            alwan = instance;
            if (copy !== !! copyButton) {
                if (copy) {
                    copyButton = createButton(COPY_BUTTON_CLASSNAME, previewElement || parent, { html: clipboardSVG }, INSERT_BEFORE_FIRST_CHILD);
                } else {
                    copyButton = removeElement(copyButton);
                }
            }

            if (preview !== !! previewElement) {
                if (preview) {
                    previewElement = createElement('', PREVIEW_CLASSNAME, parent, false, INSERT_BEFORE_FIRST_CHILD);
                } else {
                    previewElement = removeElement(previewElement);
                }

                insertElement(copyButton, previewElement || parent, INSERT_BEFORE_FIRST_CHILD);
            }
        },

        /**
         * Previews a color.
         *
         * @param {string} color - Color.
         */
        _preview(color) {
            setCustomProperty(previewElement, COLOR_PROPERTY, color);
        }
    }

    /**
     * Copies the selected color to the clipboard.
     *
     * @param {MouseEvent} e - Event.
     */
    const copyColor = ({ target }) => {
        if (target === copyButton && ! isCopied && ! alwan.config.disabled) {
            // TODO: get color and copy it to the clipbloard,
            let clipboard = navigator.clipboard;
            let color = alwan._color._getColorByFormat(true);
            let input;

            if (clipboard) {
                clipboard.writeText(color);
            } else {
                input = createElement(INPUT, '', HTML, { value: color });
                input.select();
                ROOT.execCommand('copy');
                input = removeElement(input);
            }
            // change icon.
            isCopied = true;
            setHTML(copyButton, checkSVG);
        }
    }

    /**
     *  Updates the svg icon of the button.
     *
     * @param {MouseEvent|FocusEvent} e - Event.
     */
    const updateButtonIcon = e => {
        if (e.target === copyButton) {
            // If the color is copied (that means the copy button has changed its icon),
            // and the button has lost focus or mouse left it, then set the icon back,
            // to the clipboard svg.
            if (isCopied) {
                isCopied = false;
                setHTML(copyButton, clipboardSVG);
            }
            copyButton.blur();
        }
    }

    /**
     * Bind events.
     */
    events._bind(parent, CLICK, copyColor);
    events._bind(parent, [MOUSE_OUT, FOCUS_OUT], updateButtonIcon);

    return self;
}