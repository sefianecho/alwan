import { abs, float, HTML } from "../constants";
import { getBounds } from "../utils/dom";

/**
 * Constants
 */
const TOP = 'top';
const RIGHT = 'right';
const BOTTOM = 'bottom';
const LEFT = 'left';
const START = 'start';
const CENTER = 'center';
const END = 'end';
const WIDTH = 'width';
const HEIGHT = 'height';

/**
 * Display an element as a popover.
 *
 * @param {Element} ref - Popper reference element.
 * @param {Element} pop - Popper element.
 * @param {Object} options - Options.
 * @returns {Object}
 */
export const Popper = (ref, pop, options) => {

    options = options || {};

    /**
     * Popper options.
     */
    let { margin, position } = options;

    /**
     * Position is devided into, side and alignment.
     */
    let [side, alignment] = position ? position.split('-') : [];

    /**
     * Sides to fallback to.
     */
    let sides = {
        [TOP]: [TOP, BOTTOM, RIGHT, LEFT],
        [BOTTOM]: [BOTTOM, TOP, RIGHT, LEFT],
        [RIGHT]: [RIGHT, LEFT, TOP, BOTTOM],
        [LEFT]: [LEFT, RIGHT, TOP, BOTTOM],
    }

    /**
     * Alignments to fallback to.
     */
    let alignments = {
        [START]: [START, CENTER, END],
        [CENTER]: [CENTER, START, END],
        [END]: [END, CENTER, START],
    };

    /**
     * Document bounds.
     *
     * @type {object}
     */
    let domBounds;

    /**
     * Reference element bounds.
     *
     * @type {object}
     */
    let refBoundingRect;

    /**
     * Pop element bounds.
     *
     * @type {object}
     */
    let popBoundingRect;

    // Normalize options values.
    margin = margin == null ? 6 : float(margin);
    side = sides[side] ? side : BOTTOM;
    alignment = alignment ? alignments[alignment] ? alignment : START : CENTER;


    /**
     * Sets popper's position.
     *
     * @param {Boolean} isVertical - Indicate whether the popper is displayed on the Y axes.
     * @param {Number} value - Value of the top or left css property.
     */
    const setPosition = (isVertical, value) => {
        if (value !== false) {
            pop.style[isVertical ? TOP : LEFT] = value + 'px';
        }
    }

    /**
     * Positions the popper in the screen center vertically or horizontally.
     *
     * @param {Boolean} isVertical - Indicate whether the popper is displayed on the Y axes.
     */
    const centerPopElement = (isVertical) => {
        let dimension = WIDTH;
        let maxBoundary = RIGHT;
    
        if (isVertical) {
            dimension = HEIGHT;
            maxBoundary = BOTTOM;
        }

        setPosition(isVertical, (domBounds[maxBoundary] - popBoundingRect[dimension]) / 2);
    }

    /**
     * Updates popper's position.
     */
    const _update = () => {
        domBounds = {
            top: 0,
            left: 0,
            right: HTML.clientWidth,
            bottom: HTML.clientHeight
        }

        refBoundingRect = getBounds(ref);
        popBoundingRect = getBounds(pop);

        let isPopPlaced = sides[side].some(side => {

            let isVertical = side === TOP || side === BOTTOM;
            let domBoundary = domBounds[side];
            let refBound = refBoundingRect[side];
            // Space taken by the pop element.
            let space = margin + popBoundingRect[isVertical ? HEIGHT : WIDTH];
            let hasSpace = space <= abs(domBoundary - refBound);

            if (hasSpace) {
                setPosition(isVertical, refBound + (domBoundary ? margin : -space));

                // The pop element is positioned in the one of the 4 sides,
                // Now its alignment.
                let isPopAligned = alignments[alignment].some(alignment => {

                    let dimension = HEIGHT;
                    let lowerBound = TOP;
                    let upperBound = BOTTOM;

                    if (isVertical) {
                        dimension = WIDTH;
                        lowerBound = LEFT;
                        upperBound = RIGHT;
                    }
                    // Reference lower bound top or left.
                    let refLowerBound = refBoundingRect[lowerBound];
                    // Reference upper bound bottom or right.
                    let refUpperBound = refBoundingRect[upperBound];

                    // Space between the document lower bound (top or left) and,
                    // the reference upper bound (bottom or right).
                    let lowerSpace = abs(domBounds[lowerBound] - refUpperBound);
                    // Space between the document upper bound (bottom or right) and,
                    // the reference lower bound (top or left).
                    let upperSpace = abs(domBounds[upperBound] - refLowerBound);

                    // Dimension could be height or width.
                    let refDimension = refBoundingRect[dimension];
                    let popDimension = popBoundingRect[dimension];

                    // Center align pop element with the reference,
                    // this is the distance between (lower/upper) bound of the reference,
                    // and the (lower/upper) bound of the pop element.
                    let offset = (popDimension + refDimension) / 2;

                    // Check the space and get the position value in pixels.
                    let placement = {
                        [START]: popDimension <= upperSpace && refLowerBound,
                        [CENTER]: offset <= lowerSpace && offset <= upperSpace && refUpperBound - offset,
                        [END]: popDimension <= lowerSpace && refUpperBound - popDimension,
                    }

                    placement = placement[alignment];
                    setPosition(! isVertical, placement);
                    return placement !== false;
                });

                if (! isPopAligned) {
                    centerPopElement(! isVertical);
                }
            }

            return hasSpace;
        });

        if (! isPopPlaced) {
            centerPopElement(true);
            centerPopElement();
        }
    }

    _update();

    return {
        _update
    }
}