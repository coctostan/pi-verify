export interface ExtensionState {
  label: string;
  lastResult?: {
    scope: string;
    success: boolean;
    timestamp: string;
    summary: string;
  };
}

export interface VerifyInput {
  scope: "all" | "test" | "lint" | "quick";
}

export interface ProgressUpdate {
  type: string;
  status: "running" | "complete";
  message?: string;
  result?: unknown;
}

export interface ParsedTestResult {
  framework: string;
  passed: number;
  failed: number;
  skipped: number;
  tests: {
    name: string;
    status: "passed" | "failed" | "skipped";
    duration?: number;
  }[];
}

export interface WatchModeConfig {
  framework: string;
}

export interface WatchModeResult {
  enabled: boolean;
  flags: string[];
}

export type ErrorCategory =
  | "SyntaxError"
  | "TypeError"
  | "TestFailure"
  | "LintViolation"
  | "ConfigError"
  | "Unknown";

export interface CategorizedError {
  category: ErrorCategory;
  message: string;
  file?: string;
  line?: number;
  column?: number;
  originalOutput: string;
  suggestion?: string;
}

export interface ErrorSummary {
  total: number;
  byCategory: Record<ErrorCategory, number>;
  errors: CategorizedError[];
}

// Re-export ProjectType from detectors for convenience
export type { ProjectType } from "./detectors.js";
// Re-export VerifyConfig from config for convenience
export type { VerifyConfig } from "./config.js";
