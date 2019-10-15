const log = require('xxd-log');
const Axios = require('axios');
const inspect = require('util').inspect;
const config = require('config');
const pathToRegexp = require('path-to-regexp');
const aes = require('../src/common/aes');

log.withTimestamp = false;

/** @type {Axios.AxiosInstance} */
const axios = Axios.create();

axios.defaults.responseType = 'arraybuffer';

const local = {};
const defineEnv = (name, defaultValue) =>
  Object.defineProperty(global, name, {
    get() {
      return local[name] || defaultValue;
    },
    set(value) {
      local[name] = value;
    },
  });
defineEnv('protocol', 'http');
defineEnv('host', '127.0.0.1');
defineEnv('port', config.get('port'));
defineEnv('token', null);

const handleResponse = res => {
  const data = res.data;
  if (data.code !== 0) {
    log.error(`Response: ${res.status}, Code: ${data.code}`);
    log.error(`ResError: ${inspect(data.error)}`);
    return undefined;
  }
  log.trace(`Response: ${res.status}, Code: ${data.code}`);
  return data.data;
};
const handleError = err => {
  const res = err.response;
  if (res) {
    const data = res.data;
    if (data.code !== 0) {
      log.error(`Response: ${res.status}, Code: ${data.code}`);
      log.error(`ResError: ${inspect(data.error)}`);
      return undefined;
    }
    log.trace(`Response: ${res.status}, Code: ${data.code}`);
    return data.data;
  }
  log.error(err.message);
  return undefined;
};

const request = (method, url, data) => {
  data = Object.assign({}, data);
  url = pathToRegexp.compile(url)(data);
  const baseURL = `${global.protocol}://${global.host}:${global.port}`;

  // const headers = {
  // };

  let body;
  if (method === 'post' || method === 'put') {
    body = data;
  }
  let params;
  if (method === 'get' || method === 'delete') {
    params = { data };
  }
  log.debug(`Request: ${method.toUpperCase()} ${baseURL}${url}`);
  log.debug(`ReqData: ${inspect(data, { colors: true, depth: null })}`);
  return axios({ method, url, baseURL, data: body, params }).then(
    handleResponse,
    handleError
  );
};

const Request = Object.freeze({
  get: (url, data) => request('get', url, data),
  post: (url, data) => request('post', url, data),
  put: (url, data) => request('put', url, data),
  delete: (url, data) => request('delete', url, data),
});

Object.defineProperty(global, 'request', {
  value: Request,
  enumerable: true,
});

module.exports = Request;

log.info(`Use ${log.chalk.cyan('await request.get(url, params)')} etc. to perform request.`);
log.info(`Example: await request.get('/user/:id', { id: 4, withStories: true });`);
