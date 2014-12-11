var TEST = (function () {

    'use strict';

    // Initialised later on.
    var Asserter = null,
        Tester   = null,
        test     = null;

    // Takes two objects and compares them. Returns true or false.
    // Based on a script found at 
    // http://stackoverflow.com/questions/1068834/object-comparison-in-javascript
    function objectsMatch(object1, object2) {

        var p,
            match = true;
        
    // Start by going through each of the properties in object1. Check that they
    // each exist in object2.
        for (p in object1) {
            if (object1.hasOwnProperty(p)) {
                if (object2[p] === undefined) {
                    match = false;
                    break;
                }
            }
        }

    // If everything existed in object2, do the same check using the object2
    // properties in object1.
        if (match) {
            for (p in object2) {
                if (object2.hasOwnProperty(p)) {
                    if (object1[p] === undefined) {
                        match = false;
                        break;
                    }
                }
            }
        }
        
    // Now that we know both objects have the same properties, check to see if
    // those properties match. We do this check last since the this function can
    // recurse here so we should save ourselves some of the processing work.
        if (match) {
            checkLoop:
            for (p in object1) {
                if (object1.hasOwnProperty(p)) {
                    switch (typeof object1[p]) {
                    case 'object':
                        if (!objectsMatch(object1[p], object2[p])) {
                            match = false;
                            break checkLoop;
                        }
                        break;
                    case 'function':
                        if (object1[p].toString() !== object2[p].toString()) {
                            match = false;
                            break checkLoop;
                        }
                        break;
                    default:
                        if (object1[p] !== object2[p]) {
                            match = false;
                            break checkLoop;
                        }
                    }
                }
            }
        }

        return match;
        
    }

    // Creates a string of the error message.
    function stringify(err) {

        var string = err.name + ':';

        if (err.fileName) {
            string += ' ' + err.fileName + ':';
        }

        if (err.lineNumber) {
            string += ' ' + err.lineNumber + ':';
        }

        if (err.message) {
            string += ' ' + err.message;
        }

        return string;

    }

    /**
     * class Asserter
     *
     * The Asserter handles all assertions that can be made. Its main comparison
     * functions are:
     *
     * - [[Asserter#isTrue]]: is the given value `true`?
     * - [[Asserter#isFalse]]: is the given value `false`?
     * - [[Asserter#isSame]]: are the two arguments the same?
     * - [[Asserter#isNotSame]]: are the two arguments not the same?
     * - [[Asserter#isSimilar]]: are the two arguments similar?
     * - [[Asserter#isNotSimilar]]: are the two arguments not similar?
     * - [[Asserter#throws]]: does the given function throw an Error?
     * - [[Asserter#notThrows]]: does the given function not throw an Error?
     * 
     **/
    Asserter = function () {
        return this.init.apply(this, arguments);
    };

    Asserter.prototype = {

        /**
         * new Asserter()
         **/
        init: function () {

            /**
             * Asserter#results -> Array
             *
             * Collection of all results.
             **/
            this.results = [];

        },

        /**
         * Asserter#isTrue(value)
         * - value (*): Value to test.
         *
         * Checks to see if the given value is `true`.
         **/
        isTrue: function (value) {
            this.results.push(value === true);
        },

        /**
         * Asserter#isFalse(value)
         * - value (*): Value to test.
         *
         * Checks to see if the given value is `false`.
         **/
        isFalse: function (value) {
            this.results.push(value === false);
        },

        /**
         * Asserter#isSame(value1, value2)
         * - value1 (*): A value to test.
         * - value2 (*): Another value to test.
         *
         * Checks to see if the two values are identical. Be aware that this
         * uses the strict comparison operator (`===`) so will decide that two
         * similar looking `Array`s are not the same. To test complex objects,
         * use [[Asserter#isSimilar]]. To check that the two values are not the
         * same, use [[Asserter#isNotSame]].
         **/
        isSame: function (value1, value2) {
            this.results.push(value1 === value2);
        },

        /**
         * Asserter#isNotSame(value1, value2)
         * - value1 (*): A value to test.
         * - value2 (*): Another value to test.
         *
         * Does the opposite to [[Asserter#isSame]]. For ensuring that two
         * complex objects are not similar, use [[Asserter#isNotSimilar]].
         **/
        isNotSame: function (value1, value2) {
            this.results.push(value1 !== value2);
        },

        /**
         * Asserter#isSimilar(value1, value2)
         * - value1 (*): A value to test.
         * - value2 (*): Another value to test.
         *
         * Checks to see if the two values are similar. This uses loose
         * comparison (`==`) and will walk through `Object`s and `Array`s. It
         * will also stringify `Function`s (using `Function.prototype.toString`)
         * and consider two `NaN` values to be the same. This is useful when
         * checking complex objects but can coerce types causing false positives
         * (for example, comparing `1` and `'1'`). For those situations, use
         * [[Asserter#isSame]].
         **/
        isSimilar: function (value1, value2) {

            var isSimilar = false;

            if (value1 && typeof value1 === 'object' &&
                    value2 && typeof value2 === 'object') {
                isSimilar = objectsMatch(value1, value2);
            } else if (value1 !== value1) {
                isSimilar = isNaN(value1) && isNaN(value2);
            } else {
                isSimilar = value1 == value2; // double equals for loose check
            }

            this.results.push(isSimilar);

        },

        /**
         * Asserter#isNotSimilar(value1, value2)
         * - value1 (*): A value to test.
         * - value2 (*): Another value to test.
         *
         * Does the opposite to [[Asserter#isSimilar]]. For ensuring that two
         * complex objects do not take up the same space in memory, or for
         * comparing primative variables, use [[Asserter#isNotSame]].
         **/
        isNotSimilar: function (value1, value2) {

            var isNotSimilar = true;

            if (value1 && typeof value1 === 'object' &&
                    value2 && typeof value2 === 'object') {
                isNotSimilar = !objectsMatch(value1, value2);
            } else if (value1 !== value1) {

                isNotSimilar = (isNaN(value1) && !isNaN(value2)) ||
                        (!isNaN(value1) && isNaN(value2));

            } else {
                isNotSimilar = value1 != value2; // double equals for loose check
            }

            this.results.push(isNotSimilar);

        },

        /**
         * Asserter#throws(func)
         * - func (Function): Function that might throw an Error.
         *
         * Checks to see if the given function throws an `Error`. To ensure that
         * a function does not, use [[Asserter#notThrows]].
         **/
        throws: function (func) {

            var hasError = false;

            try {
                func();
            } catch(ex) {
                hasError = true;
            }

            this.results.push(hasError);

        },

        /**
         * Asserter#notThrows(func)
         * - func (Function): Function that might throw an Error.
         *
         * Checks to ensure that the given function does not throw an `Error`.
         * To ensure that a function does not, use [[Asserter#notThrows]].
         **/
        notThrows: function (func) {

            var hasNoError = true;

            try {
                func();
            } catch(ex) {
                hasNoError = false;
            }

            this.results.push(hasError);

        },

        /**
         * Asserter#report() -> Object
         *
         * Reports the results of the assertions given, effectively returning
         * the results of [[Asserter#results]] but analysing them to give the
         * number of `tests` and `passes`.
         **/
        report: function () {

            var results = this.results;

            return {
                tests:  results.length,
                passes: results.filter(this.resultIsTrue).length
            };

        },

        /**
         * Asserter#resultIsTrue(result) -> Boolean
         * - result (Boolean): Result to test.
         *
         * Helper function for [[Asserter#report]]. Simply checks to see if the
         * given result is `true`.
         **/
        resultIsTrue: function (result) {
            return result === true;
        }

    };

    /**
     * class Tester
     *
     * Keeps track of the individual test. Crucially, the [[Tester#it]] function
     * is passed to the tests, giving access to the [[Asserter]] methods.
     **/
    Tester = function () {
        return this.init.apply(this, arguments);
    };

    Tester.prototype = {

        /**
         * new Tester(name)
         * - name (String): Name of the test.
         **/
        init: function (name) {

            /**
             * Tester#name -> String
             *
             * Name of the test.
             **/
            this.name = name;

            /**
             * Tester#assertions -> Array
             *
             * All assertions made during this test.
             **/
            this.assertions = [];

        },

        /**
         * Tester#process(tests)
         * - tests (Function): Tests to run with this tester.
         *
         * Runs through the tests given. Each test is passed a reference to
         * [[Tester#it]], bound to the current instance.
         **/
        process: function (tests) {
            tests(this.it.bind(this));
        },

        /**
         * Tester#it(assertion, tests)
         * - assertion (String): Assertion for the test.
         * - tests (Function): Function to test the assertion.
         *
         * This function handles the bulk of the testing. It allows an assertion
         * to be made and then tested. Multiple assertions can be made within a
         * test and multiple checks can be made within the `tests` function. The
         * `tests` function is passed a new instance of [[Asserter]].
         *
         *      it('should work properly', function (assert) {
         *          assert.isTrue(1 == '1');
         *          assert.isFalse(1 === '1');
         *      });
         * 
         **/
        it: function (assertion, tests) {

            var err    = '',
                assert = new Asserter(),
                report = null;

            try {
                tests(assert);
            } catch (ex) {
                err = stringify(ex);
            }

            report = assert.report();

            this.assertions.push({
                name:   assertion,
                tests:  report.tests,
                passes: report.passes,
                err:    err
            });

        }

    };

    /**
     * TEST(name, tests)
     * - name (String): Name of the group of tests.
     * - tests (Function): Tests to run.
     *
     * Runs the `tests` passed to it. The `name` argument is used as a unique
     * key, allowing later tests to be added to an existing test. The tests are
     * run through [[Tester#process]] so they are each passed [[Tester#it]].
     *
     *      TEST('Basic JavaScript', function (it) {
     *
     *          it('should have Strings and Numbers', function (assert) {
     *              assert.isTrue(typeof 1 === 'number');
     *              assert.isTrue(typeof '1' === 'string');
     *          });
     *
     *          it('should have comparisons', function (assert) {
     *              assert.isTrue(1 == '1');
     *              assert.isFalse(1 === '1');
     *          });
     * 
     *      });
     * 
     **/
    test = function (name, tests) {

        if (!test.tests[name]) {
            test.tests[name] = new Tester(name);
        }

        test.tests[name].process(tests);

    };

    /**
     * TEST.tests -> Object
     *
     * Collection of all tests that have been run using the [[TEST]] function.
     * These are stored against [[TEST]]'s `name` argument. Although publicly
     * visible, it should be considered **private** and not touched by external
     * programs.
     **/
    test.tests = {};

    /**
     * TEST.getReport(tester) -> Object
     * - tester (Tester): Instance of [[Tester]].
     *
     * Gets the report from the instance of [[Tester]] requested. This is mainly
     * used as a helper function for [[TEST.report]] but can be used to get an
     * individual report from the tests stored in [[TEST.tests]].
     **/
    test.getReport = function (tester) {

        var report = {
                tests:      0,
                passes:     0,
                assertions: []
            },
            asserts = tester.assertions;

        asserts.forEach(function (assertion) {

            report.tests  += assertion.tests;
            report.passes += assertion.passes;

        });

        report.assertions = asserts;

        return report;

    };

    /**
     * TEST.report() -> Object
     *
     * The report for all tests passed to the [[TEST]] function. Each report is
     * returned against the `name` argument given to the [[TEST]] function and
     * is the main access point for all external functions.
     **/
    test.report = function () {

        var tests  = test.tests,
            prop   = '',
            owns   = Object.prototype.hasOwnProperty.bind(tests),
            report = {};

        for (prop in tests) {
            if (owns(prop)) {
                report[prop] = test.getReport(tests[prop]);
            }
        }

        return report;

    };

    // Expose the inner "test" variable and store it in the external "TEST"
    // variable.
    return test;

}());
