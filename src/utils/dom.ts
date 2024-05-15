import { BUTTON_CLASSNAME, SLIDER_CLASSNAME } from "../constants/classnames";
import {
	ARIA_LABEL,
	BUTTON,
	DOC_ELEMENT,
	INPUT,
	ROOT,
} from "../constants/globals";
import type { Attrs, DOMRectArray } from "../types";
import { isElement, isNumber, isString } from "./is";
import { ObjectForEach, toArray } from "./object";

export const getBody = () => ROOT.body;

export const getElements = (
	reference: string | Element,
	context: Element = DOC_ELEMENT,
) => {
	if (isString(reference) && reference.trim()) {
		return toArray(context.querySelectorAll(reference));
	}
	// Reference must be an element in the page.
	if (isElement(reference)) {
		return [reference];
	}

	return [];
};

export const getInteractiveElements = (context: HTMLElement) =>
	getElements(`${INPUT},${BUTTON},[tabindex]`, context);

export const appendChildren = (
	element: Element,
	...children: Array<Element | null>
) => element.append(...(children.filter((child) => child) as Array<Element>));

export const setInnerHTML = (element: Element, html: string) => {
	element.innerHTML = html;
};

export const setAttribute = (
	el: Element | null,
	name: string,
	value: string | number,
) => {
	if (el && (isNumber(value) || value)) {
		el.setAttribute(name, value + "");
	}
};

export const joinClassnames = (...classnames: string[]) =>
	classnames.join(" ").trim();

export const createElement = <T extends keyof HTMLElementTagNameMap>(
	tagName: T,
	className?: string,
	children: Array<Element | null> = [],
	content?: string,
	attributes?: Attrs,
) => {
	const element = ROOT.createElement(tagName);

	if (className) {
		element.className = className;
	}

	if (content) {
		setInnerHTML(element, content);
	}

	ObjectForEach(attributes || {}, (name, value) =>
		setAttribute(element, name, value),
	);

	appendChildren(element, ...children);

	return element;
};

export const createDivElement = (
	classname: string,
	...children: Array<Element | null>
) => createElement("div", classname, children);

export const removeElement = (element: Element) => element.remove();

export const replaceElement = (element: Element, replacement: Element) => {
	element.replaceWith(replacement);
	return replacement;
};

export const createButton = (
	label: string = "",
	className: string = "",
	content?: string,
	title: string = label,
) => {
	return createElement(
		BUTTON,
		joinClassnames(BUTTON_CLASSNAME, className),
		[],
		content,
		{
			type: BUTTON,
			[ARIA_LABEL]: label,
			title,
		},
	);
};

export const createSlider = (classname: string, max: number, step = 1) =>
	createElement(INPUT, joinClassnames(SLIDER_CLASSNAME, classname), [], "", {
		max,
		step,
		type: "range",
	});

export const setCustomProperty = (
	element: HTMLElement | SVGAElement | null,
	property: string,
	value: string | number,
) => {
	if (element) {
		element.style.setProperty("--" + property, value + "");
	}
	return element;
};

export const toggleClassName = (
	element: Element,
	token: string,
	forced?: boolean,
) => element.classList.toggle(token, forced);

export const translate = (element: HTMLElement, x: number, y: number) => {
	element.style.transform = `translate(${x}px,${y}px)`;
};

export const getParentElement = (element: Element | Document) =>
	(element && element.parentElement) || getBody();

export const getBoundingRectArray = (
	element: Document | Element,
	addClientArea?: boolean,
): DOMRectArray => {
	let x, y, width, height, right, bottom;

	if (!isElement(element)) {
		x = y = 0;
		width = right = DOC_ELEMENT.clientWidth;
		height = bottom = DOC_ELEMENT.clientHeight;
	} else {
		({ x, y, width, height, right, bottom } =
			element.getBoundingClientRect());
		if (addClientArea) {
			x += element.clientTop;
			y += element.clientLeft;
		}
	}

	return [x, y, width, height, right, bottom];
};
