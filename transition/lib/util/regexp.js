/**
 *  util.RegExp
 *
 *  Namespace for all RegExp functions.
 **/
define([
    "./lib/util/core"
], function (
    core
) {

    "use strict";

    var regexp = {};

    /**
     *  util.RegExp.isRegExp(reg) -> Boolean
     *  - reg (?): Object to test.
     *
     *  Tests to see if the given `reg` is a regular expression.
     *
     *      util.RegExp.isRegExp(/\s/); // -> true
     *      util.RegExp.isRegExp('\s'); // -> false
     *
     **/
    function isRegExp(reg) {
        return reg instanceof RegExp;
    }

    core.assign(regexp, {
        escape: core.escapeRegExp,
        isRegExp
    });

    return Object.freeze(regexp);

});
