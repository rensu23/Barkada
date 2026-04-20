import { getCurrentSession } from "./services/auth.service.js";
import { getPendingPayments } from "./services/payment.service.js";
import { getState } from "./utils/storage.js";
import { formatCurrency, formatShortDateTime } from "./utils/formatters.js";
import { buildDashboardMetrics, getUserVisibleActivity } from "./utils/calculations.js";

export async function initDashboardPage() {
  if (document.body.dataset.appPage !== "dashboard") return;

  const session = await getCurrentSession();
  const state = getState();
  const metricsState = buildDashboardMetrics(state, session.user_id, session.active_group_id);
  const pending = await getPendingPayments(session.active_group_id);
  const metrics = document.querySelector("[data-dashboard-stats]");
  const charts = document.querySelector("[data-dashboard-charts]");
  const activity = document.querySelector("[data-dashboard-activity]");
  const overview = document.querySelector("[data-dashboard-overview]");
  const actions = document.querySelector("[data-dashboard-actions]");
  const role = session.effective_role || "member";
  const paidPct = metricsState.payments.length ? Math.round((metricsState.paidCount / metricsState.payments.length) * 100) : 0;
  const pendingPct = metricsState.payments.length ? paidPct + Math.round((metricsState.pendingCount / metricsState.payments.length) * 100) : 0;
  const rejectedPct = metricsState.payments.length ? pendingPct + Math.round((metricsState.rejectedCount / metricsState.payments.length) * 100) : 0;

  metrics.innerHTML = `
    <article class="stat-card"><span class="muted">${role === "treasurer" ? "Treasurer groups" : role === "hybrid" ? "My active groups" : "Joined groups"}</span><strong>${metricsState.groups.length}</strong><span class="helper-text">Counts come from your memberships in group_members.</span></article>
    <article class="stat-card"><span class="muted">${role === "member" ? "Current due amount" : "Target amount"}</span><strong>${formatCurrency(role === "member" ? metricsState.myPendingAmount : metricsState.totalTarget)}</strong><span class="helper-text">${role === "member" ? "Your unpaid, rejected, and pending dues in the active group." : "Scoped to the currently selected group context."}</span></article>
    <article class="stat-card"><span class="muted">${role === "member" ? "Confirmed contribution total" : "Collected total"}</span><strong>${formatCurrency(role === "member" ? metricsState.myConfirmedTotal : metricsState.totalCollected)}</strong><span class="helper-text">Always recalculated from payment_records and contributions.</span></article>
    <article class="stat-card"><span class="muted">Pending confirmations</span><strong>${role === "member" ? metricsState.myPendingCount : pending.length}</strong><span class="helper-text">${role === "member" ? "Only your payments waiting for review." : "Ready for treasurer action in this context."}</span></article>
  `;

  if (actions) {
    actions.innerHTML = role === "member"
      ? `<a class="button" href="./contributions.html">Review my dues</a><a class="button-secondary" href="./member-qr.html">Open my QR</a>`
      : `<a class="button" href="./create-group.html">Create group</a><a class="button-secondary" href="./confirmations.html">Review pending claims</a>`;
  }

  charts.innerHTML = `
    <article class="chart-card">
      <div class="page-header">
        <div>
          <p class="eyebrow">Collected vs target</p>
          <h3>${metricsState.completion}% complete</h3>
        </div>
        <span class="status-chip status-paid">${formatCurrency(metricsState.totalCollected)}</span>
      </div>
      <div class="progress-track space-top"><div class="progress-fill" style="--value:${metricsState.completion}%"></div></div>
      <div class="chart-legend space-top">
        <div class="legend-item"><span>Target</span><strong>${formatCurrency(metricsState.totalTarget)}</strong></div>
        <div class="legend-item"><span>Pending</span><strong>${formatCurrency(metricsState.totalPendingAmount)}</strong></div>
      </div>
    </article>
    <article class="chart-card">
      <div class="page-header">
        <div>
          <p class="eyebrow">Status mix</p>
          <h3>Paid, pending, unpaid</h3>
        </div>
      </div>
      <div class="chart-ring" style="--paid-value:${paidPct}%; --pending-value:${pendingPct}%; --rejected-value:${rejectedPct}%"></div>
      <div class="chart-legend space-top">
        <div class="legend-item"><span class="status-chip status-paid">Paid</span><strong>${metricsState.paidCount}</strong></div>
        <div class="legend-item"><span class="status-chip status-pending">Pending</span><strong>${metricsState.pendingCount}</strong></div>
        <div class="legend-item"><span class="status-chip status-rejected">Rejected</span><strong>${metricsState.rejectedCount}</strong></div>
        <div class="legend-item"><span class="status-chip status-unpaid">Not Paid</span><strong>${metricsState.unpaidCount}</strong></div>
      </div>
    </article>
  `;

  overview.innerHTML = metricsState.groupProgress
    .slice(0, 4)
    .map(
      (group) => `
      <article class="card">
        <div class="page-header">
          <div class="page-header-copy">
            <p class="eyebrow">${group.member_role}</p>
            <h3>${group.group_name}</h3>
            <p class="helper-text">${group.description}</p>
          </div>
          <a class="button-ghost" href="../pages/group-details.html?group_id=${group.group_id}">View</a>
        </div>
        <div class="progress-track space-top"><div class="progress-fill" style="--value:${group.completion}%"></div></div>
        <div class="summary-row">
          <span>Deadline</span>
          <strong>${group.deadline || "Flexible"}</strong>
        </div>
        <div class="summary-row">
          <span>Collected</span>
          <strong>${formatCurrency(group.collected)} / ${formatCurrency(group.target_amount)}</strong>
        </div>
      </article>
    `,
    )
    .join("");

  activity.innerHTML = getUserVisibleActivity(state, session.user_id, session.active_group_id)
    .slice(0, 5)
    .map(
      (item) => `
      <article class="timeline-item">
        <div>
          <strong>${item.title}</strong>
          <p class="helper-text">${item.meta}</p>
        </div>
        <span class="muted">${formatShortDateTime(item.created_at)}</span>
      </article>
    `,
    )
    .join("");
}
