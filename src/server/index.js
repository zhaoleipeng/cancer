const http = require('http');
const log = require('xxd-log');
const config = require('config');

log.trace(`Server is starting with NODE_ENV=${log.chalk.magenta(process.env.NODE_ENV || '')}`);

const ms = require('pretty-ms');
const app = require('./app');
// const socket = require('../socket');

const server = http.createServer();
server.on('request', app.callback());
// socket.setup(server);

const port = config.get('port');

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    log.error(`Failed to listen port ${port}.`, err.stack || err);
  } else {
    log.error(err.stack);
  }
});

server.listen(port, '0.0.0.0', () => {
  if (process.send) {
    process.send('ready');
  }
  log.trace('Server is up in', log.chalk.cyan(ms(process.uptime() * 1000)));
  log.info(`Start to listen port ${log.chalk.magenta(port)}`);
  log.info(`API document is available at ${log.chalk.cyan(`http://localhost:${port}/doc/`)}`);
});
