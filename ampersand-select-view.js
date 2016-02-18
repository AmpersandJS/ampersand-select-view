/* $AMPERSAND_VERSION */
var domify = require('domify');
var dom = require('ampersand-dom');
var matches = require('matches-selector');
var View = require('ampersand-view');

var createOption = function(value, text, disabled) {
    var node = document.createElement('option');

    //Set to empty-string if undefined or null, but not if 0, false, etc
    if (value === null || value === undefined) value = '';

    if (disabled) node.disabled = true;
    node.textContent = text;
    node.value = value;

    return node;
};

var createOptgroup = function(text) {
    var node = document.createElement('optgroup');
    node.label = text;

    return node;
};

module.exports = View.extend({
    //Replaceable with anything with label, message-container, message-text data-hooks and a <select>
    template: [
        '<label class="select">',
            '<span data-hook="label"></span>',
            '<select></select>',
            '<span data-hook="message-container" class="message message-below message-error">',
                '<p data-hook="message-text"></p>',
            '</span>',
        '</label>'
    ].join('\n'),
    initialize: function(opts) {
        opts = opts || {};

        if (typeof opts.name !== 'string') throw new Error('SelectView requires a name property.');
        this.name = opts.name;

        if (opts.groupOptions) {
            if (opts.options) {
                throw new Error('Don\'t provide ampersand-select-view with both options and groupOptions properties, as option will be generated with values from groupOptions.');
            }
            // Create the options array from the groupOptions property, containing
            // only the values that will result in an <option> element
            this.groupOptions = opts.groupOptions;
            opts.options = [];

            opts.groupOptions.forEach(function(optgroup) {
                optgroup.options.forEach(function(option) {
                    opts.options.push(option);
                }.bind(this));
            }.bind(this));
        }

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
        this.label = opts.label || '';
        this.parent = opts.parent || this.parent;
        if (opts.template) this.template = opts.template;
        this.unselectedText = opts.unselectedText;
        this.startingValue = opts.value;
        this.yieldModel = (opts.yieldModel === false) ? false : true;

        this.tabindex = opts.tabindex || '0';

        this.eagerValidate = opts.eagerValidate;
        this.required = opts.required || false;
        this.validClass = opts.validClass || 'input-valid';
        this.invalidClass = opts.invalidClass || 'input-invalid';
        if (opts.requiredMessage === undefined) {
            this.requiredMessage = 'Selection required';
        } else {
            this.requiredMessage = opts.requiredMessage;
        }

        this.onChange = this.onChange.bind(this);

        this.startingValue = this.setValue(opts.value, this.eagerValidate ? false : true, true);

        if (opts.beforeSubmit) this.beforeSubmit = opts.beforeSubmit;
        if (opts.autoRender) this.autoRender = opts.autoRender;
    },

    render: function() {
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
        if (this.select) this.select.setAttribute('tabindex', this.tabindex);

        this.bindDOMEvents();
        this.renderOptions();
        this.updateSelectedOption();

        if (this.options.isCollection) {
            this.options.on('add remove reset', function() {
                var setValueFirstModel = function() {
                    if (!this.options.length) return;
                    if (this.yieldModel) this.setValue(this.options.models[0]);
                    else this.setValue(this.options.models[0][this.idAttribute]);
                }.bind(this);

                this.renderOptions();
                if (this.hasOptionByValue(this.value)) this.updateSelectedOption();
                else setValueFirstModel();
            }.bind(this));
        }

        this.validate(this.eagerValidate ? false : true, true);

        return this;
    },


    onChange: function() {
        var value = this.select.options[this.select.selectedIndex].value;

        if (this.options.isCollection && this.yieldModel) {
            value = this.getModelForId(value);
        }

        this.setValue(value);
    },

    /**
     * Finds a model in the options collection provided an ID
     * @param  {any} id
     * @return {State}
     * @throws {RangeError} If model not found
     */
    getModelForId: function(id) {
        return this.options.filter(function(model) {
            // intentionally coerce for '1' == 1
            return model[this.idAttribute] == id;
        }.bind(this))[0];
    },

    bindDOMEvents: function() {
        this.select.addEventListener('change', this.onChange, false);
    },

    renderOptions: function() {
        if (!this.select) return;

        this.select.innerHTML = '';
        if (this.unselectedText !== undefined) {
            this.select.appendChild(
                createOption(null, this.unselectedText)
            );
        }

        if (this.groupOptions) {
            this.groupOptions.forEach(function(optgroup) {
                // this.groupOptions is an array of Objects representing <optgroup> elements
                var optGroupElement = createOptgroup(optgroup.groupName);
                // Loop over the <options> from that <optgroup>
                optgroup.options.forEach(function(option) {
                    // Add the <option>s to the <optgroup>
                    optGroupElement.appendChild(
                        createOption(
                            this.getOptionValue(option),
                            this.getOptionText(option),
                            this.getOptionDisabled(option)
                        )
                    );
                }.bind(this));
                // Add the <optgroup> to the <select>
                this.select.appendChild(optGroupElement);
            }.bind(this));
        } else {
            this.options.forEach(function(option) {
                // Create and add the <option> to the <select>
                this.select.appendChild(
                    createOption(
                        this.getOptionValue(option),
                        this.getOptionText(option),
                        this.getOptionDisabled(option)
                    )
                );
            }.bind(this));
        }
    },

    /**
     * Updates the <select> control to set the select option when the option
     * has changed programatically (i.e. not through direct user selection)
     * @return {SelectView} this
     * @throws {Error} If no option exists for this.value
     */
    updateSelectedOption: function() {
        var lookupValue = this.value;
        if (lookupValue === null || lookupValue === undefined || lookupValue === '') {
            if (this.unselectedText !== undefined || (!this.startingValue && !this.rendered)) {
                this.select.selectedIndex = 0;
                return this;
            } else if (!this.options.length && this.value === null) {
                return this;
            }
        }

        // Pull out the id if it's a model
        if (this.options.isCollection && this.yieldModel) {
            lookupValue = lookupValue && lookupValue[this.idAttribute];
        }

        if (lookupValue || lookupValue === 0 || lookupValue === null) {
            if (lookupValue === null) lookupValue = ''; // DOM sees only '' empty value
            for (var i = this.select.options.length; i--; i) {
                if (this.select.options[i].value == lookupValue) {
                    this.select.selectedIndex = i;
                    return this;
                }
            }
        }

        // failed to match any
        throw new Error('no option exists for value: ' + lookupValue);
    },

    remove: function() {
        if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
        this.el.removeEventListener('change', this.onChange, false);
    },

    /**
     * Sets control to unselectedText option, or user specified option with `null`
     * value
     * @return {SelectView} this
     */
    clear: function() {
        this.setValue(null, true);
        return this;
    },

    /**
     * Sets the selected option and view value to the original option value provided
     * during construction
     * @return {SelectView} this
     */
    reset: function() {
        return this.setValue(this.startingValue, true);
    },

    setValue: function(value, skipValidationMessage, init) {
        var option, model, nullValid;

        // enforce the <select> control to contain only a singular falsy
        // value (excluding 0), because browsers will set the select.value
        // in each case to be the empty string
        if (value === null || value === undefined || value === '') {
            this.value = null;

            // test if null is a valid option
            if (this.unselectedText !== undefined) {
                nullValid = true;
            } else {
                nullValid = this.hasOptionByValue(null);
            }

            // empty value requested to be set.  This may be because the field is just
            // initializing.  If initializing and `null` isn't in the honored option set
            // set the select to the 0-th index
            if (init && this.options.length && !nullValid) {
                // no initial value passed, set initial value to first item in set
                if (this.options.isCollection) {
                    model = this.options.models[0];
                    this.value = this.yieldModel ? model : model[this.idAttribute];
                } else {
                    if (Array.isArray(this.options[0])) {
                        this.value = this.options[0][0];
                    } else {
                        this.value = this.options[0];
                    }
                }
            }
        } else {
            // Ensure corresponding option exists before assigning value
            option = this.getOptionByValue(value);
            this.value = Array.isArray(option) ? option[0] : option;
        }
        this.validate(skipValidationMessage);
        if (this.select) this.updateSelectedOption();
        if (this.parent && typeof this.parent.update === 'function') this.parent.update(this);
        return this.value;
    },

    validate: function(skipValidationMessage) {
        if (!this.required) {
            // selected option always known to be in option set,
            // thus field is always valid if not required
            this.valid = true;
            if (this.select) this.toggleMessage(skipValidationMessage);
            return this.valid;
        }

        if (this.required && !this.value && this.value !== 0) {
            this.valid = false;
            if (this.select) this.toggleMessage(skipValidationMessage, this.requiredMessage);
        } else {
            this.valid = true;
            if (this.select) this.toggleMessage(skipValidationMessage);
        }

        return this.valid;
    },

    /**
     * Called by FormView on submit
     * @return {SelectView} this
     */
    beforeSubmit: function() {
        if (this.select) this.setValue(this.select.options[this.select.selectedIndex].value);
    },

    /**
     * Gets the option corresponding to provided value.
     * @param  {*} string, state, or model
     * @return {*} string, array, state, or model
     */
    getOptionByValue: function(value) {
        var model;
        if (this.options.isCollection) {
            // find value in collection, error if no model found
            if (this.options.indexOf(value) === -1) model = this.getModelForId(value);
            else model = value;
            if (!model) throw new Error('model or model idAttribute not found in options collection');
            return this.yieldModel ? model : model[this.idAttribute];
        } else if (Array.isArray(this.options)) {
            // find value value in options array
            // find option, formatted [['val', 'text'], ...]
            if (this.options.length && Array.isArray(this.options[0])) {
                for (var i = this.options.length - 1; i >= 0; i--) {
                    if (this.options[i][0] == value) return this.options[i];
                }
            }
            // find option, formatted ['valAndText', ...] format
            if (this.options.length && this.options.indexOf(value) !== -1) return value;
            throw new Error('value not in set of provided options');
        }
        throw new Error('select option set invalid');
    },



    /**
     * Tests if option set has an option corresponding to the provided value
     * @param  {*} value
     * @return {Boolean}
     */
    hasOptionByValue: function(value) {
        try {
            this.getOptionByValue(value);
            return true;
        } catch (err) {
            return false;
        }
    },



    getOptionValue: function(option) {
        if (Array.isArray(option)) return option[0];
        if (this.options.isCollection) return option[this.idAttribute];
        return option;
    },

    getOptionText: function(option) {
        if (Array.isArray(option)) return option[1];
        if (this.options.isCollection) {
            if (this.textAttribute && option[this.textAttribute] !== undefined) {
                return option[this.textAttribute];
            }
        }

        return option;
    },

    getOptionDisabled: function(option) {
        if (Array.isArray(option)) return option[2];
        if (this.options.isCollection && this.disabledAttribute) return option[this.disabledAttribute];

        return false;
    },

    toggleMessage: function(hide, message) {
        var mContainer = this.el.querySelector('[data-hook~=message-container]'),
            mText = this.el.querySelector('[data-hook~=message-text]');

        if (!mContainer || !mText) return;

        if (hide) {
            dom.hide(mContainer);
            mText.textContent = '';
            dom.removeClass(this.el, this.validClass);
            dom.removeClass(this.el, this.invalidClass);
            return;
        }

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
    }

});
