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

    const ATTRIBUTE_TABINDEX = "tabindex";
    const ATTRIBUTE_HIDDEN = "hidden";

    var helpers = {};

    /**
     *  aria.makeFocusable(element)
     *  - element (Element): Element that should become focusable.
     *
     *  Makes the given element able to gain focus by giving it the attribute
     *  `tabindex` and setting it to `0`.
     **/
    function makeFocusable(element) {
        dom.setAttr(element, ATTRIBUTE_TABINDEX, 0);
    }

    /**
     *  aria.makeUnfocusable(element)
     *  - element (Element): Element that should become unfocusable.
     *
     *  Removes the element's ability to gain focus by giving it the attribute
     *  `tabindex` and setting it to `-1`.
     **/
    function makeUnfocusable(element) {
        dom.setAttr(element, ATTRIBUTE_TABINDEX, -1);
    }

    /**
     *  aria.hide(element)
     *  - element (Element): Element that should be marked as hidden.
     *
     *  Marks the element as hidden. This is not the same as actually hiding the
     *  element - unless there is related CSS, the element will remain visible.
     *
     *      // <div id="foo"></div>
     *      var foo = dom.byId("foo");
     *      aria.hide(foo);
     *      // -> Element is now:
     *      // <div id="foo" aria-hidden="true"></div>
     *
     **/
    function hide(element) {
        core.setProperty(element, ATTRIBUTE_HIDDEN, true);
    }

    /**
     *  aria.show(element)
     *  - element (Element): Element that should be marked as visible.
     *
     *  Marks the element as visible. This is not the same as actually making
     *  the element visible - unless there is related CSS, the element will
     *  remain invisible.
     *
     *      // <div id="foo" aria-hidden="true"></div>
     *      var foo = dom.byId("foo");
     *      aria.show(foo);
     *      // -> Element is now:
     *      // <div id="foo"></div>
     *
     **/
    function show(element) {
        core.removeProperty(element, ATTRIBUTE_HIDDEN);
    }

    util.Object.assign(helpers, {
        makeFocusable: makeFocusable,
        makeUnfocusable: makeUnfocusable,
        show: show,
        hide: hide
    });

    return Object.freeze(helpers);

});
