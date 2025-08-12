import type Alwan from "..";
import { checkSVG, clipboardSVG } from "../assets/svg";
import { BLUR, CLICK, MOUSE_LEAVE } from "../constants/globals";
import { addEvent } from "../core/events/binder";
import type { IUtility } from "../types";
import {
    createButton,
    createDivElement,
    setElementVisibility,
} from "../utils/dom";

/**
 * Color preview and copy Button.
 */
export const Utility = (alwan: Alwan): IUtility => ({
    _init({ preview, copy, i18n }) {
        let copyButton: HTMLButtonElement | undefined;
        let setIcon: (isCopied?: boolean) => void;
        let clipboardIcon: SVGElement;
        let checkIcon: SVGElement;
        let clipboard: Clipboard;

        if (copy) {
            copyButton = createButton(
                i18n.buttons.copy,
                "alwan__cp",
                clipboardSVG + checkSVG,
            );
            [clipboardIcon, checkIcon] =
                copyButton.children as unknown as SVGElement[];

            setIcon = (isCopied) => {
                setElementVisibility(clipboardIcon, isCopied);
                setElementVisibility(checkIcon, !isCopied);
            };
            setIcon(false);

            clipboard = navigator.clipboard;
            if (clipboard) {
                addEvent(copyButton, CLICK, () =>
                    clipboard
                        .writeText(alwan._color._getColorString())
                        .then(() => setIcon(true)),
                );
                addEvent(copyButton, BLUR, () => setIcon());
                addEvent(copyButton, MOUSE_LEAVE, () => copyButton!.blur());
            }
        }

        return preview
            ? createDivElement("alwan__preview", copyButton)
            : copyButton;
    },
});
