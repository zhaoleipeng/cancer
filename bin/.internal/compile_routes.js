const fs = require('fs-extra');
const path = require('path');
const cc = require('change-case');
const log = require('xxd-log');
const _ = require('lodash');
const qs = require('querystring');
const stringifyObject = require('stringify-object');
const prettier = require('prettier');
const parser = require('./lib/doc_parser');

const localMiddleware = m => `../middlewares/${cc.snakeCase(m)}`;

module.exports = () => {
  const servicesDir = path.join(__dirname, '../../src/services');
  const routesDir = path.join(__dirname, '../../src/routes');

  const spec = parser(servicesDir);
  if (spec.error) {
    throw new Error(spec.error);
  }
  fs.mkdirpSync(path.join(__dirname, '../../tmp/.compile'));
  fs.writeFileSync(
    path.join(__dirname, '../../tmp/.compile/spec.json'),
    JSON.stringify(spec, 0, 2),
    'utf-8'
  );

  let count = 0;
  let middlewareMap = new Map();
  const defs = [];
  for (const mod of spec.modules) {
    defs.push(defineRoutes(mod));
  }
  const result = prettier.format(defineIndex(defs), require('../../.prettierrc.json'));
  const indexFile = path.join(routesDir, 'index.js');
  fs.mkdirpSync(routesDir);
  fs.writeFileSync(indexFile, result, 'utf-8');

  log.info(`[Compile routes] Finished. Success compile ${count} routes.`);

  function defineRoutes(mod) {
    const lines = [];

    const modMiddlewares = Array.from(mod.middlewares || []);

    lines.push(`// Routes for service ${getName(mod)}`);
    for (const action of actionSort(mod.actions)) {
      const { filename, funcname } = action;

      const middlewares = modMiddlewares.concat(Array.from(action.middlewares || []));
      const middlewareCalls = [];
      for (const middleware of middlewares) {
        if (middleware.mismatch !== undefined) {
          continue;
        }
        const name = cc.camelCase(middleware.name);
        const args = middleware.args;
        let argv = [];
        if (args && args.trim()) {
          try {
            argv = JSON.parse('[' + args + ']');
          } catch (err) {
            throw new Error('Cannot decode middleware options: ' + args);
          }
        }
        middlewareMap.set(name, localMiddleware(name));
        middlewareCalls.push(`${name}(${stringifyParams(argv)})`);
      }

      let { method, path } = action.route;
      if (!filename || !funcname) {
        throw new Error(`Cannot locate service ${method} ${path}`);
      }
      path = getRoutePath(path, action);
      method = method.toLowerCase();
      const args = [];
      args.push(quote(path));
      if (middlewareCalls.length > 0) {
        args.push(middlewareCalls.join(', '));
      }
      args.push(`hs(s.${cc.camelCase(filename)}, ${quote(funcname)})`);

      if (method === 'any') {
        method = 'all';
      } // Map 'any' to 'router.all()'
      if (method.indexOf('|') !== -1) {
        const methods = method
          .split('|')
          .map(t => t.trim())
          .filter(t => t);
        for (const singleMethod of methods) {
          if (!isMethod(singleMethod)) {
            throw new Error(`Unsupported method '${singleMethod}'`);
          }
          lines.push(`r.${singleMethod}(${args.join(', ')}); // ${getName(action)}`);
          count++;
        }
      } else {
        if (!isMethod(method)) {
          throw new Error(`Unsupported method '${method}'`);
        }
        lines.push(`r.${method}(${args.join(', ')}); // ${getName(action)}`);
        count++;
      }
    }

    return lines.join('\n');
  }

  function defineIndex(defs) {
    const lines = [];

    lines.push('/*');
    lines.push(' * !!! Do not change this file !!!');
    lines.push(' * Because this file is auto generated,');
    lines.push(' * Any changes you make will be overwriten.');
    lines.push(' */');
    lines.push('');
    lines.push("const Router = require('koa-router');");
    lines.push("const middlewares = require('./middlewares');");
    lines.push("const hs = require('../common/handle_service');");
    lines.push("const s = require('../services');");
    for (const [m, p] of middlewareMap.entries()) {
      lines.push(`const ${cc.camelCase(m)} = require('${p}');`);
    }
    lines.push('');
    lines.push('const r = new Router();');
    lines.push('');
    lines.push('middlewares.apply(r);');
    lines.push('');
    if (defs.length > 0) {
      lines.push(defs.join('\n\n'));
    }
    lines.push('');
    lines.push('module.exports = r;');
    lines.push('');

    return lines.join('\n');
  }
};

if (require.main === module) {
  module.exports();
}

function removeHash(str) {
  return str.replace(/-[A-Fa-f0-9]{6}(?:-\d+)?$/, '');
}

function getName(obj) {
  const title = obj.title;
  const name = cc.camelCase(removeHash(obj.name));
  return title ? `"${title}" (${name})` : `(${name})`;
}

function isMethod(str) {
  return ['get', 'post', 'put', 'delete', 'del', 'patch', 'all'].some(method => method === str);
}

function quote(str) {
  let quoted = JSON.stringify(`${str}`);
  quoted = quoted.slice(1, -1);
  quoted.replace(/'/g, "\\'");
  quoted.replace(/\\"/g, '"');
  return `'${quoted}'`;
}

function parseQueryString(str) {
  const res = qs.parse(str);
  for (const key of Object.keys(res)) {
    const value = res[key].trim();
    if (value === 'true' || value === 'false') {
      res[key] = value === 'true';
    }
    if (/^\d+(?:[\d.]*)$/.test(value)) {
      res[key] = Number(value) || value;
    }
  }
  return res;
}

function stringifyParams(params) {
  if (!Array.isArray(params)) {
    params = [params];
  }
  const arrayString = stringifyObject(params, {
    inlineCharacterLimit: Number.MAX_SAFE_INTEGER,
  });
  return arrayString.slice(1, -1);
}

function getRoutePath(path, action) {
  if (path.length > 1 && path.slice(-1) === '/') {
    path = path.slice(0, -1);
  }
  for (let param of (action && action.params) || []) {
    if (param.mismatch !== undefined) {
      continue;
    }
    if (param.type === 'number') {
      path = path.replace(new RegExp(`:${param.name}\\b`), `:${param.name}(\\d+)`);
    }
    if (param.type === 'uuid') {
      path = path.replace(
        new RegExp(`:${param.name}\\b`),
        `:${param.name}([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})`
      );
    }
  }
  return path;
}

function actionSort(actions) {
  const methods = ['get', 'post', 'put', 'delete', 'all'];
  return _.orderBy(
    actions,
    [
      action => methods.indexOf(action.route.method.toLowerCase()),
      action => action.route.path.replace(/:\w+\b/g, '').length,
    ],
    ['asc', 'desc']
  );
}
