import { CLICK, FOCUS_CLASSNAME, FOCUS_IN, FOCUS_OUT, MOUSE_LEAVE } from "../constants";
import { bindEvent } from "../core/events/EventBinder";
import { checkSVGAttrs, clipboardSVGAttrs } from "../lib/svg";
import { createElement, removeElement, setVisibility, updateClass } from "../utils/dom";

const PREVIEW_CLASSNAME = 'talwin__preview';

/**
 * Preview component.
 *
 * @param {Element} parent - Element to append preview are to.
 * @param {Object} talwin - Instance.
 * @returns {Object}
 */
export const Preview = (parent, talwin) => {
    
    /**
     * Event Listeners.
     */
    let listeners = [];

    /**
     * Copy state.
     */
    let isCopied = false;

    /**
     * Preview area wrapper element.
     */
    const container = createElement('', 'tw-mr1', parent);

    /**
     * Preview API.
     */
    const self = {
        /**
         * Init. Preview, copy button.
         *
         * @param {Object} options - Picker options.
         */
        init(options) {
            let { preview, copy } = options;
            let previewArea = self.$;
            let copyButton = self.cp;

            // Either preview option is true and previewArea doen't exist,
            // or preview option is false and previewArea does exist.
            if (preview !== !!previewArea) {

                previewArea = preview ? createElement('', PREVIEW_CLASSNAME, container) : removeElement(previewArea, true);
    
                if (copy && copyButton) {
                    (previewArea || container).appendChild(copyButton);
                }
            }

            if (! copy) {
                copyButton = removeElement(copyButton, true);
            } else if (! copyButton) {
                copyButton = createElement('button', 'tw-btn', previewArea || container, { type: 'button' }, thisButton => {
                    updateSVG(thisButton);
                });
            }

            // Hide container if both copyButton and previewArea don't exist,
            setVisibility(container, copyButton || previewArea);

            self.$ = previewArea;
            self.cp = copyButton;
        }
    }


    /**
     * Sets a SVG icon for the copy button.
     *
     * @param {HTMLElement} button - Button.
     */
    const updateSVG = (button) => {
        button = button || self.cp;
        button.innerHTML = '';
        createElement('svg', '', button, isCopied ? checkSVGAttrs : clipboardSVGAttrs);
    }

    /**
     * Copies selected color to the clipboard then updates copy,
     * button's Icon and styles.
     *
     * @param {Event} e - Click or Focusin or Focusout or Mouseleave.
     */
    const copyColorAndUpdateView = e => {
        if (self.cp && ! talwin.config.disabled) {
            let type = e.type;
            let isFocusIn = type === FOCUS_IN;

            // On click copy color and update svg to display a Check icon.
            if (! isCopied && type === CLICK) {
                isCopied = talwin._clr.copy();
                updateSVG();
            }else {
                // On focus add a focus class.
                if (! isFocusIn) {
                    // If the copy button lose focus or mouse leaves it,
                    // then reset the svg to a Clipboard icon.
                    if (isCopied) {
                        isCopied = false;
                        updateSVG();
                    }
                }

                updateClass(self.cp, FOCUS_CLASSNAME, isFocusIn);
            }
        }
    }

    /**
     * Events binding.
     */
    bindEvent(listeners, container, [CLICK, MOUSE_LEAVE, FOCUS_IN, FOCUS_OUT], copyColorAndUpdateView);

    return self;
}