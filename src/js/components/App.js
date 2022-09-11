import { BODY, ESCAPE, KEY_DOWN, MOUSE_DOWN, RESIZE, ROOT, SCROLL, TAB } from "../constants";
import { bindEvent, unbindEvent } from "../core/events/EventBinder";
import { scPop } from "../lib/scPop";
import { createElement, getElement, getLastFocusableElement, getScrollableAncestors, isInViewport, removeElement, updateClass } from "../utils/dom";
import { merge } from "../utils/object";
import { isset } from "../utils/util";


const TALWIN_CLASSNAME = 'talwin';
const CLASS_NAME_POP = 'tw-popper';
const DARK_THEME = 'dark';
const LIGHT_THEME = 'light';

/**
 * App component.
 *
 * @param {Object} talwin - Talwin Instance.
 * @returns {Object}
 */
export const App = (talwin) => {
    
    let root = createElement('', TALWIN_CLASSNAME, BODY);

    let self = {
        e: []
    }

    let _isOpen = false;
    let scrollableAncestors = [];
    let popper;
    const { config, _e: { emit } } = talwin;

    /**
     * Initializes app component.
     *
     * @param {Object} options - Talwin options.
     */
    const init = (options) => {
        let { theme, popover, target, position, margin, disabled, id } = options;
        let refElement = talwin._ui.ref.$;
        let targetElement = getElement(target);
        let targetReference = targetElement || refElement;

        if (id) {
            root.id = id;
        }


        popperEvents(unbindEvent);

        /**
         * Set disable.
         */
        disable(disabled);

        /**
         * Set Theme.
         */
        root.dataset.theme = theme === DARK_THEME ? DARK_THEME : LIGHT_THEME;

        /**
         * Set Popper.
         */
        if (popover) {
            self.popper = popper = scPop(targetReference, root, {
                position,
                margin
            });
            // If reference element inside a nested scrollable elements,
            // get all those scrollable elements in an array.
            scrollableAncestors = getScrollableAncestors(refElement);

            // Attach scroll event to all scrollable ancestors of the reference element,
            // in order to update the popper's position.
            // On window resize reposition the popper.
            popperEvents(bindEvent);
        } else {
            targetReference.insertAdjacentElement( (targetElement ? 'before' : 'after') + 'end', root);
        }
        // If it's popover then the method will be 'add', if it's not,
        // then the method will be 'remove'.
        updateClass(root, CLASS_NAME_POP, popover);
    }


    /**
     * Update popper's position.
     *
     * @param {Event} e - Scroll or Resize event.
     */
    const updatePopper = e => {
        if (_isOpen) {
            reposition();

            // Close picker if the reference element is not visible in the viewport,
            // of nested scrollable elements.
            if (! isInViewport(talwin._ui.ref.$, scrollableAncestors)) {
                close(true);
            }
        }
    }

    /**
     * Binds/Unbinds events for updating the popper's position.
     *
     * @param {Function} eventBinder - Bind/Unbind events.
     */
    const popperEvents = (eventBinder) => {
        let listeners = self.e;

        scrollableAncestors.forEach(scrollable => {
            listeners = eventBinder(listeners, scrollable, SCROLL, updatePopper);
        });

        // On window resize reposition the popper.
        listeners = eventBinder(listeners, window, RESIZE, updatePopper);
        listeners = eventBinder(listeners, ROOT, [MOUSE_DOWN, KEY_DOWN], handlesAccessibility);

        self.e = listeners;
    }

    /**
     * Hanldes accessibility.
     * 
     * If picker is displayed as a popover,
     * send focus from reference element to the picker and vice versa,
     * close picker on Escape key press or click away from the picker or the reference element.
     *
     * @param {Event}
     */
    const handlesAccessibility = e => {

        if (_isOpen) {

            let { target, type, key, shiftKey } = e;
            let components = talwin._ui;
            let refElement = components.ref.$;
            let palette = components.palette.$;
            let elementToFocus;
            // Clicking outside the picker or pressing Escape key, results in,
            // closing the picker.
            if (key === ESCAPE || (type === MOUSE_DOWN && refElement !== target && ! root.contains(target))) {
                close();
            } else if (key === TAB) {
                // Pressing Tab on reference element sends focus to the picker palette.
                if (target === refElement && !shiftKey) {
                    elementToFocus = palette;
                // If picker is displayed as a popover,
                // Pressing Tab + shift on the palette,
                // or pressing Tab on the last focusable element in the picker,
                // sends the focus back to the reference element.
                } else if ((! shiftKey && target === getLastFocusableElement(root)) || (target === palette && shiftKey)) {
                    elementToFocus = refElement;
                }

                if (elementToFocus) {
                    e.preventDefault();
                    elementToFocus.focus();
                }
            }
        }
    }


    /**
     * Repositions popper.
     */
    const reposition = () => {
        popper && popper.update();
    }


    /**
     * Open color picker.
     */
    const open = (silent) => {
        if (! _isOpen && ! config.disabled) {
            reposition();
            ! silent && emit('open');
            updateClass(root, 'open', true);
            _isOpen = true;
        }
    }

    /**
     * Close color picker.
     */
    const close = (silent) => {
        if (_isOpen && config.toggle) {
            ! silent && emit('close');
            updateClass(root, 'open', false);
            _isOpen = false;
        }
    }

    /**
     * Open/Close color picker.
     */
    const toggle = (triggerEvent) => {
        _isOpen ? close(triggerEvent) : open(triggerEvent);
    }

    /**
     * Gets the state of the picker, opened or closed.
     *
     * @returns {Boolean}
     */
    const isOpen = () => _isOpen;

    /**
     * Disable/Enable Picker.
     *
     * @param {Boolean} state - Picker state disabled (true) or enabled (false).
     */
    const disable = state => {

        state = !!state;
        let ref = talwin._ui.ref.$;

        config.disabled = state;

        if (state) {
            close(true);
        }

        if (isset(ref.disabled)) {
            ref.disabled = state;
        } else {
            updateClass(ref, 'tw-disabled', state);
        }
    }

    return merge(self, {
        $: root,
        init,
        isOpen,
        open,
        close,
        toggle,
        disable,
        reposition,
    });
}