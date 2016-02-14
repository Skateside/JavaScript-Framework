define([
    "app",
    "./lib/util"
], function (
    app,
    util
) {

    "use strict";

    /** related to: eventArgument
     * 	makeEventArgument(name[, data]) -> eventArgument
     * 	- name (String): Name of the event.
     * 	- data (*): Optional data for the event.
     *
     * 	Creates an event argument that is passed to the handlers bound to the
     * 	event as that event is triggered.
     **/
    function makeEventArgument(name, data) {

        var arg = {};
        var internalIsStopped = false;

        /**
         * 	eventArgument.stop()
         *
         * 	Stops the event so that no other handlers bound to the event will
         * 	execute.
         **/
        function stop() {
            internalIsStopped = true;
        }

        /**
         * 	eventArgument.isStopped() -> Boolean
         *
         * 	Returns `true` if the event has been stopped and `false` if it has
         * 	not.
         **/
        function isStopped() {
            return internalIsStopped;
        }

        if (typeof name !== "string") {
            app.error.trigger("Event name must be a string", app.error.FATAL);
        }

        util.Object.assign(arg, {

            /**
             * 	eventArgument.timestap -> Number
             *
             * 	Timestamp representing the time the event was executed.
             **/
            timestamp: Data.now(),

            /**
             * 	eventArgument.name -> String
             *
             * 	Name of the event that was executed.
             */
            name,

            stop,
            isStopped

        });

        /**
         * 	eventArgument.data -> *
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
