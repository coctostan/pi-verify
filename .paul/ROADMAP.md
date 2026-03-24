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

**v0.3 Module Audit** (v0.3.0) ✓
Status: Complete
Phases: 1 of 1 complete

Theme: Adversarial testing of PALS module enforcement — validate TODD blocks regressions.

**v0.4 Deep Module Audit** (v0.4.0) ✓
Status: Complete
Phases: 1 of 1 complete

Theme: Comprehensive module stress test — validate all 6 PALS modules (TODD, WALT, DEAN,
IRIS, RUBY, SKIP, DOCS).

## Completed Milestones

**v0.1 Initial Release** (v0.1.0) ✓
Status: Complete
Phases: 1 of 1 complete

**v0.2 Test Runner Improvements** (v0.2.0) ✓
Status: Complete
Phases: 4 of 4 complete

**v0.3 Module Audit** (v0.3.0) ✓
Status: Complete
Phases: 1 of 1 complete

**v0.4 Deep Module Audit** (v0.4.0) ✓
Status: Complete
Phases: 1 of 1 complete

**v0.6 Two-Step Dispatch Test** (v0.6.0) ✓
Status: Complete
Phases: 1 of 1 complete

Theme: Test explicit two-step dispatch (advisory collection → enforcement) to ensure
IRIS/RUBY/DOCS/SKIP output is visible before WALT block enforcement.

## Current Milestone

**Next: v0.7 Multi-language Support** (v0.7.0)
Status: 🚧 Planning
Phases: Not started

Theme: Test explicit two-step dispatch (advisory collection → enforcement) to ensure
IRIS/RUBY/DOCS/SKIP output is visible before WALT block enforcement.

## Phases

| Phase | Name                        | Plans | Status   | Completed  |
| ----- | --------------------------- | ----- | -------- | ---------- |
| 1     | Core Verify Command         | 01-01 | Complete | 2026-03-24 |
| 2     | Test Output Formatting      | 02-01 | Complete | 2026-03-24 |
| 3     | Watch Mode Support          | 03-01 | Complete | 2026-03-24 |
| 4     | Error Summarization         | 04-01 | Complete | 2026-03-24 |
| 5     | Adversarial Testing         | 05-01 | Complete | 2026-03-24 |
| 6     | Advisory Module Stress Test | 06-01 | Complete | 2026-03-24 |
| 8     | Two-Step Dispatch Test      | 08-01 | Complete | 2026-03-24 |

Note: Phase 7 was reserved for collect-then-block validation (aborted after confirming
stop-on-block semantics).

## Phase Details

### Phase 6: Advisory Module Stress Test

Focus: Simultaneously trigger all module hooks — RUBY (debt), IRIS (smells/security),
SKIP (decisions), DOCS (drift), WALT (lint) — to verify comprehensive PALS enforcement.

### Phase 8: Two-Step Dispatch Test

Focus: Test explicit two-step dispatch where advisory modules (IRIS, RUBY, DOCS, SKIP)
run and output BEFORE enforcement modules (WALT) issue blocks.

Plans: TBD (defined during /paul:plan)

## Future Milestones

- v0.7: Multi-language support (Rust/Python/Go)
- v0.8: Caching of check results
- v0.9: Custom check configurations

---

_Roadmap updated: 2026-03-24 — v0.6 Two-Step Dispatch Test complete_
