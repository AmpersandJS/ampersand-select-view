var suite = require('tape-suite');
var viewConventions = require('ampersand-view-conventions');
var SelectView = require('../ampersand-select-view');
var AmpersandState = require('ampersand-state');
var AmpersandCollection = require('ampersand-collection');

var Model = AmpersandState.extend({
    props: {
        id: 'number',
        someOtherKey: 'string',
        title: 'string'
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
        var labelText = view.el.querySelector('[role=label]').textContent;
        t.equal(labelText, 'Choose a word');
    }));

    s.test('label text falls back to name', sync(function (t) {
        view = new SelectView({ name: 'word', options: [] });
        var labelText = view.el.querySelector('[role=label]').textContent;
        t.equal(labelText, 'word');
    }));
});

suite('Options array with key/value', function (s) {
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
        view = new SelectView({ name: 'word', options: arr, unselectedText: 'Please choose:' });

        var optionNodes = view.el.querySelectorAll('select option');

        t.equal(optionNodes.length, 4);

        t.equal(optionNodes[0].value, '');
        t.equal(optionNodes[0].innerHTML, 'Please choose:');

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



suite('With ampersand collection', function (s) {
    var coll = new Collection([
        { id: 1, someOtherKey: 'foo', title: 'Option one' },
        { id: 2, someOtherKey: 'bar', title: 'Option two' },
        { id: 3, someOtherKey: 'baz', title: 'Option three' },
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
            value: 2
        });

        var select = view.el.querySelector('select');

        t.equal(view.value, coll.at(1));
        t.equal(select.options[select.selectedIndex].innerHTML, 'Option two');

        view.setValue(undefined);
        t.equal(view.value, undefined);
        t.equal(select.options[select.selectedIndex].innerHTML, 'Please choose:');

        view.setValue('1');
        t.equal(view.value, coll.at(0));
        t.equal(select.options[select.selectedIndex].innerHTML, 'Option one');

        view.setValue('totes-wrong');
        t.equal(view.value, undefined);
        t.equal(select.options[select.selectedIndex].innerHTML, 'Please choose:');

        view.setValue(coll.at(1));
        t.equal(view.value, coll.at(1));
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
            value: 2
        });

        var select = view.el.querySelector('select');

        t.equal(view.value, 2);
        t.equal(select.options[select.selectedIndex].innerHTML, 'Option two');

        view.setValue(undefined);
        t.equal(view.value, void 0);
        t.equal(select.options[select.selectedIndex].innerHTML, 'Please choose:');

        view.setValue('1');
        t.equal(view.value, 1);
        t.equal(select.options[select.selectedIndex].innerHTML, 'Option one');

        view.setValue('totes-wrong');
        t.equal(view.value, void 0);
        t.equal(select.options[select.selectedIndex].innerHTML, 'Please choose:');

        view.setValue(coll.at(1));
        t.equal(view.value, 2);
        t.equal(select.options[select.selectedIndex].innerHTML, 'Option two');
    }));
});
