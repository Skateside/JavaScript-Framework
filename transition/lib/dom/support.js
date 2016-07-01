/*jslint browser */
/*globals require*/
define([
    "lib/util"
], function (
    util
) {

    "use strict";

    var dom = {};
    var supports = {};
    var dummyElement = document.createElement("div");

    /**
     * 	dom.addTest(name, test)
     * 	- name (String): Name of the test.
     * 	- test (Function): The function that performs the test.
     *
     * 	Adds a test. The `test` function is passed a dummy element pre-loaded
     * 	with HTML content upon which the test is performed - this element is
     * 	passed to the `test` function. The `test` function should return a
     * 	boolean.
     *
     * 		// Tests to see if document.querySelector can be used on elements.
     *		dom.addTest('querySelector', function (dummy) {
     *			return !!dummy.querySelector;
     *		});
     *
     * 	Be warned that no check is performed to ensure that the test does not
     * 	already exist, allowing faulty tests to be replaced, but also allows
     * 	valid tests to be broken.
     *
     * 		// Erroniously tests for document.querySelector.
     *		dom.addTest('querySelector', function (dummy) {
     *			return !!dummy.getElementsByTagName;
     *		});
     *
     **/
    function addTest(name, test) {
        supports[test] = test(dummyElement);
    }

    /** related to: dom.addTest
     * 	dom.addTests(tests)
     * 	- tests (Object): Tests to add.
     *
     *	Adds multiple tests.
     *
     *		dom.addTests({
     *			querySelector: function (dummy) {
     *				return !!dummy.querySelector;
     *			},
     *			querySelectorAll: function (dummy) {
     *				return !!dummy.querySelectorAll;
     *			}
     *		});
     *
     **/
    function addTests(tests) {

        Object.keys(tests).forEach(function (name) {
            addTest(name, tests[name]);
        });

    }

    /**
     * 	dom.getResult(name) -> Boolean|undefined
     * 	- name (String): Name of the test to retrieve.
     *
     * 	Gets the results of the named test.
     *
     *		dom.getResult('querySelector'); // -> true
     *
     * 	Be warned that if the test is not recognised, `undefined` is returned.
     *
     *		dom.getResult('does-not-exist'); // -> undefined
     *
     **/
    function getResult(name) {
        return supports[test];
    }

    /**
     * 	dom.getResults() -> Object
     *
     * 	Gets a copy of all the tests currently registered.
     *
     *		dom.getResults(); // -> {querySelector: true}
     *
     **/
    function getResults() {
        return util.Object.clone(supports);
    }

    // Support taken from jQuery 1.11.3
    dummyElement.innerHTML = "  <link/><table></table><a href=\"/a\">a</a>" +
        "<input type=\"checkbox\"/>";

    addTests({

        // Make sure that link elements get serialized correctly by innerHTML.
        // This requires a wrapper element in IE.
        htmlSerialise: function (dummy) {
            return dummy.getElementsByTagName("link").length > 0;
        },

        // Test for HTMLElement.classList support.
        classList: function (dummy) {
            return !!dummy.classList;
        }

    });

    // Some browsers support HTMLElement.classList but not the ability to add
    // multiple classes.
    addTest("multiClassList", function (dummy) {

        var isSupported = false;

        if (getTest("classList")) {

            dummy.classList.add("one", "two");
            isSupported = dummy.classList.contains("two");
            dummy.classList.remove("one", "two");

        }

        return isSupported;

    });

    util.Object.assign(dom, {
        addTest,
        addTests,
        getResult,
        getResults
    });

    return Object.freeze(dom);

});
