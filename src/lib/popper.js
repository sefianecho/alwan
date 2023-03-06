import { ROOT } from "../constants/globals";
import { getBounds, translate } from "../utils/dom";
import { abs, float, isNumeric } from "../utils/number";
import { objectIterator } from "../utils/object";
import { isString } from "../utils/string";

/**
 * Popper constants.
 */
const TOP = 'top';
const BOTTOM = 'bottom';
const RIGHT = 'right';
const LEFT = 'left';
const START = 'start';
const CENTER = 'center';
const END = 'end';

const dimension = {
    x: 'width',
    y: 'height'
}

const upperBound = {
    x: RIGHT,
    y: BOTTOM
}

const X_AXIS = 'x';
const Y_AXIS = 'y';

/**
 * Creates popper instance.
 *
 * @param {Element} reference - Popper reference element.
 * @param {Element} container - Popper container.
 * @param {object} param2 - Popper options.
 * @returns {object} - Popper instance.
 */
export const createPopper = (reference, container, { _margin, _position }) => {
    /**
     * Sides to fallback to.
     */
    let fallbackSides = {
        [TOP]:    [TOP, BOTTOM, RIGHT, LEFT],
        [BOTTOM]: [BOTTOM, TOP, RIGHT, LEFT],
        [RIGHT]:  [RIGHT, LEFT, TOP, BOTTOM],
        [LEFT]:   [LEFT, RIGHT, TOP, BOTTOM]
    };
    /**
     * Alignments to fallback to.
     */
    let fallbackAlignments = {
        start: [START, CENTER, END],
        center: [CENTER, START, END],
        end: [END, CENTER, START]
    };
    /**
     * Popup coordinates.
     */
    let coordinates;

    /**
     * Space between the reference and the container.
     */
    let margin = 5;

    /**
     * Side and alignment from the position.
     */
    let [side, alignment] = isString(_position) ? _position.split('-') : [];

    // Validate values.
    if (! fallbackSides[side]) {
        side = BOTTOM;
    }
    if (! alignment) {
        alignment = CENTER;
    } else if (! fallbackAlignments[alignment]) {
        alignment = START;
    }
    _margin = float(_margin);
    if (isNumeric(_margin)) {
        margin = _margin;
    }

    return {
        /**
         * Popper Reference element.
         *
         * @type {Element}
         */
        _reference: reference,

        /**
         * Update container's position.
         */
        _update() {
            let domBounds = getBounds(ROOT);
            let referenceBoundingRect = getBounds(reference);
            let containerBoundingRect = getBounds(container);

            coordinates = {
                x: null,
                y: null
            }

            /**
             * Check sides.
             */
            fallbackSides[side].some(referenceSide => {
                let axis = referenceSide === TOP || referenceSide === BOTTOM ? Y_AXIS : X_AXIS;

                let domBound = domBounds[referenceSide];
                let referenceBound = referenceBoundingRect[referenceSide];

                // The amount of space for the container.
                let containerSpace = margin + containerBoundingRect[dimension[axis]];
                // If container has available space.
                if (containerSpace <= abs(domBound - referenceBound)) {
                    // Calculate coordinate to set this side,
                    // for the top/left sides substruct the container space from the top/left bound of the reference element,
                    // and for the bottom/right sides just add the margin.
                    coordinates[axis] = referenceBound + (domBound ? margin : -containerSpace);
                    // Reverse the axises for the alignments.
                    axis = axis === X_AXIS ? Y_AXIS : X_AXIS;

                    /**
                     * Check alignments, only if the container is attached.
                     */
                    fallbackAlignments[alignment].some(alignment => {
                        // container width/height depends on the axis.
                        let containerDimension = containerBoundingRect[dimension[axis]];
                        // Lower bound is for the top/left coordinates.
                        // Upper bound is for the bottom/right coordinates.
                        // top/left coordinates are always lesser(lower) than bottom/right.
                        let {
                            [axis]: referenceLowerBound,
                            [upperBound[axis]]: referenceUpperBound,
                        } = referenceBoundingRect;
                        // Distance between the reference bottom/right coordinates and the DOM,
                        // bottom/right coordinates or boundries.
                        let upperBoundDistance = domBounds[upperBound[axis]] - referenceLowerBound;

                        // Offset between the container and the reference element.
                        let offset = (containerDimension + referenceBoundingRect[dimension[axis]]) / 2;

                        // Check for space availability and set the coordinate.
                        if (alignment === START && containerDimension <= upperBoundDistance) {
                            coordinates[axis] = referenceLowerBound;
                            return true;
                        }
                        if (alignment === CENTER && offset <= referenceUpperBound && offset <= upperBoundDistance) {
                            coordinates[axis] = referenceUpperBound - offset;
                            return true;
                        }
                        if (alignment === END && containerDimension <= referenceUpperBound) {
                            coordinates[axis] = referenceUpperBound - containerDimension;
                            return true;
                        }
                    });
                    // Exit the fallback sides loop.
                    return true;    
                }
            });
            // If there is no space to position the popover in all sides,
            // then center the popover in the screen.
            // If the popover is attached to one side but there is no space,
            // for the alignment than center it horizontally/vertically depends on the side.
            objectIterator(coordinates, (value, axis) => {
                if (value === null) {
                    coordinates[axis] = (domBounds[upperBound[axis]] - containerBoundingRect[dimension[axis]]) / 2;
                }
            });

            translate(container, coordinates.x, coordinates.y);
        }
    }
}