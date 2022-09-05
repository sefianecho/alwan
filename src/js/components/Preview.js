import { BLUR, CLICK, FOCUS_CLASSNAME, FOCUS_IN, MOUSE_LEAVE } from "../constants";
import { bindEvent } from "../core/events/EventBinder";
import { checkSVGAttrs, clipboardSVGAttrs } from "../lib/svg";
import { createElement, removeElement } from "../utils/dom";

const PREVIEW_CLASSNAME = 'talwin__preview';

export const Preview = (parent, talwin) => {
    
    let isCopied = false;
    let listeners = [];

    const container = createElement('', 'tw-mr1', parent);

    const self = {
        el: null,
        cp: null,

        /**
         * Init. Preview, copy button.
         *
         * @param {Object} options - Picker options.
         */
        init(options) {
            let { preview, copy } = options;
            let previewArea = self.$;
            let copyButton = self.cp;

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

            container.style.display = copyButton || previewArea ? '' : 'none';

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
        if (self.cp) {
            let type = e.type;
            let method;

            // On click copy color and update svg to display a Check icon.
            if (! isCopied && type === CLICK) {
                isCopied = talwin._clr.copy();
                updateSVG();
            }else {
                // On focus add a focus class.
                if (type === FOCUS_IN) {
                    method = 'add';
                } else {
                    // On focusout remove the focus class.
                    method = 'remove';

                    // If the copy button lose focus or mouse leaves it,
                    // then reset the svg to a Clipboard icon.
                    if (isCopied) {
                        isCopied = false;
                        updateSVG();
                    }
                }
                self.cp.classList[method](FOCUS_CLASSNAME);
            }
        }
    }


    bindEvent(listeners, container, [CLICK, MOUSE_LEAVE, FOCUS_IN, BLUR], copyColorAndUpdateView);

    return self;
}