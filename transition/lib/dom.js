define([
    "./lib/util",
    "./lib/dom/core",
    "./lib/dom/attributes",
    "./lib/dom/classes",
    "./lib/dom/data",
    "./lib/dom/events",
    "./lib/dom/lookups",
    "./lib/dom/manipulations",
    "./lib/dom/support",
    "./lib/dom/traversal"
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

    return Object.freeze(util.Object.assign(
        {},
        core,
        attributes,
        classes,
        data,
        events,
        lookups,
        manipulations,
        support,
        traversal
    ));

});
