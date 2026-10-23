import { test, expect, Page } from '@playwright/test';

async function loginAsInstructor(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"], input[name="email"]', 'dosen@virtuallab.ac.id');
  await page.fill('input[type="password"]', 'dosen123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard**', { timeout: 15000 });
}

test.describe('Instructor Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsInstructor(page);
  });

  test('instructor dashboard loads', async ({ page }) => {
    await expect(page.url()).toContain('/dashboard');
  });

  test('navigate to class management', async ({ page }) => {
    await page.click('a[href="/dashboard/kelas"]');
    await page.waitForURL('**/kelas**');
    await expect(page.url()).toContain('/kelas');
  });

  test('navigate to grading page', async ({ page }) => {
    await page.click('a[href="/dashboard/grading"]');
    await page.waitForURL('**/grading**');
    await expect(page.url()).toContain('/grading');
  });

  test('navigate to submissions page', async ({ page }) => {
    await page.click('a[href="/dashboard/submissions"]');
    await page.waitForURL('**/submissions**');
    await expect(page.url()).toContain('/submissions');
  });

  test('navigate to analytics page', async ({ page }) => {
    await page.click('a[href="/dashboard/analytics"]');
    await page.waitForURL('**/analytics**');
    await expect(page.url()).toContain('/analytics');
  });
});
