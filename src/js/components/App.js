import { BODY, CLOSE, ESCAPE, KEY_DOWN, MOUSE_DOWN, OPEN, RESIZE, ROOT, SCROLL, TAB } from "../constants";
import { bindEvent, unbindEvent } from "../core/events/EventBinder";
import { scPop } from "../lib/scPop";
import { createElement, getElement, getLastFocusableElement, getScrollableAncestors, isInViewport, setVisibility, updateClass } from "../utils/dom";
import { merge } from "../utils/object";
/**
 * App component constants.
 */
const ALWAN_CLASSNAME = 'alwan';
const POPPER_CLASSNAME = 'tw-popper';
const DISABLED_CLASSNAME = 'tw-disabled';


/**
 * App component.
 *
 * @param {Object} alwan - Alwan Instance.
 * @returns {Object}
 */
export const App = (alwan) => {

    let { config, _e: { emit }, _s: colorState } = alwan;

    /**
     * Top container.
     *
     * @type {HTMLElement}
     */
    let root = createElement('', ALWAN_CLASSNAME, BODY);

    /**
     * App API.
     */
    let self = {
        e: []
    }

    /**
     * Picker visibility state.
     */
    let _isOpen = false;

    /**
     * Reference element scrollable ancestors.
     *
     * @type {Array<Element>}
     */
    let scrollableAncestors = [];

    /**
     * Popper object.
     *
     * @type {Object}
     */
    let popper;

    /**
     * Initializes app component.
     *
     * @param {Object} options - Alwan options.
     */
    const init = (options) => {
        let { theme, popover, target, position, margin, disabled, id, toggle } = options;
        let refElement = alwan._ui.ref.$;
        let targetElement = getElement(target);
        let targetReference = targetElement || refElement;

        if (id) {
            root.id = id;
        }
        // Remove all popper events.
        popperEvents(unbindEvent);

        /**
         * Set disable.
         */
        disable(disabled);

        /**
         * Set Theme.
         */
        root.dataset.theme = theme;

        // Toggle option is false, picker is always open.
        if (! toggle) {
            open(true);
        }

        // Hide reference if both popover and toggle are false.
        setVisibility(refElement, popover || toggle);

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
        updateClass(root, POPPER_CLASSNAME, popover);
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
            if (! isInViewport(alwan._ui.ref.$, scrollableAncestors)) {
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
            let components = alwan._ui;
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
     * Repositions the popper.
     */
    const reposition = () => {
        popper && popper.update();
    }


    /**
     * Opens the color picker.
     *
     * @param {Boolean} silent - Whether to trigger the open event or not.
     */
    const open = (silent) => {
        if (! _isOpen && ! config.disabled) {
            // Update inputs.
            colorState.update({}, true);
            reposition();
            // Add open class.
            updateClass(root, OPEN, true);
            _isOpen = true;
            ! silent && emit(OPEN);
        }
    }

    /**
     * Closes the color picker.
     *
     * @param {Boolean} silent - Whether to trigger the close event or not.
     */
    const close = (silent) => {
        if (_isOpen && config.toggle) {
            // Remove open class.
            updateClass(root, OPEN, false);
            _isOpen = false;
            ! silent && emit(CLOSE);
        }
    }

    /**
     * Toggles (opens/closes) the color picker.
     */
    const toggle = () => {
        _isOpen ? close() : open();
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
        config.disabled = state;
        state && close(true);
        // Add/Remove disable class.
        updateClass(alwan._ui.ref.$, DISABLED_CLASSNAME, state);
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
