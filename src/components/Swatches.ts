import type Alwan from '..';
import { caretSVG } from '../assets/svg';
import {
    COLLAPSE_BUTTON_CLASSNAME,
    COLLAPSE_CLASSNAME,
    SWATCHES_CLASSNAME,
    SWATCH_CLASSNAME,
} from '../constants/classnames';
import { CLICK, COLOR } from '../constants/globals';
import { addEvent } from '../core/events/binder';
import { parseColor } from '../lib/colors/parser';
import type { ISwatches } from '../types';
import {
    createButton,
    createDivElement,
    removeElement,
    setCustomProperty,
    toggleClassNames,
} from '../utils/dom';
import { isString } from '../utils/is';
import { isArray } from '../utils/object';

/**
 * Creates color swatches.
 *
 * @param parent - Element to insert swatches to.
 * @returns - Swatches component.
 */
export const Swatches = (alwan: Alwan, parent: HTMLElement): ISwatches => {
    let container: HTMLDivElement | null;
    let collapseButton: HTMLButtonElement | null;

    return {
        /**
         * Creates color swatches.
         *
         * @param param0 - Alwan options.
         */
        _init({ swatches, toggleSwatches, i18n }) {
            if (isArray(swatches)) {
                // Initialize.
                container = removeElement(container);
                collapseButton = removeElement(collapseButton);
                if (swatches.length) {
                    // Create swatches container.
                    container = createDivElement(SWATCHES_CLASSNAME, parent);
                    // Create swatch buttons.
                    swatches.forEach((color) => {
                        setCustomProperty(
                            createButton(
                                SWATCH_CLASSNAME,
                                container,
                                '',
                                {},
                                i18n.buttons.swatch,
                                isString(color) ? color : parseColor(color, true)
                            ),
                            COLOR,
                            parseColor(color, true)
                        );
                    });
                    // Create or remove the collapse button depend if the toggleSwatches,
                    // option changes.
                    if (toggleSwatches) {
                        collapseButton = createButton(COLLAPSE_BUTTON_CLASSNAME, parent, caretSVG);
                        /**
                         * Handles toggle swatches button click.
                         */
                        addEvent(collapseButton, CLICK, () => {
                            toggleClassNames(<Element>container, COLLAPSE_CLASSNAME);
                            // TODO: Reposition the popover.
                        });
                    }
                    /**
                     * Handles clicks in the swatches container.
                     */
                    addEvent(container, CLICK, ({ target }: Event) => {
                        if (target !== container) {
                            alwan._color._setColor(
                                (<HTMLButtonElement>target).style.getPropertyValue('--' + COLOR),
                                <HTMLButtonElement>target,
                                0,
                                true
                            );
                        }
                    });
                }
            }
        },
    };
};
