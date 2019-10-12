// const handleError = require('../../_internal/handle_error');
const handleError = require('../common/handle_error');

module.exports = () => async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    handleError(err, ctx);
  }
};
