import { BODY, ENTER, KEY_DOWN, RESIZE, SCROLL, TAB } from "../constants";
import { bindEvent, unbindEvent } from "../core/events/EventBinder";
import { scPop } from "../lib/scPop";
import { createElement, getElement, getLastFocusableElement, getScrollableAncestors, isInViewport, removeElement, updateClass } from "../utils/dom";
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

    let listeners = [];
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
        let { theme, popover, target, position, margin, disabled } = options;
        let refElement = talwin._ui.ref.$;
        let targetElement = getElement(target);
        let targetReference = targetElement || refElement;

        popper = null;
        popperEvents(unbindEvent);

        /**
         * Set Theme.
         */
        root.dataset.theme = theme === DARK_THEME ? DARK_THEME : LIGHT_THEME;

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

        disable(disabled);
    }


    /**
     * Update popper's position.
     *
     * @param {Event} e - Scroll or Resize event.
     */
    const updatePopper = e => {
        if (_isOpen) {
            popper.update();

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
        scrollableAncestors.forEach(scrollable => {
            listeners = eventBinder(listeners, scrollable, SCROLL, updatePopper);
        });

        // On window resize reposition the popper.
        listeners = eventBinder(listeners, window, RESIZE, updatePopper);
    }

    /**
     * Open color picker.
     */
    const open = (silent) => {
        if (! _isOpen && ! config.disabled) {
            popper && popper.update();
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
     * Handles keyboard navigation and interaction.
     *
     * @param {Event} e - Keydown.
     */
    const handleKeyboard = e => {
        let { key, target, shiftKey } = e;
        let { _ui: { palette, ref } } = talwin;
        let isPalette = target === palette.$;
        /**
         * Pressing the Enter key in an input, closes the picker.
         */
        if (key === ENTER && target.type === 'text') {
            close(true);
        } else if (key === TAB) {
            // Pressing the Tab + shift on the palette,
            // or pressing the Tab on the last focusable element in the picker,
            // will send the focus back to the reference.
            if ((! shiftKey && target === getLastFocusableElement(root)) || (isPalette && shiftKey)) {
                e.preventDefault();
                ref.$.focus();
            }
        } else if (isPalette) {
            palette.keyboard(e, key);
        }
    }

    /**
     * Disable/Enable Picker.
     *
     * @param {Boolean} state - Picker state disabled (true) or enabled (false).
     */
    const disable = state => {

        state = !!state;
        let ref = talwin._ui.ref.$;

        config.disabled = state

        if (state) {
            close(true);
        }

        if (isset(ref.disabled)) {
            ref.disabled = state;
        } else {
            updateClass(ref, 'tw-disabled', state);
        }
    }


    bindEvent(listeners, root, KEY_DOWN, handleKeyboard);

    return {
        $: root,
        init,
        isOpen,
        open,
        close,
        toggle,
        disable
    }
}