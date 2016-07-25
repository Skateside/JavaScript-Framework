define([
    "lib/util",
    "lib/dom/core",
    "lib/dom/lookups"
], function (
    util,
    core,
    lookups
) {

    "use strict";

    var helpers = {};

    /**
     *  util.dom.isHidden(element) -> Boolean
     *  - element (Element): Element to check.
     *
     *  Checks to see if an element is hidden (takes up no space on the page).
     *
     *      <p id="one">One</p>
     *      <p id="two" style="display:none;">Two</p>
     *
     *      dom.isHidden(dom.byId("one")); // -> false
     *      dom.isHidden(dom.byId("two")); // -> true
     *
     *  To check if an element is visible, use [[dom.isVisible]].
     **/
    function isHidden(element) {

        element = core.getClosestElement(element);

        return element.offsetHeight <= 0 && element.offsetWidth <= 0;

    }

    /**
     *  util.dom.isDisabled(element) -> Boolean
     *  - element (Element): Element to check.
     *
     *  Checks to see if an element is disabled.
     *
     *      <button id="one">One</button>
     *      <button id="two" disabled>Two</button>
     *
     *      dom.isDisabled(dom.byId("one")); // -> false
     *      dom.isDisabled(dom.byId("two")); // -> true
     *
     *  To check if an element is enabled, use [[dom.isEnabled]].
     **/
    function isDisabled(element) {
        return core.getClosestElement(element).disabled === true;
    }

    /**
     *  util.dom.isSelected(element) -> Boolean
     *  - element (Element): Element to check.
     *
     *  Checks to see if an element is selected.
     *
     *      <select>
     *          <option id="one">One</option>
     *          <option id="two" selected>Two</option>
     *      </selected>
     *
     *      dom.isSelected(dom.byId("one")); // -> false
     *      dom.isSelected(dom.byId("two")); // -> true
     *
     **/
    function isSelected(element) {

        var elem = core.getClosestElement(element);
        var parent = elem.parentNode;

        return (
            elem.selected === true
            || util.Array.contains(
                parent.selectedOptions || lookups.get("[selected]", parent),
                elem
            )
        );

    }

    util.Object.assign(helpers, {

        isHidden: isHidden,
        isDisabled: isDisabled,
        isSelected: isSelected,

        /**
         *  util.dom.isVisible(element) -> Boolean
         *  - element (Element): Element to check.
         *
         *  Checks to see if an element is visible (takes up space on the page).
         *
         *      <p id="one">One</p>
         *      <p id="two" style="display:none;">Two</p>
         *
         *      dom.isVisible(dom.byId("one")); // -> true
         *      dom.isVisible(dom.byId("two")); // -> false
         *
         *  To check if an element is hidden, use [[dom.isHidden]].
         **/
        isVisible: util.Function.negate(isHidden),

        /**
         *  util.dom.isEnabled(element) -> Boolean
         *  - element (Element): Element to check.
         *
         *  Checks to see if an element is enabled.
         *
         *      <button id="one">One</button>
         *      <button id="two" disabled>Two</button>
         *
         *      dom.isEnabled(dom.byId("one")); // -> true
         *      dom.isEnabled(dom.byId("two")); // -> false
         *
         *  To check if an element is disabled, use [[dom.isDisabled]].
         **/
        isEnabled: util.Function.negate(isDisabled)

    });

    return Object.freeze(helpers);

});
