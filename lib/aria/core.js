define([
    "lib/util",
    "lib/dom"
], function (
    util,
    dom
) {

    "use strict";

    var core = {};

    /**
     *  aria.normalise(name) -> String
     *  - name (String): Name of the attribute to normalise.
     *
     *  Normalises an `aria-*` attribute so that the attribute is always in
     *  lower case and always starts with `aria-`.
     *
     *      aria.normalise("hidden");     // -> "aria-hidden"
     *      aria.normalise("labelledBy"); // -> "aria-labelledby"
     *      aria.normalise("aria-busy");  // -> "aria-busy"
     *
     *  This method is not very useful by itself but it makes it much easier to
     *  work with other methods.
     **/
    function normalise(name) {

        var lower = String(name).toLowerCase();

        return lower.slice(0, 5) === "aria-"
            ? lower
            : "aria-" + lower;

    }

    /**
     *  aria.getProperty(element, name) -> String
     *  - element (Element): Element whose property should be returned.
     *  - name (String): Name of the property.
     *
     *  Gets the value of the `aria-*` property. If the property is not
     *  recognised, an empty string is returned.
     *
     *      <div id="foo" aria-label="bar" aria-posinset="0">Foo</div>
     *
     *      var elem = dom.byId("foo");
     *      aria.getProperty(elem, "label");    // -> "bar"
     *      aria.getProperty(elem, "posinset"); // -> "0"
     *      aria.getProperty(elem, "sort");     // -> ""
     *
     **/
    function getProperty(element, name) {
        return dom.getAttr(element, normalise(name));
    }

    /**
     *  aria.hasProperty(element, name) -> Boolean
     *  - element (Element): Element that should be checked.
     *  - name (String): Name of the property to check.
     *
     *  Checks to see if the element has the specified `aria-*` property,
     *  regardless of its value.
     *
     *      <div id="foo" aria-label="bar" aria-posinset="0">Foo</div>
     *
     *      var elem = dom.byId("foo");
     *      aria.hasProperty(elem, "label");    // -> true
     *      aria.hasProperty(elem, "posinset"); // -> true
     *      aria.hasProperty(elem, "sort");     // -> false
     *
     **/
    function hasProperty(element, name) {
        return dom.hasAttr(element, normalise(name));
    }

    /**
     *  aria.setProperty(element, name, value)
     *  - element (Element): Element that should have a property set.
     *  - name (String): Name of the property to set.
     *  - value (String): Value of the property.
     *
     *  Sets the property on the specified element to the given value.
     *
     *      <div id="foo">Foo</div>
     *
     *      var elem = dom.byId("foo");
     *      aria.setProperty(elem, "label", "true");
     *      // "foo" element is now:
     *      // <div id="foo" aria-label="true">Foo</div>
     *
     *  The `value` argument gets coerced into a string so any type may be
     *  passed, although it may have strange results. Use with caution.
     *
     *      aria.setProperty(elem, "label", true);
     *      // <div id="foo" aria-label="true">Foo</div>
     *      aria.setProperty(elem, "label", 1);
     *      // <div id="foo" aria-label="1">Foo</div>
     *      aria.setProperty(elem, "label", []);
     *      // <div id="foo" aria-label="">Foo</div>
     *      aria.setProperty(elem, "label", {});
     *      // <div id="foo" aria-label="[object Object]">Foo</div>
     *
     **/
    function setProperty(element, name, value) {
        dom.setAttr(element, normalise(name), value);
    }

    /**
     *  aria.removeProperty(element, name)
     *  - element (Element): Element whose property should be removed.
     *  - name (String): Name of the property to remove.
     *
     *  Removes an `aria-*` property from the given element.
     *
     *      <div id="foo" aria-label="true">Foo</div>
     *
     *      var elem = dom.byId("foo");
     *      aria.removeProperty(elem, "label");
     *      // "foo" element is now:
     *      // <div id="foo">Foo</div>
     *
     **/
    function removeProperty(element, name) {
        dom.removeAttr(element, normalise(name));
    }

    util.Object.assign(core, {
        normalise: normalise,
        hasProperty: hasProperty,
        getProperty: getProperty,
        setProperty: setProperty,
        removeProperty: removeProperty
    });

    return Object.freeze(core);

});
