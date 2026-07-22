import { Page, expect } from '@playwright/test';

/**
 * TESTID CONTRACT
 * ----------------
 * These are the data-testid attributes the frontend MUST expose for the E2E
 * tests to drive it. The phase 3-5 prompts instruct Claude Code to add them.
 * If a selector below changes, update the prompt too so they stay in sync.
 */
export const T = {
  // Identity gate — phase 6 branching
  personKindEmployee: 'person-kind-employee',
  personKindNonEmployee: 'person-kind-non-employee',
  identityName: 'identity-name',
  identityEmpId: 'identity-empid',
  identityDesignation: 'identity-designation',
  identityLocation: 'identity-location',
  identityContinue: 'identity-continue',
  nonempType: (v: string) => `nonemp-type-${v}`,     // CONTRACTOR/VISITOR/OTHER
  nonempOtherDesc: 'nonemp-other-desc',

  // Resume banner (employee only)
  resumeBanner: 'resume-banner',
  resumeMismatchWarning: 'resume-mismatch-warning',
  resumeButton: 'resume-continue',
  resumeStartNew: 'resume-start-new',

  // Step 1 - details (location/hod/reporter removed in phase 6)
  reportType: (v: string) => `report-type-${v}`,     // multi-select, max 3
  shift: (v: string) => `shift-${v}`,
  category: (v: string) => `category-${v}`,
  severity: (v: string) => `severity-${v}`,
  eventDate: 'details-date',
  eventTime: 'details-time',
  description: 'details-description',
  descriptionError: 'details-description-error',
  correctiveAction: 'details-corrective',
  detailsSave: 'details-save',
  detailsNext: 'details-next',
  saveToast: 'save-toast',

  // Step 2 - checklist
  checklistItem: (code: string) => `checklist-${code}`,
  checklistYes: (code: string) => `checklist-${code}-yes`,
  checklistNo: (code: string) => `checklist-${code}-no`,
  checklistBack: 'checklist-back',
  checklistSubmit: 'checklist-submit',

  // Confirmation
  confirmScreen: 'confirm-screen',
  confirmReportId: 'confirm-report-id',
  reportAnother: 'report-another',
};

// The exact location options the identity dropdown must offer (phase 6 change 1).
export const LOCATIONS = [
  'Kandlakoya', 'Kompally', 'Kothur', 'Kalakal', 'Shanbhag Nagar',
  'Bargah', 'Chandole', 'Edlapadu', 'Guntur', 'Veeravalli',
];

const tid = (page: Page, testid: string) => page.getByTestId(testid);

export interface Identity {
  name: string;
  empId: string;
  designation: string;
}

/** Fill and submit the identity gate (LEGACY phase 3-5 shape: employee w/ empid+designation). */
export async function identify(page: Page, id: Identity) {
  await page.goto('/');
  // Phase 6+ requires choosing employee first; tolerate both old and new UI.
  const empToggle = page.getByTestId('person-kind-employee');
  if (await empToggle.count()) { await empToggle.click(); }
  await tid(page, T.identityName).fill(id.name);
  await tid(page, T.identityEmpId).fill(id.empId);
  const desig = page.getByTestId(T.identityDesignation);
  if (await desig.count()) { await desig.fill(id.designation); }
  const loc = page.getByTestId('identity-location');
  if (await loc.count()) { await loc.selectOption({ index: 1 }); }
  await tid(page, T.identityContinue).click();
}

// ---- Phase 6 identity helpers -------------------------------------------
export interface EmployeeIdentity {
  name: string; empId: string; designation: string; location: string;
}
export interface NonEmployeeIdentity {
  name: string; subType: 'CONTRACTOR' | 'VISITOR' | 'OTHER';
  otherDesc?: string; location: string;
}

export async function identifyEmployee(page: Page, id: EmployeeIdentity) {
  await page.goto('/');
  await tid(page, 'person-kind-employee').click();
  await tid(page, T.identityName).fill(id.name);
  await tid(page, T.identityEmpId).fill(id.empId);
  await tid(page, T.identityDesignation).fill(id.designation);
  await tid(page, 'identity-location').selectOption(id.location);
  await tid(page, T.identityContinue).click();
}

export async function identifyNonEmployee(page: Page, id: NonEmployeeIdentity) {
  await page.goto('/');
  await tid(page, 'person-kind-non-employee').click();
  await tid(page, T.identityName).fill(id.name);
  await tid(page, `nonemp-type-${id.subType}`).click();
  if (id.subType === 'OTHER') {
    await tid(page, 'nonemp-other-desc').fill(id.otherDesc || 'External auditor');
  }
  await tid(page, 'identity-location').selectOption(id.location);
  await tid(page, T.identityContinue).click();
}

/** Fill the step-1 details form (phase 6 shape: no location/hod/reporter here). */
export async function fillDetails(
  page: Page,
  opts: Partial<{
    reportTypes: string[]; shift: string; category: string; severity: string;
    date: string; time: string; description: string;
  }> = {}
) {
  const o = {
    reportTypes: ['NEAR_MISS'], shift: 'A', category: 'STAFF', severity: 'LOW',
    date: '2026-07-16', time: '09:30',
    description: 'Loose cable near walkway', ...opts,
  };
  for (const rt of o.reportTypes) { await tid(page, T.reportType(rt)).click(); }
  await tid(page, T.shift(o.shift)).click();
  await tid(page, T.category(o.category)).click();
  await tid(page, T.severity(o.severity)).click();
  await tid(page, T.eventDate).fill(o.date);
  await tid(page, T.eventTime).fill(o.time);
  await tid(page, T.description).fill(o.description);
}

/** Generate a unique employee id so reruns don't collide on existing drafts. */
export function uniqueEmpId(prefix = 'E9') {
  return `${prefix}${Date.now().toString().slice(-7)}`;
}

export { tid, expect };
