#!/usr/bin/env python3
"""
EHS Portal build orchestrator.

Drives Claude Code through build phases one at a time. For each phase it:
  1. sends the phase's prompt to Claude Code in headless mode,
  2. runs that phase's INDEPENDENT acceptance test (a shell script we trust),
  3. on pass -> advances to the next phase,
  4. on fail -> feeds the test output back to Claude Code to fix, up to 3 attempts,
  5. after 3 failed attempts -> stops and notifies the human, saving all logs.

The intelligence lives in Claude Code. This script is a deliberately dumb,
deterministic state machine so the verification gate is trustworthy.

Usage:
  python orchestrate.py                 # run all phases from where we left off
  python orchestrate.py --from 2        # force-start at phase 2
  python orchestrate.py --only 3        # run just phase 3
  python orchestrate.py --max-attempts 5

Prereqs:
  - `claude` CLI installed and authenticated (Claude Code).
  - Each phase has a prompt file  phases/phaseN.prompt.md
    and a test script         phases/phaseN.test.sh  (exit 0 = pass).
  - Run this from the repo root (or pass --workdir).
"""

import argparse
import datetime as dt
import json
import os
import pathlib
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve().parent
PHASES_DIR = HERE / "phases"
STATE_FILE = HERE / ".orchestrator_state.json"
LOG_DIR = HERE / "logs"

IS_WINDOWS = os.name == "nt"

# ---- phase registry -------------------------------------------------------
# Ordered list of phase ids. Each id maps to phases/<id>.prompt.md and
# phases/<id>.test.sh. Rename/add freely; order here is the run order.
PHASES = ["phase0", "phase1", "phase2", "phase3", "phase4", "phase5"]

# ANSI colors — disabled unless the terminal is a TTY that renders them.
# Set ORCH_COLOR=1 to force on. Avoids garbled codes in some Windows shells.
_use_color = sys.stdout.isatty() and (not IS_WINDOWS or os.environ.get("ORCH_COLOR") == "1")
if _use_color:
    RESET = "\033[0m"; BOLD = "\033[1m"
    RED = "\033[31m"; GREEN = "\033[32m"; YELLOW = "\033[33m"; BLUE = "\033[34m"
else:
    RESET = BOLD = RED = GREEN = YELLOW = BLUE = ""


def log(msg, color=""):
    stamp = dt.datetime.now().strftime("%H:%M:%S")
    print(f"{color}{BOLD}[{stamp}]{RESET}{color} {msg}{RESET}", flush=True)


def load_state():
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {"completed": []}


def save_state(state):
    STATE_FILE.write_text(json.dumps(state, indent=2))


def read_prompt(phase_id):
    p = PHASES_DIR / f"{phase_id}.prompt.md"
    if not p.exists():
        log(f"Missing prompt file: {p}", RED)
        sys.exit(1)
    return p.read_text()


def _claude_exe():
    """Resolve the Claude Code launcher. On Windows it's claude.cmd."""
    from shutil import which
    for name in (("claude.cmd", "claude.exe", "claude") if IS_WINDOWS else ("claude",)):
        found = which(name)
        if found:
            return found
    return "claude.cmd" if IS_WINDOWS else "claude"


def run_claude(prompt, workdir, log_path):
    """
    Invoke Claude Code headlessly. --print runs a single non-interactive turn.
    The prompt is fed on STDIN rather than as an argv element: it's long,
    multi-line, and full of shell metacharacters, so passing it via stdin avoids
    all shell-quoting problems (and works identically on Windows and POSIX).
    We pre-authorize tools so it never blocks on a permission prompt mid-loop.
    """
    cmd = [
        _claude_exe(),
        "--print",
        "--output-format", "text",
        "--permission-mode", "acceptEdits",
        "--allowedTools", "Edit,Write,Read,Bash,Grep,Glob",
    ]
    log("Invoking Claude Code (headless)...", BLUE)
    with open(log_path, "w", encoding="utf-8") as lf:
        proc = subprocess.run(
            cmd, cwd=workdir, input=prompt,
            stdout=lf, stderr=subprocess.STDOUT, text=True, encoding="utf-8",
        )
    return proc.returncode




def _bash_exe():
    """Find a bash interpreter. On Windows, prefer Git Bash's bash.exe."""
    if not IS_WINDOWS:
        return "bash"
    # Common Git-for-Windows locations, then fall back to PATH.
    candidates = [
        r"C:\Program Files\Git\bin\bash.exe",
        r"C:\Program Files\Git\usr\bin\bash.exe",
        r"C:\Program Files (x86)\Git\bin\bash.exe",
    ]
    for c in candidates:
        if pathlib.Path(c).exists():
            return c
    return "bash"  # assume it's on PATH (e.g. running from Git Bash)


def run_test(phase_id, workdir, log_path):
    """Run the phase's independent acceptance test. Exit 0 == pass."""
    test = PHASES_DIR / f"{phase_id}.test.sh"
    if not test.exists():
        log(f"Missing test script: {test} (treating as auto-pass)", YELLOW)
        return 0, ""
    log(f"Running acceptance test: {test.name}", BLUE)
    with open(log_path, "w", encoding="utf-8") as lf:
        proc = subprocess.run(
            [_bash_exe(), str(test)], cwd=workdir,
            stdout=lf, stderr=subprocess.STDOUT, text=True,
        )
    output = pathlib.Path(log_path).read_text(encoding="utf-8", errors="replace")
    return proc.returncode, output


def build_fix_prompt(phase_id, original_prompt, test_output, attempt):
    """Prompt Claude Code with the failing test output so it can self-correct."""
    return f"""The previous attempt at {phase_id} did not pass its acceptance test.
This is fix attempt {attempt}.

Here is the acceptance test output (the failure is somewhere in here):

--- TEST OUTPUT START ---
{test_output[-6000:]}
--- TEST OUTPUT END ---

Diagnose the failure and fix the code so the acceptance test passes. Do not
re-scaffold from scratch; make the minimal changes needed. The original task
for this phase was:

{original_prompt}
"""


def run_phase(phase_id, workdir, max_attempts):
    LOG_DIR.mkdir(exist_ok=True)
    original_prompt = read_prompt(phase_id)
    prompt = original_prompt

    for attempt in range(1, max_attempts + 1):
        log(f"=== {phase_id} — attempt {attempt}/{max_attempts} ===", BOLD)

        cc_log = LOG_DIR / f"{phase_id}_attempt{attempt}_claude.log"
        run_claude(prompt, workdir, cc_log)

        test_log = LOG_DIR / f"{phase_id}_attempt{attempt}_test.log"
        code, output = run_test(phase_id, workdir, test_log)

        if code == 0:
            log(f"{phase_id} PASSED on attempt {attempt}.", GREEN)
            return True

        log(f"{phase_id} failed acceptance test (attempt {attempt}).", YELLOW)
        if attempt < max_attempts:
            prompt = build_fix_prompt(phase_id, original_prompt, output, attempt + 1)

    # Exhausted attempts -> escalate.
    log(f"{phase_id} FAILED after {max_attempts} attempts. Stopping.", RED)
    log(f"Review logs in: {LOG_DIR}", RED)
    log("Fix manually or adjust the phase prompt/test, then re-run:", RED)
    log(f"    python orchestrate.py --from {phase_id.replace('phase','')}", RED)
    return False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--workdir", default=os.getcwd(),
                    help="repo root where Claude Code operates (default: cwd)")
    ap.add_argument("--from", dest="start", type=int, default=None,
                    help="phase number to start from (ignores saved state)")
    ap.add_argument("--only", type=int, default=None,
                    help="run only this single phase number")
    ap.add_argument("--max-attempts", type=int, default=3)
    args = ap.parse_args()

    workdir = str(pathlib.Path(args.workdir).resolve())
    state = load_state()

    if args.only is not None:
        targets = [f"phase{args.only}"]
    elif args.start is not None:
        idx = PHASES.index(f"phase{args.start}")
        targets = PHASES[idx:]
    else:
        targets = [p for p in PHASES if p not in state["completed"]]

    if not targets:
        log("All phases already completed. Nothing to do.", GREEN)
        return

    log(f"Workdir: {workdir}", BLUE)
    log(f"Phases to run: {', '.join(targets)}", BLUE)

    for phase_id in targets:
        ok = run_phase(phase_id, workdir, args.max_attempts)
        if not ok:
            sys.exit(2)  # escalation exit code
        if phase_id not in state["completed"]:
            state["completed"].append(phase_id)
            save_state(state)

    log("All requested phases completed successfully.", GREEN)


if __name__ == "__main__":
    main()
