# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase6_changes.spec.ts >> location, HOD comments, and reporter name are removed from details
- Location: tests\phase6_changes.spec.ts:24:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('details-description')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByTestId('details-description')

```

```yaml
- navigation "Progress": Identity → Details → Checklist
- heading "Identify yourself" [level=1]
- text: Are you an employee?
- group "Employee or non-employee":
  - button "Employee" [pressed]
  - button "Non-employee"
- text: Name
- textbox "Name": Asha R
- text: Employee ID
- textbox "Employee ID": E90132290
- text: Designation
- textbox "Designation": Technician
- text: Location
- combobox "Location":
  - option "Select location…"
  - option "Kandlakoya"
  - option "Kompally" [selected]
  - option "Kothur"
  - option "Kalakal"
  - option "Shanbhag Nagar"
  - option "Bargah"
  - option "Chandole"
  - option "Edlapadu"
  - option "Guntur"
  - option "Veeravalli"
- button "Please wait…" [disabled]
```

# Test source

```ts
  1   | import { test, devices } from '@playwright/test';
  2   | import {
  3   |   T, tid, expect, uniqueEmpId, fillDetails,
  4   |   identifyEmployee, identifyNonEmployee, LOCATIONS,
  5   | } from './helpers';
  6   | 
  7   | // Phase 6: six functional changes + UI overhaul. These tests assert behaviour,
  8   | // not styling (colors/animations are verified by build + presence, not pixels).
  9   | 
  10  | // CHANGE 1 — location is a dropdown on the identity page with the exact options.
  11  | test('identity page has a location dropdown with the required options', async ({ page }) => {
  12  |   await page.goto('/');
  13  |   await tid(page, T.personKindEmployee).click();
  14  |   const options = await tid(page, T.identityLocation).locator('option').allInnerTexts();
  15  |   for (const loc of LOCATIONS) {
  16  |     expect(options.join('|')).toContain(loc);
  17  |   }
  18  |   // "Guntur" must appear exactly once (dedupe requirement).
  19  |   const gunturCount = options.filter(o => o.trim() === 'Guntur').length;
  20  |   expect(gunturCount).toBe(1);
  21  | });
  22  | 
  23  | // CHANGE 1 (cont) — location is gone from the details step.
  24  | test('location, HOD comments, and reporter name are removed from details', async ({ page }) => {
  25  |   await identifyEmployee(page, {
  26  |     name: 'Asha R', empId: uniqueEmpId(), designation: 'Technician', location: 'Kompally',
  27  |   });
> 28  |   await expect(tid(page, T.description)).toBeVisible();     // we are on details
      |                                          ^ Error: expect(locator).toBeVisible() failed
  29  |   await expect(page.getByTestId('details-location')).toHaveCount(0);
  30  |   await expect(page.getByTestId('details-hod')).toHaveCount(0);
  31  |   await expect(page.getByTestId('details-reporter')).toHaveCount(0);
  32  | });
  33  | 
  34  | // CHANGE 2 — report type multi-select, capped at 3.
  35  | test('report type allows up to 3 selections and no more', async ({ page }) => {
  36  |   await identifyEmployee(page, {
  37  |     name: 'Ravi K', empId: uniqueEmpId(), designation: 'Operator', location: 'Kothur',
  38  |   });
  39  |   const types = ['NEAR_MISS', 'UNSAFE_ACT', 'UNSAFE_CONDITION', 'FIRE_INCIDENT'];
  40  |   await tid(page, T.reportType(types[0])).click();
  41  |   await tid(page, T.reportType(types[1])).click();
  42  |   await tid(page, T.reportType(types[2])).click();
  43  |   // First three active.
  44  |   for (let i = 0; i < 3; i++) {
  45  |     await expect(tid(page, T.reportType(types[i]))).toHaveAttribute('aria-pressed', 'true');
  46  |   }
  47  |   // Attempt a 4th — it must not become active.
  48  |   await tid(page, T.reportType(types[3])).click().catch(() => {});
  49  |   await expect(tid(page, T.reportType(types[3]))).not.toHaveAttribute('aria-pressed', 'true');
  50  | });
  51  | 
  52  | // CHANGE 4 — description mandatory: advancing empty shows an error.
  53  | test('empty description blocks advancing and shows an error', async ({ page }) => {
  54  |   await identifyEmployee(page, {
  55  |     name: 'Meena I', empId: uniqueEmpId(), designation: 'Supervisor', location: 'Kalakal',
  56  |   });
  57  |   await tid(page, T.reportType('NEAR_MISS')).click();
  58  |   await tid(page, T.severity('LOW')).click();
  59  |   // Leave description empty, try Next.
  60  |   await tid(page, T.detailsNext).click();
  61  |   await expect(tid(page, T.descriptionError)).toBeVisible();
  62  |   // Still on details (checklist not shown).
  63  |   await expect(tid(page, T.checklistItem('PPE_01'))).toHaveCount(0);
  64  | });
  65  | 
  66  | // CHANGE 5 — employee full journey still works with the new identity shape.
  67  | test('employee can complete the full journey with up to 3 types', async ({ page }) => {
  68  |   await identifyEmployee(page, {
  69  |     name: 'Priya S', empId: uniqueEmpId(), designation: 'Shift Lead', location: 'Guntur',
  70  |   });
  71  |   await fillDetails(page, {
  72  |     reportTypes: ['NEAR_MISS', 'UNSAFE_ACT'], severity: 'HIGH',
  73  |     description: 'Guard missing on conveyor',
  74  |   });
  75  |   await tid(page, T.detailsSave).click();
  76  |   await expect(tid(page, T.saveToast)).toBeVisible();
  77  |   await tid(page, T.detailsNext).click();
  78  |   await tid(page, T.checklistNo('RISK_01')).click();
  79  |   await tid(page, T.checklistSubmit).click();
  80  |   await expect(tid(page, T.confirmScreen)).toBeVisible();
  81  | });
  82  | 
  83  | // CHANGE 5 — non-employee (Contractor) completes a fresh submission, no resume offered.
  84  | test('non-employee contractor completes without a resume option', async ({ page }) => {
  85  |   await identifyNonEmployee(page, {
  86  |     name: 'Vendor Vijay', subType: 'CONTRACTOR', location: 'Edlapadu',
  87  |   });
  88  |   // No employee id / designation should be present on the non-employee path.
  89  |   await expect(page.getByTestId(T.identityEmpId)).toHaveCount(0);
  90  |   await fillDetails(page, { description: 'Blocked fire exit near dock' });
  91  |   await tid(page, T.detailsNext).click();
  92  |   await tid(page, T.checklistYes('PPE_04')).click();
  93  |   await tid(page, T.checklistSubmit).click();
  94  |   await expect(tid(page, T.confirmScreen)).toBeVisible();
  95  | });
  96  | 
  97  | // CHANGE 5 — non-employee "Other" requires a description box.
  98  | test('non-employee Other reveals and requires a description', async ({ page }) => {
  99  |   await page.goto('/');
  100 |   await tid(page, T.personKindNonEmployee).click();
  101 |   await tid(page, T.nonempType('OTHER')).click();
  102 |   await expect(tid(page, T.nonempOtherDesc)).toBeVisible();
  103 | });
  104 | 
  105 | // CHANGE 5 — non-employees are never offered resume even on repeat visits.
  106 | test('non-employee is never shown the resume banner', async ({ page }) => {
  107 |   const id = { name: 'Same Visitor', subType: 'VISITOR' as const, location: 'Bargah' };
  108 |   await identifyNonEmployee(page, id);
  109 |   await fillDetails(page, { description: 'Wet floor unmarked' });
  110 |   await tid(page, T.detailsSave).click().catch(() => {});
  111 |   // Come back as the same visitor — must NOT see a resume banner.
  112 |   await identifyNonEmployee(page, id);
  113 |   await expect(tid(page, T.resumeBanner)).toHaveCount(0);
  114 | });
  115 | 
  116 | // CHANGE 6 (mobile) — the whole flow works on a narrow viewport.
  117 | test('mobile viewport: employee flow works end to end', async ({ browser }) => {
  118 |   const context = await browser.newContext({ ...devices['Pixel 7'] });
  119 |   const page = await context.newPage();
  120 |   await identifyEmployee(page, {
  121 |     name: 'Divya N', empId: uniqueEmpId(), designation: 'Operator', location: 'Veeravalli',
  122 |   });
  123 |   await fillDetails(page, { description: 'Slippery step near entry' });
  124 |   await tid(page, T.detailsNext).click();
  125 |   await tid(page, T.checklistYes('PROC_02')).click();
  126 |   await tid(page, T.checklistSubmit).click();
  127 |   await expect(tid(page, T.confirmScreen)).toBeVisible();
  128 |   await context.close();
```