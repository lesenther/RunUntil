'use strict';

/**
 * RunUntil.js
 *
 * Run a function until an expected result is returned or until tries count is exhausted
 *
 * @param {Function} func The function to run
 * @param {Array} params The parameters to be passed into the function
 * @param {Number} tries The number of times to attempt to run the function
 * @param {Number|String|Function} expectedResult The value the function should return or a function returning a promise that will evaluate the return value
 * @param {Function} adjustParams A function that will operate on the params each iteration
 * @param {Array|Boolean} log Array for data collection or false if unused (default)
 */
async function runUntil(func, params, tries, expectedResult, adjustParams = _ => _, log = false) {
    // Support for adding a single param without having to wrap in an array
    if (params !== null && params.constructor !== Array) {
        params = [ params ];
    }

    const startTime = new Date();

    /**
     * Adjust the parameters if needed and run again
     */
    const tryAgain = _ => (tries > 0)
    ? runUntil(func, adjustParams(params), --tries, expectedResult, adjustParams, log)
    : false;

    /**
     * Evaluate the result to determine if conditions have been satified and we can stop running.
     *
     * @param {*} result
     */
    const _evaluateResult = result => {
        log && log.push({
            index: log.length,
            params,
            startTime,
            endTime: new Date(),
            result
        });

        return result === expectedResult
        ? true
        : ( Promise.resolve(expectedResult) === expectedResult
            ? expectedResult(result)
            .then(_ => true)
            .catch(_ => tryAgain)
            : ( expectedResult.constructor === Function
                ? ( expectedResult(result)
                    ? true
                    : tryAgain() )
                : tryAgain() ) );
    };

    try {
        // Run the function
        const result = func.apply(null, params);

        // If we get a promise, wait for it to resolve to evaluate, otherwise evaluate the result right away
        return Promise.resolve(result) === result
        ? result.then(_evaluateResult)
        : _evaluateResult(result);
    } catch(e) {
        // If the function throws an error, handle the error with the evaluate method
        return _evaluateResult(e);
    }
}

module.exports = runUntil;
