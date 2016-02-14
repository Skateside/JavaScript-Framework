var APP = (function () {

    'use strict';

    var app = {},

        noop = function () {
            return;
        },

        Module     = null,
        Definition = null,
        Sandbox    = null,

        clone = {

            untyped: function (obj) {
                return obj;
            },

            object: function (obj) {
                return Object.create(obj);
            },

            array: function (arr) {
                return arr.concat();
            }

        };

    function forIn(object, handler, context) {

        var prop = '',
            owns = Object.prototype.hasOwnProperty.bind(object);

        for (prop in object) {
            if (owns(prop)) {
                handler.call(context, prop, object[prop]);
            }
        }

    }

    function typeOf(obj) {

        var type = typeof obj;

        if (type === null) {
            type = 'null';
        } else if (type === undefined) {
            type = 'undefined';
        } else if (Array.isArray(type)) {
            type = 'array';
        }

        return type;

    }

    function _setValue(key, value) {
        this[key] = value;
    }

    function _addArg(arg) {
        forIn(arg, _setValue, this);
    }

    function extend(source) {

        Array.prototype.slice.call(arguments, 1).forEach(_addArg, source);

        return source;

    }

    function createClass(Base, proto) {

        var Class = function () {
            return this.init.apply(this, arguments);
        };

        if (arguments.length === 1) {

            proto = Base;
            Base  = Object;

        }

        Class.prototype = Object.create(Base.prototype);
        extend(Class.prototype, proto);
        Class.prototype.constructor = Class;

        if (typeof Class.prototype.init !== 'function') {
            Class.prototype.init = noop;
        }

        return Class;

    }

    function ucfirst(string) {

        var str = String(string);

        if (str) {
            str = str[0].toUpperCase() + str.slice(1).toLowerCase();
        }

        return str;

    }

    Module = createClass({
        start: noop,
        stop:  noop
    });

    Definition = createClass({

        init: function (data) {

            this.instance = null;
            forIn(data, this.addDatum, this);

        },

        addDatum: function (name, value) {

            this[name] = value;
            this['get' + ucfirst(name)] = function () {
                return (clone[typeOf(value)] || clone.untyped)(value);
            };

        }

    });

    Sandbox = createClass({

        init: function (name) {

            this.getName = function () {
                return name;
            };

        }

    });

    extend(app, {

        Module:     Module,
        Definition: Definition,
        Sandbox:    Sandbox,

    });

    extend(app, {

        store: {},
        constructors: {
            module: Module
        },

        getType: function (name) {

            var type  = 'module',
                parts = name.split(':');

            if (parts.length > 1) {
                type = parts[0];
            }

            return type;

        },

        getName: function (name) {

            var real  = name,
                parts = name.split(':');

            if (parts.length > 1) {
                real = parts.slice(1).join(':');
            }

            return real;

        },

        define: function (name, dep, factory) {

            var type  = this.getType(name),
                store = this.store[type],
                real  = this.getName(name);

            if (!store) {
                store = this.store[type] = {};
            }

            if (arguments.length === 2) {

                factory = dep;
                dep     = [];

            }

            if (store[real]) {

                this.throwFatal('"' + real + '" is already defined a defined ' +
                        type);

            }

            store[real] = new this.Definition({
                factory:      factory,
                dependencies: dep,
                name:         real,
                type:         type
            });

        },

        start: function (name) {

            // create a version of Module for this.store[this.getType(name)][this.getName(name)]
            // pass that Module to this['start' + ucfirst(this.getName(name))];

            var sandbox = arguments[1];

            if (!(sandbox instanceof this.Sandbox)) {
                sandbox = new this.Sandbox(module.getName());
            }

        },

        startModule: function (module, sandbox) {

            var start   = this.start.bind(this, sandbox),
                dep     = module.getDependencies().map(start),
                factory = module.getFactory().apply(sandbox, dep);

            module.instance = factory;
            factory.start();

            return factory;

        },

        startHelper: function (helper, sandbox) {

            var start   = this.start.bind(this, sandbox),
                dep     = helper.getDependencies().map(start);

            return helper.getFactory().apply(sandbox, dep);

        }

    });

}());




var APP = (function () {

    'use strict';

    var app = {
            store: {
                module: {}
            }
        },
        Sandbox = function () {
            return this.init.apply(this, arguments);
        },
        Module = function () {
            return this.init.apply(this, arguments);
        };

    Sandbox.prototype = {

        constructor: Sandbox,

        init: function (name) {
            this.name = name;
        },

        getName: function () {
            return this.name;
        }

    };

    app.Sandbox = Sandbox;

    Module.prototype = {

        constructor: Module,

        init: function (settings) {

            this.name = settings.name || '';
            this.type = settings.type || 'module';
            this.dep = settings.dep || [];
            this.factory = settings.factory || this._empty;

        },

        _noop: function () {
            return;
        },

        _empty: function () {

            return {
                start: this._noop,
                stop:  this._noop
            };

        },

        getName: function () {
            return this.name;
        },

        getType: function () {
            return this.type;
        },

        getDependencies: function () {
            return this.dep.concat();
        },

        getFactory: function () {
            return this.factory;
        }

    };

    app.Module = Module;

    app.getNameParts = function (name) {

        var parts = (name || '').split(':');

        if (parts.length === 1) {
            parts.unshift('module');
        }

        return parts;

    };

    app.define = function (name, dep, factory) {

        var parts  = this.getNameParts(name),
            type   = parts[0],
            module = parts[1],
            store  = null;

        if (arguments.length === 2) {

            factory = dep;
            dep = [];

        }

        if (!Array.isArray(dep)) {
            dep = [];
        }

        if (dep.indexOf(name) > -1) {

            this.throwFatal('The "' + module + '" ' + type + ' has a ' +
                    'circular dependency');

        }

        store = this.store[type];

        if (!store) {
            store = this.store[type] = {};
        }

        if (store[parts[1]]) {

            this.throwFatal('A ' + type + ' with the name "' + module +
                    '" is already defined');

        }

        store[module] = new this.Module({
            name:    module,
            type:    type,
            dep:     dep,
            factory: factory
        });

    };

    app.get = function (name) {

        var parts = this.getNameParts(name),
            store = this.store[parts[0]];

        if (!store || !store[parts[1]]) {
            this.throwWarning('"' + name + '" is not defined');
        }

        return store[parts[1]];

    };

    app.start = function (name, sandbox) {

        var module   = this.get(name),
            dep      = module.getDependencies(),
            factory  = null,
            isModule = module.type === 'module',
            i        = 0,
            il       = dep.length;

        if (!module.instance) {

            if (isModule && !(sandbox instanceof Sandbox)) {
                sandbox = new this.Sandbox(name);
            }

            while (i < il) {

                dep[i] = this.start(dep[i], sandbox);
                i += 1;

            }

            factory = module.getFactory().apply(sandbox, dep);

            if (isModule) {

                module.instance = factory;
                factory.start();

            }

        }

        return factory;

    };

    app.stop = function (name) {

        var module   = this.get(name),
            instance = module.instance;

        if (module.type === 'module' && instance && instance.stop) {

            instance.stop();
            delete module.instance;

        }

    };

    app.startAll = function () {
        Object.keys(this.store.module).forEach(this.start, this);
    };

    app.stopAll = function () {
        Object.keys(this.store.module).forEach(this.stop, this);
    };

    return app;

}());
