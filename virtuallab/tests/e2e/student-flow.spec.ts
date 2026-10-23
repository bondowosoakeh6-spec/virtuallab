import { test, expect, Page } from '@playwright/test';

async function loginAsStudent(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"], input[name="email"]', 'mahasiswa1@virtuallab.ac.id');
  await page.fill('input[type="password"]', 'siswa123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard**', { timeout: 15000 });
}

test.describe('Student Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
  });

  test('student dashboard loads', async ({ page }) => {
    await expect(page.url()).toContain('/dashboard');
    await expect(page.locator('text=Dashboard, text=VirtualLab').first()).toBeVisible();
  });

  test('navigate to praktikum page', async ({ page }) => {
    await page.click('a[href="/dashboard/praktikum"]');
    await page.waitForURL('**/praktikum**');
    await expect(page.url()).toContain('/praktikum');
  });

  test('navigate to nilai page', async ({ page }) => {
    await page.click('a[href="/dashboard/nilai"]');
    await page.waitForURL('**/nilai**');
    await expect(page.url()).toContain('/nilai');
  });

  test('navigate to kelas page', async ({ page }) => {
    await page.click('a[href="/dashboard/kelas"]');
    await page.waitForURL('**/kelas**');
    await expect(page.url()).toContain('/kelas');
  });

  test('navigate to profile page', async ({ page }) => {
    await page.click('a[href="/dashboard/profile"]');
    await page.waitForURL('**/profile**');
    await expect(page.url()).toContain('/profile');
  });
});
