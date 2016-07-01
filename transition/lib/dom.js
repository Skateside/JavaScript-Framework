define([
    "lib/util",
    "lib/dom/core",
    "lib/dom/attributes",
    "/lib/dom/classes",
    "/lib/dom/data",
    "/lib/dom/events",
    "/lib/dom/lookups",
    "/lib/dom/manipulations",
    "/lib/dom/support",
    "/lib/dom/traversal"
], function (
    util,
    core,
    attributes,
    classes,
    data,
    events,
    lookups,
    manipulations,
    support,
    traversal
) {

    "use strict";

    var dom = {};

    util.Object.assign(
        dom: dom,
        core: core,
        attributes: attributes,
        classes: classes,
        data: data,
        events: events,
        lookups: lookups,
        manipulations: manipulations,
        support: support,
        traversal: traversal
    );

    /**
     *  dom.each(elements, method, ...args) -> Array
     *  - elements (Array|NodeList): Elements to work on.
     *  - method (String): Method to execute.
     *  - args (?): Arguments for the method.
     *
     *  Executes a [[dom]] method on all the elements in the `elements`
     *  collection. For example, to get all IDs of all elements with an `id`
     *  attribute, [[dom.identify]] can be used:
     *
     *      dom.each(dom.get('[id]'), 'identify');
     *      // -> ['one', 'two', ... ]
     *
     *  Additional arguments can be passed to the [[dom]] method. For
     *  example, this will set an attribute on all elements with an `id`
     *  attribute.
     *
     *      dom.each(dom.get('[id]'), 'setAttr', 'data-dom', true);
     *      // All elements with an id attribute now have the attribute
     *      // data-dom="true"
     *
     *  Any collection of elements will work, including an `Array` or a
     *  `NodeList`. An individual element will not work, but the original
     *  method may simply be called in those situations.
     **/
    dom.each = util.Array.makeInvoker(dom);

    return Object.freeze(dom);

});
