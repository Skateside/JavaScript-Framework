define([
    "lib/util"
], function (
    util
) {

    "use strict";

    return function () {

        var parent;
        var base = {

            type: "base",
            branches: [],

            setParent: function (branch) {
                parent = branch;
            },

            getParent: function () {
                return parent;
            },

            addBranch: function (branch) {
                base.branches.push(branch);
            },

            render: function (data) {
                return util.Array.invoke(base.branches, "render", data).join("");
            }

        };

        return Object.freeze(base);

    };

});
