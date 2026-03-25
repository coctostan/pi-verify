# pi-verify

A Pi extension that runs verification checks (typecheck, test, lint, build) with structured, actionable output.

## What it does

pi-verify auto-detects your project type and runs the appropriate verification commands. Instead of parsing raw CLI output, you get structured pass/fail results with categorized errors and fix suggestions.

**Key features:**

- **Multi-language support**: Auto-detects Node.js, Rust, Python, Go, and Swift projects
- **Structured output**: JSON results with error categorization (TypeError, LintViolation, TestFailure, etc.)
- **Configuration**: Customize check commands per project via `.verifyrc.json`
- **Parallel execution**: Run independent checks in parallel for faster results
- **Test parsing**: Extracts results from Jest, Vitest, and node:test
- **Watch mode detection**: Recognizes watch flags for supported frameworks
- **Colored terminal output**: Clear visual feedback via chalk
- **Status bar integration**: Shows last verification result in Pi's UI

## Installation

Install from npm:

```bash
pi install npm:pi-verify
```

Or install from a local path during development:

```bash
pi install /absolute/path/to/pi-verify
```

After installation, reload Pi:

```bash
/reload
```

## Commands

### `/verify all`

Run all verification checks: typecheck, test, lint, and format.

```
/verify all
```

### `/verify test`

Run tests only.

```
/verify test
```

### `/verify lint`

Run lint and format checks.

```
/verify lint
```

### `/verify quick`

Run typecheck and lint only (fastest option).

```
/verify quick
```

### `/verify help`

Show available subcommands.

## Tool: `verify_check`

For AI agents and model-callable use, pi-verify exposes a `verify_check` tool:

```json
{
  "scope": "quick" // "all" | "test" | "lint" | "quick"
}
```

Returns structured JSON:

```json
{
  "success": true,
  "checks": [...],
  "summary": {
    "passed": 4,
    "failed": 0,
    "duration": 1250
  },
  "errorSummary": {
    "total": 0,
    "byCategory": {
      "TypeError": 0,
      "LintViolation": 0,
      "TestFailure": 0,
      "SyntaxError": 0,
      "ConfigError": 0,
      "Unknown": 0
    },
    "errors": []
  }
}
```

## Multi-Language Support

pi-verify auto-detects project types and runs appropriate checks:

| Language | Detection                              | Default Commands                             |
| -------- | -------------------------------------- | -------------------------------------------- |
| Node.js  | `package.json`                         | npm/pnpm/yarn run typecheck/test/lint/format |
| Rust     | `Cargo.toml`                           | cargo test, cargo clippy, cargo fmt          |
| Python   | `requirements.txt` or `pyproject.toml` | pytest, ruff check/format                    |
| Go       | `go.mod`                               | go test, go vet, gofmt                       |
| Swift    | `Package.swift`                        | swift test, swiftlint                        |

## Configuration

Create `.verifyrc.json` in your project root to customize check commands:

```json
{
  "commands": {
    "nodejs": {
      "test": "npm run test:ci",
      "lint": "npm run lint:strict"
    },
    "rust": {
      "test": "cargo test --release"
    }
  },
  "parallel": true
}
```

### Configuration Options

- `commands`: Custom commands per project type and check type
  - Set to `null` to disable a specific check
  - Supports `nodejs`, `rust`, `python`, `go`, `swift`
- `parallel`: Run independent checks in parallel (default: `true`)

## Parallel Execution

When `parallel: true` (default), pi-verify runs independent checks (typecheck, lint, format) in parallel, then runs tests sequentially. This significantly speeds up verification while respecting test dependencies.

## Watch Mode Support

pi-verify detects watch mode for supported test runners:

| Framework | Watch Mode Support        |
| --------- | ------------------------- |
| Jest      | ✓ `--watch`, `--watchAll` |
| Vitest    | ✓ `--watch`, `-w`         |
| node:test | ✗ Not supported           |

When watch mode is detected, the status bar shows "verify: watching..." during execution.

## Error Categorization

Errors are automatically categorized by type:

| Category        | Description                      | Example                                  |
| --------------- | -------------------------------- | ---------------------------------------- |
| `TypeError`     | TypeScript type errors           | `Argument of type 'X' is not assignable` |
| `LintViolation` | ESLint/Prettier violations       | `Missing semicolon`                      |
| `TestFailure`   | Failed test assertions           | `✗ test name`                            |
| `SyntaxError`   | Parse errors                     | `Unexpected token`                       |
| `ConfigError`   | Missing or invalid configuration | `Cannot find module`                     |
| `Unknown`       | Uncategorized errors             | —                                        |

### Actionable Suggestions

The extension provides suggestions for common errors:

```
✗ 3 errors found (2 type errors, 1 lint violation)

TypeError (2):
  src/index.ts:42
  → Argument of type 'string' is not assignable to parameter of type 'number'
    💡 Check type annotations and ensure types are compatible

LintViolation (1):
  src/utils.ts:15
  → Missing semicolon
    💡 Run 'pnpm run lint:fix' to auto-fix formatting issues
```

## Requirements

- Node.js >= 22
- Project with appropriate manifest file (package.json, Cargo.toml, etc.)
- Standard tooling scripts in your project config

## License

MIT
