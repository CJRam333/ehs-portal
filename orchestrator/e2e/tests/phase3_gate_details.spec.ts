import { test } from '@playwright/test';
import { T, tid, expect, identify, fillDetails, uniqueEmpId } from './helpers';

// Phase 3: identity gate + Step 1 details, with Save-persists-and-resume.

test('new user reaches the details form', async ({ page }) => {
  await identify(page, { name: 'Asha R', empId: uniqueEmpId(), designation: 'Technician' });
  // Details form is visible: the location field should be present.
  await expect(tid(page, T.location)).toBeVisible();
  await expect(tid(page, T.detailsSave)).toBeVisible();
  await expect(tid(page, T.detailsNext)).toBeVisible();
});

test('Save persists a draft and it resumes on re-identify', async ({ page }) => {
  const emp = uniqueEmpId();
  const id = { name: 'Ravi Kumar', empId: emp, designation: 'Operator' };

  await identify(page, id);
  await fillDetails(page, { location: 'Warehouse 7', description: 'Spill by dock' });
  await tid(page, T.detailsSave).click();
  // A save confirmation should appear.
  await expect(tid(page, T.saveToast)).toBeVisible();

  // Simulate closing the tab: hard reload back to the gate.
  await page.goto('/');
  await identify(page, id);

  // Resume banner should offer to continue the saved draft.
  await expect(tid(page, T.resumeBanner)).toBeVisible();
  await tid(page, T.resumeButton).click();

  // The previously saved location must be restored.
  await expect(tid(page, T.location)).toHaveValue('Warehouse 7');
});

test('fuzzy name/designation mismatch shows a warning but still allows resume', async ({ page }) => {
  const emp = uniqueEmpId();
  await identify(page, { name: 'Meena Iyer', empId: emp, designation: 'Supervisor' });
  await fillDetails(page, { location: 'Line 2' });
  await tid(page, T.detailsSave).click();
  await expect(tid(page, T.saveToast)).toBeVisible();

  // Re-identify with same emp id but clearly different name + designation.
  await page.goto('/');
  await identify(page, { name: 'Zzz Different', empId: emp, designation: 'Cleaner' });

  await expect(tid(page, T.resumeBanner)).toBeVisible();
  await expect(tid(page, T.resumeMismatchWarning)).toBeVisible();
  // Still allowed to continue.
  await tid(page, T.resumeButton).click();
  await expect(tid(page, T.location)).toHaveValue('Line 2');
});

test('Next advances from details to the checklist step', async ({ page }) => {
  await identify(page, { name: 'Sam P', empId: uniqueEmpId(), designation: 'Engineer' });
  await fillDetails(page);
  await tid(page, T.detailsNext).click();
  // On the checklist step, the first PPE item should be present.
  await expect(tid(page, T.checklistItem('PPE_01'))).toBeVisible();
});
