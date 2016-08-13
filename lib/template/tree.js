define([
    "lib/template/baseBranch",
    "lib/template/textBranch",
    "lib/template/ifBranch",
    "lib/template/eachBranch"
], function (
    makeBaseBranch,
    makeTextBranch,
    makeIfBranch,
    makeEachBranch
) {

    "use strict";

    return function () {

        var types = {
            each: makeEachBranch,
            text: makeTextBranch,
            "if": makeIfBranch,
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

                var newBranch;

                if (!types[type]) {
                    throw new ReferenceError("Unknown type " + type);
                }

                newBranch = types[type](content);
                newBranch.setParent(currentBranch);
                tree.addBranch(newBranch);
                tree.setCurrentBranch(newBranch);

            },

            closeBranch: function (type) {

                var branchType = currentBranch.type;

                if (branchType !== type) {

                    throw new SyntaxError(
                        "Expecting type " + branchType + " but got " + type
                    );

                }

                tree.setCurrentBranch(currentBranch.getParent());

            },

            addBranch: function (branch) {
                currentBranch.addBranch(branch);
            },

            render: function (data) {

                if (currentBranch.type !== "base") {

                    throw new SyntaxError(
                        "Unclosed " + currentBranch.type + " branch"
                    );

                }

                return currentBranch.render(data);

            }

        };

        return Object.freeze(tree);

    };

});
