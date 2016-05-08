/**
 *  util.Function
 *
 *  Namespace for all Function functions.
 **/
define([
    "./lib/util/core.js"
], function (
    core
) {

    "use strict";

    var functions = {};

    /**
     *  util.Function.noop()
     *
     *  A "NO-OPeration" function. Takes no arguments, returns nothing. This is
     *  mainly useful for situations where a default function is required with
     *  the expectation being that the function will be overridden by a setting
     *  or argument later on.
     *
     *      Function.noop();          // -> undefined
     *      Function.noop(true);      // -> undefined (arguments are ignored)
     *      Function.noop.call(null); // -> undefined (context is ignored)
     *
     **/
    var noop = function () {
        return;
    };

    /**
     *  util.Function.curry(func, ...args) -> Function
     *  - func (Function): Function to curry.
     *  - args (?): Pre-defined arguments for `func`.
     *
     *  This method creates a function that pre-populates `func` with the given
     *  `args`. To better understand that, consider the following function:
     *
     *      function aLady(once, twice, threeTimes) {
     *          return once + (2 * twice) + (3 * threeTimes);
     *      }
     *      aLady(1, 2, 3); // -> (1 + (2 * 2 = 4) + (3 * 3 = 9) = ) 14
     *
     *  The arguments can be pre-defined:
     *
     *      var ladyOne = util.Function.curry(aLady, 1);
     *      ladyOne(1, 2); // -> (1 + (2 * 1 = 2) + (3 * 2 = 6) = ) 9
     *
     *  Gaps in the pre-defined arguments can be left using `undefined` - these
     *  gaps will be automatically filled in using the arguments passed to the
     *  new function.
     *
     *      var ladyTwo = util.Function.curry(aLady, undefined, 5);
     *      ladyTwo(6, 7); // -> (6 + (2 * 5 = 10) + (3 * 7 = 21) = ) 37
     *
     **/
    function curry(func, ...args) {

        return function (...innerArgs) {

            var allArgs = [];

            args.forEach(function (arg) {

                allArgs.push(arg === undefined
                    ? innerArgs.shift()
                    : arg);

            });

            return func(...allArgs.concat(innerArgs));

        };

    }

    /**
     *  util.Function.interpret(func) -> Function
     *  - func (?): Object to interpret as a function.
     *
     *  Interprets the given `func` as a function. If `func` cannot be
     *  interpretted as a function, [[util.Function.noop]] is returned. Passing
     *  a variable through this function guarentees that the function will work
     *  with all [[util.Function]] methods.
     **/
    function interpret(func) {

        return typeof func === "function"
            ? func
            : noop;

    }

    core.assign(functions, {
        curry,
        identity: core.identity,
        interpret,
        isNative: core.isFunctionNative,
        noop
    });

    return Object.freeze(functions);

});
