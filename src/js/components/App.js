import { BODY, RESIZE, SCROLL } from "../constants";
import { bindEvent, off, on, unbindEvent } from "../core/events/EventBinder";
import { scPop } from "../lib/scPop";
import { createElement, getElement, getScrollableAncestors, isInViewport } from "../utils/dom";


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

    let listeners = [];
    let isOpen = false;
    let scrollableAncestors = [];
    let popper;

    const root = createElement('', TALWIN_CLASSNAME, BODY);

    /**
     * Initializes app component.
     *
     * @param {Object} options - Talwin options.
     */
    const _init = (options) => {
        let { theme, popover, target, position, margin } = options;
        let refElement = talwin._ui.ref.$;
        let targetElement = getElement(target);
        let targetReference = targetElement || refElement;
        let method = 'add';

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
            method = 'remove';
            targetReference.insertAdjacentElement( (targetElement ? 'before' : 'after') + 'end', root);
        }

        // If it's popover then the method will be 'add', if it's not,
        // then the method will be 'remove'.
        root.classList[method](CLASS_NAME_POP);
    }


    /**
     * Update popper's position.
     *
     * @param {Event} e - Scroll or Resize event.
     */
    const updatePopper = e => {
        if (isOpen) {
            popper.update();

            // Close picker if the reference element is not visible in the viewport,
            // of nested scrollable elements.
            if (! isInViewport(talwin._ui.ref.el, scrollableAncestors)) {
                _close();
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

    return {
        root,
        _init
    }
}