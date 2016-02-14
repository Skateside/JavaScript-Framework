/**
 *  aria
 *
 *  A collection of functions that help assigning WAI-ARIA attributes to
 *  elements.
 *
 *  This object has four groups of low-level functions that work similarly;
 *  most helper functions call one of these functions.
 *
 *  - properties ([[aria.getProperty]], [[aria.hasProperty]],
 *    [[aria.setProperty]])
 *    Properties are generic `aria-*` attributes. Attributes are always
 *    normalised using [[aria.normalise]].
 *  - references ([[aria.getReference]], [[aria.hasReference]],
 *    [[aria.setReference]])
 *    References are attributes that reference another element (typically by
 *    ID). The main advantage these methods provide is that setting a refernce
 *    can be done by passing the element to reference and getting the reference
 *    can return either the ID or the element that the ID identifies. The
 *    `aria-` prefix for the attribute is automatically added by the functions.
 *  - roles ([[aria.getRole]], [[aria.hasRole]], [[aria.setRole]])
 *    Used for manipulating roles.
 *  - states ([[aria.getState]], [[aria.hasState]], [[aria.setState]])
 *    States can be set with either strings (`"true"` or `"false"`), with
 *    booleans (`true` or `false`) or with nothing (which assumes `true`).
 *    Getting a state always returns a boolean.
 *
 *  Most other functions in [[aria]] are helpful wrappers for these functions,
 *  usually with pre-defined arguments.
 *
 *  Additionally, [[aria.each]] can be used to affect multiple elements at the
 *  same time.
 **/
define(['./lib/util', './lib/dom'], function (util, dom) {

    'use strict';

    var aria = {};

    // Helper function for ease of typing.
    function addToAria(methods) {
        util.Object.assign(aria, methods);
    }

    /**
     *  aria.normalise(name) -> String
     *  - name (String): Name of the attribute to normalise.
     *
     *  Normalises an `aria-*` attribute so that the attribute is always in
     *  lower case and always starts with `aria-`.
     *
     *      aria.normalise('hidden');     // -> "aria-hidden"
     *      aria.normalise('labelledBy'); // -> "aria-labelledby"
     *      aria.normalise('aria-busy');  // -> "aria-busy"
     *
     *  This method is not very useful by itself but it makes it much easier to
     *  work with other methods.
     **/
    function normalise(name) {

        var lower = String(name).toLowerCase();

        return lower.slice(0, 5) === 'aria-'
            ? lower
            : 'aria-' + lower;

    }

    /**
     *  aria.makeFocusable(element)
     *  - element (Element): Element that should become focusable.
     *
     *  Makes the given element able to gain focus by giving it the attribute
     *  `tabindex` and setting it to `0`.
     **/
    function makeFocusable(element) {
        dom.setAttr(element, 'tabindex', 0);
    }

    /**
     *  aria.makeUnfocusable(element)
     *  - element (Element): Element that should become unfocusable.
     *
     *  Removes the element's ability to gain focus by giving it the attribute
     *  `tabindex` and setting it to `-1`.
     **/
    function makeUnfocusable(element) {
        dom.setAttr(element, 'tabindex', -1);
    }

    // Helpers
    addToAria({

        normalise,
        makeFocusable,
        makeUnfocusable,

        /**
         *  area.each(elements, method, ...args) -> Array
         *  - elements (Array): Elements to affect.
         *  - method (String): Method to call.
         *  - args (?): Arguments to pass to `method`.
         *
         *  Executes an [[aria]] method on multiple elements at once. The
         *  `elements` may be any iterable object, such as an `Array` or a
         *  `NodeList`. For example, this call will make all elements with the
         *  "one" class focusable (see [[aria.makeFocusable]]).
         *
         *      aria.each(dom.byClass('one'), 'makeFocusable');
         *
         *  Arguments may be passed to the method by adding them to the method
         *  call. For example, this call will give all elements with the "two"
         *  class the WAI-ARIA property "label" and set it to `true` (see
         *  [[aria.setProperty]]).
         *
         *      aria.each(dom.byClass('two'), 'setProperty', 'label', true);
         *
         *  As the method is executed on each element, the results are recorded
         *  and returned as an array. For example, this will get the "label"
         *  properties of all elements with the "three" class (see
         *  [[aria.getProperty]]).
         *
         *      aria.each(dom.byClass('three'), 'getProperty', 'label');
         *      // -> ["true", "true", "true" ... ]
         *
         **/
        each: util.Array.makeInvoker(aria)

    });


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
     *      var elem = dom.byId('foo');
     *      aria.getProperty(elem, 'label');    // -> "bar"
     *      aria.getProperty(elem, 'posinset'); // -> "0"
     *      aria.getProperty(elem, 'sort');     // -> ""
     * 
     **/
    function getProperty(element, name) {
        return dom.getAttr(element, normalise(name));
    },

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
     *      var elem = dom.byId('foo');
     *      aria.hasProperty(elem, 'label');    // -> true
     *      aria.hasProperty(elem, 'posinset'); // -> true
     *      aria.hasProperty(elem, 'sort');     // -> false
     * 
     **/
    function hasProperty(element, name) {
        return dom.hasAttr(element, normalise(name));
    },

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
     *      var elem = dom.byId('foo');
     *      aria.setProperty(elem, 'label', 'true');
     *      // "foo" element is now:
     *      // <div id="foo" aria-label="true">Foo</div>
     *
     *  The `value` argument gets coerced into a string so any type may be
     *  passed, although it may have strange results. Use with caution.
     * 
     *      aria.setProperty(elem, 'label', true);
     *      // <div id="foo" aria-label="true">Foo</div>
     *      aria.setProperty(elem, 'label', 1);
     *      // <div id="foo" aria-label="1">Foo</div>
     *      aria.setProperty(elem, 'label', []);
     *      // <div id="foo" aria-label="">Foo</div>
     *      aria.setProperty(elem, 'label', {});
     *      // <div id="foo" aria-label="[object Object]">Foo</div>
     * 
     **/
    function setProperty(element, name, value) {
        dom.setAttr(element, normalise(name), value);
    },

    /**
     *  aria.removeProperty(element, name)
     *  - element (Element): Element whose property should be removed.
     *  - name (String): Name of the property to remove.
     *
     *  Removes an `aria-*` property from the given element.
     *
     *      <div id="foo" aria-label="true">Foo</div>
     *
     *      var elem = dom.byId('foo');
     *      aria.removeProperty(elem, 'label');
     *      // "foo" element is now:
     *      // <div id="foo">Foo</div>
     * 
     **/
    function removeProperty(element, name) {
        dom.removeAttr(element, normalise(name));
    }

    // Properties
    addToAria({
        getProperty,
        hasProperty,
        setProperty,
        removeProperty
    });

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
     *      aria.setReference(dom.byId('bar'), 'labelledby', 'foo');
     *      // "bar" element is now:
     *      // <div id="bar" aria-labelledby="foo">Bar element</div>
     *      aria.setReference(dom.byId('baz'), 'labelledby', dom.byId('foo'));
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
     *      aria.setReference(dom.byId('bar'), 'label', 'An element');
     *      // "bar" element is now:
     *      // <div id="bar" aria-label="An element">Bar element</div>
     *      aria.setReference(dom.byId('baz'), 'label', dom.byId('foo'));
     *      // "baz" element is now:
     *      // <div id="baz" aria-labelledby="foo">Baz element</div>
     *
     **/
    function setReference(element, name, value) {

        if (dom.isElement(value)) {
            value = dom.identify(value);
        }

        setProperty(element, name, value);

    }

    /**
     *  aria.getReference(element, name[, returnElement = false]) -> String|Element|null
     *  - element (Element): Element with a reference.
     *  - name (String): Reference name to set.
     *  - returnElement (Boolean): Optional setting.
     *
     *  Gets the reference on the given `element`.
     *
     *      <div id="foo">Label</div>
     *      <div aria-labelledby="foo"></div>
     *
     *      var elem = document.querySelector('[aria-labelledby]');
     *      aria.getReference(elem, 'labelledby'); // -> "foo"
     *
     *  An empty string is returned if the reference is not recognised or
     *  not set.
     *  
     *      aria.getReference(elem, 'activedescendant'); // -> ""
     *      aria.getReference(elem, 'does-not-exist');   // -> ""
     *
     *  If `returnElement` is passed as `true`, the referenced element is
     *  returned rather than the ID; if the element cannot be found, `null` is
     *  returned (see [[dom.byId]]). If ommitted, `false` is assumed.
     *
     *      aria.getReference(elem, 'labelledby', true);
     *      // -> <div id="foo">Label</div>
     *      aria.getReference(elem, 'labelledby', false);
     *      // -> "foo"
     *      aria.getReference(elem, 'labelledby');
     *      // -> "foo"
     * 
     **/
    function getReference(element, name, returnElement) {

        var attr = getProperty(element, name);

        return returnElement
            ? dom.byId(attr)
            : attr;

    },

    // References
    addToAria({

        getReference,
        setReference,

        /**
         *  aria.hasReference(element, name) -> Boolean
         *  - element (Element): Element to test.
         *  - name (String): Reference to check.
         *
         *  Checks whether an element has the given reference.
         *
         *      <div id="foo">Label</div>
         *      <div aria-labelledby="foo"></div>
         *
         *      var elem = document.querySelector('[aria-labelledby]');
         *      aria.hasReference(elem, 'labelledby');       // -> true
         *      aria.hasReference(elem, 'activedescendant'); // -> false
         *      aria.hasReference(elem, 'does-not-exist');   // -> false
         * 
         **/
        hasReference: hasProperty,

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
         *      var elem = document.querySelector('[aria-labelledby]');
         *      aria.removeReference(elem, 'labelledby');
         *      // -> Second div element is now:
         *      // <div></div>
         * 
         **/
        removeReference: removeProperty

    });

    /**
     *  aria.getRole(element) -> String
     *  - element (Element): Element whose role should be returned.
     *
     *  Gets the role of an element.
     *
     *      <div id="foo" role="presentation">Foo element</div>
     *
     *      aria.getRole(dom.byId('foo')); // -> "presentation"
     *
     **/
    function getRole(element) {
        return dom.getAttr(element, 'role');
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
     *      aria.getRole(dom.byId('foo')); // -> true
     *      aria.getRole(dom.byId('bar')); // -> false
     * 
     **/
    function hasRole(element) {
        return dom.hasAttr(element, 'role');
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
     *      aria.setRole(dom.byId('foo'), 'presentation');
     *      // -> "foo" element is now:
     *      // <div id="foo" role="presentation">Foo element</div>
     * 
     **/
    function setRole(element, role) {
        dom.setAttr(element, 'role', role);
    }

    /**
     *  aria.removeRole(element)
     *  - element (Element): Element whose role should be removed.
     *
     *  Removes the role from the specified element.
     *
     *      <div id="foo" role="presentation">Foo element</div>
     *
     *      aria.removeRole(dom.byId('foo'));
     *      // -> "foo" element is now:
     *      // <div id="foo">Foo element</div>
     * 
     **/
    function removeRole(element) {
        dom.removeAttr(element, 'role');
    }

    // roles
    addToAria({
        getRole,
        hasRole,
        setRole,
        removeRole
    });

    /**
     *  aria.getState(element, name) -> Boolean|null
     *  - element (Element): Element whose state should be returned.
     *  - name (String): Name of the state.
     *
     *  Gets the state of the element.
     *
     *      <div id="foo" aria-hidden="true" aria-busy="false">Foo</div>
     *
     *      var elem = dom.byId('foo');
     *      aria.getState(elem, 'hidden'); // -> true
     *      aria.getState(elem, 'busy');   // -> false
     *
     *  If the state is not set, `null` is returned.
     *
     *      aria.getState(elem, 'checked'); // -> null
     *
     *  Be warned that the loose equality operator (`==`) will coerce `null`
     *  into `false` which may create an undesired result. Either always use the
     *  strict equality operator (`===`) or combine this with [[aria.hasState]].
     **/
    function getState(element, name) {

        var state = null,
            attr  = '';

        if (hasProperty(element, name)) {

            attr  = getProperty(element, name);
            state = attr.toLowerCase() === 'true';

        }

        return state;

    }

    // Takes a raw value and converts it into a boolean.
    function readState(raw) {

        var state = true;

        switch (typeof raw) {

        case 'boolean':

            state = raw;
            break;

        case 'string':

            if (raw === '1' || raw === '0') {
                state = readState(+raw);
            } else if (/^(?:true|false)$/i.test(raw)) {
                state = raw.toLowerCase() === 'true';
            }

            break;

        case 'number':

            // Ensures that only 1 and 0 are recognised as inputs.
            state = raw === 1 || raw !== 0;
            break;

        }

        return state;

    }

    /**
     *  aria.setState(element, name[, state = true])
     *  - element (Element): Element whose state should be set.
     *  - name (String): Name of the state to set.
     *  - state (String|Boolean|Number): Optional state to set.
     *
     *  Sets the state on the specified element.
     *
     *      <div id="foo">Foo</div>
     *
     *      var elem = dom.byId('foo');
     *      aria.getState(elem, 'hidden', true);
     *      // "foo" element is now:
     *      // <div id="foo" aria-hidden="true">Foo</div>
     *
     *  The `state` argument is normalised so the following calls will set the
     *  `aria-hidden` state to `true`:
     *
     *      aria.setState(elem, 'hidden', 'true');
     *      aria.setState(elem, 'hidden', 'TRUE');
     *      aria.setState(elem, 'hidden', true);
     *      aria.setState(elem, 'hidden', 1);
     *      aria.setState(elem, 'hidden', '1');
     *
     *  ... and the following will set the `aria-hidden` state to `false`:
     *
     *      aria.setState(elem, 'hidden', 'false');
     *      aria.setState(elem, 'hidden', 'FALSE');
     *      aria.setState(elem, 'hidden', false);
     *      aria.setState(elem, 'hidden', 0);
     *      aria.setState(elem, 'hidden', '0');
     *
     *  If the `state` argument is ommitted or not recognised, the state is set
     *  to `true`. Therefore, the following examples will all set the
     *  `aria-busy` state to `true`:
     *
     *      aria.setState(elem, 'busy');
     *      aria.setState(elem, 'busy', {});
     *      aria.setState(elem, 'busy', null);
     *      aria.setState(elem, 'busy', 'nothing');
     *      aria.setState(elem, 'busy', -1);
     *
     *  For simplicity, it may be easier to always pass a boolean as the `state`
     *  argument.
     **/
    function setState(element, name, state) {
        setProperty(element, name, readState(state));
    }

    addToAria({

        getState,
        setState,

        /**
         *  aria.hasState(element, name) -> Boolean
         *  - element (Element): Element to check.
         *  - name (String): Name of the state to check.
         *
         *  Checks to see if the given element has the given state, regardless
         *  of the current setting of that state.
         *
         *      <div id="foo" aria-hidden="true" aria-busy="false">Foo</div>
         *
         *      var elem = dom.byId('foo');
         *      aria.getState(elem, 'hidden');  // -> true
         *      aria.getState(elem, 'budy');    // -> true
         *      aria.getState(elem, 'checked'); // -> false
         * 
         **/
        hasState: hasProperty,

        /**
         *  aria.removeState(element, name) -> Boolean
         *  - element (Element): Element whose state should be removed.
         *  - name (String): Name of the state to remove.
         *
         *  Removes the specified state from the given element.
         *
         *      <div id="foo" aria-hidden="true" aria-busy="false">Foo</div>
         *
         *      var elem = dom.byId('foo');
         *      aria.removeState(elem, 'hidden');
         *      // -> "foo" element is now
         *      // <div id="foo" aria-busy="false">Foo</div>
         * 
         **/
        removeState: removeProperty

    });

    return aria;

});