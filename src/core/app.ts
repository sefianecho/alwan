import type Alwan from '..';
import { Inputs, Palette, Reference, Sliders, Swatches, Utility } from '../components';
import { ALWAN_CLASSNAME, CONTAINER_CLASSNAME, OPEN_CLASSNAME } from '../constants/classnames';
import {
    CLOSE,
    OPEN,
} from '../constants/globals';
import { createPopover } from '../popover';
import type { HTMLElementHasDisabled, IPopover, alwanApp, alwanConfig } from '../types';
import {
    BODY_ELE,
    appendChildren,
    initBodyElement,
    createDivElement,
    getElements,
    getInteractiveElements,
    removeElement,
    setHTML,
    toggleClassName,
} from '../utils/dom';
import { isString, isset } from '../utils/is';
import { deepMerge, merge } from '../utils/object';

/**
 * Creates and initialize components.
 *
 * @param alwan - Alwan instance.
 * @param userRef - User reference.
 * @returns - App.
 */
export const createApp = (alwan: Alwan, ref: string | Element): alwanApp => {
    initBodyElement();
    const { config, _color: colorState } = alwan;
    /**
     * Widget root element.
     */
    const root = createDivElement(ALWAN_CLASSNAME);
    const reference = Reference(alwan, getElements(ref)[0]);
    /**
     * Create components.
     */
    const palette = Palette(alwan);
    const sliders = Sliders(alwan);
    const inputs = Inputs(alwan);
    const components = [
        palette,
        {
            _init: (config: alwanConfig) =>
                createDivElement(
                    CONTAINER_CLASSNAME,
                    ...[Utility(alwan), sliders].map(component => component._init(config))
                )
        },
        inputs,
        Swatches(alwan)
    ];

    let isOpen = false;
    let popoverInstance: IPopover | null = null;

    colorState._setUIElements(root, palette, sliders, inputs);

    return {
        /**
         * Setup color picker and update it with the given options.
         *
         * @param options - Alwan options.
         */
        _setup(options) {
            options = options || {};
            const self = this;
            const { id, color } = options;
            const { theme, parent, toggle, popover, target, disabled } = deepMerge(config, options);
            const refElement = <HTMLElement>reference._init(config);
            const parentElement = getElements(parent)[0];
            const targetElement = getElements(target)[0];

            colorState._setRef(refElement);

            removeElement(root);
            setHTML(root, '');
            appendChildren(root, ...components.map(component => component._init(config)));

            // Set id.
            isString(id) && (root.id = id);

            merge(root.dataset, {
                theme,
                display: popover ? 'popover' : 'block'
            });

            // If toggle option changed to false, then open (show) the picker
            if (!toggle) {
                self._toggle(true, true);
            }
            // Hide reference element if both toggle and popover options are set to false,
            // and the components are not shared.
            refElement.style.display = popover || toggle ? '' : 'none';

            if (popoverInstance) {
                popoverInstance._destroy();
                popoverInstance = null;
            }

            appendChildren(parentElement || BODY_ELE, root);

            if (popover) {
                popoverInstance = createPopover(
                    targetElement || refElement,
                    root,
                    refElement,
                    config,
                    self
                );
            } else {
                // If there is a target element  or a parent element then append
                // the color picker widget in it, otherwise insert it after the reference element.
                if (targetElement || parentElement) {
                    appendChildren(targetElement || parentElement, root);
                } else {
                    refElement.after(root);
                }
            }

            // Set color option.
            if (isset(color)) {
                colorState._setColor(color);
            }

            // Disable/Enable color picker.
            [refElement, ...getInteractiveElements(root)].forEach((element) =>
                (element as HTMLElementHasDisabled).disabled = !!disabled
            );
            if (disabled) {
                if (popover) {
                    self._toggle(false, true);
                } else if (!toggle) {
                    self._toggle(true, true);
                }
            }

            // update ui.
            colorState._update({}, true, true, true);
        },

        /**
         * Toggles color picker visibility.
         *
         * @param state - Open (true) or close (false).
         * @param forced - Open/Close picker even if it's disabled or toggle is set to false.
         */
        _toggle(state = !isOpen, forced = false) {
            if (
                state !== isOpen &&
                (!config.disabled || (forced && (!state || !config.popover))) &&
                (config.toggle || forced)
            ) {
                if (state && popoverInstance) {
                    popoverInstance._reposition();
                }
                isOpen = state;
                toggleClassName(root, OPEN_CLASSNAME, state);
                alwan._events._emit(isOpen ? OPEN : CLOSE);
            }
        },
        /**
         * @returns - State of the color picker (opened or closed).
         */
        _isOpen: () => isOpen,

        /**
         * Updates popover position.
         */
        _reposition() {
            if (popoverInstance) {
                popoverInstance._reposition();
            }
        },

        /**
         * Removes root element from the DOM and clean event listeners
         * attached to the document.
         */
        _destroy() {
            removeElement(root);
            if (popoverInstance) {
                popoverInstance._destroy();
            }
            reference._destroy();
        },
    };
};
