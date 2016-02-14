define([
    "./lib/util",
    "./lib/dom/core"
], function (
    util,
    core
) {

    "use strict";

    var dom = {};
    var dataMap = new WeakMap();

    // Private function.
    // Gets the object that keeps data for the given element.
    function getDataObject(element) {

        element = core.getClosestElement(element);

        if (!dataMap.has(element)) {
            dataMap.set(element, {});
        }

        return data.get(element);

    }

    /**
     *  dom.setData(element, key, value)
     *  - element (Element): Element whose data should be set.
     *  - key (String): Key for the data.
     *  - value (?): Value for the data.
     *
     *  Sets data for the element. This is private data as opposed to public
     *  data (created with the `data-*` attributes).
     *
     *      var div = document.createElement('div');
     *      dom.setData(div, 'test', 1);
     *      dom.getData(div, 'test'); // -> 1
     *
     *  The key can be any valid JavaScript string. There are no restrictions on
     *  allowed characters.
     **/
    function setData(element, key, value) {
        getDataObject(element)[key] = value;
    }

    /**
     *  dom.hasData(element, key) -> Boolean
     *  - element (Element): Element whose data should be checked.
     *  - key (String): Key for the data.
     *
     *  Checks to see if the given `element` has data associated with the given
     *  `key`, returning `true` if it does and `false` if it does not.
     *
     *      var div = document.createElement('div');
     *      dom.setData(div, 'exists', 1);
     *      dom.hasData(div, 'exists');         // -> true
     *      dom.hasData(div, 'does-not-exist'); // -> false
     *
     **/
    function hasData(element, key) {
        return util.Object.owns(getDataObject(element), key);
    }

    /**
     *  dom.getData(element) -> Object
     *  dom.getData(element, key) -> ?
     *  - element (Element): Element whose data should be retrieved.
     *  - key (String): Optional string for the data.
     *
     *  Gets the data associated with the given `element`.
     *
     *      var div = document.createElement('div');
     *      dom.setData(div, 'exists', 1);
     *      dom.getData(div, 'exists'); // -> 1
     *
     *  If the data cannot be found, `undefined` is returned.
     *
     *      dom.getData(div, 'does-not-exist'); // -> undefined
     *
     *  The `key` is optional - if it is ommitted, a copy of all the data is
     *  returned:
     *
     *      dom.getData(div); // -> { exists: 1 }
     *
     *  Setting properties in this object is unlikely to affect data (although
     *  some change may occur). It is better to use this option for reference
     *  and manipulate the data by setting it with [[dom.setData]].
     **/
    function getData(element, key) {

        var data = getDataObject(element);

        return typeof key === "string"
            ? data[key]
            : util.Object.clone(data);

    }

    /**
     *  dom.removeData(element, key)
     *  - element (Element): Element whose data should be removed.
     *  - key (String): Key for the data to remove.
     *
     *  Removes the data with the given `key` from the specified `element`.
     *
     *      var div = document.createElement('div');
     *      dom.setData(div, 'exists', 1);
     *      dom.getData(div, 'exists'); // -> 1
     *      dom.removeData(div, 'exists');
     *      dom.getData(div, 'exists'); // -> undefined
     *
     **/
    function removeData(element, key) {
        delete getDataObject(element)[key];
    }

    util.Object.assign(dom, {
        getData,
        hasData,
        removeData,
        setData
    });

    return Object.freeze(dom);

});
