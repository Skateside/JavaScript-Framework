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
         * 	- event (eventArgument): eventArgument instance to emit.
         * 	- name (String): Name of the event.
         * 	- data (*): Optional data for the event.
         *
         * 	Triggers the given event. The event may be either a string or an
         * 	eventArgument.
         *
         *		var inter = makeEventInterface();
         * 		// Trigger with string.
         * 		inter.emit('my-event-1');
         * 		inter.emit('my-event-2', {foo: true});
         * 		// Trigger with event.
         * 		var evt = inter.create('my-event-3');
         * 		inter.emit(evt);
         *
         **/
        function emit(name, data) {

            var arg = getEventArgument(name, data);

            get(name).each(function (event) {

                event.handler.call(event.context, arg);

                return !arg.isStopped();

            });

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
