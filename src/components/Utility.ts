import type Alwan from '..';
import { checkSVG, clipboardSVG } from '../assets/svg';
import { COPY_BUTTON_CLASSNAME, PREVIEW_CLASSNAME } from '../constants/classnames';
import {
    BLUR,
    CLICK,
    DOC_ELEMENT,
    INPUT,
    INSERT_BEFORE_FIRST_CHILD,
    MOUSE_OUT,
    ROOT,
} from '../constants/globals';
import { addEvent } from '../core/events/binder';
import type { IUtility } from '../types';
import {
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
 * @param parent - Element to insert utility elements to.
 * @returns - Utility component.
 */
export const Utility = (alwan: Alwan, parent: HTMLElement): IUtility => {
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
        const input = createElement(INPUT, '', DOC_ELEMENT, '', { value: color });
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
        if (!isCopied && !alwan.config.disabled) {
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
            previewElement = removeElement(previewElement);
            copyButton = removeElement(copyButton);
            if (preview) {
                previewElement = createDivElement(
                    PREVIEW_CLASSNAME,
                    parent,
                    {},
                    INSERT_BEFORE_FIRST_CHILD
                );
            }
            if (copy) {
                copyButton = createButton(
                    COPY_BUTTON_CLASSNAME,
                    previewElement || parent,
                    clipboardSVG,
                    {},
                    i18n.buttons.copy,
                    '',
                    INSERT_BEFORE_FIRST_CHILD
                );
                /**
                 * Add events.
                 */
                addEvent(copyButton, CLICK, copyColor);
                // Reset clipboard icon.
                addEvent(copyButton, BLUR, () => isCopied && setButtonIcon(false));
                addEvent(copyButton, MOUSE_OUT, () => copyButton!.blur());
            }
        },
    };
};
