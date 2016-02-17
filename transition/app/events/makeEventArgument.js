define([
    "app",
    "./lib/util"
], function (
    app,
    util
) {

    "use strict";

    /** related to: appEventArgument
     * 	makeEventArgument(name[, data]) -> appEventArgument
     * 	- name (String): Name of the event.
     * 	- data (*): Optional data for the event.
     *
     * 	Creates an event argument that is passed to the handlers bound to the
     * 	event as that event is triggered.
     *
     * 	The event argument drives the application events and is the most obvious
     * 	way to transfer information to all handlers bound to it.
     *
     * 	Triggering an event will also trigger events upwards, based on the name.
     * 	This allows for delegation. Events are ordered into a hierarchy using
     * 	the names - events are broken into blocks based on the hyphen. Thus,
     * 	triggering "one-two-three" will subsequently trigger "one-two" and then
     * 	"one". To stop this promoting of events, use
     * 	[[appEventArgument.stopPromoting]]. If you want to stop executing other
     * 	handlers bound to the event as well as stop the promoting, use
     * 	[[appEventArgument.stopExecuting]].
     **/
    function makeEventArgument(name, data) {

        var arg = {};
        var internalIsPromotingStopped = false;
        var internalIsExecutingStopped = false;

        /**
         * 	appEventArgument.stopPromoting()
         *
         * 	Stops the promoting of events up through their name. Normally,
         * 	triggering "one-two-three" will subsequently trigger "one-two" and
         * 	then "one" - `appEventArgument.stopPromoting()` will stop that
         * 	process. To stop executing handlers bound to the event as well as
         * 	stop this promoting process, use [[appEventArgument.stopExecuting]].
         **/
        function stopPromoting() {
            internalIsPromotingStopped = false;
        }

        /**
         * 	appEventArgument.isPromotingStopped() -> Boolean
         *
         * 	Returns `true` if the promotion of the event has been stopped and
         * 	`false` if it has not.
         **/
        function isPromotingStopped() {
            return internalIsPromotingStopped;
        }

        /**
         * 	appEventArgument.stopExecuting()
         *
         * 	Stops the even executing any other handlers that are bound to it.
         * 	This also stops promoting. To stop promoting without stopping
         * 	execution, use [[appEventArgument.stopPromoting]].
         **/
        function stopExecuting() {

            internalIsExecutingStopped = true;
            internalIsPromotingStopped = true;

        }

        /**
         * 	appEventArgument.isExecutingStopped() -> Boolean
         *
         * 	Returns `true` if the execution of the event has been stopped and
         * 	`false` if it has not.
         **/
        function isExecutingStopped() {
            return internalIsExecutingStopped;
        }

        if (typeof name !== "string") {
            app.error.trigger("Event name must be a string", app.error.FATAL);
        }

        util.Object.assign(arg, {

            /**
             * 	appEventArgument.timestap -> Number
             *
             * 	Timestamp representing the time the event was executed.
             **/
            timestamp: Date.now(),

            /**
             * 	appEventArgument.name -> String
             *
             * 	Name of the event that was executed.
             */
            name,

            stopPromoting,
            isPromotingStopped,
            stopExecuting,
            isExecutingStopped

        });

        /**
         * 	appEventArgument.data -> *
         *
         * 	Data passed to the event in the `makeEventArgument` function. If no
         * 	data is passed in, this property will not exist.
         **/
        if (data) {
            arg.data = data;
        }

        return Object.freeze(arg);

    }

    return makeEventArgument;

});
