import { ARROW_KEYS, KEY_DOWN, WHEEL } from '../constants/globals';
import { addEvent } from '../core/events/binder';
import type { DOMRectArray, SliderConstructor } from '../types';
import { createDivElement, getBounds, setAttribute, translate } from '../utils/dom';
import { boundNumber, precision, roundBy, sign } from '../utils/math';
import { Draggable } from './draggable';

/**
 * Creates a custom slider input.
 *
 * @param classname - Slider classname.
 * @param parent - Element to insert the slider into.
 * @param change - Change callback, called every time the slider value changes.
 * @param max - Slider max attribute.
 * @param step - Slider step Attribute.
 * @returns - Created slider.
 */
export const createSlider: SliderConstructor = (classname, parent, change, max, step) => {
    let trackBounds: DOMRectArray;
    let startingValue: number;
    let stepWidth: number;
    let value = 0;

    const track = createDivElement('slider ' + classname, parent, {
        role: 'slider',
        tabindex: 0,
        'aria-valuemax': max,
    });
    const thumb = createDivElement('thumb', track);
    const stepPrecision = precision(step);

    /**
     * Updates thumb position and aria-valuenow value.
     *
     * @param x - Thumb new X coordinate.
     */
    const updateUI = (x: number) => {
        setAttribute(track, 'aria-valuenow', value);
        translate(thumb, x, 0);
    };

    /**
     * Sets a new value.
     *
     * @param newValue - Value.
     */
    const _setValue = (newValue: number, emitChange?: boolean) => {
        newValue = roundBy(newValue, stepPrecision);
        if (newValue !== value && newValue <= max && newValue >= 0) {
            value = newValue;
            updateUI((value * getBounds(track)[2]) / max);
            if (emitChange) {
                change(value, track);
                change(value, track, true);
            }
        }
    };

    /**
     * Moves the thumb and updates value and UI.
     *
     * @param e - PointerEvent.
     */
    const move = (e: Event) => {
        let x = boundNumber(
            (<PointerEvent>e).clientX - trackBounds[0] /* track x coordinate */,
            trackBounds[2] /** track width */
        );
        let offset = x % stepWidth;
        let newValue: number;

        x -= offset;

        if (offset > stepWidth / 2) {
            x += stepWidth;
        }

        newValue = roundBy((x / stepWidth) * step, stepPrecision);

        if (newValue !== value) {
            value = newValue;
            change(value, track);
            updateUI(x);
        }
    };

    /**
     * Calls change callback.
     */
    const triggerChange = () => {
        if (startingValue !== value) {
            change(value, track, true);
        }
    };

    /**
     * Drag start.
     */
    Draggable(
        track,
        (e) => {
            trackBounds = getBounds(track);
            stepWidth = (step * trackBounds[2]) / max;
            startingValue = value;
            move(e);
        },
        move,
        triggerChange,
        triggerChange
    );

    /**
     * Increase/Decrease value using keyboard arrow keys.
     */
    addEvent(track, KEY_DOWN, (e) => {
        const steps = ARROW_KEYS[(<KeyboardEvent>e).key];
        if (steps) {
            e.preventDefault();
            _setValue(value + step * (steps[0] - steps[1]), true);
        }
    });

    /**
     * Increase/Decrease value using mouse wheel
     */
    addEvent(track, WHEEL, (e) => {
        e.preventDefault();
        _setValue(value - sign((<WheelEvent>e).deltaY) * step, true);
    });

    return {
        el: track,
        _setValue,
    };
};
