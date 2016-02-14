/*jslint es6 */
/*globals define, window */
define(function () {

    'use strict';

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
         **/
    var util = {

            /**
             *  util.Array
             *
             *  Namespace for all Array functions.
             **/
            Array: {},

            /**
             *  util.Function
             *
             *  Namespace for all Function functions.
             **/
            Function: {},

            /**
             *  util.Object
             *
             *  Namespace for all Object functions.
             **/
            Object: {},

            /**
             *  util.Number
             *
             *  Namespace for all Number functions.
             **/
            Number: {},

            /**
             *  util.RegExp
             *
             *  Namespace for all RegExp functions.
             **/
            RegExp: {},

            /**
             *  util.String
             *
             *  Namespace for all String functions.
             **/
            String: {}
        },

        // Seed for util.String.uniqid
        seed = 123456789 + Math.floor(Math.random() * Date.now()),

        // Default pattern for util.String.supplant
        defaultPattern = /(^|.|\r|\n)(\$\{(.*?)\})/g,

        // May need to create a fallback for this.
        WeakMap = window.WeakMap,

        /**
         *  util.Object.toString(object) -> String
         *  - object (?): Object to convert.
         *
         *  Short-cut for `Object.prototype.toString.call(object)`.
         *
         *      util.Object.toString({}); // -> "[object Object]"
         *      util.Object.toString([]); // -> "[object Array]"
         *      util.Object.toString(''); // -> "[object String]"
         *
         **/
        toString = function (object) {
            return Object.prototype.toString.call(object);
        },

        /**
         *  util.Function.isFunction(func) -> Boolean
         *  - func (?): Object to test.
         *
         *  Tests to see if the given `func` is actually a function.
         *
         *      util.Function.isFunction(util.Function.isFunction); // -> true
         *      util.Function.isFunction({});                       // -> false
         *      util.Function.isFunction(/\s/);                     // -> false
         *
         **/
        isFunction = function (func) {

            return typeof func === 'function' &&
                    toString(func) === '[object Function]';

        },

        /**
         *  util.Function.identity(x) -> ?
         *  - x (?): Any variable
         *
         *  An [identity function](http://en.wikipedia.org/wiki/Identity_function)
         *  or one that simply returns whatever it's given. This is primarily
         *  used as a fallback for optional function calls.
         *
         *      util.Function.identity(1);    // -> 1
         *      util.Function.identify(true); // -> true
         *      util.Function.identity();     // -> undefined
         *
         **/
        identity = function (x) {
            return x;
        },

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
        every = Array.every || function (array, handler, context) {
            return Array.prototype.every.call(array, handler, context);
        },

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
        filter = Array.filter || function (array, handler, context) {
            return Array.prototype.filter.call(array, handler, context);
        },

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
        forEach = Array.forEach || function (array, handler, context) {
            return Array.prototype.forEach.call(array, handler, context);
        },

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
        map = Array.map || function (array, handler, context) {
            return Array.prototype.map.call(array, handler, context);
        },

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
        some = Array.some || function (array, handler, context) {
            return Array.prototype.some.call(array, handler, context);
        },

        /**
         *  Array.from(array[, map[, context]]) -> Array
         *  - array (Array | Object): Either an array or an array-like object.
         *  - map (Function): Optional map for converting the array.
         *  - context (Object): Context for the `map`.
         *
         *  Creates an `Array` with all associated methods from an array-like
         *  object.
         *
         *      Array.from(arguments);
         *      // -> [ ... ] (arguments of function as an array)
         *      Array.from(document.getElementsByTagName('a'));
         *      // -> [<a>, <a>, <a> ... ]
         *
         *  The `map` argument is called on all entries in the array or
         *  array-like object. Additionally, a `context` for the `map` may be
         *  passed as well.
         *
         *      var arrayLike = {
         *          '0': {name: 'zero'},
         *          '1': {name: 'one'},
         *          '2': {name: 'two'},
         *          length: 3
         *      };
         *      Array.from(arrayLike, function (entry) {
         *          return entry.name;
         *      });
         *      // -> ['zero', 'one', 'two']
         *
         *  This function can also be used to copy an existing `Array` such that
         *  modifying the clone will not affect the original.
         *
         *      var a = [];
         *      a.push(1); // a == [1]
         *      var b = Array.from(a);
         *      a.push(2); // a == [1, 2]; b = [1]
         *      b.push(3); // a == [1, 2]; b = [1, 3]
         *
         *  There is a "gotcha" with this function: most of the time, passing an
         *  object that cannot easily be converted into an `Array` will return
         *  an empty `Array` but it appears to break when a `Function` is passed
         *  to be converted. This is because in JavaScript, `Function`s have a
         *  `length` property equivalent to the number of expected arguments.
         *
         *      Array.from(Array.from); // -> [undefined, undefined, undefined]
         *
         *  To convert individual arguments into a combined array, see
         *  [[Array.of]].
         **/
        from = Array.from || function (list, map, context) {

            if (!isFunction(map)) {
                map = identity;
            }

            return map(list, map, context);

        },

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
        unique = function (array) {

            return from(array).reduce(function (prev, curr) {

                if (prev.indexOf(curr) < 0) {
                    prev.push(curr);
                }

                return prev;

            }, []);

        },

        /**
         *  Object.assign(object[, extension1[, extension2]]) -> Object
         *  - object (Object): Source object to extend.
         *
         *  Extends one object with the properties of others. This function
         *  takes any number of arguments, the important thing to remember is
         *  that the first argument is the one being changed.
         *
         *      var obj1 = {foo: 1};
         *      var obj2 = {bar: 2};
         *      Object.assign(obj1, obj2);
         *      // -> {foo: 1, bar: 2}
         *      // obj1 is now {foo: 1, bar: 2}; obj2 is still {bar: 2}
         *
         *  The function will take any number of arguments and add them all to
         *  the original.
         *
         *      var obj1 = {foo: 1};
         *      var obj2 = {bar: 2};
         *      var obj3 = {baz: 3};
         *      Object.assign(obj1, obj2, obj3);
         *      // -> {foo: 1, bar: 2, baz: 3}
         *
         *  Matching properties will be over-written by subsequent arguments in
         *  the order they were supplied to the function.
         *
         *      var obj1 = {foo: 1};
         *      var obj2 = {foo: 2};
         *      var obj3 = {foo: 3};
         *      Object.assign(obj1, obj2, obj3);
         *      // -> {foo: 3}
         *
         *  This function defaults to the native
         *  [Object.assign](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
         **/
        assign = Object.assign || function (source, ...objects) {

            objects.forEach(function (object) {

                Object.keys(object).forEach(function (key) {
                    source[key] = object[key];
                });

            });

            return source;

        },

        /**
         *  util.Number.toPosInt(number) -> Number
         *  - number (Number): Number to convert.
         *
         *  Converts the given number into a positive integer.
         *
         *      util.Number.toPosInt(10);      // -> 10
         *      util.Number.toPosInt('10');    // -> 10
         *      util.Number.toPosInt('-10.5'); // -> 10
         *      util.Number.toPosInt('ten');   // -> NaN
         *
         **/
        toPosInt = function (number) {
            return Math.floor(Math.abs(number));
        },

        /**
         *  util.Number.isNumeric(number) -> Boolean
         *  - number (?): Object to test.
         *
         *  Checks to see if the given object is numeric. This does not mean
         *  that the object is a number, but rather that the object could be
         *  used as a number.
         *
         *      util.Number.isNumeric(1);    // -> true
         *      util.Number.isNumeric('1');  // -> true
         *      util.Number.isNumeric(0x10); // -> true
         *      util.Number.isNumeric(1e4);  // -> true
         *      util.Number.isNumeric(NaN);  // -> false
         *      util.Number.isNumeric('');   // -> false
         *      util.Number.isNumeric(1/0);  // -> false
         *
         **/
        isNumeric = function (number) {
            return !isNaN(parseFloat(number)) && isFinite(number);
        },

        /**
         *  util.Number.toNumber(number[, def = NaN]) -> Number
         *  - number (Number|String): Number to convert.
         *  - def (Number): Optional default value.
         *
         *  Converts the given number into a positive integer. If the given
         *  `number` is not numeric, this function will return `def` if `def` is
         *  a number or `NaN` if `def` is not.
         *
         *      util.Number.toNumber('10', 5);       // -> 10
         *      util.Number.toNumber('-10.5', 5);    // -> 10
         *      util.Number.toNumber('ten', 5);      // -> 5
         *      util.Number.toNumber('ten');         // -> NaN
         *      util.Number.toNumber('ten', 'five'); // -> NaN
         *
         *  See also: [[util.Number.isNumeric]] and [[util.Number.toPosInt]].
         **/
        toNumber = function (number, defaultNumber) {

            return toPosInt(isNumeric(number)
                ? number
                : defaultNumber);

        },

        /**
         *  util.Array.isIterable(object) -> Boolean
         *  - object (?): Object to test.
         *
         *  Tests to see if the given `object` is iterable (would work with the
         *  other [[util.Array]] methods). This isn't necessarily the same as
         *  being an array.
         *
         *      util.Array.isIterable([]);
         *      // -> true
         *      util.Array.isIterable('');
         *      // -> true
         *      util.Array.isIterable(document.getElementsByTagName('div'));
         *      // -> true
         *      util.Array.isIterable({length: 0});
         *      // -> true
         *      util.Array.isIterable({});
         *      // -> false
         *      util.Array.isIterable(5);
         *      // -> false
         *
         **/
        isIterable = function (object) {

            return object !== null && object !== undefined &&
                    (Array.isArray(object) ||
                    typeof object[Symbol.iterator] === 'function' ||
                    isNumeric(object.length));

        },

        /**
         *  util.Object.each(object, handler[, context])
         *  - object (Object): Object to interate over.
         *  - handler (Function): Handler to call for each object key/value
         *    pair.
         *  - context (Object): Optional context for the handler.
         *
         *  A function that iterates over all entries in an object. Only the
         *  object's own properties are included (none of the inherited
         *  properties). Be warned that different browsers will order object
         *  properties in different ways. Convention dictates that properties
         *  should be given in the order in which they are set, but no
         *  ECMAScript specification defines this. Therefore, the order of the
         *  key/value pairs should never be relied upon.
         *
         *      util.Object.each({foo: 1, bar: 2}, function (key, value) {
         *          // if key is "foo", value will be 1.
         *          // if key is "bar", value will be 2.
         *      });
         *
         **/
        each = function (object, handler, context) {

            Object.keys(object).forEach(function (key) {
                handler.call(context, key, object[key]);
            });

        };

    /**
     *  util.Object.clone(object) -> ?
     *  - object (?): Object to clone.
     *
     *  Clones the given object. The clone is deep (nested properties are
     *  cloned).
     *
     *      var o1 = {
     *          foo: true
     *      };
     *      var o2 = util.Object.clone(o2);
     *      o2.foo; // -> true
     *      o2.bar = true;
     *      o2.bar; // -> true
     *      o1.bar; // -> undefined
     *
     **/
    function clone(object) {

        var copy = object;

        switch (Object.prototype.toString.call(object)) {

        case '[object Object]':

            copy = {};

            each(object, function (key, value) {
                copy[key] = clone(value);
            });

            break;

        case '[object Array]':

            copy = copy.map(clone);

            break;

        }

        return copy;

    }

    /**
     *  util.Array.common(array1, ...arrays) -> Array
     *  - array1 (Array): Original array to compare.
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
    function common(array1, ...arrays) {

        return unique(arrays.reduce(function (array1, array2) {

            var array = from(array2);

            return from(array1).filter(function (entry) {
                return array.indexOf(entry) > -1;
            });

        }, from(array1)));

    }

    /**
     *  util.RegExp.create(string[, flags]) -> RegExp
     *  - string (String): Regular expression string.
     *  - flags (String): Optional flags for the regular expression.
     *
     *  ES6 introduced multi-line strings. These are very useful for creating
     *  regular expressions when combined with this function.
     *
     *      util.RegExp.create(`
     *          [ a-p 0-5 ]+
     *          [ q-z 6-9 ]{2,}
     *      `, 'g');
     *      // -> /[a-p0-5]+[q-z6-9]{2,}/g
     *
     *  This makes regular expressions easier to maintain and read.
     **/
    function createRegExp(string, flags) {
        return new RegExp(String(string).replace(/\s+/g, ''), flags);
    }

    /**
     *  util.Function.curry(func, ...args) -> Function
     *  - func (Function): Function to curry.
     *  - args (?): Pre-defined arguments for `func`.
     *
     *  This method creates a function that pre-populates `func` with the given
     *  `args`. To better understand that, consider the following function:
     *
     *      function aLady(once, twice, threeTimes) {
     *          return once + (2 * twice) + (3 * threeTimes);
     *      }
     *      aLady(1, 2, 3); // -> (1 + (2 * 2 = 4) + (3 * 3 = 9) = ) 14
     *
     *  The arguments can be pre-defined:
     *
     *      var ladyOne = util.Function.curry(aLady, 1);
     *      ladyOne(1, 2); // -> (1 + (2 * 1 = 2) + (3 * 2 = 6) = ) 9
     *
     *  Gaps in the pre-defined arguments can be left using `undefined` - these
     *  gaps will be automatically filled in using the arguments passed to the
     *  new function.
     *
     *      var ladyTwo = util.Function.curry(aLady, undefined, 5);
     *      ladyTwo(6, 7); // -> (6 + (2 * 5 = 10) + (3 * 7 = 21) = ) 37
     *
     **/
    function curry(func, ...args) {

        return function (...innerArgs) {

            var allArgs = [];

            args.forEach(function (arg) {

                allArgs.push(arg === undefined
                    ? innerArgs.shift()
                    : arg);

            });

            return func(...allArgs.concat(innerArgs));

        };

    }

    /**
     *  util.Array.diff(array1, ...arrays) -> Array
     *  - array1 (Array): Original array to compare.
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
    function diff(array1, ...arrays) {

        return unique(arrays.reduce(function (array1, array2) {

            var array = from(array2);

            return from(array1).filter(function (entry) {
                return array.indexOf(entry) < 0;
            });

        }, from(array1)));

    }

    /**
     *  util.RegExp.escape(string) -> String
     *  - string (String): String to escape.
     *
     *  Escapes the characters in the given string that a `RegExp` requires to
     *  be escaped.
     *
     *      var string = '[\s(\w+)\s]',
     *          reg1   = new RegExp(string),
     *          // -> /[s(w+)s]/
     *          reg2   = new RegExp(util.RegExp.escape(string));
     *          // ->/ \[s\(w\+\)s\]/
     *
     **/
    function escapeRegExp(string) {

        return String(string).replace(
            /[\-\/\\\^\$\*\+\?\.\(\)\|\[\]\{\}]/g,
            '\\$&'
        );

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

        return isFunction(handler)
            ? first(filter(array, handler, context))
            : isIterable(array)
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

    /**
     *  util.String.isStringy(string) -> Boolean
     *  - string (?): String to test.
     *
     *  Tests to see if the given `string` is stringy (can be used with the
     *  [[util.String]] methods).
     *
     *      util.String.isStringy(''); // -> true
     *      util.String.isStringy(10); // -> true
     *      util.String.isStringy([]); // -> false
     *
     **/
    function isStringy(string) {
        return typeof string === 'string' || typeof string === 'number';
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

        return isFunction(handler)
            ? last(filter(array, handler, context))
            : isIterable(array)
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
     *  Function.noop()
     *
     *  A "NO-OPeration" function. Takes no arguments, returns nothing. This is
     *  mainly useful for situations where a default function is required with
     *  the expectation being that the function will be overridden by a setting
     *  or argument later on.
     *
     *      Function.noop();          // -> undefined
     *      Function.noop(true);      // -> undefined (arguments are ignored)
     *      Function.noop.call(null); // -> undefined (context is ignored)
     *
     **/
    function noop() {
        return;
    }

    /**
     *  util.Object.owns(object, property) -> Boolean
     *  - object (?): Object whose property should be tested.
     *  - property (String): Property to check.
     *
     *  Checks to see if the given `object` has the own property of `property`.
     *  An own property is one that is set on the object itself, not inherited.
     *
     *      var object = {
     *          foo: 1
     *      };
     *      util.Object.owns(object, 'foo'); // -> true
     *      util.Object.owns(object, 'bar'); // -> false
     *
     *  As mentioned, inherited properties will return false.
     *
     *      var child = Object.create(object);
     *      child.bar = 2;
     *      util.Object.owns(child, 'foo'); // -> false
     *      util.Object.owns(child, 'bar'); // -> true
     *
     **/
    function owns(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
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
     *      util.Array.pluck(['one', 'two', 'three', 'four'], 'length');
     *      // -> [3, 3, 5, 4]
     *      util.Array.pluck(['one', 'two', 'three', 'four'], 'not-real');
     *      // -> [undefined, undefined, undefined, undefined]
     *
     *  If a `value` is provided, an `Object` is returned rather than an
     *  `Array`, the `Object` is a key/value set based on the entries in the
     *  array, with the `Object`'s keys being the `property` and the values
     *  being `value.
     *
     *      var arr = [
     *          {name: 'foo', value: 1},
     *          {name: 'bar', value: 2},
     *          {name: 'baz', value: 3}
     *      ];
     *      util.Array.pluck(arr, 'name', 'value');
     *      // -> {foo: 1, bar: 2, baz: 3}
     *
     *  When using the `value` argument, beware that repeated `property`s will
     *  replace existing ones.
     *
     *      var arr = [
     *          {name: 'foo', value: 1},
     *          {name: 'bar', value: 2},
     *          {name: 'foo', value: 3}
     *      ];
     *      util.Array.pluck(arr, 'name', 'value');
     *      // -> {foo: 3, bar: 2}
     *
     *  To execute a method rather than accessing a property, use the
     *  [[util.Array.invoke]] method.
     **/
    function pluck(array, property, value) {

        var plucked = {};

        if (typeof value === 'string') {

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
     *  Array.remove(array) -> Array
     *  - array (Array): Array that should have items removed.
     *
     *  Removes items from an array, if they are found. The original array is
     *  not affected.
     *
     *      var array = [1, 2, 3, 4, 5, 6];
     *      var filtered = util.Array.remove(array, 2, 5, 8); // -> [1, 3, 4, 6]
     *
     **/
    function remove(array, ...entries) {

        return filter(array, function (entry) {
            return entries.indexOf(entry) < 0;
        });

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

        var shuffled = Array.from(array),
            length = shuffled.length,
            index = 0,
            temp = undefined;

        while (length) {

            index = Math.floor(Math.random() * length);
            length -= 1;

            temp = shuffled[length];
            shuffled[length] = shuffled[index];
            shuffled[index] = temp;

        }

        return shuffled;

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
     *      var string = 'Hello ${world}',
     *          reps   = {world: 'you'};
     *      util.String.supplant(string, reps); // -> "Hello you"
     *
     *  Placeholders can appear multiple times within the string.
     *
     *      var string = 'Hello ${world} ${world}',
     *          reps   = {world: 'you'};
     *      util.String.supplant(string, reps); // -> "Hello you you"
     *
     *  Placeholders can be escaped with `"\\"`.
     *
     *      var string = 'Hello \\${world} ${world}',
     *          reps   = {world: 'you'};
     *      util.String.supplant(string, reps); // -> "Hello ${world} you"
     *
     *  If the placeholder property isn't found, or the value isn't stringy (see
     *  [[util.String.isStringy]]) then the placeholder is left in place.
     *
     *      util.String.supplant(string, {nothing: 'you'});
     *      // -> "Hello ${world}"
     *      util.String.supplant(string, {world: []});
     *      // -> "Hello ${world}"
     *
     *  The pattern for the placeholders can be defined by passing a regular
     *  expression as the `pattern` argument. The pattern should match 3 parts
     *  and be global (have the `g` flag). The three parts are:
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
     *      var string = 'Hello \\{{world}} {{world}}',
     *          reps   = {world: 'you'},
     *          ptrn   = /(^|.|\r|\n)(\{\{(.*?)\}\})/;
     *      util.String.supplant(string, reps, ptrn);
     *      // -> "Hello {{world}} you"
     *
     **/
    function supplant(string, replacements, pattern) {

        string = String(string);
        replacements = replacements || {};

        if (!isRegExp(pattern)) {
            pattern = defaultPattern;
        }

        return string.replace(pattern, function (ignore, prefix, whole, key) {

            var replacement = isStringy(replacements[key])
                ? replacements[key]
                : whole;

            return prefix === '\\'
                ? whole
                : prefix + replacement;

        });

    }

    /**
     *  util.Number.times(number, handler[, context])
     *  - number (Number): Number of times to execute the handler.
     *  - handler (Function): Handler to execute.
     *  - context (Object): Context for the handler.
     *
     *  Executes a `handler` multiple times. Each time `handler` is passed the
     *  index of its execution.
     *
     *      util.Number.times(4, function (i) { console.log(i); });
     *      // logs 0 then 1 then 2 then 3
     *
     *  The number is normalised to handle negative numbers, decimals and
     *  strings.
     *
     *      util.Number.times(-4, function (i) { console.log(i); });
     *      // logs 0 then 1 then 2 then 3; absolute number used.
     *      util.Number.times(4.1, function (i) { console.log(i); });
     *      // logs 0 then 1 then 2 then 3; decimal is removed.
     *      util.Number.times('4', function (i) { console.log(i); });
     *      // logs 0 then 1 then 2 then 3; string coerced into a number.
     *      util.Number.times(Infinity, function (i) { console.log(i); });
     *      // does nothing; Infinity is not numeric.
     *
     **/
    function times(number, handler, context) {

        var i = 0,
            il = toNumber(number, 0);

        while (i < il) {

            handler.call(context, i);
            i += 1;

        }

    }

    /**
     *  String.toUpperFirst(string[, lower]) -> String
     *  - string (String): String to convert.
     *  - lower (Boolean): Optional additional settings.
     *
     *  Converts a string so that the first character is in upper case.
     *
     *      String.toUpperFirst('abcd'); // -> 'Abcd'
     *      String.toUpperFirst('ABCD'); // -> 'ABCD'
     *
     *  If `true` is passed as the `lower` argument, the first character is
     *  capitalised as normal, but the rest of the string is converted to lower
     *  case.
     *
     *      String.toUpperFirst('abcd', true); // -> 'Abcd'
     *      String.toUpperFirst('ABCD', true); // -> 'Abcd'
     *
     **/
    function toUpperFirst(string, lower) {

        var str = String(string),
            start = str.charAt(0).toUpperCase(),
            rest = str.slice(0);

        if (lower) {
            rest = rest.toLowerCase();
        }

        return start + rest;

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
     *      util.String.uniqid('prefix-');
     *      // -> something like "prefix-ifo53mv259tdtfpm"
     *      util.String.uniqid('prefix-');
     *      // -> something like "prefix-ifo53n3059tdtfpn"
     *      util.String.uniqid('prefix-');
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
            prefix = '';
        }

        seed += 1;

        return prefix + Date.now().toString(36) + seed.toString(36);

    }

    // fallback for WeakMap. Documentation works for both native and fallback.
    if (!WeakMap) {

        /**
         *  class util.WeakMap
         *
         *  Creates a weak map. A weak map is different from a strong map
         *  because it is not possible to iterate over the properties. The other
         *  advantage is that values are automatically garbage-collected when
         *  the key is deleted.
         *
         *  This should be a reference to the global, native `WeakMap` object.
         *  If the browser does not understand `WeakMap`, this is a fallback
         *  that should work in the same way.
         **/
        /**
         *  new util.WeakMap([iterable])
         *  - iterable (Array): Optional initial values.
         *
         *  Creates a `WeakMap`. The optional `iterable` argument creates
         *  initial values. The entries in the `iterable` should have two
         *  entries: the key and the value (see [[util.WeakMap#set]]). To better
         *  understand this, these two maps are equivalent:
         *
         *      var arr = [],
         *          obj = {};
         *
         *      var map1 = new util.WeakMap();
         *      map1.set(arr, 1);
         *      map1.set(obj, 2);
         *
         *      var map2 = new util.WeakMap([
         *          [arr, 1],
         *          [obj, 2]
         *      ]);
         *
         **/
        WeakMap = function (iterable) {

            var weakmap = {},
                prop = uniqid('WeakMap-');

            // Internal function that validates the key and returns it.
            function validate(key) {

                if (key === null || (typeof key !== 'object' &&
                        typeof key !== 'function')) {
                    throw new TypeError('value is not a non-null object');
                }

                return key;

            }

            /**
             *  util.WeakMap#set(key, value) -> WeakMap
             *  - key (Object): Key for the map.
             *  - value (?): Value for the map.
             *
             *  Adds a key/value combination to a map. The `key` cannot be a
             *  string, number, boolean, `null` or `undefined`. Although the
             *  signature describes `key` as an object, it can be a function or
             *  other type - only the ones already mentioned are disallowed.
             *
             *      var map = new util.WeakMap();
             *      var obj1 = {};
             *      map.set(obj1, 1);
             *
             *  This method will return the instance, allowing the method to be
             *  chained.
             *
             *      var obj2 = {},
             *          obj3 = {};
             *      map.set(obj2, 2).set(obj3, 3);
             *
             **/
            function set(key, value) {

                Object.defineProperty(validate(key), prop, {
                    configurable: true,
                    enumerable: false,
                    value,
                    writable: true
                });

                return weakmap;

            }

            /**
             *  util.WeakMap#get(key) -> ?
             *  key (Object): Key for the data.
             *
             *  Retrieves data from the map.
             *
             *      var obj = {},
             *          map = new util.WeakMap([
             *              [obj, 1]
             *          ]);
             *      map.get(obj); // -> 1
             *
             *  If there is no data associated with the given `key`, `undefined`
             *  is returned.
             *
             *      map.get({}); // -> undefined
             *
             **/
            function get(key) {
                return validate(key)[prop];
            }

            /**
             *  util.WeakMap#has(key) -> Boolean
             *  - key (Object): Key for the data.
             *
             *  Checks to see if there is any data associated with the given
             *  `key`.
             *
             *      var obj = {},
             *          map = new util.WeakMap();
             *      map.set(obj, 1);
             *      map.has(obj); // -> true
             *      map.has({});  // -> false
             *
             **/
            function has(key) {
                return owns(validate(key), prop);
            }

            /**
             *  util.WeakMap#delete(key) -> Boolean
             *  - key (Object): Key for the data.
             *
             *  Removes the data associated with the given key.
             *
             *      var obj = {},
             *          map = new util.WeakMap();
             *      map.set(obj, 1);
             *      map.get(obj);    // -> 1
             *      map.delete(obj); // -> true
             *      map.get(obj);    // -> undefined
             *
             *  The method returns `true` or `false` depending on whether or not
             *  there was and data to delete.
             *
             *      var obj = {},
             *          map = new util.WeakMap();
             *      map.set(obj, 1);
             *      map.get(obj);    // -> 1
             *      map.delete(obj); // -> true
             *      map.delete(obj); // -> false
             *
             **/
            function deleteKey(key) {

                var had = has(key);

                delete key[prop];

                return had;

            }

            if (isIterable(iterable)) {

                forEach(iterable, function (combo) {
                    set(...combo);
                });

            }

            assign(weakmap, {
                set,
                get,
                has,
                delete: deleteKey
            });

            return weakmap;

        };

    }

    assign(util.Array, {
        common,
        diff,
        every,
        filter,
        first,
        forEach,
        from,
        invoke,
        isArray: Array.isArray,
        isIterable,
        last,
        makeInvoker,
        map,
        pluck,
        remove,
        shuffle,
        some,
        unique
    });

    assign(util.Function, {
        curry,
        identity,
        isFunction,
        noop
    });

    assign(util.Number, {
        isNumeric,
        times,
        toNumber,
        toPosInt
    });

    assign(util.Object, {
        assign,
        clone,
        each,
        owns,
        toString
    });

    assign(util.RegExp, {
        create: createRegExp,
        escape: escapeRegExp,
        isRegExp
    });

    assign(util.String, {
        isStringy,
        supplant,
        toUpperFirst,
        uniqid
    });

    util.WeakMap = WeakMap;

    return util;

});

/*
var SafeFuncs = function () {

    'use strict';

    var funcs = [],
        dummy = document.createElement('div'),
        eName = 'custom-event',
        handler;

    function dispatch(eventName) {

        var evt = document.createEvent('Event');

        evt.initEvent(eventName, true, true);
        dummy.dispatchEvent(evt);

    }

    function execute(info, ...args) {

        handler = Object.assign({}, info, {args});
        dispatch(eName);
        handler = undefined;

    }

    function add(handler, context) {

        funcs.push({
            context,
            handler
        });

    }

    function remove(handler) {

        funcs = funcs.filter(function (info) {
            return info.handler !== handler;
        });

    }

    function run(...args) {

        funcs.forEach(function (info) {
            execute(info, ...args);
        });

    }

    dummy.addEventListener(eName, function () {

        if (handler) {
            handler.handler.apply(handler.context, handler.args);
        }

    }, false);

    return Object.freeze({
        add,
        remove,
        run
    });

};

util.Array.exec = function (array, ...args) {

    var safe = SafeFuncs();

    util.Array.forEach(array, function (entry) {

        if (util.Function.isFunction(entry)) {
            safe.add(entry);
        }

    });

    safe.run(...args);

};
*/
