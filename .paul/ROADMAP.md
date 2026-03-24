# Roadmap: pi-verify

## Overview

A Pi extension that auto-detects project type and runs verification checks (typecheck, lint,
test, build). Provides /verify command with subcommands: all, test, lint, quick. Shows results
in status bar.

## Completed Milestones

**v0.1 Initial Release** (v0.1.0) ✓
Status: Complete
Phases: 1 of 1 complete

**v0.2 Test Runner Improvements** (v0.2.0) ✓
Status: Complete
Phases: 4 of 4 complete

Theme: Improve test output formatting, add watch mode detection, and better error summarization
for the verify command

## Current Milestone

**v0.3 Module Audit** (v0.3.0) ✓
Status: Complete
Phases: 1 of 1 complete

Theme: Adversarial testing of PALS module enforcement — validate that TODD, WALT, and DEAN
catch regressions and violations during apply.

## Phases

| Phase | Name                   | Plans | Status   | Completed  |
| ----- | ---------------------- | ----- | -------- | ---------- |
| 1     | Core Verify Command    | 01-01 | Complete | 2026-03-24 |
| 2     | Test Output Formatting | 02-01 | Complete | 2026-03-24 |
| 3     | Watch Mode Support     | 03-01 | Complete | 2026-03-24 |
| 4     | Error Summarization    | 04-01 | Complete | 2026-03-24 |
| 5     | Adversarial Testing    | 05-01 | Complete | 2026-03-24 |

## Phase Details

### Phase 5: Adversarial Testing

Focus: Intentionally introduce a breaking change to `detectProjectType` (always returns
`'unknown'`) to verify that TODD's post-task hook catches the test regression before APPLY
completes.

Plans: TBD (defined during /paul:plan)

## Future Milestones

- v0.4: Multi-language support (Rust/Python/Go)
- v0.5: Caching of check results
- v0.6: Custom check configurations

---

_Roadmap updated: 2026-03-24 — v0.3 Module Audit complete_
