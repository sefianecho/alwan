import { checkSVG, clipboardSVG } from "../assets/svg";
import { COPY_BUTTON_CLASSNAME, PREVIEW_CLASSNAME } from "../constants/classnames";
import { BLUR, CLICK, COLOR, DOC_ELEMENT, INPUT, INSERT_BEFORE_FIRST_CHILD, MOUSE_OUT, ROOT } from "../constants/globals";
import { addEvent } from "../core/events/binder";
import { createButton, createElement, customProperty, removeElement, setHTML } from "../utils/dom";

/**
 * Preview color and copy color string.
 *
 * @param {HTMLElement} ref - Element to insert utility elements into.
 * @param {Alwan} alwan - Alwan instance.
 * @returns {object} Utility component.
 */
export const Utility = (ref, alwan) => {
    /**
     * Preview color.
     *
     * @type {HTMLDivElement | null}
     */
    let previewElement;

    /**
     * Copy button.
     *
     * @type {HTMLButtonElement | null}
     */
    let copyButton;

    /**
     * Indicate whether color is copied.
     */
    let isCopied;

    /**
     * Set button icon.
     *
     * @param {boolean} state - Copy state.
     */
    const updateIcon = (state) => {
        isCopied = state;
        setHTML(copyButton, state ? checkSVG : clipboardSVG);
    };

    /**
     * Copy color fallback if browser doesn't support 'navigator.clipboard'.
     *
     * @param {string} color - Color to copy.
     */
    const fallback = (color) => {
        let input = createElement(
            INPUT,
            '',
            DOC_ELEMENT,
            { value: color }
        );
        input.select();
        ROOT.execCommand('copy');
        input = removeElement(input);
        // change icon.
        updateIcon(true);
    };

    /**
     * Copies the selected color to the clipboard.
     */
    const copyColor = () => {
        if (! isCopied && ! alwan.config.disabled) {
            const clipboard = navigator.clipboard;
            const color = alwan._color._get();

            if (clipboard) {
                clipboard.writeText(color)
                            .then(() => updateIcon(true))
                            .catch(() => fallback(color));
            } else {
                fallback(color);
            }
        }
    }

    /**
     * API.
     */
    return {
        /**
         * Initialize utility component.
         *
         * @param {object} param0 - Alwan options.
         * @param {object} instance - Alwan instance.
         */
        _init({ preview, copy }, instance) {
            alwan = instance;

            // Initialize elements.
            previewElement = removeElement(previewElement);
            copyButton = removeElement(copyButton);

            if (preview) {
                previewElement = createElement('',
                    PREVIEW_CLASSNAME,
                    ref,
                    {},
                    INSERT_BEFORE_FIRST_CHILD
                );
            }

            if (copy) {
                copyButton = createButton(
                    COPY_BUTTON_CLASSNAME,
                    previewElement || ref,
                    { html: clipboardSVG },
                    INSERT_BEFORE_FIRST_CHILD
                );

                /**
                 * Add events.
                 */
                addEvent(copyButton, CLICK, copyColor);
                // Reset clipboard icon.
                addEvent(copyButton, BLUR, () => isCopied && updateIcon(false));
                addEvent(copyButton, MOUSE_OUT, () => copyButton.blur());
            }
        },

        /**
         * Previews current color.
         *
         * @param {string} color - Color string.
         */
        _preview(color) {
            customProperty(previewElement, COLOR, color);
        }
    }
}