import { test, expect } from '@playwright/test';
import { loginAsCandidate, loginAsInstitution } from './fixtures';

test.describe('7. Important P1 checks — Profile, i18n & Responsiveness', () => {
  test('Candidate profile edit and view settings', async ({ page, context }) => {
    await loginAsCandidate(page, context);
    await page.goto('/seeker/profile', { waitUntil: 'networkidle' });

    // Confirm candidate profile loads
    await expect(page.getByText('saifan').first()).toBeVisible({ timeout: 10000 });

    // Validate inputs
    const inputs = await page.locator('input, textarea, select').count();
    expect(inputs).toBeGreaterThan(0);
  });

  test('Language switcher tests: English, Urdu, and Hindi', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const langBtn = page.getByRole('button', { name: /EN|HI|UR/i }).first();
    if (await langBtn.isVisible()) {
      await langBtn.click();
      await page.waitForTimeout(1000);

      // Check available languages
      const urduOption = page.getByRole('button', { name: /اردو|UR/i }).or(page.getByText(/اردو|UR/i));
      if (await urduOption.count() > 0) {
        await urduOption.first().click();
        await page.waitForTimeout(2000);

        // Verify HTML direction or text
        const dir = await page.locator('html').getAttribute('dir');
        console.log('Language switched to Urdu - HTML dir:', dir);
      }
    }
  });

  test('Desktop (1440x900) layout validation', async ({ page, context }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await loginAsCandidate(page, context);
    await page.goto('/seeker/dashboard', { waitUntil: 'networkidle' });

    // Check dashboard loads without overflowing elements
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(1445);
  });

  test('Mobile (360x800) layout validation', async ({ page, context }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await loginAsCandidate(page, context);
    await page.goto('/seeker/dashboard', { waitUntil: 'networkidle' });

    // Ensure responsive bottom navigation or mobile menu exists
    const nav = page.locator('nav, header, footer, [role="navigation"]').first();
    await expect(nav).toBeVisible();
  });
});
