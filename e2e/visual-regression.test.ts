import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  // Set a consistent viewport for all tests to ensure consistent screenshots
  test.use({ viewport: { width: 1280, height: 720 } });

  test('Main window basic layout', async ({ page }) => {
    // Navigate to a page we can test
    await page.goto('https://www.evemarketer.com/');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('domcontentloaded');
    
    // Take a screenshot of the main page
    await expect(page).toHaveScreenshot('eve-marketer-main.png');
  });
  
  // Test that the page maintains appearance when resized
  test('Responsive design', async ({ page }) => {
    // Navigate to a page we can test
    await page.goto('https://www.evemarketer.com/');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('domcontentloaded');
    
    // Resize to a different dimension to test responsive design
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Take a screenshot with different dimensions
    await expect(page).toHaveScreenshot('eve-marketer-responsive.png');
  });

  // Test upper portion of the page
  test('Page header section', async ({ page }) => {
    await page.goto('https://www.evemarketer.com/');
    await page.waitForLoadState('domcontentloaded');
    
    // Take a screenshot of the top 200px of the page
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    
    // This will capture the top portion of the page without relying on specific element selectors
    await expect(page).toHaveScreenshot('page-header-section.png', {
      clip: { x: 0, y: 0, width: 1280, height: 200 }
    });
  });
}); 