define([
    "lib/util",
    "lib/dom"
], function (
    util,
    dom
) {

    "use strict";

    const ATTRIBUTE_ROLE = "role";
    var roles = {};

    /**
     *  aria.getRole(element) -> String
     *  - element (Element): Element whose role should be returned.
     *
     *  Gets the role of an element.
     *
     *      <div id="foo" role="presentation">Foo element</div>
     *
     *      aria.getRole(dom.byId("foo")); // -> "presentation"
     *
     **/
    function getRole(element) {
        return dom.getAttr(element, ATTRIBUTE_ROLE);
    }

    /**
     *  aria.hasRole(element) -> Boolean
     *  - element (Element): Element to check.
     *
     *  Checks to see if the element has a role.
     *
     *      <div id="foo" role="presentation">Foo element</div>
     *      <div id="bar">Bar element</div>
     *
     *      aria.getRole(dom.byId("foo")); // -> true
     *      aria.getRole(dom.byId("bar")); // -> false
     *
     **/
    function hasRole(element) {
        return dom.hasAttr(element, ATTRIBUTE_ROLE);
    }

    /**
     *  aria.setRole(element, role)
     *  - element (Element): Element whose role should be set.
     *  - role (String): Role to set.
     *
     *  Sets the role of the given element.
     *
     *      <div id="foo">Foo element</div>
     *
     *      aria.setRole(dom.byId("foo"), "presentation");
     *      // -> "foo" element is now:
     *      // <div id="foo" role="presentation">Foo element</div>
     *
     **/
    function setRole(element, role) {
        dom.setAttr(element, ATTRIBUTE_ROLE, role);
    }

    /**
     *  aria.removeRole(element)
     *  - element (Element): Element whose role should be removed.
     *
     *  Removes the role from the specified element.
     *
     *      <div id="foo" role="presentation">Foo element</div>
     *
     *      aria.removeRole(dom.byId("foo"));
     *      // -> "foo" element is now:
     *      // <div id="foo">Foo element</div>
     *
     **/
    function removeRole(element) {
        dom.removeAttr(element, ATTRIBUTE_ROLE);
    }

    util.Object.assign(roles, {
        getRole: getRole,
        hasRole: hasRole,
        setRole: setRole,
        removeRole: removeRole
    });

    return Object.freeze(roles);

});
