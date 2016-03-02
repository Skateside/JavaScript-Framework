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
     *  util.Object.owns(object, property) -> Boolean
     *  - object (Object): Object to test.
     *  - property (String): Property to check.
     *
     *  Tests whether an object has the given property.
     *
     *      var object1 = { foo: 1 };
     *      var object2 = Object.create(object1);
     *      object2.bar = 2;
     *      util.Object.owns(object1, "foo"); // -> true
     *      util.Object.owns(object1, "bar"); // -> false
     *      util.Object.owns(object2, "foo"); // -> false
     *      util.Object.owns(object2, "var"); // -> true
     *
     **/
    var owns = function (object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
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
            && typeof object === 'object'
            && object !== window
            && !object.nodeType
        );

        if (isPlain) {

            try {

                if (
                    !object.constructor
                    || !owns(object.constructor.prototype, 'isPrototypeOf')
                ) {
                    isPlain = false;
                }

            } catch (ignore) {
            }

        }

        return isPlain;

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

        Object.getOwnPropertyNames(source).forEach(function (property) {

            var orig = source[property];
            var desc = Object.getOwnPropertyDescriptor(source, property);
            var value = (core.isArrayLike(orig) || isPlainObject(orig))
                ? clone(orig)
                : orig;
            var definition = core.assign(desc, {
                value
            });

            Object.defineProperty(copy, property, definition);

        });

        return core.isArrayLike(source)
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

    core.assign(object, {
        assign: core.assign,
        clone,
        getType: core.getType,
        isPlainObject,
        looksLike,
        owns
    });

    return Object.freeze(object);

});
