'use strict';

/* eslint no-console: 0 */

const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
const chalk = require('chalk');
const cc = require('change-case');

const migrationsDir = path.join(__dirname, '../../src/models/migrations');

const timestamp = moment().format('YYYYMMDDHHmmss');
let name = 'unnamed';
const args = process.argv.slice(2);
if (args.length > 0) {
  name = cc.paramCase(args.join(' '));
}

const filename = `${timestamp}-${name}-migration.js`;
const filepath = path.join(migrationsDir, filename);

const camelName = cc.camelCase(name);

const content = `module.exports = {
  /**
   * @param {QueryInterface} migration
   * @param {SequelizeDataTypes} Sequelize
   */
  up: async (migration, Sequelize) => {
    /*
      Add altering commands here.
      Don't forget keyword \`await\` before command calls.

      Example:
      await migration.createTable('${camelName}', { id: Sequelize.INTEGER });
    */
  },

  /**
   * @param {QueryInterface} migration
   * @param {SequelizeDataTypes} Sequelize
   */
  down: async (migration, Sequelize) => {
    /*
      Add reverting commands here.
      Don't forget keyword \`await\` before command calls.
      Generally, use reverse commands in reverse order from \`up\`.

      Example:
      await migration.dropTable('${camelName}');
    */
  },
};
`;

fs.mkdirpSync(migrationsDir);
console.log(`Successfully created migrations folder at "${migrationsDir}"`);
fs.writeFileSync(filepath, content, 'utf-8');
console.log(`New migration was created at ${chalk.blue(filepath)}`);
