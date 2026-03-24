# Project: pi-verify

## Description

A Pi extension that auto-detects project type and runs verification checks (typecheck, lint, test, build). Provides /verify command with subcommands: all, test, lint, quick. Shows results in status bar.

## Core Value

Saves AI coding agents tokens and time by providing unified, structured pass/fail verification feedback instead of requiring individual command execution and raw output parsing.

## Current State

| Attribute    | Value                  |
| ------------ | ---------------------- |
| Version      | 0.1.0                  |
| Status       | Discovery / Onboarding |
| Last Updated | 2026-03-24             |

**Current system summary:**

- New project based on ayagmar/pi-extension-template
- Existing TypeScript codebase with src/ directory containing commands.ts, constants.ts, index.ts, tool.ts, types.ts
- Node.js project with package.json, ESLint, Prettier configured

## Scope Snapshot

### Active

- /verify command with all/test/lint/quick subcommands
- Node.js project detection (package.json)
- Structured pass/fail output
- verify_check tool for model-callable use

### Planned

- Rust/Python/Go detection
- Caching of check results
- Custom check configurations

### Out of Scope

- None explicitly yet

## Target Users

**Primary:** AI coding agents using Pi who need fast feedback on whether their changes broke anything.

- Need: Reduce the edit-check-fix loop
- Success: Run /verify all and get structured pass/fail without parsing raw command output

## Constraints

- TypeScript strict mode required
- node:test for testing
- ESLint + Prettier for code quality
- Built on ayagmar/pi-extension-template
- Status bar shows last check result

## Success Metrics

- Agent can run `/verify all` and get structured pass/fail without parsing raw command output

## Key Decisions

| Decision                                                         | Rationale                                                                | Date       | Status |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------- | ------ |
| Layered artifact model (`PROJECT.md` + `PRD.md`) adopted at init | Keep hot-path context concise while preserving deeper product definition | 2026-03-24 | Active |

## Links

- `PRD.md` — deeper product-definition context
- `.paul/ROADMAP.md` — milestone and phase structure

---

_Created: 2026-03-24_
