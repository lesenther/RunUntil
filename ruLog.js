/**
 * This class is used to log data for the runUntil method.
 *
 * Use by creating a new object:
 *
 * const ruLog = new ruLog(initialParams);
 *
 * Then include the call in the evaluateResult method:
 *
 * function evaluateResult(result) {
 *   ruLog.setResult(result);
 *
 *   // eval code
 * }
 *
 * And when changing params:
 *
 * function changeParams(params) {
 *   const newParams = ... // code to change params
 *   ruLog.setParams(newParams);
 *
 *   return newParams;
 * }
 *
 */
class ruLog {

  constructor(params) {
    this.params = params;
    this.data = [];
    this.startTime = new Date();
  }

  setResult(result) {
    return this.data.push({
      index: this.data.length,
      params: this.params,
      result,
      startTime: this.startTime,
      endTime: new Date()
    });
  }

  setParams(params) {
    this.params = params;
    this.startTime = new Date();

    return params;
  }

  getData(index) {
    return index ? this.data[index] : this.data;
  }

}

module.exports = ruLog;