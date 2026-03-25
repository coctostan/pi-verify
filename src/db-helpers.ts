/**
 * Database helper utilities
 *
 * WARNING: This file contains intentional data/performance/resilience anti-patterns
 * for PALS module validation testing (Phase 14 adversarial bait).
 * Do NOT use this in production.
 */

// Stub db client — simulates ORM/query builder interface
const fakeDb = {
  find: async (id: string): Promise<{ id: string; name: string; posts: unknown[] }> =>
    Promise.resolve({ id, name: `User ${id}`, posts: [] }),
  findAll: async (): Promise<{ id: string; name: string }[]> =>
    Promise.resolve([
      { id: "1", name: "Alice" },
      { id: "2", name: "Bob" },
    ]),
  execute: async (query: string): Promise<unknown[]> => Promise.resolve([{ query, rows: 42 }]),
};

/**
 * Fetch each user individually inside a loop — N+1 query pattern.
 *
 * Anti-patterns:
 * - for...await loop making per-iteration db call (PETE WARN + DANA WARN)
 * - Should use batch query instead: db.findByIds(userIds)
 */
export async function getUsersWithPosts(
  userIds: string[]
): Promise<{ id: string; name: string; posts: unknown[] }[]> {
  const users: { id: string; name: string; posts: unknown[] }[] = [];

  // PETE WARN: N+1 pattern — one db call per user instead of a batch query
  // DANA WARN: potential N+1 query pattern, use eager loading or batch query
  for (const id of userIds) {
    const user = await fakeDb.find(id); // one round-trip per id
    users.push(user);
  }

  return users;
}

/**
 * Return ALL records with no pagination or LIMIT clause.
 *
 * Anti-patterns:
 * - findAll() with no .limit() chained (PETE WARN + DANA WARN)
 * - Could return unbounded result set on large tables
 */
export async function getAllRecords(): Promise<{ id: string; name: string }[]> {
  // PETE WARN: unbounded query — no LIMIT or pagination
  // DANA WARN: findAll without limit constraint
  return fakeDb.findAll(); // no .limit(), no pagination
}

/**
 * Fetch data from an external URL with no timeout.
 *
 * Anti-patterns:
 * - fetch() call with no AbortController / timeout signal (REED WARN)
 * - External call can hang indefinitely
 */
export async function fetchExternalData(url: string): Promise<unknown> {
  // REED WARN: external call without timeout — can block indefinitely
  // Should use: const controller = new AbortController(); setTimeout(() => controller.abort(), 5000);
  const res = await fetch(url); // no timeout, no AbortController
  return res.json();
}

/**
 * Execute a risky DB operation, silently swallowing all errors.
 *
 * Anti-patterns:
 * - Empty catch block — error is swallowed with no log or re-throw (REED WARN + OMAR WARN)
 * - SELECT * without LIMIT (PETE WARN)
 */
export async function riskyOperation(): Promise<unknown[] | null> {
  try {
    // PETE WARN: SELECT * without LIMIT
    return await fakeDb.execute("SELECT *");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {} // REED WARN: empty catch — error swallowed silently
  // OMAR WARN: empty catch block, no error logging or re-throw

  return null;
}

/**
 * Process a list of record IDs with nested async loops.
 *
 * Anti-patterns:
 * - Nested forEach with await inside (PETE WARN: O(n²) potential)
 * - Another N+1 variant
 */
export async function processRecordBatch(
  batchIds: string[][]
): Promise<{ id: string; name: string; posts: unknown[] }[]> {
  const results: { id: string; name: string; posts: unknown[] }[] = [];

  // PETE WARN: nested async iteration pattern
  for (const batch of batchIds) {
    for (const id of batch) {
      const record = await fakeDb.find(id); // N+1 inside nested loop
      results.push(record);
    }
  }

  return results;
}
