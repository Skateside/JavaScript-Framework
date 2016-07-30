define([
    "lib/util",
    "lib/dom/core"
], function (
    util,
    core
) {

    "use strict";

    var dom = {};

    /** alias of: dom.getAttribute
     *  dom.getAttr(element, attr) -> String
     *  dom.getAttr(element) -> Object
     *  - element (Element): Element whose attributes should be read.
     *  - attr (String): Option attribute to get.
     *
     *  Gets one or more attributes from the given `element`.
     *
     *      <div id="a" class="test" aria-hidden="true" data-test="1">a</div>
     *
     *  With the element above, this method would return the following things
     *  (always as strings):
     *
     *      var div = dom. byId('a');
     *      dom.getAttr(div, 'id');          // -> "a"
     *      dom.getAttr(div, 'aria-hidden'); // -> "true"
     *
     *  If the element is not found, and empty string is returned.
     *
     *      dom.getAttr(element, 'does-not-exist'); // -> ""
     *
     *  If no attribute is defined with the `attr` argument, an object of all
     *  attributes is returned.
     *
     *      dom.getAttr(element);
     *      // -> {
     *      //      "id": "a",
     *      //      "class": "test",
     *      //      "aria-hidden": "true",
     *      //      "data-test": "1"
     *      // }
     *
     **/
    function getAttr(element, attr) {

        var attrs = core.getClosestElement(element).attributes;
        var value = util.Array.pluck(attrs, "name", "value");

        if (typeof attr === "string") {
            value = value[attr];
        }

        return value || "";

    }

    /** alias of: dom.hasAttribute
     *  dom.hasAttr(element, attr) -> Boolean
     *  dom.hasAttr(element, attrs) -> Array
     *  - element (Element): Element to test.
     *  - attr (String): Attribute to test.
     *  - attrs (Array): Attributes to test.
     *
     *  Tests the given `element` to see if it has the attribute specified in
     *  the `attr` argument.
     *
     *      <div id="a" class="test">a</div>
     *
     *  Given the element above, this function would return the following
     *  results:
     *
     *      var div = dom.byId('a');
     *      dom.hasAttr(div, 'id');             // -> true
     *      dom.hasAttr(div, 'class');          // -> true
     *      dom.hasAttr(div, 'does-not-exist'); // -> false
     *
     *  Multiple attributes can be checked at the same time by passing an array
     *  instead of a string - the array should contain all the elements to test
     *  and the returned array will be in the same order as the attributes.
     *
     *      dom.hasAttr(div, ['id', 'class', 'does-not-exist']);
     *      // -> [true, true, false]
     *
     **/
    function hasAttr(element, attr) {

        var has = [];
        var isOne = typeof attr === "string";

        element = core.getClosestElement(element);

        if (isOne) {
            attr = [attr];
        }

        has = attr.map(function (attribute) {
            return element.hasAttribute(attribute);
        });

        return isOne
            ? has[0]
            : has;

    }

    /** alias of: dom.removeAttribute
     *  dom.removeAttr(element)
     *  dom.removeAttr(element, attr)
     *  dom.removeAttr(element, attrs)
     *  - element (Element): Element whose attributes should be removed.
     *  - attr (String): Optional attribute to remove.
     *  - attrs (Array): Optional array of attributes to remove.
     *
     *  Removes attributes from the specified `element`.
     *
     *      <div id="a" class="test" aria-hidden="true" data-test="1">a</div>
     *
     *  Given the element above, this function would have the following effects:
     *
     *      var div = dom.byId('a');
     *      dom.removeAttr(div, 'data-test');
     *      // Element is now:
     *      // <div id="a" class="test" aria-hidden="true">a</div>
     *      dom.removeAttr(div, 'does-not-exist');
     *      // Element is unchanged:
     *      // <div id="a" class="test" aria-hidden="true">a</div>
     *
     *  An array of attributes can be passed to remove multiple attributes at
     *  the same time.
     *
     *      dom.removeAttr(div, ['id', 'class', 'does-not-exist']);
     *      // Element is now:
     *      // <div aria-hidden="true">a</div>
     *
     *  If only the `element` is defined, all attributes will be removed.
     *
     *      dom.removeAttr(div);
     *      // Element is now:
     *      // <div>a</div>
     *
     **/
    function removeAttr(element, attr) {

        element = core.getClosestElement(element);

        if (typeof attr === "string") {
            attr = [attr];
        } else  if (!attr) {
            attr = Object.keys(getAttr(element));
        }

        attr.forEach(function (attribute) {
            element.removeAttribute(attr);
        });

    }

    /** alias of: dom.setAttribute
     *  dom.setAttr(element, attr, value)
     *  dom.setAttr(element, attrs)
     *  - element (Element): Element whose attributes should be set.
     *  - attr (String): Attribute name.
     *  - value (String|Number|Boolean): Attribute value.
     *  - attrs (Object): Map of attributes to add.
     *
     *  Sets attributes on an element.
     *
     *      <div>a</div>
     *
     *  With the element above, this function would have the following effects:
     *
     *      var div = dom.byQuery('div');
     *      dom.setAttr(div, 'id', 'a');
     *      // Element is now:
     *      // <div id="a">a</div>
     *
     *  A map of attributes to values can be passed to set multiple attributes
     *  at the same time.
     *
     *      dom.setAttr(div, {
     *          "class": "one",
     *          "data-test": 1
     *      });
     *      // Element is now:
     *      // <div id="a" class="one" data-test="true">a</div>
     *
     **/
    function setAttr(element, attr, value) {

        var isString = typeof attr === "string";
        var map = isString
            ? {}
            : attr;

        if (isString) {
            map[attr] = value;
        }

        element = core.getClosestElement(element);

        util.Object.each(map, function (name, value) {
            element.setAttribute(name, value);
        });

    }

    util.Object.assign(dom, {

        getAttr,
        hasAttr,
        removeAttr,
        setAttr,

        // aliases
        getAttribute:    getAttr,
        hasAttribute:    hasAttr,
        removeAttribute: removeAttr,
        setAttribute:    setAttr

    });

    return Object.freeze(dom);

});
