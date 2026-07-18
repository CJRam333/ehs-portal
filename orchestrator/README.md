# EHS Portal Build Orchestrator

A deliberately simple state machine that drives **Claude Code** through the EHS
Portal build, one phase at a time, with an automated build → test → retry →
escalate loop. The orchestrator itself contains no AI — the intelligence is
Claude Code. This script only decides *when to advance, retry, or stop*, and it
trusts an independent test rather than Claude's self-report.

## How it works

For each phase it:
1. Sends `phases/phaseN.prompt.md` to Claude Code in headless mode.
2. Runs `phases/phaseN.test.sh` — an independent acceptance test we trust.
3. **Pass** → mark phase complete, advance.
4. **Fail** → feed the test output back to Claude Code to fix. Retry up to 3×.
5. **3 failures** → stop, save logs, print how to resume. You take over.

State is saved in `.orchestrator_state.json`, so a re-run continues from the
last incomplete phase.

## Layout

```
orchestrator/
  orchestrate.py                # the runner
  phases/
    phase0.prompt.md            # what to tell Claude Code (task)
    phase0.test.sh              # how we verify it (exit 0 = pass)
    ... (through phase5)
  e2e/                          # Playwright end-to-end tests (phases 3-5)
    playwright.config.ts
    package.json
    run-e2e.sh                  # boots backend+frontend, runs a spec, tears down
    tests/
      helpers.ts                # selector contract + reusable steps
      phase3_gate_details.spec.ts
      phase4_checklist_submit.spec.ts
      phase5_full_journey.spec.ts
  logs/                         # per-attempt Claude + test output (created at runtime)
  .orchestrator_state.json      # progress (created at runtime)
```

## Prerequisites

- **Claude Code CLI** installed and authenticated. Verify with `claude --version`.
- **Java 21, Maven, Node 18+** on PATH.
- **Playwright** (for phases 3–5) installs itself on first run via `e2e/run-e2e.sh`
  (`npm install` + `npx playwright install chromium`), so the machine needs
  internet access the first time. On Linux CI you may also need the browser system
  deps — `run-e2e.sh` uses `--with-deps` to pull them.
- **A running MySQL 8** with an `ehs` schema and a user that can access it.
- **`mysql` client** on PATH (the phase-1 test uses it to inspect the schema).
- Export DB env vars so both the app and the tests agree:
  ```bash
  export DB_URL="jdbc:mysql://127.0.0.1:3306/ehs?useSSL=false&serverTimezone=UTC"
  export DB_HOST=127.0.0.1 DB_PORT=3306 DB_NAME=ehs DB_USER=ehs DB_PASS=ehs
  ```

## Run it

From your **repo root** (where `backend/` and `frontend/` will live):

```bash
# point at the orchestrator wherever you cloned it
python /path/to/orchestrator/orchestrate.py --workdir "$(pwd)"
```

Common variations:

```bash
# resume / start at a specific phase
python orchestrate.py --from 2

# run only one phase (e.g. re-run phase 3 after a manual fix)
python orchestrate.py --only 3

# be more forgiving before escalating
python orchestrate.py --max-attempts 5
```

Exit codes: `0` all good, `2` a phase escalated to you after 3 failed attempts.

## When it stops and asks for you

That's by design — the 3rd failure means Claude Code couldn't self-correct with
the test feedback alone. Open `logs/phaseN_attempt3_*.log`, see what the test
complained about, then either:
- fix the code yourself and re-run `--from N`, or
- sharpen the phase prompt (`phases/phaseN.prompt.md`) if the instruction was
  ambiguous, or
- loosen/repair the test (`phases/phaseN.test.sh`) if the test itself was wrong.

## Notes / cautions

- **Headless permissions.** The runner passes `--permission-mode acceptEdits`
  and a fixed `--allowedTools` set so Claude Code doesn't block on a prompt with
  no human present. Review that list in `orchestrate.py` and tighten it if you
  want a stricter sandbox. Running an agent unattended with edit/bash access is
  powerful — do it in a branch or a disposable working copy, not on `main`.
- **Frontend tests are real E2E now.** Phases 3–5 boot the backend + frontend
  and drive a headless Chromium through the actual user journey with Playwright
  (see `e2e/`). They locate elements via `data-testid` attributes; the phase 3–5
  prompts instruct Claude Code to add those exact attributes, and `e2e/tests/helpers.ts`
  holds the single source of truth for the selector contract. If you change a
  testid in one place, change it in both.
- **Flyway is not idempotent across reruns.** If a phase-1 retry fails because
  the schema already partially exists, drop and recreate the `ehs` schema between
  runs, or add a clean-DB step to `phase1.test.sh`.
- **This is Option A** (a plain script). If the workflow grows branches, parallel
  phases, or crash-resume needs, port the same phase files to **LangGraph** — its
  graph + conditional-edge + human-interrupt model maps directly onto this loop.
```
