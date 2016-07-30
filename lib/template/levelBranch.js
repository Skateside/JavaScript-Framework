define([
    "lib/util",
    "lib/template/baseBranch"
], function (
    util,
    makeBaseBranch
) {

    "use strict";

    return function () {

        var parent;
        var level = util.Object.assign({}, makeBaseBranch(), {

            setParent: function (branch) {
                parent = branch;
            },

            getParent: function () {
                return parent;
            }

        });

        return Object.freeze(level);

    };

});
