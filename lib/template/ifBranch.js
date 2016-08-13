define([
    "lib/util",
    "lib/template/baseBranch"
], function (
    util,
    makeBaseBranch
) {

    "use strict";

    var tests = {

        "<": function (data, value) {
            return data < value;
        },

        ">": function (data, value) {
            return data > value;
        },

        "<=": function (data, value) {
            return data <= value;
        },

        ">=": function (data, value) {
            return data >= value;
        },

        "!==": function (data, value) {
            return data !== value;
        },

        "===": function (data, value) {
            return data === value;
        },

        // The regular expression can't match this but will need it.
        truthy: function (data) {
            return !!data;
        }

    };
    // Basic aliases.
    tests["!="] = tests["!=="];
    tests["=="] = tests["==="];

    function decode(value) {

        var parts;

        switch (value) {

        case undefined:
            value = "";
            break;

        case "null":
            value = null;
            break;

        case "undefined":
            value = undefined;
            break;

        case "false":
        case "true":
            value = value === "true";
            break;

        default:

            parts = value.match(/^(["'`])?([\s\S]+)?\1$/);

            if (typeof parts[1] === "string") {
                value = parts[2];
            } else if (util.Number.isNumeric(value)) {
                value = +value;
            } else {

                value = util.Function.curry(
                    util.Object.access,
                    undefined,
                    value
                );

            }

        }

        return value;

    }

    return function (condition) {

        var parts = condition.match(/\${#if\s+(!)?([\S]+)(\s*([<>!=]{1,3})\s*([\S]+))?\}/);
        var negation = parts[1];
        var propertyPath = parts[2];
        var test = parts[4] || "truthy";
        var value = decode(parts[5]);
        var baseBranch = makeBaseBranch();

        return util.Object.assign({}, baseBranch, {

            type: "if",

            render: function (data) {

                var property = util.Object.access(data, propertyPath);
                var shouldRender = typeof tests[test] === "function"
                    ? tests[test](
                        negation === "!"
                            ? !property
                            : property,
                        typeof value === "function"
                            ? value(data)
                            : value
                    )
                    : true;

                return shouldRender
                    ? baseBranch.render(data)
                    : "";

            }

        });

    };

});
