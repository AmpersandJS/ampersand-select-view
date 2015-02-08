# ampersand-select-view

![](https://travis-ci.org/AmpersandJS/ampersand-select-view.svg) ![](https://badge.fury.io/js/ampersand-select-view.svg)

A view module for intelligently rendering and validating selectbox input. Works well with ampersand-form-view.

<!-- starthide -->
Part of the [Ampersand.js toolkit](http://ampersandjs.com) for building clientside applications.
<!-- endhide -->

## install

```
npm install ampersand-select-view
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
                // you can also pass pairs, first is the value, second is used for the label
                options: [ ['a', 'Option A'], ['b', 'Option B'], ['c', 'Option C'] ]
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
                // collection, or just the id attribute
                yieldModel: false
            })
        ];
    }
});

```

## browser support

[![testling badge](https://ci.testling.com/AmpersandJS/ampersand-select-view.png)](https://ci.testling.com/AmpersandJS/ampersand-select-view)

## credits

Written by [@philip_roberts](twitter.com/philip_roberts).

## license

MIT

