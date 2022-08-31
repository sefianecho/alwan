import { createElement, replaceElement } from "../utils/dom";
import { isSet } from "../utils/util";

/**
 * Creates a Reference component.
 *
 * @param {Element} originalRef - User Reference Element.
 * @returns {Object}
 */
export const Reference = (originalRef) => {

    const self = {
        el: originalRef
    }

    /**
     * Sets/Unsets the pre-styled button.
     *
     * @param {Object} options - Picker options.
     */
    self.init = options => {

        let { preset } = options;

        if (isSet(preset)) {

            let el = self.el;
    
            if (preset !== (el !== originalRef)) {
                if (preset) {
                    // Replace the user provided reference element with a preset button.
                    el = replaceElement( createElement('button', 'tw-ref', null, { type: 'button' }), originalRef);
    
                } else {
                    // Set back user reference element.
                    el = replaceElement(originalRef, el);
                }
    
                self.el = el;
            }
        }
    }

    return self;
}