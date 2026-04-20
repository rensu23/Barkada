import { getCurrentSession } from "./services/auth.service.js";
import { getContributions } from "./services/contribution.service.js";
import { getPendingPayments } from "./services/payment.service.js";
import { getGroupsForUser } from "./services/group.service.js";
import { getState } from "./utils/storage.js";
import { formatCurrency, formatShortDateTime } from "./utils/formatters.js";

function buildSummary(session, groups, contributions, pending, state) {
  const groupIds = groups.map((group) => group.group_id);
  const contributionIds = contributions.map((item) => item.contribution_id);
  const payments = state.payment_records.filter((payment) => contributionIds.includes(payment.contribution_id));

  const totalTarget = groups.reduce((sum, group) => sum + Number(group.target_amount || 0), 0);
  const totalCollected = contributions.reduce((sum, contribution) => {
    const paidCount = payments.filter((payment) => payment.contribution_id === contribution.contribution_id && payment.status === "Paid").length;
    return sum + paidCount * Number(contribution.amount);
  }, 0);
  const totalPending = contributions.reduce((sum, contribution) => {
    const count = payments.filter((payment) => payment.contribution_id === contribution.contribution_id && payment.status === "Pending").length;
    return sum + count * Number(contribution.amount);
  }, 0);

  const unpaidCount = payments.filter((payment) => payment.status === "Not Paid").length;
  const paidCount = payments.filter((payment) => payment.status === "Paid").length;
  const pendingCount = payments.filter((payment) => payment.status === "Pending").length;

  return {
    totalGroups: groupIds.length,
    totalTarget,
    totalCollected,
    totalPending,
    paidCount,
    pendingCount,
    unpaidCount,
    completion: totalTarget ? Math.round((totalCollected / totalTarget) * 100) : 0,
    pendingItems: pending.length,
  };
}

export async function initDashboardPage() {
  if (document.body.dataset.appPage !== "dashboard") return;

  const session = await getCurrentSession();
  const groups = await getGroupsForUser(session.user_id);
  const contributions = await getContributions();
  const state = getState();
  const pending = await getPendingPayments();
  const summary = buildSummary(session, groups, contributions.filter((item) => groups.some((group) => group.group_id === item.group_id)), pending, state);
  const metrics = document.querySelector("[data-dashboard-stats]");
  const charts = document.querySelector("[data-dashboard-charts]");
  const activity = document.querySelector("[data-dashboard-activity]");
  const overview = document.querySelector("[data-dashboard-overview]");

  const role = session.role_view || "treasurer";
  metrics.innerHTML = `
    <article class="stat-card"><span class="muted">${role === "treasurer" ? "Total groups" : "Joined groups"}</span><strong>${summary.totalGroups}</strong><span class="helper-text">Across your active barkadas and orgs.</span></article>
    <article class="stat-card"><span class="muted">${role === "treasurer" ? "Total target" : "Current due"}</span><strong>${formatCurrency(role === "treasurer" ? summary.totalTarget : summary.totalPending)}</strong><span class="helper-text">${role === "treasurer" ? "Combined group targets." : "Pending confirmations and unpaid dues."}</span></article>
    <article class="stat-card"><span class="muted">${role === "treasurer" ? "Collected" : "Confirmed payments"}</span><strong>${formatCurrency(summary.totalCollected)}</strong><span class="helper-text">${role === "treasurer" ? "Confirmed by treasurers." : "Your confirmed total in demo data."}</span></article>
    <article class="stat-card"><span class="muted">${role === "treasurer" ? "Pending claims" : "Waiting review"}</span><strong>${summary.pendingItems}</strong><span class="helper-text">${role === "treasurer" ? "Need confirmation today." : "Payments you marked as done."}</span></article>
  `;

  charts.innerHTML = `
    <article class="chart-card">
      <div class="page-header">
        <div>
          <p class="eyebrow">Collected vs target</p>
          <h3>${summary.completion}% complete</h3>
        </div>
        <span class="status-chip status-paid">${formatCurrency(summary.totalCollected)}</span>
      </div>
      <div class="progress-track space-top"><div class="progress-fill" style="--value:${summary.completion}%"></div></div>
      <div class="chart-legend space-top">
        <div class="legend-item"><span>Target</span><strong>${formatCurrency(summary.totalTarget)}</strong></div>
        <div class="legend-item"><span>Pending</span><strong>${formatCurrency(summary.totalPending)}</strong></div>
      </div>
    </article>
    <article class="chart-card">
      <div class="page-header">
        <div>
          <p class="eyebrow">Status mix</p>
          <h3>Paid, pending, unpaid</h3>
        </div>
      </div>
      <div class="chart-ring"></div>
      <div class="chart-legend space-top">
        <div class="legend-item"><span class="status-chip status-paid">Paid</span><strong>${summary.paidCount}</strong></div>
        <div class="legend-item"><span class="status-chip status-pending">Pending</span><strong>${summary.pendingCount}</strong></div>
        <div class="legend-item"><span class="status-chip status-unpaid">Not Paid</span><strong>${summary.unpaidCount}</strong></div>
      </div>
    </article>
  `;

  overview.innerHTML = groups
    .slice(0, 3)
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
        <div class="summary-row">
          <span>Deadline</span>
          <strong>${group.deadline || "Flexible"}</strong>
        </div>
        <div class="summary-row">
          <span>Target</span>
          <strong>${formatCurrency(group.target_amount)}</strong>
        </div>
      </article>
    `,
    )
    .join("");

  activity.innerHTML = state.activity_logs
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
