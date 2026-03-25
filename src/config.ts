import { readFile, access } from "node:fs/promises";
import { join } from "node:path";
import type { ProjectType, CheckType } from "./detectors.js";
import { getCheckCommand } from "./detectors.js";

export interface VerifyConfig {
  /** Custom commands per project type and check type */
  commands?: Partial<Record<ProjectType, Partial<Record<CheckType, string | null>>>>;
  /** Whether to run independent checks in parallel (default: true) */
  parallel?: boolean;
}

/**
 * Check if .verifyrc.json exists in the given directory
 */
async function configExists(cwd: string): Promise<boolean> {
  try {
    await access(join(cwd, ".verifyrc.json"));
    return true;
  } catch {
    return false;
  }
}

/**
 * Load and parse .verifyrc.json configuration file
 * @returns Parsed config or null if file doesn't exist
 */
export async function loadConfig(cwd: string): Promise<VerifyConfig | null> {
  const exists = await configExists(cwd);
  if (!exists) {
    return null;
  }

  const content = await readFile(join(cwd, ".verifyrc.json"), "utf-8");
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new Error(
      `Invalid JSON in .verifyrc.json: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  return validateConfig(parsed);
}

/**
 * Validate the structure of a parsed config object
 * @throws Error if config structure is invalid
 */
export function validateConfig(config: unknown): VerifyConfig {
  if (config === null || typeof config !== "object") {
    throw new Error("Config must be an object");
  }

  const cfg = config as Record<string, unknown>;
  const result: VerifyConfig = {};

  // Validate parallel option
  if (cfg.parallel !== undefined) {
    if (typeof cfg.parallel !== "boolean") {
      throw new Error("Config field 'parallel' must be a boolean");
    }
    result.parallel = cfg.parallel;
  }

  // Validate commands structure
  if (cfg.commands !== undefined) {
    if (config === null || typeof cfg.commands !== "object") {
      throw new Error("Config field 'commands' must be an object");
    }

    const validProjectTypes: ProjectType[] = ["nodejs", "rust", "python", "go", "swift"];
    const validCheckTypes: CheckType[] = ["typecheck", "test", "lint", "format", "build"];

    const commands = cfg.commands as Record<string, unknown>;
    const validatedCommands: VerifyConfig["commands"] = {};

    for (const [projectType, checkMap] of Object.entries(commands)) {
      if (!validProjectTypes.includes(projectType as ProjectType)) {
        throw new Error(
          `Invalid project type '${projectType}' in config.commands. ` +
            `Valid types: ${validProjectTypes.join(", ")}`
        );
      }

      if (checkMap === null || typeof checkMap !== "object") {
        throw new Error(`Config commands for '${projectType}' must be an object`);
      }

      const validatedCheckMap: Partial<Record<CheckType, string>> = {};

      for (const [checkType, command] of Object.entries(checkMap as Record<string, unknown>)) {
        if (!validCheckTypes.includes(checkType as CheckType)) {
          throw new Error(
            `Invalid check type '${checkType}' in config.commands.${projectType}. ` +
              `Valid types: ${validCheckTypes.join(", ")}`
          );
        }

        if (typeof command !== "string") {
          throw new Error(`Command for '${projectType}.${checkType}' must be a string`);
        }

        validatedCheckMap[checkType as CheckType] = command;
      }

      validatedCommands[projectType as ProjectType] = validatedCheckMap;
    }

    result.commands = validatedCommands;
  }

  return result;
}

/**
 * Merge user config with default commands to produce final command
 * @returns Final command string or null if no command available
 */
export function mergeWithDefaults(
  projectType: ProjectType,
  check: CheckType,
  config: VerifyConfig | null,
  scripts?: Record<string, string>
): string | null {
  // Check for user-defined custom command first
  const customCommand = config?.commands?.[projectType]?.[check];
  if (customCommand !== undefined) {
    return customCommand;
  }

  // Fall back to default detection logic
  return getCheckCommand(projectType, check, scripts);
}

/**
 * Check if parallel execution is enabled
 * @returns true if parallel is enabled (default: true)
 */
export function isParallelEnabled(config: VerifyConfig | null): boolean {
  return config?.parallel !== false;
}
