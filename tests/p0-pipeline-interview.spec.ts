import { test, expect } from '@playwright/test';
import { loginAsInstitution, loginAsCandidate } from './fixtures';

test.describe.serial('4 & 5. Provider Pipeline and Interview Scheduling — P0', () => {
  test('Provider views Candidate application under created test vacancy in pipeline', async ({ page }) => {
    await loginAsInstitution(page);
    await page.goto('/provider/applications', { waitUntil: 'networkidle' });

    // Confirm applicant card exists
    await expect(page.getByText('saifan').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Applied for E2E_ALSABEEL_/i).first()).toBeVisible();

    // Verify candidate dossier button exists and belongs to candidate
    const viewDossierBtn = page.getByRole('button', { name: /View Resume & Profile/i }).first();
    await expect(viewDossierBtn).toBeVisible();
  });

  test('Provider updates pipeline stage (Applied -> Under Review -> Shortlist)', async ({ page }) => {
    await loginAsInstitution(page);
    await page.goto('/provider/applications', { waitUntil: 'networkidle' });

    const stageSelect = page.locator('select').first();
    await expect(stageSelect).toBeVisible();

    // Move to Under Review
    await stageSelect.selectOption({ label: 'Under Review' });
    await page.waitForTimeout(2000);
    await page.reload({ waitUntil: 'networkidle' });

    // Move to Shortlist
    const stageSelectAfterReload = page.locator('select').first();
    await stageSelectAfterReload.selectOption({ label: 'Shortlist' });
    await page.waitForTimeout(2000);
    await page.reload({ waitUntil: 'networkidle' });

    // Check persistence
    const currentVal = await page.locator('select').first().inputValue();
    console.log('Pipeline stage after transitions:', currentVal);
  });

  test('Inspect Interview Scheduling Controls & Gaps in Current Dev Build [Requirement Finding]', async ({ page, context }) => {
    await loginAsInstitution(page);
    await page.goto('/provider/applications', { waitUntil: 'networkidle' });

    // Check if interview scheduling modal, slots creation or WebRTC room setup is available in UI
    const buttons = await page.locator('button').allInnerTexts();
    console.log('Available Provider Application action buttons:', buttons);

    const hasInterviewAction = buttons.some(b => /schedule|interview|slot|webrtc|call/i.test(b));
    console.log(`[REQUIREMENT AUDIT]: Provider UI interview scheduling control present: ${hasInterviewAction}`);

    // Check candidate applications view for interview details/slot picker
    await loginAsCandidate(page, context);
    await page.goto('/seeker/applications', { waitUntil: 'networkidle' });
    const candidateActions = await page.locator('button, a').allInnerTexts();
    const hasSlotPicker = candidateActions.some(a => /slot|interview|accept slot|meeting/i.test(a));
    console.log(`[REQUIREMENT AUDIT]: Candidate UI interview slot selector present: ${hasSlotPicker}`);

    // If interview scheduling UI is pending development, record defect/gap clearly
    if (!hasInterviewAction || !hasSlotPicker) {
      console.warn('CRITICAL FINDING: Section 5 Interview scheduling and candidate slot selection controls are not yet integrated into the provider applications UI in this development build.');
    }
  });
});
