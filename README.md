# ampersand-select-view
A view module for intelligently rendering and validating selectbox input. Works well with ampersand-form-view.

![](https://travis-ci.org/AmpersandJS/ampersand-select-view.svg) ![](https://badge.fury.io/js/ampersand-select-view.svg)

## install

```
npm install ampersand-select-view
```

## 4.0.0 Release Plan
The upcoming release 4.x is intended to migrate `ampersand-select-view` to an extension of `ampersand-view`.  Due to the refactor, merging changes becomes difficult as the module will exhibit a different structure. As such, *all PRs*, including bugfixes, should be submitted by April 20, 2015!

<!-- starthide -->
Part of the [Ampersand.js toolkit](http://ampersandjs.com) for building clientside applications.
<!-- endhide -->

## API Reference

### clear() - [Function] - returns `this`
Alias to calling `setValue(null, true)`.  Sets the selected option to either the [unselectedText](#general-options) option or a user defined option whose value is `null`.  *Be mindful* that if no unselectedText or `null` option exists, the view will error.

### reset() - [Function] - returns `this`
Sets the selected option and view value to the original option value provided during construction.

### setValue([value, skipValidationMessage]) - [Function] - returns `this`
Sets the selected option to that which matches the provided value.  Updates the view's `.value` accordingly.  SelectView will error if no matching option exists.  `null, `undefined`, and `''` values will preferentially select [unselectedText](#general-options) if defined.

### constructor - [Function] `new SelectView([options])`
#### options
##### general options
- `name`: the `<select>`'s `name` attribute's value. Used when reporting to parent form
- `parent`: parent form reference
- `options`: array/collection of options to render into the select box
- `[el]`: element if you want to render the view into
- `[template]`: a custom template to use (see 'template' section, below, for more)
- `[required]`: [default: `false`] field required
- `[eagerValidate]`: [default: `false`] validate and show messages immediately.  Note: field will be validated immediately to provide a true `.valid` value, but messages by default are hidden.
- `[unselectedText]`: text to display if unselected
- `[value]`: initial value for the `<select>`.  `value` **must** be a member of the `options` set

##### label & validation options
- `[label]`: [default: `name` value] text to annotate your select control
- `[invalidClass]`: [default: `'select-invalid'`] class to apply to root element if invalid
- `[validClass]`: [default: `'select-valid'`] class to apply to root element if valid
- `[requiredMessage]`: [default: `'Selection required'`] message to display if invalid and required

##### collection option set
If using a collection to produce `<select>` `<option>`s, the following may also be specified:

- `[disabledAttribute]`: boolean model attribute to flag disabling of the option node
- `[idAttribute]`: model attribute to use as the id for the option node.  This will be returned by `SelectView.prototype.value`
- `[textAttribute]`: model attribute to use as the text of the option node in the select box
- `[yieldModel]`: [default: `true`] if options is a collection, yields the full model rather than just its `idAttribute` to `.value`

## custom template
You may override the default template by providing your own template string to the [constructor](#constructor---function-new-selectviewoptions) options hash.  Technically, all you must provided is a `<select>` element.  However, your template may include the following under a single root element:

1. An element with a `data-hook="label"` to annotate your select control
1. An `<select>` element to hold your `options`
1. An element with a `data-hook="message-container"` to contain validation messages
1. An element with a `data-hook="message-text"` nested beneath the `data-hook="message-container"` element to show validation messages

Here's the default template for reference:
```html
<label class="select">
    <span data-hook="label"></span>
    <select></select>
    <span data-hook="message-container" class="message message-below message-error">
        <p data-hook="message-text"></p>
    </span>
</label>
```

## example

```javascript
var FormView = require('ampersand-form-view');
var SelectView = require('ampersand-select-view');


module.exports = FormView.extend({
    fields: function () {
        return [
            new SelectView({
                label: 'Pick a color!',
                // actual field name
                name: 'color',
                parent: this,
                // you can pass simple string options
                options: ['blue', 'orange', 'red'],
                // if included this will add option for an unselected state
                unselectedText: 'please choose one',
                // you can specify that they have to pick one
                required: true
            }),
            new SelectView({
                name: 'option',
                parent: this,
                // you can also pass array, first is the value, second is used for the label
                // and an optional third value can used to disable the option
                options: [ ['a', 'Option A'], ['b', 'Option B'], ['c', 'Option C', true] ]
            }),
            new SelectView({
                name: 'model',
                parent: this,
                // you can pass in a collection here too
                options: collection,
                // and pick an item from the collection as the selected one
                value: collection1.at(2),
                // here you specify which attribute on the objects in the collection
                // to use for the value returned.
                idAttribute: 'id',
                // you can also specify which model attribute to use as the title
                textAttribute: 'title',
                // you can also specify a boolean model attribute to render items as disabled
                disabledAttribute: 'disabled',
                // here you can specify if it should return the selected model from the
                // collection, or just the id attribute.  defaults `true`
                yieldModel: false
            })
        ];
    }
});

```
## gotchas

* Numeric option values are generally stringified by the browser.  Be mindful doing comparisons.  You'll generally desire to inspect `selectView.value` (the value of your selected options' input) over `selectView.select.value` (the value returned from the browser).
    * Additionally, do **not** use option sets containing values that `==` one another.  E.g., do not use options whose values are "2" (string) and 2 (number).  Browsers cannot distinguish between them in the select control context, thus nor can ampersand-select-view.
* `null`, `undefined`, or `''` option values are not considered `valid` when the field is required.  This does not apply when options are from a collection and `yieldModel` is enabled.
    * The `unselectedText` option will always be preferred in updating the control to an empty-ish value.

## browser support

[![testling badge](https://ci.testling.com/AmpersandJS/ampersand-select-view.png)](https://ci.testling.com/AmpersandJS/ampersand-select-view)

## changelog

- 3.0.0
1. Improve general option edge cases, and add supporting test cases.  Primarily targets falsy option value handling.
1. Validate immediately to assist when parent FormView tests onload for field validity.  Update `skipValidation` to `skipValidationMessage`, permit immediate validation, but conditionally display messages.
1. Throw an `Error` when trying to `setValue(value)` and an option *matching the requested `value`* does not exist.  The exception to this is when the provided value is `null`, `undefined`, or `''`, and a `null` option value exists.  Because the DOM can only recognize a single empty value for any <option>, which is the empty string `''`, only a single empty-ish option can only be supported by the view.
1. Support `0` value options, both in Model id's and array values.
1. Add `eagerValidate`.
1. Denote a plan for 4.x release
1. bulk update README, and some cody tidying

## credits

Written by [@philip_roberts](twitter.com/philip_roberts).
Lead Maintainer: [Christopher Dieringer (@cdaringe)](https://github.com/cdaringe)

## license

MIT

