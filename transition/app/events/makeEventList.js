define([
    "./lib/util"
], function (
    util
) {

    "use strict";

    /** related to: eventList
     * 	makeEventList() -> eventList
     *
     * 	Creates an event list: a list for managing an event.
     **/
    function makeEventList() {

        var list = {};
        var events = [];

        /**
         * 	eventList.each(func)
         * 	- func (Function): Function to execute on each entry in the list.
         *
         * 	Loops over each of the entries in the list and executes the given
         * 	`func` on them. If `func` returns `false`, the loop is halted.
         *
         *		var list = makeEventList();
         *		list.add(function () {});
         *		list.add(function () {});
         *		list.add(function () {});
         * 		list.each(function (handler, i) {
         * 			console.log(handler);
         * 			return i === 1;
         * 		});
         * 		// Logs 2 functions then stops.
         *
         **/
        function each(func) {

            events.some(function (event, i) {
                return func(event, i) !== false;
            });

        }

        // Internal function to get the index of the given handler within the
        // internal array. If the handler cannot be found, -1 is returned.
        function getIndex(handler) {

            var index = -1;

            each(function (event, i) {

                if (event.handler === handler) {
                    index = i;
                }

                return index === -1;

            });

            return index;

        }

        /**
         * 	eventList.add(handler[, context]) -> eventList
         * 	- handler (Function): Handler to add.
         * 	- context (*): Optional context for `handler` to execute in.
         *
         * 	Adds the specified handler to the event list. The instance is
         * 	returned to allow for chaining.
         *
         *		var list = makeEventList();
         *		list
         *			.add(function () {})
         *			.add(function () {});
         *
         *	Functions are checked when added to ensure that they're unique.
         *
         * 		var list = makeEventList();
         * 		var func = function () {
         * 		};
         * 		list.add(func).add(func);
         * 		list.each(function (handler, i) {
         * 			console.log(i);
         * 		});
         * 		// Logs 0 because there is only 1 event added.
         *
         **/
        function add(hander, context) {

            if (getIndex(handler) < 0) {

                events.push({
                    handler,
                    context
                });

            }

            return list;

        }

        /**
         * 	eventList.remove(handler) -> Boolean
         * 	- handler (Function): Handler to remove.
         *
         * 	Removes the handler from the event list. If the handler cannot be
         * 	found, no action is taken. A boolean is returned to say whether or
         * 	not a handler was removed.
         *
         *		var list = makeEventList();
         *		var func = function () {};
         *		list.add(func);
         *		list.remove(func); // -> true
         *		list.remove(func); // -> false
         *
         **/
        function remove(handler) {

            var index = getIndex(handler);
            var exists = index > -1;

            if (exists) {
                events.splice(index, 1);
            }

            return exists;

        }

        util.Object.assign(list, {
            add,
            remove,
            each
        });

        return Object.freeze(list);

    }

    return makeEventList;

});
