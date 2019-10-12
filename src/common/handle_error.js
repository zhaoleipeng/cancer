const _ = require('lodash');
const log = require('xxd-log');
const errors = require('./errors');

/**
 * @param {Error} err
 * @param {Context} [ctx]
 */
module.exports = (err, ctx) => {
  if (!(err instanceof Error)) {
    const message = (err && (err.message || err.msg)) || err;
    const stack = err && err.stack;
    const name = (err && err.name) || 'Error';
    const code = (err && (err.code || err.status || err.statusCode)) || undefined;
    err = new Error(message);
    Error.captureStackTrace(err, module.exports);
    err.stack = stack || err.stack;
    err.name = name;
    err.code = code;
  }
  let error = err;
  if (ctx && ctx.app && ctx.request && ctx.response) {
    if (!(error instanceof errors.Error)) {
      ctx.status = 500;
      error = new errors.Error(err);
    }

    ctx.enc = error;

    const context = _.omit(ctx.state, ['session', 'adminSession', 'params']);
    if (err.context) {
      context.errorContext = err.context;
    }
  }
  log.error((err.stack && filterStack(err.stack)) || err.message || err);
};

function filterStack(stack) {
  if (!stack) {
    return stack;
  }
  const lines = [];
  let found = false;
  for (const line of stack.split('\n')) {
    const startPosition = line.indexOf(process.cwd());
    if (!found) {
      lines.push(line);
    }
    if (/:\d+:\d+/.test(line) && startPosition !== -1 && !line.includes('node_modules')) {
      found = true;
      lines.push(line);
    }
  }
  return lines.join('\n');
}
