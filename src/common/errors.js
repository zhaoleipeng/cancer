/*
 * !!! Do not change this file !!!
 * Because this file is auto generated,
 * Any changes you make would be overwriten.
 */

const defineError = require('../.internal/define_error');

exports.Error = defineError.ErrorWithCode;

/** (1) 未知服务器错误 */
exports.unknownError = defineError(1, 'unknownError', '未知服务器错误');
/** (2) 请求参数错误 */
exports.parameterError = defineError(2, 'parameterError', '请求参数错误');
/** (3) 登录状态异常 */
exports.sessionRequiredError = defineError(3, 'sessionRequiredError', '登录状态异常');
/** (4) 第三方服务错误 */
exports.thirdpartyServiceError = defineError(4, 'thirdpartyServiceError', '第三方服务错误');
/** (5) 查询对象不存在 */
exports.itemNotFoundError = defineError(5, 'itemNotFoundError', '查询对象不存在');
/** (6) 操作对象状态错误 */
exports.itemStatusError = defineError(6, 'itemStatusError', '操作对象状态错误');
/** (7) 请等待上一次请求结束 */
exports.anotherRequestInProgressError = defineError(
  7,
  'anotherRequestInProgressError',
  '请等待上一次请求结束'
);
/** (8) 不能进行该操作 */
exports.operationInvalidError = defineError(8, 'operationInvalidError', '不能进行该操作');
/** (9) 没有权限进行此操作 */
exports.permissionError = defineError(9, 'permissionError', '没有权限进行此操作');
