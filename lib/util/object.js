/**
 *  util.Object
 *
 *  Namespace for all Object functions.
 **/
define([
    "./lib/util/core"
], function (
    core
) {

    "use strict";

    var object = {};

    /**
     *  util.Object.interpret(object) -> Object
     *  - object (?): Object to interpret.
     *
     *  Interprets the given `object` as an `Object`. This guarentees that the
     *  returned value will work with other [[util.Object]] functions although
     *  it isn't necessary to pass variables through this method as it is
     *  frequently done behind-the-scenes in other methods.
     *
     *      util.Object.interpret("a"); // -> String{0: "a", length: 1}
     *      util.Object.interpret({foo: true}); // -> {foo: true}
     *
     **/
    var interpret = function (object) {

        var Con = object && object.constructor;
        var ret = {};

        if (!core.isFunctionNative(Con)) {
            Con = Object;
        }

        try {
            ret = new Con(object);
        } catch (ignore) {
        }

        return ret;

    };

    /**
     *  util.Object.isPlainObject(object) -> Boolean
     *  - object (?): Object to test.
     *
     *  Test to see whether or not the given `object` is a plain object.
     *
     *      util.Object.isPlainObject({}); // -> true
     *      util.Object.isPlainObject([]); // -> false
     *      util.Object.isPlainObject(null); // -> false
     *      util.Object.isPlainObject(document.body); // -> false
     *      util.Object.isPlainObject(window); // -> false
     *
     **/
    var isPlainObject = function (object) {

        var isPlain = (
            object !== null
            && typeof object === "object"
            && object !== window
        );

        if (isPlain) {

            try {

                if (
                    !object.constructor
                    || !core.owns(object.constructor.prototype, "isPrototypeOf")
                ) {
                    isPlain = false;
                }

            } catch (ignore) {
            }

        }

        return isPlain;

    };

    /**
     *  util.Object.each(object, handler[, context])
     *  - object (Object): Object over which to iterate.
     *  - handler (Function): Function to execute on each of the entries.
     *  - context (?): Optional context for `handler`.
     *
     *  A simple function that iterates over the entries in the given `object`.
     *
     *      var object = {foo: 1, bar: 2};
     *      util.Object.each(function (key, value) {
     *          console.log("%s = %d", key, value);
     *      });
     *      // logs: "foo = 1"
     *      // logs: "bar = 2"
     *
     *  Be aware that there is no ECMAScript specification that declares the
     *  order that object properties should appear in (browsers usually deliver
     *  properties in the order in which they were created) so there is no
     *  guarentee about the order of the logs in the example above.
     *
     *  Also: be aware that this only iterates over a single level and will not
     *  catch any inherited properties.
     *
     *     var parent = {foo: 1};
     *     var child = Object.create(parent);
     *     child.bar = {baz: 2};
     *     util.Object.each(function (key, value) {
     *         console.log("%s = %o", key, value);
     *     });
     *     // logs: "bar = {baz: 2}"
     *
     **/
    var each = function (object, handler, context) {

        Object.keys(interpret(object)).forEach(function (key) {
            handler.call(context, key, object[key]);
        });

    };

    /**
     *  util.Object.clone(object) -> Object
     *  - object (Object): Object to clone.
     *
     *  Creates a clone of an object such that modifying the close should not
     *  modify the original. Some attempts are made to clone deeply.
     **/
    function clone(source) {

        var copy = {};
        var interpretted = interpret(source);

        Object.getOwnPropertyNames(interpretted).forEach(function (property) {

            var orig = interpretted[property];
            var desc = Object.getOwnPropertyDescriptor(interpretted, property);
            var value = (core.isArrayLike(orig) || isPlainObject(orig))
                ? clone(orig)
                : orig;
            var definition = core.assign(desc, {
                value
            });

            Object.defineProperty(copy, property, definition);

        });

        return core.isArrayLike(interpretted)
            ? core.arrayFrom(copy)
            : copy;

    }

    /**
     *  util.Object.looksLike(object, similar) -> Boolean
     *  - object (Object): Object to check.
     *  - similar (Object): Object to test against.
     *
     *  Checks to see if the given `object` matches the description in
     *  `similar`. This works very similar to an interface checker.
     *
     *      var object = { foo: 1, bar: true };
     *      util.Object.looksLike(object, {
     *          foo: "string",
     *          bar: "boolean"
     *      });
     *      // -> true
     *
     *  `object` may have properties that `similar` does not describe, but every
     *  property described in `similar` must appear in `object`.
     *
     *      util.Object.looksLike(object, {
     *          foo: "string"
     *      });
     *      // -> true
     *      util.Object.looksLike(object, {
     *          foo: "string",
     *          baz: "number"
     *      });
     *      // -> false
     *
     *  The property descriptions are lower-case strings derived from
     *  [[util.Object.getType]], allowing `null` and arrays to be identified.
     *
     *      var object = { foo: [], bar: null }
     *      util.Object.looksLike(object, {
     *          foo: "array",
     *          bar: "null"
     *      });
     *      // -> true
     *      util.Object.looksLike(object, {
     *          foo: "object",
     *          bar: "object"
     *      });
     *      // -> false
     *
     **/
    function looksLike(object, similar) {

        return Object
            .keys(similar)
            .every(function (property) {
                return core.getType(object[property]) === similar[property];
            });

    }

    /**
     *  util.Object.pair(object[, map[, context]]) -> Array
     *  - object (Object): Object to convert.
     *  - map (Function): Optional function to convert the pairs.
     *  - context: (?): Optional context for `handler`.
     *
     *  Converts an object into an array of `key`/`value` pairs.
     *
     *      var object = {foo: 1, bar: 2};
     *      var pairs = util.Object.pair(object);
     *      // -> [{key: "foo", value: 1}, {key: "bar", values: 2}]
     *
     *  The `value` entry can contain anything and the conversion only goes a
     *  single level deep.
     *
     *     var object = {foo: {bar: 1}};
     *     var pairs = util.Object.pair(object);
     *     // -> [{key: "foo", value: {bar: 1}]
     *
     *  Be warned that manipulating the resulting object in `value` in this
     *  example will propbably manipulate the original as well (because objects
     *  in JavaScript are passed by reference).
     *
     *  ## Mapping
     *
     *  A `map` can be passed to convert the resulting objects before returning
     *  them.
     *
     *      var object = {foo: 1};
     *      var pairs = util.Object.pair(object, function (pair) {
     *          pair.key = pair.key.toUpperCase();
     *          return pair;
     *      });
     *      // -> [{key: "FOO", value: 1}]
     *
     *  Any results from the `map` must follow three rules or they will be
     *  discounted:
     *
     *  - The result must be a plain object (see [[util.Object.isPlainObject]]).
     *  - The result must have a "key" property and that must contain a string.
     *  - The result must have a "value" property.
     *
     *  Knowing these rules, `map` can be used as a filter by only returning
     *  values that should be kept.
     *
     *      var object = {foo: 1, bar: "a"};
     *      var pairs = util.Object.pair(object, function (pair) {
     *
     *          if (!util.Number.isNumeric(pair.value)) {
     *              delete pair.value;
     *          }
     *
     *          return pair;
     *
     *      });
     *      // -> [{key: "foo", value: 1}]
     *
     *  To convert the resulting pairs into objects that don't follow the rules,
     *  call `util.Object.pair` and apply a normal array `map` on the results.
     *
     *      var object = {foo: 1, bar: 2};
     *      var pairs = util.Object.pair(object).map(function (pair) {
     *          return pair.key + '=' + pair.value;
     *      });
     *      // -> ["foo=1", "bar=2]
     *
     *  ## Unpairing
     *
     *  The results of the pairing can be converted back into a plain object
     *  using [[util.Array.pluck]] since the values will always contain "key"
     *  and "value" properties.
     *
     *      var object = {foo: 1, bar: 2};
     *      var pairs = util.Object.pair(object);
     *      // -> [{key: "foo", value: 1}, {key: "bar", value: 2}];
     *      var unpaired = util.Array.pluck(pairs, "key", "value");
     *      // -> {foo: 1, bar: 2}
     *
     *  In this example, affecting `unpaired` will not affect `object`, meaning
     *  this technique can be used as a shallow cloning process. However, a much
     *  better cloning process is found in [[util.Object.clone]].
     *
     *  There are a couple of methods that already exist which convert pairs
     *  back into an object. These are [[util.Object.filter]] and
     *  [[util.Object.map]].
     **/
    function pair(object, map, context) {

        var pairs = [];

        if (typeof map !== "function") {
            map = core.identity;
        }

        each(object, function (key, value) {

            var pair = map({
                key: key,
                value: value
            });

            if (
                isPlainObject(pair)
                && core.owns(pair, "key")
                && typeof pair.key === "string"
                && core.owns(pair, "value")
            ) {
                pairs.push(pair);
            }

        });

        return pairs;

    }

    /** related to: util.Object.pair
     *  util.Object.filter(object, handler[, context]) -> Object
     *  - object (Object): Object to filter.
     *  - handler (Function): Function to filter the object.
     *  - context (?): Optional context for `handler`.
     *
     *  Filters the given `object` much the same as `Array.prototype.filter`
     *  would filter an array. The process is very similar to
     *  [[util.Object.pair]] (and the `handler` is passed a pair in the same
     *  way) but the result is converted into an object before being returned.
     *
     *      var object = {foo: 1, bar: "a"};
     *      var filtered = util.Object.filter(function (pair) {
     *          return util.Number.isNumeric(pair.value);
     *      });
     *      // -> {foo: 1}
     *
     **/
    function filter(object, handler, context) {

        return core.arrayPluck(
            pair(object).filter(handler, context),
            "key",
            "value"
        );

    }

    /** related to util.Object.pair
     *  util.Object.map(object, handler[, context]) -> Array
     *  - object (Object): Object to convert.
     *  - handler (Function): Function to convert the pairs.
     *  - context (?): Optional context for `handler`.
     *
     *  Converts the given `object` much the same as `Array.prototype.map` would
     *  convert an array. This process is very similar to [[util.Object.pair]]
     *  (and the `handler` is passed a pair in the same way) but the result is
     *  converted into an object before being returned.
     *
     *      var object = {foo: 1, bar: 2};
     *      var mapped = util.Object.map(function (pair) {
     *          pair.value *= 2;
     *          return pair;
     *      });
     *      // -> {foo: 2, bar: 4}
     *
     *  The same rules apply about the pair having to be valid when returned or
     *  it will be remove. See [[util.Object.pair]] for full details.
     **/
    function map(object, handler, context) {

        return core.arrayPluck(
            pair(object, handler, context),
            "key",
            "value"
        );

    }

    /**
     *  util.Object.isSimilar(source, compare[, isSame = false]) -> Boolean
     *  - source (Object): Source object to test.
     *  - compare (Object): Comparisson object.
     *  - isSame (Boolean): Optional flag for checking both objects.
     *
     *  Checks to see if the key/value pairs in `compare` appear in `source`.
     *  `source` may have additional properties, but this function will return
     *  `true` if it contains all the properties that `compare` has.
     *
     *      var source = { a: 1, b: 2, c: 3 };
     *      util.Object.isSimilar(source, { a: 1, b: 2 }); // -> true
     *      util.Object.isSimilar(source, { a: 1, b: 2, c: 3 }); // -> true
     *      util.Object.isSimilar(source, { a: 1, b: 3 }); // -> false
     *
     *  The function checks all object values. The object in `compare` does not
     *  need to have all the keys in `source`.
     *
     *      var nestOne = {
     *          foo: {
     *              fooOne: 1,
     *              fooTwo: 2
     *          },
     *          bar: true
     *      };
     *      var nestTwo = {
     *          foo: {
     *              fooOne: 1
     *          }
     *      };
     *      util.Object.isSimilar(nestOne, nestTwo); // -> true
     *      util.Object.isSimilar(nestOne, { foo: [] }); // -> false
     *
     *  To check that both objects contain the same keys, the `isSame` flag can
     *  be set to `true`.
     *
     *      util.Object.isSimilar(source, { a: 1, b: 2 }, true); // -> false
     *
     **/
    function isSimilar(source, compare, isSame) {

        var similar = true;

        Object.keys(compare).every(function (key) {

            var value = compare[key];
            var original = source[key];
            var matches = core.owns(source, key);

            if (matches) {

                switch (core.getType(value)) {

                case "object":
                    matches = isSimilar(original, value);
                    break;
                case "array":
                    matches = core.isArraySimilar(original, value);
                    break;
                case "nan"
                    matches = isNaN(original);
                    break;
                default:
                    matches = value === original;

                }

            }

            if (!matches) {
                similar = matches;
            }

            // Stop looking when we find the first difference.
            return similar;

        });

        if (similar && isSame) {
            similar = isSimilar(compare, source);
        }

        return similar;

    }

    // Helper function for creating query string key/value pairs.
    function toQueryPair(key, value) {

        if (value !== undefined) {

            value = core.stringInterpret(value).replace(/(\r)?\n/g, "\r\n");
            value = window.encodeURIComponent(value).replace(/%20/g, "+");

            key += "=" + value;

        }

        return key;

    }

    /**
     *  util.Object.toQuery(object) -> String
     *  - object (Object): Information to convert.
     *
     *  Converts data into query string parameters that AJAX would accept.
     *
     *      var one = {
     *          action: "ship",
     *          orderId: 123,
     *          fees: ["f1", "f2"]
     *      };
     *      util.Object.toQuery(one);
     *      // -> "action=ship&orderId=123&fees=f1&fees=f2"
     *
     *      var two = {
     *      	comment: "",
     *          "spaced key": true,
     *          related: undefined,
     *          contents: null,
     *          label: "a demo"
     *      };
     *      util.Object.toQuery(two);
     *      // -> "comment=&spaced%20key=true&related&contents=&label=a%20demo"
     *
     *      var three = {};
     *      util.Object.toQuery(three);
     *      // -> ""
     *
     **/
    function toQuery(object) {

        var query = [];

        each(object, function (key, value) {

            key = window.encodeURIComponent(key);

            if (Array.isArray(value)) {

                value.forEach(function (v) {
                    query.push(toQueryPair(key, value));
                });

            } else {
                query.push(toQueryPair(key, value));
            }


        });

        return query.join("&");

    }

    core.assign(object, {
        access: core.objectAccess,
        assign: core.assign,
        clone: clone,
        each: each,
        filter: filter,
        getType: core.getType,
        isPlainObject: isPlainObject,
        isSimilar: isSimilar,
        looksLike: looksLike,
        map: map,
        owns: core.owns,
        pair: pair,
        toQuery: toQuery
    });

    return Object.freeze(object);

});
