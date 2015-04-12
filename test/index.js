var suite = require('tape-suite');
var viewConventions = require('ampersand-view-conventions');
var FormView = require('ampersand-form-view');
var SelectView = require('../ampersand-select-view');
var AmpersandState = require('ampersand-state');
var AmpersandCollection = require('ampersand-collection');
var dom = require('ampersand-dom');

var Model = AmpersandState.extend({
    props: {
        id: 'number',
        someOtherKey: 'string',
        title: 'string',
        disabled: 'boolean'
    }
});

var VolatileModel = AmpersandState.extend({
    props: {
        id: 'any', // lookout!,
        title: 'string',
        disabled: 'boolean'
    }
});

var Collection = AmpersandCollection.extend({
    model: Model
});

var VolatileCollection = AmpersandCollection.extend({
    model: VolatileModel
});

if (!Function.prototype.bind) Function.prototype.bind = require('function-bind');

var fieldOptions = {
    name: 'word',
    options: ['foo', 'bar', 'baz']
};
var view;
var arr, arrNum;
var coll;

viewConventions.view(suite.tape, SelectView, fieldOptions);
viewConventions.formField(suite.tape, SelectView, fieldOptions, 'foo');

//Wrap sync tests
var sync = function (cb) {
    return function (t) {
        cb(t);
        t.end();
    };
};


suite('Setup', function (s) {
    s.beforeEach(function () {
        fieldOptions = {
            name: 'word',
            label: 'Choose a word',
            options: ['foo', 'bar', 'baz'],
            autoRender: true
        };
        view = new SelectView(fieldOptions);
    });

    s.test('autorenders on init', sync(function (t) {
        t.ok(view.el.querySelector('select'));
    }));

    s.test('empty option-set', sync(function (t) {
        view = new SelectView({
            name: 'num',
            options: [],
            required: false,
        });

        t.ok(view.valid, 'empty, non-required option set valid');

        view = new SelectView({
            name: 'num',
            options: [],
            required: true,
        });

        t.notOk(view.valid, 'empty, non-required option set valid');
    }));

    s.test('renders label text', sync(function (t) {
        var labelText = view.el.querySelector('[data-hook~=label]').textContent;
        t.equal(labelText, 'Choose a word');
    }));

    s.test('label text falls back to name', sync(function (t) {
        view = new SelectView({
            name: 'word',
            options: [],
            autoRender: true
        });
        var labelText = view.el.querySelector('[data-hook~=label]').textContent;
        t.equal(labelText, 'word');
    }));

    s.test('works with just <select></select>', sync(function (t) {
        view = new SelectView({
            name: 'word',
            template: '<select></select>',
            options: ['foo', 'bar', 'baz']
        });
        view.render();
        t.equal(view.el.tagName, 'SELECT');
    }));

    s.test('set valid name on select input', sync(function (t) {
        view = new SelectView({
            name: 'word',
            options: [],
            autoRender: true
        });
        var selectName = view.el.querySelector('select').getAttribute('name');
        t.equal(selectName, 'word');
    }));

    s.test('message container', sync(function (t) {
        view = new SelectView({
            autoRender: true,
            name: 'num',
            options: fieldOptions.options,
            eagerValidate: false,
            required: true,
            unselectedText: 'default'
        });

        t.ok(view.el.querySelector('[data-hook~=message-container]').style.display === 'none', 'validation message should be hidden if eagerValidate is false');

        view = new SelectView({
            autoRender: true,
            name: 'num',
            options: fieldOptions.options,
            eagerValidate: true,
            required: true,
            unselectedText: 'default'
        });

        t.ok(view.el.querySelector('[data-hook~=message-container]').style.display !== 'none', 'validation message should be displayed if eagerValidate is true');
    }));

    s.test('eagerValidation', sync(function (t) {
        view = new SelectView({
            autoRender: true,
            name: 'num',
            options: fieldOptions.options,
            eagerValidate: true,
            required: true,
            unselectedText: 'default'
        });

        t.ok(dom.hasClass(view.el, view.invalidClass), 'validation message should be present on el with eagerValidate');
    }));

});

suite('Utility Methods', function (s) {
    var arr = ['one', 'two', 'three'];
    var view;

    s.test('clear', sync(function (t) {
        view = new SelectView({
            autoRender: true,
            name: 'word',
            options: arr,
            value: 'two'
        });

        var select = view.el.querySelector('select');

        t.equal(select.options[select.selectedIndex].value, 'two');
        try {
            view.clear();
            t.ok(false, 'view cleared without null option');
        } catch(err) {
            t.ok(true, 'view unable to clear without null option');
        }
    }));

    s.test('clear on view with `unselectedText`', sync(function (t) {
        view = new SelectView({
            autoRender: true,
            name: 'word',
            options: arr,
            unselectedText: 'Please choose:',
            value: 'two',
            required: false
        });

        var select = view.el.querySelector('select');

        t.equal(select.options[select.selectedIndex].value, 'two');
        view.clear();
        t.equal(select.options[select.selectedIndex].value, '');
        t.equal(select.options[select.selectedIndex].text, 'Please choose:');
        t.equal(view.valid, true);
    }));

    s.test('clear on `required` view`', sync(function (t) {
        view = new SelectView({
            autoRender: true,
            name: 'word',
            options: arr,
            value: 'two',
            required: true
        });

        var select = view.el.querySelector('select');

        t.equal(select.options[select.selectedIndex].value, 'two');
        try {
            view.clear();
            t.ok(false, 'view cleared without null option');
        } catch(err) {
            t.ok(true, 'view unable to clear without null option');
        }
        t.equal(view.value, null);
        t.equal(view.valid, false);
    }));

    s.test('clear on `required` view with `unselectedText`', sync(function (t) {
        view = new SelectView({
            autoRender: true,
            name: 'word',
            options: arr,
            unselectedText: 'Please choose:',
            value: 'two',
            required: true
        });

        var select = view.el.querySelector('select');

        t.equal(select.options[select.selectedIndex].value, 'two');
        view.clear();
        t.equal(select.options[select.selectedIndex].value, '');
        t.equal(select.options[select.selectedIndex].text, 'Please choose:');
        view.validate();
        t.equal(view.valid, false);
    }));

    s.test('reset on view with initial value', sync(function (t) {
        view = new SelectView({
            autoRender: true,
            name: 'word',
            options: [0, 1, 2],
            value: 0,
            unselectedText: 'Please choose:'
        });

        var select = view.el.querySelector('select');

        t.equal(view.value, 0);

        view.setValue(2);
        t.equal(select.options[select.selectedIndex].value, '2');

        view.reset();
        t.equal(view.value, 0);
    }));

    s.test('reset on view with no initial value', sync(function (t) {
        view = new SelectView({
            autoRender: true,
            name: 'word',
            options: arr
        });

        var select = view.el.querySelector('select');

        view.setValue('three');
        t.equal(select.options[select.selectedIndex].value, 'three');

        view.reset();
        t.equal(select.options[select.selectedIndex].value, 'one');
        t.equal(view.value, 'one');
    }));

    s.test('reset on view where initial value missing', sync(function (t) {
        var ops = [0, 1, 2];
        view = new SelectView({
            autoRender: true,
            name: 'word',
            options: ops,
            value: 2
        });
        delete ops[2];
        try {
            view.reset();
            t.ok(false, 'reset occurred without resetting view.value to view.startingValue');
        } catch (err) {
            t.ok(true, 'reset enforces that original value present in option set');
        }
    }));

    s.test('beforeSubmit', sync(function (t) {
        var called, formView;
        var formEl = document.createElement('form');
        view = new SelectView({
            name: 'word',
            options: arr,
            required: true,
            beforeSubmit: function() {
                called = true;
            }
        });
        formView = new FormView({
            el: formEl,
            autoRender: true,
            fields: [view]
        });

        formView.beforeSubmit();
        t.ok(called, 'beforeSubmit gets registered');
        t.ok(view.valid, 'form is valid on form submit');

    }));
});

suite('Options array with number items', function (s) {
    s.beforeEach(function () {
        arr = [0, 1, 1.5, 2];
        view = null;
    });

    s.test('renders the number options into the select', sync(function (t) {
        view = new SelectView({
            autoRender: true,
            name: 'num',
            options: arr
        });

        var optionNodes = view.el.querySelectorAll('select option');

        t.equal(optionNodes.length, 4);

        t.equal(optionNodes[0].value, '0');
        t.equal(optionNodes[0].textContent, '0');

        t.equal(optionNodes[1].value, '1');
        t.equal(optionNodes[1].textContent, '1');

        t.equal(optionNodes[2].value, '1.5');
        t.equal(optionNodes[2].textContent, '1.5');
    }));

});

suite('Options array with string items', function (s) {
    s.beforeEach(function () {
        arr = ['one', 'two', 'three'];
        view = null;
    });

    s.test('renders the options into the select (array)', sync(function (t) {
        view = new SelectView({
            autoRender: true,
            name: 'word',
            options: arr
        });

        var optionNodes = view.el.querySelectorAll('select option');

        t.equal(optionNodes.length, 3);

        t.equal(optionNodes[0].value, 'one');
        t.equal(optionNodes[0].textContent, 'one');

        t.equal(optionNodes[1].value, 'two');
        t.equal(optionNodes[1].textContent, 'two');

        t.equal(optionNodes[2].value, 'three');
        t.equal(optionNodes[2].textContent, 'three');
    }));

    s.test('renders the empty item', sync(function (t) {
        view = new SelectView({
            autoRender: true,
            name: 'word',
            options: arr,
            unselectedText: 'Please choose:'
        });

        var optionNodes = view.el.querySelectorAll('select option');

        t.equal(optionNodes.length, 4);

        t.equal(optionNodes[0].value, '', 'First option value should be empty string.');
        t.equal(optionNodes[0].innerHTML, 'Please choose:', 'First option should have unselectedText');

        t.equal(optionNodes[1].value, 'one');
        t.equal(optionNodes[1].textContent, 'one');
    }));

    s.test('selects the right item (options: [\'valAndText\'])', sync(function (t) {
        view = new SelectView({
            autoRender: true,
            name: 'word',
            options: arr,
            unselectedText: 'Please choose:',
            value: 'two'
        });

        var select = view.el.querySelector('select');

        t.equal(select.options[select.selectedIndex].value, 'two');

        view.setValue(undefined);
        t.equal(select.options[select.selectedIndex].innerHTML, 'Please choose:');

        view.setValue('one');
        t.equal(select.options[select.selectedIndex].value, 'one');

        try {
            view.setValue('invalid-option');
            t.ok(false, 'unable to set invalid option');
        } catch (err) {
            t.ok(true, 'unable to set invalid option');
        }
    }));

    s.test('options are enabled', sync(function (t) {
        view = new SelectView({
            autoRender: true,
            name: 'word',
            options: arr,
            unselectedText: 'Please choose:',
            value: 'two'
        });
        var optionNodes = view.el.querySelectorAll('select option');
        t.equal(optionNodes[0].disabled, false);
        t.equal(optionNodes[1].disabled, false);
        t.equal(optionNodes[2].disabled, false);
    }));

});

suite('Options array with array items', function (s) {
    s.beforeEach(function() {
        arr =  [ ['one', 'Option One'], ['two', 'Option Two', false], ['three', 'Option Three', true] ];
        arrNum =  [ [0, 'Option Zero'], [1, 1, false], [1.5, 1.5, true] ];
        view = null;
    });

    s.test('renders the arr-num options into the select', sync(function (t) {
        view = new SelectView({
            autoRender: true,
            name: 'num',
            options: arrNum
        });

        var optionNodes = view.el.querySelectorAll('select option');

        t.equal(optionNodes.length, 3);

        t.equal(optionNodes[0].value, '0');
        t.equal(optionNodes[0].textContent, 'Option Zero');

        t.equal(optionNodes[1].value, '1');
        t.equal(optionNodes[1].textContent, '1');

        t.equal(optionNodes[2].value, '1.5');
        t.equal(optionNodes[2].textContent, '1.5');
        t.ok(optionNodes[2].disabled, true);
    }));

    s.test('renders the arr-str options into the select', sync(function (t) {
        view = new SelectView({
            autoRender: true,
            name: 'word',
            options: arr
        });

        var optionNodes = view.el.querySelectorAll('select option');

        t.equal(optionNodes.length, 3);

        t.equal(optionNodes[0].value, 'one');
        t.equal(optionNodes[0].textContent, 'Option One');

        t.equal(optionNodes[1].value, 'two');
        t.equal(optionNodes[1].textContent, 'Option Two');

        t.equal(optionNodes[2].value, 'three');
        t.equal(optionNodes[2].textContent, 'Option Three');
    }));

    s.test('renders the empty item', sync(function (t) {
        view = new SelectView({
            autoRender: true,
            name: 'word',
            options: arr,
            unselectedText: 'Please choose:'
        });

        var optionNodes = view.el.querySelectorAll('select option');

        t.equal(optionNodes.length, 4);

        t.equal(optionNodes[0].value, '', 'First option value should be empty string.');
        t.equal(optionNodes[0].innerHTML, 'Please choose:', 'First option should have unselectedText');

        t.equal(optionNodes[1].value, 'one');
        t.equal(optionNodes[1].textContent, 'Option One');
    }));

    s.test('selects the right item (options:  [[\'val\', \'text\']])', sync(function (t) {
        view = new SelectView({
            autoRender: true,
            name: 'word',
            options: arr,
            unselectedText: 'Please choose:',
            value: 'two'
        });

        var select = view.el.querySelector('select');

        t.equal(select.options[select.selectedIndex].value, 'two');

        view.setValue(undefined);
        t.equal(select.options[select.selectedIndex].innerHTML, 'Please choose:');

        view.setValue('one');
        t.equal(select.options[select.selectedIndex].value, 'one');

        try {
            view.setValue('totes-wrong');
            t.ok(false, 'unable to set invalid option');
        } catch(err) {
            t.ok('unable to set invalid option');
        }
    }));

    s.test('renders a disabled item if a third value is passed which is truthy', sync(function (t) {
        view = new SelectView({
            autoRender: true,
            name: 'word',
            options: arr
        });

        var optionNodes = view.el.querySelectorAll('select option');

        t.equal(optionNodes[0].disabled, false);
        t.equal(optionNodes[1].disabled, false);
        t.equal(optionNodes[2].disabled, true);
    }));
});

suite('With ampersand collection', function (s) {
    s.beforeEach(function() {
        view = null;
        coll = new Collection([
            { id: 0, someOtherKey: 'zero', title: 'Option zero' },
            { id: 1, someOtherKey: 'foo',  title: 'Option one' },
            { id: 2, someOtherKey: 'bar',  title: 'Option two' },
            { id: 3, someOtherKey: 'baz',  title: 'Option three' }
        ]);
    });

    s.test('renders the options into the select (collection)', sync(function (t) {
        view = new SelectView({
            autoRender: true,
            name: 'word',
            options: coll,
            idAttribute: 'id',
            textAttribute: 'title'
        });

        var optionNodes = view.el.querySelectorAll('select option');
        t.equal(optionNodes.length, 4, 'node list length (collection)');

        t.equal(optionNodes[0].value, '0');
        t.equal(optionNodes[0].textContent, 'Option zero');

        t.equal(optionNodes[1].value, '1');
        t.equal(optionNodes[1].textContent, 'Option one');

        t.equal(optionNodes[2].value, '2');
        t.equal(optionNodes[2].textContent, 'Option two');

        t.equal(optionNodes[3].value, '3');
        t.equal(optionNodes[3].textContent, 'Option three');
    }));

    s.test('rerenders if the collection changes', sync(function (t) {
        var coll = new Collection([
            { id: 1, someOtherKey: 'foo', title: 'Option one' },
            { id: 2, someOtherKey: 'bar', title: 'Option two' },
            { id: 3, someOtherKey: 'baz', title: 'Option three' }
        ]);

        view = new SelectView({
            autoRender: true,
            name: 'word',
            options: coll,
            idAttribute: 'id',
            textAttribute: 'title'
        });

        var optionNodes = view.el.querySelectorAll('select option');
        t.equal(optionNodes.length, 3, 'should have same #<option> nodes corresponding to collection models');

        coll.add({ id: 4, someOtherKey: 'four', title: 'Option four' });
        optionNodes = view.el.querySelectorAll('select option');
        t.equal(optionNodes.length, 4, 'should add <option> nodes when adding collection models');

        optionNodes = view.el.querySelectorAll('select option');
        t.equal(optionNodes.length, 4);
        t.equal(optionNodes[3].value, '4');
        t.equal(optionNodes[3].textContent, 'Option four');

        t.equal(view.value, coll.models[0], 'default value should be first in collection');
        coll.remove({ id: 1 });
        optionNodes = view.el.querySelectorAll('select option');
        t.equal(view.value, coll.models[0], 'should set value to first value in collection when current selected model removed');
        t.equal(optionNodes.length, 3, 'option nodes should be reduced when model removed');

        view.setValue(4);
        coll.remove({ id: 2 });
        t.equal(view.value, coll.get(4), 'should retain value if unassociated model removed');

        coll.reset([
            { id: 10, someOtherKey: 'bar', title: 'Option ten' },
            { id: 20, someOtherKey: 'foo', title: 'Option twenty' },
        ]);

        optionNodes = view.el.querySelectorAll('select option');
        t.equal(optionNodes.length, 2);
        t.equal(optionNodes[0].value, '10');
        t.equal(optionNodes[0].textContent, 'Option ten');
        t.equal(optionNodes[1].value, '20');
        t.equal(optionNodes[1].textContent, 'Option twenty');
    }));

    s.test('renders the options into the select with different id attribute (collection)', sync(function (t) {
        view = new SelectView({
            autoRender: true,
            name: 'word',
            options: coll,
            idAttribute: 'someOtherKey',
            textAttribute: 'title'
        });

        var optionNodes = view.el.querySelectorAll('select option');

        t.equal(optionNodes.length, 4);

        t.equal(optionNodes[0].value, 'zero');
        t.equal(optionNodes[1].value, 'foo');
        t.equal(optionNodes[2].value, 'bar');
        t.equal(optionNodes[3].value, 'baz');
    }));

    s.test('renders the empty item', sync(function (t) {
        view = new SelectView({
            autoRender: true,
            name: 'word',
            options: coll,
            idAttribute: 'id',
            textAttribute: 'title',
            unselectedText: 'Please choose:'
        });

        var optionNodes = view.el.querySelectorAll('select option');

        t.equal(optionNodes.length, 5);

        t.equal(optionNodes[0].value, '');
        t.equal(optionNodes[0].innerHTML, 'Please choose:');

        t.equal(optionNodes[2].value, '1');
        t.equal(optionNodes[2].textContent, 'Option one');
    }));

    s.test('exhibits normal behavior on null model option', sync(function (t) {
        var coll = new VolatileCollection([
            { id: 0, someOtherKey: 'foo', title: 'Option zero' },
            { id: null, someOtherKey: 'bar', title: 'Option null' },
            { id: 2, someOtherKey: 'baz', title: 'Option two' },
        ]);

        view = new SelectView({
            autoRender: true,
            name: 'testNullId',
            options: coll,
            idAttribute: 'id',
            textAttribute: 'title'
        });

        var optionNodes = view.el.querySelectorAll('select option');

        t.equal(optionNodes.length, 3);

        t.equal(optionNodes[0].value, '0', 'option before null model has correct value');
        t.equal(optionNodes[0].textContent, 'Option zero', 'selected option should be Option zero');

        t.equal(view.value, null, 'Option null should be selected with field value: null');
        t.equal(optionNodes[1].value, '', 'selected option should be empty string');

        t.equal(optionNodes[2].value, '2', 'option after null model has correct value');
        t.equal(optionNodes[2].textContent, 'Option two');
    }));

    s.test('selects the right item by id/model (options: collection)', sync(function (t) {
        view = new SelectView({
            autoRender: true,
            name: 'word',
            options: coll,
            unselectedText: 'Please choose:',
            idAttribute: 'id',
            textAttribute: 'title',
            required: true,
            value: 2
        });

        var select = view.el.querySelector('select');

        t.equal(view.value, coll.at(2));
        t.ok(view.valid);
        t.equal(select.options[select.selectedIndex].innerHTML, 'Option two');

        view.clear();
        t.equal(view.value, null);
        t.notOk(view.valid);
        t.equal(select.options[select.selectedIndex].innerHTML, 'Please choose:');

        view.setValue('1');
        t.equal(view.value, coll.at(1));
        t.ok(view.valid);
        t.equal(select.options[select.selectedIndex].innerHTML, 'Option one');

        view.setValue(coll.at(2));
        t.equal(view.value, coll.at(2));
        t.ok(view.valid);
        t.equal(select.options[select.selectedIndex].innerHTML, 'Option two');
    }));

    s.test('selects the right item by id/model (options: collection), with yieldModel: false', sync(function (t) {
        view = new SelectView({
            autoRender: true,
            name: 'word',
            options: coll,
            unselectedText: 'Please choose:',
            idAttribute: 'id',
            textAttribute: 'title',
            yieldModel: false,
            required: true,
            value: 2
        });

        var select = view.el.querySelector('select');

        t.equal(view.value, 2);
        t.ok(view.valid);
        t.equal(select.options[select.selectedIndex].innerHTML, 'Option two');

        view.setValue(undefined);
        t.equal(view.value, null);
        t.notOk(view.valid);
        t.equal(select.options[select.selectedIndex].innerHTML, 'Please choose:');

        view.setValue('1');
        t.equal(view.value, 1);
        t.ok(view.valid);
        t.equal(select.options[select.selectedIndex].innerHTML, 'Option one');

        view.setValue(coll.get(2));
        t.equal(view.value, 2);
        t.ok(view.valid);
        t.equal(select.options[select.selectedIndex].innerHTML, 'Option two');

        try {
            view.setValue(1000);
            t.ok(false, 'should not be able to set invalid model id or model obj');
        } catch (err) {
            t.ok(true, 'should not be able to set invalid model id or model obj');
        }
    }));

    s.test('renders a disabled item for a model that has the attribute specified in the disabledAttribute option set to truthy', sync(function (t) {
        var coll = new Collection([
            { id: 1, someOtherKey: 'foo', title: 'Option one' },
            { id: 2, someOtherKey: 'bar', title: 'Option two', disabled: null },
            { id: 3, someOtherKey: 'baz', title: 'Option three', disabled: false },
            { id: 4, someOtherKey: 'baz', title: 'Option four', disabled: true  }
        ]);

        view = new SelectView({
            autoRender: true,
            name: 'word',
            options: coll,
            idAttribute: 'id',
            textAttribute: 'title',
            unselectedText: 'Please choose:',
            disabledAttribute: 'disabled'
        });

        var optionNodes = view.el.querySelectorAll('select option');

        t.equal(optionNodes[1].disabled, false);
        t.equal(optionNodes[2].disabled, false);
        t.equal(optionNodes[3].disabled, false);
        t.equal(optionNodes[4].disabled, true);
    }));

    s.test('removes el from parent when remove is invoked', sync(function (t) {
        t.plan(2);

        var parent = document.createElement('div');
        var el = document.createElement('div');
        parent.appendChild(el);

        view = new SelectView({
            autoRender: true,
            el: el,
            name: 'num',
            options: arr
        });

        t.equal(parent.childNodes[0], el, 'parentNode contains view el');
        view.remove();
        t.equal(parent.childNodes[0], undefined, 'view el removed via remove()');
    }));

    s.test('does not fail when el has no parent and remove is invoked', sync(function (t) {
        view = new SelectView({
            autoRender: true,
            name: 'num',
            options: arr
        });

        t.equal(view.el.parentNode, null);

        view.remove();
    }));

});
