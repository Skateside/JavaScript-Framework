define([
    "lib/util",
    "lib/errors",
    "lib/events",
    "async/script",
    "async/xhr"
], function (
    util,
    errors,
    events,
    script,
    xhr
) {

    "use strict";

    const NAMESPACE = "async";

    var types = (function () {

        var innerTypes = {
            SCRIPT: script
        };
        var xhrMethods = [
            "GET",
            "POST",
            "PUT",
            "DELETE"
        ];

        xhrMethods.forEach(function (method) {

            types[method] = function (settings) {

                return xhr(util.Object.assign({
                    method: method
                }, settings));

            };

        });

    }());

    var removeEmpty = function (array) {
        return util.Array.filter(array, util.Function.identity);
    };

    var trigger = function (parts, detail) {
        events.trigger(removeEmpty(parts).join("-"), detail);
    };

    var asyncFunc = function () {

        var async = {

            data: {
                validators: []
            },

            handle: function (ignore, reject) {
                reject("async instance is not set up");
            },

            setType: function (type) {


                if (!types[type]) {
                    throw new TypeError("Unrecognised async type " + type);
                }

                async.handle = types[type](async.data);

                return async;

            },

            addValidator: function (validator) {

                if (typeof validator === "function") {
                    async.data.validators.push(validator);
                }

            },

            request: function () {

                return new Promise(function (resolve, reject) {

                    trigger([NAMESPACE, "start", async.name]);

                    return async.handle(resolve, reject);

                }).then(function (response) {

                    trigger([NAMESPACE, "complete", async.name], response);
                    trigger([NAMESPACE, "success", async.name], response);

                    return response;

                }, function (response) {

                    trigger([NAMESPACE, "complete", async.name], response);
                    trigger([NAMESPACE, "failure", async.name], response);

                    return response;

                });

            }

        };

        util.Array.forEach([
            "data",
            "name",
            "url",
            "decode"
        ], function (key) {

            async["set" + util.String.toUpperFirst(key)] = function (value) {

                if (value !== null && value !== undefined) {
                    async.data[key] = value;
                }

            };

        });

        return async;

    };

    return asyncFunc;

});
