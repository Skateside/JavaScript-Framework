(function () {

    'use strict';

        /** alias of: $a
         *  array -> Helper
         *
         *  Collection of functions designed to aid manipulation of `Array`s.
         *  Most methods of $a are designed to be generic. They will work with
         *  any enumerable collection such as `NodeList`s, `String`s and
         *  `Object`s with a numeric `length` property.
         *
         *  As a helper, it can have any any name when created, but
         *  conventionally it is always assigned to the `$a` variable.
         *
         *  The array (or array-like object) to be manipulated is always passed
         *  in as the first argument. If the method expects a function as the
         *  penultimate argument, the last argument will always be the context
         *  for that function.
         **/
    var $a = {},

        /** alias of: $c
         *  class -> Helper
         *
         *  Collection of functions designed to aid creation of "Classes".
         *
         *  As a helper, it can have any any name when created, but
         *  conventionally it is always assigned to the `$c` variable.
         **/
        $c = {},

        /** alias of: $f
         *  function -> Helper
         *
         *  Collection of functions designed to aid manipulation of `Function`s.
         *
         *  As a helper, it can have any any name when created, but
         *  conventionally it is always assigned to the `$f` variable.
         *
         *  The function to be manipulated is always passed in as the first
         *  argument. If the method expects a function as the penultimate
         *  argument, the last argument will always be the context for that
         *  function.
         **/
        $f = {},

        /** alias of: $n
         *  number -> Helper
         *
         *  Collection of functions designed to aid manipulation of `Number`s.
         *
         *  As a helper, it can have any any name when created, but
         *  conventionally it is always assigned to the `$n` variable.
         *
         *  The number to be manipulated is always passed in as the first
         *  argument. If the method expects a function as the penultimate
         *  argument, the last argument will always be the context for that
         *  function.
         **/
        $n = {},

        /** alias of: $o
         *  object -> Helper
         *
         *  Collection of functions designed to aid manipulation of `Object`s.
         *
         *  As a helper, it can have any any name when created, but
         *  conventionally it is always assigned to the `$o` variable.
         *
         *  The object to be manipulated is always passed in as the first
         *  argument. If the method expects a function as the penultimate
         *  argument, the last argument will always be the context for that
         *  function.
         **/
        $o = {},

        /** alias of: $s
         *  string -> Helper
         *
         *  Collection of functions designed to aid manipulation of `String`s.
         *
         *  As a helper, it can have any any name when created, but
         *  conventionally it is always assigned to the `$s` variable.
         *
         *  The string to be manipulated is always passed in as the first
         *  argument. If the method expects a function as the penultimate
         *  argument, the last argument will always be the context for that
         *  function.
         **/
        $s = {},

        // Context constructor, created lower down.
        Context = null,

        // Template constructor, created lower down.
        Template = null,

        /**
         *  function.identity(o) -> ?
         *  - o (?): Any variable
         *
         *  An [identity 
         *  function](http://en.wikipedia.org/wiki/Identity_function) or one
         *  that simply returns whatever it's given. This is primarily used as a
         *  fallback for optional function calls.
         *
         *      $f.identity(1);    // -> 1
         *      $f.identify(true); // -> true
         *      $f.identity();     // -> undefined
         *      
         **/
        identity = function (o) {
            return o;
        },

        /**
         *  array.from(array[, map[, context]]) -> Array
         *  - array (Array | Object): Either an array or an array-like object.
         *  - map (Function): Optional map for converting the array.
         *  - context (Object): Context for the `map`.
         *
         *  Creates an `Array` with all associated methods from an array-like
         *  object.
         *
         *      $a.from(arguments);
         *      // -> [ ... ] (arguments of function as an array)
         *      $a.from(document.getElementsByTagName('a'));
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
         *      $a.from(arrayLike, function (entry) {
         *          return entry.name;
         *      });
         *      // -> ['zero', 'one', 'two']
         *
         *  This function can also be used to copy an existing `Array` such that
         *  modifying the clone will not affect the original.
         *
         *      var a = [];
         *      a.push(1); // a == [1]
         *      var b = $a.from(a);
         *      a.push(2); // a == [1, 2]; b = [1]
         *      b.push(3); // a == [1, 2]; b = [1, 3]
         *
         *  There is a "gotcha" with this function: most of the time, passing an
         *  object that cannot easily be converted into an `Array` will return
         *  an empty `Array` but it appears to break when a `Function` is passed
         *  to be converted. This is because in JavaScript, `Function`s have a
         *  `length` property equivalent to the number of expected arguments.
         *
         *      $a.from($a.from); // -> [undefined, undefined, undefined]
         * 
         **/
        from = Array.from || function (array, map, context) {
            return this.map(array, map || identity, context);
        },

        /** related to: object.values
         *  object.keys(object) -> Array
         *  - object (Object): Object whose keys should be returned.
         *
         *  A simple short-cut to the native `Object.keys()` function. For full
         *  details, check [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys).
         *
         *      var o = {
         *          foo: 1,
         *          bar: 2,
         *          baz: 3
         *      };
         *      $o.keys(o); // -> ['foo', 'bar', 'baz']
         *
         *  Typically, the order of keys in the returned array matches the order
         *  in which the keys were added to the object, but this is convention
         *  rather than standard so should not be relied upon.
         **/
        keys = Object.keys,

        /**
         *  array.isArray(array) -> Boolean
         *  - array (?): Object to test.
         *
         *  A simple short-cut to the native `Array.isArray()` function.For full
         *  details, check [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray).
         *  This of this a a companion method of [[array.isArrayLik]].
         *
         *      $a.isArrayLike([]);                                 // -> true
         *      $a.isArrayLike({length: '0'});                      // -> false
         *      $a.isArrayLike(arguments);                          // -> false
         *      $a.isArrayLike(document.getElementsByTagName('a')); // -> false
         *      $a.isArrayLike('string');                           // -> false
         *      $a.isArrayLike(true);                               // -> false
         *      $a.isArrayLike({foo: 1});                           // -> false
         *      $a.isArrayLike(10);                                 // -> false
         *      
         **/
        isArray = Array.isArray,

        // Tests to see whether or not regular expressions can be called on
        // Functions.
        fnTest = /return/.test(identity) ?
                /[\.'"]\$super\b/ :
                /.*/,

        // Original seed used for the uniqid function.
        origSeed = 123456789 + Math.floor(Math.random() * Date.now()),

        // Create local variable as it may need to be overridden.
        CustomEvent = typeof window.CustomEvent === 'function' ?
                window.CustomEvent :
                (function () {

                    // Polyfill for CustomEvent in IE9 and IE10.
                    // https://developer.mozilla.org/en/docs/Web/API/CustomEvent
                    var CustomEvent = function (event, params) {

                        var evt  = document.createEvent('CustomEvent'),
                            info = params || {
                                bubbles:    false,
                                cancelable: false,
                                detail:     undefined
                            };

                        evt.initCustomEvent(
                            event,
                            info.bubbles,
                            info.cancelable,
                            info.detail
                        );

                        return evt;

                    };

                    CustomEvent.prototype = Object.create(
                        window.Event.prototype
                    );

                    return CustomEvent;

                }()),

        // Less powerful that $o.each but necessary for creating this file.
        forIn = function (obj, handler, context) {

            var prop = '',
                owns = Object.prototype.hasOwnProperty.bind(obj);

            for (prop in obj) {
                if (owns(prop)) {
                    handler.call(context, prop, obj[prop]);
                }
            }

        },

        // Less powerful than $o.extend but necessary for creating this file.
        augment = function (source, additional, isConfig) {

            forIn(additional, isConfig ? function (name, method) {

                Object.defineProperty(source, name, {
                    configurable: false,
                    enumerable:   true,
                    value:        method,
                    writable:     false
                });

            } : function (name, method) {
                source[name] = method;
            });

            return source;

        };

    /**
     *  object.addConfig(object, settings)
     *  - object (Object): Object that should gain configuration values.
     *  - settings (Object): Configuration settings for the object.
     *
     *  Adds configuration settings to an object. As configuration settings, the
     *  properties are enumerable but neither configurable nor writable. This
     *  prevents them being overridden (some browsers even throw a `TypeError`
     *  when attempting to override them).
     *
     *      var o = {};
     *      $o.addConfig(object, {
     *          isReal: true
     *      });
     *
     *      o.isReal; // -> true
     *      o.isReal = false;
     *      o.isReal; // -> true
     *
     *  == Pro tip (Bitmasks) ==
     *
     *  When attempting to create a bitmask, settings should be powers of 2 (1,
     *  2, 4, 8 ...). Writing the settings in hexadecimal literals can save
     *  mentally doubling a number all the time as the pattern is easy to
     *  follow. Start with `1`, `2`, `4` and `8`:
     *
     *      [0x1, 0x2, 0x4, 0x8]; // [1, 2, 4, 8]
     *
     *  ... then add a `0` on the end for the next set:
     *
     *      [0x10, 0x20, 0x40, 0x80]; // [16, 32, 64, 128]
     *
     *  ... and just keep going:
     *
     *      [0x100, 0x200, 0x400, 0x800]; // [256, 512, 1024, 2048]
     *
     *  Settings can be combined using either a bitwise OR operator (`|`) or a
     *  plus operator (`+`, although this is considerably less common). The
     *  order of numbers when being combined is not important.
     *
     *      1 | 2; // 3
     *      2 | 1; // 3
     *
     *  Comparing the numbers should be done with the bitwise `&` operator.
     *
     *      var mask = 2 | 4; // 6
     *      mask & 1; // 0
     *      mask & 2; // 2
     *      mask & 4; // 4
     *      mask & 8; // 0
     *
     **/
    function addConfig(object, settings) {

        this.each(settings, function (key, value) {

            Object.defineProperty(object, key, {
                configurable: false,
                enumerable:   true,
                value:        value,
                writable:     false
            });

        });

    }

    /** related to: Class.addMethods, related to: Class.extend
     *  Class.addMethod(name, method)
     *  - name (String): Name of the method to add.
     *  - method (Function): Function to add.
     *
     *  Adds a method to the current class's `prototype`. As well as simple
     *  convenience, this method also handles the `$super` magic property.
     *
     *      var Foo = $c.create({
     *          init: function (bar) {
     *              this.bar = bar;
     *          }
     *      });
     *      
     *      var inst = new Foo(1);
     *
     *      Foo.addMethod('getBar', function () {
     *          return this.bar;
     *      });
     *
     *      inst.getBar(); // -> 1
     *
     *  To add multiple methods, use [[Class.addMethods]] and add either, use
     *  [[Class.extend]].
     **/
    function addMethod(name, method) {

        var parent = this.parent;

        this.prototype[name] = typeof method === 'function' &&
                typeof parent[name] === 'function' &&
                fnTest.test(method) ?

            function () {

                var hasSuper = '$super' in this,
                    temp     = this.$super,
                    ret      = null;

                this.$super = parent[name];

                ret = method.apply(this, arguments);

                if (hasSuper) {
                    this.$super = temp;
                } else {
                    delete this.$super;
                }

                return ret;

            } :

            method;

    }

    /** related to: Class.addMethod, related to: Class.extend
     *  Class.addMethods(proto)
     *  - proto (Object): Key/Value pairs of names/methods to add.
     *
     *  Helper function for adding multiple methods to a class's `prototype`.
     *
     *      var Foo = $c.create({
     *          init: function (bar) {
     *              this.bar = bar;
     *          }
     *      });
     *      
     *      var inst = new Foo(1);
     *
     *      Foo.addMethods({
     *          getBar: function () {
     *              return this.bar;
     *          }
     *      });
     *
     *      inst.getBar(); // -> 1
     *
     *  To add a single method, use [[Class.addMethod]] and add either, use
     *  [[Class.extend]].
     **/
    function addMethods(proto) {
        forIn(proto, this.addMethod, this);
    }

    /**
     *  array.chunk(array, size[, modifier[, context]]) -> Array
     *  - array (Array): Array to slice.
     *  - size (Number): Size of slices.
     *  - modifier (Function): Function to convert the entries.
     *  - context (Object): Context for the modifier.
     *
     *  Converts an array into an array of arrays, each one of `size` length
     *  (although the last one may be smaller as it will only contain the
     *  remaining entries).
     *
     *      var array = [1, 2, 3, 4, 5, 6, 7];
     *      $a.chunk(array, 3); // -> [ [1, 2, 3], [4, 5, 6], [7] ]
     *
     *  Additionally, a `modifier` may be provided to convert the entries of the
     *  array before they're sliced.
     *
     *      var array = [1, 2, 3, 4, 5, 6, 7];
     *      $a.chunk(array, 3, function (n) { return Math.pow(10, n); });
     *      // -> [ [10, 100, 1000], [10000, 100000, 1000000], [10000000] ]
     * 
     **/
    function chunk(array, size, modifier, context) {

        var arrays = [],
            i      = 0,
            il     = array.length,
            amount = Math.max($n.toNumber(size, 1), 1);

        if (typeof modifier === 'function') {
            array = this.map(array, modifier, context);
        }

        while (i < il) {

            arrays.push(array.slice(i, i + amount));
            i += amount;

        }

        return arrays;

    }

    /**
     *  string.clip(string, maxLength[, bitmask = $s.CLIP_RIGHT]) -> String
     *  - string (String): String to clip.
     *  - maxLength (Number): Maximum length of the string.
     *  - bitmask (Number): Type of clipping.
     *
     *  Clips a string to a maximum length.
     *
     *      $s.clip('abcdefg', 5); // -> "abcde"
     *
     *  If the given string is less than `maxLength`, no action is taken.
     *
     *      $s.clip('abcdefg', 10); // -> "abcdefg"
     *
     *  The function has 3 `bitmask` settings:
     *
     *  - `$s.CLIP_RIGHT` removes characters from the right (default action).
     *  - `$s.CLIP_LEFT` removes characters from the left.
     *  - `$s.CLIP_BOTH` removes characters from both sides (short-cut for
     *    `$s.CLIP_RIGHT | $s.CLIP_LEFT`).
     *
     *  Although it is possible to pass in numbers as opposed to constants, the
     *  constants are guarenteed to work no matter what upgrades may take place.
     *
     *      $s.clip('abcdefg', 5, $s.CLIP_RIGHT); // -> "abcde"
     *      $s.clip('abcdefg', 5, $s.CLIP_LEFT);  // -> "cdefg"
     *      $s.clip('abcdefg', 5, $s.CLIP_BOTH);  // -> "bcdef"
     *
     *  If an equal number of characters cannot be removed from the left and
     *  right when using `$s.CLIP_BOTH`, the additional character is removed
     *  from the right.
     *
     *      $s.clip('abcdefg', 4, $s.CLIP_BOTH); // -> "bcde"
     *
     *  See [[object.addConfig]] for more information about bitmasks.
     **/
    function clip(string, maxLength, bitmask) {

        var clipped = String(string),
            len     = clipped.length,
            start   = 0,
            maxLen  = $n.toPosInt(maxLength),
            mask    = 0;

        if (len > maxLen) {

            mask = $n.toNumber(bitmask, this.CLIP_RIGHT);

            if (mask & this.CLIP_LEFT) {

                start = mask & this.CLIP_RIGHT ?
                        Math.floor((len - maxLen) / 2) :
                        len - maxLen;

            }

            clipped = clipped.substr(start, maxLen);

        }

        return clipped;

    }

    /**
     *  object.clone(object[, bitmask = 0]) -> Object
     *  - object (Object): Object to copy.
     *  - bitmask (Number): Settings for the cloning process.
     *
     *  Copies an object such that changing the copy will not affect the
     *  original.
     *
     *      var obj1 = {foo: 1};
     *      var obj2 = obj1;
     *      obj2.bar = 2; // obj1 and obj2 are {foo: 1, bar: 2}
     *      var obj3 = $o.clone(obj1); // -> {foo: 1, bar: 2}
     *      obj2.baz = 3; // obj1 and obj2 are {foo: 1, bar: 2, baz: 3}
     *                    // obj3 is still {foo: 1, bar: 2}
     *      obj3.blip = 4; // obj3 is {foo: 1, bar: 2, blip: 4}
     *                     // obj1 and obj2 are still {foo: 1, bar: 2, baz: 3}
     *
     *  A `bitmask` can be passed to define the cloning process. The options for
     *  the bitmask are:
     *
     *  - `$o.CLONE_DEEP`: Sets the clone to be a deep copy.
     *  - `$o.CLONE_DESC`: Gives the copied properties the same descriptors.
     *  - `$o.CLONE_ENUM`: Copies the non-enumerable properties.
     *  - `$o.CLONE_NODE`: Clones any DOM nodes.
     *  - `$o.CLONE_INST`: Re-creates [[Class]]es.
     *  - `$o.CLONE_NULL`: Starts from a base of `null` rather than `{}`.
     *
     *  As a bitmask, the options can be combined using the bitwise OR operator
     *  `|` (not to be confused with the logical OR operator `||`).
     *
     *  == $o.CLONE_DEEP ==
     * 
     *  A deep copy checks the `object`'s properties to see if they contain an
     *  `Object` and copy it rather than referencing it.
     *
     *      var obj1 = {foo: {bar: true, baz: true}},
     *          obj2 = $o.clone(obj1),
     *          obj3 = $o.clone(obj1, $o.CLONE_DEEP);
     *
     *      obj2.foo.bar; // -> true
     *      delete obj2.foo.bar;
     *      obj2.foo.bar; // -> undefined
     *      obj1.foo.bar; // -> undefined
     *                    // Oops!
     *
     *      obj3.foo.baz; // -> true
     *      delete obj3.foo.baz;
     *      obj3.foo.baz; // -> undefined
     *      obj1.foo.baz; // -> true
     *                    // Yay!
     *
     *  == $o.CLONE_DESC ==
     * 
     *  A descriptor copy will copy the property descriptors as well as the
     *  properties themselves.
     *
     *      var obj1 = {};
     *      Object.defineProperty(obj1, 'foo', {
     *          configurable: true,
     *          enumerable:   true,
     *          value:        true,
     *          writable:     false // read-only
     *      });
     *      obj1.foo; // -> true
     *      obj1.foo = false;
     *      obj1.foo; // -> true
     *
     *      var obj2 = $o.clone(obj1);
     *      obj2.foo; // -> true
     *      obj2.foo = false;
     *      obj2.foo; // -> false
     *
     *      var obj3 = $o.clone(obj1, $o.CLONE_DESC);
     *      obj3.foo; // -> true
     *      obj3.foo = false;
     *      obj3.foo; // -> true
     *
     *  If the descriptors are not copied, properties will be copied as if the
     *  descriptor set `configurable`, `enumerable` and `writable` to `true`.
     *  This is the same as setting a property using dot or square-brackets
     *  notation (i.e. setting a typical `Object` property).
     *
     *  == $o.CLONE_ENUM ==
     * 
     *  Enumerable properties appear in `for ... in` loops. By default, this
     *  function will not copy the non-enumerable properties, but using the
     *  `$o.CLONE_ENUM` setting will copy them all.
     *
     *      var o1 = {};
     *      Object.defineProperty(o1, 'foo', {
     *          configurable: true,
     *          enumerable:   false, // non-enumerable
     *          value:        true,
     *          writable:     true
     *      });
     *      o1.foo; // -> true
     *      'foo' in o1; // -> true
     *
     *      var o2 = $o.clone(o1);
     *      o2.foo; // -> undefined
     *      'foo' in o2; // -> false
     *
     *      var o3 = $o.clone(o1, $o.CLONE_ENUM);
     *      o3.foo; // -> true
     *      'foo' in o3; // -> true
     *
     *  == $o.CLONE_NODE ==
     * 
     *  By default, DOM Nodes are referenced. To clone a DOM Node when cloning
     *  the object, use the `$o.CLONE_NODE` setting. All children of a cloned
     *  node are also cloned.
     *
     *      var div = document.createElement('div'),
     *          o1  = {node: div},
     *          o2  = $o.clone(o1),
     *          o3  = $o.clone(o1, $o.CLONE_NODE);
     *
     *      o1.node === o2.node; // -> true
     *      o1.node === o3.node; // -> false
     *      o3.node.nodeName; // -> "DIV"
     *
     *  == $o.CLONE_INST ==
     * 
     *  If the object contains a `$clone` method and the `$o.CLONE_INST` setting
     *  is used, the `$clone` method is executed instead of copying the object.
     *  This is mainly advantageous when creating a class using [[$c.create]].
     *  There are one or two caveats when copying an instance - see
     *  [[Class#$clone]] for full details.
     *
     *      var Foo = $c.create({ init: function (name) {this.name = name;} });
     *      var foo = new Foo('foo');
     *      foo.name; // -> "foo"
     *      
     *      var o1 = {inst: foo},
     *          o2 = $o.clone(o1),
     *          o3 = $o.clone(o1, $o.CLONE_INST);
     *
     *      o1.inst === o2.inst; // -> true
     *      o1.inst === o3.inst; // -> false
     *      o3.inst.name; // -> "foo"
     *
     *  == $o.CLONE_NULL ==
     * 
     *  If `$o.CLONE_NULL` is passed, the copy starts from a `null` base, rather
     *  than an object literal (`{}`).
     *
     *      var o1 = {foo: 1},
     *          o2 = $o.clone(o1),
     *          o3 = $o.clone(o1, $o.CLONE_NULL);
     *
     *      o1.hasOwnProperty('foo'); // -> true
     *      o2.hasOwnProperty('foo'); // -> true
     *      o3.hasOwnProperty('foo'); // TypeError
     *                                // o3.hasOwnProperty is not a function
     * 
     *  See [[object.addConfig]] for more information about bitmasks.
     **/
    function clone(object, bitmask) {

        var mask   = $n.toNumber(bitmask, 0),
            isDeep = mask & this.CLONE_DEEP,
            isDesc = mask & this.CLONE_DESC,
            isNode = mask & this.CLONE_NODE,
            isInst = mask & this.CLONE_INST,
            copy   = mask & this.CLONE_NULL ? Object.create(null) : {},
            method = mask & this.CLONE_ENUM ? 'getOwnPropertyNames' : 'keys';

        Object[method](object).forEach(function (key) {

            var value  = object[key],
                isElem = value instanceof HTMLElement,
                desc   = isDesc ?
                    Object.getOwnPropertyDescriptor(object, key) :
                    {
                        configurable: true,
                        enumerable:   true,
                        value:        value,
                        writable:     true
                    };

            if (isDeep) {

                if (Array.isArray(value)) {
                    value = value.concat();
                } else if (value && typeof value === 'object' && !isElem) {
                    value = this.clone(value, mask);
                }

            } else if (isNode && isElem) {
                value = value.cloneNode(true);
            } else if (isInst && typeof value.$clone === 'function') {
                value = value.$clone();
            }

            desc.value = value;

            Object.defineProperty(copy, key, desc);

        }, this);

        return copy;

    }

    /** related to: object.clone
     *  Class#$clone() -> Class
     *
     *  Creates a copy of the instance, taking the original constructor and
     *  creating a new version based on the arguments and settings of the
     *  current class.
     *
     *      var Foo = $c.create({
     *          init: function (name) {
     *              this.name = name;
     *          }
     *      });
     *      var foo = new Foo('foo');
     *      foo.thingy = true;
     *
     *      var clone = foo.$clone();
     *      clone instanceof Foo; // -> true
     *      clone.name; // -> "foo"
     *      clone.thingy; // -> true
     *
     *  Be aware that this is not a live link. Once a clone has been made,
     *  altering the original will not alter the clone.
     *
     *      foo.newThing = 'really new';
     *      foo.newThing; // -> "really new"
     *      clone.newThing; // -> undefined
     *
     *  This method exists to aid [[object.clone]] when the `$o.CLONE_INST`
     *  setting is passed.
     **/
    function cloneInstance(args) {

        return function () {

            var Const = this.constructor;

            function Class(args) {
                return Const.apply(this, args);
            }

            Class.prototype = Const.prototype;

            return augment(new Class(args), this);

        }

    }

    /**
     *  array.compact(array) -> Array
     *  - array (Array): Array to compact.
     *
     *  Compacts an array to remove empty entries. An empty entry is one that is
     *  either `null`, `undefined` or doesn't have a corresponding key.
     *
     *      var arr = [0, 1, 2, null, 4, undefined, 6];
     *      delete arr[1];
     *      // arr = [0, undefined, 2, null, 4, undefined, 6]
     *      $a.compact(arr); // -> [0, 2, 4, 6]
     * 
     **/
    function compact(array) {

        return this.filter(array, function (entry) {
            return entry !== null && entry !== undefined;
        });

    }

    /**
     *  class.create([Base], proto) -> Function
     *  - Base (Function): Constructor to use as a base.
     *  - proto (Object): Prototype for the new class.
     *
     *  Creates a new class. The `init` method is used as the constructor if it
     *  exists.
     *
     *      var Foo = $c.create({
     *          init: function (bar) {
     *              this.bar = bar;
     *          }
     *      });
     *
     *      var inst = new Foo(1);
     *      inst.bar; // -> 1
     *
     *  Because `init` is essential for a class's operation, a basic
     *  "no-operation" will be added (see [[$f.noop]]).
     *
     *      var Fii = $c.create({
     *          add5: function (n) {
     *              return n + 5;
     *          }
     *      });
     *
     *      var flop = new Fii();
     *      flop.add5(5); // -> 10
     * 
     *  To inherit from another class, simply provide a `Base`.
     *
     *      var Bar = $c.create(Foo, {
     *          getBar: function () {
     *              return this.bar;
     *          }
     *      });
     *
     *      var inst2 = new Bar(2);
     *      inst2.getBar(); // -> 2
     *
     *  When inheriting, all methods are granted access to a magical `$super`
     *  property. This property will call the parent's method and allow
     *  arguments to be passed through.
     *
     *      var Baz = $c.create(Bar, {
     *
     *          init: function (bar, baz) {
     *
     *              this.$super(bar);
     *              this.baz = baz;
     * 
     *          }
     * 
     *      });
     *
     *      var inst3 = new Baz(3, 4);
     *      inst3.getBar(); // -> 3
     *      inst3.baz; // -> 4
     *
     *  After creation, a class can have methods added to it using
     *  [[Class.addMethod]], [[Class.addMethods]] or [[Class.extend]]. Classes
     *  also have a hidden [[Class#clone]] method so it can be duplicated.
     *  Additionally, classes have a `parent` property which is a direct link to
     *  the super-class' `prototype`.
     **/
    function createClass(Base, proto) {

        // Base function for the new class. All new classes push everything into
        // an init method.
        function Class() {

            var args = arguments;

            Object.defineProperty(this, '$clone', {
                configurable: true,
                enumerable:   false,
                value:        cloneInstance(args),
                writable:     true
            });

            return this.init.apply(this, args);

        }

        // Allow the Base to be optional.
        if (!proto) {

            proto = Base;
            Base  = Object;

        }

        // Expose a prototype extension method that enables the $super magic
        // method.
        augment(Class, {
            addMethod:  addMethod,
            addMethods: addMethods,
            extend:     extendClass,
            parent:     Base.prototype
        });

        // Inherit from Base.
        Class.prototype = Object.create(Base.prototype);

        // Add all methods to the new prototype.
        addMethods.call(Class, proto);

        // Basic constructor hack.
        Class.prototype.constructor = Class;

        // Allow a class to me made without a constructor function.
        if (typeof Class.prototype.init !== 'function') {
            Class.prototype.init = noop;
        }

        // Return the constructor.
        return Class;

    }

    /** related to: function.throttle
     *  function.debounce(func[, wait = 100]) -> Function
     *  - func (Function): Original function to debounce.
     *  - wait (Number): Required duration of inactivity.
     *
     *  A debounced function is limited so it will only execute after there has
     *  been no activity for `wait` amount of milliseconds. Calls during that
     *  activity will update the function that will be called. This is the
     *  sister function to [[$f.throttle]] but whereas [[$f.throttle]] will
     *  execute the function at a reduced rate, `$f.debounce` will only execute
     *  the function once. This function is very useful for times when a
     *  function may be called too frequently and only the end result is
     *  required.
     *
     *  Consider the following code:
     *
     *      function logArg(arg) {
     *          console.log(arg);
     *      }
     *
     *      var debounced = $f.debounce(logArg);
     *
     *      debounced(0);
     *      window.setTimeout(function () { debounced(1); },  50);
     *      window.setTimeout(function () { debounced(2); }, 100);
     *      window.setTimeout(function () { debounced(3); }, 150);
     *      window.setTimeout(function () { debounced(4); }, 200);
     *      window.setTimeout(function () { debounced(5); }, 250);
     *
     *  The code in the example above will log out `5` after approximately 350
     *  milliseconds. (`debounced` will only execute after no activity for the
     *  default 100 milliseconds, 250 milliseconds was the last activity, 100 +
     *  250 = 350).
     *
     *  Consider changing the example above so `debounced` is set like this:
     *
     *      var debounced = $f.debounced(logArg, 25);
     *
     *  The updated example will log all numbers as there is no activity for 25
     *  milliseconds each time.
     *
     *  For a comparison of throttling vs. debouncing, see the example on [this
     *  page](http://loopinfinito.com.br/2013/09/24/throttle-e-debounce-patterns-em-javascript/).
     **/
    function debounce(func, wait) {

        var timeout  = null,
            interval = $n.toNumber(wait, 100);

        return function() {

            var context = this,
                args    = arguments;

            window.clearTimeout(timeout);

            timeout = window.setTimeout(function () {

                timeout = null;
                func.apply(context, args);

            }, interval);

        };

    }

    /**
     *  object.each(object, handler[, context])
     *  - object (Object): Object to interate over.
     *  - handler (Function): Handler to call for each object key/value pair.
     *  - context (Object): Optional context for the handler.
     *
     *  A function that iterates over all entries in an object. Only the
     *  object's own properties are included (none of the inherited
     *  properties). Be warned that different browsers will order object
     *  properties in different ways. Convention dictates that properties
     *  should be given in the order in which they are set, but no ECMAScript
     *  specification defines this. Therefore, the order of the key/value
     *  pairs should never be relied upon.
     *
     *      $o.each({foo: 1, bar: 2}, function (key, value) {
     *          // if key is "foo", value will be 1.
     *          // if key is "bar", value will be 2.
     *      });
     *
     *  There are times when the ability to stop the loop may be wanted. In
     *  these situations, the function should return `false`. This will stop the
     *  `handler` being called for any remaining object entries.
     *
     *      var firstKey = '';
     *      $o.each({foo: 1, bar: 2}, function (key, value) {
     *          firstKey = key;
     *          return false;
     *      });
     *      // firstKey is now either "foo" or "bar".
     * 
     **/
    function each(object, handler, context) {

        var prop = '',
            owns = this.makeOwns(object);

        for (prop in object) {

            if (owns(prop) &&
                    handler.call(context, prop, object[prop]) === false) {

                break;

            }

        }

    }

    /**
     *  array.every(array, handler[, context]) -> Boolean
     *  - array (Array): Array or array-like object over which to iterate
     *  - handler (Function): Function to call on each entry of the array.
     *  - context (Object): Context for the handler.
     *
     *  Identical to calling the native `Array.prototype.every` with `array` as
     *  its context. This function is handy for iterating over array-like
     *  objects as well as arrays (something that `Array.prototype.every` can
     *  handle, but the array-like objects rarely have a "every" method).
     *
     *      $a.every([1, 2, 3], $n.isNumeric);                   // -> true
     *      $a.every([100, true, 'a'], $n.isNumeric);            // -> false
     *      $a.every({'0': 1, '1': 2, length: 2}, $n.isNumeric); // -> true
     *
     *  A potential "gotcha" is that, according to the standards,
     *  `Array.prototype.every` should default to returning `true` until
     *  a test fails. This has the curious effect of always returning `true` for
     *  empty arrays.
     *
     *      $a.every([], $n.isNumeric); // -> true
     *      var a = [];
     *      a.length = 10;
     *      $a.every(a, $n.isNumeric); // -> true
     *      
     **/
    function every(array, handler, context) {
        return Array.prototype.every.call(array, handler, context);
    }

    /** related to: array.Context
     *  array.exec(array[, context[, args]])
     *  - array (Array): List of functions to execute.
     *  - context (Object): Context for the functions.
     *  - args (Array): Arguments to pass to the functions.
     *
     *  Executes a list of functions in their own execution context. See
     *  [[Context]] for more information.
     **/
    function exec(array, context, args) {

        var con = new Context(array, context, args);

        con.run();
        con.free();

    }

    /**
     *  object.extend(object[, extension1[, extension2]]) -> Object
     *  - object (Object): Source object to extend.
     *
     *  Extends one object with the properties of others. This function takes
     *  any number of arguments, the important thing to remember is that the
     *  first argument is the one being changed.
     *
     *      var obj1 = {foo: 1};
     *      var obj2 = {bar: 2};
     *      $.extend(obj1, obj2);
     *      // -> {foo: 1, bar: 2}
     *      // obj1 is now {foo: 1, bar: 2}; obj2 is still {bar: 2}
     *
     *  The function will take any number of arguments and add them all to the
     *  original.
     *
     *      var obj1 = {foo: 1};
     *      var obj2 = {bar: 2};
     *      var obj3 = {baz: 3};
     *      $.extend(obj1, obj2, obj3);
     *      // -> {foo: 1, bar: 2, baz: 3}
     * 
     *  Matching properties will be over-written by subsequent arguments in the
     *  order they were supplied to the function.
     *
     *      var obj1 = {foo: 1};
     *      var obj2 = {foo: 2};
     *      var obj3 = {foo: 3};
     *      $.extend(obj1, obj2, obj3);
     *      // -> {foo: 3}
     * 
     **/
    function extend(object) {

        $a.slice(arguments, 1).forEach(function (ext) {

            this.each(ext, function (key, value) {
                object[key] = value;
            });

        }, this);

        return object;

    }

    /**
     *  Class.extend(name[, method])
     *  - name (String|Object): Name of the method to add, or all methods to add.
     *  - method (Function): Function to add, if `name` is a `String`.
     *
     *  Helper function either adding a single method to a class or multiple.
     *  Although using [[Class.addMethod]] or [[Class.addMethods]] may be
     *  slightly faster, this method can be more convenient.
     **/
    function extendClass(name, method) {

        if (name && typeof name === 'object') {
            addMethods.call(this, name);
        } else {
            addMethod.call(this, name, method);
        }

    }

    /**
     *  array.filter(array, handler[, context]) -> Array
     *  - array (Array): Array or array-like object over which to iterate
     *  - handler (Function): Function to call on each entry of the array.
     *  - context (Object): Context for the handler.
     *
     *  Identical to calling the native `Array.prototype.filter` with `array` as
     *  its context. This function is handy for iterating over array-like
     *  objects as well as arrays (something that `Array.prototype.filter` can
     *  handle, but the array-like objects rarely have a "filter" method).
     *
     *      $a.filter([1, '2', 'three', 1e4], $n.isNumeric); // [1, '2', 1e4]
     *      $a.filter(
     *          {'0': 1, '1': '2', '2': 'three', '3' 1e4, length: 4},
     *          $n.isNumeric
     *      ); // [1, '2', 1e4]
     *      
     **/
    function filter(array, handler, context) {
        return Array.prototype.filter.call(array, handler, context);
    }

    /**
     *  array.first(array[, filter[, context]]) -> ?
     *  - array (Array): Array whose first item should be returned.
     *  - filter (Function): Optional filter.
     *  - context (Object): Context for the filter
     *
     *  Finds the first entry in an array.
     *
     *      var array = [true, 2, '5', 'ten', null];
     *      $a.first(array); // -> true
     *
     *  The `filter` function can be used to check the entries of an array and
     *  find the first one that satisfies the result. The `filter` will take
     *  each entry in the array as its only argument and should return a Boolean.
     *
     *      var array = [true, 2, '5', 'ten', null];
     *      $a.first(array, $n.isNumeric); // -> 2
     *
     *  To get the last value in an array, use [[array.last]].
     **/
    function first(array, filter, context) {

        var i     = 0,
            il    = array.length,
            owns  = null,
            index = 0;

        if (typeof filter === 'function') {

            index  = -1;
            owns   = $o.makeOwns(array);
            filter = filter.bind(context);

            while (i < il) {

                if (owns(i) && filter(array[i])) {

                    index = i;
                    break;

                }

                i += 1;

            }

        }

        return array[index];

    }

    /**
     *  array.forEach(array, handler[, context])
     *  - array (Array): Array or array-like object over which to iterate
     *  - handler (Function): Function to call on each entry of the array.
     *  - context (Object): Context for the handler.
     *
     *  Designed to work exactly the same as the native method
     *  `Array.prototype.forEach` except that if `handler` returns `false` then
     *  the loop is stopped.
     *
     *      $a.forEach([1, 2, 3], console.log, console);
     *      // logs 1 then 2 then 3
     *      $a.forEach('abc', console.log, console);
     *      // logs 'a' then 'b' then 'c'
     *      $a.forEach([1, 2, 3], function (num) {
     *          console.log(num);
     *          return num !== 2;
     *      });
     *      // logs 1 then 2; 3 is not logged
     *
     **/
    function forEach(array, handler, context) {
        
        this.some(array, function () {
            return handler.apply(context, arguments) === false;
        });

    }

    /**
     *  array.indicesOf(array, search[, offset = 0]) -> Array
     *  - array (Array): Array through which to search.
     *  - search (?): Item to search for.
     *  - offset (Number): Offset for searching.
     *
     *  Finds all cases of `search` appearing in `array`. This is similar to the
     *  native `Array.prototype.indexOf` except there is no offset argument and
     *  this function returns all indicies.
     *
     *      var array = ['a', 2, true, 'a', null, 10, 'a'];
     *      $a.indiciesOf(array, 'a'); // -> [0, 3, 6]
     *
     *  If the `search` is not found in `array`, an empty Array is returned.
     * 
     *      $a.indiciesOf(array, 5); // -> []
     *
     *  An offset can be defined to act as a starting point for the search.
     *  Indicies that occur before the offset will be ignored.
     *
     *      $a.indiciesOf(array, 'a', 1); // -> [3, 6]
     * 
     **/
    function indiciesOf(array, search, offset) {

        var arr     = this.from(array),
            indices = [],
            index   = arr.indexOf(search, $n.toNumber(offset, 0));

        while (index > -1) {

            indices.push(index);
            index = arr.indexOf(search, index + 1);

        }

        return indices

    }

    /** related to: array.pluck
     *  array.invoke(array, method[, arg1[, arg2]]) -> Array
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
     *      $a.invoke(array, 'toUpperCase'); // -> ['ONE', 'TWO', THREE']
     *      $a.invoke(array, 'slice', 1); // -> ['ne', 'wo', 'hree']
     *
     *  To get a property rather than executing a method, use the
     *  [[array.pluck]] method.
     **/
    function invoke(array, method) {

        var args = this.slice(arguments, 2);

        return this.map(array, function (entry) {
            return entry[method].apply(entry, args);
        });

    }

    /**
     *  object.is(value1, value2) -> Boolean
     *  - value1 (?): First value to test.
     *  - value2 (?): Second value to test.
     *
     *  Checks to see if two variables have the same value.
     *
     *      $o.is('1', '1'); // -> true
     *      $o.is(1, '1'); // -> false
     *
     *  In many ways this works the same as the strict equality operator (`===`)
     *  with a couple of notable exceptions.
     *
     *      $o.is(NaN, NaN); // -> true
     *      $o.is(0, -0); // -> false
     *
     *  See [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is)
     *  for more information.
     **/
    function is(value1, value2) {

        return value1 === 0 && value2 === 0 ?
            1 / value1 === 1 / value2 :
            value1 !== value1 ?
                value2 !== value2 :
                value1 === value2;

    }

    /**
     *  array.isArrayLike(array) -> Boolean
     *  - array (?): Object to test.
     *
     *  Checks to see if an object is array-like, i.e. it could be converted
     *  into an Array using [[array.from]]. Think of this function as a
     *  companion method for [[array.isArray]].
     *
     *      $a.isArrayLike([]);                                 // -> true
     *      $a.isArrayLike({length: '0'});                      // -> true
     *      $a.isArrayLike(arguments);                          // -> true
     *      $a.isArrayLike(document.getElementsByTagName('a')); // -> true
     *      $a.isArrayLike('string');                           // -> true
     *      $a.isArrayLike(true);                               // -> false
     *      $a.isArrayLike({foo: 1});                           // -> false
     *      $a.isArrayLike(10);                                 // -> false
     * 
     **/
    function isArrayLike(array) {

        return array !== null && array !== undefined &&
            $n.isNumeric(array.length);

    }

    /**
     *  object.isEmpty(object) -> Boolean
     *  - object (Object): Object to check.
     *
     *  Checks to see if the given object has any properties. If so, this
     *  function will return `false`.
     *
     *      var obj1 = {};
     *      var obj2 = {foo: 1};
     *      $o.isEmpty(obj1); // -> true
     *      $o.isEmpty(obj2); // -> false
     * 
     *  Only own properties are checked so an object with inherited properties
     *  may still be considered empty.
     *
     *      var obj1 = {foo: 1};
     *      var obj2 = Object.create(obj1);
     *      $o.isEmpty(obj1); // -> false
     *      $o.isEmpty(obj2); // -> true
     *      obj2.foo; // -> 1
     * 
     **/
    function isEmptyObject(object) {

        var isEmpty = true;

        this.each(object, function () {

            isEmpty = false;

            return false;

        });

        return isEmpty;

    }

    /**
     *  number.isNumeric(number) -> Boolean
     *  - number (?): Object to test.
     *
     *  Checks to see if the given object is numeric. This does not mean that
     *  the object is a number, but rather that the object could be used as a
     *  number.
     *
     *      $n.isNumeric(1);    // -> true
     *      $n.isNumeric('1');  // -> true
     *      $n.isNumeric(0x10); // -> true
     *      $n.isNumeric(1e4);  // -> true
     *      $n.isNumeric(NaN);  // -> false
     *      $n.isNumeric('');   // -> false
     *      $n.isNumeric(1/0);  // -> false
     * 
     **/
    function isNumeric(number) {
        return !isNaN(parseFloat(number)) && isFinite(number);
    }

    /**
     *  array.last(array[, filter[, context]]) -> ?
     *  - array (Array): Array whose last item should be returned.
     *  - filter (Function): Optional filter.
     *  - context (Object): Context for the filter.
     *
     *  Finds the last entry in an array.
     *
     *      var array = [true, 2, '5', 'ten', null];
     *      $a.last(array); // -> null
     *
     *  The `filter` function can be used to check the entries of an array and
     *  find the last one that satisfies the result. The `filter` will take each
     *  entry in the array as its only argument and should return a Boolean.
     *
     *      var array = [true, 2, '5', 'ten', null];
     *      $a.last(array, $n.isNumeric); // -> '5'
     *
     *  To get the first entry of an array, use [[array.first]].
     **/
    function last(array, filter, context) {

        var il    = array.length,
            owns  = null,
            index = il - 1;

        if (typeof filter === 'function') {

            index  = -1;
            owns   = $o.makeOwns(array);
            filter = filter.bind(context);

            while (il) {

                if (owns(il) && filter(array[il])) {

                    index = il;
                    break;

                }

                il -= 1;

            }

        }

        return array[index];

    }

    /**
     *  function.lock(func[, context[, args]]) -> Function
     *  - func (Function): Function to lock.
     *  - context (Object): Context for the function.
     *  - args (Array): Arguments for the function.
     *
     *  Locks a function so it will always execute with the given `context` and
     *  arguments. It's useful when a possibly unknown or dynamic number of
     *  arguments is required. If the arguments are known, it is faster to use
     *  [Function.prototype.bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
     *
     *      function adder(a, b) {
     *          return a + b;
     *      }
     *
     *      var add5and10 = $f.lock(adder, null, [5, 10]);
     *      add5and10(); // -> 15
     * 
     **/
    function lock(func, context, args) {

        return Function.prototype.bind.apply(
            func,
            [context].concat($a.from(args))
        );

    }

    /**
     *  function.makeConstant(returnValue) -> Function
     *  - returnValue (?): The value to return.
     *
     *  When coding, it may be necessary to create a constant function (one that
     *  always returns the same value). For these situations, this function will
     *  create that one.
     *
     *      var returnTrue = $f.makeConstant(true);
     *      returnTrue();          // -> true
     *      returnTrue(false);     // -> true (all arguments are ignored)
     *      returnTrue.call(null); // -> true (context is ignored)
     * 
     **/
    function makeConstant(returnValue) {
        return this.identity.bind(null, returnValue);
    }

    /**
     *  array.makeInvoker(context) -> Function
     *  - context (Object): Context for the invoker.
     *
     *  Creates a function similar to [[array.invoke]] but bound to a certain
     *  context. This fires the context's method for each entry of the array,
     *  rather than a method on the array entry itself.
     *
     *      var obj = {
     *          add: function (a, b) {
     *              return a + b;
     *          },
     *          add5: function (a) {
     *              return this.add(a, 5);
     *          }
     *      };
     *      var invoke = $a.makeInvoker(obj);
     *      invoke([1, 2, 3], 'add5'); // -> [6, 7, 8]
     *
     **/
    function makeInvoker(context) {

        var that = this;

        return function (array, method) {

            var args = that.slice(arguments, 2);

            return that.map(array, function (entry) {
                return context[method].apply(context, [entry].concat(args));
            });

        };

    };

    /**
     *  object.makeOwns(object) -> Function
     *  - object (?): Object to be bound to `Object.prototype.hasOwnProperty`.
     *
     *  Makes a function that will check a given object has the properties
     *  passed to the resulting function.
     *
     *      var object = {foo: 1};
     *      var owns = $o.makeOwns(object);
     *      owns('foo'); // -> true
     *      owns('bar'); // -> false
     *
     *  It is worth being aware that in JavaScript, all variables inherit from
     *  `Object.prototype`. Therefore, this function can be applied to variable
     *  types other than `Object`.
     *
     *      var array = [1, 2, 3];
     *      var owns = $o.owns(array);
     *      owns(0); // -> true
     *      delete array[1];
     *      // array is now [1, undefined, 3] with no '1' property
     *      owns(1); // -> false
     * 
     **/
    function makeOwns(object) {
        return Object.prototype.hasOwnProperty.bind(object);
    }

    /**
     *  array.map(array, handler[, context]) -> Array
     *  - array (Array): Array or array-like object over which to iterate
     *  - handler (Function): Function to call on each entry of the array.
     *  - context (Object): Context for the handler.
     *
     *  Identical to calling the native `Array.prototype.map` with `array` as
     *  its context. This function is handy for iterating over array-like
     *  objects as well as arrays (something that `Array.prototype.map` can
     *  handle, but the array-like objects rarely have a "map" method).
     *
     *      $a.map([1, '2', 'three', 1e4], $n.isNumeric);
     *      // -> [true, true, false, true]
     *      $a.map(
     *          {'0': 1, '1': '2', '2': 'three', '3': 1e4, length: 4},
     *          $n.isNumeric
     *      );
     *      // -> [true, true, false, true]
     *      
     **/
    function map(array, handler, context) {
        return Array.prototype.map.call(array, handler, context);
    }

    /**
     *  function.noop()
     *
     *  A "NO-OPeration" function. Takes no arguments, returns nothing. This is
     *  mainly useful for situations where a default function is required with
     *  the expectation being that the function will be overridden by a setting
     *  or argument later on.
     *
     *      $f.noop();          // -> undefined
     *      $f.noop(true);      // -> undefined (arguments are ignored)
     *      $f.noop.call(null); // -> undefined (context is ignored)
     * 
     **/
    function noop() {
        return;
    }

    /**
     *  string.pad(string, minLength[, padding = '0'[, bitmask = $s.PAD_RIGHT]]) -> String
     *  - string (String): Original string to pad.
     *  - minLength (Number): Minimum length of the  final string.
     *  - padding (String): String to use for padding.
     *  - bitmask (Number): Type of padding to employ.
     *
     *  Increases the length of a string to the given `minLength`. If the string
     *  is already as long as (or longer) than the given `minLength`, no action
     *  is taken. If no padding is given, `'0'` is assumed.
     *
     *      $s.pad('abcde', 10, '-'); // -> "abcde-----"
     *      $s.pad('abcde', 1, '-');  // -> "abcde"
     *      $s.pad('abcde', 10);      // -> "abcde00000"
     *
     *  Padding is clipped so only the necessary part of it is added to increase
     *  the given string to the minimum length.
     *
     *      $s.pad('abcdefg', 8, '!£$%'); // -> "abcdefg!"
     *
     *  There are 3 types of padding that can be used:
     *
     *  - `$s.PAD_RIGHT` adds characters to the right (default action).
     *  - `$s.PAD_LEFT` adds characters to the left.
     *  - `$s.PAD_BOTH` adds characters to both sides (short-cut for
     *    `$s.PAD_RIGHT | $s.PAD_LEFT`).
     * 
     *      $s.pad('abcde', 10, '-', $s.PAD_RIGHT); // -> "-----abcde"
     *      $s.pad('abcde', 10, '-', $s.PAD_LEFT);  // -> "abcde-----"
     *      $s.pad('abcde', 10, '-', $s.PAD_BOTH);  // -> "--abcde---"
     *
     *  See [[object.addConfig]] for more information about bitmasks.
     **/
    function pad(string, minLength, padding, bitmask) {

        var str     = String(string),
            dif     = $n.toPosInt(minLength) - str.length,
            left    = '',
            right   = '',
            lDif    = dif,
            rDif    = dif,
            filler  = typeof padding === 'string' ||
                    typeof padding === 'number' ?
                String(padding) :
                '0',
            mask    = 0,
            isLeft  = false,
            isRight = false;

        if (dif > 0) {

            mask    = $n.toNumber(bitmask, this.PAD_RIGHT);
            isLeft  = mask & this.PAD_LEFT;
            isRight = mask & this.PAD_RIGHT;

            if (isLeft && isRight) {

                lDif = Math.floor(dif / 2);
                rDif = Math.ceil(dif / 2);

            }

            left  = isLeft  ? this.clip(this.repeat(filler, lDif), lDif) : '';
            right = isRight ? this.clip(this.repeat(filler, rDif), rDif) : '';

        }

        return left + str + right;

    }

    /**
     *  array.partition(array, handler[, context]) -> Array
     *  - array (Array): Array to partition.
     *  - handler (Function): Function to partition the array.
     *  - context (Object): Context for the handler.
     *
     *  Splits an array or array-like object into entries that satisfy the
     *  `handler` and those that don't.
     *
     *      var array = ['1', 4, 'six', 'twelve', 19, '40', 1e4];
     *      $a.partition(array, $n.isNumeric);
     *      // -> [ ['1', 4, 19, '50', 1e4], ['six', 'twelve'] ]
     * 
     **/
    function partition(array, handler, context) {

        var trues  = [],
            falses = [];

        $a.forEach(array, function (entry, i, arr) {
            (handler.call(context, entry, i, arr) ? trues : falses).push(entry);
        });

        return [trues, falses];

    }

    /** related to: array.invoke
     *  array.pluck(array, property[, value]) -> Array|Object
     *  - array (Array): Array to iterate over.
     *  - property (String): Property to retrieve.
     *  - value (String): Property name.
     *
     *  This method gets a property from the entries in an array.
     *
     *      $a.pluck(['one', 'two', 'three', 'four', 'five'], 'length');
     *      // -> [3, 3, 5, 4, 4]
     *      $a.pluck(['one', 'two', 'three', 'four', 'five'], 'not-real');
     *      // -> [undefined, undefined, undefined, undefined, undefined]
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
     *      $a.pluck(arr, 'name', 'value');
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
     *      $a.pluck(arr, 'name', 'value');
     *      // -> {foo: 3, bar: 2}
     *
     *  To execute a method rather than accessing a property, use the
     *  [[array.invoke]] method.
     **/
    function pluck(array, property, value) {

        var map = {};

        if (typeof value === 'string') {

            this.forEach(array, function (entry) {
                map[entry[property]] = entry[value];
            });

        } else {

            map = this.map(array, function (entry) {
                return entry[property];
            });

        }

        return map;

    }

    /**
     *  array.remove(array) -> Array
     *  - array (Array): Array that should have items removed.
     *
     *  Removes items from an array, if they are found. The original array is
     *  not affected.
     *
     *      var array = [1, 2, 3, 4, 5, 6];
     *      var filtered = $a.remove(array, 2, 5, 8); // -> [1, 3, 4, 6]
     *
     **/
    function remove(array) {

        return this.partition(array, function (entry) {
            return this.indexOf(entry) < 0;
        }, this.slice(arguments, 1))[0];

    }

    /**
     *  string.repeat(string, times) -> String
     *  - string (String): String to repeat.
     *  - times (Number): Number of times to repeat the string.
     *
     *  Repeats the given `string` `times` number of times.
     *
     *      $s.repeat('abc', 3); // -> "abcabcabc"
     *      
     **/
    function repeat(string, times) {
        return Array($n.toNumber(times, 0) + 1).join(string);
    }

    /**
     *  array.shuffle(array) -> Array
     *  - array (Array): Array to shuffle.
     *
     *  Shuffles the entries of an array or array-like object. The original
     *  array remains unchanged. The shuffling algorythm is the [Fisher-Yates
     *  Shuffle](http://bost.ocks.org/mike/shuffle/).
     *
     *      var array = [1, 2, 3, 4, 5, 6, 7];
     *      $a.shuffle(array); // -> [4, 7, 1, 5, 2, 3, 6] possibly
     * 
     **/
    function shuffle(array) {

        var shuffled = this.from(array),
            length   = shuffled.length,
            temp     = null,
            index    = 0;

        while (length) {

            index = Math.floor(Math.random() * length);
            length -= 1;

            temp = shuffled[length];
            shuffled[length] = shuffled[index];
            shuffled[index]  = temp;

        }

        return shuffled;

    }

    /**
     *  array.slice(arrayLike[, begin[, end]]) -> Array
     *  - arrayLike (Array | Object): Array-like object to slice.
     *  - begin (Number): Starting point for the slice.
     *  - end (Number): Ending point for the slice.
     *
     *  This is a helper function for converting an array-like object into an
     *  `Array` and taking a slice of it. A common use-case is below:
     *
     *      $a.slice(arguments, 1);
     *      // -> [ ... ] (All arguments except the first)
     *
     *  The `begin` and `end` arguments are optional and act in the same way as
     *  the native [Array.prototype.slice](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/slice).
     *  If provided, `begin` defines a start point for the slice (a negative
     *  `begin` will start from the end of the array) and `end` will act as the
     *  end of the array. If ommitted, `begin` acts like 0 and `end` acts like
     *  `arrayLike.length`. See the external like for more details.
     **/
    function slice(arrayLike, begin, end) {
        return this.from(arrayLike).slice(begin, end);
    }

    /**
     *  array.some(array, handler[, context]) -> Boolean
     *  - array (Array): Array or array-like object over which to iterate
     *  - handler (Function): Function to call on each entry of the array.
     *  - context (Object): Context for the handler.
     *
     *  Identical to calling the native `Array.prototype.some` with `array` as
     *  its context. This function is handy for iterating over array-like
     *  objects as well as arrays, something that `Array.prototype.some` can
     *  handle, but the array-like objects rarely have a "some" method.
     *
     *      $a.some([1, '2', 'three', 1e4], $n.isNumeric); // -> true
     *      $a.some(
     *          {'0': 1, '1': '2', '2': 'three', '3': 1e4, length: 4},
     *          $n.isNumeric
     *      ); // -> true
     *
     *  A potential "gotcha" is that, according to the standards,
     *  `Array.prototype.some` will default to returning `false` until a test is
     *  passed. This has the curious effect of always returning `false` for
     *  empty arrays.
     *
     *      function test(a) {
     *          return a !== 'real';
     *      }
     *      $a.some([], test); // -> false
     *      var a = [];
     *      a.length = 10;
     *      $a.some(a, test); // false
     *      
     **/
    function some(array, handler, context) {
        return Array.prototype.some.call(array, handler, context);
    }

    /** related to: Template
     *  string.supplant(string, map[, pattern]) -> String
     *  - string (String): String to interpolate.
     *  - map (Object): Map of placeholders to replacements for the string.
     *  - pattern (RegExp): Pattern for placeholder.
     *
     *  A convenient wrapper for [[$s.Template]].
     * 
     *      var string = 'Testing #{framework}';
     *      var map = {framework: 'Song'};
     *      $s.supplant(string, map); // -> 'Testing Song'
     *
     *  Repeated calls to the same string will be more efficient if created
     *  by saving a call to `new [[Template]]()` in a variable and later
     *  referencing that variable, but this convenience method can seem less
     *  heavy than constructing a class and evaluating the string, especially
     *  for one-off replacements.
     **/
    function supplant(string, map, pattern) {
        return new this.Template(string, pattern).evaluate(map);
    }

    /** related to: $f.debounce
     *  function.throttle(func[, wait = 100]) -> Function
     *  - func (Function): Function to throttle.
     *  - wait (Number): Limit to the frequency of execution.
     *
     *  A throttled function will execute when called but will not execute again
     *  until `wait` milliseconds have passed. This is the sister function to
     *  [[$f.debounce]] but whereas [[$f.debounce]] will wait until there has
     *  been no activity for a certain amount of time and execute the last call,
     *  `$f.throttle` will execute as long as there is activity, but only once
     *  within the `wait` time. It is useful for situations where a function may
     *  be executed very frequently (such as one bound to mousemove or scroll
     *  events) and a less regular frequency of execution is desired.
     *
     *  Consider the following code:
     *
     *      function logArg(arg, time) {
     *          console.log('arg = %o sent at %d', arg, time);
     *      }
     * 
     *      var throttled = $f.throttle(logArg);
     * 
     *      throttled(0);
     *      window.setTimeout(function () { throttled(1); },  50);
     *      window.setTimeout(function () { throttled(2); }, 100);
     *      window.setTimeout(function () { throttled(3); }, 150);
     *      window.setTimeout(function () { throttled(4); }, 200);
     *      window.setTimeout(function () { throttled(5); }, 250);
     *
     *  In the example, `throttled` will log `0` at 0 milliseconds, `2` at 100
     *  milliseconds, `4` at 200 milliseconds and `5` at 350 milliseconds.
     *
     *  Considered updating the example so the `throttled` function is given a
     *  smaller delay:
     *
     *      var throttled = $f.throttle(logArg, 25);
     *
     *  In the updated example, all arguments will be logged out.
     *
     *  For a comparison of throttling vs. debouncing, see the example on [this
     *  page](http://loopinfinito.com.br/2013/09/24/throttle-e-debounce-patterns-em-javascript/).
     **/
    function throttle(func, wait) {

        var interval = $n.toNumber(wait, 100),
            last     = 0,
            timeout  = null;

        return function () {

            var context = this,
                now     = Date.now(),
                args    = arguments;

            if (last && now < last + interval) {

                window.clearTimeout(timeout);

                timeout = window.setTimeout(function () {

                    last = now;
                    func.apply(context, args);

                }, interval);

            } else {

                last = now;
                func.apply(context, args);

            }

        };

    }

    /**
     *  number.times(number, handler[, context])
     *  - number (Number): Number of times to execute the handler.
     *  - handler (Function): Handler to execute.
     *  - context (Object): Context for the handler.
     *
     *  Executes a `handler` multiple times. Each time `handler` is passed the
     *  index of its execution.
     *
     *      $n.times(4, function (i) { console.log(i); });
     *      // logs 0 then 1 then 2 then 3
     *
     *  The number is normalised to handle negative numbers, decimals and
     *  strings.
     *
     *      $n.times(-4, function (i) { console.log(i); });
     *      // logs 0 then 1 then 2 then 3; absolute number used.
     *      $n.times(4.1, function (i) { console.log(i); });
     *      // logs 0 then 1 then 2 then 3; decimal is removed.
     *      $n.times('4', function (i) { console.log(i); });
     *      // logs 0 then 1 then 2 then 3; string coerced into a number.
     *      $n.times(Infinity, function (i) { console.log(i); });
     *      // does nothing; Infinity is not numeric.
     *
     **/
    function times(number, handler, context) {

        var i  = 0,
            il = this.toNumber(number, 0);

        while (i < il) {

            handler.call(context, i);
            i += 1

        }

    }

    /**
     *  number.toNumber(number[, def = NaN]) -> Number
     *  - number (Number|String): Number to convert.
     *  - def (Number): Optional default value.
     *
     *  Converts the given number into a positive integer. If the given `number`
     *  is not numeric, this function will return `def` if `def` is a number or
     *  `NaN` if `def` is not.
     *
     *      $n.toNumber('10', 5);       // -> 10
     *      $n.toNumber('-10.5', 5);    // -> 10
     *      $n.toNumber('ten', 5);      // -> 5
     *      $n.toNumber('ten');         // -> NaN
     *      $n.toNumber('ten', 'five'); // -> NaN
     *
     *  See also: [[number.isNumeric]] and [[number.toPosInt]].
     **/
    function toNumber(number, def) {

        return this.isNumeric(number) ?
            this.toPosInt(number) :
            typeof def === 'number' ? def : NaN;

    }

    /**
     *  number.toPosInt(number) -> Number
     *  - number (Number): Number to convert.
     *
     *  Converts the given number into a positive integer.
     *
     *      $n.toPosInt(10);      // -> 10
     *      $n.toPosInt('10');    // -> 10
     *      $n.toPosInt('-10.5'); // -> 10
     *      $n.toPosInt('ten');   // -> NaN
     *
     **/
    function toPosInt(number) {
        return Math.floor(Math.abs(number));
    }

    /**
     *  array.unique(array) -> Array
     *  - array (Array): Array that should be reduced.
     *
     *  Reduces an array so that only unique entries remain.
     *
     *      $a.unique([1, 2, 1, 3, 1, 4, 2, 5]); // -> [1, 2, 3, 4, 5]
     *
     *  This method also works on array-like structures.
     *
     *      $a.unique('mississippi'); // -> ['m', 'i', 's', 'p']
     * 
     **/
    function unique(array) {
        return Array.prototype.reduce.call(array, unique_checkAndAdd, []);
    }

    // Function called by the reduce method. As its own function, it doesn't
    // need to be re-created each time unique() is called.
    function unique_checkAndAdd(prev, curr) {
        
        if (prev.indexOf(curr) < 0) {
            prev.push(curr);
        }

        return prev;

    }

    /**
     *  string.uniqid([prefix]) -> String
     *  - prefix (String): Optional prefix for the unique ID.
     *
     *  Creates a unique ID.
     *
     *      $s.uniqid(); // -> something like "578ce32f6a9bc"
     *      $s.uniqid(); // -> something like "578ce3306a9bd"
     *      $s.uniqid(); // -> something like "578ce3316a9be"
     *
     *  Optionally a prefix can be given.
     *
     *      $s.uniqid('pre_'); // -> something like "pre_578ce3326a9bf"
     *      $s.uniqid('pre_'); // -> something like "pre_578ce3336a9c0"
     *      $s.uniqid('pre_'); // -> something like "pre_578ce3346a9c1"
     *
     **/
    function uniqid(prefix) {

        var start = Date.now().toString(16).slice(-8),
            end   = this.clip(origSeed.toString(16), 5, this.CLIP_LEFT),
            begin = typeof prefix === 'string' || typeof prefix === 'number' ?
                    String(prefix) :
                    '';

        origSeed += 1;

        return begin + start + end;

    }

    /**
     *  object.values(object) -> Array
     *  - object (Object): Object whos values should be returned.
     *
     *  Returns the values of the given `object`. Think of this as the opposite
     *  of [[object.keys]].
     *
     *      var obj = {foo: 1, bar: 2, baz: 3};
     *      $o.keys(obj); // -> ['foo', 'bar', 'baz']
     *      $o.values(obj); // -> [1, 2, 3];
     *      
     **/
    function values(object) {

        return this.keys(object).map(function (key) {
            return object[key];
        });

    }

    /** related to: array.exec, alias of: array.Context
     *  class Context
     *
     *  Creates an individual execution context for each function in a given
     *  array of functions. This allows one function in the chain to throw an
     *  `Error` without disrupting the others or preventing them from executing.
     *  The system works by listening for a [[Context#name]] event firing on the
     *  [[Context#dummy]] element. When the event fires, the listener executes
     *  the function stored in [[Context#handler]] (within the context of
     *  [[Context#context]] and passing in [[Context#args]]).
     *
     *  To better understand this, consider an example. Assume that this exists:
     *
     *      function log(text, isError) {
     *          document.body.innerHTML += (isError ?
     *              '<p style="color:red;">' : '<p>') + text + '</p>';
     *      }
     *
     *      window.onerror = function (msg) {
     *          log(msg, true);
     *      };
     *
     *  Now consider this array of functions:
     *
     *      var funcs = [
     *          function () {
     *              log('one');
     *              NOT_REAL++;
     *          },
     *          function () {
     *              log('two');
     *          }
     *      ];
     *
     *  Executing the functions in a loop will create a response live this:
     *
     *      for (var i = 0, il = funcs.length; i < il; i += 1) {
     *          funcs[i]();
     *      }
     *      // Generates:
     *      // <p>One</p>
     *      // <p style="color:red;">ReferenceError: NOT_REAL is not defined</p>
     *
     *  The execution stopped on the first error and the second function was
     *  never executed. Wrapping the functions in a "try/catch" block can
     *  generate a response like this:
     *
     *      for (var i = 0, il = funcs.length; i < il; i += 1) {
     *          try {
     *              funcs[i]();
     *          } catch (ignore) {}
     *      }
     *      // Generates:
     *      // <p>One</p>
     *      // <p>Two</p>
     *
     *  Both functions were executed but the error was not seen. This can have
     *  knock-on effects because of the error.
     *
     *  Now consider using [[array.exec]] (short-hand for creating and running
     *  [[Context]]):
     *
     *      $a.exec(funcs);
     *      // Generates:
     *      // <p>One</p>
     *      // <p style="color:red;">ReferenceError: NOT_REAL is not defined</p>
     *      // <p>Two</p>
     *
     *  The error was displayed and both functions correctly executed. This
     *  allows errors to be spotted and correctly handled.
     * 
     *  The process is based on [Callbacks vs
     *  Events](http://dean.edwards.name/weblog/2009/03/callbacks-vs-events/) by
     *  Dean Edwards.
     **/
    Context = createClass({

        /**
         *  new Context(array[, context[, args]])
         *  - array (Array): Array of functions to execute.
         *  - context (Object): Context for the functions.
         *  - args (Array): Arguments for the functions.
         **/
        init: function (array, context, args) {

            /**
             *  Context#dummy -> Element
             *
             *  Element that will listen for [[Context#name]] events.
             **/
            this.dummy = document.createElement('div');

            /**
             *  Context#name -> String
             *
             *  Name of the custom event to use.
             **/
            this.name = 'dispatch';

            /**
             *  Context#list -> Array
             *
             *  List of functions to execute.
             **/
            this.list = array;

            /**
             *  Context#context -> Object|undefined
             *
             *  Context for the functions. If no `context` argument was passed
             *  to [[new Context]], this will be `undefined`.
             **/
            this.context = context;

            /**
             *  Context#args -> Array
             *
             *  Any arguments to pass to the functions when they execute. If no
             *  `args` are passed to [[new Context]], this will be an empty
             *  array.
             **/
            this.args = args || [];

            this.dummy.
                addEventListener(this.name, this.execute.bind(this), false);

        },

        /**
         *  Context#execute()
         *
         *  Executes the current handler (stored in [[Context#handler]]). This
         *  method is the only place that interacts with [[Context#handler]]
         *  (although it is set and subsequently nullified in
         *  [[Context#dispatch]]) so configuring a sub-class of [[Context]] to
         *  handle something other than a simple array of functions usually just
         *  means overriding this method.
         *
         *  To better understand this, here is a sub-class of [[Context]] that
         *  treats the handler as a `object` containing `handler` and `context`
         *  properties:
         *
         *      var Con = $c.create($a.Context, {
         *
         *          execute: function () {
         *
         *              var handler = this.handler;
         *
         *              if (typeof handler.handler === 'function') {
         *                  handler.handler.apply(handler.context, this.args);
         *              }
         * 
         *          }
         * 
         *      });
         *
         *  The sub-class would allow us to pass in an array of objects rather
         *  than simply functions:
         *
         *      var con = new Con([
         *          {handler: function () {}, context: null},
         *          {handler: function () {}, context: null},
         *          {handler: function () {}, context: null}
         *      ]);
         *      con.run();
         *      con.freen();
         *
         *  This versatility is one of the most powerful features of
         *  [[Context]] and makes it ideal for handling callbacks.
         **/
        execute: function () {

            var handler = this.handler;

            if (typeof handler === 'function') {
                handler.apply(this.context, this.args);
            }

        },

        /**
         *  Context#dispatch(handler)
         *  - handler (Function): Handler to execute.
         *
         *  Dispatches the handler by firing a custom event on
         *  [[Context#dummy]].
         **/
        dispatch: function (handler) {

            /**
             *  Context#handler -> Function|null
             *
             *  Entry in [[Context#list]] that should be executed. It is
             *  reset to `null` once it has been executed, ready for the next
             *  call to [[Context#dispatch]]. Executing
             *  [[Context#handler]] is done exclusively through
             *  [[Context#execute]] so it can be easily modified for
             *  [[Context#handler]] to contain something other than a
             *  function.
             **/
            this.handler = handler;

            this.dummy.dispatchEvent(new CustomEvent(this.name));
            this.handler = null;

        },

        /**
         *  Context#run()
         *
         *  Loops through the stored handlers and dispatches them in turn.
         **/
        run: function () {

            var list = this.list,
                i    = 0,
                il   = list.length;

            while (i < il) {

                this.dispatch(list[i]);
                i += 1;

            }

        },

        /**
         *  Context#free()
         *
         *  Deletes all stored properties to allow the memory allocated to be
         *  freed up during garbage collection.
         **/
        free: function () {

            delete this.dummy;
            delete this.name;
            delete this.list;
            delete this.context;
            delete this.args;
            delete this.handler;

        }

    });

    /** related to: string.supplant, alias of: string.Template
     *  class Template
     * 
     *  Handles string interpolation.
     *
     *      var string = 'Testing ${framework}';
     *      var map = {framework: 'Application'};
     *      var temp = new $s.Template(string);
     *      temp.evaluate(map); // -> 'Testing Application'
     *
     *  Templates are designed to be used multiple times.
     *
     *      var string = 'I hate ${one} and ${two}';
     *      var temp = new $s.Template(string);
     *      
     *      temp.evaluate({one: 'wind', two: 'rain'});
     *      // -> "I hate wind and rain"
     *      temp.evaluate({one: 'frost', two: 'ice'});
     *      // -> "I hate frost and ice"
     *      temp.evaluate({one: 'fear', two: 'loathing'});
     *      // -> "I hate fear and loathing"
     *
     *  Placeholders that are not mentioned in the `map` are ignored.
     *
     *      var string = '${foo} ${bar}';
     *      var map = {bar: 'see?'};
     *      var temp = new $s.Template(string);
     *      temp.evaluate(map); // -> '${foo} see?'
     * 
     *  Only strings and numbers are accepted as replacements.
     * 
     *      var string = 'Testing ${framework}';
     *      var map = {framework: true};
     *      var temp = new $s.Template(string);
     *      temp.evaluate(map); // -> 'Testing ${framework}'
     * 
     *  Placeholders can be escaped using the back-slash character "\\". Two
     *  back-slashes are required because JavaScript uses the back-slash as an
     *  escape character, removing it from the string - a second back-slash is
     *  needed so the first escapes it.
     * 
     *      var string = 'Testing \\${framework}';
     *      var map = {framework: 'Application'};
     *      var temp = new $s.Template(string);
     *      temp.evaluate(map); // -> 'Testing ${framework}'
     *
     *  New patters can be created by supplying the `pattern` argument. The
     *  pattern should define 3 groups: the character before the placeholder,
     *  the whole placeholder and the key within the placeholder (see
     *  [[Template#drawFunction]]). For example, here is a replacement using
     *  two braces.
     *
     *      var string = 'Testing {{framework}}';
     *      var map = {framework: 'Song'};
     *      var pattern = /(^|.|\r|\n)(\{\{(.*?)\}\})/;
     *      var temp = new $s.Template(string, pattern);
     *      temp.evaluate(map); // -> 'Testing Song'
     *
     *  Although it looks very similar to the [PrototypeJS
     *  Templates](http://api.prototypejs.org/language/Template/), it is based
     *  on an idea by [James
     *  Padolsey](http://james.padolsey.com/javascript/straight-up-interpolation/).
     *
     *  The default format `${name}` has been chosen because it matches the
     *  current recomendation for string interpolation in ES6.
     **/
    Template = createClass({

        /**
         *  new Template(string[, pattern])
         *  - string (String): String to interpolate.
         *  - map (Object): Map of placeholders to replacements for the string.
         *  - pattern (RegExp): Pattern for placeholder.
         **/
        init: function (string, pattern) {

            /**
             *  Template#string -> String
             *
             *  String that will be evaluated.
             **/
            this.string = string;

            /**
             *  Template#pattern -> RegExp
             *
             *  Regular expression identifying the parts of
             *  [[Template#string]] to replace. See [[Template]] for details
             *  about replacing this pattern.
             **/
            this.pattern = pattern instanceof RegExp ?
                    pattern :
                    Template.pattern;

            // Replaces the evaluate method with one that (hopefully) will not
            // throw errors.
            this.evaluate = this.getCached();

        },

        /**
         *  Template#getCached() -> Function
         *
         *  Gets the cached version of the [[Template#evaluate]] function for
         *  the given [[Template#string]], creating the function (and caching 
         *  it) if it does not yet exist.
         **/
        getCached: function () {

            var pattern = this.pattern,
                string  = this.string,
                cache   = Template.cache,
                ptn     = cache[pattern] || (cache[pattern] = {}),
                func    = ptn[string]    || (ptn[string] = this.createFunc());

            return func;

        },

        /**
         *  Template#createFunc() -> Function
         *
         *  Creates the function that will replace key parts of
         *  [[Template#string]] with the map of replacements passed to
         *  [[Template#evaluate]].
         **/
        createFunc: function () {

            var pattern = new RegExp(this.pattern.source, 'g'),

                // Uses values not keys because the escaped values are needed.
                basics  = $o.values(Template.basic).join('');

            return new Function(
                'o',
                'return "' + (
                    this.string.
                        replace(
                            new RegExp('[' + basics + ']', 'g'),
                            this.getBasic
                        ).
                        replace(pattern, this.drawFunction)
                    ) +
                '";'
            );

        },

        /**
         *  Template#getBasic(match) -> String
         *  - match (String): Character to escape.
         *
         *  Returns the escaped character from the [[Template.basic]] object.
         **/
        getBasic: function (match) {
            return Template.basic[match];
        },

        /**
         *  Template#drawFunction(complete, prefix, whole, key) -> String
         *  - complete (String): Complete match.
         *  - prefix (String): Character before the match.
         *  - whole (String): Complete placeholder match.
         *  - key (String): Placeholder without the wrapper.
         *
         *  Draws the function that will replaces placeholder. This function is
         *  passed into `new Function` with `o` as the replacement object name.
         *  This method is passed the matches from [[Template#pattern]] - see
         *  [[Template]] for more information.
         **/
        drawFunction: function (complete, prefix, whole, key) {

            return prefix === '\\' ?
                whole :
                prefix + '" + ' +
                    '(typeof o.' + key + ' === "string" || ' +
                        'typeof o.' + key + ' === "number" ? ' +
                        'o.' + key + ' : "' + whole + '") + "';

        },

        /**
         *  Template#evaluate(map) -> String
         *  - map (Object): Map of placeholders to replacements.
         *
         *  Replaces the contents of [[Template#string]] with the entries
         *  given in the map.
         *
         *  Before being initialised, this method will throw an `Error`. This is
         *  because the replacement function needs to be created using
         *  [[Template#createFunc]] before the template can be correctly
         *  evaluated.
         **/
        evaluate: function () {
            throw new Error('Uninitialised Template');
        }

    });

    augment(Template, {

        /**
         *  Template.basic -> Object
         *
         *  A simple map of basic strings to replace with escaped versions. This
         *  prevents the escaped values being lost during the
         *  [[Template#evaluate]] execution. As the cache relies upon
         *  functions generated using these, if this is altered,
         *  [[Template.cache]] should be emptied.
         **/
        basic: {
            '\\':     '\\\\',
            '\n':     '\\n',
            '\"':     '\\\"',
            '\u2028': '\\u2028',
            '\u2029': '\\u2029'
        },

        /**
         *  Template.cache -> Object
         *
         *  A simple cache of functions created by [[Template#createFunc]].
         *  This cache helps reduce additional work for [[Template]]
         *  instances that were not saved in a variable or created using
         *  [[string.supplant]]. It should be treated as **private**, but if a
         *  future extension overrides [[Template#createFunc]], it may be
         *  useful to be able to empty this cache.
         **/
        cache: {},

        /**
         *  Template.pattern -> RegExp
         *
         *  Default pattern used for times when no pattern is passed to the
         *  [[Template]] constructor.
         **/
        pattern: /(^|.|\r|\n)(\$\{(.*?)\})/

    });

    augment($a, {
        chunk:       chunk,
        compact:     compact,
        Context:     Context,
        every:       every,
        exec:        exec,
        filter:      filter,
        first:       first,
        forEach:     forEach,
        from:        from,
        indiciesOf:  indiciesOf,
        invoke:      invoke,
        isArray:     isArray,
        isArrayLike: isArrayLike,
        last:        last,
        makeInvoker: makeInvoker,
        map:         map,
        partition:   partition,
        pluck:       pluck,
        remove:      remove,
        shuffle:     shuffle,
        slice:       slice,
        some:        some,
        unique:      unique
    });

    augment($c, {
        create: createClass
    });

    augment($f, {
        debounce:     debounce,
        identity:     identity,
        lock:         lock,
        makeConstant: makeConstant,
        noop:         noop,
        throttle:     throttle
    });

    augment($n, {
        isNumeric: isNumeric,
        times:     times,
        toNumber:  toNumber,
        toPosInt:  toPosInt
    });

    augment($o, {
        addConfig: addConfig,
        clone:     clone,
        each:      each,
        extend:    extend,
        is:        is,
        isEmpty:   isEmptyObject,
        keys:      keys,
        makeOwns:  makeOwns,
        values:    values
    });

    augment($o, {
        CLONE_DEEP: 0x1,
        CLONE_DESC: 0x2,
        CLONE_ENUM: 0x4,
        CLONE_NODE: 0x8,
        CLONE_INST: 0x10,
        CLONE_NULL: 0x20
    }, true);

    augment($s, {
        clip:     clip,
        pad:      pad,
        repeat:   repeat,
        Template: Template,
        supplant: supplant,
        uniqid:   uniqid
    });

    augment($s, {

        CLIP_RIGHT: 0x1,
        CLIP_LEFT:  0x2,
        CLIP_BOTH:  0x3, // CLIP_RIGHT | CLIP_LEFT

        PAD_RIGHT: 0x1,
        PAD_LEFT:  0x2,
        PAD_BOTH:  0x3  // PAD_RIGHT | PAD_LEFT

    }, true);

    forIn(
        {
            array:      $a,
            'class':    $c, 
            'function': $f,
            number:     $n,
            object:     $o,
            string:     $s
        },
        function (key, value) {

            app.addHelper(key, function () {
                return value;
            });

        }
    );

}());
