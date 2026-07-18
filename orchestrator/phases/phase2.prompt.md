We are building an EHS Reporting Portal. Stack: Java 21 + Spring Boot 3, Spring Data JPA, MySQL 8, Flyway, Maven for the backend; React 18 + Vite + TypeScript for the frontend. Scope is capture-only: a user scans a QR code, identifies themselves, fills a 2-step form (details then YES/NO checklists), and we save it to the DB. No notifications, dashboards, or escalation — those are out of scope. Keep the UI compact and content-dense with minimal wasted space. Build exactly what each phase asks and stop at its acceptance check.

---

PHASE 2 TASK:

Backend API

Implement the REST API. All endpoints under `/api`, JSON in/out, Bean Validation on request DTOs, and a `@RestControllerAdvice` returning clean 400/404 bodies.

Endpoints:
1. `POST /api/identify` — body {name, employeeId, designation}. Look up the most recent DRAFT for that employeeId via the repository method. If none, return {resume:false}. If found, compute closeness in Java with `org.apache.commons.text.similarity.JaroWinklerSimilarity` (returns 0–1) on name and designation; set `mismatchWarning = nameSim < 0.85 || desgSim < 0.85`. Return {resume:true, report:<full report incl checklist>, mismatchWarning}.
2. `POST /api/reports` — body: identity + optional Step-1 fields. Creates a report with status DRAFT, seeds its checklist_item rows from the template (all answers null). Returns the created report.
3. `PUT /api/reports/{id}/details` — updates Step-1 fields only, bumps updated_at. Used by both Save and Next.
4. `PUT /api/reports/{id}/checklist` — body: list of {itemCode, answer}. Upserts answers on existing rows (match by report_id+item_code). Ignores unknown codes.
5. `POST /api/reports/{id}/submit` — validate required fields (report_type, severity, event_date present at minimum), set status SUBMITTED, return final report. Reject if already SUBMITTED.
6. `GET /api/reports/{id}` — full report + checklist.
7. `GET /api/checklist-template` — the canonical sections/items list (hardcode from the constants below).

Checklist template constants (section, code, label):
PPE: PPE_01 Head protection – helmet; PPE_02 Eyes & face – goggles/shields; PPE_03 Ears – plugs/muffs; PPE_04 Hands & arms – gloves; PPE_05 Body – chemical resistant/boiler suit/apron; PPE_06 Feet & legs – safety shoes/gum boots; PPE_07 PPE against fall (harness, lifelines); PPE_08 Respiratory – masks/SCBA.
BEHAVIOUR: BEH_01 Changing attitude while observed; BEH_02 Irresponsible/rash behaviour.
TOOLS: TOOL_01 Adequate for work; TOOL_02 Used correctly; TOOL_03 In good condition.
RISK: RISK_01 Machine guarding; RISK_02 Only authorised doing job; RISK_03 Hot surfaces/sharp objects; RISK_04 Electric shock/loose wiring; RISK_05 Critical equipment, fire & gangways clear; RISK_06 Chemical exposure/handling safely; RISK_07 Fire/smouldering/explosion; RISK_08 Motor vehicle collision/moving objects; RISK_09 Slips, trips, falls; RISK_10 Strain (MSD)/foreign object in eye; RISK_11 Caught in between/striking against; RISK_12 LOTO in place; RISK_13 Cylinders chained/proper lifting; RISK_14 Housekeeping & tidy.
PROCEDURES: PROC_01 Needs improvement in procedure/SOP; PROC_02 Permit procedure followed; PROC_03 Adhered to SOP.

Put these in one `ChecklistTemplate` constant class used by both the seed logic (endpoint 2) and endpoint 7 so there is one source of truth.

Acceptance: exercise every endpoint with curl/HTTP file; identify→create→save details→save checklist→submit works and persists.
