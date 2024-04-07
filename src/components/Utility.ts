import type Alwan from '..';
import { checkSVG, clipboardSVG } from '../assets/svg';
import { COPY_BUTTON_CLASSNAME, PREVIEW_CLASSNAME } from '../constants/classnames';
import {
    BLUR,
    CLICK,
    DOC_ELEMENT,
    INPUT,
    MOUSE_OUT,
    ROOT,
} from '../constants/globals';
import { addEvent } from '../core/events/binder';
import type { IUtility } from '../types';
import {
    appendChildren,
    createButton,
    createDivElement,
    createElement,
    removeElement,
    setHTML,
} from '../utils/dom';

/**
 * Previews and copies current color.
 *
 * @param alwan - Instance.
 * @returns - Utility component.
 */
export const Utility = (alwan: Alwan): IUtility => {
    let previewElement: HTMLDivElement | null;
    let copyButton: HTMLButtonElement | null;
    let isCopied = false;

    /**
     * Set button icon.
     *
     * @param {boolean} state - Copy state.
     */
    const setButtonIcon = (state: boolean) => {
        isCopied = state;
        setHTML(copyButton!, state ? checkSVG : clipboardSVG);
    };

    /**
     * Copy color fallback if browser doesn't support 'navigator.clipboard'.
     *
     * @param {string} color - Color to copy.
     */
    const fallback = (color: string) => {
        const input = createElement(INPUT);
        appendChildren(DOC_ELEMENT, input);
        input.value = color;
        input.select();
        ROOT.execCommand('copy');
        removeElement(input);
        copyButton!.focus();
        // change icon.
        setButtonIcon(true);
    };

    /**
     * Copies the selected color to the clipboard.
     */
    const copyColor = () => {
        if (!isCopied) {
            const clipboard = navigator.clipboard;
            const color = alwan._color._colorString();

            if (clipboard) {
                clipboard
                    .writeText(color)
                    .then(() => setButtonIcon(true))
                    .catch(() => fallback(color));
            } else {
                fallback(color);
            }
        }
    };

    return {
        /**
         * Initializes the utility component.
         *
         * @param param0 - Alwan options.
         */
        _init({ preview, copy, i18n }) {
            // Initialize elements.
            previewElement = copyButton = null;

            if (copy) {
                copyButton = createButton(
                    i18n.buttons.copy,
                    COPY_BUTTON_CLASSNAME,
                    clipboardSVG,
                );
                /**
                 * Add events.
                 */
                addEvent(copyButton, CLICK, copyColor);
                // Reset clipboard icon.
                addEvent(copyButton, BLUR, () => isCopied && setButtonIcon(false));
                addEvent(copyButton, MOUSE_OUT, () => copyButton!.blur());
            }

            if (preview) {
                previewElement = createDivElement(
                    PREVIEW_CLASSNAME,
                    copyButton,
                );
            }

            return previewElement || copyButton;
        },
    };
};
