const previewArea = document.querySelector(".preview-area");
const menuButton = document.querySelector(".menu-button");
const sidebar = document.querySelector(".sidebar");
const closeButton = sidebar.querySelector(".close-menu");
const root = document.documentElement;

Alwan.setDefaults({ swatches: ["red", "green", "blue"] });

const alwan = new Alwan(".picker-ref", {
    color: getComputedStyle(root).getPropertyValue("--accent-color"),
});

alwan.on("color", (color) => {
    root.style.setProperty(
        "--accent-color-rgb",
        `${color.r},${color.g},${color.b}`,
    );
});

function updateControls(options) {
    Object.keys(options).forEach((option) => {
        const value = options[option];

        if (option === "id" || option === "classname" || option === "i18n") {
            return;
        }

        const controls = document.getElementsByName(option);
        if (option === "inputs") {
            controls.forEach((checkbox) => {
                checkbox.checked =
                    typeof value === "boolean" ? value : value[checkbox.value];
            });
        } else {
            const control = controls[0];
            if (control.tagName === "TEXTAREA") {
                control.value = value.join(" ");
            } else if (control.type === "checkbox") {
                control.checked = option === "theme" ? value === "dark" : value;
            } else {
                control.value = value;
            }
        }
    });
}
updateControls(alwan.config);

sidebar.addEventListener("input", (e) => {
    const control = e.target;
    const options = {};
    const value = control.type === "checkbox" ? control.checked : control.value;
    const option = control.name;

    if (option === "theme") {
        options[option] = value ? "dark" : "light";
    } else if (option === "swatches") {
        options[option] = value.trim().split(/\s+/).filter(Boolean);
    } else if (option === "inputs") {
        options[option] = { [control.value]: value };
    } else {
        options[option] = value;
    }

    alwan.setOptions(options);
});

function toggleSideBar(e) {
    sidebar.classList.toggle("open");
    e.stopPropagation();
}

closeButton.addEventListener("click", toggleSideBar);
menuButton.addEventListener("click", toggleSideBar);

document.addEventListener("click", ({ target }) => {
    if (!sidebar.contains(target) || target === closeButton) {
        sidebar.classList.remove("open");
    }
});
