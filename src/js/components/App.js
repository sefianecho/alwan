import { BODY, BUTTON, CLOSE, ESCAPE, INPUT, KEY_DOWN, MOUSE_DOWN, OPEN, RESIZE, ROOT, SCROLL, TAB } from "../constants";
import { bindEvent, unbindEvent } from "../core/events/EventBinder";
import { scPop } from "../lib/scPop";
import { createElement, getElement, getScrollableAncestors, isInViewport, setVisibility, updateClass } from "../utils/dom";
import { merge, objectIterator } from "../utils/object";
import { setColorAndTriggerEvents } from "../utils/util";
/**
 * App component constants.
 */
const ALWAN_CLASSNAME = 'alwan';
const POPPER_CLASSNAME = 'lw-popper';
const DISABLED_CLASSNAME = 'lw-disabled';


/**
 * App component.
 *
 * @param {Object} alwan - Alwan Instance.
 * @returns {Object}
 */
export const App = (alwan) => {

    let { config, _e: { _emit }, _s: colorState } = alwan;

    /**
     * Top container.
     *
     * @type {HTMLElement}
     */
    let root = createElement('', ALWAN_CLASSNAME, BODY);

    /**
     * Picker Reference.
     *
     * @type {Element}
     */
    let reference;

    /**
     * App API.
     */
    let self = {
        e: []
    }

    /**
     * Picker visibility state.
     */
    let isOpen = false;

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
     * Last focusable element in picker.
     * 
     * @type {Element}
     */
    let lastFocusableElement;

    /**
     * Initialize app.
     *
     * @param {Object} options - Alwan options.
     */
    const _setup = (options) => {
        options = options || {};

        let config = merge(alwan.config, options);
        let { theme, popover, target, position, margin, disabled, id, toggle } = config;
        let targetElement = getElement(target);
        let color = options.color;
        let targetReference;

        if (id) {
            root.id = id;
        }

        /**
         * Initialize components.
         */
        objectIterator(alwan._c, component => {
            let init = component._init;
            if (init) {
                init(config);
            }
        });

        /**
         * Initialize color.
         */
        if (color) {
            setColorAndTriggerEvents(alwan, color);
        }

        reference = alwan._c.ref.$;
        targetReference = targetElement || reference;

        // Remove all popper events.
        popperEvents(unbindEvent);

        /**
         * Set disable.
         */
        _setDisable(disabled);

        /**
         * Set Theme.
         */
        root.dataset.theme = theme;

        // Toggle option is false, picker is always open.
        if (! toggle) {
            _open(true);
        }

        // Hide reference if both popover and toggle are false.
        setVisibility(reference, popover || toggle);

        /**
         * Set Popper.
         */
        if (popover) {
            popper = scPop(targetReference, root, {
                position,
                margin
            });
            // If reference element inside a nested scrollable elements,
            // get all those scrollable elements in an array.
            scrollableAncestors = getScrollableAncestors(reference);

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

        lastFocusableElement = getElement(BUTTON + ',' + INPUT, root, true);
        lastFocusableElement = lastFocusableElement[lastFocusableElement.length - 1];
    }


    /**
     * Update popper's position.
     *
     * @param {Event} e - Scroll or Resize event.
     */
    const updatePopper = e => {
        if (isOpen) {
            _reposition();

            // Close picker if the reference element is not visible in the viewport,
            // of nested scrollable elements.
            if (! isInViewport(reference, scrollableAncestors)) {
                _close(true);
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

        if (isOpen) {
            let { target, type, key, shiftKey } = e;
            let palette = alwan._c.palette.$;
            let elementToFocus;
            // Clicking outside the picker or pressing Escape key, results in,
            // closing the picker.
            if (key === ESCAPE || (type === MOUSE_DOWN && reference !== target && ! root.contains(target))) {
                _close();
            } else if (key === TAB) {
                // Pressing Tab on reference element sends focus to the picker palette.
                if (target === reference && !shiftKey) {
                    elementToFocus = palette;
                // If picker is displayed as a popover,
                // Pressing Tab + shift on the palette,
                // or pressing Tab on the last focusable element in the picker,
                // sends the focus back to the reference element.
                } else if ((! shiftKey && target === lastFocusableElement) || (target === palette && shiftKey)) {
                    elementToFocus = reference;
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
    const _reposition = () => {
        popper && popper._update();
    }


    /**
     * Opens the color picker.
     *
     * @param {Boolean} silent - Whether to trigger the open event or not.
     */
    const _open = (silent) => {
        if (! isOpen && ! config.disabled) {
            // Update inputs.
            colorState._update({}, true);
            _reposition();
            // Add open class.
            updateClass(root, OPEN, true);
            isOpen = true;
            ! silent && _emit(OPEN);
        }
    }

    /**
     * Closes the color picker.
     *
     * @param {Boolean} silent - Whether to trigger the close event or not.
     */
    const _close = (silent) => {
        if (isOpen && config.toggle) {
            // Remove open class.
            updateClass(root, OPEN, false);
            isOpen = false;
            ! silent && _emit(CLOSE);
        }
    }

    /**
     * Toggles (opens/closes) the color picker.
     */
    const _toggle = () => {
        isOpen ? _close() : _open();
    }

    /**
     * Gets the state of the picker, opened or closed.
     *
     * @returns {Boolean}
     */
    const _isOpen = () => isOpen;

    /**
     * Disable/Enable Picker.
     *
     * @param {Boolean} state - Picker state disabled (true) or enabled (false).
     */
    const _setDisable = state => {
        config.disabled = state;
        state && _close(true);
        // Add/Remove disable class.
        updateClass(reference, DISABLED_CLASSNAME, state);
    }

    return merge(self, {
        $: root,
        _setup,
        _isOpen,
        _open,
        _close,
        _toggle,
        _setDisable,
        _reposition,
    });
}
