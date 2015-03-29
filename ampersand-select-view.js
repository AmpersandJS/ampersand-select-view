/* $AMPERSAND_VERSION */
var domify = require('domify');
var dom = require('ampersand-dom');
var matches = require('matches-selector');
var isArray = require('amp-is-array');

//Replaceable with anything with label, message-container, message-text data-hooks and a <select>
var defaultTemplate = [
    '<label class="select">',
        '<span data-hook="label"></span>',
        '<select></select>',
        '<span data-hook="message-container" class="message message-below message-error">',
            '<p data-hook="message-text"></p>',
        '</span>',
    '</label>'
].join('\n');



function SelectView (opts) {
    opts = opts || {};

    if (typeof opts.name !== 'string') throw new Error('SelectView requires a name property.');
    this.name = opts.name;

    if (!Array.isArray(opts.options) && !opts.options.isCollection) {
        throw new Error('SelectView requires select options.');
    }
    this.options = opts.options;

    if (this.options.isCollection) {
        this.idAttribute = opts.idAttribute || this.options.mainIndex || 'id';
        this.textAttribute = opts.textAttribute || 'text';
        this.disabledAttribute = opts.disabledAttribute;
    }

    this.el = opts.el;
    this.label = opts.label || this.name; // init as string. render() mutates into DOM el with .textContent equal to this value
    this.parent = opts.parent;
    this.template = opts.template || defaultTemplate;
    this.unselectedText = opts.unselectedText;
    this.startingValue = opts.value;
    this.yieldModel = (opts.yieldModel === false) ? false : true;

    this.required = opts.required || false;
    this.validClass = opts.validClass || 'input-valid';
    this.invalidClass = opts.invalidClass || 'input-invalid';
    this.requiredMessage = opts.requiredMessage || 'Selection required';

    this.onChange = this.onChange.bind(this);

    this.render();

    this.setValue(opts.value, opts.eagerValidate ? false : true);
}

SelectView.prototype.render = function () {
    var elDom,
        labelEl;
    if (this.rendered) return;

    elDom = domify(this.template);
    if (!this.el) this.el = elDom;
    else this.el.appendChild(elDom);

    labelEl = this.el.querySelector('[data-hook~=label]');
    if (labelEl) {
        labelEl.textContent = this.label;
        this.label = labelEl;
    } else {
        delete this.label;
    }

    if (this.el.tagName === 'SELECT') {
        this.select = this.el;
    } else {
        this.select = this.el.querySelector('select');
    }
    if (!this.select) throw new Error('no select found in template');
    if (matches(this.el, 'select')) this.select = this.el;
    if (this.select) this.select.setAttribute('name', this.name);

    this.bindDOMEvents();
    this.renderOptions();
    this.updateSelectedOption();

    if (this.options.isCollection) {
        this.options.on('add remove reset', function () {
            this.renderOptions();
            this.updateSelectedOption();
        }.bind(this));
    }

    this.rendered = true;
};


SelectView.prototype.onChange = function () {
    var value = this.select.options[this.select.selectedIndex].value;

    if (this.options.isCollection && this.yieldModel) {
        value = this.getModelForId(value);
    }

    this.setValue(value);
};

/**
 * Finds a model in the options collection provided an ID
 * @param  {any} id
 * @return {State}
 * @throws {RangeError} If model not found
 */
SelectView.prototype.getModelForId = function (id) {
    return this.options.filter(function (model) {
        // intentionally coerce for '1' == 1
        return model[this.idAttribute] == id;
    }.bind(this))[0];
};

SelectView.prototype.bindDOMEvents = function () {
    this.el.addEventListener('change', this.onChange, false);
};

SelectView.prototype.renderOptions = function () {
    if (!this.select) return;

    this.select.innerHTML = '';
    if (this.unselectedText) {
        this.select.appendChild(
            createOption(null, this.unselectedText)
        );
    }

    this.options.forEach(function (option) {
        this.select.appendChild(
            createOption(
                this.getOptionValue(option),
                this.getOptionText(option),
                this.getOptionDisabled(option)
            )
        );
    }.bind(this));
};

/**
 * Updates the <select> control to set the select option when the option
 * has changed programatically (i.e. not through direct user selection)
 * @return {SelectView} this
 * @throws {Error} If no option exists for this.value
 */
SelectView.prototype.updateSelectedOption = function () {
    var lookupValue = this.value;

    if (lookupValue === null || lookupValue === undefined || lookupValue === '') {
        this.select.selectedIndex = 0;
        return this;
    }

    // Pull out the id if it's a model
    if (this.options.isCollection && this.yieldModel) {
        lookupValue = lookupValue && lookupValue[this.idAttribute];
    }

    if (lookupValue || lookupValue === 0) {
        for (var i = this.select.options.length; i--; i) {
            if (this.select.options[i].value == lookupValue) {
                this.select.selectedIndex = i;
                return this;
            }
        }
    }

    // failed to match any
    throw new Error('no option exists for value: ' + lookupValue);
};

SelectView.prototype.remove = function () {
    if (this.el) this.el.parentNode.removeChild(this.el);
    this.el.removeEventListener('change', this.onChange, false);
};

/**
 * Sets control to unselectedText option, or user specified option with `null`
 * value
 * @return {SelectView} this
 */
SelectView.prototype.clear = function() {
    this.setValue(null, true);
    return this;
};

/**
 * Sets control to option with the same value as initial value if specified, falls 
 * back to unselectedText or first avaialable option depending on availability
 * @return {SelectView} this
 */
SelectView.prototype.reset = function() {
    if(this.startingValue) {
        this.setValue(this.startingValue, true);
    } else {
        this.setValue(this.select.options[0] && this.select.options[0].value, true);
    }

    return this;
};

SelectView.prototype.setValue = function (value, skipValidationMessage) {
    var option;
    if (value === null || value === undefined || value === '') {
        this.value = null;
    } else {
        // Ensure corresponding option exists before assigning value
        option = this.getOptionByValue(value);
        this.value = isArray(option) ? option[0] : option;
    }
    this.validate(skipValidationMessage);
    this.updateSelectedOption();
    if (this.parent) this.parent.update(this);
    return this;
};

SelectView.prototype.validate = function (skipValidationMessage) {
    if (!this.required) {
        // selected option always known to be in option set,
        // thus field is always valid if not required
        this.valid = true;
        return this.valid;
    }

    if (this.required && !this.value && this.value !== 0) {
        this.valid = false;
        if (!skipValidationMessage) this.setMessage(this.requiredMessage);
    } else {
        this.valid = true;
        if (!skipValidationMessage) this.setMessage();
    }

    return this.valid;
};

/**
 * Called by ForumView on submit 
 * @return {SelectView} this
 */
SelectView.prototype.beforeSubmit = function () {
    this.setValue(this.select.options[this.select.selectedIndex] && this.select.options[this.select.selectedIndex].value, false);
    return this;
};

/**
 * Gets the option corresponding to provided value.
 * @param  {*} string, state, or model
 * @return {*} string, array, state, or model
 */
SelectView.prototype.getOptionByValue = function(value) {
    var model;
    if (this.options.isCollection) {
        // find value in collection, error if no model found
        if (this.options.indexOf(value) === -1) model = this.getModelForId(value);
        else model = value;
        return this.yieldModel ? model : model[this.idAttribute];
    } else if (isArray(this.options)) {
        // find value value in options array
        // find option, formatted [['val', 'text'], ...]
        if (this.options.length && isArray(this.options[0])) {
            for (var i = this.options.length - 1; i >= 0; i--) {
                if (this.options[i][0] == value) return this.options[i];
            }
        }
        // find option, formatted ['valAndText', ...] format
        if (this.options.length && this.options.indexOf(value) !== -1) return value;
        throw new Error('value not in set of provided options');
    }
    throw new Error('select option set invalid');
};


SelectView.prototype.getOptionValue = function (option) {
    if (Array.isArray(option)) return option[0];
    if (this.options.isCollection) return option[this.idAttribute];
    return option;
};

SelectView.prototype.getOptionText = function (option) {
    if (Array.isArray(option)) return option[1];

    if (this.options.isCollection) {
        if (this.textAttribute && option[this.textAttribute]) {
            return option[this.textAttribute];
        }
    }

    return option;
};

SelectView.prototype.getOptionDisabled = function (option) {
    if (Array.isArray(option)) return option[2];

    if (this.options.isCollection && this.disabledAttribute) return option[this.disabledAttribute];

    return false;
};

SelectView.prototype.setMessage = function (message) {
    var mContainer = this.el.querySelector('[data-hook~=message-container]');
    var mText = this.el.querySelector('[data-hook~=message-text]');

    if (!mContainer || !mText) return;

    if (message) {
        dom.show(mContainer);
        mText.textContent = message;
        dom.addClass(this.el, this.invalidClass);
        dom.removeClass(this.el, this.validClass);
    } else {
        dom.hide(mContainer);
        mText.textContent = '';
        dom.addClass(this.el, this.validClass);
        dom.removeClass(this.el, this.invalidClass);
    }
};

function createOption (value, text, disabled) {
    var node = document.createElement('option');

    //Set to empty-string if undefined or null, but not if 0, false, etc
    if (value === null || value === undefined) { value = ''; }

    if(disabled) node.disabled = true;
    node.textContent = text;
    node.value = value;

    return node;
}

module.exports = SelectView;
