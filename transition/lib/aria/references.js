define([
    "lib/util",
    "lib/dom",
    "lib/aria/core"
], function (
    util,
    dom,
    core
) {

    "use strict";

    var references = {};

    /**
     *  aria.setReference(element, name, value)
     *  - element (Element): Element upon which to set a reference.
     *  - name (String): Name of the reference attribute.
     *  - value (String|Element): ID of the element or the element to
     *    reference.
     *
     *  Sets the reference of an element. This can be done either by passing the
     *  string, or by passing the element itself.
     *
     *      <div id="foo">Foo element</div>
     *      <div id="bar">Bar element</div>
     *      <div id="baz">Baz element</div>
     *
     *      aria.setReference(dom.byId("bar"), "labelledby", "foo");
     *      // "bar" element is now:
     *      // <div id="bar" aria-labelledby="foo">Bar element</div>
     *      aria.setReference(dom.byId("baz"), "labelledby", dom.byId("foo"));
     *      // "baz" element is now:
     *      // <div id="baz" aria-labelledby="foo">Baz element</div>
     *
     *  If the element passed as `value` does not yet have an ID, one is
     *  created. See [[dom.identify]] for more information.
     *
     *  If an element is passed, there may be some need to change the
     *  attribute. This is done with the [[aria.refMap]] object.
     *
     *      <div id="foo">Foo element</div>
     *      <div id="bar">Bar element</div>
     *      <div id="baz">Baz element</div>
     *
     *      aria.setReference(dom.byId("bar"), "label", "An element");
     *      // "bar" element is now:
     *      // <div id="bar" aria-label="An element">Bar element</div>
     *      aria.setReference(dom.byId("baz"), "label", dom.byId("foo"));
     *      // "baz" element is now:
     *      // <div id="baz" aria-labelledby="foo">Baz element</div>
     *
     **/
    function setReference(element, name, value) {

        if (dom.isElement(value)) {
            value = dom.identify(value);
        }

        core.setProperty(element, name, value);

    }

    /**
     *  aria.getReference(element, name) -> Element|null
     *  - element (Element): Element with a reference.
     *  - name (String): Reference name to set.
     *
     *  Gets the reference on the given `element`.
     *
     *      <div id="foo">Label</div>
     *      <div aria-labelledby="foo"></div>
     *
     *      var elem = document.querySelector("[aria-labelledby]");
     *      aria.getReference(elem, "labelledby"); // -> <div id="foo">
     *
     *  If the element cannot be found or the property doesn't exist, `null` is
     *  returned.
     *
     *      aria.getReference(elem, "activedescendant"); // -> null
     *
     **/
    function getReference(element, name) {
        return dom.byId(core.getProperty(element, name));
    }

    /**
     *  aria.hasReference(element, name) -> Boolean
     *  - element (Element): Element to test.
     *  - name (String): Reference to check.
     *
     *  Checks whether an element has the given reference and that the
     *  referenced element exists. To just check whether the element has the
     *  property, use [[aria.hasProperty]].
     *
     *      <div id="foo">Label</div>
     *      <div aria-labelledby="foo" aria-controls="not-real"></div>
     *
     *      var elem = document.querySelector("[aria-labelledby]");
     *      aria.hasReference(elem, "labelledby");       // -> true
     *      aria.hasReference(elem, "activedescendant"); // -> false
     *      aria.hasReference(elem, "does-not-exist");   // -> false
     *      aria.hasProperty(elem, "controls");          // -> true
     *      aria.hasReference(elem, "controls");         // -> false
     *
     **/
    function hasReference(element, name) {
        return getReference(element, name) !== null;
    }

    util.Object.assign(references, {

        getReference: getReference,
        setReference: setReference,
        hasReference: hasReference,

        /**
         *  aria.hasReference(element, name) -> Boolean
         *  - element (Element): Element to test.
         *  - name (String): Reference to check.
         *
         *  Removes the reference from the given element.
         *
         *      <div id="foo">Label</div>
         *      <div aria-labelledby="foo"></div>
         *
         *      var elem = document.querySelector("[aria-labelledby]");
         *      aria.removeReference(elem, "labelledby");
         *      // -> Second div element is now:
         *      // <div></div>
         *
         **/
        removeReference: core.removeProperty

    });

    return Object.freeze(references);

});
