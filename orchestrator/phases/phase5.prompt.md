We are building an EHS Reporting Portal. Stack: Java 21 + Spring Boot 3, Spring Data JPA, MySQL 8, Flyway, Maven for the backend; React 18 + Vite + TypeScript for the frontend. Scope is capture-only: a user scans a QR code, identifies themselves, fills a 2-step form (details then YES/NO checklists), and we save it to the DB. No notifications, dashboards, or escalation — those are out of scope. Keep the UI compact and content-dense with minimal wasted space. Build exactly what each phase asks and stop at its acceptance check.

---

PHASE 5 TASK:

QR landing, styling pass, docs

Finalize.
- QR route: the QR code should encode the deployed base URL (e.g. `https://host/`) which already lands on the identity gate — no separate handling needed, but add a short note in the README and, optionally, a `/scan` alias that redirects to `/`.
- Styling pass: consistent compact spacing, readable segmented controls, mobile-first layout (the BRD mandates mobile accessibility), sensible max-width container centered on desktop. Ensure the long checklist is comfortable to tap on a phone.
- Empty/error states: network failure toast, validation messages inline, disabled buttons while requests are in flight.
- README: full run instructions, env vars, and a diagram/description of the flow. Add a `.http` file or Postman collection with sample calls.

Acceptance: runs cleanly from a fresh clone following only the README; works on a narrow mobile viewport.
