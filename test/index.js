var suite = require('tape-suite');
var viewConventions = require('ampersand-view-conventions');
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
            options: ['foo', 'bar', 'baz']
        };
        view = new SelectView(fieldOptions);
    });

    s.test('autorenders on init', sync(function (t) {
        t.ok(view.el.querySelector('select'));
    }));

    s.test('renders label text', sync(function (t) {
        var labelText = view.el.querySelector('[data-hook~=label]').textContent;
        t.equal(labelText, 'Choose a word');
    }));

    s.test('label text falls back to name', sync(function (t) {
        view = new SelectView({ name: 'word', options: [] });
        var labelText = view.el.querySelector('[data-hook~=label]').textContent;
        t.equal(labelText, 'word');
    }));

    s.test('works with just <select></select>', sync(function (t) {
        view = new SelectView({
            name: 'word',
            template: '<select></select>',
            options: ['foo', 'bar', 'baz']
        });
        t.equal(view.el.tagName, 'SELECT');
    }));

    s.test('set valid name on select input', sync(function (t) {
        view = new SelectView({ name: 'word', options: [] });
        var selectName = view.el.querySelector('select').getAttribute('name');
        t.equal(selectName, 'word');
    }));

    s.test('eagerValidation', sync(function (t) {
        view = new SelectView({
            name: 'num',
            options: fieldOptions.options,
            eagerValidate: true,
            required: true,
            unselectedText: 'default'
        });

        t.ok(dom.hasClass(view.el, view.invalidClass), 'validation message should be present on el with eagerValidate');
    }));

});

suite('Options array with number items', function (s) {
    s.beforeEach(function () {
        arr = [0, 1, 1.5, 2];
        view = null;
    });

    s.test('renders the number options into the select', sync(function (t) {
        view = new SelectView({ name: 'num', options: arr });

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
        view = new SelectView({ name: 'word', options: arr });

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
        view = new SelectView({ name: 'word', options: arr, unselectedText: 'Please choose:', value: 'two' });

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
        view = new SelectView({ name: 'word', options: arr, unselectedText: 'Please choose:', value: 'two' });
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
        view = new SelectView({ name: 'num', options: arrNum });

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
        view = new SelectView({ name: 'word', options: arr });

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
        view = new SelectView({ name: 'word', options: arr, unselectedText: 'Please choose:', value: 'two' });

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
        view = new SelectView({ name: 'word', options: arr });

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
            { id: 3, someOtherKey: 'baz', title: 'Option three' },
        ]);

        view = new SelectView({
            name: 'word',
            options: coll,
            idAttribute: 'id',
            textAttribute: 'title'
        });

        var optionNodes = view.el.querySelectorAll('select option');
        t.equal(optionNodes.length, 3);

        coll.add({ id: 4, someOtherKey: 'four', title: 'Option four' });

        optionNodes = view.el.querySelectorAll('select option');
        t.equal(optionNodes.length, 4);
        t.equal(optionNodes[3].value, '4');
        t.equal(optionNodes[3].textContent, 'Option four');

        coll.remove({ id: 1 });

        optionNodes = view.el.querySelectorAll('select option');
        t.equal(optionNodes.length, 3);
        t.equal(optionNodes[0].value, '2');
        t.equal(optionNodes[0].textContent, 'Option two');

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
            name: 'testNullId',
            options: coll,
            idAttribute: 'id',
            textAttribute: 'title'
        });

        var optionNodes = view.el.querySelectorAll('select option');

        t.equal(optionNodes.length, 3);

        t.equal(optionNodes[0].value, '0', 'option before null model has correct value');
        t.equal(optionNodes[0].textContent, 'Option zero');

        t.equal(view.value, null); // null option set by default when no value provided
        t.equal(optionNodes[1].value, '');

        t.equal(optionNodes[2].value, '2', 'option after null model has correct value');
        t.equal(optionNodes[2].textContent, 'Option two');
    }));

    s.test('selects the right item by id/model (options: collection)', sync(function (t) {
        view = new SelectView({
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

});
