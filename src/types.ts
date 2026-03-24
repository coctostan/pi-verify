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
