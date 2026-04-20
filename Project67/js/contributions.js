import { createContribution, getContributionHistory, getContributions, getRecurringCycles } from "./services/contribution.service.js";
import { getCurrentSession } from "./services/auth.service.js";
import { getState } from "./utils/storage.js";
import { formatCurrency, formatDate, formatShortDateTime } from "./utils/formatters.js";
import { showToast } from "./ui.js";
import { buildDashboardMetrics, getGroupsForUserFromState } from "./utils/calculations.js";

export async function initContributionsPage() {
  const page = document.body.dataset.appPage;
  const session = await getCurrentSession();

  if (page === "contributions") {
    const contributions = await getContributions();
    const state = getState();
    const scoped = buildDashboardMetrics(state, session.user_id, session.active_group_id);
    const activeMembership = getGroupsForUserFromState(state, session.user_id).find((group) => Number(group.group_id) === Number(session.active_group_id));
    const list = document.querySelector("[data-contributions-list]");
    const search = document.querySelector("[data-contributions-search]");
    const typeFilter = document.querySelector("[data-contributions-type]");
    const groupFilter = document.querySelector("[data-contributions-group]");
    const form = document.querySelector("[data-contribution-form]");

    groupFilter.innerHTML = `<option value="">All groups</option>${scoped.groups.map((group) => `<option value="${group.group_id}">${group.group_name}</option>`).join("")}`;

    if (activeMembership?.member_role !== "Treasurer" && form) {
      form.innerHTML = `
        <h2>Treasurer tools are hidden in this group</h2>
        <p class="helper-text">Switch the active group in the header to a group where this account is a treasurer if you want to create or edit contributions in demo mode.</p>
      `;
    }

    const renderContributions = () => {
      const term = search?.value?.toLowerCase() || "";
      const typeValue = typeFilter?.value || "";
      const groupValue = groupFilter?.value || "";
      list.innerHTML = contributions
        .filter((item) => scoped.groups.some((group) => group.group_id === item.group_id))
        .filter((item) => item.title.toLowerCase().includes(term) || item.group.group_name.toLowerCase().includes(term))
        .filter((item) => !typeValue || typeValue === "All" || item.type === typeValue)
        .filter((item) => !groupValue || Number(item.group_id) === Number(groupValue))
        .map(
          (item) => `
          <article class="card">
            <div class="page-header">
              <div class="page-header-copy">
                <p class="eyebrow">${item.type}</p>
                <h3>${item.title}</h3>
                <p class="helper-text">${item.group.group_name}</p>
              </div>
              <span class="status-chip status-paid">${formatCurrency(item.amount)}</span>
            </div>
            <div class="detail-list">
              <div class="summary-row"><span>Frequency</span><strong>${item.frequency}</strong></div>
              <div class="summary-row"><span>Due date</span><strong>${formatDate(item.due_date)}</strong></div>
              <div class="summary-row"><span>Notes</span><strong>${item.notes}</strong></div>
            </div>
          </article>
        `,
        )
        .join("");
    };

    renderContributions();
    search?.addEventListener("input", renderContributions);
    typeFilter?.addEventListener("change", renderContributions);
    groupFilter?.addEventListener("change", renderContributions);

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const payload = Object.fromEntries(new FormData(form).entries());
      await createContribution(payload);
      showToast("New contribution added to the demo state.");
      form.reset();
      window.location.reload();
    });
  }

  if (page === "recurring-cycle") {
    const cycles = await getRecurringCycles(session.user_id);
    const list = document.querySelector("[data-cycle-list]");
    list.innerHTML = cycles
      .map(
        (item) => `
        <article class="card">
          <div class="page-header">
            <div class="page-header-copy">
              <p class="eyebrow">${item.contribution.frequency}</p>
              <h3>${item.contribution.title}</h3>
              <p class="helper-text">${item.group.group_name}</p>
            </div>
            <span class="status-chip ${item.status === "Paid" ? "status-paid" : item.status === "Pending" ? "status-pending" : item.status === "Rejected" ? "status-rejected" : "status-unpaid"}">${item.status}</span>
          </div>
          <div class="summary-row"><span>Next due</span><strong>${formatDate(item.contribution.due_date)}</strong></div>
        </article>
      `,
      )
      .join("");
  }

  if (page === "history") {
    const history = await getContributionHistory(session.user_id);
    const table = document.querySelector("[data-history-table]");
    table.innerHTML = history
      .map(
        (item) => `
        <tr>
          <td>${item.contribution.title}</td>
          <td>${item.group.group_name}</td>
          <td>${formatCurrency(item.contribution.amount)}</td>
          <td><span class="status-chip ${item.status === "Paid" ? "status-paid" : item.status === "Pending" ? "status-pending" : item.status === "Rejected" ? "status-rejected" : "status-unpaid"}">${item.status}</span></td>
          <td>${formatShortDateTime(item.marked_at || item.confirmed_at)}</td>
        </tr>
      `,
      )
      .join("");
  }
}
