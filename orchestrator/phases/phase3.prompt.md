We are building an EHS Reporting Portal. Stack: Java 21 + Spring Boot 3, Spring Data JPA, MySQL 8, Flyway, Maven for the backend; React 18 + Vite + TypeScript for the frontend. Scope is capture-only: a user scans a QR code, identifies themselves, fills a 2-step form (details then YES/NO checklists), and we save it to the DB. No notifications, dashboards, or escalation — those are out of scope. Keep the UI compact and content-dense with minimal wasted space. Build exactly what each phase asks and stop at its acceptance check.

---

PHASE 3 TASK:

Frontend: identity gate + Step 1

Build the first half of the wizard. TypeScript, functional components, a small typed API client in `src/api.ts` matching the backend DTOs. Keep styling compact: segmented inline buttons for choice fields, tight spacing, no large gaps.

Routes/screens (use React Router):
- `/` Identity gate: Name, Employee ID, Designation inputs + Continue. On submit call `/api/identify`.
  - If resume:false → call `/api/reports` to create a draft, then go to Details.
  - If resume:true → show a banner "We found a saved report from {updated_at}. Resume where you left off?" with Resume / Start new. If mismatchWarning, add an amber note that the name/designation don't closely match the saved record but they can continue. Resume loads the existing report; Start new creates a fresh draft.
- Details step: a single-select report type (segmented buttons for the 7 types), Shift (A/B/C/G segmented), Reporter category (Staff/Contractor/Other/Visitor segmented), Severity (High/Medium/Low segmented), Location (text), Date (date picker), Time (time picker), Report Description (textarea), Corrective Action / Suggestion (textarea), Sign of HOD with comments (textarea), Reporters Name & Sign (text).
  - Two buttons at the bottom: **Save** (PUT details, toast "Saved", stay on page) and **Next** (PUT details, then navigate to Step 2).

Hold the active report id in a context or top-level state so Step 2 can use it. A progress header shows Identity → Details → Checklist with the current step highlighted.

Acceptance: fresh user can identify, fill details, Save persists (reload the page after re-identifying → data returns), Next advances.

---

E2E TEST CONTRACT (required for automated verification):

The build is verified by Playwright tests that locate elements via `data-testid` attributes. You MUST add these exact `data-testid` values to the corresponding elements in Phase 3:

Identity gate:
- Name input: `data-testid="identity-name"`
- Employee ID input: `data-testid="identity-empid"`
- Designation input: `data-testid="identity-designation"`
- Continue button: `data-testid="identity-continue"`

Resume banner (shown when a draft exists):
- Banner container: `data-testid="resume-banner"`
- Mismatch warning element (shown only when name/designation don't closely match): `data-testid="resume-mismatch-warning"`
- Resume/continue button: `data-testid="resume-continue"`
- Start-new button: `data-testid="resume-start-new"`

Step 1 details form:
- Report type buttons: `data-testid="report-type-<VALUE>"` where VALUE is the enum (NEAR_MISS, UNSAFE_ACT, UNSAFE_CONDITION, FIRE_INCIDENT, PERMIT_TO_WORK, BEHAVIOUR_BASED, SAFETY_VIOLATION)
- Shift buttons: `data-testid="shift-A"` (and B, C, G)
- Category buttons: `data-testid="category-STAFF"` (and CONTRACTOR, OTHER, VISITOR)
- Severity buttons: `data-testid="severity-HIGH"` (and MEDIUM, LOW)
- Location input: `data-testid="details-location"`
- Date input: `data-testid="details-date"` (native date input, value format YYYY-MM-DD)
- Time input: `data-testid="details-time"` (native time input, value format HH:MM)
- Description textarea: `data-testid="details-description"`
- Corrective action textarea: `data-testid="details-corrective"`
- HOD comments textarea: `data-testid="details-hod"`
- Reporter name input: `data-testid="details-reporter"`
- Save button: `data-testid="details-save"`
- Next button: `data-testid="details-next"`
- Save confirmation/toast (appears after Save succeeds): `data-testid="save-toast"`

Resuming a draft must restore field values (e.g. the location input shows the saved value). The Next button must navigate to the checklist step where the first item `data-testid="checklist-PPE_01"` is visible.
