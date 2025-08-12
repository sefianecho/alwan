import type Alwan from "..";
import { createComponents, renderComponents } from "../components";
import { ALWAN_CLASSNAME, OPEN_CLASSNAME } from "../constants/classnames";
import { CLICK, CLOSE, COLOR, OPEN, RGB_FORMAT } from "../constants/globals";
import { createPopover } from "../popover";
import { getRef } from "../ref";
import type { HTMLElementHasDisabled, IPopover, alwanApp } from "../types";
import {
    appendChildren,
    createDivElement,
    getBody,
    getElements,
    getInteractiveElements,
    removeElement,
    replaceElement,
    setCustomProperty,
    setInnerHTML,
    toggleClassName,
} from "../utils/dom";
import { isString, isset } from "../utils/is";
import { deepMerge, merge } from "../utils/object";
import { addEvent, removeEvent } from "./events/binder";

export const createApp = (alwan: Alwan, userRef: Element | null): alwanApp => {
    const { config, _color: colorState } = alwan;
    const root = createDivElement(ALWAN_CLASSNAME);
    const handleClick = () => alwan.toggle();
    const [selector, utility, sliders, inputs, swatches] =
        createComponents(alwan);
    let isOpen = false;
    let popoverInstance: IPopover | null = null;
    let ref: HTMLElement | SVGElement;

    colorState._setHooks(
        // On update.
        (color) => {
            setCustomProperty(ref, COLOR, color.rgb);
            setCustomProperty(root, "a", color.a);
            setCustomProperty(root, "h", color.h);
            setCustomProperty(
                root,
                RGB_FORMAT,
                `${color.r},${color.g},${color.b}`,
            );
            inputs._setValues(color);
        },
        // On setcolor.
        ({ a, h, s, l }) => {
            sliders._setValues(h, a);
            selector._updateCursor(s, l);
        },
    );

    return {
        _setup(options) {
            options = options || {};
            const self = this;
            const { id, color } = options;
            const { theme, parent, toggle, popover, target, disabled } =
                deepMerge(config, options);

            const parentElement = getElements(parent)[0];
            const targetElement = getElements(target)[0];

            ref = getRef(ref || userRef, userRef, config) as
                | HTMLElement
                | SVGElement;
            addEvent(ref, CLICK, handleClick);

            removeElement(root);
            setInnerHTML(root, "");
            appendChildren(
                root,
                ...renderComponents(
                    [selector, [utility, sliders], inputs, swatches],
                    config,
                ),
            );

            isString(id) && (root.id = id);
            merge(root.dataset, {
                theme,
                display: popover ? "popover" : "block",
            });

            // Hide reference element if both toggle and popover options are set to false,
            ref.style.display = popover || toggle ? "" : "none";

            if (popoverInstance) {
                popoverInstance._destroy();
                popoverInstance = null;
            }
            if (popover) {
                appendChildren(parentElement || getBody(), root);
                popoverInstance = createPopover(
                    targetElement || ref,
                    root,
                    ref,
                    config,
                    self,
                );
            } else {
                // If there is a target element  or a parent element then append
                // the color picker widget in it, otherwise insert it after the reference element.
                if (targetElement || parentElement) {
                    appendChildren(targetElement || parentElement, root);
                } else {
                    ref.after(root);
                }
            }

            if (!toggle) {
                self._toggle(true, true);
            }

            // Disable/Enable color picker.
            [ref, ...getInteractiveElements(root)].forEach(
                (element) =>
                    ((element as HTMLElementHasDisabled).disabled = !!disabled),
            );
            if (disabled) {
                if (popover) {
                    self._toggle(false, true);
                } else if (!toggle) {
                    self._toggle(true, true);
                }
            }

            if (isset(color)) {
                colorState._setColor(color);
            }

            // Update ui.
            colorState._update({}, false, false);
        },

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

        _isOpen: () => isOpen,

        _reposition() {
            if (popoverInstance) {
                popoverInstance._reposition();
            }
        },

        _destroy() {
            removeElement(root);
            if (popoverInstance) {
                popoverInstance._destroy();
            }
            if (userRef) {
                removeEvent(userRef, CLICK, handleClick);
                replaceElement(userRef, ref);
            } else {
                removeElement(ref);
            }
        },
    };
};
