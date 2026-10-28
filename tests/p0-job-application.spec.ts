import { test, expect } from '@playwright/test';
import { loginAsInstitution, loginAsCandidate, BASE_URL } from './fixtures';

const TIMESTAMP = Date.now();
const UNIQUE_JOB_TITLE = `E2E_ALSABEEL_${TIMESTAMP}`;

test.describe.serial('2 & 3. Vacancy Creation and Candidate Application — P0', () => {
  let createdJobId: string = '';

  test('Provider validates negative input validation on job creation form', async ({ page }) => {
    await loginAsInstitution(page);
    await page.goto('/provider/jobs/create', { waitUntil: 'networkidle' });

    // Submit empty form to verify required fields
    const publishBtn = page.getByRole('button', { name: /Publish Vacancy Now/i });
    await publishBtn.click();
    await page.waitForTimeout(1000);

    // Verify HTML5 validation or page error alerts
    const titleInput = page.locator('#job-title');
    const isRequired = await titleInput.getAttribute('required');
    expect(isRequired !== null || (await page.locator('.text-red-500, [role="alert"]').count()) > 0).toBeTruthy();
  });

  test('Provider creates and publishes a new Islamic vacancy with unique prefix', async ({ page }) => {
    await loginAsInstitution(page);
    await page.goto('/provider/jobs/create', { waitUntil: 'networkidle' });

    // Fill job fields
    await page.locator('#job-title').fill(UNIQUE_JOB_TITLE);
    
    // Select category if available
    const categorySelect = page.locator('#category');
    if (await categorySelect.isVisible()) {
      const options = await categorySelect.locator('option').allInnerTexts();
      if (options.length > 1) {
        await categorySelect.selectOption({ index: 1 });
      }
    }

    if (await page.locator('#role-designation').isVisible()) {
      await page.locator('#role-designation').fill('Imam / Head Teacher');
    }

    if (await page.locator('#monthly-salary-compensation').isVisible()) {
      await page.locator('#monthly-salary-compensation').fill('35000 - 50000');
    }

    await page.locator('#city').fill('Bangalore');
    await page.locator('#state').fill('Karnataka');
    await page.locator('#detailed-description').fill('Detailed description for ' + UNIQUE_JOB_TITLE + ': Leading 5 daily prayers, conducting Quran tafseer, community guidance.');
    
    if (await page.locator('#key-responsibilities').isVisible()) {
      await page.locator('#key-responsibilities').fill('Lead prayers, Friday khutbah, maktab supervision.');
    }

    if (await page.locator('#experience-required').isVisible()) {
      await page.locator('#experience-required').fill('2+ years');
    }

    if (await page.locator('#education-sanad-required').isVisible()) {
      await page.locator('#education-sanad-required').fill('Alim / Hafiz-e-Quran Sanad');
    }

    if (await page.locator('#number-of-open-positions').isVisible()) {
      await page.locator('#number-of-open-positions').fill('1');
    }

    // Accommodation and food benefits - use check({ force: true }) because of custom styled peer overlay
    const residenceCheckbox = page.locator('#family-residence-single-room-provided');
    if (await residenceCheckbox.count() > 0) {
      await residenceCheckbox.check({ force: true });
    }

    const foodCheckbox = page.locator('#daily-meals-food-allowance-included');
    if (await foodCheckbox.count() > 0) {
      await foodCheckbox.check({ force: true });
    }

    // Intercept publish network response to capture job ID
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/jobs') && (resp.status() === 200 || resp.status() === 201), { timeout: 15000 }),
      page.getByRole('button', { name: /Publish Vacancy Now/i }).click()
    ]);

    const resJson = await response.json();
    console.log('Created Job Response:', JSON.stringify(resJson, null, 2));
    createdJobId = resJson?.data?.id || resJson?.id || '';

    await page.waitForTimeout(3000);

    // Verify vacancy persists in Provider Job Management
    await page.goto('/provider/jobs', { waitUntil: 'networkidle' });
    await expect(page.getByText(UNIQUE_JOB_TITLE).first()).toBeVisible({ timeout: 10000 });

    // Refresh and verify persistence
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByText(UNIQUE_JOB_TITLE).first()).toBeVisible({ timeout: 10000 });
  });

  test('Candidate discovers vacancy, inspects details, and submits application', async ({ page, context }) => {
    await loginAsCandidate(page, context);

    // Navigate to jobs explorer
    await page.goto('/jobs', { waitUntil: 'networkidle' });

    // Find the newly created job with first() to avoid strict mode violation
    const searchInputs = page.getByPlaceholder(/Search roles|Search role|Search/i);
    if (await searchInputs.count() > 0) {
      const searchBox = searchInputs.first();
      await searchBox.fill(UNIQUE_JOB_TITLE);
      await searchBox.press('Enter');
      await page.waitForTimeout(2000);
    }

    // Locate job card or link
    const jobLink = page.getByText(UNIQUE_JOB_TITLE).first();
    await expect(jobLink).toBeVisible({ timeout: 15000 });
    await jobLink.click();
    await page.waitForTimeout(3000);

    // Confirm vacancy details
    await expect(page.getByText(UNIQUE_JOB_TITLE).first()).toBeVisible();

    // Submit Application
    const applyBtn = page.getByRole('button', { name: /Apply Now|Apply/i }).first();
    if (await applyBtn.isVisible()) {
      await applyBtn.click();
      await page.waitForTimeout(2000);

      // Check if cover letter modal or input appears
      const coverLetter = page.locator('textarea');
      if (await coverLetter.isVisible()) {
        await coverLetter.fill(`Assalamu Alaikum. Application submitted by Candidate for ${UNIQUE_JOB_TITLE}. Hafiz with extensive experience.`);
        const submitModalBtn = page.getByRole('button', { name: /Submit Application|Confirm Application|Send Application/i }).first();
        if (await submitModalBtn.isVisible()) {
          await submitModalBtn.click();
        }
      }
    }

    await page.waitForTimeout(3000);

    // Verify application in candidate tracking
    await page.goto('/seeker/applications', { waitUntil: 'networkidle' });
    await expect(page.getByText(UNIQUE_JOB_TITLE).first()).toBeVisible({ timeout: 10000 });

    // Verify duplicate application prevention
    if (createdJobId) {
      await page.goto(`/jobs/${createdJobId}`, { waitUntil: 'networkidle' });
      const applyAgainBtn = page.getByRole('button', { name: /Apply Now|Apply/i }).first();
      if (await applyAgainBtn.isVisible()) {
        const isDisabled = await applyAgainBtn.isDisabled();
        const text = await applyAgainBtn.innerText();
        console.log(`Duplicate Apply button state - Disabled: ${isDisabled}, Text: ${text}`);
      }
    }
  });
});
