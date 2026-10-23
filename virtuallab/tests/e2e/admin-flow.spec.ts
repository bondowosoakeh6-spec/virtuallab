import { test, expect, Page } from '@playwright/test';

async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"], input[name="email"]', 'admin@virtuallab.ac.id');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard**', { timeout: 15000 });
}

test.describe('Admin Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('admin dashboard loads', async ({ page }) => {
    await expect(page.url()).toContain('/dashboard');
  });

  test('navigate to formula management', async ({ page }) => {
    await page.click('a[href="/dashboard/formulas"]');
    await page.waitForURL('**/formulas**');
    await expect(page.url()).toContain('/formulas');
  });

  test('navigate to user management', async ({ page }) => {
    await page.click('a[href="/dashboard/users"]');
    await page.waitForURL('**/users**');
    await expect(page.url()).toContain('/users');
  });

  test('navigate to chemistry database', async ({ page }) => {
    await page.click('a[href="/dashboard/chemistry"]');
    await page.waitForURL('**/chemistry**');
    await expect(page.url()).toContain('/chemistry');
  });

  test('navigate to audit log', async ({ page }) => {
    await page.click('a[href="/dashboard/audit-log"]');
    await page.waitForURL('**/audit-log**');
    await expect(page.url()).toContain('/audit-log');
  });
});
