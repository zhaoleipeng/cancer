'use strict';

/* eslint no-console: 0 */

const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
const chalk = require('chalk');
const cc = require('change-case');

const seedersDir = path.join(__dirname, '../../src/models/seeders');

const timestamp = moment().format('YYYYMMDDHHmmss');
let name = 'unnamed';
const args = process.argv.slice(2);
if (args.length > 0) {
  name = cc.paramCase(args.join(' '));
}

const filename = `${timestamp}-${name}-seeder.js`;
const filepath = path.join(seedersDir, filename);

const content = `module.exports = {
  /**
   * @param {QueryInterface} seeder
   * @param {SequelizeDataTypes} Sequelize
   */
  up: async (seeder, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      await seeder.createTable(\`\${prefix}${cc.snakeCase(name)}\`, { id: Sequelize.INTEGER });
    */
  },

  /**
   * @param {QueryInterface} seeder
   * @param {SequelizeDataTypes} Sequelize
   */
  down: async (seeder, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      await seeder.dropTable(\`\${prefix}${cc.snakeCase(name)}\`);
    */
  },
};
`;

fs.mkdirpSync(seedersDir);
console.log(`Successfully created seeders folder at "${seedersDir}"`);
fs.writeFileSync(filepath, content, 'utf-8');
console.log(`New seeder was created at ${chalk.blue(filepath)}`);
