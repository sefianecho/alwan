import { BODY, HTML, max } from "../constants";
import { getBounds } from "../utils/dom";


const TOP = 1;
const RIGHT = 2;
const BOTTOM = 3;
const LEFT = 4;
const START = 5;
const CENTER = 6;
const END = 7;

const sides = {
    top: TOP,
    right: RIGHT,
    bottom: BOTTOM,
    left: LEFT,
};

const alignments = {
    start: START,
    center: CENTER,
    end: END,
};


/**
 * Sets popover's position relative to an element.
 *
 * @param {HTMLElement} ref     - Reference element.
 * @param {HTMLElement} pop     - Popper element.
 * @param {Object}      options - Options.
 * @returns {Object}
 */
export const scPop = (ref, pop, options) => {
    /**
     * SC Pop options.
     */
    options = options || {};

    /**
     * Reference element width.
     */
    let refWidth;

    /**
     * Reference element height.
     */
    let refHeight;

    /**
     * Reference element Left,
     * X coordinate.
     */
    let refLeft;

    /**
     * Reference element Top,
     * Y coordinate.
     */
    let refTop;

    /**
     * Reference element Bottom,
     * Y coordinate + height.
     */
    let refBottom;

    /**
     * Reference element Right,
     * X coordinate + width.
     */
    let refRight;

    /**
     * Reference element horizontal center,
     * X coordinate + width / 2.
     */
    let refCenterX;

    /**
     * Reference element vertical center,
     * Y coordinate + height / 2.
     */
    let refCenterY;

    /**
     * Pop element width.
     */
    let popWidth;

    /**
     * Pop element height.
     */
    let popHeight;

    /**
     * Pop element width with margin.
     */
    let popOffsetWidth;

    /**
     * Pop element height with margin.
     */
    let popOffsetHeight;

    /**
     * Document height.
     */
    let docHeight;

    /**
     * Document width.
     */
    let docWidth;

    /**
     * Pop margin.
     */
    let margin = parseFloat(options.margin) || 4;

    /**
     * Pop position.
     */
    let position = options.position ? options.position.split("-") : [];

    /**
     * Pop position side.
     */
    let side = sides[position[0]] || BOTTOM;

    /**
     * Pop position alignment.
     */
    let alignment = position[1] ? alignments[position[1]] || START : CENTER;

    /**
     * Pop Y coordinate.
     */
    let popTop = 0;

    /**
     * Pop X coordinate.
     */
    let popLeft = 0;

    /**
     * Pop inline CSS object.
     */
    let popStyle = pop.style;

    /**
     * Check if space is available for positioning the pop on the one of the 4 sides.
     *
     * @param {Number} side - Position side.
     * @returns {boolean}
     */
    const hasSpaceForSides = side => side === TOP && refTop >= popOffsetHeight ||
        side === BOTTOM && docHeight - refBottom >= popOffsetHeight ||
        side === RIGHT && docWidth - refRight >= popOffsetWidth ||
        side === LEFT && refLeft >= popOffsetWidth;

    /**
     * Check if space is available for aligning the pop element.
     *
     * @param {Number} alignment - Position alignment.
     * @param {boolean} isVertical - Pop is on the Top side or the Bottom side.
     * @returns {boolean}
     */
    const hasSpaceForAlignment = (alignment, isVertical) => alignment === START ? isVertical ? docWidth - refLeft >= popWidth : docHeight - refTop >= popHeight
        : alignment === CENTER ? isVertical ? 2 * (docWidth - refCenterX) >= popWidth && refCenterX * 2 >= popWidth : 2 * (docHeight - refCenterY) >= popHeight && refCenterY * 2 >= popHeight
            : isVertical ? refRight >= popWidth : refBottom >= popHeight;

    /**
     * Place the pop in one of the 4 sides.
     *
     * @param {Number} side - Position side.
     */
    const setSide = side => {
        popTop = side === TOP ? refTop - popOffsetHeight : side === BOTTOM ? refBottom + margin : 0;
        popLeft = side === RIGHT ? refRight + margin : side === LEFT ? refLeft - popOffsetWidth : 0;
    }



    /**
     * Place the pop in one of the 3 alignments.
     *
     * @param {Number} alignment - Position alignment.
     * @param {boolean} isVertical - Pop is on the Top side or the Bottom side.
     */
    const setAlignment = (alignment, isVertical) => {
        if (alignment === START) {
            isVertical ? popLeft = refLeft : popTop = refTop;
        } else if (alignment === CENTER) {
            isVertical ? popLeft = refLeft - popWidth / 2 + refWidth / 2 : popTop = refTop - popHeight / 2 + refHeight / 2;
        } else {
            isVertical ? popLeft = refRight - popWidth : popTop = refBottom - popHeight;
        }
    }

    /**
     * Center the pop element vertically to the screen.
     */
    const centerPopVertically = () => (docHeight - popHeight) / 2;

    /**
     * Center the pop element horizontally to the screen.
     */
    const centerPopHorizontally = () => (docWidth - popWidth) / 2;

    /**
     * Fallback positions order.
     */
    const fallbacksPositions = {
        /**
         * Sides to fallback to.
         */
        [TOP]: [TOP, BOTTOM, RIGHT, LEFT],
        [BOTTOM]: [BOTTOM, TOP, RIGHT, LEFT],
        [RIGHT]: [RIGHT, LEFT, TOP, BOTTOM],
        [LEFT]: [LEFT, RIGHT, TOP, BOTTOM],
        /**
         * Alignments to fallback to.
         */
        [START]: [START, CENTER, END],
        [CENTER]: [CENTER, START, END],
        [END]: [END, CENTER, START],
    };

    /**
     * Position the pop element.
     */
    const setPosition = () => {

        ({
            width: refWidth,
            height: refHeight,
            top: refTop,
            right: refRight,
            bottom: refBottom,
            left: refLeft,
        } = getBounds(ref));

        // Cash the ref center coordinates.
        refCenterX = refLeft + refWidth / 2;
        refCenterY = refTop + refHeight / 2;

        // Pop bounds.
        ({ width: popWidth, height: popHeight } = getBounds(pop));

        popOffsetWidth = popWidth + margin;
        popOffsetHeight = popHeight + margin;

        // Document dimensions.
        let docBounds = getBounds(HTML);
        docWidth = docBounds.width;
        docHeight = max(HTML.clientHeight, docBounds.height, getBounds(BODY).height);

        // Reference sides to use.
        let sidesArray = fallbacksPositions[side],
            positionSide,
            sideIsSet = false,
            alignmentIsSet = false;

        let i = 0;
        while (i < sidesArray.length && !sideIsSet) {
            positionSide = sidesArray[i];

            if (hasSpaceForSides(positionSide)) {
                // Set the position.
                setSide(positionSide);
                sideIsSet = true;
            }

            i++;
        }

        // The pop is successfully placed in one of the 4 sides.
        if (sideIsSet) {
            let alignmentsArray = fallbacksPositions[alignment];
            let isVertical = positionSide === TOP || positionSide === BOTTOM;
            let j = 0;
            // Check the alignments.
            while (j < alignmentsArray.length && !alignmentIsSet) {
                const positionAlignment = alignmentsArray[j];

                if (hasSpaceForAlignment(positionAlignment, isVertical)) {
                    // Set the alignment position.
                    setAlignment(positionAlignment, isVertical);
                    alignmentIsSet = true;
                }

                j++;
            }

            // Center the element to the screen if all alignments fail.
            if (!alignmentIsSet) {
                isVertical ? popLeft = centerPopHorizontally() : popTop = centerPopVertically();
            }
        } else {
            // Pop has no space to fit in in all 4 sides.
            // Center the pop vertically and horizontally to the screen.
            popTop = centerPopVertically();
            popLeft = centerPopHorizontally();
        }

        popStyle.top = popTop + 'px';
        popStyle.left = popLeft +'px';
    }

    setPosition();

    return {
        update: setPosition
    }
}