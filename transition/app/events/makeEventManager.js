define([
    "./lib/util",
    "./app/events/makeEventList"
], function (
    util,
    makeEventList
) {

    "use strict";

    /** related to: eventManager
     * 	makeEventManager() -> eventManager
     *
     * 	Makes an event manager. The manager creates and references event lists
     * 	(see [[makeEventList]]) based on a name.
     **/
    function makeEventManager() {

        var manager = {};
        var list = {};

        /**
         * 	eventManager.get(name) -> eventList
         * 	- name (String): Name of the event list.
         *
         * 	Gets an [[eventList]] for the given `name`. If there is no
         * 	[[eventList]] for that `name`, one is created.
         *
         *		var manager = makeEventManager();
         *		manager.get('one'); // -> eventList "one"
         *		manager.get('one'); // -> eventList "one"
         *		manager.get('two'); // -> eventList "two"
         *
         **/
        function get(name) {

            if (!list[name]) {
                list[name] = makeEventList();
            }

            return list[name];

        }

        util.Object.assign(manager, {
            get
        });

        return Object.freeze(manager);

    }

    return makeEventManager;

});
