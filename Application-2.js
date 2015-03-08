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

    /**
     *  new Application.Sandbox(app, methods)
     *  - app (Application): Instance of [[Application]].
     *  - methods (Array): White list of methods.
     *
     *  Creates the sandbox passed to either a module or a helper. The facade is
     *  generated by passing the application instance that contains the original
     *  methods and a white list of methods that should be created. Methods are
     *  added to [[Application.Sandbox]] during from the `methods` array so will
     *  not be documented, but they will be identical to the [[Application]]
     *  methods of the same name.
     **/
    Sandbox.prototype.init = function (app, methods) {

        methods.forEach(function (method) {
            this[method] = app[method].bind(app);
        }, this);

    };

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

            var module = this.getModule(name);

            if (!module.instance) {

                module.instance = module.factory(
                    new Application.Sandbox(this, Application.moduleMethods)
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

            var helper = this.helpers[name];

            if (!helper) {
                this.fatal('Helper "' + name + '" does not exist');
            }

            return helper(
                new Application.Sandbox(this, Application.helperMethods)
            );

        }

    });

    // Configuration
    Application.setConfig = function (name, value) {
        config[name] = value;
    };

    Application.getConfig = function (name) {
        return config[name];
    };

    addStatic({

        Sandbox: Sandbox,

        moduleMethods: ['getHelper', 'getConfig'],

        helperMethods: ['getHelper', 'getConfig', 'access', 'store']

    });

}(window));
