import { test, expect } from '@playwright/test';
import { setupMockServiceWorker, addRequestHandler } from './msw-setup';

// Example URL for the test - this could be a webpage inside our Electron app
const TEST_URL = 'https://example.com';

test.describe('API Mocking with MSW in E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up MSW for this test
    await setupMockServiceWorker(page);
    
    // Navigate to the test page
    await page.goto(TEST_URL);
  });

  test('intercepts API requests with MSW', async ({ page }) => {
    // Add a custom handler for a specific endpoint
    await addRequestHandler(
      page,
      'get',
      'https://esi.evetech.net/latest/characters/12345/skills/',
      {
        skills: [
          { skill_id: 1234, active_skill_level: 5, trained_skill_level: 5 },
          { skill_id: 5678, active_skill_level: 4, trained_skill_level: 4 }
        ],
        total_sp: 10000000,
        unallocated_sp: 5000
      }
    );

    // Execute a fetch request on the page and capture the result
    const response = await page.evaluate(async () => {
      const response = await fetch('https://esi.evetech.net/latest/characters/12345/skills/');
      return response.json();
    });

    // Verify the response was intercepted and mocked by MSW
    expect(response).toHaveProperty('skills');
    expect(response.skills).toHaveLength(2);
    expect(response.total_sp).toBe(10000000);
  });

  test('handles API error responses with MSW', async ({ page }) => {
    // Add a custom handler that returns an error
    await addRequestHandler(
      page,
      'get',
      'https://esi.evetech.net/latest/characters/12345/skills/',
      { error: 'Forbidden' },
      403
    );

    // Execute a fetch request on the page and check the status
    const status = await page.evaluate(async () => {
      const response = await fetch('https://esi.evetech.net/latest/characters/12345/skills/');
      return response.status;
    });

    // Verify the response was intercepted and returned with the mocked error status
    expect(status).toBe(403);
  });
}); 