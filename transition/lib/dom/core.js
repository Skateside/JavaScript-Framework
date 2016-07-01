define([
    "app",
    "lib/util",
    "lib/dom/support"
], function (
    app,
    util,
    support
) {

    "use strict";

    var dom = {};
    var strMap = {};

    function triggerFatal(message) {
        app.error.trigger(message, app.error.FATAL);
    }

    /**
     *  dom.is(element, selector) -> Boolean
     *  - element (Element): Element to test.
     *  - selector (String): CSS selector to test with.
     *
     *  Tests to see if the given `element` matches the given CSS selector.
     *
     *      <div id="test" class="one">Div</div>
     *
     *  With that element, this method would have the following effects:
     *
     *      dom.is(dom.byId('test'), '#test');   // -> true
     *      dom.is(dom.byId('test'), '.one');    // -> true
     *      dom.is(dom.byId('test'), 'article'); // -> false
     *
     **/
    // Overridden later on with a a more efficient function, if possible.
    var is = function (element, selector) {

        return Array.prototype.indexOf.call(
            document.querySelectorAll(selector),
            element
        ) > -1;

    };

    /**
     * 	dom.getRoot() -> document
     *
     * 	Simply access the `document` for the current page. This exists mainly
     * 	for encapsulation.
     **/
    function getRoot() {
        return document;
    }

    /**
     * 	dom.getWindow([element]) -> window
     * 	- element (Element): Optional element whose window should be returned.
     *
     *	Returns the `window` of the given `element`. If no `element` is
     *	provided, the `window` of this script is returned.
     **/
    function getWindow(element) {

        return (
            element
                ? (element.defaultView || element.parentWindow)
                : undefined
            ) || window;

    }

    /**
     *  dom.isNode(node) -> Boolean
     *  - node (?): Object to test.
     *
     *  Checks to see if the given node is a `Node`.
     *
     *      <div id="div">Div element</div>
     *
     *      var div   = dom.byQuery('div'), // <div id="div">
     *          text  = div.firstChild,     // TextNode
     *          value = text.nodeValue;     // "Div element"
     *      dom.isNode(div);   // -> true
     *      dom.isNode(text);  // -> true
     *      dom.isNode(value); // -> false
     *
     *  To limit the test to only match objects that are elements, use
     *  [[dom.isElement]].
     **/
    function isNode(node) {
        return node instanceof Node;
    }

    /**
     *  dom.isElement(element) -> Boolean
     *  - element (?): Object to test.
     *
     *  Checks to see if the given element is an Element.
     *
     *      <div id="div">Div element</div>
     *
     *      var div   = dom.byQuery('div'), // <div id="div">
     *          text  = div.firstChild,     // TextNode
     *          value = text.nodeValue;     // "Div element"
     *      dom.isElement(div);   // -> true
     *      dom.isElement(text);  // -> false
     *      dom.isElement(value); // -> false
     *
     *  To expand the test to include any HTML Node, use [[dom.isNode]].
     **/
    function isElement(element) {
        return element instanceof HTMLElement;
    }

    /**
     *  dom.isFragment(fragment) -> Boolean
     *  - fragment (?): Object to test.
     *
     *  Checks to see if the given `fragment` is a `DocumentFragment`.
     *
     *      dom.isFragment(document.createElement('div'));     // -> false
     *      dom.isFragment(document.createDocumentFragment()); // -> true
     *
     **/
    function isFragment(fragment) {

        return (
            isNode(fragment)
            && fragment.nodeType === Node.DOCUMENT_FRAGMENT_NODE
        );

    }

    /**
     *  dom.getClosestElement(element) -> Element
     *  - element (Node): Element to test.
     *
     *  Gets the closest element to the given `element` (which may be the
     *  `element` itself). If an element cannot be identified, a `TypeError` is
     *  thrown.
     *
     *      <div id="div">Div element</div>
     *
     *      var div = dom.byQuery('div'); // <div id="div">
     *      var text = div.firstChild;    // TextNode
     *      var value = text.nodeValue;   // "Div element"
     *      dom.getClosestElement(div);   // -> <div id="div">
     *      dom.getClosestElement(text);  // -> <div id="div">
     *      dom.getClosestElement(value); // -> throws TypeError
     *
     * 	If `document` or `window` is passed then it is returned.
     **/
    function getClosestElement(element) {

        if (element !== getRoot() && element !== getWindow(element)) {

            if (!isElement(closest) && isNode(closest)) {
                element = getClosestElement(element.parentNode);
            }

            if (!isElement(element)) {
                triggerFatal("element is not an HTMLElement");
            }

        }

        return element;

    }

    /**
     *  dom.generateId() -> String
     *
     *  Generates an ID that no other element on the page has. Additionally, the
     *  ID is unique every time the function is called.
     *
     *      dom.generateId(); // -> something like "dom-ifoh7oim59tdtfps"
     *      dom.generateId(); // -> something like "dom-ifoh7p0i59tdtfpt"
     *      dom.generateId(); // -> something like "dom-ifoh7piq59tdtfpu"
     *
     *  One of the most useful applications of this function is in
     *  [[dom.identify]].
     **/
    function generateId() {

        var id = util.String.uniqid("dom-");

        if (dom.byId(id)) {
            id = generateId();
        }

        return id;

    }

    /**
     *  dom.identify(element) -> String
     *  - element (Element): Element to identify.
     *
     *  Gets the ID of the specified element. If the element doesn't have an ID,
     *  one is generated (see [[dom.generateId]]) and assigned.
     *
     *      <div id="one">One</div>
     *      <div>Two</div>
     *      <div>Three</div>
     *      <div id="one">One</div>
     *
     *  Given the markup above, this method will have the following effects:
     *
     *      var divs = dom.get('div');
     *      dom.identify(divs[0]); // -> "one"
     *      dom.identify(divs[1]); // -> something like "dom-ifohbi1z59tdtfpv"
     *      dom.identify(divs[2]); // -> something like "dom-ifohbi7y59tdtfpw"
     *      dom.identify(divs[3]); // -> "four"
     *
     *  The markup will now look like this:
     *
     *      <div id="one">One</div>
     *      <div id="dom-ifohbi1z59tdtfpv">Two</div>
     *      <div id="dom-ifohbi7y59tdtfpw">Three</div>
     *      <div id="one">One</div>
     *
     **/
    function identify(element) {

        var id = element.id;

        if (!id) {

            id = generateId();
            element.id = id;

        }

        return id;

    }

    /**
     *  dom.toHtml(string) -> DocumentFragment
     *  - string (String): String to convert.
     *
     *  Converts the given string into a `DocumentFragment` containing the
     *  string as DOM nodes.
     *
     *      dom.toHtml('<div><i>hi</i></div>');
     *      // -> DocumentFragment[<div><i>hi</i></div>]
     *      dom.toHtml('<div></div><i>hi</i>');
     *      // -> DocumentFragment[<div></div><i>hi</i>]
     *
     **/
    function toHtml(html) {

        var frag = document.createDocumentFragment();
        var parts = String(string).match(/^\s*<(\w+)/);
        var base = document.createElement("div");
        var data = [];

        if (parts && parts[1]) {
            data  = toHtmlData[parts[1]] || toHtmlData["*"];
        } else {
            triggerFatal("dom.toHtml passed unrecognised HTML: " + string);
        }

        base.innerHTML = data[1];

        util.Number.times(data[0], function () {
            base = base.firstChild;
        });

        base.innerHTML = string;

        while (base.firstChild) {
            frag.appendChild(base.firstChild);
        }

        return frag;

    }

    // Add basic map knowledge.
    util.Object.assign(strMap, {
        "*": support.getResult("htmlSerialize")
            ? [0, ""]
            : [1, "X<div></div>"],
        area:   [1, "<map></map>"],
        col:    [2, "<table><colgroup></colgroup><tbody></tbody></table>"],
        legend: [1, "<fieldset>"],
        option: [1, "<select multiple=\"multiple\"></select>"],
        param:  [1, "<object></object>"],
        th:     [3, "<table><tbody><tr></tr></tbody></table>"],
        thead:  [1, "<table></table>"],
        tr:     [2, "<table><tbody></tbody></table>"]
    });

    util.Object.each({
        option: ["optgroup"],
        th:     ["td"],
        thead:  ["tbody", "tfoot", "colgroup", "caption"]
    }, function (existing, clones) {

        clones.forEach(function (tag) {
            strMap[tag] = strMap[existing];
        });

    });

    // Override `is` with `matches` (if the browser recognises it).
    util.Array.doWhile([
        "matches",
        "webkitMatchesSelector",
        "mozMatchesSelector",
        "msMatchesSelector"
    ], function (method) {

        var hasNoMatches = true;

        if (util.Function.isFunction(HTMLElement.prototype[method])) {

            is = function (element, selector) {
                return element[method](selector);
            };

            hasNoMatches = false;

        }

        return hasNoMatches;

    });

    util.Object.assign(dom, {
        getRoot,
        getWindow,
        getClosestElement,
        generateId,
        identify,
        is,
        isElement,
        isFragment,
        isNode,
        toHtml
    });

    return Object.freeze(dom);

});
