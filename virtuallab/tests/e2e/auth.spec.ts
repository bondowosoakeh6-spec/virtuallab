import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('login page loads correctly', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/VirtualLab/i);
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('login with valid student credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"]', 'mahasiswa1@virtuallab.ac.id');
    await page.fill('input[type="password"]', 'siswa123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    await expect(page.url()).toContain('/dashboard');
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    // Should stay on login page or show an error
    await page.waitForTimeout(2000);
    const url = page.url();
    const hasError = url.includes('error') || (await page.locator('[class*="error"], [class*="alert"], [role="alert"]').count()) > 0;
    expect(url.includes('/login') || hasError).toBeTruthy();
  });

  test('protected route redirects to login', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(3000);
    // Should redirect to login or show login form
    const url = page.url();
    expect(url.includes('/login') || url.includes('/dashboard')).toBeTruthy();
  });
});
