define([
    "lib/util"
], function (
    util
) {

    "use strict";

    return function () {

        var base = {

            type: "base",
            branches: [],

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
