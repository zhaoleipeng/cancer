'use strict';

const cc = require('change-case');

const getStackFirstPosition = stack => {
  if (!stack) {
    return null;
  }
  for (const line of stack.split('\n')) {
    const startPosition = line.indexOf(process.cwd());
    if (/:\d+:\d+/.test(line) && startPosition !== -1 && !line.includes('node_modules')) {
      const match = line.match(/:\d+:\d+/);
      if (match) {
        const endPosition = match.index + match[0].length;
        return line.slice(startPosition + process.cwd().length + 1, endPosition);
      }
    }
  }
  return null;
};

class ErrorWithCode extends Error {
  constructor(code, name, message, hint) {
    super(message || '未知错误');
    if (code instanceof Error) {
      this.stack = code.stack;
      this.origin = code.message;
      this.name = 'UnknownError';
      this.hint = '服务器开小差了';
      this.code = 1; // unknown
    } else {
      this.name = cc.pascalCase(name);
      this.hint = hint;
      this.code = code;
    }
  }
  toJSON() {
    return {
      code: this.code,
      error: {
        name: this.name,
        message: this.message,
        hint: this.hint,
        origin: this.origin,
        position: getStackFirstPosition(this.stack),
      },
    };
  }
}

const createError = (caller, code, name, message, hint) => {
  const err = new ErrorWithCode(code, name, message, hint);
  Error.captureStackTrace(err, caller);
  return err;
};

const defineError = function(code, name, message = cc.sentenceCase(name)) {
  return _createError;

  /** @param {string} hint */
  function _createError(hint = undefined) {
    return createError(_createError, code, cc.pascalCase(name), hint || message, message);
  }
};

defineError.ErrorWithCode = ErrorWithCode;

module.exports = defineError;
