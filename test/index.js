var suite = require('tape-suite');
var viewConventions = require('ampersand-view-conventions');
var SelectView = require('../ampersand-select-view');
var AmpersandState = require('ampersand-state');
var AmpersandCollection = require('ampersand-collection');

var Model = AmpersandState.extend({
    props: {
        id: 'number',
        someOtherKey: 'string',
        title: 'string',
        disabled: 'boolean'
    }
});

var Collection = AmpersandCollection.extend({
    model: Model
});

if (!Function.prototype.bind) Function.prototype.bind = require('function-bind');

var fieldOptions = {
    name: 'word',
    options: ['foo', 'bar', 'baz']
};

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
    var view;

    s.beforeEach(function () {
        var fieldOptions = {
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
});

suite('Options array with string items', function (s) {
    var arr = ['one', 'two', 'three'];
    var view;

    s.test('renders the options into the select', sync(function (t) {
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

    s.test('selects the right item', sync(function (t) {
        view = new SelectView({ name: 'word', options: arr, unselectedText: 'Please choose:', value: 'two' });

        var select = view.el.querySelector('select');

        t.equal(select.options[select.selectedIndex].value, 'two');

        view.setValue(undefined);
        t.equal(select.options[select.selectedIndex].innerHTML, 'Please choose:');

        view.setValue('one');
        t.equal(select.options[select.selectedIndex].value, 'one');

        view.setValue('totes-wrong');
        t.equal(select.options[select.selectedIndex].innerHTML, 'Please choose:');

    }));
});

suite('Options array with array items', function (s) {
    var arr =  [ ['one', 'Option One'], ['two', 'Option Two', false], ['three', 'Option Three', true] ];
    var view;

    s.test('renders the options into the select', sync(function (t) {
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

    s.test('selects the right item', sync(function (t) {
        view = new SelectView({ name: 'word', options: arr, unselectedText: 'Please choose:', value: 'two' });

        var select = view.el.querySelector('select');

        t.equal(select.options[select.selectedIndex].value, 'two');

        view.setValue(undefined);
        t.equal(select.options[select.selectedIndex].innerHTML, 'Please choose:');

        view.setValue('one');
        t.equal(select.options[select.selectedIndex].value, 'one');

        view.setValue('totes-wrong');
        t.equal(select.options[select.selectedIndex].innerHTML, 'Please choose:');
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
    var coll = new Collection([
        { id: 1, someOtherKey: 'foo', title: 'Option one' },
        { id: 2, someOtherKey: 'bar', title: 'Option two' },
        { id: 3, someOtherKey: 'baz', title: 'Option three' }
    ]);
    var view;

    s.test('renders the options into the select', sync(function (t) {
        view = new SelectView({
            name: 'word',
            options: coll,
            idAttribute: 'id',
            textAttribute: 'title'
        });

        var optionNodes = view.el.querySelectorAll('select option');

        t.equal(optionNodes.length, 3);

        t.equal(optionNodes[0].value, '1');
        t.equal(optionNodes[0].textContent, 'Option one');

        t.equal(optionNodes[1].value, '2');
        t.equal(optionNodes[1].textContent, 'Option two');

        t.equal(optionNodes[2].value, '3');
        t.equal(optionNodes[2].textContent, 'Option three');
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

    s.test('renders the options into the select with different id attribute', sync(function (t) {
        view = new SelectView({
            name: 'word',
            options: coll,
            idAttribute: 'someOtherKey',
            textAttribute: 'title'
        });

        var optionNodes = view.el.querySelectorAll('select option');

        t.equal(optionNodes.length, 3);

        t.equal(optionNodes[0].value, 'foo');
        t.equal(optionNodes[1].value, 'bar');
        t.equal(optionNodes[2].value, 'baz');
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

        t.equal(optionNodes.length, 4);

        t.equal(optionNodes[0].value, '');
        t.equal(optionNodes[0].innerHTML, 'Please choose:');

        t.equal(optionNodes[1].value, '1');
        t.equal(optionNodes[1].textContent, 'Option one');
    }));

    s.test('selects the right item by id/model', sync(function (t) {
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

        t.equal(view.value, coll.at(1));
        t.ok(view.valid);
        t.equal(select.options[select.selectedIndex].innerHTML, 'Option two');

        view.setValue(undefined);
        t.equal(view.value, undefined);
        t.notOk(view.valid);
        t.equal(select.options[select.selectedIndex].innerHTML, 'Please choose:');

        view.setValue('1');
        t.equal(view.value, coll.at(0));
        t.ok(view.valid);
        t.equal(select.options[select.selectedIndex].innerHTML, 'Option one');

        view.setValue('totes-wrong');
        t.equal(view.value, undefined);
        t.notOk(view.valid);
        t.equal(select.options[select.selectedIndex].innerHTML, 'Please choose:');

        view.setValue(coll.at(1));
        t.equal(view.value, coll.at(1));
        t.ok(view.valid);
        t.equal(select.options[select.selectedIndex].innerHTML, 'Option two');
    }));

    s.test('selects the right item by id/model, with yieldModel: false', sync(function (t) {
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
        t.equal(view.value, void 0);
        t.notOk(view.valid);
        t.equal(select.options[select.selectedIndex].innerHTML, 'Please choose:');

        view.setValue('1');
        t.equal(view.value, 1);
        t.ok(view.valid);
        t.equal(select.options[select.selectedIndex].innerHTML, 'Option one');

        view.setValue('totes-wrong');
        t.equal(view.value, void 0);
        t.notOk(view.valid);
        t.equal(select.options[select.selectedIndex].innerHTML, 'Please choose:');

        view.setValue(coll.at(1));
        t.equal(view.value, 2);
        t.ok(view.valid);
        t.equal(select.options[select.selectedIndex].innerHTML, 'Option two');
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
