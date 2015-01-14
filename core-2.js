// A new take on the core - abstraction rather than a library
// 
// core should:
// - handle modules
// - handle extensions
// - handle errors
// sandbox should
// - handle inter-module events
// - handle DOM interaction

/*
 *  Note about the Dom constructor
 *
 *  Dom constructor should handle basic DOM interactions. All prototype methods
 *  should be essential for any library being used (currently using no library
 *  because, for the most part, it's not needed), all methods with a leading
 *  underscore would not be essential - they would be helper methods for the
 *  other methods.
 *
 *  So far, the constructor handles:
 *
 *  -   Traversal
 *  -   Manipulation (although checking should happen to avoid errors).
 *
 *  Should it handle any of these:
 *
 *  -   Classes
 *  -   Events (if so, should delegation be handled?)
 */

var Dom = function () {
    return this.init.apply(this, arguments);
};

Dom.prototype = {

    init: function () {
        // What should this do?
    },

    destroy: function () {
    },

    matches: function (node, selector) {
        return node.matches(selector);
    },

    child: function (node, selector) {
        return this.node.querySelector(selector);
    },

    children: function (node, selector) {
        return Array.prototype.slice.call(node.querySelectorAll(selector));
    },

    _up: function (node, selector) {

        var parent = node;

        while (parent && !this.matches(parent, selector)) {
            parent = parent.parentNode;
        }

        return parent || null;

    },

    parent: function (node, selector) {
        return this._up(node, selector);
    },

    parents: function (node, selector) {

        var parents = [],
            parent  = this._up(node, selector);

        while (parent) {

            parents.push(parent);
            parent = this._up(parent, selector);

        }

        return parents;

    },

    insertBefore: function (newNode, refNode) {
        refNode.parentNode.insertBefore(newNode, refNode);
    },

    insertAfter: function (newNode, refNode) {
        refNode.parentNode.insertBefore(newNode, refNode.nextSibling);
    },

    append: function (newNode, refNode) {
        refNode.appendChild(newNode);
    },

    prepend: function (newNode, refNode) {
        this.insertBefore(newNode, refNode.firstChild);
    },

    remove: function (node) {
        node.parentNode.removeChild(node);
    }

};

/*
 *  Notes on the Sandbox constructor
 *
 *  The Sandbox constructor is passed to each module, allowing modules to talk
 *  to each other and have access to a Dom constructor instance. All that the
 *  Sandbox constructor should do is:
 *
 *  -   Provide methods for error throwing.
 *  -   Provide methods for module conversing.
 *  -   Provide methods for access to helpers.
 *
 */

var Sandbox = function () {
    return this.init.apply(this, arguments);
};

Sandbox.prototype = {

    // Hmm ... how would the settings get passed into the constructor?
    init: function (settings) {

        this.dom = new Dom(settings.parent);

    },

    destroy: function () {
    },

    get: function (helper) {
    },

    error: function (message, type) {
    },

    on: function (event, handler, context) {
    },

    off: function (event, handler) {
    },

    emit: function (event, data) {
    }

};

/*
 *  Errors
 *
 *  Here's an idea for the errors: have an AppError constructor, allowing module
 *  methods to be wrapped in a try-catch, looking for AppError instances. If
 *  the error is an AppError, handle it; if not, pass it along (or handle it).
 *
 *  Currently defining 4 errors (as well as the generic AppError):
 *
 *  -   FatalError
 *      Error is catastrophic, developer has to resolve issue.
 *  -   WarningError
 *      Error is bad for the module - module will be reset in the hope that it
 *      resolves the issue.
 *  -   NoticeError
 *      Error is trivial, module can continue but error should be resolved.
 *  -   DepreciatedError
 *      Module has accessed something depreciated. Should be corrected because
 *      it could cause other errors in the future.
 */


function ucfirst(string) {

    var str = String(string);

    return str[0].toUpperCase() + str.slice(1).toLowerCase();

}

function createError(name, BaseError) {

    App[name] = function (message) {

        this.name    = name;
        this.message = message || '';

    }

    App[name].prototype = Object.create((BaseError || Error).prototype);

}

createError('AppError');

['fatal', 'warning', 'notice', 'depreciated'].forEach(function (severity, i) {

    createError(ucfirst(severity) + 'Error', App.AppError);

    Sandbox.prototype[severity] = function (message) {
        return this.error(message, severity);
    };

});

/*
 *  Notes on App constructor
 *
 *  App constructor handles the app itself. This registers modules and helpers,
 *  it is the main application being run.
 */

var App = function () {
    return this.init.apply(this, arguments);
};

App.prototype = {

    init: function () {
        
        this.modules = {};

    },

    destroy: function () {
    },

    register: function (name, factory) {

        if (this.modules[name]) {
            this.fatal('Module "' + name + '" already registered');
        } else {

            this.modules[name] = {
                creator:  factory,
                instance: null
            };

        }

    },

    start: function (module) {

        var ref = this.modules[module];

        if (!ref) {
            this.fatal('Unrecognised module "' + module + '"');
        } else if (ref.instance) {

            ref.instance = ref.creator(new Sandbox());
            ref.instance.init();

        }

    },

    stop: function (module) {
    },

    startAll: function () {
    },

    stopAll: function () {
    }

};

/*
 *  Playing with code here, looking at what an application and modules might
 *  look like.
 */

var app = new App();

app.addHelper('WeakMap', function (sandbox) {

    var string = sandbox.getHelper('string');

    var WeakMap = window.WeakMap;

    if (!WeakMap) {

        WeakMap = sandbox.getHelper('class').create({

            init: function () {

                this._reference = string.uniqid('App-WeakMap-reference-');

            },

            _isValid: function (key) {
                return key instanceof HTMLElement;
            },

            set: function (key, value) {

                Object.defineProperty(key, this._reference, {
                    configurable: true,
                    enumerable:   false,
                    value:        value,
                    writable:     true
                });

            },

            get: function (key) {
                return key[this._reference];
            },

            has: function (key) {
                return this._reference in key;
            },

            delete: function (key) {
                delete key[this._reference];
            }

        });

    return {

        create: function () {
            return new WeakMap();
        }

    };

});

app.register('Select', function (sandbox) {

    var Select = sandbox.createClass({}),
        map = new sandbox.WeakMap();

    //map = new sandbox.getHelper('WeakMap');
    //map = sandbox.getHelper('WeakMap').create();

    return {

        init: function () {

            sandbox.
                dom.
                children(document, '.js-select').
                forEach(function (elem) {

                    var select = new Select(elem);

                    map.set(elem, select);

                });

        },

        destroy: {

            sandbox.
                dom.
                children(document, '.js-select').
                forEach(function (elem) {

                    if (map.has(elem)) {
                        map.get(elem).destroy();
                    }

                 });

        }

    };

});