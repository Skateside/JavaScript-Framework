/**
 *  util.Array
 *
 *  Namespace for all Array functions.
 **/
define([
    "lib/util/core",
    "lib/util/array/sortBy"
], function (
    core,
    sortBy
) {

    var array = {};

    /**
     *  util.Array.interpret(array) -> Array
     *  - array (?): Object to interpret as an array.
     *
     *  Interprets the given `array` as an `Array`. If the `array` cannot be
     *  interpretted, an empty array is returned. Passing a variable through
     *  this function will guanrentee that it will work with all the
     *  [[util.Array]] methods.
     *
     *      util.Array.identify("abc"); // -> ["a", "b", "c"]
     *      util.Array.identify(1);     // -> ["1"]
     *      util.Array.identify();      // -> []
     *
     **/
    var interpret = function (array) {
        return core.arrayFrom(array);
    };

    /** alias of: util.Array.doWhile
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

    /** alias of: util.Array.doUntil
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
        var arr = core.arrayFrom(array, map, context);
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
            ? first(core.arrayFilter(array, handler, context))
            : core.isArrayLike(array)
                ? array[0]
                : undefined;

    }

    /**
     *  util.Array.getIndex(array, item[, offset]) -> Number
     *  - array (Array): Array to check.
     *  - item (?): Item to search for.
     *  - offset (Number): Optional offset.
     *
     *  Gets the index of `item` within `array`, returning -1 if `item` cannot
     *  be found.
     *
     *      util.Array.getIndex(["zero", "one", "two"], "one");   // -> 1
     *      util.Array.getIndex(["zero", "one", "two"], "three"); // -> -1
     *
     *  An `offset` can be defined to only check after a certain point.
     *
     *      util.Array.getIndex([1, 2, 3, 1, 2, 3], 1);    // -> 0
     *      util.Array.getIndex([1, 2, 3, 1, 2, 3], 1, 1); // -> 3
     *      util.Array.getIndex([1, 2, 3, 1, 2, 3], 1, 4); // -> -1
     *
     *  This method works on array-like structures as well.
     *
     *      util.Array.getIndex("mississippi", "i");    // -> 1
     *      util.Array.getIndex("mississippi", "i", 2); // -> 4
     *
     **/
    function getIndex(array, item, offset) {
        return Array.protoype.indexOf.call(array, item, offset);
    }

    /**
     *  util.Array.contains(array, item[, offset]) -> Boolean
     *  - array (Array): Array to check.
     *  - item (?): Item to search for.
     *  - offset (Number): Optional offset.
     *
     *  Check to see if `item` is within `array`, returning `true` if it does.
     *
     *      util.Array.contains(["one", "two", "three"], "two");  // -> true
     *      util.Array.contains(["one", "two", "three"], "four"); // -> false
     *
     *  An `offset` can be defined, which only starts checking from that point.
     *
     *      util.Array.contains(["one", "two", "three"], "two");     // -> true
     *      util.Array.contains(["one", "two", "three"], "two", 2);  // -> false
     *
     **/
    function contains(array, item, offset) {
        return getIndex(array, item, offset) > -1;
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
     *  `method` can be a path (although the function is only executed if it's
     *  found). See [[util.Object.access]] for more information.
     *
     *  To get a property rather than executing a method, use the
     *  [[util.Array.pluck]] method.
     **/
    function invoke(array, method, ...args) {

        return core.arrayMap(array, function (entry) {

            var func = core.objectAccess(entry, method);

            return typeof func === "function"
                ? func.apply(entry, args)
                : undefined;

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
            ? last(core.arrayFilter(array, handler, context))
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

            return core.arrayMap(array, function (entry) {
                return context[method].apply(context, [entry].concat(args));
            });

        };

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

        var shuffled = interpret(array),
            length = shuffled.length,
            index = 0,
            temp = undefined;

        while (length) {

            index = core.randInt(length);
            length -= 1;

            temp = shuffled[length];
            shuffled[length] = shuffled[index];
            shuffled[index] = temp;

        }

        return shuffled;

    }

    /**
     * 	util.Array.sort(array[, sorter]) -> Array
     * 	- array (Array): Array to sort.
     * 	- sorter (Function): Optional sorting function.
     *
     *  Sorts the given `array`, optionally by the defined `sorter`. Unlike the
     *  native `Array.prototype.sort`, this method does not affect the original
     *  array, returns the sorted version and will work on array-like
     *  structures.
     *
     *      var arr = [1, 7, 3, 9, 5];
     *      util.Array.sort(arr); // -> [1, 3, 5, 7, 9];
     *      // arr = [1, 7, 3, 9, 5]
     *
     *  The `sorter` will take two entries in the array and compare them. The
     *  `sorter` should return a number; if the number is 0 then no change is
     *  made, if the number is positive then the first will be after the second
     *  and if the number is negative then the second will be after the first.
     *
     *      util.Array.sort(arr, function (a, b) {
     *          return b - a;
     *      });
     *      // -> [9, 7, 5, 3, 1]
     *
     *  Although any sorting method can be used, there are a selection of
     *  pre-defined sorting methods in [[util.Array.sortBy]].
     **/
    function sort(array, sorter) {

        var sorted = interpret(array);

        sorted.sort(sorter);

        return sorted;

    }

    core.assign(array, {

        chunk: chunk,
        common: core.arrayCommon,
        diff: core.arrayDiff,
        every: every,
        filter: core.arrayFilter,
        first: first,
        forEach: core.arrayForEach,
        from: core.arrayFrom,
        interpret: interpret,
        invoke: invoke,
        isArrayLike: core.isArrayLike
        isSimilar: core.isArraySimilar,
        last: last,
        makeInvoker: makeInvoker,
        map: core.arrayMap,
        pluck: core.arrayPluck,
        remove: core.arrayRemove,
        shuffle: shuffle,
        some: some,
        sort: sort,
        sortBy: sortBy,
        unique: core.arrayUnique,

        /** alias of: util.Array.some
         *  util.Array.doUntil(array, handler, context);
         *  - array (Array): Array to test.
         *  - handler (Function): Function for testing.
         *  - context (Object): Optional context for `handler`.
         *
         *  Executes `handler` over the entries in `array` until `handler`
         *  returns `true`. This is identical to [[util.Array.some]] but the
         *  alias may convey the developer's intention more accurately.
         **/
        doUntil: some,

        /** alias of: util.Array.every
         *  util.Array.doWhile(array, handler, context);
         *  - array (Array): Array to test.
         *  - handler (Function): Function for testing.
         *  - context (Object): Optional context for `handler`.
         *
         *  Executes `handler` over the entries in `array` while `handler`
         *  returns `true`. This is identical to [[util.Array.every]] but the
         *  alias may convey the developer's intention more accurately.
         **/
        doWhile: every

    });

    return Object.freeze(array);

});
