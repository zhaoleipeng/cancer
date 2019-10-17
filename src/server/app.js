const config = require('config');
const log = require('xxd-log');
const Koa = require('koa');
const mount = require('koa-mount');
const path = require('path');
const logger = require('koa-logger');
const serve = require('koa-static');
const cors = require('kcors');
const routes = require('../routes');
const smartdoc = require('xxd-smartdoc-middleware');

const app = new Koa();

// Set properties
app.proxy = true; // Trust proxy ips, so please deploy under nginx or other gateway that handles proxy.

// Load doc
// Load doc
const spec = path.join(__dirname, '../../tmp/.compile/spec.json');
const docsDir = path.join(__dirname, '../../docs');
const prefix = '/doc'
app.use(mount(prefix, smartdoc({ prefix, spec, docsDir })));
app.use(mount('/tester', serve(path.resolve(__dirname, '../../tester_dev/'))));
app.use(mount('/tester', serve(path.resolve(__dirname, '../../tester_build/'))));

// Load global middlewares

if (config.get('env') === 'local') {
  app.use(logger());
}
// app.use(
//   cors({
//     credentials: true,
//     origin: ctx => ctx.get('Origin'),
//     // allowHeaders: ['x-talk-enciv', 'x-talk-token', 'x-talk-tokiv', 'x-talk-timestamp'],
//   })
// );

// Load routes
app.use(routes.routes()).use(routes.allowedMethods());

// Set error handler
process.on('uncaughtException', err => {
  log.error('Uncaught exception:', err.stack || err);
});

process.on('unhandledRejection', err => {
  log.error('Unhandled rejection:', err.stack || err);
});

app.on('error', (err, ctx) => {
  log.error('App error:', err.stack || err);
  ctx.status = 500;
  ctx.body = {
    code: 1,
    msg: 'xxx!',
  };
});

module.exports = app;
