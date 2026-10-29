import fs from 'fs';
import path from 'path';
import { Page, BrowserContext } from '@playwright/test';

export const BASE_URL = process.env.BASE_URL || 'https://dev.jobs.al-sabeel.zobay.in';

export const INSTITUTION_CREDS = {
  email: process.env.TEST_INSTITUTION_EMAIL || '',
  password: process.env.TEST_INSTITUTION_PASSWORD || '',
};

export const CANDIDATE_CREDS = {
  email: process.env.TEST_CANDIDATE_EMAIL || '',
  password: process.env.TEST_CANDIDATE_PASSWORD || '',
};

// Load extracted cached session if needed
let cachedStorage: any = null;
const cachePath = path.resolve('extracted-candidate-storage.json');
if (fs.existsSync(cachePath)) {
  try {
    cachedStorage = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  } catch (e) {}
}

// Load extracted cached institution session if needed
let cachedInstitutionStorage: any = null;
const instCachePath = path.resolve('extracted-institution-storage.json');
if (fs.existsSync(instCachePath)) {
  try {
    cachedInstitutionStorage = JSON.parse(fs.readFileSync(instCachePath, 'utf8'));
  } catch (e) {}
}

export async function loginAsInstitution(page: Page, context?: BrowserContext) {
  if (context && cachedInstitutionStorage && cachedInstitutionStorage.jp_access_token) {
    await context.addCookies([
      {
        name: 'jp_token',
        value: cachedInstitutionStorage.jp_access_token,
        domain: new URL(BASE_URL).hostname,
        path: '/',
        httpOnly: false,
        secure: true,
        sameSite: 'Lax',
      },
    ]);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate((data) => {
      for (const [key, val] of Object.entries(data)) {
        if (val) localStorage.setItem(key, String(val));
      }
    }, cachedInstitutionStorage);
    await page.goto('/provider/dashboard', { waitUntil: 'networkidle' });
    if (!page.url().includes('/auth/login')) {
      return;
    }
  }

  // Standard login if credentials provided
  if (INSTITUTION_CREDS.email && INSTITUTION_CREDS.password) {
    await page.goto('/auth/login', { waitUntil: 'networkidle' });
    await page.locator('#email-address').fill(INSTITUTION_CREDS.email);
    await page.locator('#password').fill(INSTITUTION_CREDS.password);
    await page.getByRole('button', { name: 'Sign In to Portal' }).click();
    await page.waitForURL('**/provider/**', { timeout: 15000 });
  } else if (cachedInstitutionStorage && cachedInstitutionStorage.jp_access_token) {
    // Inject cookies via page context
    const ctx = page.context();
    await ctx.addCookies([
      {
        name: 'jp_token',
        value: cachedInstitutionStorage.jp_access_token,
        domain: new URL(BASE_URL).hostname,
        path: '/',
        httpOnly: false,
        secure: true,
        sameSite: 'Lax',
      },
    ]);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate((data) => {
      for (const [key, val] of Object.entries(data)) {
        if (val) localStorage.setItem(key, String(val));
      }
    }, cachedInstitutionStorage);
    await page.goto('/provider/dashboard', { waitUntil: 'networkidle' });
  }
}

export async function loginAsCandidate(page: Page, context: BrowserContext) {
  if (cachedStorage && cachedStorage.jp_access_token) {
    await context.addCookies([
      {
        name: 'jp_token',
        value: cachedStorage.jp_access_token,
        domain: new URL(BASE_URL).hostname,
        path: '/',
        httpOnly: false,
        secure: true,
        sameSite: 'Lax',
      },
    ]);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate((data) => {
      for (const [key, val] of Object.entries(data)) {
        if (val) localStorage.setItem(key, String(val));
      }
    }, cachedStorage);
    await page.goto('/seeker/dashboard', { waitUntil: 'networkidle' });
    if (!page.url().includes('/auth/login')) {
      return;
    }
  }

  // Standard login
  await page.goto('/auth/login', { waitUntil: 'networkidle' });
  await page.locator('#email-address').fill(CANDIDATE_CREDS.email);
  await page.locator('#password').fill(CANDIDATE_CREDS.password);
  await page.getByRole('button', { name: 'Sign In to Portal' }).click();
  await page.waitForURL('**/seeker/**', { timeout: 15000 });
}
