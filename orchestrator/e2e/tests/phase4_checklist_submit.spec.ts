import { test } from '@playwright/test';
import { T, tid, expect, identify, fillDetails, uniqueEmpId } from './helpers';

// Phase 4: Step 2 checklist + submit.

async function toChecklist(page) {
  await identify(page, { name: 'Nadia K', empId: uniqueEmpId(), designation: 'Analyst' });
  await fillDetails(page);
  await tid(page, T.detailsNext).click();
  await expect(tid(page, T.checklistItem('PPE_01'))).toBeVisible();
}

test('checklist renders all section anchors', async ({ page }) => {
  await toChecklist(page);
  // Spot-check one item from each section is rendered from the template.
  for (const code of ['PPE_01', 'BEH_01', 'TOOL_01', 'RISK_01', 'RISK_14', 'PROC_01']) {
    await expect(tid(page, T.checklistItem(code))).toBeVisible();
  }
});

test('answers persist when going Back then returning', async ({ page }) => {
  await toChecklist(page);
  await tid(page, T.checklistYes('PPE_01')).click();
  await tid(page, T.checklistNo('RISK_09')).click();

  // Back should save current answers.
  await tid(page, T.checklistBack).click();
  await expect(tid(page, T.location)).toBeVisible();

  // Forward again and confirm the toggles retained their state.
  await tid(page, T.detailsNext).click();
  await expect(tid(page, T.checklistYes('PPE_01'))).toHaveAttribute('aria-pressed', 'true');
  await expect(tid(page, T.checklistNo('RISK_09'))).toHaveAttribute('aria-pressed', 'true');
});

test('submit shows a confirmation with a report id', async ({ page }) => {
  await toChecklist(page);
  await tid(page, T.checklistYes('PPE_01')).click();
  await tid(page, T.checklistSubmit).click();

  await expect(tid(page, T.confirmScreen)).toBeVisible();
  const idText = await tid(page, T.confirmReportId).innerText();
  expect(idText).toMatch(/\d+/); // some numeric report reference
});

test('"Report another" returns to a clean identity gate', async ({ page }) => {
  await toChecklist(page);
  await tid(page, T.checklistSubmit).click();
  await expect(tid(page, T.confirmScreen)).toBeVisible();
  await tid(page, T.reportAnother).click();
  // Back at the gate with empty fields.
  await expect(tid(page, T.identityName)).toHaveValue('');
});
