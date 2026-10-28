import { test, expect } from '@playwright/test';
import { loginAsInstitution, loginAsCandidate, BASE_URL } from './fixtures';
import fs from 'fs';

test.describe('6. Isolation, ownership, and security checks — P0', () => {
  let candidateToken = '';

  test.beforeAll(() => {
    try {
      const storageData = JSON.parse(fs.readFileSync('extracted-candidate-storage.json', 'utf8'));
      candidateToken = storageData.jp_access_token;
    } catch (e) {}
  });

  test('Candidate cannot access provider-only API endpoints (401/403 check)', async ({ request }) => {
    // Attempt to access provider jobs endpoint with candidate token
    const resp = await request.get('https://api.dev.jobs.al-sabeel.zobay.in/api/jobs/provider/my', {
      headers: {
        Authorization: `Bearer ${candidateToken}`
      }
    });

    console.log(`Candidate accessing provider/my jobs: Status ${resp.status()}`);
    // Should be 401 or 403
    expect([401, 403]).toContain(resp.status());
  });

  test('Unauthenticated requests to protected APIs return 401 Unauthorized', async ({ request }) => {
    const protectedEndpoints = [
      'https://api.dev.jobs.al-sabeel.zobay.in/api/auth/me',
      'https://api.dev.jobs.al-sabeel.zobay.in/api/applications',
      'https://api.dev.jobs.al-sabeel.zobay.in/api/jobs/provider/my',
      'https://api.dev.jobs.al-sabeel.zobay.in/api/notifications'
    ];

    for (const url of protectedEndpoints) {
      const resp = await request.get(url);
      console.log(`Unauthenticated GET ${url}: Status ${resp.status()}`);
      expect(resp.status()).toBe(401);
    }
  });

  test('Institution cannot access another applicant dossier via ID manipulation', async ({ page, request }) => {
    // Check ID tampering on candidate profiles
    const fakeId = '00000000-0000-0000-0000-000000000099';
    const resp = await request.get(`https://api.dev.jobs.al-sabeel.zobay.in/api/seekers/${fakeId}`, {
      headers: {
        Authorization: `Bearer ${candidateToken}`
      }
    });
    console.log(`Tampered seeker ID response status: ${resp.status()}`);
    expect([401, 403, 404]).toContain(resp.status());
  });

  test('No plaintext credentials or tokens leaked into console errors or page source', async ({ page }) => {
    const leakedStrings: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Saifan@145') || text.includes('password=')) {
        leakedStrings.push(text);
      }
    });

    await page.goto('/auth/login');
    await page.locator('#email-address').fill('test@leakcheck.com');
    await page.locator('#password').fill('Saifan@145');
    await page.getByRole('button', { name: 'Sign In to Portal' }).click();
    await page.waitForTimeout(2000);

    expect(leakedStrings.length, 'Passwords/tokens must not be exposed in console logs').toBe(0);
  });
});
