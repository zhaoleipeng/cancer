'use strict';

const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const log = require('xxd-log');
const prettier = require('prettier');
const entries = require('lodash/entries');

module.exports = () => {
  const definitionFile = path.join(__dirname, '../../src/common/errors.yaml');
  const definition = fs.readFileSync(definitionFile, 'utf-8');

  const outputFile = path.join(__dirname, '../../src/common/errors.js');

  const keyPattern = /^[1-9][0-9]*#[A-Za-z_][A-Za-z0-9_]*$/;

  const lines = [
    '/*',
    ' * !!! Do not change this file !!!',
    ' * Because this file is auto generated,',
    ' * Any changes you make would be overwriten.',
    ' */',
    '',
    "const defineError = require('../.internal/define_error');",
    '',
    'exports.Error = defineError.ErrorWithCode;',
    '',
  ];

  const data = yaml.safeLoad(definition);

  const errors = parseErrors(data);
  let lastSection = '';
  for (const [id, name, message] of errors) {
    const section = id.slice(0, -2);
    if (section !== lastSection) {
      lines.push('');
      lines.push('');
      lastSection = section;
    }
    lines.push(`/** (${id}) ${message} */`);
    lines.push(`exports.${name} = defineError(${id}, ${quote(name)}, ${quote(message)});`);
  }

  lines.push('');

  const output = prettier.format(lines.join('\n'), require('../../.prettierrc.json'));
  fs.writeFileSync(outputFile, output, 'utf-8');
  log.info(`[Compile errors] Finished. Success compile ${errors.length} errors.`);

  function parseErrors(object) {
    const errors = [];
    const names = new Set();
    for (const [key, message] of entries(object)) {
      if (!keyPattern.test(key)) {
        throw new Error(
          `[Compile errors] Key '${key}' is not valid, expect <digits>#<identifier> (/${
            keyPattern.source
          }/)`
        );
      }
      const [id, name] = key.split('#');
      if (names.has(name)) {
        throw new Error(
          `[Compile errors] Name '${name}' is duplicated, please ensure every name is unique.`
        );
      }
      names.add(name);
      errors.push([id, name || id, message]);
    }
    return errors;
  }

  function quote(str) {
    return `'${(str || '').replace(/'/g, "\\'")}'`;
  }
};

if (require.main === module) {
  module.exports();
}
