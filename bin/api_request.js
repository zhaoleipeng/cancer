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
  const iv = res.headers['x-talk-enciv'];
  if (iv) {
    const decrypted = aes.decrypt(res.data, iv);
    const data = JSON.parse(decrypted.toString('utf-8'));
    if (data.code !== 0) {
      log.error(`Response: ${res.status}, Code: ${data.code}`);
      log.error(`ResError: ${inspect(data.error)}`);
      return undefined;
    }
    log.trace(`Response: ${res.status}, Code: ${data.code}`);
    return data.data;
  }
  log.error(`Response: ${res.status}, Not decrypted (no iv)`);
  return res.data.toString();
};
const handleError = err => {
  const res = err.response;
  if (res) {
    const iv = res.headers['x-talk-enciv'];
    if (iv) {
      const decrypted = aes.decrypt(res.data, iv);
      const data = JSON.parse(decrypted.toString('utf-8'));
      if (data.code !== 0) {
        log.error(`Response: ${res.status}, Code: ${data.code}`);
        log.error(`ResError: ${inspect(data.error)}`);
        return undefined;
      }
      log.trace(`Response: ${res.status}, Code: ${data.code}`);
      return data.data;
    }
    log.error(`Response: ${res.status}, Not decrypted (no iv)`);
    return res.data.toString();
  }
  log.error(err.message);
  return undefined;
};

const request = (method, url, data) => {
  data = Object.assign({}, data);
  url = pathToRegexp.compile(url)(data);
  const baseURL = `${global.protocol}://${global.host}:${global.port}`;
  const iv = aes.geniv();
  const buffer = Buffer.from(JSON.stringify(data));
  const encrypted = aes.encrypt(buffer, iv);
  const headers = {
    Accept: 'application/octet-stream',
    'x-talk-enciv': iv,
  };
  const token = global.token;
  if (token) {
    const tokiv = aes.geniv();
    const encryptedToken = aes.encrypt(Buffer.from(token, 'base64'), tokiv);
    headers['x-talk-token'] = encryptedToken.toString('base64');
    headers['x-talk-tokiv'] = tokiv;
  }
  let body;
  if (method === 'post' || method === 'put') {
    headers['Content-Type'] = 'application/octet-stream';
    body = encrypted;
  }
  let params;
  if (method === 'get' || method === 'delete') {
    params = { data: encrypted.toString('base64') };
  }
  log.debug(`Request: ${method.toUpperCase()} ${baseURL}${url}`);
  log.debug(`ReqData: ${inspect(data, { colors: true, depth: null })}`);
  return axios({ method, url, headers, baseURL, data: body, params }).then(
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
