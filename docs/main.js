const previewArea = document.querySelector(".preview-area");
const menuButton = document.querySelector(".menu-button");
const sidePanel = document.querySelector(".panel");
const closeButton = sidePanel.querySelector(".close-menu");

Alwan.setDefaults({ swatches: ["red", "green", "blue"] });

const alwan = {
	bg: new Alwan("#bg", { color: "red" }),
	fg: new Alwan("#fg"),
};

let selectedPicker = alwan.bg;

initialize(selectedPicker.config);

/**
 * Updates options controls from color picker config object.
 *
 * @param {object} options - Color picker options.
 */
function initialize(options) {
	for (const option in options) {
		if (Object.hasOwnProperty.call(options, option)) {
			const value = options[option];

			if (
				option === "id" ||
				option === "classname" ||
				option === "i18n" ||
				option === "parent"
			) {
				continue;
			}

			const elements = document.getElementsByName(option);

			// Checkboxes.
			if (elements.length > 1) {
				// inputs option.
				elements.forEach((element) => {
					element.checked =
						typeof value === "boolean"
							? value
							: value[element.value];
				});
			} else {
				const element = elements[0];

				if (element.tagName === "TEXTAREA") {
					element.value = value.join("; ");
				} else if (
					element.tagName === "SELECT" ||
					element.type !== "checkbox"
				) {
					element.value = value;
				} else {
					element.checked = value;
				}
			}
		}
	}
}

function updateOptions(e) {
	const options = {};
	const el = e.target;
	let { type, value, checked, name } = el;

	if (name === "picker-choice") {
		document
			.querySelector(`.picker-wrapper.selected`)
			.classList.remove("selected");
		document.querySelector(`#${value}-wrapper`).classList.add("selected");
		selectedPicker = alwan[value];
		initialize(selectedPicker.config);
		return;
	}

	value = type === "checkbox" ? checked : value;

	if (name === "swatches") {
		value = value.trim();
		options.swatches = value ? value.split(/\s*;\s*/) : [];
	} else if (name === "inputs") {
		options.inputs = {};

		sidePanel.querySelectorAll("[name='inputs']").forEach((checkbox) => {
			options.inputs[checkbox.value] = checkbox.checked;
		});
	} else if (name === "target") {
		options.target = value ? document.querySelector(value) : value;
	} else {
		options[name] = value;
	}

	selectedPicker.setOptions(options);
}

sidePanel.addEventListener("input", updateOptions);

alwan.fg.on("color", (color) => {
	previewArea.style.color = color.rgb;
});

alwan.bg.on("color", (color) => {
	previewArea.style.backgroundColor = color.rgb;
});

closeButton.addEventListener("click", toggleOptionsPanel);
menuButton.addEventListener("click", toggleOptionsPanel);

function toggleOptionsPanel(e) {
	sidePanel.classList.toggle("open");
	e.stopPropagation();
}

document.addEventListener("click", (e) => {
	let target = e.target;
	if (!sidePanel.contains(target) || target === closeButton) {
		sidePanel.classList.remove("open");
	}
});
