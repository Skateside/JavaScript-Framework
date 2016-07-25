// errors.js
define(function () {

    "use strict";

    var errors = {};

    errors.fatal = function (message) {
        throw new Error("Fatal Error: " + message);
    };

    errors.warning = function (message) {
        console.error("Warning: " + message);
    };

    errors.notice = function (message) {
        console.info("Notice: " + message);
    };

    errors.deprecated = function (message) {
        console.warn("Deprecated: " + message);
    };

    return Object.freeze(errors);

});
