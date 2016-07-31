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
     *  util.String.CLIP_LEFT = "left"
     *
     *  Direction possibility for [[util.String.clip]].
     **/
    const CLIP_LEFT = "left";

    /**
     *  util.String.CLIP_RIGHT = "right"
     *
     *  Direction possibility for [[util.String.clip]].
     **/
    const CLIP_RIGHT = "right";

    /**
     *  util.String.CLIP_BOTH = "both"
     *
     *  Direction possibility for [[util.String.clip]].
     **/
    const CLIP_BOTH = "both";

    /**
     *  util.String.PAD_LEFT = "left"
     *
     *  Direction possibility for [[util.String.pad]].
     **/
    const PAD_LEFT = "left";

    /**
     *  util.String.PAD_RIGHT = "right"
     *
     *  Direction possibility for [[util.String.pad]].
     **/
    const PAD_RIGHT = "right";

    /**
     *  util.String.PAD_BOTH = "both"
     *
     *  Direction possibility for [[util.String.pad]].
     **/
    const PAD_BOTH = "both";

    /**
     *  util.String.PAD_DEFAULT = "0"
     *
     *  Default padding for [[util.String.pad]].
     **/
    const PAD_DEFAULT = "0";

    // Handy short-cut.
    var interpret = core.stringInterpret;

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

    /**
     *  util.String.repeat(string, times) -> String
     *  - string (String): String to repeat.
     *  - times (Number): Number of times to repeat `string`.
     *
     *  Repeats `string` `times` many times.
     *
     *      util.String.repeat("abc", 3); // -> "abcabcabc";
     *
     *  If `times` is negative, a `RangeError` is thrown.
     *
     *      util.String.repeat("abc", -3); // throws RangeError
     *
     **/
    var repeat = core.owns(String.prototype, "repeat")
        ? function (string, times) {
            return String(string).repeat(times);
        }
        : function (string, times) {

            times = +times || 0;

            if (times < 0) {
                throw new RangeError("times must be positive");
            }

            return Array(times + 1).join(string);

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
     *  util.String.clip(string, length[, direction = util.String.CLIP_RIGHT]) -> String
     *  - string (String): String to clip.
     *  - length (Number): Maximum length for the returned string.
     *  - direction (String): Optional direction for the clipping.
     *
     *  Clips `string` to that it is no longer than `length`. If `length` is
     *  larger than the length of `string`, no action is taken.
     *
     *      util.String.clip("abcdefg", 3); // -> "abc"
     *      util.String.clip("abcdefg", 9); // -> "abcdefg"
     *
     *  The clipping takes place from the right by default. To change this,
     *  there are other possible values for `direction`:
     *
     *  ## [[util.String.CLIP_RIGHT]] (default)
     *
     *  Clips the string from the right.
     *
     *      util.String.clip("abcdefg", 3, util.String.CLIP_RIGHT); // -> "abc"
     *
     *  ## [[util.String.CLIP_LEFT]]
     *
     *  Clips the string from the left.
     *
     *      util.String.clip("abcdefg", 3, util.String.CLIP_LEFT); // -> "efg"
     *
     *  ## [[util.String.CLIP_BOTH]]
     *
     *  Clips the string from either side equally.
     *
     *      util.String.clip("abcdefg", 3, util.String.CLIP_BOTH); // -> "cde"
     *
     *  If it is not possible to remove an equal number of characters from both
     *  sides, the additional character is removed from the right.
     *
     *      util.String.clip("abcdefg", 4, util.String.CLIP_BOTH); // -> "bcde"
     *
     **/
    function clip(string, length, direction) {

        var str = interpret(string);
        var len = +length || str.length;
        var dif = str.length - len;

        if (dif > 0) {

            switch (direction) {

            case CLIP_LEFT:
                str = str.slice(dif);
                break;

            case CLIP_BOTH:

                dif = Math.floor(dif / 2);
                str = str.slice(dif, len + dif);

                break;

            //case CLIP_RIGHT:
            default:
                str = str.slice(0, len);

            }

        }

        return str;

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
     *  util.String.pad(string, length[, padding = util.String.PAD_DEFAULT[, direction = util.String.PAD_RIGHT]]) -> String
     *  - string (String): String to pad.
     *  - length (Number): Minimum length for the padded string.
     *  - padding (String): Optional padding.
     *  - direction (String): Optional direction for the padding.
     *
     *  Pads `string` until it is at least `length` characters long. By default,
     *  the padding is added to the right. If `length` is less than or equal to
     *  the length of `string` already, no action is taken.
     *
     *      util.String.pad("abcde", 9); // -> "abcde0000"
     *      util.String.pad("abcde", 4); // -> "abcde"
     *
     *  The string used for padding can be defined by passing a value as the
     *  `padding` argument.
     *
     *      util.String.pad("abcde", 9, "-"); // -> "abcde----"
     *
     *  Multiple characters can be used for padding. The resulting string will
     *  only be a long as `length`.
     *
     *      util.String.pad("abcde", 9, "-=");    // -> "abcde-=-="
     *      util.String.pad("abcde", 9, "-=+^*"); // -> "abcde-=+^"
     *
     *  If `padding` cannot be identified as a string, or is an empty string,
     *  [[util.String.PAD_DEFAULT]] (`"0"`) is used.
     *
     *      util.String.pad("abcde", 9, "");   // -> "abcde0000"
     *      util.String.pad("abcde", 9, null); // -> "abcde0000"
     *
     *  To change the side to which the padding is applied, there are a few
     *  values that can be passed as the direction.
     *
     *  ## [[util.String.PAD_RIGHT]] (default)
     *
     *  Adds the padding to the right side of `string`.
     *
     *      util.String.pad("abcde", 9, "-", util.String.PAD_RIGHT);
     *      // -> "abcde----"
     *      util.String.pad("abcde", 9, "-=+^*", util.String.PAD_RIGHT);
     *      // -> "abcde-=+^"
     *
     *  ## [[util.String.PAD_LEFT]]
     *
     *  Adds the padding to the left side of `string`.
     *
     *      util.String.pad("abcde", 9, "-", util.String.PAD_LEFT);
     *      // -> "----abcde"
     *      util.String.pad("abcde", 9, "-=+^*", util.String.PAD_LEFT);
     *      // -> "=+^*abcde"
     *
     *  ## [[util.String.PAD_BOTH]]
     *
     *  Adds the padding to both sides of `string` equally.
     *
     *      util.String.pad("abcde", 9, "-", util.String.PAD_BOTH);
     *      // -> "--abcde--"
     *      util.String.pad("abcde", 9, "-=+^*", util.String.PAD_BOTH);
     *      // -> "^*abcde-="
     *
     *  If the padding cannot be applied to both sides equally, the additional
     *  character is applied to the right side.
     *
     *      util.String.pad("abcde", 8, "-", util.String.PAD_BOTH);
     *      // -> "-abcde--"
     *
     **/
    function pad(string, length, padding, direction) {

        var str = interpret(string);
        var len = +length || 0;
        var pad = interpret(padding) || PAD_DEFAULT;
        var rep;

        if (len - str.length > 0) {

            rep = repeat(pad, len);

            switch (direction) {

            case PAD_LEFT:
                str = clip(rep + str, len, CLIP_LEFT);
                break;

            case PAD_BOTH:
                str = clip(rep + str + rep, len, CLIP_BOTH);
                break;

            //case PAD_RIGHT:
            default:
                str = clip(str + rep, len, CLIP_RIGHT);

            }

        }

        return str;

    }


    /**
     *  util.String.supplant(string, replacements[, pattern = util.String.SUPPLANT_PATTERN]) -> String
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

            var value = core.objectAccess(replacements, key);
            var replacement = isStringy(value)
                ? value
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

        // constants
        CLIP_LEFT: CLIP_LEFT,
        CLIP_RIGHT: CLIP_RIGHT,
        CLIP_BOTH: CLIP_BOTH,
        PAD_LEFT: PAD_LEFT,
        PAD_RIGHT: PAD_RIGHT,
        PAD_BOTH: PAD_BOTH,
        PAD_DEFAULT: PAD_DEFAULT,
        SUPPLANT_PATTERN: SUPPLANT_PATTERN,

        // methods
        camelise: camelise,
        clip: clip,
        hyphenate: hyphenate,
        interpret: interpret,
        isStringy: isStringy,
        pad: pad,
        repeat: repeat,
        supplant: supplant,
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
