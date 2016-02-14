define([
    "./lib/util"
], function (
    util
) {

    "use strict";

    var errors = {};

    const DEFAULT = "default";
    const FATAL = "fatal";
    const WARNING = "warning";
    const NOTICE = "notice";
    const DEPRECATED = "deprecated";

    function createError(level, Base) {

        var ucfirst = util.String.toUpperFirst(level);

        var NewError = function (message) {

            this.name = ucfirst + "Error";
            this.message = message;

        };

        NewError.prototype = Object.create((Base || Error).prototype);

        errors[level] = NewError;

    }

    function makeErrorManager() {

        var manager = {};


        function create(message, level) {

            var Err;

            if (typeof level !== "string") {
                level = NOTICE;
            }

            Err = errors[level];

            return new Err(message);

        }

        function trigger(message, level) {
            throw create(message, level);
        }

        util.Object.assign(manager, {

            FATAL,
            WARNING,
            NOTICE,
            DEPRECATED,

            create,
            trigger

        });

        return Object.freeze(manager);

    }

    createError(DEFAULT);
    createError(FATAL, errors[DEFAULT]);
    createError(WARNING, errors[DEFAULT]);
    createError(NOTICE, errors[DEFAULT]);
    createError(DEPRECATED, errors[DEFAULT]);

    return makeErrorManager;

});
