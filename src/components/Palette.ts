import type Alwan from '..';
import { BACKDROP_CLASSNAME, MARKER_CLASSNAME, PALETTE_CLASSNAME } from '../constants/classnames';
import {
    ARIA_LABEL,
    ARROW_KEYS,
    BLUR,
    DOC_ELEMENT,
    KEY_DOWN,
    PALETTE_ID,
    POINTER_DOWN,
    POINTER_MOVE,
    POINTER_UP,
    ROOT,
} from '../constants/globals';
import { addEvent, removeEvent } from '../core/events/binder';
import { DOMRectArray, IPalette } from '../types';
import {
    createDivElement,
    getBounds,
    setAttribute,
    toggleClassName,
    translate,
} from '../utils/dom';
import { boundNumber, min } from '../utils/math';

/**
 * Color picking area, pick color by dragging the marker.
 *
 * @param param0 - Alwan instance.
 * @param parent - Insert palette element relative to this element.
 * @returns - Palette component.
 */
export const Palette = ({ _color: colorState }: Alwan, parent: HTMLElement): IPalette => {
    let markerX: number;
    let markerY: number;
    let paletteBounds: DOMRectArray;
    let isDisabled: boolean;

    const palette = createDivElement(PALETTE_CLASSNAME, parent);
    const marker = createDivElement(MARKER_CLASSNAME, palette);

    /**
     * Moves marker and updates the color state.
     * Moves it using a pointer (mouse, touch or pen) or keyboard arrow keys.
     *
     * @param e - Pointer Event.
     * @param step - Move marker a step in one of the 4 directions.
     */
    const moveMarkerAndUpdateColor = (
        e: PointerEvent | null,
        [stepX, stepY]: [x: number, y: number] = [0, 0]
    ) => {
        let [x, y, width, height] = paletteBounds;
        let v: number, l: number;

        if (e) {
            markerX = e.clientX - x;
            markerY = e.clientY - y;
        } else {
            markerX += (stepX * width) / 100;
            markerY += (stepY * height) / 100;
        }
        markerX = boundNumber(markerX, width);
        markerY = boundNumber(markerY, height);

        translate(marker, markerX, markerY);

        v = 1 - markerY / height;
        l = v * (1 - markerX / (2 * width));

        colorState._update(
            {
                s: l === 1 || l === 0 ? 0 : ((v - l) / min(l, 1 - l)) * 100,
                l: l * 100,
            },
            PALETTE_ID
        );
    };

    /**
     * Drag handler to add or remove.
     *
     * @param e - PointerEvent.
     */
    const dragMove = (e: Event) => {
        if ((<PointerEvent>e).buttons) {
            moveMarkerAndUpdateColor(e as PointerEvent);
        } else {
            // If pointer is up but the pointerup event didn't fire then
            // remove dragging.
            setDragging(false);
        }
    };

    /**
     * Handles drag end (release).
     *
     */
    const dragEnd = () => {
        colorState._change();
        setDragging(false);
    };

    /**
     * Handles window loses focus while dragging the marker (picker).
     */
    const windowBlur = () => {
        colorState._change();
    };

    /**
     * Set/Unset dragging by adding/removing pointermove event and add/remove
     * the backdrop.
     *
     * @param dragging - Whether to set (true) or unset (false) dragging.
     */
    const setDragging = (dragging: boolean) => {
        toggleClassName(DOC_ELEMENT, BACKDROP_CLASSNAME, dragging);
        (dragging ? addEvent : removeEvent)(ROOT, POINTER_MOVE, dragMove);
        (dragging ? addEvent : removeEvent)(window, BLUR, windowBlur);
    };

    /**
     * Handles dragging the marker (picker).
     */
    addEvent(palette, POINTER_DOWN, (e) => {
        if (!isDisabled) {
            /**
             * Drag start.
             */
            colorState._cache();
            paletteBounds = getBounds(palette);
            moveMarkerAndUpdateColor(<PointerEvent>e);
            /**
             * Drag move.
             */
            setDragging(true);
            /**
             * Drag end.
             */
            addEvent(ROOT, POINTER_UP, dragEnd, { once: true });
        }
    });

    /**
     * Moves marker using keyboard arrow keys.
     */
    addEvent(palette, KEY_DOWN, (e: Event) => {
        const steps = ARROW_KEYS[(<KeyboardEvent>e).key];

        if (steps) {
            e.preventDefault();
            paletteBounds = getBounds(palette);
            colorState._cache();
            moveMarkerAndUpdateColor(null, steps);
            colorState._change();
        }
    });

    return {
        /**
         * Palette element.
         */
        el: palette,

        /**
         * Initialize components.
         *
         * @param param0 - Alwan options.
         */
        _init({ i18n, disabled }) {
            setAttribute(palette, ARIA_LABEL, i18n.palette);
            setAttribute(palette, 'tabindex', disabled ? '' : 0);
            isDisabled = disabled;
        },

        /**
         * Updates picker marker's position.
         *
         * @param s - HSL saturation.
         * @param l - HSL lightness
         */
        _updateMarker(s, l) {
            let v = l + s * min(l, 1 - l);
            paletteBounds = getBounds(palette);
            markerX = (v ? 2 * (1 - l / v) : 0) * paletteBounds[2];
            markerY = (1 - v) * paletteBounds[3];
            translate(marker, markerX, markerY);
        },
    };
};
