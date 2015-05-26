# ampersand-select-view

Lead Maintainer: [Christopher Dieringer (@cdaringe)](https://github.com/cdaringe)

# overview

A view module for intelligently rendering and validating selectbox input. Works well with ampersand-form-view.

![](https://travis-ci.org/AmpersandJS/ampersand-select-view.svg) ![](https://badge.fury.io/js/ampersand-select-view.svg)

## install

```
npm install ampersand-select-view
```

<!-- starthide -->
Part of the [Ampersand.js toolkit](http://ampersandjs.com) for building clientside applications.
<!-- endhide -->

## API Reference

### clear() - [Function] - returns `this`
Alias to calling `setValue(null, true)`.  Sets the selected option to either the [unselectedText](#general-options) option or a user defined option whose value is `null`.  *Be mindful* that if no unselectedText or `null` option exists, the view will error.

### reset() - [Function] - returns `this`
Sets the selected option and view value to the original option value provided during construction.

### setValue([value, skipValidationMessage]) - [Function] - returns `this`
Sets the selected option to that which matches the provided value.  Updates the view's `.value` accordingly.  SelectView will error if no matching option exists.  `null`, `undefined`, and `''` values will preferentially select [unselectedText](#general-options) if defined.

### constructor - [Function] `new SelectView([options])`
#### options
##### general options
- `autoRender`: [default: `false`] generally, we leave rendering of this FieldView to its controlling form
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

When the collection changes, the view will try and maintain its currently `.value`.  If the corresponding model is removed, the &lt;select&gt; control will default to the 0th index &lt;option&gt; and update its value accordingly.

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

- 4.0.0
    - Extend [ampersand-view](https://github.com/ampersandjs/ampersand-view) and support `autoRender`, where previously this view would autoRender unconditionally
- 3.0.0
    - Improve general option edge cases, and add supporting test cases.  Primarily targets falsy option value handling.
    - Validate immediately to assist when parent FormView tests onload for field validity.  Update `skipValidation` to `skipValidationMessage`, permit immediate validation, but conditionally display messages.
    - Throw an `Error` when trying to `setValue(value)` and an option *matching the requested `value`* does not exist.  The exception to this is when the provided value is `null`, `undefined`, or `''`, and a `null` option value exists.  Because the DOM can only recognize a single empty value for any <option>, which is the empty string `''`, only a single empty-ish option can only be supported by the view.
    - Support `0` value options, both in Model id's and array values.
    - Add `eagerValidate`.
    - Denote a plan for 4.x release
    - bulk update README, and some cody tidying

## credits

Written by [@philip_roberts](twitter.com/philip_roberts).

## contributing
Due to CI browser testing issues ([1](https://support.saucelabs.com/entries/25614798-How-can-we-set-up-an-open-source-account-that-runs-tests-on-people-s-pull-requests-), [2](https://trello.com/c/jlx3EtvS)), a PR must receive two `+1`s from the core-team or maintainer, each with mention that x-browser tests pass in the [PR branch](https://help.github.com/articles/checking-out-pull-requests-locally/) (i.e. `testem ci`);

## license

MIT

