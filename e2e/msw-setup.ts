import { Page } from '@playwright/test';
import { handlers } from '../src/mocks/handlers';

/**
 * Injects MSW into the Playwright browser context
 * This allows our E2E tests to use the same mock handlers as our unit tests
 */
export async function setupMockServiceWorker(page: Page): Promise<void> {
  // Load the MSW library from CDN
  await page.addScriptTag({
    url: 'https://unpkg.com/msw/lib/browser/index.js',
  });

  // Initialize MSW in the browser
  await page.addScriptTag({
    content: `
      // Convert our Node.js handlers to browser-compatible format
      const handlers = ${JSON.stringify(handlers, (key, value) => {
        if (typeof value === 'function') {
          // This is a simplified approach - complex handlers may need manual adaptation
          return value.toString();
        }
        return value;
      })};
      
      // Parse the stringified handlers back to functions
      const parsedHandlers = handlers.map(handler => {
        // This is a simplified parsing approach
        if (typeof handler === 'string' && handler.includes('function')) {
          return eval('(' + handler + ')');
        }
        return handler;
      });

      // Setup MSW worker
      const worker = window.msw.setupWorker(...parsedHandlers);
      
      // Start the worker
      worker.start({ onUnhandledRequest: 'bypass' })
        .then(() => console.log('MSW initialized in E2E test'))
        .catch(error => console.error('Failed to initialize MSW:', error));
    `,
  });

  // Wait for MSW to initialize
  await page.waitForFunction(() => window['msw'] && window['msw'].worker);
}

/**
 * Utility to add a custom request handler during a test
 */
export async function addRequestHandler(page: Page, method: string, url: string, responseData: any, status = 200): Promise<void> {
  await page.evaluate(
    ({ method, url, responseData, status }) => {
      // Add a custom handler to the worker
      window['msw'].worker.use(
        window['msw'][method](url, (req, res, ctx) => {
          return res(ctx.status(status), ctx.json(responseData));
        })
      );
    },
    { method, url, responseData, status }
  );
} 