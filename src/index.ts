import { Type } from "@sinclair/typebox";
// import { existsSync } from "fs"; // Fixed: removed unused import
// import { writeFileSync } from "fs"; // Fixed: removed unused import
import chalk from "chalk";
import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import {
  DEFAULT_LABEL,
  EXTENSION_COMMAND,
  EXTENSION_NAME,
  STATE_ENTRY_TYPE,
  TOOL_NAME,
} from "./constants.js";
import { buildHelpText, parseSubcommand } from "./commands.js";
import { formatCheckResult } from "./formatters.js";
import {
  runVerification,
  type VerifyResult,
  type CheckResult,
  type ErrorSummary,
} from "./verify.js";
import type { ExtensionState, VerifyInput } from "./types.js";

export default function extensionTemplate(pi: ExtensionAPI) {
  let state: ExtensionState = { label: DEFAULT_LABEL };

  function syncState(ctx: Pick<ExtensionContext, "sessionManager" | "hasUI" | "ui">): void {
    state = restoreFromContext(ctx);
    if (ctx.hasUI) {
      const statusText = buildStatusText(state);
      ctx.ui.setStatus(EXTENSION_COMMAND, statusText);
    }
  }

  pi.on("session_start", (_event, ctx) => syncState(ctx));
  pi.on("session_switch", (_event, ctx) => syncState(ctx));
  pi.on("session_tree", (_event, ctx) => syncState(ctx));
  pi.on("session_fork", (_event, ctx) => syncState(ctx));

  pi.registerCommand(EXTENSION_COMMAND, {
    description: "Run verification checks (typecheck, test, lint, format)",
    getArgumentCompletions: (prefix) => {
      const options = ["all", "test", "lint", "quick", "help"];
      const safePrefix = prefix.toLowerCase();
      const matches = options.filter((option) => option.startsWith(safePrefix));
      return matches.length > 0 ? matches.map((value) => ({ value, label: value })) : null;
    },
    handler: async (args, ctx): Promise<void> => {
      const { name } = parseSubcommand(args);
      const cwd = process.cwd();

      switch (name) {
        case "all":
        case "test":
        case "lint":
        case "quick": {
          // Map 'quick' to 'typecheck' for display (quick runs typecheck + lint)
          const displayName = name === "quick" ? "typecheck" : name;
          notify(ctx, `Running verification: ${displayName}...`);
          try {
            // Update status bar during execution
            if (ctx.hasUI) {
              ctx.ui.setStatus(EXTENSION_COMMAND, `${EXTENSION_NAME}: testing...`);
            }

            const result = await runVerification(name, cwd, (update) => {
              if (update.status === "running" && ctx.hasUI) {
                ctx.ui.setStatus(EXTENSION_COMMAND, `${EXTENSION_NAME}: ${update.message}`);
              }
            });

            state = updateStateWithResult(state, name, result);
            pi.appendEntry(STATE_ENTRY_TYPE, state);
            if (ctx.hasUI) {
              ctx.ui.setStatus(EXTENSION_COMMAND, buildStatusText(state));
            }
            notify(ctx, formatVerifyResult(result));
          } catch (error) {
            notify(
              ctx,
              `Verification failed: ${error instanceof Error ? error.message : String(error)}`,
              "error"
            );
            // Restore status bar on error
            if (ctx.hasUI) {
              ctx.ui.setStatus(EXTENSION_COMMAND, buildStatusText(state));
            }
          }
          return;
        }

        case "help":
        default:
          notify(ctx, buildHelpText());
          return;
      }
    },
  });

  pi.registerTool({
    name: TOOL_NAME,
    label: "Verify",
    description: "Run verification checks and return structured pass/fail results",
    parameters: Type.Object({
      scope: Type.String({
        enum: ["all", "test", "lint", "quick"],
        default: "quick",
        description: "Which checks to run",
      }),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const cwd = process.cwd();
      const input = params as VerifyInput;
      try {
        const result = await runVerification(input.scope, cwd);
        const statusText = result.success
          ? "✓ All checks passed"
          : `✗ ${result.summary.failed} check(s) failed`;
        // Update state with last result
        const newState: ExtensionState = {
          label: state.label,
          lastResult: {
            scope: input.scope,
            success: result.success,
            timestamp: new Date().toISOString(),
            summary: statusText,
          },
        };
        state = newState;
        pi.appendEntry(STATE_ENTRY_TYPE, state);
        if (ctx.hasUI) {
          const indicator = result.success ? "✓" : "✗";
          ctx.ui.setStatus(EXTENSION_COMMAND, `${EXTENSION_NAME}: ${indicator} ${statusText}`);
        }

        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          details: result,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorResult = {
          success: false,
          checks: [] as CheckResult[],
          summary: { passed: 0, failed: 0, duration: 0 },
          error: errorMessage,
        };
        return {
          content: [{ type: "text", text: JSON.stringify(errorResult) }],
          details: errorResult,
        };
      }
    },
  });

  function buildStatusText(s: ExtensionState): string {
    if (s.lastResult) {
      const indicator = s.lastResult.success ? "✓" : "✗";
      return `${EXTENSION_NAME}: ${indicator} ${s.lastResult.summary}`;
    }
    return `${EXTENSION_NAME}: ${s.label}`;
  }

  function updateStateWithResult(
    s: ExtensionState,
    scope: string,
    result: VerifyResult
  ): ExtensionState {
    return {
      ...s,
      lastResult: {
        scope,
        success: result.success,
        timestamp: new Date().toISOString(),
        summary: `${result.summary.passed}/${result.summary.passed + result.summary.failed} checks passed`,
      },
    };
  }

  function formatVerifyResult(result: VerifyResult): string {
    const lines: string[] = [];
    const indicator = result.success ? chalk.green("✓") : chalk.red("✗");
    const duration = (result.summary.duration / 1000).toFixed(1);
    lines.push(
      `${indicator} ${result.summary.passed} passed, ${result.summary.failed} failed (${duration}s total)`
    );
    lines.push("");
    for (const check of result.checks) {
      lines.push(formatCheckResult(check, chalk));
    }
    // Add colored error summary if there are errors
    if (!result.success && result.errorSummary) {
      lines.push("");
      lines.push(formatErrorSummary(result.errorSummary));
    }
    return lines.join("\n");
  }

  // formatResultForDisplay is available if needed for backward compatibility
  // Currently using formatVerifyResult directly
}

/** Notify via TUI when available, otherwise console. */
function notify(
  ctx: { hasUI: boolean; ui: { notify: (message: string, level: "info" | "error") => void } },
  message: string,
  level: "info" | "error" = "info"
): void {
  if (ctx.hasUI) {
    ctx.ui.notify(message, level);
  } else {
    console.log(message);
  }
}

function restoreFromContext(ctx: Pick<ExtensionContext, "sessionManager">): ExtensionState {
  return restoreState(ctx.sessionManager.getBranch()) ?? { label: DEFAULT_LABEL };
}

function restoreState(
  entries: { type?: string; customType?: string; data?: unknown }[]
): ExtensionState | undefined {
  for (let i = entries.length - 1; i >= 0; i -= 1) {
    const entry = entries[i];
    if (entry?.type !== "custom" || entry.customType !== STATE_ENTRY_TYPE) continue;
    if (isExtensionState(entry.data)) return entry.data;
  }
  return undefined;
}

function isExtensionState(value: unknown): value is ExtensionState {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    typeof (value as { label?: unknown }).label === "string"
  );
}

/**
 * Formats error summary with colors using chalk
 */
function formatErrorSummary(summary: ErrorSummary): string {
  const lines: string[] = [];
  // Header with total error count
  const totalErrors = summary.total;
  const categoryCounts = Object.entries(summary.byCategory).filter(([, count]) => count > 0);
  const categoryText = categoryCounts
    .map(([cat, count]) => `${count} ${cat.toLowerCase()}`)
    .join(", ");
  lines.push(
    chalk.red.bold(`✗ ${totalErrors} error${totalErrors !== 1 ? "s" : ""} found (${categoryText})`)
  );
  lines.push("");
  // Group errors by category
  const errorsByCategory = new Map<string, typeof summary.errors>();
  for (const error of summary.errors) {
    const existing = errorsByCategory.get(error.category) ?? [];
    existing.push(error);
    errorsByCategory.set(error.category, existing);
  }
  // Display errors by category
  for (const [category, errors] of errorsByCategory) {
    if (errors.length === 0) continue;
    // Category header in yellow
    lines.push(chalk.yellow(`${category} (${errors.length}):`));
    for (const error of errors) {
      // File location in gray
      if (error.file) {
        const location = error.line
          ? `${error.file}:${error.line}${error.column ? `:${error.column}` : ""}`
          : error.file;
        lines.push(chalk.gray(`  ${location}`));
      }
      // Error message in white
      lines.push(chalk.white(`  → ${error.message}`));
      // Suggestion with lightbulb emoji
      if (error.suggestion) {
        lines.push(chalk.cyan(`    💡 ${error.suggestion}`));
      }
      lines.push("");
    }
  }
  return lines.join("\n");
}
