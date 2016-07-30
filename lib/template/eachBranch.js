define([
    "lib/util",
    "lib/template/levelBranch"
], function (
    util,
    makeLevelBranch
) {

    return function (condition) {

        var reg = /\$\{#each\s+([\w]+)\s+as(\s([\w]+)\s+to)?\s+([\w]+)\}/;
        var parts = condition.match(reg);
        var dataKey = parts[1];
        var iterationKey = parts[2];
        var iterationValue = parts[4];

        var eachBranch = util.Object.assign({}, makeLevelBranch(), {

            type: "each",

            pair: function (data) {

                return util.Array.isArrayLike(data)
                    ? util.Array.map(data, function (value, key) {

                        return {
                            key: key,
                            value: value
                        };

                    })
                    : util.Object.pair(data);

            },

            render: function (data) {

                var rendered = "";
                var datum = eachBranch.pair(data[dataKey]);
                var branchData = util.Object.clone(data);

                eachBranch.branches.forEach(function (branch) {

                    datum.forEach(function (pair) {

                        branchData[iterationValue] = pair.value;

                        if (iterationKey) {
                            branchData[iterationKey] = pair.key
                        }

                        rendered += branch.render(branchData);

                    });

                });

                return rendered;

            }

        });

        return Object.freeze(eachBranch);

    };

});
