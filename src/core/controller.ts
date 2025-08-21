import type Alwan from "..";
import { createComponents, renderComponents } from "../components";
import { CLICK, CLOSE, OPEN } from "../constants";
import { createPopover } from "../popover";
import { getRef } from "../ref";
import type { IPopover, IController } from "../types";
import {
    createDivElement,
    getBody,
    getElements,
    getInteractiveElements,
    removeElement,
    replaceElement,
    setColorProperty,
    setElementVisibility,
    toggleClassName,
    addEvent,
    removeEvent,
} from "../utils/dom";
import { deepMerge } from "../utils/object";

export const controller = (
    alwan: Alwan,
    userRef: Element | null,
): IController => {
    const { config, s: colorState } = alwan;
    const handleClick = () => alwan.toggle();
    const [selector, utility, sliders, inputs, swatches] =
        createComponents(alwan);
    let root: HTMLDivElement;
    let innerEl: HTMLDivElement;
    let isOpen = false;
    let popoverInstance: IPopover | null = null;
    let ref: HTMLElement | SVGElement;

    colorState._setHooks(
        // On update.
        (color) => {
            setColorProperty(ref, color.rgb);
            innerEl.style.cssText = `--rgb:${color.r},${color.g},${color.b};--a:${color.a};--h:${color.h}`;
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
            const self = this;
            const { id, color = colorState._value.hsl } = options;
            const { theme, parent, toggle, popover, target, disabled } =
                deepMerge(config, options);

            let parentEl = getElements(parent)[0];
            let targetEl = getElements(target)[0];

            ref = getRef(ref || userRef, userRef, config) as
                | HTMLElement
                | SVGElement;
            addEvent(ref, CLICK, handleClick);

            innerEl = createDivElement(
                "",
                renderComponents(
                    [selector, [utility, sliders], inputs, swatches],
                    config,
                ),
            );

            root = replaceElement(
                root,
                createDivElement("alwan", innerEl, {
                    id,
                    "data-theme": theme,
                    "data-popover": !!popover,
                }),
            );

            // Hide reference element if both toggle and popover options are set to false,
            setElementVisibility(ref, !popover && !toggle);

            if (popoverInstance) {
                popoverInstance._destroy();
                popoverInstance = null;
            }
            if (popover) {
                toggle && (parentEl = parentEl || getBody());
                popoverInstance = createPopover(
                    targetEl || ref,
                    root,
                    ref,
                    config,
                    self,
                );
            } else {
                // If there is a target element  or a parent element then append
                // the color picker widget in it, otherwise insert it after the reference element.
                parentEl = targetEl || parentEl;
                // Open if toggle is false, or leave it as the previous state if
                // the color picker is not disabled.
                self._toggle(!toggle || (!disabled && isOpen), true);
            }

            parentEl ? parentEl.append(root) : ref.after(root);

            if (disabled) {
                [
                    ref as HTMLButtonElement,
                    ...getInteractiveElements(root),
                ].forEach((element) => {
                    element.disabled = true;
                });
            }

            colorState._parse(color);
            return self;
        },

        _toggle(state = !isOpen, forced = false) {
            if (
                ((!popoverInstance || popoverInstance._isVisible()) &&
                    !config.disabled &&
                    config.toggle) ||
                forced
            ) {
                toggleClassName(root, "alwan--open", state);
                if (popoverInstance) {
                    popoverInstance._reposition(state, isOpen);
                }
                if (state !== isOpen) {
                    isOpen = state;
                    alwan.e._emit(isOpen ? OPEN : CLOSE);
                }
            }
        },

        _isOpen: () => isOpen,

        _reposition() {
            if (popoverInstance) {
                popoverInstance._reposition(isOpen, isOpen);
            }
        },

        _destroy() {
            removeElement(root);
            if (popoverInstance) {
                popoverInstance._destroy();
            }
            if (userRef) {
                removeEvent(userRef, CLICK, handleClick);
                replaceElement(ref, userRef);
            } else {
                removeElement(ref);
            }
        },
    };
};
