/**
 *  aria
 *
 *  A collection of functions that help assigning WAI-ARIA attributes to
 *  elements.
 *
 *  This object has four groups of low-level functions that work similarly;
 *  most helper functions call one of these functions.
 *
 *  - properties ([[aria.getProperty]], [[aria.hasProperty]],
 *    [[aria.setProperty]], [[aria.removeProperty]])
 *    Properties are generic `aria-*` attributes. Attributes are always
 *    normalised using [[aria.normalise]].
 *  - references ([[aria.getReference]], [[aria.hasReference]],
 *    [[aria.setReference]], [[aria.remveReference]])
 *    References are attributes that reference another element (by ID). The main
 *    advantage these methods provide is that setting a refernce can be done by
 *    passing the element to reference and getting the reference will return the
 *    element. The `aria-` prefix for the attribute is automatically added by
 *    the functions.
 *  - roles ([[aria.getRole]], [[aria.hasRole]], [[aria.setRole]],
 *    [[aria.removeRole]])
 *    Used for manipulating roles.
 *  - states ([[aria.getState]], [[aria.hasState]], [[aria.setState]],
 *    [[aria.removeState]])
 *    States can be set with either strings (`"true"` or `"false"`), with
 *    booleans (`true` or `false`), with numbers (`1` or `0`) or with nothing
 *    (which assumes `true`). Getting a state returns a boolean if the state is
 *    set or `undefined` if the state is not.
 *
 *  Most other functions in [[aria]] are helpful wrappers for these functions,
 *  usually with pre-defined arguments.
 *
 *  Additionally, [[aria.each]] can be used to affect multiple elements at the
 *  same time.
 **/
define([
    "lib/util",
    "lib/aria/core",
    "lib/aria/helpers",
    "lib/aria/references",
    "lib/aria/roles",
    "lib/aria/states"
], function (
    util,
    core,
    helpers,
    references,
    roles,
    states
) {

    "use strict";

    var aria = {};

    util.Object.assign(
        aria,
        core,
        helpers,
        references,
        roles,
        states
    );

    /**
     *  area.each(elements, method, ...args) -> Array
     *  - elements (Array): Elements to affect.
     *  - method (String): Method to call.
     *  - args (?): Arguments to pass to `method`.
     *
     *  Executes an [[aria]] method on multiple elements at once. The `elements`
     *  may be any iterable object, such as an `Array` or a `NodeList`. For
     *  example, this call will make all elements with the "one" class
     *  focusable (see [[aria.makeFocusable]]).
     *
     *      aria.each(dom.byClass("one"), "makeFocusable");
     *
     *  Arguments may be passed to the method by adding them to the method call.
     *  For example, this call will give all elements with the "two" class the
     *  WAI-ARIA property "label" and set it to `true` (see
     *  [[aria.setProperty]]).
     *
     *      aria.each(dom.byClass("two"), "setProperty", "label", true);
     *
     *  As the method is executed on each element, the results are recorded and
     *  returned as an array. For example, this will get the "label" properties
     *  of all elements with the "three" class (see [[aria.getProperty]]).
     *
     *      aria.each(dom.byClass("three"), "getProperty", "label");
     *      // -> ["true", "true", "true" ... ]
     *
     **/
    aria.each = util.Array.makeInvoker(aria);

    return Object.freeze(aria);

});
