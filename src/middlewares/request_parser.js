const handleError = require('../common/handle_error');

module.exports = () => {
  // options = config.util.extendDeep({}, defaultOptions, options);

  /**
   * @param {Context} ctx
   * @param {function} next
   */
  async function middleware(ctx, next) {
    try {
      const params = Object.assign({}, ctx.query, ctx.request.body, ctx.params);
      Object.defineProperty(ctx, 'params', { value: params, enumerable: true });
    } catch (err) {
      handleError(err, ctx);
    }

    await next();
  }

  return middleware;
};
