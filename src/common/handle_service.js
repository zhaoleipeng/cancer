/**
 * 包装服务函数调用为koa中间件
 * @param {object} service
 * @param {string} handler
 */
module.exports = (service, handler) => async ctx => {
  const response = await Promise.resolve().then(() => service[handler](ctx.params, ctx));
  ctx.body = { code: 0, data: response };
};
