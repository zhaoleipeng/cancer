'use strict';

const fs = require('fs-extra');
const path = require('path');
const cc = require('change-case');
const log = require('xxd-log');
const prettier = require('prettier');

const requireDynamic = packagePath => {
  delete require.cache[require.resolve(packagePath)];
  return require(packagePath); // eslint-disable-line
};

module.exports = () => {
  const proj = requireDynamic('../../package.json');
  const servicesDir = path.join(__dirname, '../../src/services');

  const files = fs.readdirSync(servicesDir);

  const defs = [];
  for (const file of files) {
    if (file === 'index.js') {
      continue;
    }
    if (file.slice(0, 1) === '.') {
      continue;
    }
    if (file.slice(-3) !== '.js') {
      continue;
    }
    const name = path.basename(file, '.js');
    defs.push(defineService(name));
  }
  const result = prettier.format(defineIndex(defs), require('../../.prettierrc.json'));
  const indexFile = path.join(servicesDir, 'index.js');
  fs.mkdirpSync(servicesDir);
  fs.writeFileSync(indexFile, result, 'utf-8');

  log.info(`[Compile services] Finished. Success compile ${defs.length} service modules.`);

  function defineIndex(serviceDefinitions) {
    const lines = [];
    lines.push('/*');
    lines.push(' * !!! Do not change this file !!!');
    lines.push(' * Because this file is auto generated,');
    lines.push(' * Any changes you make will be overwriten.');
    lines.push(' */');
    lines.push('');
    lines.push("const handleError = require('../common/handle_error');");
    lines.push('');
    lines.push('/**');
    lines.push(` * @application ${proj.name}`);
    lines.push(` * @version ${proj.version}`);
    lines.push(` * @description ${(proj.description || '').replace(/\n/g, '\n *')}`);
    lines.push(` * @author ${proj.author}`);
    lines.push(' */');
    if (serviceDefinitions.length > 0) {
      lines.push('module.exports = {');
      lines.push(...serviceDefinitions);
      lines.push('};');
    } else {
      lines.push('module.exports = {};');
    }
    lines.push('');
    lines.push('setTimeout(() => {');
    lines.push('  (async () => {');
    lines.push('    if (process.env.LOAD_ALL_LAZY_PROPERTIES) {');
    lines.push('      for (const key of Object.keys(module.exports)) {');
    lines.push('        try {');
    lines.push('          module.exports[key]; // eslint-disable-line');
    lines.push('        } catch (err) {');
    lines.push('          handleError(err);');
    lines.push('        }');
    lines.push('      }');
    lines.push('    }');
    lines.push('  })().catch(err => handleError(err));');
    lines.push('}, 0);');
    lines.push('');

    return lines.join('\n');
  }

  function defineService(filename) {
    const lines = [];
    const name = cc.camelCase(filename);
    const serviceClass = cc.pascalCase(`${filename}_service`);
    const serviceName = cc.camelCase(`${filename}_service`);
    lines.push(`  get ${name}() {`);
    lines.push(`    const ${serviceClass} = require('./${filename}');`);
    lines.push(`    const ${serviceName} = new ${serviceClass}();`);
    lines.push(`    delete this.${name};`);
    lines.push(`    this.${name} = ${serviceName};`);
    lines.push(`    return ${serviceName};`);
    lines.push('  },');
    return lines.join('\n');
  }
};

if (require.main === module) {
  module.exports();
}
