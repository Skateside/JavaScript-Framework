define([
    "lib/util",
    "lib/dom"
], function (
    util,
    dom
) {

    "use strict";

    return Object.freeze({

        value: util.Function.identity,
        text: util.String.interpret,
        html: dom.toHtml,

        json: function (response) {

            var json;

            if (response && typeof response === "string") {

                try {
                    json = JSON.parse(response || "null");
                } catch (ignore) {
                    errors.warning("Invalid JSON: " + response);
                }

            } else {
                errors.warning("Unrecognised JSON: " + response);
            }

            return json;

        },

        xml: function (response) {

            var xml;
            var parser;

            if (response && typeof response === "string") {

                // Support: IE9
                try {

                    parser = new DOMParser();
                    xml = parser.parseFromString(response, "text/xml");

                } catch (ignore) {
                }

                if (
                    !xml
                    || xml.getElementsByTagName("parsererror").length
                ) {

                    errors.warning("Invalid XML: " + response);

                }

            } else {
                errors.warning("Unrecognised XML: " + response);
            }

            return xml;

        }

    });

});
