define([
    "lib/template/baseBranch",
    "lib/template/levelBranch",
    "lib/template/textBranch",
    "lib/template/eachBranch"
], function (
    makeBaseBranch,
    makeLevelBranch,
    makeTextBranch,
    makeEachBranch
) {

    "use strict";

    return function () {

        var types = {
            base: makeBaseBranch,
            each: makeEachBranch,
            text: makeTextBranch
        };

        var currentBranch;

        var tree = {

            init: function () {
                tree.setCurrentBranch(makeLevelBranch());
            },

            setCurrentBranch: function (branch) {
                currentBranch = branch;
            },

            getCurrentBranch: function () {
                return currentBranch;
            },

            openBranch: function (type, content) {

                var current = tree.getCurrentBranch();
                var newBranch;

                if (!types[type]) {
                    throw new ReferenceError("Unknown type " + type);
                }

                newBranch = types[type](content);
                newBranch.setParent(current);
                tree.addBranch(newBranch);
                tree.setCurrentBranch(newBranch);

            },

            closeBranch: function (type) {

                var branch = tree.getCurrentBranch();
                var branchType = branch.type;

                // NOTE: is this useful or am I just doing it because I can?
                if (branchType !== type) {

                    throw new SyntaxError(
                        "Expecting type " + branchType + " but got " + type
                    );

                }

                tree.setCurrentBranch(branch.getParent());

            },

            addBranch: function (branch) {
                tree.getCurrentBranch().addBranch(branch);
            },

            render: function (data) {
                return tree.getCurrentBranch().render(data);
            }

        };

        return Object.freeze(tree);

    };

});
