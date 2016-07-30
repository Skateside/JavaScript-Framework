/**
 *  util
 *
 *  Namespace for utility functions. This namespace contains a few other
 *  namespaces to categories the utility functions. It is designed to be
 *  easy to extend so new utility functions can be added so long as a
 *  couple of rules are followed:
 *
 *  -   The first argument should be the object to be affected or
 *      tested.
 *  -   If a function is the last argument, the context for that
 *      function should be the next argument.
 *
 *  This will keep the utility functions easy-to-use and remember.
 *
 *  Where at all possible, each of the functions are generic. This means that an
 *  array-like object will work with array utilities etc.
 **/
define([
    "lib/util/core",
    "lib/util/array",
    "lib/util/function",
    "lib/util/number",
    "lib/util/object",
    "lib/util/regexp",
    "lib/util/string"
], function (
    core,
    array,
    func,
    number,
    object,
    regexp,
    string
) {

    "use strict";

    var util = {};

    core.assign(util, {
        Array: array,
        Function: func,
        Number: number,
        Object: object,
        RegExp: regexp,
        String: string
    });

    return Object.freeze(util);

});
