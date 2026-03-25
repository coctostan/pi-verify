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
| Version      | 1.0.0-beta  |
| Status       | In Progress |
| Last Updated | 2026-03-25  |
| ------------ | ----------  |
| Version      | 0.6.0       |
| Status       | Shipped     |
| Last Updated | 2026-03-24  |

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

### Active

- /verify command with all/test/lint/quick subcommands
- Node.js project detection (package.json)
- Multi-language project detection (Rust, Python, Go, Swift)
- Structured pass/fail output with parsed test results
- Progress callbacks for real-time status updates
- Watch mode detection (Jest, Vitest)
- Error summarization with categories and fix suggestions
  - verify_check tool for model-callable use
  - `.verifyrc.json` configuration for custom check commands
  - Parallel execution for independent checks (typecheck, lint, format)
- Node.js project detection (package.json)
- Structured pass/fail output with parsed test results
- Progress callbacks for real-time status updates
- Watch mode detection (Jest, Vitest)
- Error summarization with categories and fix suggestions
- verify_check tool for model-callable use

### Planned

- Caching of check results — Phase 13+
- Caching of check results
- Custom check configurations

### Out of Scope

- None explicitly yet

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

## Links

- `PRD.md` — deeper product-definition context
- `.paul/ROADMAP.md` — milestone and phase structure

---

_Last updated: 2026-03-25 after Phase 12 (Config & Parallel complete)_
