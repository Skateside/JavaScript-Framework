define(function () {

    "use strict";

    const ARRAY_MAX_LENGTH = Math.pow(2, 32) - 1;

    var core = {

        /**
         *  util.RegExp.EMPTY = /(?:)/
         *
         *  An empty regular expression that matches nothing and is used for
         *  fallbacks.
         **/
        EMPTY_REX_EXP: /(?:)/

    };

    /**
     *  util.Object.assign(source, [...objects]) -> Object
     *  - source (Object): Source object to extend.
     *  - objects (Object): Objects to use to extend the source.
     *
     *  Extends one object with the properties of others. This function
     *  takes any number of arguments, the important thing to remember is
     *  that the first argument is the one being changed.
     *
     *      var obj1 = {foo: 1};
     *      var obj2 = {bar: 2};
     *      util.Object.assign(obj1, obj2);
     *      // -> {foo: 1, bar: 2}
     *      // obj1 is now {foo: 1, bar: 2}; obj2 is still {bar: 2}
     *
     *  The function will take any number of arguments and add them all to
     *  the original.
     *
     *      var obj1 = {foo: 1};
     *      var obj2 = {bar: 2};
     *      var obj3 = {baz: 3};
     *      util.Object.assign(obj1, obj2, obj3);
     *      // -> {foo: 1, bar: 2, baz: 3}
     *
     *  Matching properties will be over-written by subsequent arguments in
     *  the order they were supplied to the function.
     *
     *      var obj1 = {foo: 1};
     *      var obj2 = {foo: 2};
     *      var obj3 = {foo: 3};
     *      util.Object.assign(obj1, obj2, obj3);
     *      // -> {foo: 3}
     *
     *  This function defaults to the native
     *  [Object.assign](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
     **/
    var assign = Object.assign || function (source, ...objects) {

        objects.forEach(function (object) {

            Object
                .keys(object)
                .forEach(function (key) {
                    source[key] = object[key];
                });

        });

    };

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
    var identity = function (x) {
        return x;
    };

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
    var arrayFrom = Array.from || function (list, map, context) {

        if (typeof map !== "function") {
            map = identity;
        }

        return map(list, map, context);

    };

    /**
     *  util.Array.forEach(array, handler[, context]) -> Boolean
     *  - array (Array): Array to test.
     *  - handler (Function): Function for testing.
     *  - context (Object): Optional context for `handler`.
     *
     *  Identical to the native `[].forEach()` with the exception that it will
     *  work on any iterable object, not just arrays.
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
    var arrayForEach = Array.forEach || function (array, handler, context) {
        return Array.prototype.forEach.call(array, handler, context);
    };

    /**
     *  util.Array.map(array, handler[, context]) -> Boolean
     *  - array (Array): Array to test.
     *  - handler (Function): Function for testing.
     *  - context (Object): Optional context for `handler`.
     *
     *  Identical to the native `[].map()` with the exception that it will work
     *  on any iterable object, not just arrays.
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
    var arrayMap = Array.map || function (array, handler, context) {
        return Array.prototype.map.call(array, handler, context);
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
    var arrayUnique = function (array) {

        return interpret(array).reduce(function (prev, curr) {

            if (prev.indexOf(curr) < 0) {
                prev.push(curr);
            }

            return prev;

        }, []);

    };

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
    var stringInterpret = function (string) {

        return typeof string === "string"
            ? string
            : (string === null || string === undefined)
                ? ""
                : String(string);

    };

    /** alias of: util.Function.memoize
     *  util.Function.memoise(func[, resolver = JSON.stringify]) -> Function
     *  - func (Function): Function to memoise.
     *  - resolver (Function): Optional function to resolve the arguments.
     *
     *
     *  [Based on the work by
     *  cyrilf](http://requiremind.com/memoization-speed-up-your-javascript-performance/)
     **/
    var memoise = function (func, resolver) {

        var cache = {};
        var memoised = function (...args) {

            var res = resolver || JSON.stringify;
            var key = res(...args);
            var result;

            if (Object.prototype.hasOwnProperty.call(cache, key)) {
                result = cache[key];
            } else {

                result = func(...args);
                cache[key] = result;

            }

            return result;

        };

        memoised.cache = cache;
        memoised.original = func;

        return memoised;

    };

    // Taken from lodash.
    var stringToPath = memoise(function (paths) {

        var result = [];
        var str = stringInterpret(paths);

        if ((/^\./).test(str)) {
            result.push('');
        }

        str.replace(
            /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,
            function(match, number, quote, string) {

                result.push(
                    quote
                        ? string.replace(/\\(\\)?/g, '$1')
                        : (number || match)
                );

            }
        );

        return result;

    });

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
     *  util.Object.access(object, path) -> ?
     *  - object (Object): Object whose propertys should be accessed.
     *  - path (String): Path string.
     *
     *  Traces the given `path` to access the associated data from `object`. If
     *  the path cannot be followed at any point, `undefined` is returned.
     *
     *  To better understand this function, consider the following object:
     *
     *      var object = {
     *          one: {
     *              two: {
     *                  three: [
     *                      "alpha",
     *                      "bravo",
     *                      [
     *                          "charlie",
     *                          "cat",
     *                          "car"
     *                      ],
     *                      {
     *                          delta: true,
     *                          devious: false
     *                      }
     *                  ]
     *              }
     *          },
     *          four: [
     *              "one",
     *              "two"
     *          ],
     *          "five-six": {
     *              seven: 7,
     *              eight: 88,
     *              nine: [
     *                  "nine",
     *                  "NINE",
     *                  "9"
     *              ]
     *          }
     *      };
     *
     *  Given that object, this function would return the following results:
     *
     *      access(object, "one.two.three[2][1]");    // -> "cat"
     *      access(object, "four[0].length");         // -> 3
     *      access(object, "one.two.three[3].delta"); // -> true
     *      access(object, "five");                   // -> undefined
     *      access(object, "five.one.two");           // -> undefined
     *      access(object, "five-six.nine[2]");       // -> "9"
     *      access(object, "[five-six].nine[2]");     // -> "9"
     *
     **/
    var objectAccess = function (object, path) {

        stringToPath(path).every(function (property) {

            object = (
                    object !== null
                    && object !== undefined
                    && owns(object, property)
                )
                ? object[property]
                : undefined;

            return object !== undefined;


        });

        return object;

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
    var arrayFilter = Array.filter || function (array, handler, context) {
        return Array.prototype.filter.call(array, handler, context);
    };

    /**
     *  util.Number.isNumeric(number) -> Boolean
     *  - number (?): Number to test.
     *
     *  Tests to see if the given number is numberic. This is not necessarily
     *  the same as testing whether or not the given `number` is a number.
     *
     *      util.Number.isNumeric(10);       // -> true
     *      util.Number.isNumeric('10');     // -> true
     *      util.Number.isNumeric(10,1);     // -> true
     *      util.Number.isNumeric(util);     // -> false
     *      util.Number.isNumeric(NaN);      // -> false
     *      util.Number.isNumeric(Infinity); // -> false
     *
     **/
    function isNumeric(number) {
        return !isNaN(parseFloat(number)) && isFinite(number);
    };

    /**
     *  util.Array.isArrayLike(object) -> Boolean
     *  - object (?): Object to test.
     *
     *  Tests to see if the given object is array-like.
     *
     *      util.Array.isArrayLike([]);                             // -> true
     *      util.Array.isArrayLike('');                             // -> true
     *      util.Array.isArrayLike(0);                              // -> false
     *      util.Array.isArrayLike({});                             // -> false
     *      util.Array.isArrayLike({length: 0});                    // -> true
     *      util.Array.isArrayLike({length: -1});                   // -> false
     *      util.Array.isArrayLike(document.querySelector('*'));    // -> false
     *      util.Array.isArrayLike(document.querySelectorAll('*')); // -> true
     *
     **/
    function isArrayLike(object) {

        return (
            object !== undefined
            && object !== null
            && (
                Array.isArray(object)
                || (
                    isNumeric(object.length)
                    && object.length >= 0
                    && object.length < ARRAY_MAX_LENGTH
                }
                || (window.Symbol
                    ? getType(object[Symbol.iterator]) === "function"
                    : false)
            )
        );

    };

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
     *  util.Object.getType(object) -> String
     *  - object (*) Object whose type should be returned.
     *
     *  Gets the type of the object.
     *
     *      util.Object.getType(""); // -> "string"
     *      util.Object.getType({}); // -> "object"
     *
     *  This is almost identical to the native `typeof` operator with two main
     *  exceptions:
     *
     *      typeof []; // -> "object"
     *      util.Object.getType([]); // -> "array"
     *      typeof null; // -> "object"
     *      util.Object.getType(null); // -> "null"
     *      typeof NaN; // -> "number"
     *      util.Object.getType(NaN); // -> "nan"
     *
     **/
    function getType(object) {

        var type = typeof object;

        if (type === "object") {

            if (!type) {
                type = "null";
            } else if (Array.isArray(object)) {
                type = "array";
            }

        } else if (type === "number" && isNaN(object)) {
            type = "nan";
        }

        return type;

    }

    /**
     *  util.RegExp.escape(string) -> String
     *  - string (String): String to escape.
     *
     *  Escapes a string so it can be used in a `RegExp` constructor.
     *
     *      util.RegExp.escape('-'); // -> "\\-"
     *
     **/
    function escapeRegExp(string) {

        string = String(string);

        return string.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');

    };

    /**
     *  util.Number.toPosInt(number) -> Number
     *  - number (Number): Number to convert.
     *
     *  Converts the given number into a positive integer.
     *
     *      util.Number.toPosInt(10);   // -> 10
     *      util.Number.toPosInt(-10);  // -> 10
     *      util.Number.toPosInt('10'); // -> 10
     *      util.Number.toPosInt(10.7); // -> 10
     *
     **/
    function toPosInt(number) {
        return Math.floor(Math.abs(number));
    }

    /** related to: util.Number.randInt
     *  util.Number.randFloat(max) -> Number
     *  util.Number.randFloat(min, max) -> Number
     *  - min (Number): Optional minimum value.
     *  - max (Number): Maximum value.
     *
     *  Returns a number between `min` and `max`. The resulting number will be
     *  at least `min` and less than `max` - the values of `min` and `max` will
     *  never be returned.
     *
     *      util.Number.randFloat(5, 10); // -> something like 6.56478965
     *      util.Number.randFloat(5, 10); // -> something like 7.64891324
     *      util.Number.randFloat(5, 10); // -> something like 12.98441575
     *      util.Number.randFloat(5, 10); // -> something like 10.33219453
     *
     *  If only one value is passed, the value is assumed to be `max` and `min`
     *  defaults to `0`.
     *
     *      util.Number.randFloat(10); // -> something like 8.16379823
     *
     *  Both `min` and `max` are converted to their absolute value, thus `-4`
     *  and `4` are considered the same values and a positive number is always
     *  returned.
     *
     *      util.Number.randFloat(-5, -10); // -> something like 13.13665472
     *
     *  This function is designed to be generic, so numeric strings will also
     *  work.
     *
     *      util.Number.randFloat("5", "10"); // -> something like 11.96375842
     *
     *  `min` and `max` are deduced inside the function, so there is no need to
     *  worry about remembering the order.
     *
     *  To return an integer rather than a float, use [[util.Number.randInt]].
     **/
    function randFloat(min, max) {

        var absMin = Math.abs(min) || 0;
        var absMax = Math.abs(max) || 0;
        var minimum = Math.min(absMin, absMax);
        var maximum = Math.max(absMin, absMax);

        return minimum + Math.random() * (maximum - minimum);

    }

    /** related to: util.Number.randFloat
     *  util.Number.randInt(max) -> Number
     *  util.Number.randInt(min, max) -> Number
     *  - min (Number): Optional minimum value.
     *  - max (Number): Maximum value.
     *
     *  Returns a random number between `min` and `max`.
     *
     *      util.Number.randInt(5, 10); // -> something like 7
     *      util.Number.randInt(5, 10); // -> something like 8
     *      util.Number.randInt(5, 10); // -> something like 5
     *      util.Number.randInt(5, 10); // -> something like 9
     *
     *  The `min` value is optional and, if ommitted, `0` is assumed. This
     *  function differs from [[util.Number.randFloat]] in 2 ways:
     *
     *  - An integer is returned.
     *  - It is possible to get the value of `min` returned.
     *
     *  Other than that, the functions are identical. See
     *  [[util.Number.randInt]] for more information.
     **/
    function randInt(min, max) {
        return Math.floor(randFloat(min, max));
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
     *  `property` and `value` can be any path (although the value will only be
     *  returned if the `property` path can be found) - see
     *  [[util.Object.access]] for more information.
     *
     *  To execute a method rather than accessing a property, use the
     *  [[util.Array.invoke]] method.
     **/
    function arrayPluck(array, property, value) {

        var plucked = {};

        if (typeof value === "string") {

            arrayForEach(array, function (entry) {

                var key = objectAccess(entry, property);
                var value = objectAccess(entry, value);

                if (typeof key === "string") {
                    plucked[key] = value;
                }

            });

        } else {

            plucked = arrayMap(array, function (entry) {
                return objectAccess(entry, property);
            });

        }

        return plucked;

    }

    /**
     *  util.Function.isNative(func) -> Boolean
     *  - func (Function): Function to tests.
     *
     *  Tests to see if the given `func` is a native function, not one that has
     *  been created by the user or a library.
     *
     *      util.Function.isNative(window.setTimeout);      // -> true
     *      util.Function.isNative(util.Function.isNative); // -> false
     *
     **/
    function isFunctionNative(func) {

        return (
            typeof func === "function"
            && func.toString().indexOf("native") > -1
        );

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
    function arrayCommon(array, ...arrays) {

        return arrayUnique(arrays.reduce(function (array1, array2) {

            var arr = arrayFrom(array2);

            return array1.filter(function (entry) {
                return arr.indexOf(entry) > -1;
            });

        }, arrayFrom(array)));

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
    function arrayDiff(array, ...arrays) {

        return arrayUnique(arrays.reduce(function (array1, array2) {

            var arr = arrayFrom(array2);

            return array1.filter(function (entry) {
                return arr.indexOf(entry) < 0;
            });

        }, arrayFrom(array)));

    }

    /**
     *  util.Array.remove(array, ...items) -> Array
     *  - array (Array): Array whose items should be removed.
     *  - items (?): Items to remove.
     *
     *  Filters the given `array` so that it does not contain any of the items
     *  in the `items` arguments.
     *
     *      util.Array.remove([1, 2, 3], 2); // -> [1, 3]
     *      util.Array.remove([1, 2, 1], 1); // -> [2]
     *      util.Array.remove([1, 2, 3], 3, 2, 1); // -> []
     *
     **/
    function arrayRemove(array, ...items) {

        return filter(array, function (item) {
            return items.indexOf(item) > -1;
        });

    }

    /**
     *  util.Array.isSimilar(source, compare) -> Boolean
     *  - source (Array): Array to compare.
     *  - compare (Array): Array to compare.
     *
     *  Compares two arrays to see if they have the same length and contain the
     *  same items.
     *
     *      var arr1 = [1, 2, 3];
     *      var arr2 = [1, 2, 3];
     *      arr1 === arr2; // -> false
     *      util.Array.isSimilar(arr1, arr2); // -> true
     *      util.Array.isSimilar(arr1, [1, 2]); // -> false
     *      util.Array.isSimilar(arr1, [1, 2, 3, 1]); // -> false
     *
     *  The array items do not need to have the same index for the arrays to be
     *  considered similar.
     *
     *      var arr3 = [3, 2, 1];
     *      uti.Array.isSimilar(arr1, arr3); // -> true
     *
     **/
    function isArraySimilar(source, compare) {

        return (
            source.length === array.length
            && arrayCommon(source, array).length === arrayUnique(source).length
        );

    }

    /**
     *  util.RegExp.interpret(reg) -> RegExp
     *  - reg (?): Object to interpret as a regular expression.
     *
     *  Interprets the given `regexp` as a `RegExp`. If `reg` cannot be property
     *  interpretted, an empty regular expression is returned (see
     *  [[util.RegExp.EMPTY]]).
     **/
    function interpretRegExp(reg) {

        if (!core.isRegExp(reg)) {

            try {
                reg = new RegExp(reg);
            } catch (ignore) {
                reg = core.EMPTY_REX_EXP;
            }

        }

        return reg;

    }

    /**
     *  util.RegExp.removeFlags(regexp, flags) -> RegExp
     *  - regexp (RegExp): Regular expression.
     *  - flags (String): Flags to remove.
     *
     *  Removes flags from the given regular expression.
     *
     *      util.RegExp.addFlags(/\s/gim, "g"); // -> /\s/im
     *      util.RegExp.addFlags(/\s/gim, "gim"); // -> /\s/
     *
     *  If the given regular expression does not have the flags, no action is
     *  taken.
     *
     *      util.RegExp.addFlags(/\s/, "g"); // -> /\s/
     *
     **/
    function removeFlags(regexp, flags) {

        var reg = interpretRegExp(regexp);
        var regFlags = arrayRemove(
            reg.flags.split(""),
            ...flags.split("")
        ).join("");

        return new RegExp(reg, regFlags);

    }

    assign(core, {
        arrayCommon: arrayCommon,
        arrayDiff: arrayDiff,
        arrayFilter: arrayFilter,
        arrayForEach: arrayForEach,
        arrayFrom: arrayFrom,
        arrayMap: arrayMap,
        arrayPluck: arrayPluck,
        arrayRemove: arrayRemove,
        arrayUnique: arrayUnique,
        assign: assign,
        escapeRegExp: escapeRegExp,
        functionMemoise: memoise,
        getType: getType,
        identity: identity,
        interpretRegExp: interpretRegExp,
        isArrayLike: isArrayLike,
        isArraySimilar: isArraySimilar,
        isFunctionNative: isFunctionNative,
        isNumeric: isNumeric,
        isRegExp: isRegExp,
        removeFlags: removeFlags,
        stringInterpret: stringInterpret,
        objectAccess: objectAccess,
        owns: owns,
        toPosInt: toPosInt
    });

    return Object.freeze(core);

});
