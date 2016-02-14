define([
    "./lib/util",
    "./lib/dom/core",
    "./lib/dom/support"
], function (
    util,
    core,
    support
) {

    "use strict";

    var dom = {};

    // Private function.
    // Creates a DOMException-like error to be thrown.
    function domEx(type, message) {

        return {
            name: type,
            code: DOMException[type],
            message: message
        };

    }

    // Private function.
    // Validates a class name.
    function validateClassName(className) {

        if (className === "") {

            throw domEx(
                "SYNTAX_ERR",
                "An invalid or illegal string was specified"
            );

        }

        if (/\s/.test(className)) {

            throw domEx(
                "INVALID_CHARACTER_ERR",
                "String contains an invalid character"
            );

        }

        return className;

    }

    // Private function.
    // Gets classes from an element as an array.
    function getClasses(element) {
        return (element.className || '').split(/\s+/);
    }

    // Use classList if we can, fall back if we have to.
    if (support.getResult("multiClassList")) {

        /**
         *  dom.hasClass(element, className) -> Boolean
         *  dom.hasClass(element, ...classes) -> Array
         *  - element (Element): Element whose classes should be checked.
         *  - className (String): Class name to check.
         *  - classes (Array): Array of class names to check.
         *
         *  Checks to see if the specified `element` has one or more classes.
         *  Consider this element.
         *
         *      <div id="a" class="one two">a</div>
         *
         *  With that element, this function will have the following effects.
         *
         *      var div = dom.byId('a');
         *      dom.hasClass(div, 'one');   // -> true
         *      dom.hasClass(div, 'two');   // -> true
         *      dom.hasClass(div, 'three'); // -> false
         *
         *  This method can also take an array of classes to check multiple at
         *  the same time.
         *
         *      dom.hasClass(div, ['one', 'two', 'three']);
         *      // -> [true, true, false]
         *
         **/
        dom.hasClass = function (element, ...classes) {

            var tag = core.getClosestElement(element);
            var has = classes.map(function (className) {
                return tag.classList.contains(className);
            });

            return classes.length === 1
                ? has[0]
                : has;

        };

        /**
         *  dom.addClass(element, ...classes)
         *  - element (Element): Element that should gain classes.
         *  - classes (String): Class to add.
         *
         *  Adds classes to an element. Consider this element.
         *
         *      <div id="a">a</div>
         *
         *  With that element, this function would have these effects:
         *
         *      var div = dom.byId('a');
         *      dom.addClass(div, 'one');
         *      // Element is now:
         *      // <div id="a" class="one">
         *
         *  Multiple classes can be added at once.
         *
         *      dom.addClass(div, 'two', 'three');
         *      // Element is now:
         *      // <div id="a" class="one two three">
         *
         *  Attempting to add classes which the element already has will not
         *  have any effect.
         *
         *      dom.addClass(div, 'one');
         *      // Element is still:
         *      // <div id="a" class="one two three">
         *
         **/
        dom.addClass = function (element, ...classes) {
            core.getClosestElement(element).classList.add(...classes);
        };

        /**
         *  dom.removeClass(element, ...classes)
         *  - element (Element): Element whose classes should be removed.
         *  - classes (String): Classes to remove.
         *
         *  Removes classes to an element. Consider this element.
         *
         *      <div id="a" class="one two three">a</div>
         *
         *  With that element, this function would have these effects:
         *
         *      var div = dom.byId('a');
         *      dom.removeClass(div, 'one');
         *      // Element is now:
         *      // <div id="a" class="two three">
         *
         *  Multiple classes can be removed at once.
         *
         *      dom.removeClass(div, 'two', 'three');
         *      // Element is now:
         *      // <div id="a" class="">
         *
         *  Attempting to remove classes which the element doesn't have will not
         *  have any effect.
         *
         *      dom.removeClass(div, 'one');
         *      // Element is still:
         *      // <div id="a" class="">
         *
         **/
        dom.removeClass = function (element, ...classes) {
            core.getClosestElement(element).classList.remove(...classes);
        };

        /**
         *  dom.toggleClass(element, ...classes)
         *  - element (Element): Element whose classes should be toggled.
         *  - classes (String): Class to toggle.
         *
         *  Adds classes that the element doesn't have, removes classes that it
         *  does. Consider this element.
         *
         *      <div id="a" class="one two">a</div>
         *
         *  With this element, this function would have the following effects.
         *
         *      var div = dom.byId('a');
         *      dom.toggleClass(div, 'one');
         *      // Element is now:
         *      // <div class="a" class="two">
         *      dom.toggleClass(div, 'one');
         *      // Element is now:
         *      // <div class="a" class="two one">
         *
         *  Multiple classes can be toggled at the same time.
         *
         *      dom.toggleClass(div, 'two', 'three');
         *      // Element is now:
         *      // <div id="a" class="one three">
         *
         *  There is no way to force this function to always add or always
         *  remove classes; use [[dom.addClass]] and [[dom.removeClass]] for
         *  those situations.
         **/
        dom.toggleClass = function (element, ...classes) {

            element = core.getClosestElement(element);

            classes.forEach(function (className) {
                return element.classList.toggle(className);
            });

        };

    // Fallbacks. Same signature, same process. No need to re-comment.
    } else {

        dom.hasClass = function (element, ...classes) {

            var tag   = core.getClosestElement(element);
            var names = getClasses(tag);
            var has   = classes.map(function (className) {
                return names.indexOf(validateClassName(className)) > -1;
            });

            return classes.length === 1
                ? has[0]
                : has;

        };

        dom.addClass = function (element, ...classes) {

            var tag = core.getClosestElement(element);
            var names = util.Array.unique(
                getClasses(tag).concat(classes.map(validateClassName))
            );

            tag.className = names.join(" ");

        };

        dom.removeClass = function (element, ...classes) {

            var tag = core.getClosestElement(element),
            var names = util.Array.remove(
                getClasses(tag),
                ...classes.map(validateClassName)
            );

            tag.className = names.join(" ");

        };

        dom.toggleClass = function (element, ...classes) {

            var tag = core.getClosestElement(element);
            var names = getClasses(tag);

            classes.forEach(function (className) {

                var index = names.indexOf(validateClassName(className));

                if (index < 0) {
                    names.push(className);
                } else {
                    names.splice(index, 1);
                }

            });

            tag.className = names.join(" ");

        };

    }

    return Object.freeze(dom);

});
