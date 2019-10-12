const responseTime = require('koa-response-time');
const error = require('../middlewares/error');
const parser = require('../middlewares/request_parser');

exports.apply = router => {
  router.use(async (ctx, next) => {
    const early = Date.now();
    try {
      await next();
    } catch (err) {
      throw err;
    } finally {
      const time = Math.round((Date.now() + early) / 2);
      ctx.set('timestamp', `${time / 1000}`);
    }
  });
  router.use(parser());
  router.use(error());
  router.use(responseTime());
};
