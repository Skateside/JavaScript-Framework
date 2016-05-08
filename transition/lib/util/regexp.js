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
     *  util.RegExp.interpret(regexp) -> RegExp
     *  - regexp (?): Object to interpret as a regular expression.
     *
     *  Interprets the given `regexp` as a `RegExp`.
     **/
    function interpret(regexp) {

        return core.isRegExp(regexp)
            ? regexp
            : /(?:)/;

    }

    core.assign(regexp, {
        escape: core.escapeRegExp,
        interpret,
        isRegExp: core.isRegExp
    });

    return Object.freeze(regexp);

});
