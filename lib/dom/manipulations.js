define([
    "lib/util",
    "lib/dom/core"
], function (
    util,
    core
) {

    "use strict";

    var dom = {};

    /**
     *  dom.before(element, reference)
     *  - element (Element): Element to insert.
     *  - reference (Element): Reference element.
     *
     *  Inserts the given `element` before the reference element. Consider this
     *  markup.
     *
     *      <div id="a">
     *          <div id="b"></div>
     *      </div>
     *      <div id="c"></div>
     *
     *  With that markup, this method would have the following effect.
     *
     *      dom.before(dom.byId('c'), dom.byId('b'));
     *
     *  The marup is now:
     *
     *      <div id="a">
     *          <div id="c"></div>
     *          <div id="b"></div>
     *      </div>
     *
     **/
    function before(element, reference) {
        reference.parentNode.insertBefore(element, reference);
    }

    /**
     *  dom.before(element, reference)
     *  - element (Element): Element to insert.
     *  - reference (Element): Reference element.
     *
     *  Inserts the given `element` after the reference element. Consider this
     *  markup.
     *
     *      <div id="a">
     *          <div id="b"></div>
     *      </div>
     *      <div id="c"></div>
     *
     *  With that markup, this method would have the following effect.
     *
     *      dom.after(dom.byId('c'), dom.byId('b'));
     *
     *  The marup is now:
     *
     *      <div id="a">
     *          <div id="b"></div>
     *          <div id="c"></div>
     *      </div>
     *
     **/
    function after(element, reference) {
        before(element, reference.nextSibling);
    }

    /**
     *  dom.append(element, reference)
     *  - element (Element): Element to insert.
     *  - reference (Element): Reference element.
     *
     *  Appends the `element` to the reference element. Consider this markup.
     *
     *      <div id="a">
     *          <div id="b"></div>
     *      </div>
     *      <div id="c"></div>
     *
     *  With that markup, this method would have the following effect.
     *
     *      dom.append(dom.byId('c'), dom.byId('a'));
     *
     *  The marup is now:
     *
     *      <div id="a">
     *          <div id="b"></div>
     *          <div id="c"></div>
     *      </div>
     *
     **/
    function append(element, reference) {
        reference.parentNode.appendChild(element);
    }

    /**
     *  dom.prepend(element, reference)
     *  - element (Element): Element to insert.
     *  - reference (Element): Reference element.
     *
     *  Prepends the `element` to the reference element. Consider this markup.
     *
     *      <div id="a">
     *          <div id="b"></div>
     *      </div>
     *      <div id="c"></div>
     *
     *  With that markup, this method would have the following effect.
     *
     *      dom.prepend(dom.byId('c'), dom.byId('a'));
     *
     *  The marup is now:
     *
     *      <div id="a">
     *          <div id="c"></div>
     *          <div id="b"></div>
     *      </div>
     *
     **/
    function prepend(element, reference) {
        before(element, reference.firstChild);
    }

    /**
     *  dom.append(element, reference)
     *  - element (Element): Element to insert.
     *  - reference (Element): Reference element.
     *
     *  Appends the reference element to the `element`. This is essentially the
     *  same as [[dom.append]] except that the argument are reversed. Consider
     *  this markup.
     *
     *      <div id="a">
     *          <div id="b"></div>
     *      </div>
     *      <div id="c"></div>
     *
     *  With that markup, this method would have the following effect.
     *
     *      dom.append(dom.byId('a'), dom.byId('c'));
     *
     *  The marup is now:
     *
     *      <div id="a">
     *          <div id="b"></div>
     *          <div id="c"></div>
     *      </div>
     *
     **/
    function appendTo(element, reference) {
        append(reference, element);
    }

    /**
     *  dom.prependTo(element, reference)
     *  - element (Element): Element to insert.
     *  - reference (Element): Reference element.
     *
     *  Prepends the reference element to the `element`. This is essentially the
     *  same as [[dom.prepend]] except that the argument are reversed. Consider
     *  this markup.
     *
     *      <div id="a">
     *          <div id="b"></div>
     *      </div>
     *      <div id="c"></div>
     *
     *  With that markup, this method would have the following effect.
     *
     *      dom.prepend(dom.byId('a'), dom.byId('c'));
     *
     *  The marup is now:
     *
     *      <div id="a">
     *          <div id="c"></div>
     *          <div id="b"></div>
     *      </div>
     *
     **/
    function prependTo(element, reference) {
        prepend(reference, element);
    }

    /**
     *  dom.remove(element)
     *  - element (Element): Element to remove.
     *
     *  Removes an element from the dom. Consider this markup.
     *
     *      <div id="a">
     *          <div id="b"></div>
     *      </div>
     *      <div id="c"></div>
     *
     *  With that markup, this method would have the following effect.
     *
     *      dom.remove(dom.byId('b'));
     *
     *  The markup is now:
     *
     *      <div id="a"></div>
     *      <div id="c"></div>
     *
     **/
    function remove(element) {

        var node = core.getClosestElement(element);
        var parent = node.parentNode;

        if (parent) {
            parent.removeChild(node);
        }

    }

    util.Object.assign(dom, {
        after,
        append,
        appendTo,
        before,
        prepend,
        prependTo,
        remove
    });

    return Object.freeze(dom);

});
