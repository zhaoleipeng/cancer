'use strict';

const log = require('xxd-log');
const cnf = require('config').get('db');

const fullCommand = process.argv.join(' ');
if (
  fullCommand.includes('sequelize') &&
  fullCommand.includes('db:migrate') &&
  !fullCommand.includes('gulp')
) {
  log.info(
    'Database using:',
    log.chalk.cyan(
      `${cnf.dialect}://${cnf.username}:${cnf.password}@${cnf.host}:${cnf.port}/${cnf.database}`
    )
  );
}

cnf.dialect = 'mysql';
cnf.timezone = '+08:00';
cnf.seederStorage = 'sequelize';

module.exports = { production: cnf };
