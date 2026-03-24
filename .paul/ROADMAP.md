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

## Phases

| Phase | Name                   | Plans | Status   | Completed  |
| ----- | ---------------------- | ----- | -------- | ---------- |
| 1     | Core Verify Command    | 01-01 | Complete | 2026-03-24 |
| 2     | Test Output Formatting | 02-01 | Complete | 2026-03-24 |
| 3     | Watch Mode Support     | 03-01 | Complete | 2026-03-24 |
| 4     | Error Summarization    | 04-01 | Complete | 2026-03-24 |

## Phase Details

### Phase 2: Test Output Formatting

Focus: Improve formatting of test command output with better progress indicators and structured
results

### Phase 3: Watch Mode Support

Focus: Detect and support watch mode for test runners, with proper handling for long-running
processes

### Phase 4: Error Summarization

Focus: Better error aggregation and summarization across all verification checks

## Future Milestones

- v0.3: Multi-language support (Rust/Python/Go)
- v0.4: Caching of check results
- v0.5: Custom check configurations

---

_Roadmap updated: 2026-03-24 — v0.2 milestone complete_
