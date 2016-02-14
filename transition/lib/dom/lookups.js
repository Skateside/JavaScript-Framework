define([
    "./lib/util"
    "./lib/dom/core"
], function (
    util,
    core
) {

    "use strict";

    var dom = {};

    var settings = [
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
    ];

    settings.forEach(function (setting) {

        var name = setting[0];
        var native = setting[1];
        var context = setting[2];
        var iterable = setting[3];

        dom[name] = context
            ? function (identifier, context) {

                var base = core.isElement(context)
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

    // util.Object.assign(dom, {
    // });

    return Object.freeze(dom);

});
