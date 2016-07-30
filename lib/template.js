define([
    "lib/util",
    "lib/template/tree"
], function (
    util,
    makeTemplateTree
) {

    "use strict";

    /**
     *  class template < templateTree
     *
     *  Creates a re-usable template based on the `string` given to it when
     *  created.
     *
     *      var template = makeTemplate("hello ${thing}");
     *      template.render({thing: "world"});
     *      // -> "hello world"
     *      template.render({thing: "you"});
     *      // -> "hello you"
     *
     *  The `render` method (inherited from [[templateTree#render]]) is the only
     *  method that needs to be executed on a [[template]].
     **/
    return function (string) {

        var template = util.Object.assign({}, makeTemplateTree(), {

            /**
             *  template#parse(string) -> Array
             *  - string (String): Template string to parse.
             *
             *  Parses the string given to the constructor into an array of
             *  parts that each branch in [[templateTree]] will need.
             *
             *  This shouldn't be called directly. [[template#setup]] will be
             *  called when the constructor function is executed, that will call
             *  this method.
             **/
            parse: function (string) {

                var parts = [];
                var match;

                while (string.length) {

                    match = string.match(/\$\{#[^\}]+\}/);

                    if (match) {

                        parts.push(string.substr(0, match.index), match[0]);
                        string = string.substr(match.index + match[0].length);

                    } else {

                        parts.push(string);
                        string = "";

                    }

                }

                return parts;

            },

            /**
             *  template#setup()
             *
             *  Sets up the [[template]] ready to be used. Once this method has
             *  been executed (which happens automatically when a new template
             *  is created) then the branches have all been set and ready to be
             *  rendered. See [[templateTree#render]] for more information.
             **/
            setup: function () {

                template.init();
                template.parse(string).forEach(function (part) {

                    var match = part.match(/^\$\{#(\w+)\s+([^\}]+)\}$/);

                    if (match) {

                        if (match[1] === "end") {
                            template.closeBranch(match[2]);
                        } else {
                            template.openBranch(match[1], match[0]);
                        }

                    } else {
                        template.addBranch(makeTextBranch(part));
                    }

                });

            }

        });

        template.setup();

        return Object.freeze(template);

    };

});
