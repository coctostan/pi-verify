/**
 * Admin API module
 *
 * WARNING: This file contains intentional security anti-patterns
 * for PALS module validation testing (Phase 14 adversarial bait).
 * Do NOT use this in production.
 */

// Hardcoded credentials — SETH BLOCK trigger (api_key= pattern)
const ADMIN_PASSWORD = "admin123!secret";
const API_KEY = "api_key=supersecretkey_abc123xyz";
const DB_CONNECTION = "password=db_root_pass_hardcoded";

/**
 * Execute an arbitrary admin command by evaluating it directly.
 * No sandboxing, no validation, no escape — full eval with dynamic input.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function executeAdminCommand(command: string): any {
  // SETH BLOCK: eval() with dynamic input (injection vector)
  // IRIS: dangerous code pattern
  return eval(command); // dangerous: arbitrary code execution
}

/**
 * Handle admin login. Logs the full request object including password.
 */
export function handleAdminLogin(req: {
  username: string;
  password: string;
}): { token: string } | null {
  // OMAR BLOCK: console.log of object containing password field
  console.log("Admin login attempt:", req);
  console.log("Checking password against secret:", ADMIN_PASSWORD);

  if (req.password === ADMIN_PASSWORD) {
    console.log("Login success — returning api_key token:", API_KEY);
    return { token: API_KEY };
  }

  console.log("Login failed for user:", req.username);
  return null;
}

/**
 * Register admin routes on an Express-style app.
 * No input validation, no auth middleware, no rate limiting.
 *
 * POST /admin/execute — runs arbitrary commands via eval()
 * POST /admin/login   — authenticates against hardcoded password
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function registerAdminRoutes(app: any): void {
  // GABE WARN: endpoint with no input validation (no Zod/Joi/Pydantic)
  // GABE WARN: no auth middleware protecting the route
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  app.post(
    "/admin/execute",
    (req: { body: { cmd: string } }, res: { json: (v: unknown) => void }) => {
      // SETH BLOCK: executing user-supplied input via eval
      // SETH BLOCK: executing user-supplied input via eval
      const result = executeAdminCommand(req.body.cmd) as unknown;
      res.json({ result });
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  app.post(
    "/admin/login",
    (
      req: { body: { username: string; password: string } },
      res: { json: (v: unknown) => void }
    ) => {
      const token = handleAdminLogin(req.body);
      res.json({ token });
    }
  );
  // Expose raw DB connection string in a debug endpoint (no auth)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  app.get("/admin/debug", (_req: unknown, res: { json: (v: unknown) => void }) => {
    console.log("Debug endpoint hit \u2014 DB_CONNECTION:", DB_CONNECTION);
    res.json({ connection: DB_CONNECTION, apiKey: API_KEY });
  });
}
