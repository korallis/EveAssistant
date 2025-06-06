// Export all handler groups
export * from './handlers'

// Export browser and node setups
export { worker, startMockServiceWorker } from './browser'
export { server, startMockServer, stopMockServer, resetMockServer } from './node'

// Main entry point to initialize mocks based on environment
export function initializeMocks() {
  if (typeof window !== 'undefined') {
    // Browser environment (Electron renderer process)
    const { startMockServiceWorker } = require('./browser')
    return startMockServiceWorker()
  } else {
    // Node.js environment (Electron main process or tests)
    const { startMockServer } = require('./node')
    return startMockServer()
  }
} 