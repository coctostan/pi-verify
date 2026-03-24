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
