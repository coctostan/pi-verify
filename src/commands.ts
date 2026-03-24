// Command parsing utilities for verify command

export function buildHelpText(): string {
  return [
    `/verify all     - Run all checks (typecheck, test, lint, format)`,
    `/verify test    - Run tests only`,
    `/verify lint    - Run lint and format checks`,
    `/verify quick   - Run typecheck and lint only (fast)`,
    `/verify help    - Show this help`,
  ].join("\n");
}

export function parseSubcommand(raw: string): { name: string; rest: string } {
  const trimmed = raw.trim();
  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) return { name: trimmed.toLowerCase(), rest: "" };
  return {
    name: trimmed.slice(0, spaceIndex).toLowerCase(),
    rest: trimmed.slice(spaceIndex + 1).trim(),
  };
}
