import { checkSVGAttrs, clipboardSVGAttrs } from "../lib/svg";
import { createElement, removeElement } from "../utils/dom";

const PREVIEW_CLASSNAME = 'talwin__preview';

export const Preview = (parent, talwin) => {
    let isCopied = false;
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
            let previewArea = self.el;
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
                    setCopyButtonIcon(thisButton);
                });
            }

            container.style.display = copyButton || previewArea ? '' : 'none';

            self.el = previewArea;
            self.cp = copyButton;
        }
    }


    /**
     * Sets a SVG icon for the copy button.
     *
     * @param {HTMLElement} button - Button.
     */
    const setCopyButtonIcon = (button) => {
        button = button || self.cp;
        button.innerHTML = '';
        createElement('svg', '', button, isCopied ? checkSVGAttrs : clipboardSVGAttrs);
    }

    return self;
}