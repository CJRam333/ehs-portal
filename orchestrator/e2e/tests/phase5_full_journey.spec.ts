import { test, devices } from '@playwright/test';
import { T, tid, expect, identify, fillDetails, uniqueEmpId } from './helpers';

// Phase 5: the complete journey, plus the real-world abandon/resume path and a
// mobile viewport pass (the BRD mandates mobile accessibility).

test('full journey: identify -> details -> save -> next -> checklist -> submit', async ({ page }) => {
  const emp = uniqueEmpId();
  await identify(page, { name: 'Priya S', empId: emp, designation: 'Shift Lead' });
  await fillDetails(page, { location: 'Packaging', description: 'Guard missing on conveyor' });

  await tid(page, T.detailsSave).click();
  await expect(tid(page, T.saveToast)).toBeVisible();

  await tid(page, T.detailsNext).click();
  await tid(page, T.checklistNo('RISK_01')).click();   // machine guarding = No
  await tid(page, T.checklistYes('PPE_04')).click();
  await tid(page, T.checklistSubmit).click();

  await expect(tid(page, T.confirmScreen)).toBeVisible();
});

test('abandon mid-form and resume completes successfully', async ({ page }) => {
  const emp = uniqueEmpId();
  const id = { name: 'Karan M', empId: emp, designation: 'Technician' };

  // Start, fill some details, save, then "leave".
  await identify(page, id);
  await fillDetails(page, { location: 'Boiler room', description: 'Steam leak observed' });
  await tid(page, T.detailsSave).click();
  await expect(tid(page, T.saveToast)).toBeVisible();
  await page.goto('about:blank');   // simulate closing the browser/tab

  // Come back via QR (root), re-identify, resume, and finish.
  await identify(page, id);
  await expect(tid(page, T.resumeBanner)).toBeVisible();
  await tid(page, T.resumeButton).click();
  await expect(tid(page, T.location)).toHaveValue('Boiler room');

  await tid(page, T.detailsNext).click();
  await tid(page, T.checklistYes('PROC_02')).click();
  await tid(page, T.checklistSubmit).click();
  await expect(tid(page, T.confirmScreen)).toBeVisible();
});

test('mobile viewport: gate and details are usable', async ({ browser }) => {
  const context = await browser.newContext({ ...devices['Pixel 7'] });
  const page = await context.newPage();
  await identify(page, { name: 'Divya N', empId: uniqueEmpId(), designation: 'Operator' });
  await expect(tid(page, T.location)).toBeVisible();
  await fillDetails(page);
  await tid(page, T.detailsNext).click();
  await expect(tid(page, T.checklistItem('PPE_01'))).toBeVisible();
  await context.close();
});
