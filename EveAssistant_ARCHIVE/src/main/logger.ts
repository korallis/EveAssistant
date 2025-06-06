import log from 'electron-log';
// import * as Sentry from '@sentry/electron/main';

export function init() {
  // Sentry.init({
  //   dsn: 'your-sentry-dsn-goes-here',
  //   // Set tracesSampleRate to 1.0 to capture 100%
  //   // of transactions for performance monitoring.
  //   // We recommend adjusting this value in production
  //   tracesSampleRate: 1.0,
  // });

  log.transports.file.setLevel('info');
  log.transports.console.setLevel('debug');

  console.log = log.log;
  console.error = log.error;
  console.warn = log.warn;
  console.info = log.info;
  console.debug = log.debug;
}

export default log; 