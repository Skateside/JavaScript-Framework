(function (global) {

    'use strict';

        /**
         *  class Application
         *
         *  Creates an instance of Application, which controls the modules,
         *  errors, helpers, config and allows for plugins.
         **/
    var Application = function () {
            return this.init.apply(this, arguments);
        },

        sandboxes = {},

        nulled = {
            string: function () {
                return '';
            },
            number: function () {
                return 0;
            },
            array: function () {
                return [];
            },
            object: function () {
                return {};
            },
            'null': function () {
                return null;
            },
            'undefined': function () {
                return undefined;
            },
            regexp: function () {
                return new RegExp('');
            },
            'function': function () {

                return function () {
                    return;

                };
            },
            boolean: function () {
                return true;
            }
        },

        config = {};

    function ucfirst(string) {

        var str = String(string);

        return str.substr(0, 1).toUpperCase() + str.slice(1).toLowerCase();

    }

    function createError(type, baseError) {

        var Base = typeof baseError === 'string' ?
                Application.errors[baseError] :
                (baseError || Error),

            NewError = function (message) {

                this.name    = 'Application' + ucfirst(type) + 'Error';
                this.message = message;

            };

            NewError.prototype = Object.create(Base.prototype);

        Application.errors[type] = NewError;

        Application.prototype[type] = function (message) {
            throw new Application.errors[type](message);
        };

    }

    function typeOf(object) {

        var type = typeof object;

        if (type === 'object') {

            if (!object) {
                type = 'null';
            } else if (Array.isArray(object)) {
                type = 'array';
            } else if (object instanceof RegExp) {
                type = 'regexp';
            }

        }

        return type;

    }

    function forIn(object, handler, context) {

        var prop = '',
            owns = Object.prototype.hasOwnProperty.bind(object);

        for (prop in object) {
            if (owns(prop)) {
                handler.call(context, prop, object[prop]);
            }
        }

    }

    function extend(source, extra) {

        forIn(source, function (key, value) {
            source[key] = value;
        });

    }

    function makeSandbox(type, toNullify, replacements) {

        var source = null,

            Sandbox = function (app) {

                var ret    = this.init.apply(this, arguments),
                    hasOwn = Object.prototype.hasOwnProperty,
                    prop   = '';

                (toNullify || []).forEach(function (property) {
                    this[property] = nulled[typeOf(this[property])]();
                }, this);

                if (replacements) {
                    extend(this, replacements);
                }

                source = app;

                return ret;

            };

        Sandbox.prototype = Object.create(Application.prototype);

        Sandbox.prototype.getHelper = function (name) {
            return source.getHelper(name);
        };

        sandboxes[type] = Sandbox;

    }

    Application.prototype = {

        /**
         *  new Application()
         *
         *  Create a new application, ready to accept modules, helpers and other
         *  parts.
         **/
        init: function () {

            /**
             *  Application#config -> Object
             *
             *  Configuration for this application. It is based on the global
             *  Application config, meaning that global settings can be accessed
             *  or overwritten.
             **/
            this.config = Object.create(config);

            /**
             *  Application#modules -> Object
             *
             *  Collection of all modules. This is mainly for the plugins as it
             *  is nullified for modules and helpers.
             **/
            this.modules = {};

            /**
             *  Application#helpers -> Object
             *
             *  Collection of all helpers. This is mainly for the plugins as it
             *  is nullified for modules and helpers.
             **/
            this.helpers = {};

        },

        /**
         *  Application#getSandbox(type) -> Sandbox
         *  - type (String): Type of sandbox.
         *
         *  Gets a new sandbox for the given `type`. This is intended to be used
         *  for types such as `"module"`, `"helper"` or `"plugin"`.
         **/
        getSandbox: function (type) {
            return new sandboxes[type](this);
        },

        /**
         *  Application#setConfig(key, value)
         *  - key (String): Name of the configuration setting.
         *  - value (*): Configuration value.
         *
         *  Sets a configuration setting for the current application. This
         *  should not be confused with [[Application.setConfig]] which sets
         *  global config; this method can override global config.
         **/
        setConfig: function (key, value) {

            if (Object.prototype.hasOwnProperty.call(this.config, key)) {
                this.fatal('Configuration "' + key + '" already set');
            } else {
                this.config[key] = value;
            }

        },

        /**
         *  Application#getConfig(key) -> *
         *  - key (String): Configuration setting.
         *
         *  Gets the configuration value. If no configuration value has been
         *  set, `undefined` is returned.
         **/
        getConfig: function (key) {
            return this.config[key];
        }

        /**
         *  Application#plugin(name, factory)
         *  - name (String): Name of the plugin.
         *  - factory (Function): Function that returns the plugin.
         *
         *  Adds a plugin to the application. Plugins are available to all
         *  instances of [[Application]].
         **/
        plugin: function (name, factory) {

            var proto = Application.prototype;

            extend(proto, factory(this.getSandbox('plugin')));

        },

        /**
         *  Application#addHelper(name, factory)
         *  - name (String): Name of the helper.
         *  - factory (Function): Function that will create the helper.
         *
         *  Adds a helper to the application. If the helper already exists, a
         *  fatal error is thrown.
         *
         *  A helper is a series of functions to assist the modules. The
         *  `factory` is passed a sandbox. To better understand this, consider
         *  the following code:
         *
         *      app.addHelper('add', function (app) {
         *
         *          return {
         *              five: function (number) {
         *                  return number + 5;
         *              },
         *              ten: function (number) {
         *                  return number + 10;
         *              }
         *          }
         * 
         *      });
         *
         *  The helper will create two functions which can be accessed by
         *  modules using the [[Application#getHelper]].
         *
         *      app.register('module', function (app) {
         *
         *          var add = app.getHelper('add');
         *
         *          return {
         *              start: function () {
         *                  console.log(add.five(10)); // 15
         *              },
         *              // ...
         *          };
         * 
         *      });
         *
         *  The helpers allow common pieces of functionality to be used in
         *  multiple modules.
         **/
        addHelper: function (name, factory) {

            if (this.helper[name]) {
                this.fatal('Helper "' + name + '" already exists');
            } else {
                this.helper[name] = factory;
            }            

        },

        /**
         *  Application#getHelper(name) -> Object
         *  - name (String): Name of the helper.
         *
         *  Gets the helper with the given name. If the helper is not
         *  recognised, a fatal error is thrown.
         *
         *  See [[Application#addHelper]] for use examples.
         **/
        getHelper: function (name) {

            var helper = this.helpers[name];

            if (!helper) {
                this.fatal('Helper "' + name + '" does not exist');
            } else {
                helper = helper(this.getSandbox('helper'));
            }

            return helper;

        },

        /**
         *  Application#register(id, factory)
         *  - id (String): ID of the module.
         *  - factory (Function): Function that creates the module.
         *
         *  Registers a module. The module is created by executing the `factory`
         *  function, allowing the module to have a private state. The `factory`
         *  function is passed a sandbox which gives it access to allowed
         *  functionality by keeping it away from protected functionality. By
         *  convention, this argument is always called `app` to prevent access
         *  to the global variable.
         *
         *      app.register('mod', function (app) {
         *
         *          var ext = app.getHelper('ext');
         *
         *          return {
         *
         *              init: function () {
         *                  alert(ext.add(1, 2)); // Alerts 3
         *              }
         * 
         *          };
         * 
         *      });
         *
         *  The `name` of the module is used when staring or stopping the module
         *  (using [[Application#start]] and [[Application#stop]] respectively).
         *
         *  When a module is started using [[Core.start]], the `start` method of
         *  the returned object is executed. As such, `start` is the a required
         *  property and failure to include it will cause an error to be thrown
         *  of fatal severity. See also [[Application#fatal]].
         *
         *      app.register('mod1', function (app) {
         *      });
         *      app.start('mod1');
         *      // throws fatal
         *
         *  When a module is stopped using [[Application#stop]], the `stop`
         *  method is called. This allows modules to be deconstructed and reset
         *  if need be.
         **/
        register: function (name, factory) {

            if (this.modules[name]) {
                this.fatal('Module "' + name + '" already exists');
            } else {

                this.modules[name] = {
                    factory:  factory
                    instance: null
                };

            }

        },

        /**
         *  Application#start(name)
         *  - name (String): Module ID to start.
         *
         *  Activates the module with the `name` given.
         *
         *      app.register('mod', function (app) {
         *
         *          return {
         *
         *              init: function () {
         *              }
         * 
         *          };
         * 
         *      });
         *
         *      app.start('mod');
         *      // The "mod" module's "start" method has now exacuted.
         *
         *  If the `name` is not a registered module, an error of fatal severity
         *  is thrown. See also [[Application#fatal]].
         *
         *      app.start('does-not-exist');
         *      // throws fatal
         *
         *  Also, if the module does not have an "start" method, a fatal error
         *  is thrown.
         * 
         *      app.register('no-start', function (app) {
         *          return {};
         *      });
         *
         *      app.start('no-start');
         *      // throws fatal
         *
         *  To stop a module, use [[Application#stop]]. 
         **/
        start: function (name) {

            var module = this.modules[name];

            if (!module) {
                this.fatal('Module "' + name + '" does not exist');
            } else if (!module.instance) {

                module.instance = module.factory(this.getSandbox('module'));
                module.instance.start();

            }

        },

        /**
         *  Application#stop(name)
         *  - name (String): ID of the module to stop.
         *
         *  Stops a module, doing the opposite of [[Application#start]]. If the
         *  module has a "stop" method, it is executed.
         *
         *      app.register('has-destroy', function (app) {
         *          return {
         *              init: function () {},
         *              destroy: function () {}
         *          };
         *      });
         *      app.register('no-destroy', function (app) {
         *          return {
         *              init: function () {}
         *          };
         *      });
         *
         *      app.start('has-destroy');
         *      // Executed "has-destroy" init method.
         *      app.start('no-destroy');
         *      // Executed "no-destroy" init method.
         *      
         *      app.stop('has-destroy');
         *      // Executed "has-destroy" destroy method.
         *      app.stop('no-destroy');
         *      // Executed no destroy method, throws no errors.
         *
         *  If the `name` is not a recognised module, an error of notice severity
         *  is thrown. This is less severe than a fatal error because the end
         *  result of the module with the name matching the `name` argument no
         *  running has occured.
         *
         *      app.stop('does-not-exist');
         *      // throws notice
         *
         *  To stop all registered modules, use [[Application#stopAll]].
         **/
        stop: function (name) {

            var module = this.modules[name];

            if (module && module.instance) {

                if (module.instance.stop) {
                    module.instance.stop();
                }

                module.instance = null;

            }

        },

        /** related to: Application#start
         *  Application#startAll()
         *
         *  Starts all registered modules.
         **/
        startAll: function () {
            Object.keys(this.modules).forEach(this.start, this);
        },

        /** related to: Application#stop
         *  Application#stopAll()
         *
         *  Stops all registered modules.
         **/
        stopAll: function () {
            Object.keys(this.modules).forEach(this.stop, this);
        }

    };

    Application.errors = {};

    Application.getConfig = function (key) {
        return config[key];
    };

    Application.setConfig = function (key, value) {

        if (config[key]) {

            throw new Application.errors.fatal('Configuration "' + key +
                    '" already set');

        } else {
            config[key] = value;
        }

    };

    createError('error');
    createError('fatal',      'error');
    createError('warning',    'error');
    createError('notice',     'error');
    createError('deprecated', 'error');

    makeSandbox('helper', [
        'modules',
        'helpers',
        'config',
        'register',
        'addHelper',
        'getSandbox',
        'init',
        'start',
        'stop',
        'plugin'
    ]);

    makeSandbox('module', [
        'modules',
        'helpers',
        'config',
        'register',
        'addHelper',
        'getSandbox',
        'init',
        'start',
        'stop',
        'plugin'
    ]);

    makeSandbox('plugin');

    global.Application = Application;

}(window));

