# Project: pi-verify

## Description

A Pi extension that auto-detects project type and runs verification checks (typecheck, lint,
test, build). Provides /verify command with subcommands: all, test, lint, quick. Shows results
in status bar with structured, colored output.

## Core Value

Saves AI coding agents tokens and time by providing unified, structured pass/fail verification
feedback instead of requiring individual command execution and raw output parsing.

## Current State

| Attribute    | Value       |
| ------------ | ----------- |
| Version      | 1.0.0       |
| Status       | Shipped ✅  |
| Last Updated | 2026-03-25  |

**Current system summary:**

- TypeScript extension with full verify pipeline: typecheck, test, lint, format
- Multi-language support: Node.js, Rust, Python, Go, Swift (auto-detection)
- Configuration system: `.verifyrc.json` for custom commands per project
- Parallel check execution for faster verification runs
- Structured JSON output with parsed test results (Jest/Vitest/node:test)
- Error aggregation, categorization, and chalk-colored output
- Structured JSON output with parsed test results (Jest/Vitest/node:test)
- Watch mode detection for Jest and Vitest
- Error aggregation, categorization, and chalk-colored output
- `verify_check` tool returns structured `errorSummary` with actionable suggestions

## Scope Snapshot

### Validated (v1.1.0)

- [x] `/verify` command with all/test/lint/quick subcommands — v1.0
- [x] Node.js project detection (package.json) — v0.1
- [x] Multi-language project detection (Rust, Python, Go, Swift) — v1.0
- [x] Structured pass/fail output with parsed test results — v0.1
- [x] Progress callbacks for real-time status updates — v0.2
- [x] Watch mode detection (Jest, Vitest) — v0.2
- [x] Error summarization with categories and fix suggestions — v0.2
- [x] `verify_check` tool for model-callable use — v0.1
- [x] `.verifyrc.json` configuration for custom check commands — v1.0
- [x] Parallel execution for independent checks (typecheck, lint, format) — v1.0
- [x] Clean npm-publishable package with exports map — v1.0

### Active (v1.2+)

### Planned (v1.2+)
- Caching of check results — v1.2 consideration
- Plugin ecosystem for custom checks — v1.3 consideration

### Out of Scope

- IDE/editor integrations — future consideration

## Target Users

**Primary:** AI coding agents using Pi who need fast feedback on whether their changes broke
anything.

- Need: Reduce the edit-check-fix loop
- Success: Run /verify all and get structured pass/fail with categorized errors and fix
  suggestions without parsing raw command output

## Constraints

- TypeScript strict mode required
- node:test for testing
- ESLint + Prettier for code quality
- Built on ayagmar/pi-extension-template
- Status bar shows last check result

## Success Metrics

- Agent can run `/verify all` and get structured pass/fail without parsing raw command output
- Failing checks surface categorized errors with actionable fix suggestions

## Key Decisions

| Decision                                                         | Rationale                                                                | Date       | Status |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------- | ------ |
| Layered artifact model (`PROJECT.md` + `PRD.md`) adopted at init | Keep hot-path context concise while preserving deeper product definition | 2026-03-24 | Active |
| Structured JSON output for all verification results              | Model can parse without regex                                            | 2026-03-24 | Active |
| Progress callbacks in runCheck for real-time status              | Better UX during long-running tests                                      | 2026-03-24 | Active |
| chalk for colored terminal output                                | Better visual feedback; installed in Phase 3, used in Phase 4            | 2026-03-24 | Active |
| Top-level chalk import (not dynamic)                             | ESLint no-restricted-syntax rule forbids dynamic imports                 | 2026-03-24 | Active |
| Error categorization is best-effort pattern matching             | Cannot guarantee parsing all tool output formats                         | 2026-03-24 | Active |
| TODD post-task hook confirmed as enforcement gate                | Adversarial test proved regression blocking fires before commit          | 2026-03-24 | Active |
| Config uses `null` for disabled checks                           | Allows explicitly disabling checks vs. omitting them                     | 2026-03-25 | Active |
| Parallel runs independent checks first, test last               | Tests often depend on typecheck/lint; sequencing avoids false failures   | 2026-03-25 | Active |
| `starters/` directory deleted before publish                    | Template files not needed in runtime package; clean tarball              | 2026-03-25 | Active |
| Exports map added to package.json                               | Future-proof ESM/CJS dual compatibility for npm consumers                | 2026-03-25 | Active |
| DEAN block override valid when vulns are pre-existing in dep tree  | Planned files add no new deps; Δ=0 at post-apply confirmed no regression | 2026-03-25 | Active |
| All 12 PALS modules fire correctly in a single APPLY cycle          | SETH/IRIS/OMAR/GABE/LUKE/ARIA/PETE/DANA/REED/TODD/DEAN/DOCS all triggered | 2026-03-25 | Active |

## Links

- `PRD.md` — deeper product-definition context
- `.paul/ROADMAP.md` — milestone and phase structure

---

_Last updated: 2026-03-25 after v1.1 Adversarial Module Bait (milestone complete)_
