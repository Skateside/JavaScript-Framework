define([
    "lib/util/core"
], function (
    core
) {

    "use strict";

    /**
     *  util.Array.sortBy
     *
     *  A collection of methods designed to assist sorting. These mainly exist
     *  to allow the developer to provide more information about their
     *  intentions rather than a possibly confusing `sort` method.
     *
     *  Most of these methods return the sorting function but some are the
     *  sorting functions themselves. For every ascending method (usually ending
     *  in `Asc`) there will be a descending version (ending in `Desc`).
     **/
    var sortBy = {};

    /**
     *  util.Array.sortBy.asc(a, b) -> Number
     *  - a (Number): Array item to sort.
     *  - b (Number): Array item to sort.
     *
     *  A method that sorts the array items numerically in ascending order.
     **/
    function asc(a, b) {
        return a - b;
    }

    /**
     *  util.Array.sortBy.desc(a, b) -> Number
     *  - a (Number): Array item to sort.
     *  - b (Number): Array item to sort.
     *
     *  A method that sorts the array items numerically in descending order.
     **/
    function desc(a, b) {
        return b - a;
    }

    /**
     *  util.Array.sortBy.propertyAsc(property) -> Function
     *  - property (String): Property of the array items for sorting.
     *
     *  Converts the items in the array to the defined property before sorting
     *  them in ascending order. The conversion is not returned, merely used.
     *  The property should be numeric to ensure that the sorting is accurate.
     *
     *     var arr = ["charlie", "alpha", "dog", "beta"];
     *     arr.sort(util.Array.sortBy.propertyAsc("length"));
     *     // arr = ["dog", "beta", "alpha", "charlie"];
     *
     **/
    function propertyAsc(property) {

        return function (a, b) {
            return asc(a[property], b[property]);
        };

    }

    /**
     *  util.Array.sortBy.propertyDesc(property) -> Function
     *  - property (String): Property of the array items for sorting.
     *
     *  Converts the items in the array to the defined property before sorting
     *  them in descending order. The conversion is not returned, merely used.
     *  The property should be numeric to ensure that the sorting is accurate.
     *
     *     var arr = ["charlie", "alpha", "dog", "beta"];
     *     arr.sort(util.Array.sortBy.propertyDesc("length"));
     *     // arr = ["charlie", "alpha", "beta", "dog"];
     *
     **/
    function propertyDesc(property) {

        return function (a, b) {
            return desc(a[property], b[property]);
        };

    }

    /**
     *  util.Array.sortBy.mappedAsc(map) -> Function
     *  - map (Function): Function to map the array items.
     *
     *  Maps the array items using `map` and uses the results to sort the array
     *  in ascending order. The mapped values are not returned, merely used.
     *
     *      var arr = ["1", "10", "2", "21"];
     *      arr.sort(util.Array.sortBy.mappedAsc(Number));
     *      // arr = ["1", "2", "10", "21"];
     *
     **/
    function mappedAsc(map) {

        return function (a, b) {
            return asc(map(a), map(b));
        };

    }

    /**
     *  util.Array.sortBy.mappedDesc(map) -> Function
     *  - map (Function): Function to map the array items.
     *
     *  Maps the array items using `map` and uses the results to sort the array
     *  in descending order. The mapped values are not returned, merely used.
     *
     *      var arr = ["1", "10", "2", "21"];
     *      arr.sort(util.Array.sortBy.mappedDesc(Number));
     *      // arr = ["21", "10", "2", "1"];
     *
     **/
    function mappedDesc(map) {

        return function (a, b) {
            return desc(map(a), map(b));
        };

    }

    /**
     *  util.Array.sortBy.methodAsc(method[, ...args]) -> Function
     *  - method (String): Method name.
     *  - args (?): Optional arguments for the method.
     *
     *  Converts the items in the array by executing the `method` on them
     *  (passing in any `args`) and uses the results to sort the array in
     *  ascending order. The mapped values are not returned, merely used.
     *
     *      var arr = ["boar", "apple", "cart", "portal"];
     *      arr.sort(util.Array.sortBy.methodAsc("indexOf", "a"));
     *      // arr = ["apple", "cart", "boar", "portal"]
     *
     **/
    function methodAsc(method, ...args) {

        return function (a, b) {
            return asc(a[method](...args), b[method](...args));
        };

    }

    /**
     *  util.Array.sortBy.methodDesc(method[, ...args]) -> Function
     *  - method (String): Method name.
     *  - args (?): Optional arguments for the method.
     *
     *  Converts the items in the array by executing the `method` on them
     *  (passing in any `args`) and uses the results to sort the array in
     *  descending order. The mapped values are not returned, merely used.
     *
     *      var arr = ["boar", "apple", "cart", "portal"];
     *      arr.sort(util.Array.sortBy.methodDesc("indexOf", "a"));
     *      // arr = ["portal", "boar", "cart", "apple"]
     *
     **/
    function methodDesc(method, ...args) {

        return function (a, b) {
            return desc(a[method](...args), b[method](...args));
        };

    }

    /**
     *  util.Array.sortBy.alphabetAsc(a, b) -> Number
     *  - a (String): Array item.
     *  - b (String): Array item.
     *
     *  Sorts the items in the array in ascending alphabetical order.
     *
     *     var arr = ["charlie", "alpha", "dog", "beta"];
     *     arr.sort(util.Array.sortBy.propertyDesc("length"));
     *     // arr = ["alpha", "beta", "charlie", "dog"];
     *
     **/
    function alphabetAsc(a, b) {
        return String(a).localeCompare(b);
    }

    /**
     *  util.Array.sortBy.alphabetDesc(a, b) -> Number
     *  - a (String): Array item.
     *  - b (String): Array item.
     *
     *  Sorts the items in the array in descending alphabetical order.
     *
     *     var arr = ["charlie", "alpha", "dog", "beta"];
     *     arr.sort(util.Array.sortBy.propertyDesc("length"));
     *     // arr = ["dog", "charlie", "beta", "alpha"];
     *
     **/
    function alphabetDesc(a, b) {
        return String(b).localeCompare(a);
    }

    util.Object.assign(sortBy, {
        asc: asc,
        desc: desc,
        propertyAsc: propertyAsc,
        propertyDesc: propertyDesc,
        mappedAsc: mappedAsc,
        mappedDesc: mappedDesc,
        methodAsc: methodAsc,
        methodDesc: methodDesc,
        alphabetAsc: alphabetAsc,
        alphabetDesc: alphabetDesc
    });

    return Object.freeze(sortBy);

});
