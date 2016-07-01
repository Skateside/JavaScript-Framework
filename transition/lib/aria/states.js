define([
    "lib/util",
    "lib/dom",
    "lib/aria/core"
], function (
    util,
    dom,
    core
) {

    "use strict";

    var states = {};

    /**
     *  aria.getState(element, name) -> Boolean|undefined
     *  - element (Element): Element whose state should be returned.
     *  - name (String): Name of the state.
     *
     *  Gets the state of the element.
     *
     *      <div id="foo" aria-hidden="true" aria-busy="false">Foo</div>
     *
     *      var elem = dom.byId("foo");
     *      aria.getState(elem, "hidden"); // -> true
     *      aria.getState(elem, "busy");   // -> false
     *
     *  If the state is not set, `undefined` is returned.
     *
     *      aria.getState(elem, "checked"); // -> undefined
     *
     *  Be warned that the loose equality operator (`==`) will coerce
     *  `undefined` into `false` which may create an undesired result. Either
     *  always use the strict equality operator (`===`) or combine this with
     *  [[aria.hasState]] or [[aria.hasProperty]].
     **/
    function getState(element, name) {

        var state;

        if (core.hasProperty(element, name)) {
            state = core.getProperty(element, name).toLowerCase() === "true";
        }

        return state;

    }

    // Takes a raw value and converts it into a boolean.
    function readState(raw) {

        var state = true;

        switch (util.Object.getType(raw)) {

        case "boolean":

            state = raw;
            break;

        case "string":

            if (raw === "1" || raw === "0") {
                state = readState(+raw);
            } else if (/^(?:true|false)$/i.test(raw)) {
                state = raw.toLowerCase() === "true";
            }

            break;

        case "number":

            if (raw === 0 || raw === 1) {
                state = !!raw;
            }

            break;

        }

        return state;

    }

    /**
     *  aria.setState(element, name[, state = true])
     *  - element (Element): Element whose state should be set.
     *  - name (String): Name of the state to set.
     *  - state (String|Boolean|Number): Optional state to set.
     *
     *  Sets the state on the specified element.
     *
     *      <div id="foo">Foo</div>
     *
     *      var elem = dom.byId("foo");
     *      aria.getState(elem, "hidden", true);
     *      // "foo" element is now:
     *      // <div id="foo" aria-hidden="true">Foo</div>
     *
     *  The `state` argument is normalised so the following calls will set the
     *  `aria-hidden` state to `true`:
     *
     *      aria.setState(elem, "hidden", "true");
     *      aria.setState(elem, "hidden", "TRUE");
     *      aria.setState(elem, "hidden", true);
     *      aria.setState(elem, "hidden", 1);
     *      aria.setState(elem, "hidden", "1");
     *
     *  ... and the following will set the `aria-hidden` state to `false`:
     *
     *      aria.setState(elem, "hidden", "false");
     *      aria.setState(elem, "hidden", "FALSE");
     *      aria.setState(elem, "hidden", false);
     *      aria.setState(elem, "hidden", 0);
     *      aria.setState(elem, "hidden", "0");
     *
     *  If the `state` argument is ommitted or not recognised, the state is set
     *  to `true`. Therefore, the following examples will all set the
     *  `aria-busy` state to `true`:
     *
     *      aria.setState(elem, "busy");
     *      aria.setState(elem, "busy", {});
     *      aria.setState(elem, "busy", null);
     *      aria.setState(elem, "busy", "nothing");
     *      aria.setState(elem, "busy", -1);
     *
     *  For simplicity, it may be easier to always pass a boolean as the `state`
     *  argument.
     **/
    function setState(element, name, state) {
        core.setProperty(element, name, readState(state));
    }

    util.Object.assign(states, {

        getState: getState,
        setState: setState,

        /**
         *  aria.hasState(element, name) -> Boolean
         *  - element (Element): Element to check.
         *  - name (String): Name of the state to check.
         *
         *  Checks to see if the given element has the given state, regardless
         *  of the current setting of that state.
         *
         *      <div id="foo" aria-hidden="true" aria-busy="false">Foo</div>
         *
         *      var elem = dom.byId("foo");
         *      aria.getState(elem, "hidden");  // -> true
         *      aria.getState(elem, "budy");    // -> true
         *      aria.getState(elem, "checked"); // -> false
         *
         **/
        hasState: hasProperty,

        /**
         *  aria.removeState(element, name) -> Boolean
         *  - element (Element): Element whose state should be removed.
         *  - name (String): Name of the state to remove.
         *
         *  Removes the specified state from the given element.
         *
         *      <div id="foo" aria-hidden="true" aria-busy="false">Foo</div>
         *
         *      var elem = dom.byId("foo");
         *      aria.removeState(elem, "hidden");
         *      // -> "foo" element is now
         *      // <div id="foo" aria-busy="false">Foo</div>
         *
         **/
        removeState: removeProperty

    });

    return Object.freeze(states);

});
