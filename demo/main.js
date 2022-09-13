const previewArea = document.querySelector('.preview-area');
const menuButton = document.querySelector('.menu-button');
const sidePanel = document.querySelector('.panel');
const closeButton = sidePanel.querySelector('.close-menu');
const pickerSelect = sidePanel.querySelector('#picker');

Talwin.defaults.swatches = ['red', 'green', 'blue'];

const talwinText = new Talwin('#fg');
const talwinBG = new Talwin('#bg', { color: 'red' });

let picker;

initialize('bg');


function initialize(pickerId) {
    picker = pickerId === 'fg' ? talwinText : talwinBG

    const options = picker.config;

    for(const option in options) {
        if (Object.hasOwnProperty.call(options, option)) {
            const value = options[option];

            if (option === 'id' || option === 'classname') {
                continue;
            }

            const elements = document.getElementsByName(option);

            
            // Checkboxes.
            if (elements.length > 1) {
                elements.forEach(element => {
                    element.checked = value[element.value];
                });
            } else {

                const element = elements[0];
                
                if (element.tagName === 'TEXTAREA') {
                    element.value = value.join(', ');
                } else if (element.tagName === 'SELECT' || element.type !== 'checkbox') {
                    element.value = value;
                } else {
                    element.checked = value;
                }
            }

        }
    }
}


sidePanel.addEventListener('change', e => {
    const options = {};
    const el = e.target;
    let { type, value, checked, name } = el;

    if (pickerSelect === el) {
        return initialize(value);
    }

    value = type === 'checkbox' ? checked : value;

    if (name === 'swatches') {
        options.swatches = value.split(/\s*,\s*/);
    } else if (name === 'inputs') {

        options.inputs = {};

        sidePanel.querySelectorAll("[name='inputs']").forEach((checkbox) => {
            options.inputs[checkbox.value] = checkbox.checked;
        });
    } else if (name === 'target') {
        options.target = value ? document.querySelector(value) : value;
    } else {
        options[name] = value;
    }

    picker.setOptions(options);
});


talwinText.on('color', (color) => {
    previewArea.style.color = color.rgb().toString();
});

talwinBG.on('color', (color) => {
    previewArea.style.backgroundColor = color.rgb().toString();
})


closeButton.addEventListener('click', toggleOptionsPanel);
menuButton.addEventListener('click', toggleOptionsPanel);

function toggleOptionsPanel(e) {
    sidePanel.classList.toggle('open');
    e.stopPropagation();
    // picker.reposition();
}

document.addEventListener('click', e => {
    let target = e.target;
    if (! sidePanel.contains(target) || target === closeButton) {
        sidePanel.classList.remove('open');
    }
});