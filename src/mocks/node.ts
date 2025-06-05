import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// This configures a request mocking server with the given request handlers
export const server = setupServer(...handlers)

// Start the MSW server for Node.js environment
export function startMockServer() {
  if (process.env.NODE_ENV === 'test' || process.env.MOCK_API === 'true') {
    console.log('Starting Mock Service Worker server for Node.js environment...')
    server.listen({ onUnhandledRequest: 'bypass' })
    return true
  }
  return false
}

// Stop the MSW server
export function stopMockServer() {
  server.close()
}

// Reset the MSW server (for use between tests)
export function resetMockServer() {
  server.resetHandlers()
} 