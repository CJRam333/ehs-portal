# EHS Reporting Portal

Capture-only portal for Environment, Health & Safety reports. A user scans a QR
code, identifies themselves, fills a 2-step form (details, then YES/NO
checklists), and the submission is saved to the database. No notifications,
dashboards, or escalation — out of scope.

## Stack

- **Backend:** Java 21, Spring Boot 3.3, Spring Data JPA, MySQL 8, Flyway, Maven
- **Frontend:** React 18, Vite, TypeScript

## Layout

```
ehs-portal/
  backend/      Spring Boot API (Maven, Java 21)
    api.http    Sample API calls for the whole flow (VS Code REST Client / JetBrains)
  frontend/     Vite + React + TypeScript SPA
  README.md
```

## Application flow

```
 ┌─────────────┐   scan QR → open base URL
 │   QR code   │─────────────────────────────┐
 └─────────────┘                              ▼
                                    ┌────────────────────┐
                                    │  Identity gate  /  │  name, employee id, designation
                                    │  (also /scan)      │  → POST /api/identify
                                    └─────────┬──────────┘  → POST /api/reports (new)
                                              │                or resume an existing draft
                                              ▼
                                    ┌────────────────────┐
                                    │  Details  /details │  type, shift, category, severity,
                                    │  (Step 1)          │  location, date/time, description…
                                    └─────────┬──────────┘  → PUT /api/reports/{id}/details
                                              │
                                              ▼
                                    ┌────────────────────┐
                                    │ Checklist /checklist│ YES/NO per item, grouped by section
                                    │  (Step 2)          │  → GET /api/checklist-template
                                    └─────────┬──────────┘  → PUT /api/reports/{id}/checklist
                                              │              → POST /api/reports/{id}/submit
                                              ▼
                                    ┌────────────────────┐
                                    │   Confirmation     │  report reference #, "Report another"
                                    └────────────────────┘
```

A report is created as a `DRAFT` at the identity step and flipped to `SUBMITTED`
by the final submit. Returning with the same employee id offers to resume the
draft.

## QR code

The QR code should encode the **deployed base URL** — e.g. `https://your-host/`.
That URL lands directly on the identity gate (`/`), so no special QR handling is
needed. For convenience there is also a `/scan` route that simply redirects to
`/`, so a QR encoding `https://your-host/scan` works identically. Generate the QR
with any tool (e.g. `qrencode -o ehs.png "https://your-host/"`).

## Prerequisites

- **Java 21** (JDK)
- **Maven 3.9+**
- **Node.js 18+** and npm
- A running **MySQL 8** server. You need a database named `ehs` and a user that
  can access it. The database/schema must already exist — the app does not
  create the database itself, but Flyway creates the tables on first startup.

Create the database and user once (adjust the password to taste):

```sql
CREATE DATABASE ehs;
CREATE USER 'ehs'@'localhost' IDENTIFIED BY 'ehs';
GRANT ALL PRIVILEGES ON ehs.* TO 'ehs'@'localhost';
FLUSH PRIVILEGES;
```

## Database environment variables

The backend reads its connection details from environment variables, falling
back to localhost defaults. Set these to match your MySQL server:

| Variable  | Default                                                          |
| --------- | ---------------------------------------------------------------- |
| `DB_URL`  | `jdbc:mysql://localhost:3306/ehs?useSSL=false&serverTimezone=UTC` |
| `DB_USER` | `ehs`                                                            |
| `DB_PASS` | `ehs`                                                            |

**PowerShell (Windows):**

```powershell
$env:DB_URL = "jdbc:mysql://localhost:3306/ehs?useSSL=false&serverTimezone=UTC"
$env:DB_USER = "ehs"
$env:DB_PASS = "ehs"
```

**bash/zsh (macOS/Linux):**

```bash
export DB_URL="jdbc:mysql://localhost:3306/ehs?useSSL=false&serverTimezone=UTC"
export DB_USER="ehs"
export DB_PASS="ehs"
```

## Run from a fresh clone

Two processes: the API and the SPA. Start MySQL first, then:

### 1. Backend

From `backend/`:

```bash
mvn spring-boot:run
```

The API starts on <http://localhost:8080> (context path `/`). On startup it
connects to MySQL and runs Flyway migrations to create the schema.

To build a jar instead:

```bash
mvn -DskipTests package
java -jar target/*.jar
```

### 2. Frontend

From `frontend/`:

```bash
npm install
npm run dev
```

The Vite dev server serves the app on <http://localhost:5173> and proxies any
`/api/*` request to the backend at <http://localhost:8080>. Open
<http://localhost:5173> in a browser — you land on the identity gate.

To build the production bundle:

```bash
npm run build      # outputs static assets to frontend/dist/
npm run preview    # serve the built bundle locally to verify
```

In production, serve `frontend/dist/` behind any static host or reverse proxy,
and route `/api/*` to the backend.

## Mobile

The UI is mobile-first (the BRD mandates mobile accessibility): a centered,
max-width container on desktop, wrap-friendly segmented controls, and ~40px tap
targets throughout so the long checklist is comfortable to tap on a phone. Test
it by opening the dev server on your phone (same network, `http://<your-ip>:5173`)
or with your browser's device toolbar at a narrow viewport (e.g. 360px wide).

## API sample calls

`backend/api.http` contains the full request flow (identify → create → details →
template → checklist → submit → read back) with sample bodies. Open it with the
VS Code **REST Client** extension or a JetBrains IDE and send the requests top to
bottom — the created report id is captured and reused automatically.

### Endpoints

| Method | Path                             | Purpose                                  |
| ------ | -------------------------------- | ---------------------------------------- |
| POST   | `/api/identify`                  | Check for a resumable draft              |
| POST   | `/api/reports`                   | Create a new report (DRAFT)              |
| PUT    | `/api/reports/{id}/details`      | Save Step-1 details                      |
| GET    | `/api/checklist-template`        | Canonical checklist, grouped by section  |
| PUT    | `/api/reports/{id}/checklist`    | Save YES/NO answers                      |
| POST   | `/api/reports/{id}/submit`       | Submit (DRAFT → SUBMITTED; 409 if resub) |
| GET    | `/api/reports/{id}`              | Read a report back                       |
