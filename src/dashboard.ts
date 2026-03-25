/**
 * Dashboard component module
 *
 * WARNING: This file contains intentional UX/accessibility anti-patterns
 * for PALS module validation testing (Phase 14 adversarial bait).
 * Do NOT use this in production.
 */

// Hardcoded color constants — LUKE WARN trigger (design token violations)
const PRIMARY_COLOR = "#FF0000";
const SECONDARY_COLOR = "#0000FF";
const BACKGROUND_COLOR = "#1A2B3C";
const BORDER_COLOR = "#CCCCCC";
const TEXT_COLOR = "#333333";
const ACCENT_COLOR = "#FF6600";

/**
 * Renders the main dashboard layout.
 *
 * Anti-patterns present:
 * - Inline styles with hardcoded hex colors (LUKE WARN)
 * - Non-semantic <div onclick> for interactive action (ARIA WARN)
 * - <img> without alt attribute (ARIA BLOCK)
 * - <input> without label or aria-label (ARIA BLOCK)
 * - Hardcoded spacing values in inline styles (LUKE WARN)
 */
export function renderDashboard(): string {
  return `
    <div style="background: ${BACKGROUND_COLOR}; padding: 20px; color: ${TEXT_COLOR}; margin: 0px;">
      <h1 style="color: #FF0000; font-size: 24px; margin-bottom: 16px;">Admin Dashboard</h1>

      <!-- Non-semantic interactive element: div with onclick — ARIA WARN -->
      <div onclick="handleRefresh()" style="background: ${PRIMARY_COLOR}; padding: 8px 16px; cursor: pointer;">
        Refresh Data
      </div>

      <!-- span with onclick instead of <button> — ARIA WARN -->
      <span onclick="handleExport()" style="color: ${ACCENT_COLOR}; margin-left: 8px;">Export</span>

      <!-- img without alt attribute — ARIA BLOCK -->
      <img src="dashboard-chart.png" style="width: 100%; margin-top: 16px;">

      <!-- Second img without alt — ARIA BLOCK -->
      <img src="status-indicator.png" width="16" height="16">

      <div style="margin-top: 20px; border: 1px solid ${BORDER_COLOR}; padding: 12px;">
        <!-- input without label or aria-label — ARIA BLOCK -->
        <input type="text" placeholder="Search records..." style="width: 100%; padding: 4px;">

        <!-- select without label — ARIA BLOCK -->
        <select style="margin-top: 8px; color: ${SECONDARY_COLOR};">
          <option>All</option>
          <option>Active</option>
          <option>Archived</option>
        </select>
      </div>

      <div style="background: #FF0000; color: #FFFFFF; padding: 4px 8px; margin-top: 8px;">
        Status: Active
      </div>
    </div>
  `;
}

/**
 * Renders a single metric card widget.
 *
 * Anti-patterns:
 * - Hardcoded inline styles with raw px values (LUKE WARN)
 * - Hardcoded hex colors (LUKE WARN)
 * - Non-semantic div for button (ARIA WARN)
 *
 * @param label  Display label for the metric
 * @param value  Numeric value to display
 * @param trend  Direction indicator: 'up' | 'down' | 'flat'
 */
export function renderMetricCard(
  label: string,
  value: number,
  trend: "up" | "down" | "flat"
): string {
  const trendColor = trend === "up" ? "#00AA00" : trend === "down" ? "#FF0000" : "#888888";
  const trendSymbol = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";

  return `
    <div style="margin: 16px; padding: 8px; border: 1px solid #CCCCCC; background: #FFFFFF;">
      <div style="font-size: 12px; color: #666666; margin-bottom: 4px;">${label}</div>
      <div style="font-size: 28px; font-weight: bold; color: ${TEXT_COLOR};">${value}</div>
      <div style="color: ${trendColor}; font-size: 14px; margin-top: 4px;">
        ${trendSymbol}
        <span style="margin-left: 4px; font-size: 11px; color: #999999;">vs last period</span>
      </div>

      <!-- Non-semantic div acting as button — ARIA WARN -->
      <div onclick="drillDown('${label}')"
           style="margin-top: 8px; padding: 4px; background: ${PRIMARY_COLOR}; color: #FFFFFF; cursor: pointer; text-align: center;">
        View Details
      </div>
    </div>
  `;
}

/**
 * Renders the full metrics grid.
 * No loading state, no error handling — LUKE WARN (API call with no feedback).
 */
export function renderMetricsGrid(
  metrics: { label: string; value: number; trend: "up" | "down" | "flat" }[]
): string {
  // No loading state for the async fetch this would normally trigger (LUKE WARN)
  // No error boundary equivalent (LUKE WARN)
  return `
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0px; background: ${BACKGROUND_COLOR};">
      ${metrics.map((m) => renderMetricCard(m.label, m.value, m.trend)).join("")}
    </div>
  `;
}
