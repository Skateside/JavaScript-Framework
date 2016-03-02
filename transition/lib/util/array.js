/**
 *  util.Array
 *
 *  Namespace for all Array functions.
 **/
define([
    "./lib/util/core"
], function (
    core
) {

    var array = {};

    /**
     *  util.Array.every(array, handler[, context]) -> Boolean
     *  - array (Array): Array to test.
     *  - handler (Function): Function for testing.
     *  - context (Object): Optional context for `handler`.
     *
     *  Identical to the native `[].every()` with the exception that it will
     *  work on any iterable object, not just arrays.
     *
     *      var divs = document.getElementsByTagName('div');
     *      function isDiv(div) {
     *          return div.nodeNode.toLowerCase() === 'div';
     *      }
     *      divs.every(isDiv); // -> TypeError: divs.every is not a function
     *      util.Array.every(divs, isDiv); // -> true
     *
     **/
    var every = Array.every || function (array, handler, context) {
        return Array.prototype.every.call(array, handler, context);
    };

    /**
     *  util.Array.filter(array, handler[, context]) -> Boolean
     *  - array (Array): Array to test.
     *  - handler (Function): Function for testing.
     *  - context (Object): Optional context for `handler`.
     *
     *  Identical to the native `[].filter()` with the exception that it
     *  will work on any iterable object, not just arrays.
     *
     *      var divs = document.querySelectorAll('div, section');
     *      function isDiv(div) {
     *          return div.nodeNode.toLowerCase() === 'div';
     *      }
     *      divs.filter(isDiv);
     *      // -> TypeError: divs.filter is not a function
     *      util.Array.filter(divs, isDiv);
     *      // -> [<div>, <div>, <div>, ...]
     *
     **/
    var filter = Array.filter || function (array, handler, context) {
        return Array.prototype.filter.call(array, handler, context);
    };

    /**
     *  util.Array.forEach(array, handler[, context]) -> Boolean
     *  - array (Array): Array to test.
     *  - handler (Function): Function for testing.
     *  - context (Object): Optional context for `handler`.
     *
     *  Identical to the native `[].forEach()` with the exception that it
     *  will work on any iterable object, not just arrays.
     *
     *      var divs = document.getElementsByTagName('div');
     *      function logNodeName(div) {
     *          console.log(div.nodeNode.toLowerCase());
     *      }
     *      divs.forEach(logNodeName);
     *      // -> TypeError: divs.forEach is not a function
     *      util.Array.forEach(divs, logNodeName);
     *      // -> logs: "div"
     *      // -> logs: "div"
     *      // -> logs: "div"
     *      // -> ...
     *
     **/
    var forEach = Array.forEach || function (array, handler, context) {
        return Array.prototype.forEach.call(array, handler, context);
    };

    /**
     *  util.Array.map(array, handler[, context]) -> Boolean
     *  - array (Array): Array to test.
     *  - handler (Function): Function for testing.
     *  - context (Object): Optional context for `handler`.
     *
     *  Identical to the native `[].map()` with the exception that it will
     *  work on any iterable object, not just arrays.
     *
     *      var divs = document.getElementsByTagName('div');
     *      function getNodeName(div) {
     *          return div.nodeNode.toLowerCase();
     *      }
     *      divs.map(getNodeName);
     *      // -> TypeError: divs.map is not a function
     *      util.Array.map(divs, getNodeName);
     *      // -> ['div', 'div', 'div', ...]
     *
     **/
    var map = Array.map || function (array, handler, context) {
        return Array.prototype.map.call(array, handler, context);
    };

    /**
     *  util.Array.some(array, handler[, context]) -> Boolean
     *  - array (Array): Array to test.
     *  - handler (Function): Function for testing.
     *  - context (Object): Optional context for `handler`.
     *
     *  Identical to the native `[].some()` with the exception that it will
     *  work on any iterable object, not just arrays.
     *
     *      var divs = document.querySelectorAll('div, section');
     *      function isDiv(div) {
     *          return div.nodeNode.toLowerCase() === 'div';
     *      }
     *      divs.some(isDiv); // -> TypeError: divs.some is not a function
     *      util.Array.some(divs, isDiv); // -> true
     *
     **/
    var some = Array.some || function (array, handler, context) {
        return Array.prototype.some.call(array, handler, context);
    };

    /**
     *  util.Array.unique(array) -> Array
     *  - array (Array): Array that should be reduced.
     *
     *  Reduces an array so that only unique entries remain.
     *
     *      util.Array.unique([1, 2, 1, 3, 1, 4, 2, 5]);
     *      // -> [1, 2, 3, 4, 5]
     *
     *  This method also works on array-like structures.
     *
     *      util.Array.unique('mississippi');
     *      // -> ['m', 'i', 's', 'p']
     *
     **/
    var unique = function (array) {

        return core
            .arrayFrom(array)
            .reduce(function (prev, curr) {

                if (prev.indexOf(curr) < 0) {
                    prev.push(curr);
                }

                return prev;

            }, []);

    };

    /**
     *  util.Array.chunk(array, size[, map[, context]]) -> Array
     *  - array (Array): Array to group.
     *  - size (Number): Maximum size of the groups.
     *  - map (Function): Optional conversion for the groups.
     *  - context (?): Optional context for the optional map.
     *
     *  Divides an array into groups of `size` length or smaller.
     *
     *      util.Array.chunk([1, 2, 3, 4, 5], 3); // -> [[1, 2, 3], [4, 5]]
     *
     *  The method works on array-like objects as well as arrays.
     *
     *      util.Array.chunk("12345", 3); // -> [["1", "2", "3"], ["4", "5"]]
     *
     *  An optional map can be passed to convert the array items before they're
     *  put into groups.
     *
     *      util.Array.chunk("12345", 3, util.Number.toPosInt);
     *      // -> [[1, 2, 3], [4, 5]]
     *
     **/
    function chunk(array, size, map, context) {

        var chunked = [];
        var arr = arrayFrom(array, map, context);
        var i = 0;
        var il = arr.length;
        var amount = toPosInt(size) || 1;

        while (i < il) {

            chunked.push(arr.slice(i, i + amount));
            i += amount;

        }

        return chunked;

    }

    /**
     *  util.Array.common(array1, ...arrays) -> Array
     *  - array (Array): Original array to compare.
     *  - arrays (Array): Arrays to compare against the original.
     *
     *  This method returns an array of all the entries that appear in `array1`
     *  that also appear in all the other arrays.
     *
     *      util.Array.common([1, 2, 3, 4, 5], [1, 2]);         // -> [1, 2]
     *      util.Array.common([1, 2, 3, 4, 5], [1, 2], [2, 3]); // -> [2]
     *
     *  Each entry in the results will only appear once (in the order in which
     *  they were first encountered) - see [[util.Array.unique]] for full
     *  details.
     **/
    function common(array, ...arrays) {

        return unique(arrays.reduce(function (array1, array2) {

            var arr = core.arrayFrom(array2);

            return core
                .arrayFrom(array1)
                .filter(function (entry) {
                    return arr.indexOf(entry) > -1;
                });

        }, core.arrayFrom(array)));

    }

    /**
     *  util.Array.diff(array1, ...arrays) -> Array
     *  - array (Array): Original array to compare.
     *  - arrays (Array): Additional arrays to compare against.
     *
     *  This method returns an array of all the entries that appear in `array1`
     *  and do not appear in any other array in `arrays`.
     *
     *      util.Array.diff([1, 2, 3, 4, 5], [1, 2]);            // -> [3, 4, 5]
     *      util.Array.diff([1, 2, 3, 4, 5], [1, 2], [4, 5]);    // -> [3]
     *      util.Array.diff([1, 2, 3, 4, 5], [1, 2, 3], [4, 5]); // -> []
     *
     *  Each entry in the results will only appear once (in the order in which
     *  they were first encountered) - see [[util.Array.unique]] for full
     *  details.
     **/
    function diff(array, ...arrays) {

        return unique(arrays.reduce(function (array1, array2) {

            var arr = core.arrayFrom(array2);

            return core
                .arrayFrom(array1)
                .filter(function (entry) {
                    return arr.indexOf(entry) < 0;
                });

        }, core.arrayFrom(array)));

    }

    /**
     *  util.Array.first(array[, handler[, context]]) -> ?
     *  - array (Array): Array whose first entry should be returned.
     *  - handler (Function): Optional filter function.
     *  - context (?): Optional context for the optional handler.
     *
     *  Returns the first entry in an array. If a `handler` is provided, the
     *  first matching entry is returned.
     *
     *      var array = ['one', 2, 'three', 4, 'five'];
     *      util.Array.first(array);                        // -> "one"
     *      util.Array.first(array, util.Number.isNumeric); // -> 2
     *
     *  If `array` isn't iterable, or if no match is found, `undefined` is
     *  returned.
     *
     *      util.Array.first({});                             // -> undefined
     *      util.Array.first(['one'], util.Number.isNumeric); // -> undefined
     *
     *  To get the last entry in an array, use [[util.Array.last]].
     **/
    function first(array, handler, context) {

        return core.getType(handler) === "function"
            ? first(filter(array, handler, context))
            : core.isArrayLike(array)
                ? array[0]
                : undefined;

    }

    /**
     *  util.Array.invoke(array, method[, ...args]) -> Array
     *  - array (Array): Array over which to iterate.
     *  - method (String): Function to execute on each entry of the array.
     *  - args (?): Optional arguments to be passed to the function.
     *
     *  Executes a method on all entries of an array or array-like object.
     *  Additional arguments for the invokation may be passed as additional
     *  arguments to `invoke`. The original array is untouched although the
     *  function called using `invoke` may mutate the entries.
     *
     *      var array = ['one', 'two', 'three'];
     *      util.Array.invoke(array, 'toUpperCase'); // -> ['ONE', 'TWO', THREE']
     *      util.Array.invoke(array, 'slice', 1); // -> ['ne', 'wo', 'hree']
     *
     *  To get a property rather than executing a method, use the
     *  [[util.Array.pluck]] method.
     **/
    function invoke(array, method, ...args) {

        return map(array, function (entry) {
            return entry[method].apply(entry, args);
        });

    }

    /**
     *  util.Array.last(array[, handler[, context]]) -> ?
     *  - array (Array): Array whose last entry should be returned.
     *  - handler (Function): Optional filter function.
     *  - context (?): Optional context for the optional handler.
     *
     *  Returns the last entry in an array. If a `handler` is provided, the last
     *  matching entry is returned.
     *
     *      var array = ['one', 2, 'three', 4, 'five'];
     *      util.Array.last(array);                        // -> "five"
     *      util.Array.last(array, util.Number.isNumeric); // -> 4
     *
     *  If `array` isn't iterable, or if no match is found, `undefined` is
     *  returned.
     *
     *      util.Array.last({});                             // -> undefined
     *      util.Array.last(['one'], util.Number.isNumeric); // -> undefined
     *
     *  To get the last entry in an array, use [[util.Array.first]].
     **/
    function last(array, handler, context) {

        return core.getType(handler) === "function"
            ? last(filter(array, handler, context))
            : core.isArrayLike(array)
                ? array[array.length - 1]
                : undefined;

    }

    /**
     *  util.Array.makeInvoker(context) -> Function
     *  - context (Object): Context for the invoker.
     *
     *  Creates a function similar to [[util.Array.invoke]] but bound to a
     *  certain context. This fires the context's method for each entry of the
     *  array, rather than a method on the array entry itself.
     *
     *      var obj = {
     *          add: function (a, b) {
     *              return a + b;
     *          },
     *          add5: function (a) {
     *              return this.add(a, 5);
     *          }
     *      };
     *      var invoke = util.Array.makeInvoker(obj);
     *      invoke([1, 2, 3], 'add5'); // -> [6, 7, 8]
     *
     **/
    function makeInvoker(context) {

        return function (array, method, ...args) {

            return map(array, function (entry) {
                return context[method].apply(context, [entry].concat(args));
            });

        };

    }

    /**
     *  util.Array.pluck(array, property) -> Array
     *  util.Array.pluck(array, property, value) -> Object
     *  - array (Array): Array to iterate over.
     *  - property (String): Property to retrieve.
     *  - value (String): Property name.
     *
     *  This method gets a property from the entries in an util.array.
     *
     *      util.Array.pluck(["one", "two", "three", "four"], "length");
     *      // -> [3, 3, 5, 4]
     *      util.Array.pluck(["one", "two", "three", "four"], "not-real");
     *      // -> [undefined, undefined, undefined, undefined]
     *
     *  If a `value` is provided, an `Object` is returned rather than an
     *  `Array`, the `Object` is a key/value set based on the entries in the
     *  array, with the `Object`'s keys being the `property` and the values
     *  being `value.
     *
     *      var arr = [
     *          {name: "foo", value: 1},
     *          {name: "bar", value: 2},
     *          {name: "baz", value: 3}
     *      ];
     *      util.Array.pluck(arr, "name", "value");
     *      // -> {foo: 1, bar: 2, baz: 3}
     *
     *  When using the `value` argument, beware that repeated `property`s will
     *  replace existing ones.
     *
     *      var arr = [
     *          {name: "foo", value: 1},
     *          {name: "bar", value: 2},
     *          {name: "foo", value: 3}
     *      ];
     *      util.Array.pluck(arr, "name", "value");
     *      // -> {foo: 3, bar: 2}
     *
     *  To execute a method rather than accessing a property, use the
     *  [[util.Array.invoke]] method.
     **/
    function pluck(array, property, value) {

        var plucked = {};

        if (typeof value === "string") {

            forEach(array, function (entry) {
                plucked[entry[property]] = entry[value];
            });

        } else {

            plucked = map(array, function (entry) {
                return entry[property];
            });

        }

        return plucked;

    }

    /**
     *  util.Array.shuffle(array) -> Array
     *  - array (Array): Array to shuffle.
     *
     *  Shuffles the entries of an array or array-like object. The original
     *  array remains unchanged. The shuffling algorythm is the [Fisher-Yates
     *  Shuffle](http://bost.ocks.org/mike/shuffle/).
     *
     *      var array = [1, 2, 3, 4, 5, 6, 7];
     *      util.Array.shuffle(array); // -> [4, 7, 1, 5, 2, 3, 6] possibly
     *
     **/
    function shuffle(array) {

        var shuffled = core.arrayFrom(array),
            length = shuffled.length,
            index = 0,
            temp = undefined;

        while (length) {

            //index = Math.floor(Math.random() * length);
            index = core.randInt(length);
            length -= 1;

            temp = shuffled[length];
            shuffled[length] = shuffled[index];
            shuffled[index] = temp;

        }

        return shuffled;

    }

    core.assign(array, {
        chunk,
        common,
        diff,
        every,
        filter,
        first,
        forEach,
        from: core.arrayFrom,
        invoke,
        isArrayLike: core.isArrayLike
        last,
        makeInvoker,
        map,
        pluck,
        shuffle,
        some,
        unique
    });

    return Object.freeze(array);

});
