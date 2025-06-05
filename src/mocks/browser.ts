import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// This configures a Service Worker with the given request handlers
export const worker = setupWorker(...handlers)

// Start the MSW worker for browser environment
export async function startMockServiceWorker(options = { onUnhandledRequest: 'bypass' as const }) {
  if (process.env.NODE_ENV === 'development' || process.env.MOCK_API === 'true') {
    console.log('Starting Mock Service Worker for browser environment...')
    await worker.start(options)
    return true
  }
  return false
} 