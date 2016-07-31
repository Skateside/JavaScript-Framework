define([
    "lib/util",
    "lib/template/tree"
], function (
    util,
    makeTemplateTree
) {

    "use strict";

    function parseTemplate(string) {

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

    }

    function setup(tree) {

        tree.init();
        parseTemplate(string).forEach(function (part) {

            // TODO: Allow ${#...} to be escaped.
            // Perhaps: /(^|.|\r|\n)\$\{#(\w+)\s+([^\}]+)\}$/
            var match = part.match(/^\$\{#(\w+)\s+([^\}]+)\}$/);

            if (match) {

                if (match[1] === "end") {
                    tree.closeBranch(match[2]);
                } else {
                    tree.openBranch(match[1], match[0]);
                }

            } else {
                tree.addBranch(makeTextBranch(part));
            }

        });

    }

    setup();

    return function (string) {

        var tree = makeTree();
        var template = {
            render: tree.render
        };

        setup(tree);

        return Object.freeze(template);

    };

});
