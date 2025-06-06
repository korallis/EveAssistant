import { test, expect, _electron as electron } from '@playwright/test';
import { glob } from 'glob';

test('App window is visible', async () => {
  const [executablePath] = await glob('out/eveassistant-win32-x64/eveassistant.exe');
  const electronApp = await electron.launch({
    executablePath,
  });
  const page = await electronApp.firstWindow();
  await expect(page.locator('body')).toBeVisible();
  await electronApp.close();
}); 