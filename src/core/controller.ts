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
    replaceElement,
    setColorProperty,
    hideElement,
    toggleModifierClass,
    addEvent,
    removeEvent,
} from "../utils/dom";
import { deepMerge } from "../utils/object";

export const controller = (
    alwan: Alwan,
    userRef: Element | null,
): IController => {
    let innerEl = createDivElement();
    let isOpen = false;
    let popoverInstance: IPopover | null = null;
    let ref: HTMLElement | SVGElement;

    const { config, s: colorState } = alwan;
    const root = createDivElement(innerEl, "alwan");
    const [selector, utility, sliders, inputs, swatches] =
        createComponents(alwan);

    const handleClick = () => alwan.toggle();

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

            ref = getRef(ref || userRef, userRef, config) as
                | HTMLElement
                | SVGElement;

            let parentEl = getElements(parent)[0];
            let targetEl = getElements(target)[0] || ref;

            addEvent(ref, CLICK, handleClick);

            id && (root.id = id);
            toggleModifierClass(root, "dark", theme === "dark");
            toggleModifierClass(root, "block", !popover);

            innerEl = replaceElement(
                innerEl,
                createDivElement(
                    renderComponents(
                        [selector, [utility, sliders], inputs, swatches],
                        config,
                    ),
                ),
            );

            // Hide reference element if both toggle and popover options are set to false,
            hideElement(ref, !popover && !toggle);

            if (popoverInstance) {
                popoverInstance._destroy();
                popoverInstance = null;
            }
            if (popover) {
                parentEl = parentEl || (toggle && getBody());
                popoverInstance = createPopover(
                    targetEl,
                    root,
                    ref,
                    config,
                    self,
                );
            } else {
                // Open if toggle is false, or leave it as the previous state if
                // the color picker is not disabled.
                self._toggle(!toggle || (!disabled && isOpen), true);
            }

            parentEl ? parentEl.append(root) : targetEl.after(root);

            if (disabled) {
                [
                    ref as HTMLButtonElement,
                    ...getInteractiveElements(root),
                ].forEach((element) => {
                    element.disabled = true;
                });
            }

            colorState._parse(color);
        },

        _toggle(state = !isOpen, forced = false) {
            if (
                (state !== isOpen &&
                    (!popoverInstance || popoverInstance._isVisible()) &&
                    !config.disabled &&
                    config.toggle) ||
                forced
            ) {
                toggleModifierClass(root, OPEN, state);
                if (popoverInstance) {
                    popoverInstance._reposition(state, isOpen);
                }
                isOpen = state;
                alwan.e._emit(isOpen ? OPEN : CLOSE);
            }
        },

        _isOpen: () => isOpen,

        _reposition() {
            if (popoverInstance) {
                popoverInstance._reposition(isOpen, isOpen);
            }
        },

        _destroy() {
            root.remove();
            if (popoverInstance) {
                popoverInstance._destroy();
            }
            if (userRef) {
                removeEvent(userRef, CLICK, handleClick);
                replaceElement(ref, userRef);
            } else {
                ref.remove();
            }
        },
    };
};
