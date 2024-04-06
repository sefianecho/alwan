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
    setCustomProperty,
    toggleClassName,
} from '../utils/dom';
import { isString } from '../utils/is';
import { isArray } from '../utils/object';

/**
 * Creates color swatches.
 *
 * @param alwan - Alwan instance.
 * @returns - Swatches component.
 */
export const Swatches = (alwan: Alwan): ISwatches => {

    let container: HTMLDivElement | null;
    let swatchesContainer: HTMLDivElement | null;
    let collapseButton: HTMLButtonElement | null;

    return {
        /**
         * Creates color swatches.
         *
         * @param param0 - Alwan options.
         */
        _init({ swatches, toggleSwatches, i18n: { buttons } }) {
            if (!isArray(swatches)) {
                return container;
            }

            // Initialize elements.
            container = swatchesContainer = collapseButton = null;

            if (!swatches.length) {
                return container;
            }

            swatchesContainer = container = createDivElement(
                SWATCHES_CLASSNAME,
                swatches.map(color =>
                    // Set custom property on the created button and returns it (the button).
                    setCustomProperty(
                        createButton(
                            SWATCH_CLASSNAME,
                            '',
                            {},
                            buttons.swatch,
                            isString(color) ? color: parseColor(color, true)
                        ),
                        COLOR,
                        parseColor(color, true)
                    )
                )
            );

            if (toggleSwatches) {
                collapseButton = createButton(
                    COLLAPSE_BUTTON_CLASSNAME,
                    caretSVG,
                    {},
                    buttons.toggleSwatches
                );
                /**
                * Handles toggle swatches button click.
                */
                addEvent(collapseButton, CLICK, () => {
                    toggleClassName(<Element>swatchesContainer, COLLAPSE_CLASSNAME);
                    alwan._app._reposition();
                });

                container = createDivElement('', [swatchesContainer, collapseButton]);
            }

            /**
            * Handles clicks in the swatches container.
            */
            addEvent(swatchesContainer, CLICK, ({ target }: Event) => {
                if (target !== swatchesContainer) {
                    alwan._color._setColor(
                        (<HTMLButtonElement>target).style.getPropertyValue('--' + COLOR),
                        0,
                        true,
                        true
                    );
                }
            });

            return container;
        },
    };
};
