import { CLICK } from "./constants";
import type { IRefController, alwanConfig } from "./types";
import {
    addEvent,
    createButton,
    getBody,
    removeEvent,
    replaceElement,
} from "./utils/dom";

export const refController = (
    userRef: Element | null,
    toggleFn: () => void,
): IRefController => {
    const button = createButton();
    const className = button.className + " alwan__ref ";
    let ref: Element;

    if (userRef && userRef.id) {
        button.id = userRef.id;
    }

    return {
        _getEl(config: alwanConfig) {
            ref = replaceElement(
                ref || userRef,
                config.preset || !userRef ? button : userRef,
            );
            if (ref === button) {
                ref.className = (className + config.classname).trim();
                if (!ref.parentNode) {
                    getBody().append(ref);
                }
            }
            addEvent(ref, CLICK, toggleFn);

            return ref as HTMLElement | SVGElement;
        },

        _remove() {
            if (userRef) {
                removeEvent(userRef, CLICK, toggleFn);
                replaceElement(ref, userRef);
            } else {
                ref.remove();
            }
        },
    };
};
