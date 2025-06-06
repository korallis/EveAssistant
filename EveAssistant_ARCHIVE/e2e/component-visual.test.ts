import { test, expect } from '@playwright/test';

// Ensure consistent viewport for all tests
test.use({ viewport: { width: 1280, height: 720 } });

test.describe('Component Visual Tests', () => {
  // Before each test, navigate to the test site
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.evemarketer.com/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('Page title section', async ({ page }) => {
    // Try to find a title section, falling back to body if not found
    const titleSection = await page.locator('h1').first();
    
    if (await titleSection.count() > 0) {
      await expect(titleSection).toHaveScreenshot('title-section.png');
    } else {
      const fallback = await page.locator('body > div').first();
      await expect(fallback).toHaveScreenshot('top-section.png');
    }
  });

  test('Navigation section', async ({ page }) => {
    // Try to find a navigation section
    const navSection = await page.locator('nav, [role="navigation"]').first();
    
    if (await navSection.count() > 0) {
      await expect(navSection).toHaveScreenshot('navigation-section.png');
    } else {
      test.skip('Navigation section not found');
    }
  });

  test('Page content area', async ({ page }) => {
    // Take screenshot of the main page area (more reliable)
    // Captures a specific region of the page rather than trying to find a specific element
    const pageRegion = page.locator('body');
    await expect(pageRegion).toHaveScreenshot('page-content.png');
  });

  test('Button styles', async ({ page }) => {
    // Find buttons to test their appearance
    const buttons = await page.locator('button, a.btn, input[type="button"]').first();
    
    if (await buttons.count() > 0) {
      await expect(buttons).toHaveScreenshot('button-styles.png');
    } else {
      // If no buttons found, take a screenshot of any clickable element
      const links = await page.locator('a').first();
      if (await links.count() > 0) {
        await expect(links).toHaveScreenshot('link-styles.png');
      } else {
        test.skip('No interactive elements found to test');
      }
    }
  });
}); 