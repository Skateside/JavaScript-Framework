/*define([
    "./lib/util"
], function (
    util
) {

    "use strict"

    var dom = {};
    var eventKey = util.String.uniqid("dom-events-")

    util.Object.assign(dom, {
    });

    return Object.freeze(dom);

});*/

define([
    "./lib/util"
], function (
    util
) {

    "use strict";

    function makeEventArgument(original) {

        var arg = {};
        var internalIsDefaultPrevented = false;
        var internalIsPropagationStopped = false;
        var internalIsImmediatePropagationStopped = false;

        function preventDefault() {

            if (!internalIsDefaultPrevented) {

                original.preventDefault();
                internalIsDefaultPrevented = true;

            }

        }

        function isDefaultPrevented() {
            return internalIsDefaultPrevented;
        }

        function stopPropagation() {

            if (!internalIsPropagationStopped) {

                original.stopPropagation();
                internalIsPropagationStopped = true;

            }

        }

        function isPropagationStopped() {
            return internalIsPropagationStopped;
        }

        function stopImmediatePropagation() {

            if (!internalIsImmediatePropagationStopped) {

                original.stopImmediatePropagation();
                internalIsImmediatePropagationStopped = true;
                stopPropagation();

            }

        }

        function isImmediatePropagationStopped() {
            return internalIsImmediatePropagationStopped;
        }

        util.Object.assign(arg, original, {
            original,
            preventDefault,
            stopPropagation,
            isDefaultPrevented,
            isPropagationStopped,
            stopImmediatePropagation,
            isImmediatePropagationStopped
        });

        return Object.freeze(arg);

    }

    return makeEventArgument;

});

define([
    "./lib/util",
    "./lib/dom/core",
    "./lib/dom/events/makeEventArgument"
], function (
    util,
    core,
    makeEventArgument
) {

    "use strict";

    function makeEventList() {

        var list = {};

        function hasList(name) {
            return util.Object.owns(list, name);
        }

        function getList(name) {

            if (!hasList(name)) {
                list[name] = [];
            }

            return list[name];

        }

        function getIndex(name, selector, handler) {

            var index = -1;

            getList(name).every(function (entry, i) {

                if (entry.selector === selector && entry.handler === handler) {
                    index = i;
                }

                return index === -1;

            });

            return index;

        }

        function add(name, selector, handler, context) {

            var modifiedHandler;

            if (getIndex(name, selector, handler) < 0) {

                modifiedHandler = function (e) {

                    if (core.is(e.target, selector)) {
                        handler.call(context, e);
                    }

                };

                getName(list).push({
                    selector,
                    handler,
                    context,
                    modified: modifiedHandler
                });

            }

        }

        function remove(name, selector, handler) {

            var index = getIndex(name, selector, handler);

            if (index > -1) {
                getList(name).splice(index, 1);
            }

        }

        function trigger(name, e) {

            var evt = makeEventArgument(e);

            getList(name).some(function (entry) {

                entry.modified(evt);

                return evt.isImmediatePropagationStopped();

            });

        }

        util.Object.assign(list, {
            hasList,
            getList,
            add,
            remove,
            trigger
        });

        return Object.freeze(list);

    }

    return makeEventList;

});

define([
    "./lib/util",
    "./lib/dom/core",
    "./lib/dom/data",
    "./lib/dom/traversal",
    "./lib/dom/events/makeEventList"
], function (
    util,
    core,
    data,
    traversal,
    makeEventList
) {

    "use strict";

    var special = {};

    function makeEventInterface() {

        var inter = {};
        var eventKey = util.String.uniqid("dom-events-")

        function getList(element) {

            element = core.getClosestElement(element);

            if (!data.hasData(element, eventKey)) {
                data.setData(element, eventKey, makeEventList());
            }

            return data.getData(element, eventKey);

        }

        function bind(element, eventName, selector, handler, context, isOne) {

            var list = getList(element);
            var func;

            if (typeof selector === "function") {

                context = handler;
                handler = selector;
                selector = "*";

            }

            func = handler;

            if (isOne) {

                func = function onlyOne(e) {

                    handler.call(context, e);
                    list.remove(eventName, selector, onlyOne);

                };

            }

            if (!list.hasList(eventName)) {

                element.addEventListener(eventName, function (e) {
                    list.trigger(eventName, e);
                }, false);

            }

            list.add(eventName, selector, func, context);

        }

        function on(element, eventName, selector, handler, context) {
            bind(element, eventName, selector, handler, context, false);
        }

        function off(element, eventName, selector, handler) {

            if (typeof selector === "function") {

                handler = selector;
                selector = "*";

            }

            getList(element).remove(eventName, selector, handler);

        }

        function one(element, eventName, selector, handler, context) {
            bind(element, eventName, selector, handler, context, true);
        }

        function trigger(element, eventName) {
            //getList(element).trigger(eventName);

            var isBubble = __SOMEHOW_IDENTIFY_IS_BUBBLE_NOT_CAPTURE__; // XXX
            var elements = isBubble
                ? [element].concat(traversal.parents(element))
                : [element].concat(traversal.children(element));
            var event = __SOMEHOW_GET_AN_EVENT_ARGUMENT__; // XXX
            var ontype = "on" + eventName;

            if (isBubble) {

                elements.push(
                    core.getRoot(),
                    element.defaultView || element.parentWindow || window
                );

            }

            elements.some(function (elem) {

                var temp = elem[ontype];

                if (util.Function.isFunction(elem[eventName])) {

                    if (temp) {
                        elem[ontype] = undefined;
                    }

                    elem[eventName]();

                    if (temp) {
                        elem[ontype] = temp;
                    }

                }

                getList(elem).trigger(eventName, event);

                return event.isPropagationStopped();

            });

        }

        util.Object.assign(inter, {
        });

        return Object.freeze(inter);

    }

    return makeEventInterface;

});


// Example use:
dom.on(dom.byId("foo"), "click", function (e) {
});

dom.on(dom.byId("foo"), "click", "a", function (e) {
});

dom.on()
dom.off()
dom.one()
dom.trigger()
