Core.extend('dom', function (Core) {

    'use strict';

    var $a  = Core.get('array'),
        $o  = Core.get('object'),
        dom = {},

        // Helper function for extending the main object.
        extend = $o.extend.bind($o, dom),

        // Dummy element for testing DOM methods.
        dummy  = document.createElement('div'),

        // Store for events that need dispatching.
        eventStore = {},

        // Element that will fire events, wrapping event dispatching.
        eventElem = document.createElement('div'),

        // Objects for adding methods to the main object.
        select  = null,
        core    = null,
        classes = null,

        // A simple function to see if an element matches a CSS selector. It is
        // possibly replaced if the browser has a faster, native, version.
        matches = function (elem, selector) {
            return this.get(selector).indexOf(elem) > -1;
        },

        // WeakMap used for storing data on elements.
        dataMap = Core.get('WeakMap').weak();

    // Add the event listener that will exevure the stored event.
    eventElem.addEventListener('CoreFrameworkDispatch', function (e) {

        var event = eventStore[e.detail.type];

        event.handler.call(event.contact, event.event);

    }, false);

    // Dispatches a single event, wrapped in a "CoreFrameworkDispatch" event to
    // allow all events to execute even if one of them throws an Error.
    function dispatch(type, event, handler, context) {

        var custom = new CustomEvent('CoreFrameworkDispatch', {
            bubbles:    false,
            cancelable: false,
            detail:     {
                type: type
            }
        });

        eventStore[type] = {
            context: context,
            event:   event,
            handler: handler
        };

        eventElem.dispatchEvent(custom);

    }

    /**
     *  dom.Selecting
     *
     *  Selecting elements on the page works using the `by*` methods. Each of
     *  them take a string as the first argument and most accept a context
     *  element as the second argument ([[dom.byId]] and [[dom.byName]] do not).
     *
     *  The `by*` methods are:
     *
     *  - `[[dom.byId]](id)` - selects an element by ID.
     *  - `[[dom.byTag]](tag[, context = document])` - selects elements by tag
     *    name.
     *  - `[[dom.byName]](name)` - selects elements by name attribute.
     *  - `[[dom.byClass]](className[, context = document])` - selects elements
     *    by class name.
     *  - `[[dom.byQuery]](query[, context = document])` - selects an element by
     *    query selector.
     *  - `[[dom.byQueryAll]](query[, context = document])` - selects elements
     *    by query selector.
     *
     *  Each method has a corresponding `getBy*` method that works in exactly 
     *  the same way, except that the returned value is always an `Array`. The
     *  complete list of `getBy*` methods are:
     *
     *  - `[[dom.getById]](id)` - selects an element by ID.
     *  - `[[dom.getByTag]](tag[, context = document])` - selects elements by
     *    tag name.
     *  - `[[dom.getByName]](name)` - selects elements by name attribute.
     *  - `[[dom.getByClass]](className[, context = document])` - selects
     *    elements by class name.
     *  - `[[dom.getByQuery]](query[, context = document])` - selects an element
     *    by query selector.
     *  - `[[dom.getByQueryAll]](query[, context = document])` - selects
     *    elements by query selector.
     *
     *  Additionally, [[dom.getByQueryAll]] has the alias [[dom.get]] for
     *  simplicity and ease of typing.
     **/
    select = {

        /**
         *  dom.byId(id) -> Element|null
         *  - id (String): ID of the element to find.
         *
         *  Finds an element based on the `id` attribute. If the element cannot
         *  be found, null is returned.
         *
         *  Consider HTML code like this:
         *
         *      <div id="one">one</div>
         *
         *  In that situation, `dom.byId()` will return these values:
         *
         *      dom.byId('one'); // -> <div id="one">
         *      dom.byId('two'); // -> null
         *
         *  This method has a complimentary method called [[dom.getById()]] 
         *  which takes the same arguments but will always return an `Array`.
         *  If the element cannot be found, an empty `Array` is returned.
         *
         *      dom.getById('one'); // -> [<div id="one">]
         *      dom.getById('two'); // -> []
         *
         *  Be warned that element IDs are supposed to be unique. As such, this
         *  method will only find a single element which, depending on browser,
         *  will likely be the first with the given ID. Additionally, unlike
         *  other selector methods, this function cannot be passed a context. If
         *  a context is required, use [[dom.byQuery]] in one of these ways:
         *
         *      dom.byQuery('#one', context);
         *      dom.byQyery('[id="one"]', context);
         *
         *  This method is notably faster than any other selector method.
         **/
        byId: function (id) {
            return document.getElementById(id);
        },

        /**
         *  dom.byTag(tag[, context = document]) -> NodeList
         *  - tag (String): Tag name of the element to find.
         *  - context (Element): Context for the search.
         *
         *  Finds all elements by the given tag name. If the elements cannot be
         *  found, an empty `NodeList` is returned.
         *
         *  Consider HTML code like this:
         *
         *      <div id="one">one</div>
         *      <div id="two">two</div>
         *      <span id="three">
         *          <div id="four">four</div>
         *          <div id="five">five</div>
         *      </span>
         *
         *  In that situation, `dom.byTag()` will return these values:
         *
         *      dom.byTag('div');// -> NodeList[<div id="one">, <div id="two">,
         *                       //     <div id="four">, <div id="five">]
         *      dom.byTag('xx'); // -> []
         *      dom.byTag('div', dom.byId('three'));
         *      // -> NodeList[<div id="four">, <div id="five">]
         *
         *  Be aware that a `NodeList` is not an `Array`, although it possesses
         *  many similarities. The [[$a]] methods will work with a `NodeList`
         *  correctly but native `Array` methods do not exist. If a genuine
         *  `Array` is required, this method has a complimentary method called
         *  [[dom.getByTag()]] which takes the same arguments.
         * 
         *      dom.getByTag('div'); // -> Array[<div id="one">, <div id="two">,
         *                           //     <div id="four">, <div id="five">]
         *      dom.getByTag('xx'); // -> []
         *      dom.getByTag('div', dom.byId('three'));
         *      // -> Array[<div id="four">, <div id="five">]
         *      
         **/
        byTag: function (tag, context) {
            return (context || document).getElementsByTagName(tag);
        },

        /**
         *  dom.byName(name) -> NodeList
         *  - name (String): Name of the elements to find.
         *
         *  Finds all elements with the given `name` attribute. Consider HTML
         *  like this:
         *
         *      <input name="one" id="one1">
         *      <input name="one" id="one2">
         *      <input name="two" id="oneX">
         *      <input name="two" id="two">
         *      <input name="one" id="one3">
         *
         *  In that situation, this method will return these values:
         *
         *      dom.byName('one'); // -> NodeList[<input id="one1">,
         *                         // <input id="one2">, <input id="one3">]
         *      dom.byName('three');; // -> NodeList[]
         *
         *  As this method acts as a wrapper for the native
         *  `document.getElementsByName` function, it does not accept a context
         *  argument. If named elements within a certain context are required
         *  then use [[dom.byQueryAll]] like this:
         *
         *      dom.byQueryAll('[name="one"]', dom.byId('context'));
         *
         *  Be aware that a `NodeList` is not the same as an `Array`. The [[$a]]
         *  methods will work with a `NodeList` but native `Array` methods will
         *  not work. If a genuine `Array` is required, there is a complimentary
         *  method called [[dom.getByName]] which takes the same arguments.
         * 
         *      dom.getByName('one'); // -> Array[<input id="one1">,
         *                            // <input id="one2">, <input id="one3">]
         *      dom.getByName('three');; // -> Array[]
         * 
         **/
        byName: function (name) {
            return document.getElementsByName(name);
        },

        /**
         *  dom.byClass(className[, context = document]) -> NodeList
         *  - className (String): Class name to find.
         *  - context (Element): Context for the search.
         *
         *  Finds all elements with the given class name. Consider this HTML
         *  markup:
         *
         *      <div class="one" id="a">A</div>
         *      <div class="one two" id="b">B</div>
         *      <div class="two" id="c">
         *          <div class="three one" id="d">D</div>
         *          <div class="three" id="e">E</div>
         *      </div>
         *
         *  In that situation, this method will return the following results:
         *
         *      dom.byClass('one');
         *      // -> NodeList[<div id="a">, <div id="b">, <div id="d">]
         *      dom.byClass('four'); // -> NodeList[]
         *      dom.byClass('one', dom.byId('c')); // -> NodeList[<div id="d">]
         *
         *  Be aware that a `NodeList` is not the same as an `Array`. The [[$a]]
         *  methods will work with a `NodeList` but native `Array` methods will
         *  not work. If a genuine `Array` is required, there is a complimentary
         *  method called [[dom.getByClassName]] which takes the same arguments.
         *
         *      dom.getByClass('one');
         *      // -> Array[<div id="a">, <div id="b">, <div id="d">]
         *      dom.getByClass('four'); // -> Array[]
         *      dom.getByClass('one', dom.byId('c')); // -> Array[<div id="d">]
         * 
         **/
        byClass: function (className, context) {
            return (context || document).getElementsByClassName(className);
        },

        /**
         *  dom.byQuery(selector[, context = document]) -> Element|null
         *  - selector (String): CSS selector to identify the element.
         *  - context (Element): Context for the search.
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
         *  This method has a complimentary method called [[dom.getByQuery]]
         *  which takes the same arguments and returns an `Array`.
         *
         *      dom.getByQuery('.one'); // -> [<div id="a">]
         *      dom.getByQuery('.four'); // -> []
         *      dom.getByQuery('.one', dom.byId('c')); // -> [<div id="d">]
         *
         *  For selecting multiple elements by query selector, use
         *  [[dom.byQueryAll]].
         **/
        byQuery: function (selector, context) {
            return (context || document).querySelector(selector);
        },

        /**
         *  dom.byQueryAll(selector[, context = document]) -> NodeList
         *  - selector (String): CSS selector to identify the elements.
         *  - context (Element): Context for the search.
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
         *      dom.byQueryAll('.four'); // -> NodeList[]
         *      dom.byQueryAll('.one', dom.byId('c'));
         *      // -> NodeList[<div id="d">]
         *
         *  Be aware that a `NodeList` is not the same as an `Array`. The [[$a]]
         *  methods will work with a `NodeList` but the native `Array` methods
         *  will not work. If a genuine `Array` is needed, there is a
         *  complimentary method called [[dom.getByQueryAll]] that takes the
         *  same arguments.
         *
         *      dom.getByQueryAll('.one');
         *      // -> Array[<div id="a">, <div id="b">, <div id="d">]
         *      dom.getByQueryAll('.four'); // -> Array[]
         *      dom.getByQueryAll('.one', dom.byId('c'));
         *      // -> Array[<div id="d">]
         *
         *  As this is a very useful method, it has the alias [[dom.get]] which
         *  works in exactly the same way, but is easier to type.
         * 
         *      dom.get('.one');
         *      // -> Array[<div id="a">, <div id="b">, <div id="d">]
         *      dom.get('.four'); // -> Array[]
         *      dom.get('.one', dom.byId('c')); // -> Array[<div id="d">]
         * 
         **/
        byQueryAll: function (selector, context) {
            return (context || document).querySelectorAll(selector);
        }

    };

    /**
     *  dom.getById(id) -> Array
     *
     *  Returns the results of [[dom.byId]] as an `Array`.
     **/
    /**
     *  dom.getByTag(tag[, context = document]) -> Array
     *
     *  Returns the results of [[dom.byTag]] as an `Array`.
     **/
    /**
     *  dom.getByName(name) -> Array
     *
     *  Returns the results of [[dom.byName]] as an `Array`.
     **/
    /**
     *  dom.getByClass(className[, context = document]) -> Array
     *
     *  Returns the results of [[dom.byClass]] as an `Array`.
     **/
    /**
     *  dom.getByQuery(id[, context = document]) -> Array
     *
     *  Returns the results of [[dom.byQuery]] as an `Array`.
     **/
    /**
     *  dom.getByQueryAll(id[, context = document]) -> Array
     *
     *  Returns the results of [[dom.byQueryAll]] as an `Array`.
     **/
    $o.each(select, function (key, value) {

        select['get' + key[0].toUpperCase() + key.slice(1)] = function () {
            return $a.from(this[key].apply(this, arguments)).compact();
        };

    });

    /** alias of: dom.getByQueryAll
     *  dom.get(selector[, context = document]) -> Array
     **/
    select.get = select.getByQueryAll;

    // Add the select functionality to the dom variable.
    extend(select);

    // Add functionality to traverse up the DOM.
    extend({

        /**
         *  dom.ancestor(elem, condition[, context]) -> Element|null
         *  - elem (Element): Element from which to start.
         *  - condition (Function|String): Either a function to test the
         *    elements or a CSS selector to identify the ancestor.
         *  - context (Object): Context for the `condition` function.
         *
         *  Works up the DOM to find a matching element. The search always
         *  starts with the `elem` element.
         *
         *  For a better example, consider this markup:
         *
         *      <!DOCTYPE html>
         *      <html lang="en">
         *      <head>
         *          <meta charset="utf-8">
         *          <title>Test page</title>
         *      </head>
         *      <body>
         *          <div id="one">
         *              <div id="two">
         *                  <div id="three">
         *                      <p id="four">text</p>
         *                  </div>
         *              </div>
         *          </div>
         *      </body>
         *      </html>
         *
         *  In that situation, this method will yield the following results:
         *
         *      dom.ancestor(dom.byId('four'), 'div'); // -> <div id="three">
         *      dom.ancestor(dom.byId('four'), '[id]'); // -> <p id="four">
         *
         *  If no match is found, `null` is returned.
         *
         *      dom.ancestor(dom.byId('four'), 'span'); // -> null
         * 
         *  The function can also have a function passed as `condition`. The
         *  function will be passed each element as it works up the page.
         *  Returning `true` will stop the search and return the element.
         *
         *      dom.ancestor(dom.byId('four'), function (elem) {
         *          return elem === document.body.children[0];
         *      });
         *      // -> <div id="one">
         *
         *  For returning multiple ancestors, use [[dom.ancestors]].
         **/
        ancestor: function (elem, condition, context) {

            var parent = null,
                test   = condition,
                ctx    = context;

            if (typeof condition === 'string') {

                test = function (elem) {
                    return this.is(elem, condition);
                };
                ctx  = this;

            }

            while (elem && elem.parentNode) {

                if (test.call(ctx, elem)) {

                    parent = elem;
                    break;

                }

                elem = elem.parentNode;

            }

            return parent;

        },

        /**
         *  dom.ancestors(elem, condition[, context]) -> Array
         *  - elem (Element): Element from which to start.
         *  - condition (Function|String): Either a function to test the
         *    elements or a CSS selector to identify the ancestor.
         *  - context (Object): Context for the `condition` function.
         *
         *  Works up the DOM to find all matching elements. The search always
         *  starts with the `elem` element. Elements are returned in the order
         *  in which they are found - closest to the `elem` element first.
         *
         *  For a better example, consider this markup:
         *
         *      <!DOCTYPE html>
         *      <html lang="en">
         *      <head>
         *          <meta charset="utf-8">
         *          <title>Test page</title>
         *      </head>
         *      <body>
         *          <div id="one">
         *              <div id="two">
         *                  <div id="three">
         *                      <p id="four">text</p>
         *                  </div>
         *              </div>
         *          </div>
         *      </body>
         *      </html>
         *
         *  In that situation, this method will yield the following results:
         *
         *      dom.ancestor(dom.byId('four'), 'div');
         *      // -> [
         *      //      <div id="three">
         *      //      <div id="two">
         *      //      <div id="one">
         *      // ]
         *      dom.ancestor(dom.byId('four'), '[id]');
         *      // -> [
         *      //      <p id="four">
         *      //      <div id="three">
         *      //      <div id="two">
         *      //      <div id="one">
         *      // ]
         *
         *  If no match is found, an empty `Array` is returned.
         *
         *      dom.ancestor(dom.byId('four'), 'span'); // -> []
         * 
         *  The function can also have a function passed as `condition`. The
         *  function will be passed each element as it works up the page.
         *  Returning `true` will add the element to the returned results.
         *
         *      dom.ancestor(dom.byId('four'), function (elem) {
         *          return elem === document.body.children[0];
         *      });
         *      // -> [<div id="one">]
         *
         *  If only a single ancestor element is required, use [[dom.ancestor]].
         *  Although is will return the same as entry `0` from the returned
         *  results from this function, this function will continue searching up
         *  the DOM until it runs out of elements to check - on the other hand,
         *  [[dom.ancestor]] will stop when it finds the first match.
         **/
        ancestors: function (elem, condition, context) {

            var parents = [],
                parent  = this.ancestor(elem, condition, context);

            while (parent) {

                parents.push(parent);
                parent = this.ancestor(elem, condition, context);

            }

            return parents;

        }

    });

    // Check to see if the browser has a native matches function, use it if we
    // can.
    if (window.HTMLElement && HTMLElement.prototype) {

        $a.forEach([
                'matches',
                'webkitMatchesSelector',
                'mozMatchesSelector',
                'msMatchesSelector'
            ],
            function (method) {

                var ret = true;

                if (typeof HTMLElement.prototype[method] === 'function') {

                    matches = function (node, selector) {
                        return node[method](selector);
                    };

                    ret = false;

                }

                return ret;

            });

    }

    /**
     *  dom.Core
     **/
    core = {

        /**
         *  dom.matches(elem, selector) -> Boolean
         *  - elem (Element): Element to test.
         *  - selector (String): CSS selector that might match.
         *
         *  Checks to see if the given element matches the given CSS selector.
         *
         *  Assuming this element exists:
         *
         *      <div id="elem"></div>
         *
         *  ... and this variable exists (see [[dom.byId]]):
         *
         *      var elem = dom.byId('elem');
         *
         *  Then the function would return the following results:
         *
         *      dom.matches(elem, '#elem'); // -> true
         *      dom.matches(elem, 'div'); // -> true
         *      dom.matches(elem, '[id="elem"]'); // -> true
         *      dom.matches(elem, '.class'); // -> false
         *      dom.matches(elem, ':checked'); // -> false
         *      dom.matches(elem, '[disabled]'); // -> false
         * 
         **/
        matches: matches,

        /**
         *  dom.wrapMap -> Object
         *
         *  A look-up table used for [[dom.make]] to see if additional elements
         *  are required for creating the desired element. Each entry is an
         *  `Array` with 3 entries:
         *
         *  1. The number of additionally created elements.
         *  2. HTML string to add to the start of the request.
         *  3. HTML string to add to the end of the request.
         **/
        wrapMap: {
            option: [1, '<select multiple="multiple">', '</select>'],
            thead:  [1, '<table>', '</table>'],
            col:    [2, '<table><colgroup>', '</colgroup></table>'],
            tr:     [2, '<table><tbody>', '</tbody></table>'],
            td:     [3, '<table><tbody><tr>', '</tr></tbody></table>']
        },

        /**
         *  dom.make(str) -> Element
         *  - str (String): String of HTML to convert into elements.
         *
         *  Converts a string of HTML into HTML elements.
         *
         *      dom.make('<div id="one"><b>*</b><span>word</span></div>');
         *      // -> <div id="one"><b>*</b><span>word</span></div>
         * 
         **/
        make: function (str) {

            var match  = str.match(/<(\w+)/),
                depth  = 0,
                prefix = '',
                suffix = '',
                i      = 0,
                div    = document.createElement('div'),
                wrap   = null,
                html   = null;

            if (!match) {
                Core.fatal('dom.make() Unrecognised HTML string "' + str + '"');
            }

            wrap = this.wrapMap[match[1]];

            if (wrap) {

                depth  = wrap[0];
                prefix = wrap[1];
                suffix = wrap[2];

            }

            div.innerHTML = prefix + str + suffix;
            html = div.firstElementChild || div.children[0] || null;

            while (html && html.firstChild && i < depth) {

                html  = html.firstChild;
                i    += 1;

            }

            return html;

        }

    };

    core.wrapMap.optgroup = core.wrapMap.option;
    core.wrapMap.th       = core.wrapMap.td;

    ['tbody', 'tfoot', 'colgroup', 'caption'].forEach(function (nodeName) {
        core.wrapMap[nodeName] = core.wrapMap.thead;
    });

    // Add the core functionality to the main dom object.
    extend(core);

    /**
     *  dom.Classes
     *
     *  Manipulating classes on an element.
     *
     *  - [[dom.addClass]] to add classes.
     *  - [[dom.removeClass]] to remove classes.
     *  - [[dom.hasClass]] to check if the element has classes.
     *  - [[dom.toggleClass]] to toggle classes.
     * 
     **/
    classes = {

        /**
         *  dom.addClass(elem)
         *  - elem (Element): Element to which classes should be added.
         *
         *  Adds classes to a given element.
         *
         *  Assuming this element exists:
         * 
         *      <div class="one" id="elem"></div>
         *
         *  ... and this variable exists (see [[dom.byId]]):
         * 
         *      var elem = dom.byId('elem');
         *
         *  Then this method will have these effects:
         * 
         *      dom.addClass(elem, 'two');
         *      // <div class="one two" id="elem"></div>
         *      dom.addClass(elem, 'one');
         *      // <div class="one two" id="elem"></div>
         *
         *  The method can multiple classes
         * 
         *      dom.addClass(elem, 'two', 'three', 'four');
         *      // <div class="one two three four" id="elem"></div>
         *
         **/
        addClass: function (elem) {

            var prev = elem.className.split(/\s+/),
                next = $a.slice(arguments, 1);

            elem.className = $a.unique(prev.concat(next)).join(' ');

        },

        /**
         *  dom.hasClass(elem) -> Boolean
         *  - elem (Element): Element whose classes should be tested.
         *
         *  Checks to see if the element has all the classes passed.
         * 
         *  Assuming this element exists:
         * 
         *      <div class="one two" id="elem"></div>
         *
         *  ... and this variable exists (see [[dom.byId]]):
         * 
         *      var elem = dom.byId('elem');
         *
         *  Then this method will have these effects:
         *
         *      dom.hasClass(elem, 'one'); // -> true
         *      dom.hasClass(elem, 'two'); // -> true
         *      dom.hasClass(elem, 'one', 'two'); // -> true
         *      dom.hasClass(elem, 'three'); // -> false
         *      dom.hasClass(elem, 'one', 'three'); // -> false
         * 
         **/
        hasClass: function (elem) {

            var classes = elem.className.split(/\s+/);

            return $a.every($a.slice(arguments, 1), function (className) {
                return classes.indexOf(className) > -1;
            });

        },

        /**
         *  dom.removeClass(elem)
         *  - elem (Element): Element whose classes should be removed.
         *
         *  Removes classes from an element.
         * 
         *  Assuming this element exists:
         * 
         *      <div class="one two three four" id="elem"></div>
         *
         *  ... and this variable exists (see [[dom.byId]]):
         * 
         *      var elem = dom.byId('elem');
         *
         *  Then this method will have these effects:
         *
         *      dom.removeClass(elem, 'two');
         *      // <div class="one three four" id="elem"></div>
         *      dom.removeClass(elem, 'one', 'four');
         *      // <div class="three" id="elem"></div>
         *      dom.removeClass(elem, 'five');
         *      // <div class="three" id="elem"></div>
         * 
         **/
        removeClass: function (elem) {

            var classes = elem.className.split(/\s+/),
                args    = $a.slice(arguments, 1);

            elem.className = classes.filter(function (className) {
                return args.indexOf(className) < 0;
            }).join(' ');

        },

        /**
         *  dom.toggleClass(elem)
         *  - elem (Element): Element who should have its classes toggled.
         *
         *  Toggles classes on a given element.
         * 
         *  Assuming this element exists:
         * 
         *      <div class="one two three four" id="elem"></div>
         *
         *  ... and this variable exists (see [[dom.byId]]):
         * 
         *      var elem = dom.byId('elem');
         *
         *  Then this method will have these effects:
         *
         *      dom.toggleClass(elem, 'one');
         *      // <div class="two three four" id="elem"></div>
         *      dom.toggleClass(elem, 'two', 'three');
         *      // <div class="four" id="elem"></div>
         *      dom.toggleClass(elem, 'four', 'five');
         *      // <div class="five" id="elem"></div>
         * 
         **/
        toggleClass: function (elem) {

            var classes = elem.className.split(/\s+/),
                args    = $a.slice(arguments, 1);

            $a.slice(arguments, 1).forEach(function (className) {

                var index = classes.indexOf(className);

                if (index < 0) {
                    classes.push(className);
                } else {
                    classes.splice(index, 1);
                }

            });

            elem.className = classes.join(' ');

        }

    };

    extend(classes);

    /**
     *  dom.Manipulation
     **/
    extend({

        /**
         *  dom.attrMap -> Object
         *
         *  A simple map of expected arguments to [[dom.create]] against the
         *  required attributes for the DOM API.
         **/
        attrMap: {
            'class': 'className',
            'for':   'htmlFor'
        },

        /**
         *  dom.attrHook
         *
         *  Sometimes the attributes need specific functionality instead of
         *  simply setting an attribute to given value. For these situations,
         *  the `attrHook`s add this functionality.
         **/
        attrHook: {

            /**
             *  dom.attrHook.text(elem, value)
             *  - elem (Element): Element whose text should be set.
             *  - text (String): Text to add to the element.
             *
             *  Sets the text content of an element.
             **/
            text: function (elem, value) {
                elem.appendChild(document.createTextNode(value));
            }

        },

        /**
         *  dom.nameHook
         *
         *  Certain elements require more work than a simple
         *  `document.createElement` map. For these situations, a `nameHook` is
         *  used.
         **/
        nameHook: {

            /**
             *  dom.nameHook.frag() -> DocumentFragment
             *
             *  Creates a document fragment.
             **/
            frag: function () {
                return document.createDocumentFragment();
            },

            /**
             *  dom.nameHook.comment(attr) -> Element
             *  - attr (Object): Attributes for the created element.
             *
             *  Creates an HTML comment. The `text` property of the `attr`
             *  object is used as the comment contents before being `delete`d.
             **/
            comment: function (attr) {

                var text = attr.text;

                delete attr.text;

                return document.createComment(text);

            }

        },

        /**
         *  dom.create(nodeName, attrs) -> Element
         *  - nodeName (String): Name of the node to create.
         *  - attrs (Object): Attributes for the element.
         *
         *  A simple function for creating elements.
         *
         *      dom.create('div'); // -> <div></div>
         *
         *  Attributes for the new element can be passed as the second argument.
         *
         *      dom.create('div', {
         *          id: 'test',
         *          'data-test': true
         *      });
         *      // -> <div id="test" data-test="true"></div>
         *
         *  If the `nodeName` exists in the [[dom.nameHook]] object, that
         *  function will be called and the `attrs` argument will be passed.
         *  This can be used to create slightly different elements. For example,
         *  here is the [[dom.nameHook.comment]] in use
         *
         *      dom.create('comment', {
         *          text: 'testing comments'
         *      });
         *      // -> <!--testing comments-->
         *
         *  As the `attrs` object is passed to the [[dom.nameHook]] elements, it
         *  may be manipulated by them. After those functions have run,
         *  remaining properties in the `attrs` object will be converted using
         *  the [[dom.attrMap]] object and if the result exists in the
         *  [[dom.attrHook]] object, the created element and the value in the
         *  `attrs` property will be passed to the hook. For example, here is
         *  the [[dom.attrHook.text]] hook being used:
         *
         *      dom.create('p', {
         *          text: 'testing text'
         *      });
         *      // -> <p>testing text</p>
         * 
         **/
        create: function (nodeName, attrs) {

            var elem = this.nameHook[nodeName] ?
                    this.nameHook[nodeName](attrs) :
                    document.createElement(nodeName);

            if (attrs && !$o.isEmpty(attrs)) {

                $o.each(attrs, function (value, attrName) {

                    var attr = this.attrMap[attrName] || attrName;

                    if (this.attrHook[attr]) {
                        this.attrHook[attr](elem, value);
                    } else {
                        elem[attr] = value;
                    }

                }, this);

            }

            return elem;

        },

        /**
         *  dom.createFragment() -> DocumentFragment
         *
         *  Helper function for creating document fragments. See also
         *  [[dom.create]].
         **/
        createFragment: function () {
            return this.create('frag');
        },

        /**
         *  dom.createComment(comment) -> Element
         *  - comment (String): Contents for the comment.
         *
         *  Helper function for creating HTML comments. See also [[dom.create]].
         **/
        createComment: function (comment) {
            return this.create('comment', {text: comment});
        },

        /**
         *  dom.remove(elem)
         *  - elem (Element): Element to remove from the DOM.
         *
         *  Removes an element from the dom.
         *
         *  Assuming this HTML exists:
         *
         *      <div id="one">
         *          <div id="two"></div>
         *          <div id="three"></div>
         *      </div>
         *
         *  ... and this variable exists (see also [[dom.byId]]):
         * 
         *     var elem = dom.byId('two');
         *
         *  ... then this function may be called like this:
         *
         *      dom.remove(elem);
         *
         *  ... altering the original markup to look like this:
         *
         *      <div id="one">
         *          <div id="three"></div>
         *      </div>
         *
         *  If the element cannot be found, or it has not been added to the DOM,
         *  no action is taken:
         *
         *      dom.remove(elem);
         *      // Does nothing because <div id="two"></div> has already been
         *      // removed.
         *      
         *      dom.remove(dom.byId('does-not-exist'));
         *      // Does nothing because there is no element with the id
         *      // "does-not-exist".
         * 
         **/
        remove: function (elem) {

            var parent = elem && elem.parentNode;

            if (parent) {
                parent.removeChild(elem);
            }

        },

        /**
         *  dom.append(newNode, refNode)
         *  - newNode (Element): New Element to be appended.
         *  - refNode (Element): Reference Element to which `newNode` should be
         *   appended.
         *
         *  Appends a new element to an existing one.
         *
         *  Assuming this markup exists:
         *
         *      <div id="one">
         *          <div id="two"></div>
         *      </div>
         *
         *  ... and these variables exist (see also [[dom.byId]] and
         *  [[dom.create]]):
         *
         *      var elem = dom.byId('one'),
         *          div  = dom.create('div', {id: 'three'});
         *
         *  ... then calling this method like this:
         *
         *      dom.append(div, elem);
         *
         *  ... will create this markup:
         *
         *      <div id="one">
         *          <div id="two"></div>
         *          <div id="three"></div>
         *      </div>
         *
         *  **Be warned** that the order of arguments is important. Attempting
         *  to append existing DOM nodes to a newly created one will work, but
         *  may product unexpected results. Had the call to this method looked
         *  like this:
         *
         *      dom.append(elem, div);
         *
         *  ... then the `<div id="one">` would have been added to the new
         *  `<div id="three">`. It would have looked like this:
         * 
         *      <div id="three">
         *          <div id="one">
         *              <div id="two"></div>
         *          </div>
         *      </div>
         *
         *  ... but it would not be added to the page's DOM. The order of
         *  arguments for this method has been chosen because it is the same as
         *  the native `Node.prototype.insertBefore` method.
         *
         *  To add an element to the beginning of an element, use
         *  [[dom.prepend]].
         **/
        append: function (newNode, refNode) {
            refNode.appendChild(newNod);
        },

        /**
         *  dom.prepend(newNode, refNode)
         *  - newNode (Element): Element to prepend.
         *  - refNode (Element): Element to be prepended.
         *
         *  Prepends a new element to a reference element.
         *
         *  Assuming this markup exists:
         *
         *      <div id="one">
         *          <div id="two"></div>
         *      </div>
         *
         *  ... and these variables exist (see also [[dom.byId]] and
         *  [[dom.create]]):
         *
         *      var elem = dom.byId('one'),
         *          div  = dom.create('div', {id: 'three'});
         *
         *  ... then calling this method like this:
         *
         *      dom.prepend(div, elem);
         *
         *  ... will create this markup:
         *
         *      <div id="one">
         *          <div id="three"></div>
         *          <div id="two"></div>
         *      </div>
         *
         *  **Be warned** that the order of arguments is important. Attempting
         *  to prepend existing DOM nodes to a newly created one will work, but
         *  may product unexpected results. Had the call to this method looked
         *  like this:
         *
         *      dom.prepend(elem, div);
         *
         *  ... then the `<div id="one">` would have been added to the new
         *  `<div id="three">`. It would have looked like this:
         * 
         *      <div id="three">
         *          <div id="one">
         *              <div id="two"></div>
         *          </div>
         *      </div>
         *
         *  ... but it would not be added to the page's DOM. The order of
         *  arguments for this method has been chosen because it is the same as
         *  the native `Node.prototype.insertBefore` method.
         *
         *  To add an element to the end of an element, use [[dom.append]].
         **/
        prepend: function (newNode, refNode) {
            refNode.insertBefore(newNode, refNode.firstChild);
        },

        /**
         *  dom.insertBefore(newNode, refNode)
         *  - newNode (Element): Element to be inserted.
         *  - refNode (Element): Element before which the new element should be
         *    inserted.
         *
         *  Inserts a new element before an existing one.
         * 
         *  Assuming this markup exists:
         *
         *      <div id="one">
         *          <div id="two"></div>
         *      </div>
         *
         *  ... and these variables exist (see also [[dom.byId]] and
         *  [[dom.create]]):
         *
         *      var elem = dom.byId('one'),
         *          div  = dom.create('div', {id: 'three'});
         *
         *  ... then calling this method like this:
         *
         *      dom.insertBefore(div, elem);
         *
         *  ... will create this markup:
         *
         *      <div id="three"></div>
         *      <div id="one">
         *          <div id="two"></div>
         *      </div>
         *
         *  **Be warned** that the order of arguments is important. Attempting
         *  to insert existing DOM nodes to a newly created one can fail. The
         *  order of arguments for this method has been chosen because it is the
         *  same as the native `Node.prototype.insertBefore` method.
         *
         *  To add a new element after an existing one, use [[dom.insertAfter]].
         **/
        insertBefore: function (newNode, refNode) {
            refNode.parentNode.insertBefore(newNode, refNode);
        },

        /**
         *  dom.insertAfter(newNode, refNode)
         *  - newNode (Element): Element to be inserted.
         *  - refNode (Element): Element after which the new element should be
         *    inserted.
         *
         *  Inserts a new element after an existing one.
         * 
         *  Assuming this markup exists:
         *
         *      <div id="one">
         *          <div id="two"></div>
         *      </div>
         *
         *  ... and these variables exist (see also [[dom.byId]] and
         *  [[dom.create]]):
         *
         *      var elem = dom.byId('one'),
         *          div  = dom.create('div', {id: 'three'});
         *
         *  ... then calling this method like this:
         *
         *      dom.insertBefore(div, elem);
         *
         *  ... will create this markup:
         *
         *      <div id="one">
         *          <div id="two"></div>
         *      </div>
         *      <div id="three"></div>
         *
         *  **Be warned** that the order of arguments is important. Attempting
         *  to insert existing DOM nodes to a newly created one can fail. The
         *  order of arguments for this method has been chosen because it is the
         *  same as the native `Node.prototype.insertBefore` method.
         *
         *  To add a new element after an existing one, use
         *  [[dom.insertBefore]].
         **/
        insertAfter: function (newNode, refNode) {
            refNode.parentNode.insertBefore(newNode, refNode.nextSibling);
        },

        /**
         *  dom.setText(elem, text)
         *  - elem (Element): Element whose text should be set.
         *  - text (String): Text to set.
         *
         *  Sets the text of the given element.
         *
         *  Assuming this element exists:
         *
         *      <div id="one"></div>
         *
         *  ... and that this variable exists (see also [[dom.byId]]):
         *
         *      var elem = dom.byId('one');
         *
         *  ... then this call:
         *
         *      dom.setText(elem, 'text');
         *
         *  ... will change the markup to this:
         *
         *      <div id="one">text</div>
         *
         **/
        setText: function (elem, text) {
            elem.textContent = text;
        },

        /**
         *  dom.getText(elem) -> String
         *  - elem (Element): Element whose text should be returned.
         *
         *  Gets he text of an element.
         *
         *  Assuming this markup:
         *
         *      <div id="one">text</div>
         *      <div id="two"></div>
         *
         *  ... then this method will have the following effect (see also
         *  [[dom.byId]]):
         *
         *      dom.getText(dom.byId('one')); // -> "text"
         *      dom.getText(dom.byId('two')); // -> ""
         * 
         **/
        getText: function (elem) {
            return String(elem.textContent).trim();
        },

        /**
         *  dom.empty(elem)
         *  - elem (Element): Element to empty.
         *
         *  Empties an element.
         *
         *  Assuming this markup:
         *
         *      <div id="one">
         *          <div id="two">
         *              <div id="three"></div>
         *          </div>
         *          <div id="four"></div>
         *      </div>
         *
         *  ... then calling this function like this (see also [[dom.byId]]):
         *
         *      dom.empty(dom.byId('one'));
         *
         *  ... will change the original markup to this:
         *
         *      <div id="one"></div>
         * 
         **/
        empty: function (elem) {
            elem.innerHTML = '';
        },
        
        /**
         *  dom.setAttr(elem, attr, value)
         *  - elem (Element): Element whose attribute should be set.
         *  - attr (String|Object): Name of the attribute to set or all
         *    attributes to set.
         *  - value (String): Value of the element.
         *
         *  Sets the attribute of an element.
         *
         *      // Assuming this markup: <div id="one"></div>
         *      dom.setAttr(dom.byId('one'), 'data-test', 'true');
         *      // Markup becomes: <div id="one" data-test="true"></div>
         *
         *  If the `attr` argument is an `Object`, it is used as a series of
         *  key/value pairs for all attributes:
         * 
         *      // Assuming this markup: <div id="one"></div>
         *      dom.setAttr(dom.byId('one'), {'data-test': 'true'});
         *      // Markup becomes: <div id="one" data-test="true"></div>
         * 
         **/
        setAttr: function (elem, attr, value) {

            if (typeof attr === 'string') {
                node.setAttribute(attr, value);
            } else {

                $o.each(attr, function (a, value) {
                    this.setAttr(elem, a, value);
                }, this);

            }

        },

        /**
         *  dom.getAttr(elem[, attr]) -> String|Object
         *  - elem (Element): Element whose attribute should be returned.
         *  - attr (String): Attribute to return.
         * 
         *  Gets the attribute from an element.
         *
         *  Assuming this markup:
         *
         *      <div id="one"></div>
         *
         *  Then this method will have the following effects:
         *
         *      var one = dom.byId('one');
         *      dom.getAttr(one, 'id'); // -> "one"
         *      dom.getAttr(one, 'does-not-exist'); // -> ""
         *
         *  If the `attr` argument is ommitted, this function will return an
         *  `Object` of all attributes the element has.
         *
         *      dom.getAttr(one); // -> {id: "one"}
         * 
         **/
        getAttr: function (elem, attr) {

            var gotten = '';

            if (typeof attr === 'string') {
                gotten = elem.getAttribute(attr) || '';
            } else {
                gotten = $a.pluck(elem.attributes, 'name', 'value');
            }

            return gotten;
        },

        /**
         *  dom.hasAttr(elem, attr) -> Boolean
         *  - elem (Element): Element whose attributes should be tested.
         *  - attr (String): Attribute to check.
         *
         *  Checks to see if the given element has the requested attribute.
         * 
         *  Assuming this markup:
         *
         *      <div id="one"></div>
         *
         *  Then this method will have the following effects:
         *
         *      var one = dom.byId('one');
         *      dom.hasAttr(one, 'id'); // -> true
         *      dom.hasAttr(one, 'does-not-exist'); // -> false
         * 
         **/
        hasAttr: function (elem, attr) {
            return elem.hasAttribute(attr);
        },

        /**
         *  dom.removeAttr(elem[, attr])
         *  - elem (Element): Element whose attribute should be removed.
         *  - attr (String): Attribute to remove.
         *
         *  Removes an attribute from an element.
         * 
         *  Assuming this markup:
         *
         *      <div id="one"></div>
         *
         *  Then this method will have the following effects:
         *
         *      var one = dom.byId('one');
         *      dom.removeAttr(one, 'id'); // <div></div>
         *      dom.removeAttr(one, 'does-not-exist'); // <div></div>
         *
         *  If the `attr` argument is ommitted, all attributes are removed from
         *  the element
         **/
        removeAttr: function (elem, attr) {

            if (typeof attr === 'string') {
                elem.removeAttribute(attr);
            } else {

                $o.each(this.getAttr(elem), function (attr, value) {
                    this.removeAttr(elem, attr, value);
                }, this);

            }
            
        }

    });

    /**
     *  dom.Data
     *
     *  Creates data for the given element. The data is internal and should not
     *  appear on the DOM node itself (this is done by using a `WeakMap` - the
     *  fallback adds a property to the DOM node so properties may become
     *  visible).
     *
     *  Data is created using [[dom.setData]], accessed using [[dom.getData]]
     *  and removed using [[dom.removeData]]. It can be checked to see if it has
     *  been assigned by using [[dom.hasData]].
     **/
    extend({

        // Gets the data object for the given element. If an object does not
        // exist, it is created before being returned.
        _getData: function (elem) {

            var data = null;

            if (dataMap.has(elem)) {
                data = dataMap.get(elem);
            } else {

                data = {};
                dataMap.set(elem, data);

            }

            return data;

        },

        /**
         *  dom.setData(elem, key, value)
         *  - elem (Element): Element that should gain data.
         *  - key (String): Key for the data.
         *  - value (*): Value for the data.
         *
         *  Sets data for an element.
         *
         *      <div id="div"></div>
         *
         *      var div = dom.byId('div');
         *      dom.setData(div, 'foo', 12345);
         *      dom.hasData(div, 'foo'); // -> true
         *      dom.getData(div, 'foo'); // -> 12345
         *
         **/
        setData: function (elem, key, value) {

            var data = this._getData(elem);

            data[key] = value;
            dataMap.set(elem, data);

        },

        /**
         *  dom.getData(elem, key) -> *
         *  - elem (Element): Element whose data should be accessed.
         *  - key (String): Key for the data.
         *
         *  Accesses data from an element.
         *
         *      <div id="div"></div>
         *
         *      var div = dom.byId('div');
         *      dom.setData(div, 'foo', 12345);
         *      dom.getData(div, 'foo'); // -> 12345
         *
         **/
        getData: function (elem, key) {
            return data = this._getData(elem)[key];
        },

        /**
         *  dom.hasData(elem, key) -> Boolean
         *  - elem (Element): Element whose data should be checked.
         *  - key (String): Key for the data.
         *
         *  Checks to see if the given `key` is associated with any data.
         *
         *      <div id="div"></div>
         *
         *      var div = dom.byId('div');
         *      dom.setData(div, 'foo', 12345);
         *      dom.hasData(div, 'foo'); // -> true
         *      dom.hasData(div, 'bar'); // -> false
         *
         **/
        hasData: function (elem, key) {

            var hasOwn = Object.prototype.hasOwnProperty;

            return dataMap.has(elem) &&
                    hasOwn.call(this._getData(elem), key);

        },

        /**
         *  dom.removeData(elem, key)
         *  - elem (Element): Element whose data should be removed.
         *  - key (String): Key for the data to be removed.
         *
         *  Removes data from the given element.
         *
         *      <div id="div"></div>
         *
         *      var div = dom.byId('div');
         *      dom.setData(div, 'foo', 12345);
         *      dom.hasData(div, 'foo'); // -> true
         *      dom.removeData(div, 'foo');
         *      dom.hasData(div, 'foo'); // -> false
         *
         **/
        removeData: function (elem, key) {

            var data = this._getData(elem);

            delete data[key];
            dataMap.set(elem, data);

        }

    });

    extend({

        on: function (elem, type, handler, context) {

            var that   = this,
                events = that.getData(elem, '_events'),
                exists = $a.isArray(events[type]),
                list   = events[type] || [];

            list.push({
                orig: handler,
                context: context || elem,
                handler: handler // delegated version
            });

            events[type] = list;
            that.setData(elem, '_events', events);

            if (!exists) {

                event.addEventListener(type, function (e) {

                    var events = that.getData(elem, '_events')[type] || [],
                        i      = 0,
                        il     = events.length,
                        event  = null;

                    while (i < il) {

                        event = events[i];
                        i += 1;
                        dispatch(type, e, event.handler, event.context);

                    }

                    delete eventStore[type];

                }, false); 

            }

        },

        off: function (elem, type, handler) {

            var data   = this.getData(elem, '_events'),
                events = data[type] || [],
                i      = 0,
                il     = events.length;

            while (i < il) {

                if (events[i].orig === handler) {
                    delete events[i];
                }

                i += 1;

            }

            data[type] = $a.compact(events);
            this.setData(elem, '_events', events);

        },

        one: function (elem, type, handler, context) {

            var that = this,
                func = function (e) {

                    handler.call(this, e);
                    that.off(elem, type, func);

                };

            that.on(elem, type, func, handler);

        },

        fire: function (elem, type, data) {

            var info   = data ? {detail: data} : undefined,
                custom = new CustomEvent(type, info);

            elem.dispatchEvent(custom);

        }

    });

});
