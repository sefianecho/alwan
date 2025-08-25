# Alwan

A lightweight, customizable, and touch-friendly color picker implemented in vanilla JavaScript, with no external dependencies.

![jsDelivr hits (npm)](https://img.shields.io/jsdelivr/npm/hm/alwan?style=for-the-badge&color=%2357ad10)
![npm bundle size](https://img.shields.io/bundlephobia/min/alwan?style=for-the-badge)
![npm package minimized gzipped size](https://img.shields.io/bundlejs/size/alwan?style=for-the-badge)
![NPM Version](https://img.shields.io/npm/v/alwan?style=for-the-badge)

---

<div align="center">
  <img alt="alwan light theme" src="https://github.com/SofianChouaib/alwan/blob/main/images/alwan-light.png?raw=true">
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

  <img alt="alwan dark theme" src="https://github.com/SofianChouaib/alwan/blob/main/images/alwan-dark.png?raw=true">
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</div>

---

## Demo

👉 [Try it live](https://sefianecho.github.io/alwan/)

## Features

-   Lightweight and efficient.
-   Touch-friendly interface.
-   Supports dark theme.
-   Includes alpha channel (opacity) control.
-   Supports multiple color formats: HSL, RGB, and HEX.
-   Fully keyboard accessible.
-   Simple and intuitive user interface, inspired by Google Chrome’s color picker.
-   No external dependencies.
-   Allows copying color values to the clipboard.

## Getting started

Install using package manager:

```shell
npm install alwan
```

or

```
yarn add alwan
```

Import files

```javascript
// Import javascript.
import alwan from 'alwan';
// Import css.
import 'alwan/dist/css/alwan.min.css';
```

## CDN

Add it to your page.

### CSS (required)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/alwan@2/dist/css/alwan.min.css"/>
```

### Javascript (Choose one)

#### UMD
```html
<script src="https://cdn.jsdelivr.net/npm/alwan@2/dist/js/alwan.min.js"></script>
```

#### ES Module
```html
<script type="module">
    import Alwan from "https://cdn.jsdelivr.net/npm/alwan@2/dist/js/esm/alwan.min.js";
</script>
```

#### IIFE
```html
<script src="https://unpkg.com/alwan@2/dist/js/iife/alwan.min.js"></script>
```

**Note:** You can also use the [unpkg CDN](https://unpkg.com/alwan@2/dist/) as an alternative.

## Usage

Alwan accepts two arguments: a reference element, which can be either a selector or an HTML element (required), and an optional options object.

```javascript
const alwan = new Alwan('#reference', {
    // Options...
});
```

## Options
> _You can explore and experiment with these options in the [demo](https://sefianecho.github.io/alwan/)_.

| Option           | Type                    | Default        | Description                                                                                                                                                                             |
|------------------|-------------------------|----------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `id`             | `string`                | `""`           | Assign an ID to the color picker widget.                                                                                                                                                |
| `classname`      | `string`                | `""`           | Adds one or more classes (separated by spaces) to the preset button.                                                                                                                    |
| `theme`          | `light\|dark`           | `light`        | Choose between the 'dark' and 'light' themes.                                                                                                                                           |
| `toggle`         | `boolean`               | `true`         | Toggles the visibility of the color picker. Setting this option to false keeps the picker always visible.                                                                               |
| `popover`        | `boolean`               | `true`         | Determines whether the color picker is displayed as a popover (true) or inline within the page content (false).                                                                         |
| `position`       | `popoverPosition`       | `bottom‑start` | Sets the popover’s placement relative to the target or reference element. Format: side-alignment (side: top, right, bottom, left; alignment: start, center, end, with center optional).<br>The picker will automatically adjust if there is insufficient space. |
| `margin`         | `number`                | `4`            | Sets the distance, in pixels, between the picker container and the popover target element (either `target` or the reference element).                                                   |
| `preset`         | `boolean`               | `true`         | Replaces the reference element with a pre-styled button.                                                                                                                                |
| `color`          | `Color`                 | `#000`         | Sets the initial color of the color picker.                                                                                                                                             |
| `default`        | `Color`                 | `""`           | Specifies the default color of the color picker.                                                                                                                                        |
| `target`         | `string\|Element`       | `""`           | A selector or HTML element used as the reference. When popover is true, the picker is positioned relative to it; when false, the picker is inserted immediately after it.               |
| `disabled`       | `boolean`               | `false`        | Disables the color picker, preventing users from selecting colors.                                                                                                                      |
| `format`         | `colorFormat`           | `rgb`          | Determines how the color value is represented (hex, rgb, or hsl).                                                                                                                       |
| `inputs`         | `boolean\|inputFormats` | `true`         | Controls color input fields. Accepts true (all inputs), false (no inputs), or an object to enable specific formats (e.g., `{ hsl: true, rgb: false, hex: true }`).                      |
| `singleInput`    | `boolean`               | `false`        | Uses one input for the full color value instead of separate inputs for each color component.                                                                                            |
| `opacity`        | `boolean`               | `true`         | Enables alpha channel for transparency.                                                                                                                                                 |
| `preview`        | `boolean`               | `true`         | Adds a preview element for the selected color.                                                                                                                                          |
| `copy`           | `boolean`               | `true`         | Adds a button to copy the selected color.                                                                                                                                               |
| `swatches`       | `Color[]`               | `[]`           | Array of predefined colors displayed as selectable swatches; invalid values default to #000.                                                                                            |
| `toggleSwatches` | `boolean`               | `false`        | Adds a button to toggle the swatches container.                                                                                                                                         |
| `colorOnScroll`  | `boolean`               | `false`        | Closes the popover picker on scroll.                                                                                                                                                    |
| `parent`         | `string\|Element`       | `""`           | Selector or HTML element that the picker container is appended to.                                                                                                                      |

**Note:** _In the reference element you can access the CSS custom property `--color` (`--alwan-color` before `v2.0.0`) to get color value_

#### Accessibility (since `v1.4`)

All interactive elements include ARIA labels with default values in English. These labels can be customized through the i18n option.

**ℹ️ Note:**: _The title attribute of the copy button and the change-format button is identical to their ARIA label. For swatch buttons, the title attribute is set to the corresponding color value from the swatches array._

```javascript
// i18n default values.
    {
        i18n: {
            // Deprecated – use `picker` instead.
            palette: 'Color picker',
            // ARIA label for the color picking area.
            picker: 'Color picker',

            buttons: {
                // ARIA label and title for the copy button.
                copy: 'Copy color to clipboard',
                // ARIA label and title for the change-format button.
                changeFormat: 'Change color format',
                // ARIA label for swatch buttons.
                swatch: 'Color swatch',
                // ARIA label and title for the toggle-swatches button (since v2.0.0).
                toggleSwatches: 'Toggle Swatches'
            },

            sliders: {
                // ARIA label for the hue slider.
                hue: 'Change hue',
                // ARIA label for the alpha slider.
                alpha: 'Change opacity'
            }
        }
    }
```

## Events

Use the `on` method, which accepts two parameters: `event` and `handler` (a callback function).

```javascript
alwan.on('event', (ev) => {
    // ...
});
```

| Event    | Argument | Description                                                                                        |
| -------- | -------- | -------------------------------------------------------------------------------------------------- |
| `open`   | `event`  | Fired when the color picker is opened.                                                             |
| `close`  | `event`  | Fired when the color picker is closed.                                                             |
| `change` | `event`  | Fired when a change to the color is committed, similar to the native DOM `change` event.           |
| `color`  | `event`  | Fired continuously as the color changes, similar to the native DOM input event.                    |

### Event object (since v1.3)

-   `type` — Event type.
-   `source` — The color picker instance that triggered the event handler.
-   `h`: `number` — Hue.
-   `s`: `number` — Saturation.
-   `l`: `number` — Lightness.
-   `r`: `number` — Red.
-   `g`: `number` — Green.
-   `b`: `number` — Blue.
-   `a`: `number` — alpha.
-   `rgb`: `string` — RGB color string.
-   `hsl`: `string` — HSL color string.
-   `hex`: `string` — Hex color.

```javascript
// e.g.
alwan.on('change', (ev) => {
    ev.type; // change
    ev.source; // Color picker instance.

    // HSL color components.
    ev.h;
    ev.s;
    ev.l;

    // RGB color components.
    ev.r;
    ev.g;
    ev.b;

    // Alpha channel.
    ev.a;

    // Colors strings.
    ev.rgb;
    ev.hsl;
    ev.hex;
});
```

# Methods

#### Static methods:

-   **version**(): `string` — Returns the version.
-   **setDefaults**(defaults: `alwanOptions`) — Updates the default options for all new instances (does not affect existing ones).

#### Instance methods:

-   **setColor**(color: `Color`) : `Alwan` — Sets the picker's color programmatically. Accepts any supported color format (`hex`, `rgb`, or `hsl`).
-   **getColor**() : `alwanValue` — Returns the color object.
-   **open**() — Opens or shows the color picker.
-   **close**() — Closes or hides the color picker.
-   **isOpen**() : `boolean` — `true` when the picker is open, `false` when closed.
-   **toggle**() — Opens the picker if closed, or closes it if open.
-   **setOptions**(options: `alwanOptions`) — Updates the picker's options dynamically.
-   **trigger**(event: `alwanEventType`) — Programmatically triggers the specified event on the color picker.
-   **on**(event: `alwanEventType`, handler: `alwanEventHandler`) — Attaches an event handler to the color picker.
-   **off**(event?: `alwanEventType`, handler?: `alwanEventHandler`) — Detaches event handlers; omit `handler` to remove all handlers for an event, omit `event` to remove all handlers entirely.
-   **disable**() — Disables the color picker, preventing any user interaction.
-   **enable**() — Enables the color picker, allowing user interaction.
-   **reposition**() — Updates the popover’s position relative to its target element.
-   **addSwatches**(...swatches: `Array<Color>`) — Adds one or more color values to the picker's swatches array.
-   **removeSwatches**(...items: `Array<Color | number>`) — Removes one or more color swatches. Each item can be a color value or its index in the `config.swatches` array.
-   **reset**() — Resets the color picker to its default color.
-   **destroy**() — Completely removes the color picker functionality and frees associated memory.

## See also

- [react-alwan](https://github.com/sefianecho/react-alwan) – React wrapper for this library
