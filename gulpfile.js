const gulp = require('gulp');
const log = require('xxd-log');
const killPort = require('kill-port');
const cp = require('child_process');
const readline = require('readline');

const requireDynamic = packagePath => {
  delete require.cache[require.resolve(packagePath)];
  return require(packagePath); // eslint-disable-line
};

let server;

gulp.task('compile-errors', () => {
  requireDynamic('./bin/.internal/compile_errors')();
});

gulp.task('compile-routes', () => {
  requireDynamic('./bin/.internal/compile_routes')();
});

gulp.task('compile-services', () => {
  requireDynamic('./bin/.internal/compile_services')();
});

gulp.task('compile-docs', () => {
  requireDynamic('./bin/.internal/compile_docs')();
});

gulp.task('compile', [
  'compile-errors',
  'compile-services',
  'compile-routes',
  'compile-docs',
]);

gulp.task('watch', ['compile'], () => {
  gulp.watch(
    ['package.json', 'src/services/*.js', '!src/services/index.js'],
    ['compile-services', 'compile-routes', 'compile-docs']
  );
  gulp.watch(['src/socket/*.docs.yaml'], ['compile-docs']);
  gulp.watch(['src/common/errors.yaml'], ['compile-errors']);
});

gulp.task('watch-server', () => {
  gulp.watch(
    ['package.json', 'src/services/*.js', '!src/services/index.js'],
    ['compile-services', 'compile-routes', 'compile-docs', 'server']
  );
  gulp.watch(['src/socket/*.docs.yaml'], ['compile-docs', 'server']);
  gulp.watch(['src/common/errors.yaml'], ['compile-errors', 'server']);
  gulp.watch(
    [
      'src/**/*',
      '!src/services/*.js',
      '!src/routes/index.js',
      '!src/socket/*.docs.yaml',
      '!src/common/errors.js',
      '!src/common/errors.yaml',
    ],
    ['server']
  );
});

gulp.task('dev', ['compile', 'watch-server', 'server']);

const setupServerControls = () => {
  if (global.isServerControlsSetup) {
    return;
  }
  global.isServerControlsSetup = true;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on('SIGINT', () => {
    process.emit('SIGINT');
  });

  rl.on('line', input => {
    input = input.trim();
    if (input === 'R') {
      log.trace('Restarting server ...');
      startServer();
    }
    if (input === 'K') {
      const port = requireDynamic('config').get('port');
      log.trace(`Killing process using port ${port} ...`);
      killPort(port);
      setTimeout(startServer, 500);
    }
  });

  log.info('Press R + Enter to restart server.');
  log.info('Press K + Enter to kill the process using server port.');
};
const startServer = () => {
  setupServerControls();
  if (server) {
    server.kill();
  }
  server = cp.fork('./index.js', [], { cwd: process.cwd(), env: process.env });
  server.on('close', (code, signal) => {
    if (signal) {
      log.trace('Server is closed due to', signal);
      if (signal === 'SIGKILL') {
        process.exit();
      }
    }
    if (code) {
      log.warn('Server is closed with code', code);
    }
  });
};
gulp.task('server', startServer);

const exitHandler = () => {
  if (server && server.connected) {
    server.kill('SIGKILL');
  } else {
    process.exit();
  }
};

process.on('SIGINT', exitHandler);
process.on('SIGTERM', exitHandler);
process.on('SIGHUP', exitHandler);
