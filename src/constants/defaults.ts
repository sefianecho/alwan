import type { alwanConfig } from "../types";

export const alwanDefaults: alwanConfig = {
	id: "",
	classname: "",
	theme: "light",
	parent: "",
	toggle: true,
	popover: true,
	position: "bottom-start",
	margin: 4,
	preset: true,
	color: "#000",
	default: "#000",
	target: "",
	disabled: false,
	format: "rgb",
	singleInput: false,
	inputs: true,
	opacity: true,
	preview: true,
	copy: true,
	swatches: [],
	toggleSwatches: false,
	closeOnScroll: false,
	i18n: {
		palette: "Color picker",
		buttons: {
			copy: "Copy color to clipboard",
			changeFormat: "Change color format",
			swatch: "Color swatch",
			toggleSwatches: "Toggle Swatches",
		},
		sliders: {
			hue: "Change hue",
			alpha: "Change opacity",
		},
	},
};
