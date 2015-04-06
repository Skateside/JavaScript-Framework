// A slightly better Application (at least, better written)
(function (global) {

    'use strict';

        /**
         *  class Application
         *
         *  The main application. Controls modules, helpers, configuration and
         *  errors.
         *
         *  ## Modules
         *
         *  The main source of functionality, a module is a self-contained
         *  function that has access to an [[Application.Sandbox]]. Key methods
         *  that control modules are:
         *
         *  - [[Application#register]] to register a module.
         *  - [[Application#start]] to start a module.
         *  - [[Application#stop]] to stop a module.
         *  - [[Application#startAll]] to start all modules.
         *  - [[Application#stopAll]] to stop all modules.
         *
         *  ## Helpers
         *
         *  Helpers are collections of related functionality that assist the
         *  modules. A module may access any helper and use any number of them,
         *  modules may be used by multiple modules. When created, the helper
         *  has access to an [[Application.Sandbox]] with more functionality
         *  than the version the modules access. Key methods that control
         *  helpers are:
         *
         *  - [[Application#addHelper]] to add a helper.
         *  - [[Application#getHelper]] to get a helper.
         *
         *  ## Configuration
         *
         *  Configuration can be set and accessed, but not re-set. There are two
         *  levels of configuration: global configuration and local
         *  configuration. Global configuration is set using the static method
         *  and any Application instance may access that setting, local
         *  configuration can only be accessed by that Application instance.
         *  Local configuration can override global configuration. Key methods
         *  that control configuration are:
         *
         *  - [[Application.setConfig]] to set global configuration.
         *  - [[Application.getConfig]] to get global configuration.
         *  - [[Application#setConfig]] to set local configuration.
         *  - [[Application#getConfig]] to get local configuration.
         *
         *  ## Errors
         *
         *  Errors can stop the application. There are four errors as well as a
         *  generic method. They are:
         *
         *  - [[Application#error]] - generic error method, though not
         *    particularly useful.
         *  - [[Application#fatal]] - Fatal errors that require the developer to
         *    fix.
         *  - [[Application#warning]] - Major errors that may be recoverable but
         *    frequently require developer fixing.
         *  - [[Application#notice]] - Trivial errors that should be resolved
         *    but should not stop the application.
         *  - [[Application#deprecated]] - Errors that highlight that a certain
         *    piece of functionality to no longer current any may be removed in
         *    future.
         *
         *  ## Storing
         *
         *  The Application has two additional methods to store information.
         *  These exist mainly for helpers.
         *
         *  - [[Application#store]] to set data.
         *  - [[Application#access]] to get data.
         *
         *  ## Sandboxes
         *
         *  A sandbox is passed to each module and helper as they're created.
         *  The sandbox acts as the module or helper's only access to the
         *  application. Key methods that control sandboxes are:
         *
         *  - [[Application.Sandbox]] - Sandbox constructor.
         *  - [[Application.moduleMethods]] - White list of Application methods
         *    that may be access by modules.
         *  - [[Application.helperMethods]] - White list of Application methods
         *    that may be access by helpers.
         **/
    var Application = function () {
            return this.init.apply(this, arguments);
        },

        /**
         *  class Application.Sandbox
         *
         *  Sandboxes are passed to modules and helpers. They grant access to
         *  some of the methods that [[Application]] has and acts as a limited
         *  facade.
         **/
        Sandbox = function () {
            return this.init.apply(this, arguments);
        },

        // Global configuration, basis of local configuration.
        config = {},

        // Application.prototype.
        proto = {},

        // Extends the source with the given obj.
        extend = function (source, obj) {

            var prop = '',
                owns = Object.prototype.hasOwnProperty.bind(obj);

            for (prop in obj) {
                if (owns(prop)) {
                    source[prop] = obj;
                }
            }

        },

        // Helper functions for extending Application.
        addProto  = extend.bind(null, proto),
        addStatic = extend.bind(null, Application);

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

    extend(Sandbox.prototype, {

        /**
         *  new Application.Sandbox(app, methods)
         *  - app (Application): Instance of [[Application]].
         *  - methods (Array): White list of methods.
         *
         *  Creates the sandbox passed to either a module or a helper. The
         *  facade is generated by passing the application instance that
         *  contains the original methods and a white list of methods that
         *  should be created. Most methods are added to [[Application.Sandbox]]
         *  instance from the `methods` array so they are not documented, but
         *  they will be identical to the [[Application]] methods of the same
         *  name (possibly with [[Application.Sandbox]] properties passed in by
         *  default - see [[Application.Sandbox#_addMethod]] for full details).
         *  The [[Application.Sandbox]] does have some of its own methods and
         *  properties to facilitate construction - these are all prefixed with
         *  an underscore (`_`) to help avoid collisions. Although they are
         *  publicly available, they should be considered **private** as they
         *  will be very little use to a module or helper.
         **/
        init: function (app, methods, name) {

            methods.forEach(this._addMethod, {sandbox: this, app: app});

            /**
             *  Application.Sandbox#_name -> String
             *
             *  Name of the module or helper. This is mainly used internally and
             *  is very little use to the module or helper itself, however, it
             *  is publicly available.
             **/
            this._addProperty('_name', name);

        },

        /**
         *  Application.Sandbox#_addMethod(method)
         *  - method (String): Method string to add.
         *
         *  Adds a method to the [[Application.Sandbox]] prototype, bound to the
         *  instance of [[Application]] that created it. This method is called
         *  with its context set to a object with a `sandbox` and `app`
         *  property. The `sandbox` is the [[Application.Sandbox]] instance and
         *  `app` is the [[Application]] instance. This allows the method to be
         *  called (rather than re-created) each time a
         *  [[new Application.Sandbox]] is created.
         *
         *  The `method` has a specific format (decoded by
         *  [[Application.Sandbox#_decodeMethod]]) that allows arguments to be
         *  bound as well.
         *
         *      sandbox.addMethod('method')
         *      // Adds a "method" method to the sandbox instance. "method" is
         *      // taken from Application.prototype, thus sandbox.method() is
         *      // the same as application.method()
         *
         *      sandbox.addMethod('method(name)')
         *      // Adds a "method" method to the sandbox instance. "method" is
         *      // taken from Application.prototype and automatically passes in
         *      // sandbox.name, thus sandbox.method() is the same as
         *      // application.method(sandbox.name)
         *
         *  If modifying this method, beware that this method's context is not
         *  [[Application.Sandbox]] - it's a object with a `sandbox` and `app`
         *  property, giving it access to the [[Application]] and
         *  [[Application.Sandbox]] without allowing access to the
         *  [[Application]].
         **/
        _addMethod: function (method) {

            var sandbox = this.sandbox,
                app     = this.app,
                matches = sandbox._decodeMethod(method),
                func    = matches.unshift(),
                props   = matches.map(sandbox._getProperty, sandbox);

            if (func) {
                sandbox[func] = app[func].bind.apply([app].concat(props));
            }

        },

        /**
         *  Application.Sandbox#_addProperty(name, value)
         *  - name (String): Name of the property to add.
         *  - value (*): Value of the property to add.
         *
         *  Adds a property to the current [[Application.Sandbox]] instance. The
         *  added property is non-enumerable, non-configurable and read-only
         *  (like an invisible constant). This is so that it cannot be found
         *  within the [[Application.Sandbox]] instance but it can be accessed.
         **/
        _addProperty: function (name, value) {

            Object.defineProperty(this, name, {
                configurable: false,
                enumerable:   false,
                value:        value,
                writable:     false
            });

        },

        /**
         *  Application.Sandbox#_getProperty(property) -> *
         *  - property (String): Name of the property to return.
         *
         *  Returns the property requested. This mainly exists to save
         *  re-creating a `map`ping function each time a
         *  [[new Application.Sandbox]] is created.
         **/
        _getProperty: function (property) {
            return this[property];
        },

        /**
         *  Application.Sandbox#_decodeMethod(method)
         *  - method (String): Method to decode.
         *
         *  Decodes the given `method` for [[Application.Sandbox#_addMethod]].
         *  See that method for full details of the decoding process.
         **/
        _decodeMethod: function (method) {

            var glue    = '@@@@glue@@@@',
                trimmer = new RegExp('^' + glue + '+|' + glue + '+$'),
                matches = method.match(/(\w+)(?:\((\w+)\))?/) || [];

            // Remove first entry as it's just the complete match and should be
            // the same as the `method` argument.
            matches.unshift();

            // Join using a unique key, replace the starting and ending key and
            // return an array created by breaking at the key. This has the
            // effect of removing the end arguments if they're `undefined` (no
            // match).
            return matches.join(glue).replace(trimmer, '').split(glue);

        }

    });

    Application.prototype = proto;

    addProto({

        /**
         *  new Application
         *
         *  Creates a new application.
         **/
        init: function () {

            /**
             *  Application#modules -> Object
             *
             *  Collection of module objects for all registered modules.
             *  Although available, this should be considered private.
             **/
            this.modules = {};

            /**
             *  Application#helpers -> Object
             *
             *  Collection of all helpers. Although available, this should be
             *  considered private.
             **/
            this.helpers = {};

            /**
             *  Application#config -> Object
             *
             *  Local configuration, based on the global configuration. This
             *  allows global configuration to be accessed without being able
             *  to alter it.
             **/
            this.config = Object.create(config);

            /**
             *  Application#data -> Object
             *
             *  Storage for helpers. Occasionally a helper may need to store
             *  information across instances (though within the same
             *  [[Application]] instance). The [[Application#store]] and
             *  [[Application#access]] methods allow this to happen by
             *  manipulating the [[Application#data]] property.
             **/
            this.data = {};

        }

    });

    // Modules.

    addProto({

        /**
         *  Application#getModule(name, failOnRegistered = false)
         *  - name (String): Name of the module to retrieve.
         *  - failOnRegistered (Boolean): Triggers an error of the module exists
         *    instead of triggering one if the module does not.
         *
         *  A helper method for accessing modules. Although publicly available,
         *  it should be considered private. It mainly exists so that common
         *  errors can be thrown as well as allowing for plugin overriding.
         **/
        getModule: function (name, failOnRegistered) {

            var module = this.modules[name];

            if (!failOnRegistered && !module) {
                this.fatal('Module "' + name + '" is not registered');
            } else if (failOnRegistered && module) {
                this.fatal('Module "' + name + '" already registered');
            }

            return module;

        },

        /**
         *  Application#register(name, factory)
         *  - name (String): Name of the module.
         *  - factory (Function): Function that will create the module.
         *
         *  Registers a module that may be started or stopped by the application
         *  (using [[Application#start]] and [[Application#stop]] respectivly).
         *  Modules are created using the `factory` function, giving them a
         *  private scope. As they are created, they are passed an instance of
         *  [[Application.Sandbox]] giving them access to some [[Application]]
         *  methods. Each module must have a `start` and a `stop` method; any
         *  other methods are optional.
         *
         *  A module should be a stand-alone piece of functionality. It may
         *  access any number of helpers (using [[Application#getHelper]]) and
         *  trigger errors (see [[Application#error]] for a proper break-down).
         *  Here is a template for any module:
         *
         *      app.register('module-name', function (app) {
         *
         *          'use strict';
         *
         *          return {
         *              start: function () {},
         *              stop:  function () {}
         *          };
         * 
         *      });
         *
         *  The `factory` is passed a sandbox which should be given the same
         *  name as the main application instance (`app` by convention) although
         *  this is not essential. A module's `start` method is called when the
         *  module is started and its `stop` method is called when stopped
         *  (think of those methods as a constuctor and a deconstructor). It may
         *  have any other methods.
         *
         *  Here is an example module that accesses helpers and shows some
         *  functionality.
         *
         *      app.register('click-me', function (app) {
         *
         *          'use strict';
         *
         *              // A third level of configuration: module-specific
         *              // configuration.
         *          var config = {
         *                  selectors: {
         *                      buttons: '.js-clickme-button'
         *                  }
         *              },
         *              // Helpers that the module can access.
         *              dom = app.getHelper('dom'),
         *              listener = app.getHelper('listener');
         *
         *          return {
         *
         *              // Sets up the module and can call any other method and
         *              // create properties.
         *              start: function () {
         *
         *                  this.buttons = dom.get(config.selectors.buttons);
         *
         *                  this.buttons.forEach(function (button) {
         *                      dom.on(button, 'click', this.handleClick, this);
         *                  }, this);
         * 
         *              },
         *
         *              // Tears down the module, unbinding any event handlers
         *              // added and removing references to any elements found.
         *              stop: function () {
         *
         *                  this.buttons.forEach(function (button) {
         *                      dom.off(button, 'click', this.handleClick);
         *                  }, this);
         *                  delete this.buttons;
         * 
         *              },
         *
         *              // Handles the click. As its own function, it can be
         *              // unbound as the module closes.
         *              handleClick: function (e) {
         *
         *                  e.preventDefault();
         *                  listener.notify('clickme', e.target);
         * 
         *              }
         * 
         *          };
         * 
         *      });
         * 
         **/
        register: function (name, factory) {

            var modules = this.getModule(name, true);

            modules[name] = {
                factory:  factory,
                instance: null
            };

        },

        /**
         *  Application#start(name)
         *  - name (String): Name of the module to start.
         *
         *  Activated a module, executing its `start` method. If the module
         *  cannot be found, a fatal error is thrown. If the module is already
         *  active, no action is taken.
         **/
        start: function (name) {

            var module  = this.getModule(name),
                methods = Application.moduleMethods;

            if (!module.instance) {

                module.instance = module.factory(
                    new Application.Sandbox(this, methods, name)
                );

                module.instance.start();

            }

        },

        /**
         *  Application#stop(name)
         *  - name (String): Name of the module to stop.
         *
         *  Stops a module, executing its `stop` method. If the module isn't
         *  recognised, a fatal error is thrown. If the module is not active, no
         *  action is taken.
         **/
        stop: function (name) {

            var module = this.getModule(name);

            if (module.instance) {

                module.instance.stop();
                module.instance = null;

            }

        },

        /**
         *  Application#startAll()
         *
         *  Activates all registered modules.
         **/
        startAll: function () {
            Object.keys(this.modules).forEach(this.start, this);
        },

        /**
         *  Application#stopAll()
         *
         *  Deactivates all registered modules.
         **/
        stopAll: function () {
            Object.keys(this.modules).forEach(this.stop, this);
        }

    });

    // Helpers.

    addProto({

        /**
         *  Application#addHelper(name, factory)
         *  - name (String): Name of the helper.
         *  - factory (Function): Factory to generate the helper.
         *
         *  Adds a helper to the application. A helper is a collection of
         *  related functionality that will aid the modules. They have access to
         *  more of the application than a module does. Unlike a module, a
         *  helper does not have a constructor or destructor method - there are
         *  no required methods. An template for a helper looks like this:
         *
         *      app.addHelper('helper-name', function (app) {
         *
         *          'use strict';
         *
         *          return {
         *          };
         * 
         *      });
         *
         *  A helper can contain any functionality. Examples include, but are
         *  not limited to:
         *
         *      - DOM manipulation
         *      - Event listeners
         *      - Variable manipulation
         *      - Asynchronous requests
         *      - Promises
         *
         *  Helpers can also be used to save re-writing functionality in
         *  multiple modules.
         **/
        addHelper: function (name, factory) {

            var helpers = this.helpers;

            if (helpers[name]) {
                this.fatal('Helper "' + name + '" already exists');
            }

            helpers[name] = factory;

        },

        /**
         *  Application#getHelper(name) -> Object
         *  - name (String): Name of the helper.
         *
         *  Retrieves a helper. If the helper is not recognised, a fatal error
         *  is thrown.
         **/
        getHelper: function (name) {

            var helper  = this.helpers[name],
                methods = Application.helperMethods;

            if (!helper) {
                this.fatal('Helper "' + name + '" does not exist');
            }

            return helper(new Application.Sandbox(this, methods, name));

        }

    });

    // Configuration.

    addStatic({

        /**
         *  Application.setConfig(name, value)
         *  - name (String): Name of the configuration setting.
         *  - value (*): Configuration value.
         *
         *  Sets global configuration. Global configuration is shared across all
         *  [[Application]] instances and can be overrideen by local
         *  configuration. An error is thrown if attempting to re-define
         *  pre-existing configuration.
         **/
        setConfig: function (name, value) {

            if (config[name]) {

                throw new Application.errors.fatal('Global configuration "' +
                        name + '" already set.');

            }

            config[name] = value;

        },

        /**
         *  Application.getConfig(name) -> *
         *  - name (String): Name of the configuration setting.
         *
         *  Retrieves the global configuration setting associated with the given
         *  `name`. If no match is found, `undefined` is returned.
         **/
        getConfig: function (name) {
            return config[name];
        }

    });

    addProto({

        /**
         *  Application#setConfig(name, value)
         *  - name (String): Name of the configuration setting.
         *  - value (*): Configuration value.
         *
         *  Sets local configuration. Local configuration only affects the
         *  current [[Application]] instance. An error is thrown if attempting
         *  to re-define pre-existing configuration.
         **/
        setConfig: function (name, value) {

            if (Object.prototype.hasOwnProperty.call(this.config, name)) {
                this.fatal('Local configuration "' + name + '" already set.');
            }

            this.config[name] = value;

        },

        /**
         *  Application#getConfig(name) -> *
         *  - name (String): Name of the configuration setting.
         *
         *  Retrieves the local configuration setting associated with the given
         *  `name`. If no match is found, `undefined` is returned.
         **/
        getConfig: function (name) {
            return this.config[name];
        }

    });

    // Errors.

    addStatic({

        /**
         *  Application.errors -> Object
         *
         *  Collection of all error constructors. Mainly used for comparisons.
         *
         *      try {
         *          func();
         *      } catch (ex) {
         *          if (ex instanceOf Application.errors.error) {
         *              // Application error
         *          }
         *      }
         *
         **/
        errors: {}

    });

    /** related to: Application#error
     *  Application.errors.error -> Error
     *
     *  Generic error.
     **/
    /** related to: Application.errors.error
     *  Application#error(message)
     *  - message (String): Message for the error.
     *
     *  Throws a generic error. Use of this error method should be avoided if
     *  possible as the other error methods are more specific and useful.
     **/
    createError('error');

    /** related to: Application#fatal
     *  Application.errors.fatal -> Error
     *
     *  Fatal error.
     **/
    /** related to: Application.errors.fatal
     *  Application#fatal(message)
     *  - message (String): Message for the error.
     *
     *  Throws a fatal error. A fatal error implies that the [[Application]] has
     *  executed code that can only be resolved by the author's interjection.
     *  The code that caused the fatal error has to be resolved.
     *
     *      var app = new Application();
     *      app.fatal('I am a fatal error');
     *      
     **/
    createError('fatal', 'error');

    /** related to: Application#warning
     *  Application.errors.warning -> Error
     *
     *  Warning error.
     **/
    /** related to: Application.errors.warning
     *  Application#warning(message)
     *  - message (String): Message for the error.
     *
     *  Throws a warning error. A warning error implies that the [[Application]]
     *  has executed code that and caused an issue that could be resolved if the
     *  application is completely reset.
     *
     *      var app = new Application();
     *      app.warning('I am a warning error');
     *      
     **/
    createError('warning', 'error');

    /** related to: Application#notice
     *  Application.errors.notice -> Error
     *
     *  Notice error.
     **/
    /** related to: Application.errors.notice
     *  Application#notice(message)
     *  - message (String): Message for the error.
     *
     *  Throws a notice error. A notice error implies that something has gone
     *  wrong, but the [[Application]] can continue without any serious
     *  consequences.
     *
     *      var app = new Application();
     *      app.notice('I am a notice error');
     *      
     **/
    createError('notice', 'error');

    /** related to: Application#deprecated
     *  Application.errors.deprecated -> Error
     *
     *  Deprecated error.
     **/
    /** related to: Application.errors.deprecated
     *  Application#deprecated(message)
     *  - message (String): Message for the error.
     *
     *  Throws a deprecated error. A deprecated error implies that functionality
     *  executed by the [[Application]] is no longer up-to-date and will be
     *  removed in the future (possibly causing a `ReferenceError` or similar).
     *
     *      var app = new Application();
     *      app.deprecated('I am a deprecated error');
     *      
     **/
    createError('deprecated', 'error');

    // Storing.

    addProto({

        /** related to Application#access
         *  Application#store(name, key, value)
         *  - name (String): Name of the helper.
         *  - key (String): Name key for the data.
         *  - value (?): Value of the data.
         *
         *  Each helper has access to this method which can be used to store
         *  information across each helper's instance. The `name` is
         *  automatically set by the [[Application.Sandbox]].
         *
         *      add.addHelper('helper', function (app) {
         *          var data = {};
         *          app.store('data', data);
         *      });
         *      
         **/
        store: function (name, key, value) {

            var data = this.data[name];

            if (!data) {
                data = this.data[name] = {};
            }

            data[key] = value;

        },

        /** related to Application#store
         *  Application#access(name, key, value)
         *  - name (String): Name of the helper.
         *  - key (String): Name key for the data.
         *
         *  Each hepler has access to this method which can be used to access
         *  information stored by another instance. The `name` is automatically
         *  set by the [[Application.Sandbox]].
         *
         *      add.addHelper('helper', function (app) {
         *          var data = app.access('data');
         *      });
         *      
         **/
        access: function (name, key) {

            var data = this.data[name] || {};

            return data[key];

        }

    });

    // Sandboxes.

    addStatic({

        // Application.Sandbox - already anotated.
        Sandbox: Sandbox,

        /**
         *  Application.moduleMethods -> Array
         *
         *  A white-list of methods from [[Application]] that a module's
         *  [[Application.Sandbox]] will have. The strings can have arguments
         *  automatically passed to the methods - see
         *  [[Application.Sandbox#_addMethod]] for full details.
         **/
        moduleMethods: ['error', 'fatal', 'warning', 'notice', 'deprecated',
            'getHelper', 'getConfig'],

        /**
         *  Application.helperMethods -> Array
         *
         *  A white-list of methods from [[Application]] that a helper's
         *  [[Application.Sandbox]] will have. The strings can have arguments
         *  automatically passed to the methods - see
         *  [[Application.Sandbox#_addMethod]] for full details.
         **/
        helperMethods: ['error', 'fatal', 'warning', 'notice', 'deprecated',
            'getHelper', 'getConfig', 'access(_name)', 'store(_name)']

    });

}(window));
