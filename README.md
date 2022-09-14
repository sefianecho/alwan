# Talwin

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="images/talwin-dark-theme.jpg">
    <img alt="sc picker dark theme" src="images/talwin.jpg">
  </picture>

  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="images/dark-talwin-dark-theme.jpg">
    <img alt="sc picker dark theme" src="images/dark-talwin.jpg">
  </picture>
</div>

A simple, zero dependencies, pure vanilla javascript, lightweight (only ~13Kb) color picker.

## features
- Small file size (~13Kb).
- Touch friendly.
- Support dark theme.
- Alpha channel (opacity).
- Support 3 color formats hsl, rgb and hex.
- Keyboard accessible.
- Simple interface (inspired by google chrome's color picker).
- No dependencies.

## Demo
[Click here to try it](https://sofianchouaib.github.io/talwin/)
## Getting started
Install using package manager:
```shell
npm install talwin
```
or

```
yarn add talwin
```

Import files
```javascript
// Import javascript.
import talwin from 'talwin';
// Import css.
import 'talwin/dist/css/talwin.min.css';
```
### CDN
Add it to your page.
- Jsdelivr CDN
```html
<!-- Style -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/talwin/dist/css/talwin.min.css">

<!-- Script -->
<script src="https://cdn.jsdelivr.net/npm/talwin/dist/js/talwin.min.js"></script>
```
- Unpkg CDN
```html
<!-- Style -->
<link rel="stylesheet" href="https://unpkg.com/talwin/dist/css/talwin.min.css">

<!-- Script -->
<script src="https://unpkg.com/talwin/dist/js/talwin.min.js"></script>
```

## Usage
Talwin can take two arguments,
a reference element either a selector or an HTML element (required),
and options object (optional).
```javascript

const talwin = new Talwin('#reference', {
  // Options...
});
```
## Options
You can try these options in the [demo](https://sofianchouaib.github.io/sc-picker/), play around with it :)

| **Option** | **Type** | **Default** | **Description** |
|------------| ---------| ------------ | ---------------- |
| id         | `string` | `''`         | Set the container's (widget) id. |
| classname  | `string` |    `''`      | One or many classes (separated by a white space) to add to the reference element. |
| theme      | `string` | `light`      | Choose a theme, 'dark' or 'light'. |
| toggle     | `boolean` | `true`      | Toggle picker's visibility (Show/Hide), Setting this to false keeps the picker visible. |
| popover    | `boolean` | `true`      | Display picker as a popover, otherwise display it as a block (embeded in the page content). |
| position   | `string`  | `bottom-start` | Set the position of the popper relative to the reference element.<br />The position has two values seperated by a dash (-)<br />the first value is the direction (top, bottom, right, left) and the second value is the alignment (start, center, end), omitting this value will default to center.<br />E.g. 'bottom-start': 'bottom' places the picker below the reference element, and 'start' aligns the left side of the container with the left side of the reference element.<br />Note: If the picker container has no space to be placed, it will auto-position itself based on the available space. |
| margin | `number` | `8` | Set the gap (in pixels) between the picker container and the reference element. |
| preset | `boolean` | `true` | Replace the reference element with a pre-styled button. |
| color  | `string` | `#000` | Initial color.
| default | `string` | `#000` | Default color.
| target | `string` or `HTMLElement` | `''` | Target can be a selector or an HTML element, If the option popover is set to true, the picker container will be positionned retalive to this element,<br />else if popover option is set to false, the picker container will be appended as a child into this element. |
| disabled | `boolean` | `false` | Disable the picker, users won't be able to pick colors. |
| format | `string` | `rgb` | Initial color format. |
| singleInput | `boolean` | `false` | For the formats 'hsl' and 'rgb', choose a single input to display the color string,<br />if false, display an input for each color channel. |
| inputs | `object` | `{ hex: true, rgb: true,  hsl: true  }` | Choose color formats for the picker input |
| opacity | `boolean` | `true` | Support alpha channel and display opacity slider. |
| preview | `boolean` | `true` | Preview the color. |
| copy | `boolean` | `true` | Add/Remove a copy button. |
| swatches | `array<string>` | `[]` | Array of color strings, invalid color strings will default to rgb(0,0,0). |

**Note:** In case you set the `preset` to `false` (using your own reference element), to access the color to change its background or any other property, add the css custom property to your styles `--tw-color`.  
E.g.
```css
#my-reference-element {
  background-color: var(--tw-color);
}
```
## Events
Use the method `on`, that takes two parameters, `event` and `handler` (callback function).
```javascript
talwin.on('event', function(argument) {
  // ...
});
```
| Event  | Argument | Description                    |
|------- | --------------- | ------------------------------ |
| `open` | `-`   | Fires when the picker get opened |
| `close` | `-`  | Fires when the picker get closed |
| `change` | (`colorObject`, `source`) | Fires when an alternation to the color is committed by the user, similar to the DOM `change` event  |
| `color` | (`colorObject`, `source`) | Similar to the `input` event, fires every time the color changes |

### ColorObject
Color object is the output of Talwin color picker, its properties are:

- **hsv**() : `object`

Gets an HSV color object.
- **rgb**(asArray: `boolean`) : `object`

Get an RGB color object or an Array if `asArray` is set to true,
call the method `toString()` on this object to get an RGB string.
- **hsl**(asArray: `boolean`) : `object`

Get an HSL color object or an Array if `asArray` is set to true,
call the method `toString()` on this object to get an HSL string.

- **hex**() `string`

Gets a hex color.

```javascript
// e.g.
talwin.on('change', function(color) {
  // RGB color.
  color.rgb()                // output: { r: 0, g: 0, b: 0, a: 1}
  color.rgb(true)            // output: [0, 0, 0, 0]
  color.rgb().toString()     // output: rgba(0, 0, 0, 1)
  
  // Hex color.
  color.hex()                // output: #000000
  
  // HSL color.
  color.hsl()               // output: { h: 0, s: 0, l: 0, a: 1 }
  color.hsl(true)           // output: [0, 0, 0, 0]
  color.hsl().toString()    // output: hsla(0, 0%, 0%, 1)
})
```

# Methods
- **setColor**(color: `string | object`) : `object`

Sets a color from a string or a color object, this method doesn't trigger `change` or `color` events
if you want to trigger events add `.trigger(change | color)` to it
```javascript
// Set color 'purple' and trigger 'change' event.
picker.setColor('purple').trigger('change');
```
- **getColor**() : `object`

  Returns the color object.
- **open**()

  Open/Show picker.
- **isOpen**() : `boolean`
  
  Returns the state of the picker opened `true` or closed `false`.
- **toggle**()
  
  Toggle picker, if its hidden show it else hide it.
- **setOptions**(options: `object`)
  
  Sets one or more options for the picker.
- **trigger**(event: `string`)
  
  Triggers an event.
- **on**(event: `string`, handler: `callback`)

  Attaches an event handler function.
- **off**(event: `string`, handler: `callback`)
  
  Removes an event handler, if the handler argument is omitted then all handlers attach to this event will be removed,
  calling this method without arguments will remove all handlers of all events.
- **disable**()
  
  Disables picker (users won't be able to pick a color).
- **enable**()
  
  Enables picker.
- **reposition**()

  Updates picker position only if it's a popover.
- **addSwatch**(color: `string`)
  
  Adds a swatch button.
- **removeSwatch**(swatch: `string | number`)
  
  Removes color from the `Options.swatches` array, also removes its button from the swatches container.
  
  *Note:* swatch argument can be a color string (must exist in `Options.swatches` array) or an index.
- **reset**()

  Reset to default color.
- **destroy**()

  Removes the color picker functionality completely(free up memory).
