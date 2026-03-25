# pi-verify

A Pi extension that runs verification checks (typecheck, test, lint, build) with structured, actionable output.

## What it does

pi-verify auto-detects your project type and runs the appropriate verification commands. Instead of parsing raw CLI output, you get structured pass/fail results with categorized errors and fix suggestions.

**Key features:**

- **Auto-detection**: Identifies Node.js projects via package.json
- **Structured output**: JSON results with error categorization (TypeError, LintViolation, TestFailure, etc.)
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
- A Node.js project with `package.json`
- Standard tooling scripts (typecheck, test, lint, format) in package.json

## License

MIT
