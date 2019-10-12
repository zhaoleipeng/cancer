'use strict';

const cc = require('change-case');
const _ = require('lodash');
const log = require('xxd-log');
const fs = require('fs-extra');
const path = require('path');
const ProgressBar = require('progress');
const stringifyObject = require('stringify-object');
const prettier = require('prettier');
const db = require('../../src/common/db');
const modelPath = path.join(__dirname, '../../src/models/schemas');

const dbTypeMap = {
  INET: 'TEXT',
  INTERVAL: 'TEXT',
  INT: 'INTEGER',
};

const typeMap = {
  TEXT: 'TEXT',
  INTEGER: 'INTEGER',
  BIGINT: 'BIGINT',
  UUID: 'UUID',
  INT: 'INTEGER',
  'TIMESTAMP WITH TIME ZONE': 'DATE',
  ARRAY: 'ARRAY',
  'INTEGER[]': { type: ['ARRAY', 'INTEGER'], define: 'ARRAY(INTEGER)' },
  'TEXT[]': { type: ['ARRAY', 'TEXT'], define: 'ARRAY(TEXT)' },
  BOOLEAN: 'BOOLEAN',
  'DOUBLE PRECISION': 'DOUBLE',
  JSON: 'JSON',
  INET: 'TEXT',
  INTERVAL: 'TEXT',
  DATE: 'DATEONLY',
  JSONB: 'JSONB',
  SMALLINT: 'INTEGER',
  'CHARACTER VARYING(255)': 'STRING',
  'USER-DEFINED': attr => ({
    type: 'ENUM',
    define: `ENUM(${attr.special.map(value => `'${value}'`).join(', ')})`,
  }),
};

/**
 * 根据表名和字段名获取该字段再数据库中的真实类型
 * sequelize中获取array的类型的时候可能会存在问题，此处需要对其进行处理,返回必定是小写
 *
 * @param {string} tableName 表名称
 * @param {string} fieldName 字段名称
 */
async function getFieldTypeByTableAndFieldName(tableName, fieldName) {
  const result = await db.query(
    `SELECT col_description(a.attrelid,a.attnum) as comment,format_type(a.atttypid,a.atttypmod) as type 
 FROM pg_class as c,pg_attribute as a where c.relname = '${tableName}' and a.attrelid = c.oid and a.attnum>0 and a.attisdropped = false and a.attname = '${fieldName}'`,
    {
      type: db.QueryTypes.SELECT,
    }
  );
  const type = (result.length && result[0].type && result[0].type.toUpperCase()) || null;
  if (!type) {
    return type;
  }
  if (type.endsWith('[]') && !['INT[]', 'INTEGER[]', 'TEXT[]'].includes(type)) {
    let stype = type.slice(0, -2);
    stype = dbTypeMap[stype] || stype;
    if (!['INTEGER', 'TEXT'].includes(stype)) {
      throw new Error(`Unknown Type "${stype}"`);
    }
    if (!stype) {
      throw new Error(`Cannot handle type "${type}"`);
    }
    return `${stype}[]`;
  }
  return type;
}

async function describeModels() {
  const queryInterface = db.getQueryInterface();
  const tables = await queryInterface.showAllTables().filter(tableName => {
    if (['SequelizeMeta', 'SequelizeData'].includes(tableName)) {
      return false;
    }
    return true;
  });
  const models = [];
  const bar = new ProgressBar('[:bar] :percent :elapseds :etas', tables.length + 3);
  fs.removeSync(modelPath);
  bar.tick();
  fs.mkdirSync(modelPath);
  bar.tick();
  for (const tableName of tables) {
    const className = cc.pascalCase(tableName);
    const rawAttributes = await queryInterface.describeTable(tableName);
    const attributes = {};
    const options = {
      tableName,
      timestamps: false,
      paranoid: false,
      createdAt: false,
      updatedAt: false,
      deletedAt: false,
    };
    for (const rawName of Object.keys(rawAttributes)) {
      const name = cc.camelCase(rawName);
      attributes[name] = Object.assign(rawAttributes[rawName], { field: rawName });
      if (name === 'createdAt') {
        options.timestamps = true;
        options.createdAt = name;
      }
      if (name === 'updatedAt') {
        options.timestamps = true;
        options.updatedAt = name;
      }
      if (name === 'deletedAt') {
        options.timestamps = true;
        options.paranoid = true;
        options.deletedAt = name;
      }

      if (attributes[name].type === 'ARRAY') {
        attributes[name].type =
          (await getFieldTypeByTableAndFieldName(tableName, rawName)) || attributes[name].type;
      }
      if (typeof attributes[name].defaultValue === 'string') {
        if (attributes[name].primaryKey) {
          attributes[name]._$defaultValue = attributes[name].defaultValue;
          delete attributes[name].defaultValue;
          attributes[name].autoIncrement = true;
        } else if (/(\w+)\(\)/.test(attributes[name].defaultValue)) {
          const fn = attributes[name].defaultValue.match(/(\w+)\(\)/)[1];
          attributes[name].defaultValue = `db.fn('${fn}')`;
        } else if (
          /ARRAY|\[\]/.test(attributes[name].type) &&
          attributes[name].defaultValue === '{}'
        ) {
          attributes[name].defaultValue = [];
        } else if (
          /ARRAY|\[\]/.test(attributes[name].type) &&
          attributes[name].defaultValue === 'ARRAY[]'
        ) {
          attributes[name].defaultValue = [];
        } else if (
          /NUMERIC|DOUBLE|INT|FLOAT|DECIMAL/i.test(attributes[name].type) &&
          !Number.isNaN(Number(attributes[name].defaultValue))
        ) {
          attributes[name].defaultValue = Number(attributes[name].defaultValue);
        } else if (!/TEXT|CHAR/i.test(attributes[name].type)) {
          log.debug('Cannot handle defaultValue for', attributes[name]);
        }
      }
    }
    delete attributes.createdAt;
    delete attributes.updatedAt;
    delete attributes.deletedAt;
    // console.log(className, attributes, options);
    let basename = cc.snakeCase(className);
    if (basename === 'index') {
      basename = '_index';
    }
    const fileName = path.join(modelPath, `${basename}.js`);
    const fileContent = prettier.format(
      modelFileContent(className, attributes, options),
      require('../../.prettierrc.json')
    );
    models.push({ className, fileName });
    fs.writeFileSync(fileName, fileContent, 'utf-8');
    bar.tick();
  }
  const indexName = path.join(modelPath, 'index.js');
  const indexContent = prettier.format(indexFileContent(models), require('../../.prettierrc.json'));
  fs.writeFileSync(indexName, indexContent, 'utf-8');
  bar.tick();

  log.info('Finished. All models are synced from database.');

  function modelFileContent(className, attributes, options) {
    const types = _(attributes)
      .values()
      .map(attr => {
        let t = typeMap[attr.type];
        if (typeof t === 'function') {
          t = t(attr);
        }
        t = (t && t.type) || t;
        if (!t) {
          throw new Error(`Cannot handle type "${attr.type}"`);
        }
        return t;
      })
      .compact()
      .flatten()
      .uniq()
      .value();
    const desc = stringifyObject(attributes, {
      indent: '  ',
      transform: (o, k, v) => {
        if (k === 'type' && typeof o.allowNull === 'boolean') {
          let t = typeMap[o.type];
          if (typeof t === 'function') {
            t = t(o);
          }
          t = (t && t.define) || t;
          if (!t) {
            throw new Error(`Cannot handle type "${o.type}"`);
          }
          return `${t}`;
        }
        if (k === 'defaultValue' && /^db\./.test(o[k])) {
          return o[k];
        }
        return v;
      },
    });
    const lines = [];
    lines.push('/* eslint comma-dangle: off */');
    lines.push('');
    lines.push('/*');
    lines.push(' * !!! Do not change this file !!!');
    lines.push(' * Because this file is auto generated,');
    lines.push(' * Any changes you make would be overwriten.');
    lines.push(' */');
    lines.push('');
    lines.push("const db = require('../../common/db');");
    lines.push('');
    lines.push(`const { ${types.join(', ')} } = db.Sequelize;`);
    lines.push('');
    lines.push(
      `const ${className} = db.define('${cc.camelCase(className)}', ${desc}, ${singleQuote(
        JSON.stringify(options || {}, 0, 2)
      )});`
    );
    lines.push('');
    lines.push('// Define class methods directly on Model');
    lines.push(`// ${className}.someActionOnModel = function () {};`);
    lines.push('');
    lines.push("// Define instance methods on Model's prototype");
    lines.push(`// ${className}.prototype.someActionOnInstance = function () {};`);
    lines.push('');
    lines.push(`module.exports = ${className};`);
    lines.push('');
    return lines.join('\n');
  }

  function indexFileContent(models) {
    const lines = [];
    lines.push('/*');
    lines.push(' * !!! Do not change this file !!!');
    lines.push(' * Because this file is auto generated,');
    lines.push(' * Any changes you make would be overwriten.');
    lines.push(' */');
    lines.push('');
    lines.push('module.exports = {');
    for (const { fileName, className } of _.sortBy(models, 'className')) {
      lines.push(
        `  ${cc.camelCase(className)}: require('./${path.relative(modelPath, fileName)}'),`
      );
    }
    lines.push('};');
    lines.push('');
    return lines.join('\n');
  }
}

function singleQuote(text) {
  return text.replace(/\\?['"]/g, m => {
    switch (m) {
      case '"':
        return "'";
      case '\\"':
        return '"';
      case "'":
        return "\\'";
      default:
        return m;
    }
  });
}

module.exports = describeModels;

if (require.main === module) {
  describeModels().then(
    () => {
      db.close();
    },
    err => {
      db.close();
      console.error(err.stack || err); // eslint-disable-line
    }
  );
}
