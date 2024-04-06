import type Alwan from '..';
import { Inputs, Palette, Reference, Sliders, Swatches, Utility } from '../components';
import { ALWAN_CLASSNAME, OPEN_CLASSNAME } from '../constants/classnames';
import {
    CLOSE,
    COLOR,
    INPUTS_ID,
    OPEN,
    PALETTE_ID,
    RGB_FORMAT,
    SLIDERS_ID,
} from '../constants/globals';
import { createPopover } from '../lib/popover';
import type { HTMLElementHasDisabled, IPopover, alwanApp, alwanConfig } from '../types';
import {
    appendChildren,
    bodyElement,
    createContainer,
    createDivElement,
    getElements,
    getInteractiveElements,
    removeElement,
    setCustomProperty,
    setHTML,
    toggleClassName,
} from '../utils/dom';
import { isString, isset } from '../utils/is';
import { deepMerge } from '../utils/object';

/**
 * Creates and initialize components.
 *
 * @param alwan - Alwan instance.
 * @param userRef - User reference.
 * @returns - App.
 */
export const createApp = (alwan: Alwan, ref: string | Element): alwanApp => {
    const config = alwan.config;
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
            _init: (config: alwanConfig) => createContainer([Utility(alwan), sliders].map(component => component._init(config)))
        },
        inputs,
        Swatches(alwan)
    ];

    let isOpen = false;
    let popoverInstance: IPopover | null = null;
    let refElement: HTMLElement | SVGAElement;

    // Append root to the body.
    appendChildren(bodyElement(), root);

    return {
        /**
         * Setup color picker and update it with the given options.
         *
         * @param options - Alwan options.
         */
        _setup(options) {
            options = options || {};
            const self = this;
            const data = root.dataset;
            const colorState = alwan._color;
            const { id, color } = options;
            const { theme, toggle, popover, target, disabled } = deepMerge(config, options);
            const targetElement = getElements(target)[0];

            setHTML(root, '');
            appendChildren(root, ...components.map(component => component._init(config)));

            // initialize reference and returns the element.
            refElement = <HTMLElement | SVGAElement>reference._init(config);

            // Set id.
            isString(id) && (root.id = id);
            // Set theme (dark or light).
            data.theme = theme;
            // Set display mode.
            data.display = popover ? 'popover' : 'block';

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
            if (popover) {
                popoverInstance = createPopover(
                    targetElement || refElement,
                    root,
                    refElement,
                    config,
                    self
                );
            } else {
                // If there is a target element then append the color picker widget in it,
                // otherwise insert it after the reference element.
                if (targetElement) {
                    appendChildren(targetElement, root);
                } else {
                    refElement.after(root);
                }
            }

            // Set color option.
            if (isset(color)) {
                colorState._setColor(color);
            } else {
                colorState._update({});
            }
            // Disable/Enable color picker.
            [refElement, ...getInteractiveElements(root)].forEach((element) => {
                (element as HTMLElementHasDisabled).disabled = !!disabled;
            });
            if (disabled) {
                if (popover) {
                    self._toggle(false, true);
                } else if (!toggle) {
                    self._toggle(true, true);
                }
            }
        },

        /**
         * Updates UI and components.
         *
         * @param state - Color state.
         * @param componentId - Id of the component that updating the color.
         */
        _update(state, componentId) {
            const { r, g, b, a, h, s, l, rgb } = state;
            setCustomProperty(refElement, COLOR, rgb);
            setCustomProperty(root, RGB_FORMAT, `${r},${g},${b}`);
            setCustomProperty(root, 'a', a);
            setCustomProperty(root, 'h', h);

            if (componentId !== PALETTE_ID && componentId !== SLIDERS_ID) {
                palette._updateMarker(s / 100, l / 100);
                sliders._setValues(h, a);
            }
            if (componentId !== INPUTS_ID) {
                inputs._setValues(state);
            }
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
                    popoverInstance._update();
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
                popoverInstance._update();
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
