/**
 *  util.Number
 *
 *  Namespace for all Number functions.
 **/
define([
    "lib/util/core"
], function (
    core
) {

    "use strict";

    var number = {};

    /**
     *  util.Number.interpret(number) -> Number
     *  - number (?): Number to interpret.
     *
     *  Interprets the given `number` as a `Number`. If `number` cannot be
     *  interpretted as a number, `0` is returned. Passing a variable through
     *  this function will guarentee that the result will be usable by all the
     *  [[util.Number]].
     **/
    var interpret = function (number) {
        return +number || 0;
    };

    /**
     *  util.Number.times(number, handler[, context])
     *  - number (Number): Number of times to execute the handler.
     *  - handler (Function): Handler to execute.
     *  - context (Object): Context for the handler.
     *
     *  Executes a `handler` multiple times. Each time `handler` is passed the
     *  index of its execution.
     *
     *      util.Number.times(4, function (i) {
     *          console.log(i);
     *      });
     *      // logs 0 then 1 then 2 then 3
     *
     *  The number is normalised to handle negative numbers, decimals and
     *  strings.
     *
     *      util.Number.times(-4, function (i) {
     *          console.log(i);
     *      });
     *      // logs 0 then 1 then 2 then 3; absolute number used.
     *
     *      util.Number.times(4.1, function (i) {
     *          console.log(i);
     *      });
     *      // logs 0 then 1 then 2 then 3; decimal is removed.
     *
     *      util.Number.times("4", function (i) {
     *          console.log(i);
     *      });
     *      // logs 0 then 1 then 2 then 3; string coerced into a number.
     *
     *      util.Number.times(Infinity, function (i) {
     *          console.log(i);
     *      });
     *      // does nothing; Infinity is not numeric.
     *
     **/
    function times(number, handler, context) {

        var count = core.toPosInt(number) || 0;
        var i = 0;

        while (i < count) {

            handler.call(context, i);
            i += 1;

        }

    }

    core.assign(number, {
        interpret: interpret,
        isNumeric: core.isNumeric,
        randFloat: core.randFloat,
        randInt: core.randInt,
        times: times,
        toPosInt: core.toPosInt
    });

    return Object.freeze(number);

});
