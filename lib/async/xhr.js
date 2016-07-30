define([
    "util",
    "async/decode"
], function (
    util,
    decode
) {

    "use strict";

    function validateStatus(info) {
        return (info.status >= 200 && info.status < 300) || info.status === 304;
    }

    function getInfo(xhr) {

        return {
            status: xhr.status,
            statusText: xhr.statusText,
            response: xhr.response
        };

    }

    function getDecoder(decoder) {

        if (!decode[decoder]) {
            decoder = "value";
        }

        return decode[decoder];

    }

    function handle(settings, resolve, reject) {

        var xhr = new XMLHttpRequest();
        var data = util.Object.toQuery(settings.data);
        var url = settings.url;

        if (data && settings.method === "GET") {

            url += url.indexOf("?") > -1
                ? "&" + data
                : "?" + data;

            data = undefined;

        } else if (settings.method === "POST") {

            xhr.setRequestHeader(
                "Content-Type",
                "application/x-www-form-urlencoded; charset=UTF-8"
            );

        }

        xhr.onreadystatechange = function () {

            var info;
            var isValid;

            if (xhr.readyState === 4) {

                info = getInfo(xhr);
                isValid = settings.validators.every(function (validator) {
                    return validator(info);
                });

                if (isValid) {
                    resolve(info);
                } else {
                    reject(info);
                }

            }

        };

        xhr.onerror = function () {
            reject(that.getInfo(xhr));
        };

        xhr.open(settings.method, url, true);
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.send(data);

    }

    return function (settings) {

        settings.validators.push(validateStatus);

        return util.Function.curry(handle, settings);

    };

});
