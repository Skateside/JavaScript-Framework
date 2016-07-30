define([
    "lib/util"
], function (
    util
) {

    "use strict";

    return function (text) {

        var textBranch = {

            type: "text",

            render: function (data) {
                return util.String.supplant(text, data);
            }

        };

        return Object.freeze(textBranch);

    };

});
