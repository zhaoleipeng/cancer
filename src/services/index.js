/*
 * !!! Do not change this file !!!
 * Because this file is auto generated,
 * Any changes you make will be overwriten.
 */

const handleError = require('../common/handle_error');

/**
 * @application cancer
 * @version 1.0.0
 * @description 快速部署node架子，自带API文档，router生成，migrate功能。
 * @author
 */
module.exports = {
  get mock() {
    const MockService = require('./mock');
    const mockService = new MockService();
    delete this.mock;
    this.mock = mockService;
    return mockService;
  },
};

setTimeout(() => {
  (async () => {
    if (process.env.LOAD_ALL_LAZY_PROPERTIES) {
      for (const key of Object.keys(module.exports)) {
        try {
          module.exports[key]; // eslint-disable-line
        } catch (err) {
          handleError(err);
        }
      }
    }
  })().catch(err => handleError(err));
}, 0);
