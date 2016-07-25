define([
    "lib/dom"
], function (
    dom
) {

    "use strict";

    var asyncScript = {};
    var firstScript;

    function getFirstScript() {

        if (!firstScript) {
            firstScript = dom.byQuery("script");
        }

        return firstScript;

    }

    function handle(settings, resolve, reject) {

        var script = dom.create("script");

        dom.setAttr(script, {
            async: true,
            type: "text/javascript",
            url: settings.url
        });

        dom.on(script, {
            load: resolve,
            error: reject
        });

        dom.append(script, getFirstScript());

    }

    return function (settings) {
        return util.Function.curry(handle, settings);
    };

});
