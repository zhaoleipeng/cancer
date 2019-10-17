const fs = require('fs-extra');
const path = require('path');
const cc = require('change-case');
const yaml = require('js-yaml');
const parser = require('./lib/doc_parser_docs');

const compileApiDocs = () => {
  const servicesDir = path.join(__dirname, '../../src/services');
  const docsDir = path.join(__dirname, '../../docs/api');

  const spec = parser(servicesDir);
  if (spec.error) {
    throw new Error(spec.error);
  }
  fs.mkdirpSync(path.join(__dirname, '../../tmp/.compile'));
  fs.writeFileSync(
    path.join(__dirname, '../../tmp/.compile/spec.docs.json'),
    JSON.stringify(spec, 0, 2),
    'utf-8'
  );
};

module.exports = () => {
  compileApiDocs();
  // compileSocketDocs();
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
  return title ? `${title} (${name})` : `${name}`;
}
