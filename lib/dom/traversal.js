define([
    "lib/util",
    "lib/dom/core"
], function (
    util,
    core
), {

    "use strict";

    var dom = {};

    /**
     *  dom.upTheDom(node, handler[, context])
     *  - node (Element): Starting element.
     *  - handler (Function): Handler to call on elements.
     *  - context (?): Optional context for the handler.
     *
     *  Travels up the DOM and executes `handler` on each of them. `handler` is
     *  called with `context` as its context and passed each node that it finds.
     *  If the `handler` returns `false`, the traversal is stopped.
     *
     *      <article class="one" id="a">
     *          <section class="one two" id="b">
     *              <div class="two" id="c">
     *                  <div class="three one" id="d">D</div>
     *              </div>
     *          </section>
     *      </article>
     *
     *  Given the markup above, this function would have the following effects:
     *
     *      var parents = [];
     *      upTheDom(dom.byId('d'), function (node) {
     *          if (dom.hasClass(node, 'one')) {
     *              parents.push(node);
     *          }
     *      });
     *      // parents = [<div id="d">, <section id="b">, <article id="a">]
     *
     **/
    function upTheDom(node, handler, context) {

        if (core.isElement(node) && handler.call(context, node) !== false) {
            upTheDom(node.parentNode, handler, context);
        }

    }

    /**
     *  dom.parents(element[, selector = '*']) -> Array
     *  - element (Element): Starting element.
     *  - selector (String): Optional selector to match.
     *
     *  Finds all parents that match the given CSS selector. If the selector is
     *  not provided (or is not a string), `"*"` is assumed.
     *
     * Consider the following markup:
     *
     *      <html>
     *      <head>
     *      </head>
     *      <body>
     *          <article class="one" id="a">
     *              <section class="one two" id="b">
     *                  <div class="two" id="c">
     *                      <div class="three one" id="d">D</div>
     *                  </div>
     *              </section>
     *          </article>
     *      </body>
     *      </html>
     *
     *  Given that, this method would have the following effects.
     *
     *      dom.parents(dom.byId('d'));
     *      // -> [<div id="c">, <section id="b">, <article id="a">, <body>,
     *      //      <html>]
     *      dom.parents(dom.byId('d'), '.one');
     *      // -> [<section id="b">, <article id="a">]
     *
     *  The passed `element` is automatically run through
     *  [[dom.getClosestElement]] which means that this function will also have
     *  these effects:
     *
     *      var element = dom.byId('d'),
     *          text    = element.firstChild,
     *          value   = text.nodeValue;
     *      dom.parents(element, '.one');
     *      // -> [<section id="b">, <article id="a">]
     *      dom.parents(text, '.one');
     *      // -> [<section id="b">, <article id="a">]
     *      dom.parents(value, '.one');
     *      // -> throws TypeError
     *
     **/
    function parents(element, selector) {

        var parents = [];

        element = core.getClosestElement(element);

        if (typeof selector !== "string") {
            selector = "*";
        }

        upTheDom(element, function (node) {

            if (node !== element && is(node, selector)) {
                parents.push(node);
            }

        });

        return parents;

    }

    /**
     *  dom.parent(element[, selector = '*']) -> Element|undefined
     *  - element (Element): Starting element.
     *  - selector (String): Optional CSS selector.
     *
     *  Gets the immediate parent, or `undefined` if there is no parent or the
     *  parent doesn't match the given `selector`.
     *
     *      <div id="a">
     *          <div id="b">B</div>
     *      </div>
     *
     *  Given the markup above, this method would have the following effects:
     *
     *      dom.parent(dom.byId('b'));
     *      // -> <div id="a">
     *      dom.parent(dom.byId('b'), 'div');
     *      // -> <div id="a">
     *      dom.parent(dom.byId('b'), 'section');
     *      // -> undefined
     *
     *  The passed `element` is automatically run through
     *  [[dom.getClosestElement]] which means that this function will also have
     *  these effects:
     *
     *      var element = dom.byId('b'),
     *          text    = element.firstChild,
     *          value   = text.nodeValue;
     *      dom.parent(element);
     *      // -> <div id="a">
     *      dom.parent(text);
     *      // -> <div id="a">
     *      dom.parent(value);
     *      // -> throws TypeError
     *
     **/
    function parent(element, selector) {

        var parent;

        element = core.getClosestElement(element);

        if (typeof selector !== "string") {
            selector = "*";
        }

        upTheDom(element, function (node) {

            if (node !== element && core.is(node, selector)) {
                parent = node;
            }

            return false;

        });

        return parent;

    }

    /**
     *  dom.closest(element, selector) -> Element|undefined
     *  - element (Element): Starting element.
     *  - selector (String): CSS selector for matching.
     *
     *  Gets the closest element in the parent tree that matches the given
     *  `selector`. The `element` passed is also considered in the results.
     *
     *      <html>
     *      <head>
     *      </head>
     *      <body>
     *          <article class="one" id="a">
     *              <section class="one two" id="b">
     *                  <div class="two" id="c">
     *                      <div class="three one" id="d">D</div>
     *                  </div>
     *              </section>
     *          </article>
     *      </body>
     *      </html>
     *
     *  Given the markup above, this method would have the following effects.
     *
     *      dom.closest(dom.byId('d'), '.one');
     *      // -> <div id="d">
     *      dom.closest(dom.byId('c'), '.one');
     *      // -> <section id="b">
     *      dom.closest(dom.byId('d'), '.does-not-exist');
     *      // -> undefined
     *
     *  The given `element` is automatically run through
     *  [[dom.getClosestElement]] meaning that this function would also have the
     *  following effects:
     *
     *      var element = dom.byId('d'),
     *          text    = element.firstChild,
     *          value   = text.nodeValue;
     *      dom.closest(element, '.one');
     *      // -> <div id="d">
     *      dom.closest(text, '.one');
     *      // -> <div id="d">
     *      dom.closest(value, '.one');
     *      // -> throws TypeError
     *
     **/
    function closest(element, selector) {

        var closest;

        upTheDom(core.getClosestElement(element), function (node) {

            if (core.is(node, selector)) {
                closest = node;
            }

            return !closest;

        });

        return closest;

    }

    /**
     *  dom.common(elements) -> Element|undefined
     *  dom.common(...elements) -> Element|undefined
     *  - elements (Array|NodeList|Element): Elements whose common ancestory
     *    should be found.
     *
     *  Gets the closest common ancestor to the given `elements`. This function
     *  has two signatures. Either the elements can be passed in as a single
     *  collection such as an `Array` or a `NodeList`:
     *
     *      dom.common(dom.byQueryAll('.one'));
     *
     *  Alternatively, individual elements can be passed as their own arguments.
     *  Any number of arguments can be passed.
     *
     *      dom.common(dom.byId('a'), dom.byId('b'), dom.byId('c'));
     *
     *  If the first argument is a collection, the others are ignored. In this
     *  example, only the common ancestors of elements with the class "one"
     *  would be found. No error would be thrown.
     *
     *      dom.common(dom.byQueryAll('.one'), dom.byQueryAll('.two'));
     *
     *  To better understand this function, consider the following markup.
     *
     *      <html>
     *      <body>
     *          <section>
     *              <div>
     *                  <p id="a">Text</p>
     *                  <p id="b" class="one">Text</p>
     *              </div>
     *              <ul>
     *                  <li id="c">Text</li>
     *                  <li class="one">Text</li>
     *              </ul>
     *          </section>
     *      </body>
     *      </html>
     *
     *  Given that markup, this function would have the following effects:
     *
     *      dom.common(dom.get('p'));
     *      // -> <div>
     *      dom.common(dom.get('.one'));
     *      // -> <section>
     *      dom.common(dom.byId('a'), dom.byId('b'));
     *      // -> <div>
     *
     *  If a common ancestor cannot be found, `undefined` is returned.
     *
     *      dom.common(dom.byId('a'), document.createElement('div'));
     *      // -> undefined
     *
     **/
    function common(...elements) {

        if (util.Array.isIterable(elements[0])) {
            elements = util.Array.from(elements[0]);
        }

        return util.Array.common(...util.Array.map(elements, dom.parents))[0];

    }

    /**
     *  dom.walkTheDom(element, handler[, context])
     *  - element (Element): Starting element.
     *  - handler (Function): Function to execute.
     *  - context (?): Optional context for the handler.
     *
     *  Goes through all child elements of the given `element` and passes them
     *  to `handler`.
     *
     *      <html>
     *      <body>
     *          <section>
     *              <div>
     *                  <p id="a">Text</p>
     *                  <p id="b" class="one">Text</p>
     *              </div>
     *          </section>
     *      </body>
     *      </html>
     *
     *  With the markup above, this function would have this effect:
     *
     *      dom.walkTheDom(dom.byQuery('section'), function (elem) {
     *          console.log(elem);
     *      });
     *      // logs: <section>
     *      // logs: <div>
     *      // logs: <p id="a">
     *      // logs: TextNode "Text"
     *      // logs: <p id="b">
     *      // logs: TextNode "Text"
     *
     **/
    function walkTheDom(element, handler, context) {

        handler.call(context, element);
        element = element.firstChild;

        while (element) {

            walkTheDom(element, handler, context);
            element = element.nextSibling;

        }

    }

    /**
     *  dom.children(element[, selector]) -> Array
     *  - element (Element): Element whose children should be returned.
     *  - selector (String): Optional CSS selector to filter the results.
     *
     *  Gets the immediate child elements of the given `element`.
     *
     *      <ul id="list">
     *          <li id="a" class="one"><span>Text</span></li>
     *          <li id="b">Text</li>
     *          <li id="c" class="one"><strong>Text</strong></li>
     *      </ul>
     *
     *  Given the markup above, this method would have the following effects:
     *
     *      dom.children(dom.byId('list'));
     *      // -> [<li id="a">, <li id="b">, <li id="c">]
     *      dom.children(dom.byId('list'), '.one');
     *      // -> [<li id="a">, <li id="c">]
     *      dom.children(dom.byId('list'), '.two');
     *      // -> []
     *
     **/
    function children(element, selector) {

        var children = util.Array.from(
            core.getClosestElement(element).childNodes
        );

        if (typeof selector === "string") {

            children = children.filter(function (child) {
                return core.is(child, selector);
            });

        }

        return children;

    }

    /**
     *  dom.find(element, selector) -> Array
     *  - element (Element): Starting element.
     *  - selector (String): CSS selector to find.
     *
     *  Finds all child elements that match the given `selector`. This is
     *  virtually identical to [[dom.get]] with two key differences:
     *
     *  - The order of arguments is different.
     *  - The `element` is automatically run through [[dom.getClosestElement]].
     *
     * 	If these differences are not essential, [[dom.get]] will be slightly
     * 	faster and probably should be used instead.
     **/
    function find(element, selector) {
        return dom.get(selector, core.getClosestElement(element));
    }

    util.Object.assign(dom, {
        children,
        closest,
        common,
        find,
        parent,
        parents,
        upTheDom,
        walkTheDom
    });

    return Object.freeze(dom);

});
