const config = require('config');

if (config.env === 'local') {
  // require('longjohn');
  require('sequelize').Promise.config({ longStackTraces: true });
}
process.env.LOAD_ALL_LAZY_PROPERTIES = true;
require('./src/server');
