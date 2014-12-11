/**
 * Core
 *
 * The core itself handles 4 tasks:
 * 
 *     1. Registering modules, starting and stopping them.
 *     2. Registering and accessing extensions.
 *     3. Handling errors.
 *     4. Handling global configuration (configuration settings required by
 *        multiple modules).
 *
 * These are done using a variety of methods.
 *
 *      1. [[Core.register]], [[Core.start]], [[Core.startAll]], [[Core.stop]]
 *         and [[Core.stopAll]].
 *      2. [[Core.extend]] and [[Core.get]].
 *      3. [[Core.error]] as well as more specific variants such as
 *         [[Core.fatal]], [[Core.warning]], [[Core.notice]] and
 *         [[Core.depreciated]].
 *      4. [[Core.setConfig]], [[Core.getConfig]] and [[Core.hasConfig]].
 *
 * Extensions can override existing functionality as well as providing new
 * functionality that any module can access. Modules handle the bulk of the
 * functionality seen by the user.
 **/
var Core = (function () {

    'use strict';

    var core   = {},
        error  = null,
        config = {},
        hasOwn = Object.prototype.hasOwnProperty,

        // No-operation
        noop = function () {
            return;
        };

    // Loops through the entries in Object, passing each property name and value
    // to the given function.
    function forIn(obj, func, context) {

        var prop = '';

        for (prop in obj) {

            if (hasOwn.call(obj, prop)) {
                func.call(context, prop, obj[prop], obj);
            }

        }

    }

    // Extends the core variable with the contents of another Object.
    function extendCore(extra) {

        forIn(extra, function (key, value) {
            core[key] = value;
        });

    }

    // Errors.
    error = {

        /**
         * Core.errorLevel -> Object
         *
         * Severity of errors that may be thrown throughout the application's
         * run-time. The values may change and evolve as the application ages,
         * but the keys will always exist.
         **/
        errorLevel: {
            fatal:       1, // Stops the application.
            warning:     2, // Important, but the application can continue.
            notice:      3, // Trivial, should be fixed but may be ignored.
            depreciated: 4  // Not an error, a note for developers.
        },

        /**
         * Core.getErrorLevel(severity) -> String
         * - severity (Number): Error severity level.
         *
         * Returns the human-readable error level from the given error level
         * number. This is mainly used for debugging errors as "Severity: fatal"
         * is easier to read than "Severity: 1".
         *
         *      Core.getErrorLevel(1); // -> "fatal"
         * 
         **/
        getErrorLevel: function (severity) {

            var prop  = '',
                level = this.errorLevel,
                text  = '';

            for (prop in level) {
                if (hasOwn.call(level, prop) && level[prop] === severity) {

                    text = prop;
                    break;

                }
            }

            return text;

        },

        /**
         * Core.error(message = "An unknown error occurred", severity = 3)
         * - message (String): Message for the error.
         * - severity (Number): Severity of the error level.
         *
         * A generic error function. It throws an `Error` with the given
         * severity.
         *
         *      Core.error();
         *      // throws Error("An unknown error occurred (Severity: 3 notice)");
         *
         *      Core.error('Test');
         *      // throws Error("Test (Severity: 3 notice)");
         *
         *      Core.error('Test', 1);
         *      // throws Error("Test (Severity: 1 fatal)");
         * 
         **/
        error: function (message, severity) {

            var sev = severity || this.errorLevel.notice,
                msg = message  || 'An unknown error occurred',
                lvl = this.getErrorLevel(sev);

            throw new Error(msg + ' (Severity: ' + sev + ' ' + lvl + ')');

        }

    };

    /**
     * Core.notice(message)
     * - message (String): Message for the error.
     *
     * Helper function for throwning a "notice" level error. See [[Core.error]].
     **/
    /**
     * Core.warning(message)
     * - message (String): Message for the error.
     *
     * Helper function for throwning a "warning" level error. See
     * [[Core.error]].
     **/
    /**
     * Core.fatal(message)
     * - message (String): Message for the error.
     *
     * Helper function for throwning a "fatal" level error. See [[Core.error]].
     **/
    /**
     * Core.depreciated(message)
     * - message (String): Message for the error.
     *
     * Helper function for throwning a "depreciated" level error. See
     * [[Core.error]].
     **/
    forIn(error.errorLevel, function (key, value) {

        error[key] = function (message) {
            return this.error(message, value);
        };

    });

    // Add the error object to the core.
    extendCore(error);

    // Extensions.
    extendCore({

        /**
         * Core.extensions -> Object
         *
         * Collection of all extensions that have been registered with this
         * application's run.
         *
         * Extensions are registered using [[Core.extend]] and accessed using
         * [[Core.get]].
         **/
        extensions: Object.create(null),

        /**
         * Core.extend(id, creator)
         * - id (String): ID of the extension to register.
         * - creator (Function): Function that will create the extension.
         *
         * Adds an extension to the core. Extensions are designed to act as a
         * mediator between the core an any external JavaScript libraries. They
         * can be sub-classed to be tailored towards a specific module.
         * Extensions may also be used for adding new functionality to the core.
         * The `creator` function is passed a copy of the [[Core]] so it can
         * access (or even replace) parts of the core. By convention, the
         * argument is always called `Core` to prevent access to the global
         * variable.
         *
         *      Core.extend('ext', function (Core) {
         *
         *          return {
         *
         *              add: function (a, b) {
         *                  return a + b;
         *              },
         *
         *              subtract(a, b) {
         *                  return a - b;
         *              }
         * 
         *          };
         * 
         *      });
         *
         * Extensions can be accessed by modules using [[Core.get]].
         *
         *      var ext = Core.get('ext');
         *      ext.add(1, 2); // -> 3
         *      ext.subtract(2, 1); // -> 1
         * 
         * If the name contains a space, the extension is assumed to be a
         * module-specific sub-class, with the string before the space being the
         * name of an existing extension and the string after the space being
         * the module name.
         *
         *      Core.extend('ext mod', function (Core) {
         *
         *          return {
         *
         *              // New function
         *              multiply: function (a, b) {
         *                  return a * b;
         *              },
         *
         *              // Replaces previous "add" function
         *              add: function (a, b) {
         *                  return a + (2 * b);
         *              }
         * 
         *          };
         *      
         *      });
         *
         * In the above example, the "mod" module will have a modified
         * [[Core.get]] that will have the `moduleId` argument pre-set to "mod",
         * thus is will get the "ext mod" extension, not the "ext" extension.
         *
         *      // Inside the "mod" module
         *      var ext = Core.get('ext');
         *      ext.add(1, 2); // -> 5
         *      ext.subtract(2, 1); // -> 1
         *      ext.multiply(2, 3); // -> 6
         *
         * If the extension is attempting to sub-class an extension that doesn't
         * exist, a core error of "fatal" severity will be thrown. See also
         * [[Core.fatal]].
         *
         *      Core.extend('does-not-exist mod', function (Core) {
         *      });
         *      // throws fatal
         * 
         **/
        extend: function (id, creator) {

            var parts = id.split(/\s+/),
                name  = parts[0],
                prop  = '',
                root  = null,
                made  = null;

            if (parts[1]) {

                root = this.extensions[name];

                if (!root) {
                    this.fatal('Core.extend() Unrecognised extension ' + name);
                }

                this.extensions[id] = Object.create(root);
                made = creator(this);

                for (prop in made) {

                    if (hasOwn.call(made, prop)) {
                        this.extensions[id][prop] = made[prop];
                    }

                }

            } else {
                this.extensions[id] = creator(this);
            }

        },

        /**
         * Core.get(id[, moduleId]) -> Object
         * - id (String): ID of the extension to get.
         * - moduleId (String): ID of the module specific variant.
         *
         * Used by modules to retrieve extensions. The [[Core.extensions]]
         * object is obscured from the modules, but this function never is.
         *
         *      // Assuming these extensions exist:
         *      Core('ext', function (Core) {
         *          // ...
         *      });
         *      Core('ext mod', function (Core) {
         *          // ...
         *      });
         *
         *      Core.get('ext'); // -> "ext" extension.
         *      Core.get('ext', 'mod'); // -> "mod" variant of "ext" extension.
         *
         * If the variant extension does not exist, the regular version is
         * returned instead.
         *
         *      // Assuming this extensions exists:
         *      Core('ext1', function (Core) {
         *          // ...
         *      });
         *
         *      Core.get('ext1'); // -> "ext1" extension.
         *      Core.get('ext1', 'mod'); // -> "ext1" extension.
         *
         * This is used by modules which have the `moduleId` argument pre-set to
         * their module ID (see [[Core.register]]) to always attempt to get the
         * module-specific variant before defaulting to the regular version.
         * However, if the `id` attempts to access an extension that does not
         * exist, an error of "fatal" level is thrown. See also [[Core.fatal]].
         *
         *      Core.get('does-not-exist');
         *      // throws fatal
         * 
         **/
        get: function (id, moduleId) {

            var extension = this.extensions[id + ' ' + moduleId] ||
                    this.extensions[id] || null,
                created   = Object.create(extension);

            if (!extension) {
                this.fatal('Core.get() Unrecognised extension ' + id);
            } else {
                created.moduleId = moduleId;
            }

            return created;

        }

    });

    // Modules.
    extendCore({

        /**
         * Core.modules -> Object
         *
         * Collection of all modules registered. Although public, it is obscured
         * from the individual modules.
         *
         * Modules are registered using [[Core.register]], activated using
         * [[Core.start]] and deactivated using [[Core.stop]].
         **/
        modules: Object.create(null),

        /**
         * Core.register(id, creator)
         * - id (String): ID of the module.
         * - creator (Function): Function that creates the module.
         *
         * Registers a module. The module is created by executing the `creator`
         * function, allowing the module to have a private state. The `creator`
         * function is passed a version of the [[Core]] which gives it access to
         * allowed functionality by keeping it away from protected
         * functionality. By convention, this argument is always called `Core`
         * to prevent access to the global variable.
         *
         *      Core.register('mod', function (Core) {
         *
         *          var ext = Core.get('ext');
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
         * The `id` of the module serves to identify module-specific variants of
         * extensions (it is automatically passed to [[Core.get]] as the
         * `moduleId` argument) and is used when staring or stopping the module
         * (using [[Core.start]] and [[Core.stop]] respectively).
         *
         * When a module is started using [[Core.start]], the `init` method of
         * the returned object is executed. As such, `init` is the a required
         * property and failure to include it will cause an error to be thrown
         * of fatal severity. See also [[Core.fatal]].
         *
         *      Core.register('mod1', function (Core) {
         *      });
         *      Core.start('mod1');
         *      // throws fatal
         *
         * When a module is stopped using [[Core.stop]], the `destroy` method
         * is call, if it exists. If it does not, no errors are thrown.
         **/
        register: function (id, creator) {

            this.modules[id] = {
                creator:  creator,
                instance: null
            };

        },

        /**
         * Core.makeSandbox(id) -> Object
         * - id (String): ID of the module for which the sandbox should be made.
         *
         * Creates the sandbox that is passed to the module's `creator`
         * function. It appears similar to the main [[Core]] except that
         * extensions can be referenced, not modified. Additionally, the version
         * of [[Core.get]] that this sandbox produces automatically passes the
         * module's ID as the second argument, meaning that the module will
         * always attempt to get the module-specific variant of any extension
         * before trying to access the regular version.
         */
        makeSandbox: function (id) {

            var that    = this,
                sandbox = Object.create(that);

            sandbox.modules     = Object.create(that.modules);
            sandbox.extensions  = Object.create(that.extensions);
            sandbox.makeSandbox = noop;

            sandbox.get = function (ext) {
                return that.get.call(sandbox, ext, id);
            };

            return sandbox;

        },

        /**
         * Core.start(id)
         * - id (String): Module ID to start.
         *
         * Activates the module with the `id` given.
         *
         *      Core.register('mod', function (Core) {
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
         *      Core.start('mod');
         *      // The "mod" module's "init" method has now exacuted.
         *
         * If the `id` is not a registered module, an error of fatal severity is
         * thrown. See also [[Core.fatal]].
         *
         *      Core.start('does-not-exist');
         *      // throws fatal
         *
         * Also, if the module does not have an "init" method, a fatal error is
         * thrown.
         * 
         *      Core.register('no-init', function (Core) {
         *          return {};
         *      });
         *
         *      Core.start('no-init');
         *      // throws fatal
         *
         * To stop a module, use [[Core.stop]]. 
         **/
        start: function (id) {

            var data = this.modules[id],
                inst = null,
                init = null;

            if (!data) {
                this.fatal('Core.start() Unrecognised module ' + id);
            }

            inst = data.instance = data.creator(this.makeSandbox(id));
            init = inst.init;

            if (typeof init !== 'function') {
                this.fatal('Core.start() Module ' + id + ' has no init method');
            }

            init.call(inst);

        },

        /**
         * Core.stop(id)
         * - id (String): ID of the module to stop.
         *
         * Stops a module, doing the opposite of [[Core.start]]. If the module
         * has a "destroy" method, it is executed. No error is thrown if a
         * "destroy" method does not exist.
         *
         *      Core.register('has-destroy', function (Core) {
         *          return {
         *              init: function () {},
         *              destroy: function () {}
         *          };
         *      });
         *      Core.register('no-destroy', function (Core) {
         *          return {
         *              init: function () {}
         *          };
         *      });
         *
         *      Core.start('has-destroy');
         *      // Executed "has-destroy" init method.
         *      Core.start('no-destroy');
         *      // Executed "no-destroy" init method.
         *      
         *      Core.stop('has-destroy');
         *      // Executed "has-destroy" destroy method.
         *      Core.stop('no-destroy');
         *      // Executed no destroy method, throws no errors.
         *
         * If the `id` is not a recognised module, an error of notice severity
         * is thrown. This is less severe than a fatal error because the end
         * result of the module with the id matching the `id` argument no
         * running has occured.
         *
         *      Core.stop('does-not-exist');
         *      // throws notice
         *
         * To stop all registered modules, use [[Core.stopAll]].
         **/
        stop: function (id) {

            var data = this.modules[id],
                inst = null;

            if (!data) {
                this.notice('Core.stop() Unrecognised module ' + id);
            }

            inst = data.instance;

            if (inst) {

                if (typeof inst.destroy === 'function') {
                    inst.destroy();
                }

                data.instance = null;

            }

        },

        /**
         * Core.startAll()
         *
         * Starts all registered modules. See [[Core.start]].
         **/
        startAll: function () {
            Object.keys(this.modules).forEach(this.start, this);
        },

        /**
         * Core.stopAll()
         *
         * Stops all registered modules. See [[Core.stop]].
         **/
        stopAll: function () {
            Object.keys(this.modules).forEach(this.stop, this);
        }

    });

    // Global configuration.
    extendCore({

        /**
         * Core.hasConfig(key) -> Boolean
         * - key (String): Configuration setting to check.
         *
         * Checks to see if the specified configuration setting has been
         * registered.
         *
         *      Core.setConfig('does-exist', true);
         *
         *      Core.hasConfig('does-exist'); // -> true
         *      Core.hasConfig('does-not-exist'); // -> false
         *
         * To set a configuration setting, use [[Core.setConfig]].
         **/
        hasConfig: function (key) {
            return hasOwn.call(config, key);
        },

        /**
         * Core.setConfig(key, value)
         * - key (String): Configuration setting.
         * - value (*): Configuration value.
         *
         * Sets connfiguration. This is designed to be access by any module or
         * extension. To access the configuration, use [[Core.getConfig]].
         *
         *      Core.setConfig('exists', 'yes');
         *      Core.hasConfig('exists'); // -> true
         *      Core.getConfig('exists'); // -> 'yes'
         *
         * Configuration is designed to be constant. Attempting to set
         * configuration that already exists will throw an error of warning
         * level. See also [[Core.warning]].
         *
         *      Core.setConfig('exists', 'yes');
         *      Core.setConfig('exists', 'still does'); // throws warning
         * 
         **/
        setConfig: function (key, value) {

            if (this.hasConfig(key)) {

                this.warning('Core.setConfig() key ' + key + ' is already set, ' +
                        'not modifying');

            } else {
                config[key] = value;
            }

        },

        /**
         * Core.getConfig(key) -> *
         * - key (String): Configuration setting to retrieve.
         *
         * Gets the configuration setting.
         *
         *      Core.setConfig('exists', 'yes');
         *      Core.getConfig('exists'); // -> 'yes'
         *
         * If the configuration setting has not been registered, an error of
         * notice level is thrown. See also [[Core.notice]].
         *
         *      Core.getConfig('does-not-exist'); // throws notice
         * 
         **/
        getConfig: function (key) {

            if (!this.hasConfig(key)) {

                this.notice('Core.getConfig() key ' + key + ' is not set, ' +
                        'returning undefined');

            }

            return config[key];

        }

    });

    // Expose the core object to the global Core variable.
    return core;

}());