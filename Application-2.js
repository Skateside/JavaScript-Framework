// A slightly better Application (at least, better written)
(function (global) {

    'use strict';

    var Application = function () {
            return this.init.apply(this, arguments);
        },

        config = {},

        proto = {},

        extend = function (source, obj) {

            var prop = '',
                owns = Object.prototype.hasOwnProperty.bind(obj);

            for (prop in obj) {
                if (owns(prop)) {
                    source[prop] = obj;
                }
            }

        },

        addProto = extend.bind(null, proto),
        addStatic = extend.bind(null, Application),

        addMethod = function (instance, app, method) {
            instance[method] = app[method].bind(app);
        },

        ModuleBox = function (app) {

            [
                'getHelper',
                'getConfig'
            ].forEach(function (method) {
                this[method] = app[method].bind(app);
            }, this);

        },

        HelperBox = function (app) {

            [
                'getHelper',
                'getConfig',
                'access',
                'store'
            ].forEach(function (method) {
                this[method] = app[method].bind(app);
            }, this);

        };

    Application.prototype = proto;

    addProto({

        init: function () {

            this.modules = {};

            this.helpers = {};

            this.config = Object.create(config);

            this.moduleBox = new ModuleBox(this);

            this.helperBox = new HelperBox(this);

        }

    });

    // Configuration
    Application.setConfig = function (name, value) {
        config[name] = value;
    };

    Application.getConfig = function (name) {
        return config[name];
    };

}(window));
