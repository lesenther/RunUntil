const assert = require('assert');
const runUntil = require('../');
const ruLog = require('../ruLog');

describe('Use runUntil on static functions', _ => {

    it('should succeed without runUntil', done => {
        const testFunc = _ => 31337;
        const testParams = null;
        const attempts = 0;
        const expectedResult = 31337;
        const adjustmentFunc = false;

        runUntil(testFunc, testParams, attempts, expectedResult, adjustmentFunc)
        .then(result => {
            assert.equal(result, true);
            done();
        });
    });

    it('should fail without runUntil', done => {
        const testFunc = _ => 31336;
        const testParams = null;
        const attempts = 0;
        const expectedResult = 31337;
        const adjustmentFunc = false;

        runUntil(testFunc, testParams, attempts, expectedResult, adjustmentFunc)
        .then(result => {
            assert.equal(result, false);
            done();
        });
    });

    it('should succeed with runUntil', done => {
        const testFunc = val => val;
        const testParams = [ 31330 ];
        const attempts = 8;
        const expectedResult = 31337;
        const adjustmentFunc = params => [ params[0] + 1 ];

        runUntil(testFunc, testParams, attempts, expectedResult, adjustmentFunc)
        .then(result => {
            assert.equal(result, true);
            done();
        });
    });

    it('should fail with runUntil', done => {
        const testFunc = val => val;
        const testParams = [ 31330 ];
        const attempts = 6;
        const expectedResult = 31337;
        const adjustmentFunc = params => [ params[0] + 1 ];

        runUntil(testFunc, testParams, attempts, expectedResult, adjustmentFunc)
        .then(result => {
            assert.equal(result, false);
            done();
        });
    });

});

describe('Test cases when errors get thrown', _ => {

    it('should fail with thrown error', done => {
        const testFunc = _ => { throw new Error('Fail') };
        const testParams = null;
        const attempts = 0;
        const expectedResult = false;
        const adjustmentFunc = false;

        runUntil(testFunc, testParams, attempts, expectedResult, adjustmentFunc)
        .then(result => {
            assert.equal(result, false);
            done();
        });
    });

    it('should succeed after thrown error', done => {
        const testFunc = first => {
            if (first) {
                throw new Error('Fail')
            } else {
                return 31337;
            }
        };
        const testParams = true;
        const attempts = 1;
        const expectedResult = 31337;
        const adjustmentFunc = val => false;

        runUntil(testFunc, testParams, attempts, expectedResult, adjustmentFunc)
        .then(result => {
            assert.equal(result, true);
            done();
        });
    });

});

describe('Use runUntil with promises', _ => {

    it('should use runUntil with promise function', done => {
        const testFunc = val => new Promise(r => { setTimeout(_ => { r(31337); }, 1000); });
        const testParams = null;
        const attempts = 0;
        const expectedResult = 31337;
        const adjustmentFunc = false;

        runUntil(testFunc, testParams, attempts, expectedResult, adjustmentFunc)
        .then(result => {
            assert.equal(result, true);
            done();
        });
    });

    it('should use runUntil with param adjustment function and promise', done => {
        const testFunc = val => new Promise(r => { setTimeout(_ => { r(val); }, 200); });
        const testParams = [ 31336 ];
        const attempts = 1;
        const expectedResult = 31337;
        const adjustmentFunc = params => [ params[0] + 1 ];

        runUntil(testFunc, testParams, attempts, expectedResult, adjustmentFunc)
        .then(result => {
            assert.equal(result, true);
            done();
        });
    });

    it('should use runUntil with multi param adjustment function and promise', done => {
        const testFunc = (v1,v2,v3) => new Promise(r => { setTimeout(_ => { r(v3); }, 200); });
        const testParams = [ 31336, false, 'red' ];
        const attempts = 2;
        const expectedResult = 'blue';
        const adjustmentFunc = params => {
            if (params[0] === 31337) {
                return [ params[0], params[1], 'blue' ];
            } else {
                return [ params[0] + 1, params[1], params[2] ];
            }
        }

        runUntil(testFunc, testParams, attempts, expectedResult, adjustmentFunc)
        .then(result => {
            assert.equal(result, true);
            done();
        });
    });

});

describe('Expected result as a function', _ => {

    it('should use runUntil and evaluate with expectedResult as a function', done => {
        const testFunc = val => { return { prop: val }; };
        const testParams = 30337;
        const attempts = 1000;
        const expectedResult = result => result.prop === 31337;
        const adjustmentFunc = params => [ params[0] + 1 ];

        runUntil(testFunc, testParams, attempts, expectedResult, adjustmentFunc)
        .then(result => {
            assert.equal(result, true);
            done();
        });
    });

});

describe('Use ruLog to collect data about runUntil execution', _ => {

    it('should use ruLog to collect data', done => {
        const testFunc = val => { return { prop: val }; };
        const testParams = 30337;
        const attempts = 1000;
        const log = new ruLog(testParams);
        const expectedResult = result => log.setResult(result) && result.prop === 31337;
        const adjustmentFunc = params => log.setParams([ params[0] + 1 ]);

        runUntil(testFunc, testParams, attempts, expectedResult, adjustmentFunc)
        .then(result => {
            assert.equal(result, true);
            assert.equal(log.getData().length, 1001);
            assert.equal(log.getData(1000).result.prop, 31337);
            done();
        });
    });

});
