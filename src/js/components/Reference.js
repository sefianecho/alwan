import { CLICK, KEY_DOWN, TAB } from "../constants";
import { bindEvent, unbindEvent } from "../core/events/EventBinder";
import { createElement, replaceElement } from "../utils/dom";


const PRESET_BUTTON_CLASSNAME = 'tw-ref';

/**
 * Creates a Reference component.
 *
 * @param {Element} originalRef - User Reference Element.
 * @returns {Object}
 */
export const Reference = (originalRef, talwin) => {

    let listeners = [];

    const self = {
        $: originalRef,
        /**
         * Sets/Unsets the pre-styled button.
         *
         * @param {Object} options - Picker options.
         */
        _init(options) {
            let { preset, toggle } = options;
            let { _ui: { app, palette }} = talwin;
            let ref = self.$;
            listeners = unbindEvent(listeners, ref);
            
            if (preset !== (ref !== originalRef)) {
                ref = preset ?
                        // Replace the user provided reference element with a preset button.
                        replaceElement( createElement('button', PRESET_BUTTON_CLASSNAME, null, { type: 'button' }), originalRef)
                        // Set back user reference element.
                        : replaceElement(originalRef, ref);
            }

            if (toggle) {
                bindEvent(listeners, ref, CLICK, app._toggle);
                bindEvent(listeners, ref, KEY_DOWN, e => {
                    if (app._isOpen() && e.key === TAB && ! e.shiftKey) {
                        e.preventDefault();
                        palette.$.focus();
                    }
                });
            }
            ref.style.display = toggle ? '' : 'none';
            self.$ = ref;
        }
    }

    return self;
}