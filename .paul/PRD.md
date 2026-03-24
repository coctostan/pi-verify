# Product Requirements: pi-verify

## Problem / Opportunity

AI coding agents waste tokens running individual check commands (typecheck, lint, test, build) and parsing unstructured output. This creates friction in the edit-check-fix loop and consumes unnecessary context window.

## Why Now

A unified verify command saves context tokens and gives structured pass/fail feedback instantly. This directly improves agent efficiency and reduces operational costs.

## Current State / Existing System Context

- New project bootstrapped from ayagmar/pi-extension-template
- TypeScript codebase with established patterns
- Existing src/ structure: commands.ts, constants.ts, index.ts, tool.ts, types.ts
- Node.js toolchain with pnpm

## Desired Outcome

Agents can invoke a single command or tool to verify code changes, receiving immediate structured feedback on what passed or failed without manual command orchestration.

## Target Users and Needs

### Primary Users

- **AI coding agents using Pi**
- **Need:** Fast feedback on whether changes broke anything
- **Success looks like:** One command yields complete verification status

## Requirements

### Must Have

- /verify command with all/test/lint/quick subcommands
- Node.js project detection (package.json)
- Structured pass/fail output
- verify_check tool for model-callable use

### Should Have / Nice to Have

- Rust/Python/Go detection
- Caching of check results
- Custom check configurations

### Explicitly Deferred

- Multi-language support (Rust/Python/Go) — focus on Node.js first
- Persistent caching — can be added later
- User-defined check configs — start with sensible defaults

### Out of Scope

- None explicitly yet

## Constraints & Dependencies

### Constraints

- TypeScript strict mode required
- node:test for testing
- ESLint + Prettier for code quality

### Dependencies / Integrations

- Built on ayagmar/pi-extension-template
- Status bar integration for showing last check result

## Assumptions

- Target projects use standard Node.js tooling (npm/pnpm/yarn, tsc, eslint, etc.)
- Agents prefer structured data over raw CLI output

## Open Questions

- None captured yet

## Recommended Direction

Build the verify command and tool as the core feature, starting with Node.js detection and expanding to other languages in future phases.

## Supporting References

- `.paul/PROJECT.md`

---

_Created: 2026-03-24_
