/**
 *  helper promise
 *
 *  Handles promises through the [[promise.Promise]] constructor (which can be
 *  affected using the [[promise.AsyncManager]] constructor. The most simple way
 *  to create a promise is using the [[promise.create]] function.
 **/
app.addHelper('promise', function (app) {

    'use strict';

    var $a = app.getHelper('array'),
        $c = app.getHelper('class'),
        $o = app.getHelper('object'),

        // Helper object, returned at the end.
        promise = {},

        AsyncManager = null,
        Promise = null,

        // Variation of $a.Context that executes the AsyncManager callbacks.
        Context = $c.create($a.Context, {

            init: function (array, state) {

                this.$super(array, null);

                this.state = state;

            },

            execute: function () {

                var handler = this.handler,
                    func    = handler.handler;

                if (typeof func === 'function' &&
                        handler.state === this.state) {
                    func.call(handler.context);
                }

            }

        });

    /** 
     *  class promise.AsyncManager
     *
     *  Handles the callbacks and states behind the scenes - [[promise.Promise]]
     *  is the public interface. The `AsyncManager` can have its state set
     *  through the [[promise.AsyncManager#setState]] method, callbacks can be
     *  added using the [[promise.AsyncManager#add]] method.
     **/
    AsyncManager = $c.create({

        /**
         *  new promise.AsyncManager(async[, context])
         *  - async (Function|*): Asynchronous function to execute.
         *  - context (*): Context for the function.
         *
         *  The `async` argument should be a function so that it can be passed
         *  an object with a `resolve` and `reject` method, but if the `async`
         *  argument is not a function, or not passed, the manager is resolved
         *  immediately.
         **/
        init: function (async, context) {

            /**
             *  promise.AsyncManager#callbacks -> Array
             *
             *  Collection of callback objects.
             **/
            this.callbacks = [];

            /**
             *  promise.AsyncManager#state -> String
             *
             *  Current state. Should be "pending", "resolved" or "rejected".
             **/
            this.state = AsyncManager.PENDING;

            if (typeof async === 'function') {

                async.call(context, {
                    reject:  this.setState.bind(this, AsyncManager.REJECTED),
                    resolve: this.setState.bind(this, AsyncManager.RESOLVED),
                });

            } else {
                this.setState(AsyncManager.RESOLVED);
            }

        },

        /**
         *  promise.AsyncManager#setState(state)
         *  - state (String): State for the manager.
         *
         *  Sets the state for the manager. `state` should be "resolved" or
         *  "rejected". Once the state has been set, the
         *  [[promise.AsyncManager#callbacks]] are executed using the
         *  [[promise.AsyncManager#execute]] method.
         **/
        setState: function (state) {

            var pending  = AsyncManager.PENDING,
                resolved = AsyncManager.RESOLVED,
                rejected = AsyncManager.REJECTED,

            if (this.state === pending &&
                    (state === resolved || state === rejected)) {

                this.state = state;
                this.execute();

            }

        },

        /**
         *  promise.AsyncManager#execute()
         *
         *  Executes all [[promise.AsyncManager#callbacks]] associated with the
         *  current [[promise.AsyncManager#state]] before emptying the
         *  [[promise.AsyncManager#callbacks]] array.
         **/
        execute: function () {

            var context = new Context(this.callbacks, this.state);

            context.run();
            context.free();

            // Empty array.
            this.callbacks.length = 0;

            // this.callbacks.forEach(function (callback) {

            //     if (callback.type === this.state) {
            //         callback.handler.call(callback.context);
            //     }

            // }, this);

        },

        /**
         *  promise.AsyncManager#add(state, handler[, context])
         *  - state (String): State for the callback.
         *  - handler (Function): Function to execute when the manager reaches
         *    the given `state`.
         *  - context (*): Context for the `handler`.
         *
         *  Adds a callback to the list of [[promise.AsyncManager#callbacks]].
         *  If [[promise.AsyncManager#state]] matches the given `state`
         *  argument, the `handler` is executed immediately.
         **/
        add: function (state, handler, context) {

            if (state === this.state) {
                handler.call(context);
            } else if (state === AsyncManager.PENDING) {

                this.callbacks.push({
                    handler: handler,
                    context: context,
                    type:    state
                });

            }

        },

        /**
         *  promise.AsyncManager#getState() -> String.
         *
         *  Returns the current [[promise.AsyncManager#state]].
         **/
        getState: function () {
            return this.state;
        }

    });

    $o.addConfig(AsyncManager, {

        /**
         *  promise.AsyncManager.PENDING = "pending"
         *
         *  Pending state of a promise.
         **/
        PENDING: 'pending',

        /**
         *  promise.AsyncManager.RESOLVED = "resolved"
         *
         *  Resolved state of a promise.
         **/
        RESOLVED: 'resolved',

        /**
         *  promise.AsyncManager.REJECTED = "rejected"
         *
         *  Rejected state of a promise.
         **/
        REJECTED: 'rejected'

    });

    /** 
     *  class promise.AsyncManager
     *
     *  The public interface to [[promise.AsyncManager]]. Unlike the manager,
     *  the promise is able to add callbacks when the manager is resolved or
     *  rejected (or simply completed).
     *
     *  To better understand the explanation, consider this example:
     *
     *      var prom = new promise.Promise(function (deferred) {
     *          deferred[Math.random() < 0.5 ? 'reject' : 'resolve'];
     *      });
     *
     *      prom.done(function () { console.log('Resolved'); });
     *      prom.fail(function () { console.log('Rejected'); });
     *      prom.always(function () { console.log('Completed'); });
     *
     *  The example above will randomly resolve or reject. If resolved, the
     *  console will log "Resolved" then "Complete"; if rejected, the console
     *  will log "Rejected" then "Complete". Once the promise has been
     *  completed, callbacks can still be passed to the [[promise.Promise#done]]
     *  or [[promise.Promise#fail]] methods and they will be executed
     *  immediately (if the state matches)
     *
     *      prom.done(function () { console.log('Still resolved'); });
     *      prom.fail(function () { console.log('Still rejected'); });
     *
     *  The function passed to a `Promise` when constructed is passed an object
     *  with a `resolve` and `reject` method. See [[new promise.Promise]] for
     *  full details.
     **/
    Promise = $c.create({

        /**
         *  new promise.Promise([async[, context]])
         *  - async (Function|*): Asyncronous function to execute.
         *  - context (*): Optional context for the function.
         *
         *  Constructs the promise. The `async` argument can be anything - if
         *  the argument is not a function, the promise is resolved immediately.
         *  If the argument is a function, it is passed an object with a
         *  `reject` and `resolve` method which will affect the state of the
         *  promise.
         **/
        init: function (async, context) {

            var manager = new promise.AsyncManager(async, context);

            /**
             *  promise.Promise#done(handler[, context])
             *  - handler (Function): Function to execute.
             *  - context (*): Context for the function.
             *
             *  Adds a callback to be executed when the promise is successfully
             *  resolved. An optional `context` can be provided for the
             *  callback. To execute a callback when the promise is rejected,
             *  use [[promise.Promise#fail]]; to execute a callback either way,
             *  use [[promise.Promise#always]].
             *
             *      var prom = new promise.Promise();
             *      prom.done(function () { console.log('Promise resolved'); });
             * 
             **/
            this.done = manager.add.bind(manager, AsyncManager.RESOLVED);

            /**
             *  promise.Promise#fail(handler[, context])
             *  - handler (Function): Function to execute.
             *  - context (*): Context for the function.
             *
             *  Adds a callback to be executed when the promise is rejected. An
             *  optional `context` can be provided for the callback. To execute
             *  a callback when the promise is resolved, use
             *  [[promise.Promise#done]]; to execute a callback either way, use
             *  [[promise.Promise#always]].
             *
             *      var prom = new promise.Promise();
             *      prom.fail(function () { console.log('Promise rejected'); });
             * 
             **/
            this.fail = manager.add.bind(manager, AsyncManager.REJECTED);

            /**
             *  promise.Promise#getState() -> String
             *
             *  Returns the current state of the promise. Should be `"pending"`
             *  until a promise is rejected or resolved, or `"resolved"` or
             *  `"rejected"` once completed. The possible responses exist as
             *  constants:
             *
             *  - [[promise.AsyncManager.PENDING]]
             *  - [[promise.AsyncManager.RESOLVED]]
             *  - [[promise.AsyncManager.REJECTED]]
             *  
             **/
            this.getState = manager.getState.bind(manager);

        },

        /**
         *  promise.Promise#always(handler[, context])
         *  - handler (Function): Function to execute.
         *  - context (*): Context for the function.
         *
         *  Adds a callback to be executed when the promise is completed,
         *  whether it is rejected or resolved. An optional `context` can be
         *  provided for the callback. To execute a callback only when the
         *  promise is resolved, use [[promise.Promise#done]]; to execute a
         *  callback only when the promise is rejected, use
         *  [[promise.Promise#always]].
         *
         *      var prom = new promise.Promise();
         *      prom.always(function () { console.log('Promise completed'); });
         * 
         **/
        always: function (handler, context) {

            this.done(handler, context);
            this.fail(handler, context);

        }

    });

    promise.AsyncManager = AsyncManager;
    promise.Promise = Promise;

    /**
     *  promise.create(func[, context]) -> promise.Promise
     *  - func (Function|*): Asynchronous function.
     *  - context (*): Context for the `func`.
     *
     *  Creates a new [[promise.Promise]].
     **/
    promise.create = function (func, context) {
        return new this.Promise(func, contect);
    };

    return promise;

});

