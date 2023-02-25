import { checkSVG, clipboardSVG } from "../assets/svg";
import { COPY_BUTTON_CLASSNAME, FOCUS_CLASSNAME, PREVIEW_CLASSNAME } from "../classnames";
import { CLICK, FOCUS_IN, FOCUS_OUT, INSERT_BEFORE_FIRST_CHILD, MOUSE_OUT } from "../constants";
import { createButton, createElement, insertElement, removeElement, setHTML, toggleClassName } from "../utils/dom";

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
     * Copy button.
     *
     * @type {HTMLButtonElement}
     */
    let copyButton;

    /**
     * Indicate whether color is copied.
     */
    let isCopied;


    const self = {
        /**
         * Color preview element.
         */
        _preview: null,

        /**
         * Initialize utility component.
         *
         * @param {object} param0 - Alwan options.
         * @param {Alwan} instance - Alwan instance.
         */
        _init({ preview, copy }, instance) {
            alwan = instance;
            let previewElement = self._preview;

            if (copy !== !! copyButton) {
                if (copy) {
                    copyButton = createButton(COPY_BUTTON_CLASSNAME, previewElement || parent, { _content: clipboardSVG }, INSERT_BEFORE_FIRST_CHILD);
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
            self._preview = previewElement;
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
    const updateButtonIcon = ({ target, type }) => {
        if (target === copyButton) {
            // If the color is copied (that means the copy button has changed its icon),
            // and the button has lost focus or mouse left it, then set the icon back,
            // to the clipboard svg.
            if (isCopied && type !== FOCUS_IN) {
                isCopied = false;
                setHTML(copyButton, clipboardSVG);
                // set the clipboard icon.
            }
            // Add focus class to the button if it receive focus,
            // otherwise remove the class if the button loses focus or the mouse leave it.
            toggleClassName(copyButton, FOCUS_CLASSNAME, type === FOCUS_IN);
        }
    }

    /**
     * Bind events.
     */
    events._bind(parent, CLICK, copyColor);
    events._bind(parent, [MOUSE_OUT, FOCUS_IN, FOCUS_OUT], updateButtonIcon);

    return self;
}