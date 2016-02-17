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
         * 	`func` on them.
         *
         *		var list = makeEventList();
         *		list.add(function () { return 1; });
         *		list.add(function () { return 2; });
         *		list.add(function () { return 3; });
         * 		list.each(function (handler) {
         *			console.log("%d = %d", i, entry.handler());
         * 		});
         *		// Logs "0 = 1" then "1 = 2" then "2 = 3"
         *
         * 	If you need to stop the list, use [[eventList.doUntil]] to stop when
         * 	`func` returns `true` and [[eventList.doWhile]] to stop when `func`
         * 	stops returning true.
         **/
        function each(func) {

            events.forEach(function (event, i) {
                func(event, i);
            });

        }

        /** related to: eventList.doUntil
         * 	eventList.doWhile(func)
         * 	- func (Function): Function to execute on each entry of the list.
         *
         * 	Loops over each entry of the list and passed them to `func`. As long
         * 	as `func` returns `true` (and there are entries) then the loop will
         * 	continue.
         *
         *		var list = makeEventList();
         *		list.add(function () { return 1; });
         *		list.add(function () { return 2; });
         *		list.add(function () { return 3; });
         *		list.doWhile(function (entry, i) {
         *			console.log("%d = %d", i, entry.handler());
         *			return entry.handler() < 2;
         *		});
         *		// Logs "0 = 1" then "1 = 2"
         *
         * 	To continue the loop until the `hander` returns `true`, use
         * 	[[eventList.doUntil]].
         **/
        function doWhile(func) {

            events.every(function (event, i) {
                return func(event, i) === true;
            });
            
        }

        /** related to: eventList.doWhile
         * 	eventList.doUntil(func)
         * 	- func (Function): Function to execute on each entry of the list.
         *
         * 	Loops over each entry of the list and passed them to `func`. Until
         * 	`func` returns `true` (and while there are entries) the loop will
         * 	continue.
         *
         *		var list = makeEventList();
         *		list.add(function () { return 1; });
         *		list.add(function () { return 2; });
         *		list.add(function () { return 3; });
         *		list.doWhile(function (entry) {
         *			console.log("%d = %d", i, entry.handler());
         *			return entry.handler() === 2;
         *		});
         *		// Logs "0 = 1" then "1 = 2"
         *
         * 	To continue the loop while the `hander` returns `true`, use
         * 	[[eventList.doWhile]].
         **/
        function doUntil(func) {

            events.some(function (event, i) {
                return func(event, i) !== true;
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
