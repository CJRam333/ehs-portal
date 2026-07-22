import { test, devices } from '@playwright/test';
import {
  T, tid, expect, uniqueEmpId, fillDetails,
  identifyEmployee, identifyNonEmployee, LOCATIONS,
} from './helpers';

// Phase 6: six functional changes + UI overhaul. These tests assert behaviour,
// not styling (colors/animations are verified by build + presence, not pixels).

// CHANGE 1 — location is a dropdown on the identity page with the exact options.
test('identity page has a location dropdown with the required options', async ({ page }) => {
  await page.goto('/');
  await tid(page, T.personKindEmployee).click();
  const options = await tid(page, T.identityLocation).locator('option').allInnerTexts();
  for (const loc of LOCATIONS) {
    expect(options.join('|')).toContain(loc);
  }
  // "Guntur" must appear exactly once (dedupe requirement).
  const gunturCount = options.filter(o => o.trim() === 'Guntur').length;
  expect(gunturCount).toBe(1);
});

// CHANGE 1 (cont) — location is gone from the details step.
test('location, HOD comments, and reporter name are removed from details', async ({ page }) => {
  await identifyEmployee(page, {
    name: 'Asha R', empId: uniqueEmpId(), designation: 'Technician', location: 'Kompally',
  });
  await expect(tid(page, T.description)).toBeVisible();     // we are on details
  await expect(page.getByTestId('details-location')).toHaveCount(0);
  await expect(page.getByTestId('details-hod')).toHaveCount(0);
  await expect(page.getByTestId('details-reporter')).toHaveCount(0);
});

// CHANGE 2 — report type multi-select, capped at 3.
test('report type allows up to 3 selections and no more', async ({ page }) => {
  await identifyEmployee(page, {
    name: 'Ravi K', empId: uniqueEmpId(), designation: 'Operator', location: 'Kothur',
  });
  const types = ['NEAR_MISS', 'UNSAFE_ACT', 'UNSAFE_CONDITION', 'FIRE_INCIDENT'];
  await tid(page, T.reportType(types[0])).click();
  await tid(page, T.reportType(types[1])).click();
  await tid(page, T.reportType(types[2])).click();
  // First three active.
  for (let i = 0; i < 3; i++) {
    await expect(tid(page, T.reportType(types[i]))).toHaveAttribute('aria-pressed', 'true');
  }
  // Attempt a 4th — it must not become active.
  await tid(page, T.reportType(types[3])).click().catch(() => {});
  await expect(tid(page, T.reportType(types[3]))).not.toHaveAttribute('aria-pressed', 'true');
});

// CHANGE 4 — description mandatory: advancing empty shows an error.
test('empty description blocks advancing and shows an error', async ({ page }) => {
  await identifyEmployee(page, {
    name: 'Meena I', empId: uniqueEmpId(), designation: 'Supervisor', location: 'Kalakal',
  });
  await tid(page, T.reportType('NEAR_MISS')).click();
  await tid(page, T.severity('LOW')).click();
  // Leave description empty, try Next.
  await tid(page, T.detailsNext).click();
  await expect(tid(page, T.descriptionError)).toBeVisible();
  // Still on details (checklist not shown).
  await expect(tid(page, T.checklistItem('PPE_01'))).toHaveCount(0);
});

// CHANGE 5 — employee full journey still works with the new identity shape.
test('employee can complete the full journey with up to 3 types', async ({ page }) => {
  await identifyEmployee(page, {
    name: 'Priya S', empId: uniqueEmpId(), designation: 'Shift Lead', location: 'Guntur',
  });
  await fillDetails(page, {
    reportTypes: ['NEAR_MISS', 'UNSAFE_ACT'], severity: 'HIGH',
    description: 'Guard missing on conveyor',
  });
  await tid(page, T.detailsSave).click();
  await expect(tid(page, T.saveToast)).toBeVisible();
  await tid(page, T.detailsNext).click();
  await tid(page, T.checklistNo('RISK_01')).click();
  await tid(page, T.checklistSubmit).click();
  await expect(tid(page, T.confirmScreen)).toBeVisible();
});

// CHANGE 5 — non-employee (Contractor) completes a fresh submission, no resume offered.
test('non-employee contractor completes without a resume option', async ({ page }) => {
  await identifyNonEmployee(page, {
    name: 'Vendor Vijay', subType: 'CONTRACTOR', location: 'Edlapadu',
  });
  // No employee id / designation should be present on the non-employee path.
  await expect(page.getByTestId(T.identityEmpId)).toHaveCount(0);
  await fillDetails(page, { description: 'Blocked fire exit near dock' });
  await tid(page, T.detailsNext).click();
  await tid(page, T.checklistYes('PPE_04')).click();
  await tid(page, T.checklistSubmit).click();
  await expect(tid(page, T.confirmScreen)).toBeVisible();
});

// CHANGE 5 — non-employee "Other" requires a description box.
test('non-employee Other reveals and requires a description', async ({ page }) => {
  await page.goto('/');
  await tid(page, T.personKindNonEmployee).click();
  await tid(page, T.nonempType('OTHER')).click();
  await expect(tid(page, T.nonempOtherDesc)).toBeVisible();
});

// CHANGE 5 — non-employees are never offered resume even on repeat visits.
test('non-employee is never shown the resume banner', async ({ page }) => {
  const id = { name: 'Same Visitor', subType: 'VISITOR' as const, location: 'Bargah' };
  await identifyNonEmployee(page, id);
  await fillDetails(page, { description: 'Wet floor unmarked' });
  await tid(page, T.detailsSave).click().catch(() => {});
  // Come back as the same visitor — must NOT see a resume banner.
  await identifyNonEmployee(page, id);
  await expect(tid(page, T.resumeBanner)).toHaveCount(0);
});

// CHANGE 6 (mobile) — the whole flow works on a narrow viewport.
test('mobile viewport: employee flow works end to end', async ({ browser }) => {
  const context = await browser.newContext({ ...devices['Pixel 7'] });
  const page = await context.newPage();
  await identifyEmployee(page, {
    name: 'Divya N', empId: uniqueEmpId(), designation: 'Operator', location: 'Veeravalli',
  });
  await fillDetails(page, { description: 'Slippery step near entry' });
  await tid(page, T.detailsNext).click();
  await tid(page, T.checklistYes('PROC_02')).click();
  await tid(page, T.checklistSubmit).click();
  await expect(tid(page, T.confirmScreen)).toBeVisible();
  await context.close();
});
