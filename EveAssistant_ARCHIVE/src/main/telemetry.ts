import Store from 'electron-store';

const store = new Store({ name: 'telemetry' });

export function initializeTelemetry() {
  const launchCount = store.get('launchCount', 0) as number;
  store.set('launchCount', launchCount + 1);
} 