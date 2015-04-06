/**
 *  map -> Extension
 *
 *  An extension for handling maps. This is based on
 *  [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
 *  (Draft at time of writing - 13 December 2014) and serves as a fallback.
 **/
app.addHelper('map', function (app) {

    'use strict';

    var $a      = app.getHelper('array'),
        $c      = app.getHelper('class'),
        $o      = app.getHelper('object'),
        $s      = app.getHelper('string'),
        Map     = window.Map,
        WeakMap = window.WeakMap,

        /**
         *  class map.Iterator
         *
         *  This becomes useful for the [[map.Map]] fallback. If a native `Map`
         *  object exists, this class is not used.
         **/
        Iterator = $c.create({

            /**
             *  new map.Iterator(entries)
             *  - entries (Array): Iterable object.
             *
             *  Creates a basic `Iterator` object.
             **/
            init: function (entries) {

                /**
                 *  map.Iterator#_entries -> Array
                 *
                 *  Array based on the entries given. This should be considered
                 *  **private**.
                 **/
                this._entries = $a.from(entries);

                /**
                 *  map.Iterator#_index -> Number
                 *
                 *  Internal pointer for the value returned by
                 *  [[map.Iterator#next]]. This should be considered 
                 *  **private**.
                 **/
                this._index = 0;

            },

            /**
             *  map.Iterator#next() -> Object
             *
             *  Returns the next entry in this class. This always comes in the
             *  form of an object with a `value` and a `done` property. The
             *  `value` property always returns the value of the entry, `done`
             *  will be `false` if there are more entries and `true` if the last
             *  entry has been given.
             *
             *      var iter = new map.Iterator([1, 2, 3, 4]);
             *      iter.next(); // -> {value: 1, done: false}
             *      iter.next(); // -> {value: 2, done: false}
             *      iter.next(); // -> {value: 3, done: false}
             *      iter.next(); // -> {value: 4, done: false}
             *      iter.next(); // -> {value: undefined, done: true}
             *
             *  Once the last enty has been given, this method will always
             *  return the "done" object.
             *
             *      iter.next(); // -> {value: undefined, done: true}
             *      iter.next(); // -> {value: undefined, done: true}
             *      iter.next(); // -> {value: undefined, done: true}
             * 
             **/
            next: function () {

                var entries = this._entries,
                    index   = this._index,
                    next    = {value: undefined, done: true};

                if (index < entries.length) {

                    this._index += 1;
                    next.done  = false;
                    next.value = entries[index];

                }

                return next;

            }

        });

    if (!WeakMap) {

        /**
         *  class map.WeakMap
         *
         *  Creates a weak map. This serves as a regular `Object`-based
         *  hash-table with the main difference being that the key must be a
         *  non-null object. The name "weak" map comes from the notion that
         *  there is no way of iterating over the entries, keys are removed when
         *  objects are deleted keeping this map efficient for garbage
         *  collection. Be aware that this optimisation may not possible in
         *  browsers that do no have a native `WeakMap` although reasonable
         *  steps have been taken to replicate the effect.
         *
         *  WeakMaps only work with objects as keys (although the objects may be
         *  any non-null object, such as an `Object` literal (`{}`), a DOM Node
         *  or an instance). For a map that may have any data type as a key, use
         *  a [[map.Map]].
         **/
        WeakMap = $c.create({

            /**
             *  new map.WeakMap([iterable])
             *  - iterable (Array): Initial values
             *
             *  Creates a weak map. If an `Array` is passed as the `iterable`
             *  argument, it is taken as the initial values.
             *
             *      var o1  = {},
             *          o2  = {},
             *          map = new map.WeakMap([[o1, 'value1'], [o2, 'value2']]);
             *
             *      map.get(o1); // -> 'value1';
             * 
             **/
            init: function (iterable) {

                /**
                 *  map.WeakMap#_symbol -> String
                 *
                 *  Property name assigned to the key objects to identify the
                 *  stored values. If the browser supports a native `WeakMap`
                 *  then this property will not exist.
                 **/
                this._symbol = $s.uniqid('$Application-WeakMapReference-');

                if ($a.isArray(iterable)) {

                    iterable.forEach(function (entry) {
                        this.set(entry[0], entry[1]);
                    }, this);

                }

            },

            /**
             *  map.WeakMap#_isValidKey(key) -> Boolean
             *  - key (Object): Object to test.
             *
             *  Checks to see if if given `key` is a valid WeakMap key,
             *  returning `true` if it is. If the key is not valid, a
             *  `TypeError` is thrown. This is used instead of one of the
             *  [[Core.error]] methods to more closely mirror native
             *  functionality.
             *
             *  If the browser has a native `WeakMap` constructor, this method
             *  will not exist.
             **/
            _isValidKey: function (key) {

                if (key === null || typeof key !== 'object') {
                    throw new TypeError('value is not a non-null object');
                }

                return true;

            },

            /**
             *  map.WeakMap#set(key, value) -> WeakMap
             *  - key (Object): Key for the value.
             *  - value (*): Value to store.
             *
             *  Sets the `value` against the given `key`.
             *
             *      var ob1 = {},
             *          ob2 = {},
             *          map = new map.WeakMap();
             *          
             *      map.set(ob1, 'value');
             *      map.get(ob1); // -> 'value';
             *
             *  This method will return the instance allowing setting to be
             *  chainable.
             *
             *      map.set(ob1, 'value').set(ob2, 'value2');
             * 
             **/
            set: function (key, value) {

                if (this._isValidKey(key)) {

                    Object.defineProperty(key, this._symbol, {
                        configurable: true,
                        enumerable:   false,
                        value:        value,
                        writable:     true
                    });

                }

                return this;

            },

            /**
             *  map.WeakMap#get(key) -> *|undefined
             *  - key (Object): Key object.
             *
             *  Gets the stored information from the given key.
             *
             *      var ob1 = {},
             *          ob2 = {},
             *          map = new map.WeakMap();
             *
             *      map.set(ob1, 'value');
             *      map.get(ob1); // -> 'value'
             *
             *  If the key is not recognised, `undefined` is returned.
             *
             *      map.get(ob1); // -> 'value'
             *      map.get(ob2); // -> undefined
             * 
             **/
            get: function (key) {
                return this._isValidKey(key) ? key[this._symbol] : undefined;
            },

            /**
             *  map.WeakMap#has(key) -> Boolean
             *  - key (Object): Key object.
             *
             *  Checks to see if the key has any information stored against it
             *  in this map.
             *
             *      var ob1 = {},
             *          ob2 = {},
             *          map = new map.WeakMap();
             *
             *      map.set(ob1, 'value');
             *      map.has(ob1); // -> true
             *      map.has(ob2); // -> false
             *      
             **/
            has: function (key) {
                return this._isValidKey(key) && (this._symbol in key);
            },

            /**
             *  map.WeakMap#delete(key) -> Boolean
             *  - key (Object): Key object.
             *
             *  Deletes the information associated with the given `key`.
             * 
             *      var ob1 = {},
             *          ob2 = {},
             *          map = new map.WeakMap();
             *
             *      map.set(ob1, 'value');
             *      map.has(ob1); // -> true
             *      map.delete(ob1); // -> true
             *      map.has(ob1); // -> false
             *
             *  This method will return `true` if information was deleted and
             *  `false` if there was no information to delete. No errors are
             *  thrown if information wasn't there to begin with.
             * 
             *      map.set(ob1, 'value');
             *      map.delete(ob1); // -> true
             *      map.delete(ob2); // -> false
             * 
             **/
            'delete': function (key) {

                var isGone = false,
                    hasKey = false,
                    symbol = this._symbol;

                if (this._isValidKey(key)) {

                    hasKey = symbol in key;
                    delete key[symbol];
                    isGone = hasKey && !(symbol in key);

                }

                return isGone;

            }

        });

    }

    // Create a fallback for situations where a native Map does not exist.
    if (!Map) {

        /**
         *  class map.Map
         *
         *  Creates a map. This works the same as normal `Object` hash-map
         *  except that keys may be any type, not only `String`s.
         *
         *  Strong maps like this keep internal references to the objects that
         *  act as keys. This means that deleting the object may not
         *  automatically remove it from this map and will not be garbage-
         *  collected. For a more memory-efficient map, use a [[map.WeakMap]].
         **/
        Map = $c.create({

            /**
             *  new map.Map([iterable])
             *  - iterable (Array): Optional base array for the map.
             *
             *  Creates a new map. If an `Array` is passed as the `iterable`
             *  argument, it is read as a combination of key/values to set up
             *  the map.
             *
             *      var map = new map.Map([
             *          ['key1', 'value1'],
             *          ['key2', 'value2']
             *      ]);
             *      map.has('key1'); // -> true
             *      map.get('key2'); // -> 'value2'
             * 
             **/
            init: function (iterable) {

                this.clear();

                if ($a.isArray(iterable)) {

                    iterable.forEach(function (keyval) {
                        this.set(keyval[0], keyval[1]);
                    }, this);

                }

            },

            /**
             *  map.Map#_getIndex(key) -> Number
             *  - key (*): Key to find.
             *
             *  This method gets the index of the given `key` from the internal
             *  [[map.Map#_keys]] property. If the browser has a native `Map`
             *  constructor, this method will not exist. As such, it should not
             *  be relied upon.
             **/
            _getIndex: function (key) {

                var index = -1,
                    keys  = this._keys,
                    i     = 0,
                    il    = keys.length;

                while (i < il) {

                    if ($o.is(key, keys[i])) {

                        index = i;
                        break;

                    }

                    i += 1;

                }

                return index;

            },

            /**
             *  map.Map#clear()
             *
             *  Empties the map.
             *
             *      var map = new map.Map();
             *      map.set('key1', 'value1');
             *      map.has('key1'); // -> true
             *      map.size; // -> 1
             *
             *      map.clear();
             *      map.has('key1'); // -> false
             *      map.size; // -> 0
             * 
             **/
            clear: function () {

                /**
                 *  map.Map#_keys -> Array
                 *
                 *  Collection of all keys used by this map. If the browser has
                 *  a native `Map` constructor, this property will not exist. As
                 *  such, it should not be relied upon.
                 **/
                this._keys = [];

                /**
                 *  map.Map#_values -> Array
                 *
                 *  Collection of all values used by this map. If the browser
                 *  has a native `Map` constructor, this property will not
                 *  exist. As such, it should not be relied upon.
                 **/
                this._values = [];

                /**
                 *  map.Map#size -> Number
                 *
                 *  Number of entries in this map.
                 *
                 *      var map = new map.Map();
                 *      map.size; // -> 0
                 *      
                 *      map.set('key1', 'value1');
                 *      map.size; // -> 1
                 *      
                 *      map.set('key2', 'value2');
                 *      map.size; // -> 2
                 *      
                 *      map.delete('key1');
                 *      map.size; // -> 1
                 * 
                 **/
                this.size = 0;

            },

            /**
             *  map.Map#delete(key) -> Boolean
             *  - key (*): Key to delete.
             * 
             *  Deletes the entry associated with the given key.
             * 
             *      var map = new map.Map();
             *      map.set('key1', 'value1');
             *      map.has('key1'); // -> true
             *      
             *      map.delete('key1'); // -> true
             *      map.has('key1'); // -> false
             *
             *  This method will return `true` if it was able to delete the key.
             *  If the key is not recognised, `false` is returned and no error
             *  is thrown.
             *
             *      map.delete('does-not-exist'); // -> false
             * 
             **/
            'delete': function (key) {

                var index = this._getIndex(key),
                    ret   = false;

                if (index > -1) {

                    this._keys.splice(index, 1);
                    this._values.splice(index, 1);
                    this.size -= 1;
                    ret = true;

                }

                return ret;

            },

            /**
             *  map.Map#entries() -> Iterator
             *
             *  Returns an iterator of the map entries.
             *
             *      var map = new map.Map();
             *      map.set('key1', 'value1');
             *      map.set('key2', 'value2');
             *
             *      var iter = map.entries();
             *      iter.next(); // -> {value: ['key1', 'value1'], done: false}
             *      iter.next(); // -> {value: ['key2', 'value2'], done: false}
             *      iter.next(); // -> {value: undefined, done: true}
             *
             *  If the browser has a native `Map` object, it will also have a
             *  native `Iterator` and that will be returned by this function. If
             *  the fallback is being used, a [[map.Iterator]] instance will be
             *  returned. There should be no noticable difference between the
             *  two, but browser inconsistencies may get traced back here.
             **/
            entries: function () {

                var entries = [],
                    i       = 0,
                    il      = this.size;

                while (i < il) {

                    entries.push(this._keys[i], this._values[i]);
                    i += 1;

                }

                return new Iterator(entries);

            },

            /**
             *  map.Map#forEach(callback[, context])
             *  - callback (Function): Function to call for each entry.
             *  - context (Object): Context for the `callback` argument.
             *
             *  Executes a `callback` for each entry of the map.
             *
             *      var map = new map.Map();
             *      map.set('key1', 'value1');
             *      map.set('key2', 'value2');
             *      map.forEach(function (value, key) {
             *          console.log('map[' + key + '] = ' + value);
             *      });
             *      // Logs out:
             *      // map[key1] = value1
             *      // map[key2] = value2
             *
             *  There is no way to break the loop.
             **/
            forEach: function (callback, context) {

                var keys   = this._keys,
                    values = this._values,
                    i      = 0,
                    il     = this.size;

                while (i < il) {
                    callback.call(context, values[i], keys[i], this);
                }

            },

            /**
             *  map.Map#get(key) -> *
             *  - key (*): Key of the value to retrieve.
             *
             *  Retrieves the value corresponding to the given key.
             *
             *      var map = new map.Map();
             *      map.set('key1', 'value1');
             *      map.get('key1'); // -> 'value1'
             *
             *  If the key is not recognised, `undefined` is returned and no
             *  error is thrown.
             *
             *      map.get('key1'); // -> 'value1'
             *      map.get('key2'); // -> undefined
             * 
             **/
            get: function (key) {

                var index  = this._getIndex(key),
                    gotten = undefined;

                if (index > -1) {
                    gotten = this._values[index];
                }

                return gotten;

            },

            /**
             *  map.Map#has(key) -> Boolean
             *  - key (*): Key to check.
             *
             *  Checks to see if the given `key` has any associated information
             *  stored against it.
             * 
             *      var map = new map.Map();
             *      map.set('key1', 'value1');
             *      map.has('key1'); // -> true
             *      map.has('key2'); // -> false
             *
             **/
            has: function (key) {
                return this._getIndex(key) > -1;
            },

            /**
             *  map.Map#keys() -> Iterator
             *
             *  Returns an `Iterator` containing all the keys used to store
             *  information in this map.
             * 
             *      var map = new map.Map();
             *      map.set('key1', 'value1');
             *      map.set('key2', 'value2');
             *
             *      var iter = map.keys();
             *      iter.next(); // -> {value: 'key1', done: false}
             *      iter.next(); // -> {value: 'key2', done: false}
             *      iter.next(); // -> {value: undefined, done: true}
             *
             *  For an `Iterator` of values, use [[map.Map#values]].
             **/
            keys: function () {
                return new Iterator(this._keys);
            },

            /**
             *  map.Map#set(key, value) -> Map
             *  - key (*): Key for the information.
             *  - value (*): Information to be stored.
             *
             *  Stores information in the map. This method returns the instance
             *  allowing setting to be chained.
             *
             *      var map = new map.Map();
             *      map.set('key1', 'value1').set('key2', 'value2');
             *      map.has('key1'); // -> true
             *      map.get('key2'); // -> 'value2'
             *
             *  The `key` can be anything.
             *
             *      map.set(NaN, 'not a number');
             *      map.get(NaN); // -> 'not a number'
             *
             *      map.set(null, 'totally empty');
             *      map.get(null); // -> 'totally empty'
             * 
             **/
            set: function (key, value) {

                var index  = this._getIndex(key),
                    keys   = this._keys,
                    values = this._values;

                if (index < 0) {

                    index = keys.push(key) - 1;
                    values[index] = value;
                    this.size = index + 1;

                } else {
                    values[index] = value;
                }

                return this;

            },

            /**
             *  map.Map#values() -> Iterator
             *
             *  Returns an `Iterator` containing all the values stored in this
             *  map.
             * 
             *      var map = new map.Map();
             *      map.set('key1', 'value1');
             *      map.set('key2', 'value2');
             *
             *      var iter = map.values();
             *      iter.next(); // -> {value: 'value1', done: false}
             *      iter.next(); // -> {value: 'value2', done: false}
             *      iter.next(); // -> {value: undefined, done: true}
             *
             *  For an `Iterator` of keys, use [[map.Map#keys]].
             **/
            values: function () {
                return new Iterator(this._values);
            }

        });

        /** alias of map.Map#entries
         *  map.Map#@@iterator()
         *
         *  Returns an `Iterator` of entries. Used as part of the Iterator
         *  Protocol.
         **/
        Map.addMethod(
            window.Symbol ? Symbol.iterator : '@@iterator',
            function () {
                return this.entries();
            }
        );

    }

    return {

        Map:     Map,
        WeakMap: WeakMap,

        Iterator: Iterator,

        /**
         *  map.weak([iterable]) -> map.WeakMap
         *  - iterable (Array): Initial values.
         *
         *  Helper function for creating a [[map.WeakMap]].
         **/
        weak: function (iterable) {
            return new WeakMap(iterable);
        }

        /**
         *  map.create([iterable]) -> map.Map
         *  - iterable (Array): Initial values.
         *
         *  Helper function for creating a [[map.Map]].
         **/
        create: function (iterable) {
            return new Map(iterable);
        }

    };

});
