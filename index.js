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
 */
async function runUntil(func, params, tries, expectedResult, adjustParams) {
    if (params !== null && params.constructor !== Array) {
        params = [ params ];
    }

    /**
     * Adjust the parameters if needed and run again
     */
    const _tryAgain = _ => {
        if (tries <= 0) {
            return false;
        }

        const _params = adjustParams
        ? adjustParams(params) 
        : params;

        return runUntil(func, _params, --tries, expectedResult, adjustParams);
    };

    /**
     * Evaluate the result to determine if conditions have been satified and we can stop running.
     *
     * @param {*} result
     */
    const _evaluateResult = result => {
        return result === expectedResult
        ? true
        : ( Promise.resolve(expectedResult) === expectedResult
            ? expectedResult(result)
            .then(_ => true)
            .catch(_ => _tryAgain)
            : ( typeof expectedResult === 'function'
                ? ( expectedResult(result)
                    ? true
                    : _tryAgain() )
                : _tryAgain() ) );
    };

    try {
        const result = func.apply(null, params);

        return Promise.resolve(result) === result
        ? result.then(_evaluateResult)
        : _evaluateResult(result);
    } catch(e) {
        return _evaluateResult(e);
    }
}

module.exports = runUntil;
