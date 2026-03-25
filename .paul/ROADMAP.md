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

Theme: Comprehensive module stress test — validate all 6 PALS modules.

**v0.6 Two-Step Dispatch Test** (v0.6.0) ✓
Status: Complete
Phases: 1 of 1 complete

Theme: Test explicit two-step dispatch (advisory collection → enforcement).

**v0.7 Hardened Module Retest** (v0.7.0) ✓
Status: Complete
Phases: 1 of 1 complete

Theme: Hardened retest of two-step dispatch with all 5 triggers verified.

**v1.0 Ship-Ready Product** (v1.0.0) ✓
Status: Complete — SHIPPED
Phases: 4 of 4 complete

Theme: Production-ready pi-verify with multi-language support, configuration system,
and npm publication.

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
| 9     | Full Retest                 | 09-01 | Complete | 2026-03-24 |
| 10    | Cleanup & Identity          | 10-01 | Complete | 2026-03-25 |
| 11    | Multi-Language Core         | 11-01 | Complete | 2026-03-25 |
| 12    | Config & Parallel           | 12-01 | Complete | 2026-03-25 |
| 13    | Publish Prep                | 13-01 | Complete | 2026-03-25 |

Notes:

- Phase 7 reserved for future use (was collect-then-block validation, canceled)
- v0.5 milestone canceled after confirming stop-on-block semantics

## Phase Details

### Phase 10: Cleanup & Identity

Focus: Package identity fix (rename to pi-verify, v1.0.0), remove complexity bait functions,
deduplicate formatters, rewrite README as product docs.

### Phase 11: Multi-Language Core

Focus: Add Rust, Python, Go, Swift detection with project detection and standard check commands.

### Phase 12: Config & Parallel

Focus: .verifyrc.json configuration, parallel check execution, custom shell commands.

### Phase 13: Publish Prep

Focus: npm-ready package.json, exports map, delete starters/, final polish for publication.

## Future Milestones

- v1.1: Enhanced multi-language support (additional languages)
- v1.2: Caching of check results
- v1.3: Plugin ecosystem for custom checks

---

_Roadmap updated: 2026-03-25 — v1.0 milestone complete, pi-verify ready for npm publication_
