# API Mocking System

This directory contains the API mocking system for EveAssistant, built using [Mock Service Worker (MSW)](https://mswjs.io/).

## Overview

We use MSW to intercept API requests during development and testing, allowing us to:

1. Develop UI components without relying on actual API endpoints
2. Test components and services with controlled API responses
3. Simulate error conditions, loading states, and edge cases
4. Run tests without network connectivity

## Directory Structure

- `handlers.ts` - Contains all request handlers grouped by API type (ESI, Auth, SDE)
- `browser.ts` - Browser-specific setup for Electron renderer process
- `node.ts` - Node.js setup for Electron main process and Jest tests
- `index.ts` - Main entry point with auto-detection for environment

## Usage in Tests

### Unit/Integration Tests

```typescript
import { server } from '../mocks';
import { http, HttpResponse } from 'msw';

// Setup MSW server for the test suite
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
});

// Clean up after all tests
afterAll(() => {
  server.close();
});

it('should handle API response', async () => {
  // Override handler for this specific test
  server.use(
    http.get('https://esi.evetech.net/latest/endpoint', () => {
      return HttpResponse.json({ custom: 'response' });
    })
  );
  
  // Your test logic here
});
```

### E2E Tests with Playwright

For E2E tests, we use a different approach:

```typescript
import { test, expect } from '@playwright/test';
import { worker } from '../mocks/browser';

test.beforeEach(async ({ page }) => {
  // Initialize MSW in the browser context
  await page.addInitScript({
    content: `
      window.msw = {
        worker: ${worker.toString()},
        rest: ${JSON.stringify(handlers)}
      };
      window.msw.worker.start();
    `
  });
});

test('handles API interaction', async ({ page }) => {
  // Test logic here
});
```

## Adding New Mock Handlers

Add new mock handlers to the appropriate group in `handlers.ts`:

```typescript
export const esiHandlers = [
  // Existing handlers...
  
  // New handler
  http.get('https://esi.evetech.net/latest/new-endpoint', () => {
    return HttpResponse.json({
      // Mock response data
    });
  })
];
```

## Running with Mocks Enabled

- **Tests**: MSW is automatically configured in the test environment
- **Development**: Set `MOCK_API=true` in your `.env` file or environment
- **Manual Toggle**: Use `initializeMocks()` from the index file

## Mock Data Guidelines

1. Match the actual API structure as closely as possible
2. Use realistic but predictable values
3. Add delays with `await delay(ms)` to simulate real network latency
4. For complex endpoints, store mock data in separate files

## Troubleshooting

- If you see `Request not handled` warnings, add a handler for that endpoint
- Use `{ onUnhandledRequest: 'bypass' }` to ignore unhandled requests
- For browser issues, check browser console for MSW-related errors 