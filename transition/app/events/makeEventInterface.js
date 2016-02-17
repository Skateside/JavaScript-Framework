define([
    "app",
    "./lib/util",
    "./app/events/makeEventManager"
    "./app/events/makeEventArgument"
], function (
    app,
    util,
    makeEventManager,
    makeEventArgument
) {

    "use strict";

    function looksFamiliar(obj) {

        return util.Object.looksLike(obj, {
            name: "string",
            stop: "function",
            isStopped: "function"
        });

    }

    function triggerFatal(message) {
        app.error.trigger(message, app.error.FATAL);
    }

    /** related to: eventInterface
     * 	makeEventInterface() -> eventInterface
     *
     * 	Creates the event interface that the app will use.
     **/
    function makeEventInterface() {

        var inter = {};
        var manager = makeEventManger();

        // Gets the eventList based on the `name` - `name may be either a string
        // or an eventArgument.
        function get(name) {

            var event;

            if (typeof name === "string") {
                event = manager.get(name);
            } else if (looksFamiliar(name)) {
                event = manager.get(name.name);
            }

            if (!event) {
                triggerFatal("Expected string or eventArgument");
            }

            return event;

        }

        /**
        * 	eventInterface.create(name[, data]) -> eventArgument
        * 	- name (String): Name of the event.
        * 	- data (*): Optional data for the argument.
        *
        * 	Wrapper for [[makeEventArgument]].
        **/
        function create(name, data) {
            return makeEventArgument(name, data);
        }

        // Gets the event argument for `name`. `name` may be either a string or
        // an eventArgument.
        function getEventArgument(name, data) {

            var arg;

            if (typeof name === "string") {
                arg = create(name, data);
            } else if (looksFamiliar(name)) {
                arg = name;
            }

            if (!arg) {
                triggerFatal("Expected string or eventArgument");
            }

            return arg;

        }

        /**
         * 	eventInterface.on(name, handler[, context])
         * 	- name (String): Name of the event.
         * 	- handler (Function): Function to bind to the event.
         * 	- context (*): Optional context for the `handler`.
         *
         *	Binds the given `handler` to the event specified in `name`. The
         *	`handler` is passed an [[eventArgument]].
         *
         * 		var inter = makeEventInterface();
         * 		inter.on('my-event', function (e) {
         * 			// do something
         * 		});
         *
         **/
        function on(name, handler, context) {
            get(name).add(handler, context);
        }

        /**
         * 	eventInterface.off(name, handler)
         * 	- name (String): Name of the event.
         * 	- handler (Function): Function to remove from the event.
         *
         * 	Removes the given `hander` from the event specified in `name`.
         **/
        function off(name, handler) {
            get(name).remove(handler);
        }

        /**
         * 	eventInterface.emit(event)
         * 	eventInterface.emit(name[, data])
         * 	- event (appEventArgument): eventArgument instance to emit.
         * 	- name (String): Name of the event.
         * 	- data (*): Optional data for the event.
         *
         * 	Triggers the given event. The event may be either a string or an
         * 	eventArgument.
         *
         *		var inter = makeEventInterface();
         * 		// Trigger with string.
         * 		inter.emit("my-event-1");
         * 		inter.emit("my-event-2", {foo: true});
         * 		// Trigger with event.
         * 		var evt = inter.create("my-event-3");
         * 		inter.emit(evt);
         *
         * 	Data cannot be passed to `emit` if an [[appEventArgument]] is used.
         * 	If you need to pass data, the data must be added when the event is
         * 	created. See [[eventInterface.create]] for more information.
         *
         * 	Emitting events will cause the event name to rise up through the
         * 	chain, allowing for delegation. The hierarchy is determined by the
         * 	hyphens in the name. In the case of "my-event-1", emitting it will
         * 	subsequently emit "my-event" and then "my". As you can see,
         * 	"my-event-2" and "my-event-3" would also trigger these so a handler
         * 	bound to "my-event" would hear all these events.
         *
         * 		var inter = makeEventInterface();
         * 		inter.on("my-event-1", function (e) {
         * 			console.log("my-event-1 emitted from %s", e.name);
         * 		});
         * 		inter.on("my-event", function (e) {
         * 			console.log("my-event emitted from %s", e.name);
         * 		});
         * 		inter.on("my", function (e) {
         * 			console.log("my emitted from %s", e.name);
         * 		});
         * 		inter.emit("my-event-1");
         * 		// log: "my-event-1 emitted from my-event-1"
         * 		// log: "my-event emitted from my-event-1"
         * 		// log: "my emitted from my-event-1"
         *
         * 	This process is known as "promoting" and can be easily stopped by
         * 	calling the `stopPromoting` method on the event argument.
         *
         * 		var inter = makeEventInterface();
         * 		inter.on("my-event-1", function (e) {
         * 			console.log("my-event-1 emitted from %s", e.name);
         * 		});
         * 		inter.on("my-event", function (e) {
         * 			console.log("my-event emitted from %s", e.name);
         * 			e.stopPromoting();
         * 		});
         * 		inter.on("my", function (e) {
         * 			console.log("my emitted from %s", e.name);
         * 		});
         * 		inter.emit("my-event-1");
         * 		// log: "my-event-1 emitted from my-event-1"
         * 		// log: "my-event emitted from my-event-1"
         *
         * 	Multiple handlers can be bound to a single event and are executed in
         * 	a first-in-first-out order.
         *
         * 		var inter = makeEventInterface();
         * 		inter.on("my-event-1", function (e) {
         * 			console.log(1);
         * 		});
         * 		inter.on("my-event-1", function (e) {
         * 			console.log(2);
         * 		});
         * 		inter.on("my-event-1", function (e) {
         * 			console.log(3);
         * 		});
         * 		inter.emit("my-event-1");
         * 		// log: 1
         * 		// log: 2
         * 		// log: 3
         *
         * 	This can be stopped by calling the `stopExecuting` method on the
         * 	event argument.
         *
         * 		var inter = makeEventInterface();
         * 		inter.on("my-event-1", function (e) {
         * 			console.log(1);
         * 		});
         * 		inter.on("my-event-1", function (e) {
         * 			console.log(2);
         * 			e.stopExecuting();
         * 		});
         * 		inter.on("my-event-1", function (e) {
         * 			console.log(3);
         * 		});
         * 		inter.trigger("my-event-1");
         * 		// log: 1
         * 		// log: 2
         *
         * 	Calling `stopExecuting` will automatically also call
         * 	`stopPromoting`.
         **/
        function emit(name, data) {

            var arg = makeEventArgument(name, data);
            var parts = name.split("-");
            var il = parts.length;

            while (il) {

                get(parts.slice(0, il).join("-")).doUntil(function (event) {

                    event.handler.call(event.context, arg);

                    return arg.isExecutingStopped();

                });

                if (arg.isPromotingStopped()) {
                    break;
                }

                il -= 1;

            }

        }

        util.Object.assign(inter, {
            create,
            on,
            off,
            emit
        });

        return Object.freeze(inter);

    }

    return makeEventInterface;

});
