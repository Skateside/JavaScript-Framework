define([
    "lib/util",
    "lib/template/tree"
], function (
    util,
    makeTemplateTree
) {

    "use strict";

    /*function parseTemplate(string) {

        var parts = [];
        var match;

        while (string.length) {

            match = string.match(/(\\)?\$\{#[^\}]+\}/);

            if (match) {

                parts.push(string.substr(0, match.index), match[0]);
                string = string.substr(match.index + match[0].length);

            } else {

                parts.push(string);
                string = "";

            }

        }

        return parts;

    }*/

    //const REPLACE_BRANCH = /(\\)?\$\{#[^\}]+\}/;
    const REPLACE_BRANCH = /(^|.|\r|\n)\$\{#[^\}]+\}/;
    const PROCESS_BRANCH = /(^|.|\r|\n)\$\{#(\w+)\s+([^\}]+)\}$/;

    function setup(tree) {

        tree.init();
        //parseTemplate(string).forEach(function (part) {
        util.String.tokenise(string, REPLACE_BRANCH).forEach(function (part) {

            var match = part.match(PROCESS_BRANCH);

            if (match && match[1] !== "\\") {

                if (match[2] === "end") {
                    tree.closeBranch(match[3]);
                } else {
                    tree.openBranch(match[2], match[0]);
                }

            } else {
                tree.addBranch(makeTextBranch(part));
            }

        });

    }

    return function (string) {

        var tree = makeTree();
        var template = {
            render: tree.render
        };

        setup(tree);

        return Object.freeze(template);

    };

});
