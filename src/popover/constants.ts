import { alignment, side } from "../types";

// Indexes in the DOMRectArray.
export const LEFT = 0; // Also the x coordinate.
export const TOP = 1; // Also the y coordinate.
export const WIDTH = 2;
export const HEIGHT = 3;
export const RIGHT = 4;
export const BOTTOM = 5;

export const START = 0;
export const CENTER = 1;
export const END = 2;
// Margin between the popover and the window edges.
export const GAP = 3;

// Sides to fallback to for each side.
export const fallbackSides: Record<side, number[]> = {
	top: [TOP, BOTTOM, RIGHT, LEFT],
	bottom: [BOTTOM, TOP, RIGHT, LEFT],
	right: [RIGHT, LEFT, TOP, BOTTOM],
	left: [LEFT, RIGHT, TOP, BOTTOM],
};

// Alignments to fallback to for each alignment.
export const fallbackAlignments: Record<alignment, number[]> = {
	start: [START, CENTER, END],
	center: [CENTER, START, END],
	end: [END, CENTER, START],
};
