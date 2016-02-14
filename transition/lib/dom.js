define(['./lib/util.js'], function (util) {

    'use strict';

        /**
         *  dom
         *
         *  Namespace for all DOM methods.
         **/
    var dom = {},

        // Private function to add properties to the dom namespace.
        addToDom = function (keys) {
            util.Object.assign(dom, keys);
        },

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
        is = function (element, selector) {
            return dom.get(selector).indexOf(element) > -1;
        },

        // Wrapping elements for HTML creation.
        strMap = {},
        dummy = document.createElement('div'),
        supports = {},

        dataMap = new util.WeakMap(),
        eventKey = util.String.uniqid('dom-events-');

    // Support taken from jQuery 1.11.3
    dummy.innerHTML = '  <link/><table></table><a href="/a">a</a><input type="checkbox"/>';

    // Make sure that link elements get serialized correctly by innerHTML.
    // This requires a wrapper element in IE.
    support.htmlSerialize = dummy.getElementsByTagName('link').length > 0;

    // Override is() if the browser supports Element.matches (or alias).
    [
        'matches',
        'webkitMatchesSelector',
        'mozMatchesSelector',
        'msMatchesSelector'
    ].every(function (method) {

        var ret = true;

        if (util.Function.isFunction(HTMLElement.prototype[method]) {

            is = function (element, selector) {
                return element[method](selector);
            };

            ret = false;

        }

        return ret;

    });

    // lookups

    [
        /**
         *  dom.byId(id) -> Element|null
         *  - id (String): ID of the element to find.
         *
         *  Gets an element by id. If the element cannot be found, `null` is
         *  returned.
         *
         *      <div id="elem">Div</div>
         *
         *      dom.byId('elem'); // -> <div id="elem">
         *      dom.byId('does-not-exist'); // -> null
         *
         **/
        /** related to: dom.byId
         *  dom.getById(id) -> Array
         *  - id (String): ID of the element to find.
         *
         *  Gets an element by ID. Unlike [[dom.byId]], an array is returned. If
         *  the element is found, the array will contain a single item (the
         *  element) but if the element is not found, an empty is array is
         *  returned.
         *
         *      <div id="elem">Div</div>
         *
         *      dom.getById('elem'); // -> [<div id="elem">]
         *      dom.getById('does-not-exist'); // -> []
         *
         **/
        ['byId', 'getElementById', false, false],

        /**
         *  dom.byTag(tagName[, context = document]) -> NodeList
         *  - tagName (String): Tag name for the elements to find.
         *  - context (Element): Optional context for the search.
         *
         *  Gets all elements by tag name. If the tag name is not recognised, an
         *  empty `NodeList` is returned.
         *
         *      <div id="elem">Div 1</div>
         *      <article id="node">
         *          <div id="tag">Div 2</div>
         *      </article>
         *
         *      dom.byTag('div');
         *      // -> NodeList[<div id="elem">, <div id="tag">]
         *      dom.byTag('does-not-exist');
         *      // -> NodeList[]
         *
         *  The search can be limited by providing and element as `context`.
         *  Again, if the tags are not found or recognised, an empty `NodeList`
         *  is returned. If the `context` is not recognised, `document` is
         *  assumed.
         *
         *      dom.byTag('div', dom.byId('node'));
         *      // -> NodeList[<div id="tag">]
         *      dom.byTag('div', dom.byId('does-not-exist'));
         *      // -> NodeList[<div id="elem">, <div id="tag">]
         *      dom.byTag('does-not-exist', dom.byId('node'));
         *      // -> NodeList[]
         *
         **/
        /** related to: dom.byTag
         *  dom.getByTag(tagName[, context = document]) -> Array
         *  - tagName (String): Tag name for the elements to find.
         *  - context (Element): Optional context for the search.
         *
         *  Gets elements by tag name. Unlike [[dom.byTag]], an `Array` is
         *  returned instead of a `NodeList`. Other than that, everything else
         *  is the same. See [[dom.byTag]] for full details.
         **/
        ['byTag', 'getElementsByTagName', true, true],

        /**
         *  dom.byClass(className[, context = document]) -> NodeList
         *  - className (String): Class of the elements to find.
         *  - context (Element): Optional context for the search.
         *
         *  Gets all elements by class name. If the tag name is not recognised,
         *  an empty `NodeList` is returned.
         *
         *      <div class="elem one">Div 1</div>
         *      <article id="node">
         *          <div class="elem two">Div 2</div>
         *      </article>
         *
         *      dom.byClass('elem');
         *      // -> NodeList[<div class="elem one">, <div class="elem two">]
         *      dom.byClass('does-not-exist');
         *      // -> NodeList[]
         *
         *  The search can be limited by providing and element as `context`.
         *  Again, if the tags are not found or recognised, an empty `NodeList`
         *  is returned. If the `context` is not recognised, `document` is
         *  assumed.
         *
         *      dom.byClass('elem', dom.byId('node'));
         *      // -> NodeList[<div class="elem two">]
         *      dom.byClass('elem', dom.byId('does-not-exist'));
         *      // -> NodeList[<div class="elem one">, <div class="elem two">]
         *      dom.byClass('does-not-exist', dom.byId('node'));
         *      // -> NodeList[]
         *
         **/
        /** related to: dom.byClass
         *  dom.getByClass(className[, context = document]) -> Array
         *  - className (String): Class of the elements to find.
         *  - context (Element): Optional context for the search.
         *
         *  Gets elements by class name. Unlike [[dom.byClass]], an `Array` is
         *  returned instead of a `NodeList`. Other than that, everything else
         *  is the same. See [[dom.byClass]] for full details.
         **/
        ['byClass', 'getElementsByClassName', true, true],

        /**
         *  dom.byName(name) -> NodeList
         *  - name (String): Name of the elements to find.
         *
         *  Finds elements by name.
         *
         *      <input type="radio" id="one" name="foo" value="1">
         *      <div id="elem">
         *          <input type="radio" id="two" name="foo" value="2">
         *      </div>
         *
         *      dom.byName('foo');
         *      // -> NodeList[<input id="one">, <input id="two">]
         *
         *  If the name cannot be found, an empty `NodeList` is returned.
         *
         *      dom.byName('does-not-exist');
         *      // -> NodeList[]
         *
         **/
        /** related to: dom.byName
         *  dom.getByName(name) -> Array
         *  - name (String): Name of the elements to find.
         *
         *  Identical to [[dom.byName]] except that an `Array` is returned
         *  instead of a `NodeList`. See [[dom.byName]] for full details.
         **/
        ['byName', 'getElementsByName', false, true],

        /**
         *  dom.byQuery(selector[, context = document]) -> Element|null
         *  - selector (String): CSS selector to identify the element.
         *  - context (Element): Optional context for the element.
         *
         *  Finds the first element that matches the given `selector`. If no
         *  match is found, `null` is returned. Consider the following HTML
         *  markup:
         *
         *      <div class="one" id="a">A</div>
         *      <div class="one two" id="b">B</div>
         *      <div class="two" id="c">
         *          <div class="three one" id="d">D</div>
         *          <div class="three" id="e">E</div>
         *      </div>
         *
         *  In that situation, this method will return these results.
         *
         *      dom.byQuery('.one'); // -> <div id="a">
         *      dom.byQuery('.four'); // -> null
         *      dom.byQuery('.one', dom.byId('c')); // -> <div id="d">
         *
         *  If `context` isn't recognised as an element, `document` is assumed.
         *
         *      dom.byQuery('.one', dom.byId('not-real')); // -> <div id="a">
         * 
         **/
        /** related to: dom.byQuery
         *  dom.getByQuery(selector[, context = document]) -> Array
         *  - selector (String): CSS selector to identify the element.
         *  - context (Element): Optional context for the element.
         *
         *  Identical to [[dom.byQuery]] except that it returns an array. If the
         *  selector isn't recognised, an empty array is returned.
         *
         *      <div class="one" id="a">A</div>
         *      <div class="one two" id="b">B</div>
         *      <div class="two" id="c">
         *          <div class="three one" id="d">D</div>
         *          <div class="three" id="e">E</div>
         *      </div>
         *
         *  With the markup above, this method will return these results.
         *
         *      dom.getByQuery('.one'); // -> [<div id="a">]
         *      dom.getByQuery('.four'); // -> []
         *      dom.getByQuery('.one', dom.byId('c')); // -> [<div id="d">]
         * 
         **/
        ['byQuery', 'querySelector', true, false],

        /**
         *  dom.byQueryAll(selector[, context = document]) -> NodeList
         *  - selector (String): CSS selector to identify the elements.
         *  - context (Element): Optional context for the search.
         *
         *  Finds all elements that match the given `selector`. Consider the
         *  following HTML markup:
         *
         *      <div class="one" id="a">A</div>
         *      <div class="one two" id="b">B</div>
         *      <div class="two" id="c">
         *          <div class="three one" id="d">D</div>
         *          <div class="three" id="e">E</div>
         *      </div>
         *
         *  In that situation, this method will return these results.
         *
         *      dom.byQueryAll('.one');
         *      // -> NodeList[<div id="a">, <div id="b">, <div id="d">]
         *      dom.byQueryAll('.four');
         *      // -> NodeList[]
         *      dom.byQueryAll('.one', dom.byId('c'));
         *      // -> NodeList[<div id="d">]
         *
         *  If the `context` isn't recognised as an element, `document` is
         *  assumed.
         *  
         *      dom.byQueryAll('.one', dom.byId('does-not-exist'));
         *      // -> NodeList[<div id="a">, <div id="b">, <div id="d">]
         * 
         **/
        /** related to: dom.byQueryAll, alias of: dom.get
         *  dom.byQueryAll(selector[, context = document]) -> NodeList
         *  - selector (String): CSS selector to identify the elements.
         *  - context (Element): Optional context for the search.
         *
         *  Identical to [[dom.byQueryAll]] except that an `Array` is returned
         *  instead of a `NodeList`. See [[dom.byQueryAll]] for full details.
         *
         *  Since this method is so widely used, it is aliased as [[dom.get]].
         **/
        ['byQueryAll', 'querySelectorAll', true, true]
    ].forEach(function (data) {

        var name     = data[0],
            native   = data[1],
            context  = data[2],
            iterable = data[3];

        dom[name] = context
            ? function (identifier, context) {

                var base = isElement(context)
                    ? context
                    : document;

                return base[native](identifier);

            }
            : function (identifier) {
                return document[native](identifier);
            };

        dom['get' + util.String.toUpperFirst(name)] = iterable
            ? function (identifier, context) {
                return util.Array.from(dom[name](identifier, context));
            }
            : function (identifier, context) {

                var result = dom[name](identifier, context);

                return result
                    ? [result]
                    : [];

            };

    });

    // Since it's very common, create a handy short-cut.
    dom.get = dom.getByQueryAll;


    // core / utilities

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

        return isNode(fragment) &&
                fragment.nodeType === Node.DOCUMENT_FRAGMENT_NODE;

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
     *      var div   = dom.byQuery('div'), // <div id="div">
     *          text  = div.firstChild,     // TextNode
     *          value = text.nodeValue;     // "Div element"
     *      dom.getClosestElement(div);   // -> <div id="div">
     *      dom.getClosestElement(text);  // -> <div id="div">
     *      dom.getClosestElement(value); // -> throws TypeError
     *
     **/
    function getClosestElement(element) {

        if (!isElement(closest) && isNode(closest)) {
            element = getClosestElement(element.parentNode);
        }

        if (!isElement(element)) {
            throw new TypeError('element is not an HTMLElement');
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

        var id = util.String.uniqid('dom-');

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

    // Add basic map knowledge.
    util.Object.assign(strMap, {
        '*': support.htmlSerialize
            ? [0, '']
            : [1, 'X<div></div>'],
        area:   [1, '<map></map>'],
        col:    [2, '<table><colgroup></colgroup><tbody></tbody></table>'],
        legend: [1, '<fieldset>'],
        option: [1, '<select multiple="multiple"></select>'],
        param:  [1, '<object></object>'],
        th:     [3, '<table><tbody><tr></tr></tbody></table>'],
        thead:  [1, '<table></table>'],
        tr:     [2, '<table><tbody></tbody></table>']
    });

    util.Object.each({
        option: ['optgroup'],
        th:     ['td'],
        thead:  ['tbody', 'tfoot', 'colgroup', 'caption']
    }, function (existing, clones) {

        clones.forEach(function (tag) {
            strMap[tag] = strMap[existing];
        });

    });


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

        var frag  = document.createDocumentFragment(),
            parts = String(string).match(/^\s*<(\w+)/),
            base  = document.createElement('div'),
            data  = [];

        if (parts && parts[1]) {
            data  = toHtmlData[parts[1]] || toHtmlData['*'];
        } else {
            throw new Error('dom.toHtml passed unrecognised HTML: ' + string);
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

    addToDom({

        /**
         *  dom.each(elements, method, ...args) -> Array
         *  - elements (Array|NodeList): Elements to work on.
         *  - method (String): Method to execute.
         *  - args (?): Arguments for the method.
         *
         *  Executes a [[dom]] method on all the elements in the `elements`
         *  collection. For example, to get all IDs of all elements with an `id`
         *  attribute, [[dom.identify]] can be used:
         *
         *      dom.each(dom.get('[id]'), 'identify');
         *      // -> ['one', 'two', ... ]
         *
         *  Additional arguments can be passed to the [[dom]] method. For
         *  example, this will set an attribute on all elements with an `id`
         *  attribute.
         *
         *      dom.each(dom.get('[id]'), 'setAttr', 'data-dom', true);
         *      // All elements with an id attribute now have the attribute
         *      // data-dom="true"
         *
         *  Any collection of elements will work, including an `Array` or a
         *  `NodeList`. An individual element will not work, but the original
         *  method may simply be called in those situations.
         **/
        each: util.Array.makeInvoker(dom),

        getClosestElement,
        generateId,
        identify,
        is,
        isElement,
        isFragment,
        isNode,
        toHtml

    });

    // traversals

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

        if (isElement(node) && handler.call(context, node) !== false) {
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

        element = getClosestElement(element);

        if (typeof selector !== 'string') {
            selector = '*';
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

        element = getClosestElement(element);

        if (typeof selector !== 'string') {
            selector = '*';
        }

        upTheDom(element, function (node) {

            if (node !== element && is(node, selector)) {
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

        upTheDom(getClosestElement(element), function (node) {

            if (is(node, selector)) {
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

        var children = util.Array.from(getClosestElement(element).childNodes);

        if (typeof selector === 'string') {

            children = children.filter(function (child) {
                return is(child, selector);
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
     **/
    function find(element, selector) {
        return dom.get(selector, getClosestElement(element));
    }

    addToDom({
        children,
        closest,
        common,
        find,
        parent,
        parents,
        upTheDom,
        walkTheDom
    });

    // attributes

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

        var attrs = getClosestElement(element).attributes,
            value = util.Array.pluck(attrs, 'name', 'value');

        if (typeof attr === 'string') {
            value = value[attr];
        }

        return value || '';

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

        var has   = [],
            isOne = typeof attr === 'string';

        element = getClosestElement(element);

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

        element = getClosestElement(element);

        if (typeof attr === 'string') {
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

        var isString = typeof attr === 'string',
            map      = isString
                ? {}
                : attr;

        if (isString) {
            map[attr] = value;
        }

        element = getClosestElement(element);

        util.Object.each(map, function (name, value) {
            element.setAttribute(name, value);
        });

    }

    addToDom({

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

    // manipulations
    
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
        insertBefore(element, reference.nextSibling);
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
        insertBefore(element, reference.firstChild);
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

        var node   = getClosestElement(element),
            parent = node.parentNode;

        if (parent) {
            parent.removeChild(node);
        }

    }

    addToDom({
        after,
        append,
        appendTo,
        before,
        prepend,
        prependTo,
        remove
    });


    // data

    // Private function.
    // Gets the object that keeps data for the given element.
    function getDataObject(element) {

        element = getClosestElement(element);

        if (!dataMap.has(element)) {
            dataMap.set(element, {});
        }

        return data.get(element);

    }

    /**
     *  dom.setData(element, key, value)
     *  - element (Element): Element whose data should be set.
     *  - key (String): Key for the data.
     *  - value (?): Value for the data.
     *
     *  Sets data for the element. This is private data as opposed to public
     *  data (created with the `data-*` attributes).
     *
     *      var div = document.createElement('div');
     *      dom.setData(div, 'test', 1);
     *      dom.getData(div, 'test'); // -> 1
     *
     *  The key can be any valid JavaScript string. There are no restrictions on
     *  allowed characters.
     **/
    function setData(element, key, value) {
        getDataObject(element)[key] = value;
    }

    /**
     *  dom.hasData(element, key) -> Boolean
     *  - element (Element): Element whose data should be checked.
     *  - key (String): Key for the data.
     *
     *  Checks to see if the given `element` has data associated with the given
     *  `key`, returning `true` if it does and `false` if it does not.
     *
     *      var div = document.createElement('div');
     *      dom.setData(div, 'exists', 1);
     *      dom.hasData(div, 'exists');         // -> true
     *      dom.hasData(div, 'does-not-exist'); // -> false
     * 
     **/
    function hasData(element, key) {
        return util.Object.owns(getDataObject(element), key);
    }

    /**
     *  dom.getData(element) -> Object
     *  dom.getData(element, key) -> ?
     *  - element (Element): Element whose data should be retrieved.
     *  - key (String): Optional string for the data.
     *
     *  Gets the data associated with the given `element`.
     *
     *      var div = document.createElement('div');
     *      dom.setData(div, 'exists', 1);
     *      dom.getData(div, 'exists'); // -> 1
     *
     *  If the data cannot be found, `undefined` is returned.
     *
     *      dom.getData(div, 'does-not-exist'); // -> undefined
     *
     *  The `key` is optional - if it is ommitted, a copy of all the data is
     *  returned:
     *
     *      dom.getData(div); // -> { exists: 1 }
     *
     *  Setting properties in this object is unlikely to affect data (although
     *  some change may occur). It is better to use this option for reference
     *  and manipulate the data by setting it with [[dom.setData]].
     **/
    function getData(element, key) {

        var data = getDataObject(element);

        return typeof key === 'string'
            ? data[key]
            : util.Object.clone(data);

    }

    /**
     *  dom.removeData(element, key)
     *  - element (Element): Element whose data should be removed.
     *  - key (String): Key for the data to remove.
     *
     *  Removes the data with the given `key` from the specified `element`.
     *
     *      var div = document.createElement('div');
     *      dom.setData(div, 'exists', 1);
     *      dom.getData(div, 'exists'); // -> 1
     *      dom.removeData(div, 'exists');
     *      dom.getData(div, 'exists'); // -> undefined
     *
     **/
    function removeData(element, key) {
        delete getDataObject(element)[key];
    }

    addToDom({
        getData,
        hasData,
        removeData,
        setData
    });



    // events

    function getEventData(element, event) {

        var data = getData(element, eventKey),
            events,
            newlyAdded = false;

        if (!data) {

            data = {};
            setData(element, eventKey, data);

        }

        events = data[event];

        if (!events) {

            events = [];
            data[event] = events;
            newlyAdded = true;
            setData(element, eventKey, data);

        }

        return {
            data:  events,
            isNew: newlyAdded
        };

    }

    function getEventHandlerIndex(events, handler) {

        var index = -1,
            i     = 0,
            il    = events.length;

        while (i < il) {

            if (events.orig === handler) {

                index = i;
                break;

            }

            i += 1;

        }

        return index;

    }


    function addEvent(element, event, handler, context) {

        var info = getEventData(element, event);

        if (info.isNew) {

            element.addEventListener(event, function (e) {

                events.forEach(function (info) {

                    if (typeof info.selector !== 'string') {
                        info.handler.call(info.context, event);
                    }

                });

            }, false);

        }

        if (getEventHandlerIndex(info.data, handler) < 0) {

            info.data.push({
                context,
                handler,
                orig: handler
            });

        }

    }

    function addDelegatedEvent(element, event, selector, handler, context) {
        throw new Error('addDelegatedEvent function not written');
    }

    function removeDelegatedEvent(element, event, selector, handler) {
        throw new Error('removeDelegatedEvent function not written');
    }

    function removeEvent(element, event, handler) {
        
        var info  = getEventData(element, event),
            index = getEventHandlerIndex(info.data, handler);

        if (index > -1) {
            info.data.splice(index, 1);
        }


    }

    function on(element, event, selector, handler, context) {

        if (typeof selector === 'string') {
            addDelegatedEvent(element, event, selector, handler, context);
        } else {
            addEvent(element, event, selector, handler);
        }

    }

    function off(element, event, selector, handler) {

        if (typeof selector === 'string') {
            removeDelegatedEvent(element, event, selector, handler);
        } else {
            removeEvent(element, event, selector);
        }

    }



    // classes

    // Private function.
    // Creates a DOMException-like error to be thrown.
    function domEx(type, message) {

        return {
            name:    type,
            code:    DOMException[type],
            message: message
        };

    }

    // Private function.
    // Validates a class name.
    function validateClassName(className) {

        if (className === '') {

            throw domEx(
                'SYNTAX_ERR',
                'An invalid or illegal string was specified'
            );

        }

        if (/\s/.test(className)) {

            throw domEx(
                'INVALID_CHARACTER_ERR',
                'String contains an invalid character'
            );

        }

        return className;

    }

    // Private function.
    // Gets classes from an element as an array.
    function getClasses(element) {
        return (element.className || '').split(/\s+/);
    }

    supports.classList = !!dummy.classList;
    supports.multiClassList = false;

    if (supports.classList) {

        dummy.classList.add('one', 'two');
        supports.multiClassList = dummy.classList.contains('two');
        dummy.classList.remove('one', 'two');

    }

    // Use classList if we can, fall back if we have to.
    if (supports.multiClassList) {

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

            var tag = getClosestElement(element),
                has = classes.map(function (className) {
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
            getClosestElement(element).classList.add(...classes);
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
            getClosestElement(element).classList.remove(...classes);
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

            element = getClosestElement(element);

            classes.forEach(function (className) {
                return element.classList.toggle(className);
            });

        };

    // Fallbacks. Same signature, same process. No need to re-comment.
    } else {

        dom.hasClass = function (element, ...classes) {

            var tag   = getClosestElement(element),
                names = getClasses(tag),
                has   = classes.map(function (className) {
                    return names.indexOf(validateClassName(className)) > -1;
                });

            return classes.length === 1
                ? has[0]
                : has;

        };

        dom.addClass = function (element, ...classes) {

            var tag   = getClosestElement(element),
                names = util.Array.unique(
                    getClasses(tag).concat(classes.map(validateClassName))
                );

            tag.className = names.join(' ');

        };

        dom.removeClass = function (element, ...classes) {

            var tag   = getClosestElement(element),
                names = util.Array.remove(
                    getClasses(tag),
                    ...classes.map(validateClassName)
                );

            tag.className = names.join(' ');

        };

        dom.toggleClass = function (element, ...classes) {

            var tag   = getClosestElement(element),
                names = getClasses(tag);

            classes.forEach(function (className) {

                var index = names.indexOf(validateClassName(className));

                if (index < 0) {
                    names.push(className);
                } else {
                    names.splice(index, 1);
                }

            });

            tag.className = names.join(' ');

        };

    }

    return dom;

});