import { Page, expect } from '@playwright/test';

/**
 * TESTID CONTRACT
 * ----------------
 * These are the data-testid attributes the frontend MUST expose for the E2E
 * tests to drive it. The phase 3-5 prompts instruct Claude Code to add them.
 * If a selector below changes, update the prompt too so they stay in sync.
 */
export const T = {
  // Identity gate
  identityName: 'identity-name',
  identityEmpId: 'identity-empid',
  identityDesignation: 'identity-designation',
  identityContinue: 'identity-continue',

  // Resume banner
  resumeBanner: 'resume-banner',
  resumeMismatchWarning: 'resume-mismatch-warning',
  resumeButton: 'resume-continue',
  resumeStartNew: 'resume-start-new',

  // Step 1 - details
  reportType: (v: string) => `report-type-${v}`,     // e.g. report-type-NEAR_MISS
  shift: (v: string) => `shift-${v}`,                // shift-A
  category: (v: string) => `category-${v}`,          // category-STAFF
  severity: (v: string) => `severity-${v}`,          // severity-LOW
  location: 'details-location',
  eventDate: 'details-date',
  eventTime: 'details-time',
  description: 'details-description',
  correctiveAction: 'details-corrective',
  hodComments: 'details-hod',
  reporterName: 'details-reporter',
  detailsSave: 'details-save',
  detailsNext: 'details-next',
  saveToast: 'save-toast',

  // Step 2 - checklist
  checklistItem: (code: string) => `checklist-${code}`,      // container for a row
  checklistYes: (code: string) => `checklist-${code}-yes`,   // YES toggle
  checklistNo: (code: string) => `checklist-${code}-no`,     // NO toggle
  checklistBack: 'checklist-back',
  checklistSubmit: 'checklist-submit',

  // Confirmation
  confirmScreen: 'confirm-screen',
  confirmReportId: 'confirm-report-id',
  reportAnother: 'report-another',
};

const tid = (page: Page, testid: string) => page.getByTestId(testid);

export interface Identity {
  name: string;
  empId: string;
  designation: string;
}

/** Fill and submit the identity gate. */
export async function identify(page: Page, id: Identity) {
  await page.goto('/');
  await tid(page, T.identityName).fill(id.name);
  await tid(page, T.identityEmpId).fill(id.empId);
  await tid(page, T.identityDesignation).fill(id.designation);
  await tid(page, T.identityContinue).click();
}

/** Fill the step-1 details form with sensible defaults (override as needed). */
export async function fillDetails(
  page: Page,
  opts: Partial<{
    reportType: string; shift: string; category: string; severity: string;
    location: string; date: string; time: string; description: string;
  }> = {}
) {
  const o = {
    reportType: 'NEAR_MISS', shift: 'A', category: 'STAFF', severity: 'LOW',
    location: 'Bay 3', date: '2026-07-16', time: '09:30',
    description: 'Loose cable near walkway', ...opts,
  };
  await tid(page, T.reportType(o.reportType)).click();
  await tid(page, T.shift(o.shift)).click();
  await tid(page, T.category(o.category)).click();
  await tid(page, T.severity(o.severity)).click();
  await tid(page, T.location).fill(o.location);
  await tid(page, T.eventDate).fill(o.date);
  await tid(page, T.eventTime).fill(o.time);
  await tid(page, T.description).fill(o.description);
}

/** Generate a unique employee id so reruns don't collide on existing drafts. */
export function uniqueEmpId(prefix = 'E9') {
  return `${prefix}${Date.now().toString().slice(-7)}`;
}

export { tid, expect };
