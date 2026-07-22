We are building an EHS Reporting Portal. Stack: Java 21 + Spring Boot 3, Spring Data JPA, MySQL 8, Flyway, Maven for the backend; React 18 + Vite + TypeScript for the frontend. It is ALREADY BUILT and DEPLOYED (phases 0-5 complete). This phase modifies the existing app. Do NOT re-scaffold. Make targeted changes to existing files.

CRITICAL DATABASE RULE: The V1 Flyway migration has ALREADY RUN on a live deployed database. You MUST NOT edit V1__init.sql. All schema changes go in a NEW migration file `V2__phase6_changes.sql` under backend/src/main/resources/db/migration/. Flyway will apply only the new V2 migration on top of the existing schema. Write V2 so it works against a database that already has the V1 schema and existing data (use additive/altering statements, not drop-and-recreate of the whole schema).

Keep the UI compact, mobile-first, and content-dense. Build exactly what this phase asks.

=======================================================================
PHASE 6 TASK: Six functional changes + a UI/visual overhaul.
=======================================================================

--- CHANGE 1: Move Location to the identity page as a dropdown ---
- Location currently lives on the Step 1 details form. Move it to the IDENTITY page (the first screen).
- It must be a dropdown (select) with EXACTLY these options, in this order:
  Kandlakoya, Kompally, Kothur, Kalakal, Shanbhag Nagar, Bargah, Chandole, Edlapadu, Guntur, Veeravalli
  (Note: the source list contained "Guntur" twice; include it only ONCE.)
- Location is REQUIRED for everyone (employee and non-employee).
- Store location on the report record as before (the `location` column already exists in the DB from V1 — keep using it; just move where it's captured in the UI, and set it at report-creation time from the identity step).
- Remove the location field from the Step 1 details form.

--- CHANGE 2: Report type becomes multi-select, max 3 ---
- Currently a single report_type column on `report`. A report may now have UP TO 3 types (minimum 1).
- Schema (in V2): create a new table `report_type` with columns:
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_id BIGINT NOT NULL,
    type VARCHAR(40) NOT NULL,
    CONSTRAINT fk_reporttype_report FOREIGN KEY (report_id) REFERENCES report(id) ON DELETE CASCADE,
    UNIQUE KEY uq_report_type (report_id, type)
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4.
- Migrate existing data in V2: copy each report's existing `report.report_type` value into the new `report_type` table (INSERT INTO report_type (report_id, type) SELECT id, report_type FROM report WHERE report_type IS NOT NULL). Then DROP the old `report.report_type` column.
- JPA: add a `@OneToMany` collection of report types on the Report entity (or an @ElementCollection of an enum). Enforce max 3 in the service layer (reject submit/details save with a 400 if more than 3 provided; require at least 1 at submit).
- Frontend: the report-type selector becomes multi-select (up to 3). Once 3 are selected, either disable the rest or show a clear "max 3" message. Keep single-select-style segmented buttons but allow up to three active.

--- CHANGE 3: Remove two fields entirely ---
- "Sign of HOD with comments" (hod_comments): remove from UI, from the Report entity/DTOs, and DROP the `hod_comments` column in V2.
- "Reporter's name & sign" (reporter_name): the reporter's name is already captured on the identity page (employee_name). Remove the reporter_name field from the Step 1 UI, from the entity/DTOs, and DROP the `reporter_name` column in V2.

--- CHANGE 4: Report description mandatory ---
- report_description must be required. Enforce on the frontend (block Next/Save with a validation message if empty) AND on the backend (validation; reject submit if blank). Do not make the DB column NOT NULL (drafts may be saved before it's filled) — enforce "required to SUBMIT" in the service layer, and required-to-advance in the UI.

--- CHANGE 5: Employee vs non-employee identity flow ---
The identity page must first ask: "Are you an employee?" (or an Employee / Non-employee toggle). Behaviour:
- EMPLOYEE path: fields = name (required), employee ID (REQUIRED), designation (required), location (required dropdown). Resume works as today (exact employee_id match on an existing DRAFT, fuzzy name/designation warning).
- NON-EMPLOYEE path: first choose a sub-type: Contractor, Visitor, or Other.
    - If "Other" is chosen, show a free-text box "Please describe" (required when Other).
    - Fields = name (required), sub-type (required), the Other-description (required only if Other), location (required dropdown). Employee ID is NOT asked and NOT required. Designation is NOT asked.
    - NON-EMPLOYEES CANNOT RESUME. Every non-employee session creates a fresh report. Do not show the resume banner for non-employees, and do not run the draft lookup for them.
- Schema (V2): add columns to `report`:
    person_kind VARCHAR(20) NOT NULL DEFAULT 'EMPLOYEE'   -- EMPLOYEE or NON_EMPLOYEE
    non_employee_type VARCHAR(20) NULL                     -- CONTRACTOR / VISITOR / OTHER (null for employees)
    non_employee_other_desc VARCHAR(255) NULL              -- free text when type=OTHER
  Make employee_id NULLABLE in V2 (non-employees have none) — ALTER the column to allow NULL. Existing rows default to person_kind='EMPLOYEE', which is correct.
- Backend: /api/identify must accept the new shape. For non-employees, skip the draft lookup entirely and always return {resume:false}. Validation: employee_id required when person_kind=EMPLOYEE; non_employee_type required when NON_EMPLOYEE; non_employee_other_desc required when type=OTHER.
- Note the existing reporter_category field on the report (STAFF/CONTRACTOR/OTHER/VISITOR) is separate from this identity flow; if it becomes redundant with non_employee_type you may keep it for the checklist context, but do not remove it in this phase unless it is clearly unused.

--- CHANGE 6: UI / visual overhaul ---
Current UI is flat and unappealing. Introduce a modern, mobile-first look with light 3D atmosphere and reasonable animation, WITHOUT hurting load time on a mid-range phone.
- Component library: adopt shadcn/ui style components (Radix + Tailwind). If adding shadcn/ui is heavy, at minimum introduce Tailwind-based styled components with the same clean aesthetic. Keep bundle lean.
- Animation: use Framer Motion for (a) step-to-step wizard transitions, (b) field/section entrance, (c) button press feedback, (d) a satisfying submit-success animation. Keep animations short (150-300ms) and subtle. Respect prefers-reduced-motion.
- 3D atmosphere: add a SINGLE lightweight animated background using Vanta.js (e.g. a subtle "fog" or "net" effect) on the identity/landing screen and optionally the success screen ONLY. Do NOT put 3D behind the form steps (keep those fast and legible). Lazy-load Vanta and its three.js dependency so it does not block first paint; if the device is low-powered or prefers-reduced-motion, skip the effect and fall back to a static background.
- COLOR PALETTE (use these exact roles/hex; semantic, not decorative):
    Green  #0F7B3F  -> "go/confirm": Save, Submit, Next, safe/positive states, success.
    Red    #C0392B  -> "alert": HIGH severity, errors, validation failures, danger.
    Gold   #C79A2E  -> brand/accent: headers, active step in the stepper, focus rings, highlights.
    White  #FFFFFF  -> base surface for cards and form background.
    Ink    #1F2A24  -> primary text/labels.
  Use gold as the accent sparingly; green and red carry safety meaning so don't use them arbitrarily. Ensure text contrast passes on white. Must remain fully legible in bright/outdoor conditions (high contrast).
- Keep it mobile-first: large tap targets, single column, minimal wasted space. The whole flow must still work end-to-end on a narrow (~380px) viewport.

--- API BASE URL (do not regress) ---
The frontend is served by Spring Boot as static files in production and must keep calling the API via the relative path `/api` (same origin). Do NOT hardcode localhost or any absolute host. After building the frontend, ensure the built assets are copied into backend/src/main/resources/static so the single-server deployment keeps working.

=======================================================================
E2E TEST CONTRACT (required for automated verification)
=======================================================================
Playwright tests locate elements via data-testid. You MUST expose these EXACT attributes:

Identity page — common:
- Employee/Non-employee choice: `data-testid="person-kind-employee"` and `data-testid="person-kind-non-employee"` (buttons/toggles; active one has aria-pressed="true").
- Name input: `data-testid="identity-name"`
- Location dropdown: `data-testid="identity-location"` (a <select>; options' values are the exact location strings above).
- Continue button: `data-testid="identity-continue"`

Identity page — employee only (visible when employee chosen):
- Employee ID input: `data-testid="identity-empid"`
- Designation input: `data-testid="identity-designation"`

Identity page — non-employee only (visible when non-employee chosen):
- Sub-type buttons: `data-testid="nonemp-type-CONTRACTOR"`, `data-testid="nonemp-type-VISITOR"`, `data-testid="nonemp-type-OTHER"` (active has aria-pressed="true").
- Other description input (visible only when OTHER active): `data-testid="nonemp-other-desc"`

Resume banner (employee path only):
- Container `data-testid="resume-banner"`, mismatch note `data-testid="resume-mismatch-warning"`, resume button `data-testid="resume-continue"`, start-new `data-testid="resume-start-new"`.

Step 1 details (location, hod, reporter REMOVED from here):
- Report type multi-select buttons: `data-testid="report-type-<VALUE>"` for each of NEAR_MISS, UNSAFE_ACT, UNSAFE_CONDITION, FIRE_INCIDENT, PERMIT_TO_WORK, BEHAVIOUR_BASED, SAFETY_VIOLATION. Active selected ones have aria-pressed="true". At most 3 may be active at once.
- Shift buttons `data-testid="shift-A|B|C|G"`; category `data-testid="category-STAFF|CONTRACTOR|OTHER|VISITOR"`; severity `data-testid="severity-HIGH|MEDIUM|LOW"`.
- Date `data-testid="details-date"`, time `data-testid="details-time"`.
- Description textarea `data-testid="details-description"` (REQUIRED — advancing with it empty must show `data-testid="details-description-error"`).
- Corrective action textarea `data-testid="details-corrective"`.
- Save button `data-testid="details-save"`; Next button `data-testid="details-next"`; save confirmation `data-testid="save-toast"`.
- There must be NO element with data-testid "details-location", "details-hod", or "details-reporter" (those are removed).

Step 2 checklist (unchanged from before):
- Row `data-testid="checklist-<CODE>"`, YES `data-testid="checklist-<CODE>-yes"`, NO `data-testid="checklist-<CODE>-no"` (active aria-pressed="true"); Back `data-testid="checklist-back"`, Submit `data-testid="checklist-submit"`.

Confirmation:
- `data-testid="confirm-screen"`, `data-testid="confirm-report-id"` (numeric id), `data-testid="report-another"`.

Acceptance: the app builds; V2 migration applies cleanly on top of V1; an employee can identify (with location dropdown), pick up to 3 report types, fill a mandatory description, save, resume, complete the checklist, and submit; a non-employee (including Other with description) can complete a fresh submission and is NOT offered resume; removed fields are gone; the new palette and animations are present; and the built frontend is copied into the backend static folder.
