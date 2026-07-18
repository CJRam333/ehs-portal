We are building an EHS Reporting Portal. Stack: Java 21 + Spring Boot 3, Spring Data JPA, MySQL 8, Flyway, Maven for the backend; React 18 + Vite + TypeScript for the frontend. Scope is capture-only: a user scans a QR code, identifies themselves, fills a 2-step form (details then YES/NO checklists), and we save it to the DB. No notifications, dashboards, or escalation — those are out of scope. Keep the UI compact and content-dense with minimal wasted space. Build exactly what each phase asks and stop at its acceptance check.

---

PHASE 4 TASK:

Frontend: Step 2 checklist + submit

Build the second half.

Checklist step: on entry, GET `/api/checklist-template` and GET the current report to prefill any saved answers. Render each section (PPE, Behaviour, Tools & Equipment, Risk/Violations, Procedures) as a compact table: item label on the left, a YES/NO toggle pair on the right. Keep rows dense — this is a long list, so small row height and clear section headers matter.
Buttons: **Back** (PUT checklist to save current answers, go to Details) and **Submit** (PUT checklist, then POST submit).
On successful submit, show a clean confirmation screen with the report reference id and a "Report another" button that returns to the identity gate and clears state.
Handle the already-submitted case (backend rejects) with a friendly message.

Acceptance: full end-to-end run — identify → details → Save → Next → answer checklist → Submit → confirmation — with the record in MySQL showing status SUBMITTED and all answers stored.

---

E2E TEST CONTRACT (required for automated verification):

Add these exact `data-testid` attributes for the Playwright checklist tests:

- Each checklist row container: `data-testid="checklist-<CODE>"` (e.g. checklist-PPE_01, checklist-RISK_14, checklist-PROC_01) — codes come from GET /api/checklist-template.
- The YES toggle for an item: `data-testid="checklist-<CODE>-yes"`
- The NO toggle for an item: `data-testid="checklist-<CODE>-no"`
- Selected YES/NO toggles must expose their state with `aria-pressed="true"` when active (used by the tests to confirm persistence).
- Back button: `data-testid="checklist-back"` (must save current answers before navigating back)
- Submit button: `data-testid="checklist-submit"`

Confirmation screen (after successful submit):
- Container: `data-testid="confirm-screen"`
- Report reference id (contains the numeric id): `data-testid="confirm-report-id"`
- "Report another" button: `data-testid="report-another"` (returns to a cleared identity gate)

Going Back then Next again must preserve the toggles the user set (answers are saved server-side on Back).
