/**
 * mock模块
 * @module mock
 * @path /mock
 */
module.exports = class UserService {
  /**
   * 获得个人信息
   * @note 返回模型
   * ```json
   * {
   *   "params": inputData
   *   "data": "helloworld",
   * }
   * ```
   * @route {get} /demo
   * @param {object} params
   * @param {number} params.id
   * @param {Context} context
   */
  async mock(params, context) {
    return {
      params,
      data: 'helloworld'
    };
  }
};
