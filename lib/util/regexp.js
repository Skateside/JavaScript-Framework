/**
 *  util.RegExp
 *
 *  Namespace for all RegExp functions.
 **/
define([
    "lib/util/core"
], function (
    core
) {

    "use strict";

    var regexp = {};

    /**
     *  util.RegExp.from(string[, flags]) -> RegExp
     *  - string (String): Regular expression pattern.
     *  - flags (String): Optional flags.
     *
     *  Creates a regular expression based on the given `string`. The `string`
     *  is escaped (see [[util.RegExp.escape]]) before being parsed.
     *
     *      util.RegExp.escape("\\s"); -> /\\s/
     *      util.RegExp.escape("\\s", "gm"); -> /\\s/gm
     *
     **/
    function regexpFrom(string, flags) {
        return new RegExp(core.escapeRegExp(string), flags);
    }

    /**
     *  util.RegExp.addFlags(regexp, flags) -> RegExp
     *  - regexp (RegExp): Regular expression.
     *  - flags (String): Flags to add.
     *
     *  Adds flags to the given regular expression.
     *
     *      util.RegExp.addFlags(/\s/, "g"); // -> /\s/g
     *      util.RegExp.addFlags(/\s/, "gim"); // -> /\s/gim
     *
     *  If the given regular expression already has the flags, no action is
     *  taken.
     *
     *      util.RegExp.addFlags(/\s/g, "g"); // -> /\s/g
     *
     **/
    function addFlags(regexp, flags) {

        var reg = core.interpretRegExp(regexp);
        var regFlags = core.arrayUnique(
            reg.flags.split(""),
            flags.split("")
        ).join("");

        return new RegExp(reg, regFlags);

    }

    core.assign(regexp, {
        EMPTY: core.EMPTY_REX_EXP,
        addFlags: addFlags,
        escape: core.escapeRegExp,
        from: regexpFrom,
        interpret: core.interpretRegExp,
        isRegExp: core.isRegExp,
        removeFlags: core.removeFlags
    });

    return Object.freeze(regexp);

});
