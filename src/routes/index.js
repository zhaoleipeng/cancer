/*
 * !!! Do not change this file !!!
 * Because this file is auto generated,
 * Any changes you make will be overwriten.
 */

const Router = require('koa-router');
const middlewares = require('./middlewares');
const hs = require('../common/handle_service');
const s = require('../services');

const r = new Router();

middlewares.apply(r);

// Routes for service "mock模块" (mock)
r.get('/mock/demo', hs(s.mock, 'mock')); // "获得个人信息" (getDemo)

module.exports = r;
