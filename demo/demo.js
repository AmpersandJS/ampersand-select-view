var SelectView = require('../ampersand-select-view');
var FormView = require('ampersand-form-view');

var Model = require('ampersand-state').extend({
    props: {
        id: 'string',
        title: 'string'
    }
});
var Collection = require('ampersand-collection').extend({
    model: Model
});

var collection1 = new Collection([
    { id: 'foo', title: 'Foo Option' },
    { id: 'bar', title: 'Bar Option' },
    { id: 'baz', title: 'Baz Option' }
]);


var BaseView = FormView.extend({
    fields: function () {
        return [
            new SelectView({
                name: 'one.1',
                parent: this,
                options: ['a', 'b', 'c'],
                unselectedText: 'please choose one'
            }),
            new SelectView({
                name: 'one.2',
                parent: this,
                options: ['a', 'b', 'c'],
                unselectedText: 'please choose one'
            }),
            new SelectView({
                name: 'one.3',
                parent: this,
                options: ['a', 'b', 'c'],
                value: 'c',
                unselectedText: 'please choose one'
            }),

            new SelectView({
                name: 'two.1',
                parent: this,
                options: [ ['a', 'Option A'], ['b', 'Option B'], ['c', 'Option C'] ],
                unselectedText: 'please choose one'
            }),
            new SelectView({
                name: 'two.2',
                parent: this,
                options: [ ['a', 'Option A'], ['b', 'Option B'], ['c', 'Option C'] ],
                value: 'b',
                unselectedText: 'please choose one'
            }),

            new SelectView({
                name: 'three.1',
                parent: this,
                options: collection1,
                value: collection1.at(2),
                idAttribute: 'id',
                textAttribute: 'title'
            }),

            new SelectView({
                name: 'three.1',
                parent: this,
                options: collection1,
                value: collection1.at(2),
                idAttribute: 'id',
                textAttribute: 'title',
                yieldModel: false
            })
        ];
    }
});


document.addEventListener('DOMContentLoaded', function () {
    var baseView = new BaseView({el: document.body });
    baseView.on('all', function (name, field) {
        console.log('Got event', name, field.value, field.valid);
    });
    baseView.render();

    //cycle a field
    var i = 0;
    var field = baseView.getField('one.3');
    var options = [null].concat(field.options);

    setInterval(function () {
        i = (i + 1) % (field.options.length + 1);

        baseView.getField('one.3').setValue(options[i]);
    }, 1000);


    //Add options to a collection field
    setInterval(function () {
        collection1.add({ id: new Date().toString(), title: new Date().toString() });
    }, 1000);
});
