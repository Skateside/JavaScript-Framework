/**
 *  util.String
 *
 *  Namespace for all String functions.
 **/
define([
    "lib/util/core"
], function (
    core
) {

    "use strict";

    var string = {};
    var seed = 123456789 + core.randInt(Date.now());

    /**
     *  util.String.SUPPLANT_PATTERN = /(^|.|\r|\n)(\$\{(.*?)\})/g
     *
     *  The default pattern used in [[util.String.supplant]].
     **/
    const SUPPLANT_PATTERN = /(^|.|\r|\n)(\$\{(.*?)\})/g;

    /**
     *  util.String.interpret(string) -> String
     *  - string (?): Object to interpret as a string.
     *
     *  Identifies the given `string` as a string.
     *
     *      util.String.interpret("abc"); // -> "abc"
     *      util.String.interpret(123);   // -> "123"
     *
     *  This is frequently done by executing the `toString` method (if there is
     *  one). Many native types already have a `toString` method.
     *
     *      var custom = {
     *          toString: function () {
     *              return "hi";
     *          }
     *      };
     *      util.String.interpret(custom); // -> "hi"
     *      util.String.interpret({});     // -> "[object Object]"
     *      util.String.interpret([1, 2]); // -> "1,2"
     *
     *  If `null` or `undefined` are passed, an empty string is returned.
     *
     *      util.String.interpret(null);      // -> ""
     *      util.String.interpret(undefined); // -> ""
     *      util.String.interpret();          // -> ""
     *
     **/
    var interpret = function (string) {

        return (string === undefined || string === null)
            ? ""
            : String(string);

    };

    /**
     *  util.String.isStringy(string) -> Boolean
     *  - string (?): String to test.
     *
     *  Tests to see if the given `string` is stringy (can be used with the
     *  [[util.String]] methods).
     *
     *      util.String.isStringy(""); // -> true
     *      util.String.isStringy(10); // -> true
     *      util.String.isStringy([]); // -> false
     *
     **/
    var isStringy = function (string) {
        return typeof string === "string" || typeof string === "number";
    };

    /** alias of: util.String.camelize
     *  util.String.camelise(string, hyphens = "-_") -> String
     *  - string (String): String to convert.
     *  - hyphens (String): Hyphens to remove.
     *
     *  Converts a hyphenated string into a camelCase one.
     *
     *      util.String.camelise("font-family"); // -> "fontFamily"
     *
     *  A hyphenated string is considered to be one that has words separated by
     *  a hyphen (`-`) or an underscore (`_`).
     *
     *      util.String.camelise("font_family"); // -> "fontFamily"
     *
     *  The hyphens can be defined by passing them in as string. These will
     *  replace the default hyphens.
     *
     *      util.String.camelise("font+family", "+"); // -> "fontFamily"
     *
     **/
    function camelise(string, hyphens) {

        var str = interpret(string);
        var chars = typeof hyphens === "string"
            ? hyphens
            : "-_";
        var breaker = new RegExp(
            "[" + core.escapeRegExp(chars) + "]([a-z])",
            "gi"
        );

        return str.replace(breaker, function (ignore, start) {
            return start.toUpperCase();
        });

    }

    /**
     *  util.String.hyphenate(str[, hyphen = "-"]) -> String
     *  - str (String): String to hyphenate.
     *  - hyphen (String): Hyphen character.
     *
     *  Converts a camelCase string into a hyphenated one.
     *
     *      util.String.hyphenate("fontFamily"); // -> "font-family"
     *
     *  The hyphen character can be defined to allow for a different
     *  substitution. If ommitted, or a string is not provided, a hyphen (`-`)
     *  is assumed.
     *
     *      util.String.hyphenate("fontFamily", "=");   // -> "font=family"
     *      util.String.hyphenate("fontFamily", 4);     // -> "font-family"
     *      util.String.hyphenate("fontFamily", "---"); // -> "font---family"
     *
     **/
    function hyphenate(str, hyphen) {

        if (typeof hyphen !== "string") {
            hyphen = "-";
        }

        return interpret(str).replace(
            /([a-z])([A-Z])/g,
            function (ignore, lower, upper) {
                return lower + hyphen + upper.toLowerCase();
            }
        );

    }

    /**
     *  util.String.supplant(string, replacements[, pattern]) -> String
     *  - string (String): String to supplant.
     *  - replacements (Object): Replacements for the string.
     *  - pattern (RegExp): Optional pattern for the placeholders.
     *
     *  Replaces the placeholders in the given `string` with the properties in
     *  the `replacements` object.
     *
     *      var string = "Hello ${world}";
     *      var reps = {world: "you"};
     *      util.String.supplant(string, reps); // -> "Hello you"
     *
     *  Placeholders can appear multiple times within the string.
     *
     *      var string = "Hello ${world} ${world}";
     *      var reps = {world: "you"};
     *      util.String.supplant(string, reps); // -> "Hello you you"
     *
     *  Placeholders can be escaped with `"\\"`.
     *
     *      var string = "Hello \\${world} ${world}";
     *      var reps = {world: "you"};
     *      util.String.supplant(string, reps); // -> "Hello ${world} you"
     *
     *  If the placeholder property isn't found, or the value isn't stringy (see
     *  [[util.String.isStringy]]) then the placeholder is left in place.
     *
     *      util.String.supplant(string, {nothing: "you"});
     *      // -> "Hello ${world}"
     *      util.String.supplant(string, {world: []});
     *      // -> "Hello ${world}"
     *
     *  The pattern for the placeholders can be defined by passing a regular
     *  expression as the `pattern` argument (if ommitted,
     *  [[util.String.SUPPLANT_PATTERN]] is used). The pattern should match 3
     *  parts and be global (have the `g` flag). The three parts are:
     *
     *  -   The prefix before the placeholder.
     *  -   The whole placeholder.
     *  -   The placeholder text.
     *
     *  To better understand this, here is the regular expression for the
     *  default pattern.
     *
     *      var pattern = /(^|.|\r|\n)(\$\{(.*?)\})/g;
     *
     *  Here's an example of using this function with double braces.
     *
     *      var string = "Hello \\{{world}} {{world}}";
     *      var reps = {world: "you"};
     *      var ptrn = /(^|.|\r|\n)(\{\{(.*?)\}\})/;
     *      util.String.supplant(string, reps, ptrn);
     *      // -> "Hello {{world}} you"
     *
     **/
    function supplant(string, replacements, pattern) {

        string = interpret(string);
        replacements = replacements || {};

        if (!core.isRegExp(pattern)) {
            pattern = SUPPLANT_PATTERN;
        }

        return string.replace(pattern, function (ignore, prefix, whole, key) {

            var replacement = isStringy(replacements[key])
                ? replacements[key]
                : whole;

            return prefix === "\\"
                ? whole
                : prefix + replacement;

        });

    }

    /**
     *  util.String.toUpperFirst(str) -> String
     *  - str (String): String to convert.
     *
     *  Converts a string so that the first character is upper case.
     *
     *      util.String.toUpperFirst('Abc'); // -> "Abc"
     *      util.String.toUpperFirst('abc'); // -> "Abc"
     *      util.String.toUpperFirst('ABC'); // -> "ABC"
     *
     **/
    function toUpperFirst(str, lowerOthers) {

        var string = interpret(str);

        return string.charAt(0).toUpperCase() + string.slice(1);

    }

    /**
     *  util.String.uniqid([prefix]) -> String
     *  - prefix (String): Optional prefix for the unique ID.
     *
     *  Creates a unique ID.
     *
     *      util.String.uniqid();
     *      // -> something like "ifo52wa059tdtfpj"
     *      util.String.uniqid();
     *      // -> something like "ifo52zhw59tdtfpk"
     *      util.String.uniqid();
     *      // -> something like "ifo52zun59tdtfpl"
     *
     *  Optionally a prefix can be given.
     *
     *      util.String.uniqid("prefix-");
     *      // -> something like "prefix-ifo53mv259tdtfpm"
     *      util.String.uniqid("prefix-");
     *      // -> something like "prefix-ifo53n3059tdtfpn"
     *      util.String.uniqid("prefix-");
     *      // -> something like "prefix-ifo53nan59tdtfpo"
     *
     *  If the prefix isn't stringy (see [[util.String.isStringy]]), it is
     *  ignored.
     *
     *      util.String.uniqid([]);
     *      // -> something like "ifo5daf959tdtfpp"
     *      util.String.uniqid(util.Function.identity);
     *      // -> something like "ifo5danv59tdtfpq"
     *      util.String.uniqid({});
     *      // -> something like "ifo5db3t59tdtfpr"
     *
     *  It can't be guarenteed that the first character of the unique ID will be
     *  a letter as opposed to a number. Passing in a prefix can solve that.
     **/
    function uniqid(prefix) {

        if (!isStringy(prefix)) {
            prefix = "";
        }

        seed += 1;

        return prefix + Date.now().toString(36) + seed.toString(36);

    }

    core.assign(string, {

        camelise: camelise,
        hyphenate: hyphenate,
        interpret: interpret,
        isStringy: isStringy,
        supplant: supplant,
        SUPPLANT_PATTERN: SUPPLANT_PATTERN,
        toUpperFirst: toUpperFirst,
        uniqid: uniqid,

        /** alias of: util.String.camelise
         *  util.String.camelize(string, hyphens = "-_") -> String
         *  - string (String): String to convert.
         *  - hyphens (String): Hyphens to remove.
         *
         *  An alias of [[util.String.camelise]] to aid developers used to
         *  American English.
         **/
        camelize: camelise

    });

    return Object.freeze(string);

});
