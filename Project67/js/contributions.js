import { createContribution, getContributionHistory, getContributions, getRecurringCycles } from "./services/contribution.service.js";
import { getCurrentSession } from "./services/auth.service.js";
import { PAYMENT_STATUS } from "./utils/constants.js";
import { formatCurrency, formatShortDateTime } from "./utils/formatters.js";
import { showToast } from "./ui.js";

function paymentClass(status) {
  if (status === PAYMENT_STATUS.PAID) return "status-paid";
  if (status === PAYMENT_STATUS.PENDING) return "status-pending";
  if (status === PAYMENT_STATUS.REJECTED) return "status-rejected";
  return "status-unpaid";
}

function renderEmpty(target, title, message) {
  if (!target) return;
  target.innerHTML = `<article class="empty-card"><h3>${title}</h3><p class="helper-text">${message}</p></article>`;
}

function currentQueryFromControls() {
  return {
    search: document.querySelector("[data-contributions-search]")?.value || "",
    type: document.querySelector("[data-contributions-type]")?.value || "",
    group_id: document.querySelector("[data-contributions-group]")?.value || "",
    sort: document.querySelector("[data-contributions-sort]")?.value || "due-soon",
  };
}

export async function initContributionsPage() {
  const page = document.body.dataset.appPage;
  if (!["contributions", "recurring-cycle", "history"].includes(page || "")) return;
  const session = await getCurrentSession();

  if (page === "contributions") {
    const contributions = await getContributions();
    const list = document.querySelector("[data-contributions-list]");
    const form = document.querySelector("[data-contribution-form]");
    const groupFilter = document.querySelector("[data-contributions-group]");
    const filters = document.querySelectorAll("[data-contributions-search], [data-contributions-type], [data-contributions-group], [data-contributions-sort]");

    if (groupFilter && !groupFilter.children.length) {
      groupFilter.innerHTML = `<option value="">All groups</option>`;
    }

    const renderContributions = () => {
      const query = currentQueryFromControls();
      if (!contributions.length) {
        renderEmpty(list, "No contributions loaded", "PHP TODO: Use query parameters for SQL-backed search/type/group/sort against contributions joined to payment_records.");
        return;
      }

      list.innerHTML = contributions.map((item) => `
        <article class="card contribution-card">
          <div class="page-header">
            <div class="page-header-copy">
              <p class="eyebrow">${item.type}</p>
              <h3>${item.title}</h3>
              <p class="helper-text">${item.group?.group_name || "Group"} - ${formatCurrency(item.amount)}</p>
            </div>
            <span class="status-chip status-unpaid">${item.status || "SQL status"}</span>
          </div>
          <p class="helper-text">Backend must scope this row by group_members and payment_records before actions are rendered.</p>
        </article>
      `).join("");

      // UI only: controls stay responsive while PHP wiring is pending.
      list.dataset.pendingSqlQuery = JSON.stringify(query);
    };

    renderContributions();
    filters.forEach((control) => control.addEventListener("input", renderContributions));
    filters.forEach((control) => control.addEventListener("change", renderContributions));

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const payload = Object.fromEntries(new FormData(form).entries());
      try {
        await createContribution(payload);
        showToast("Contribution created.");
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  }

  if (page === "recurring-cycle") {
    const cycles = await getRecurringCycles(session?.user_id);
    const list = document.querySelector("[data-cycle-list]");
    if (!cycles.length) {
      renderEmpty(list, "No recurring cycles loaded", "PHP TODO: Filter contributions.type/frequency for recurring rows. The current schema has no separate cycle schedule table.");
    }
  }

  if (page === "history") {
    const history = await getContributionHistory(session?.user_id);
    const table = document.querySelector("[data-history-table]");
    const mobileList = document.querySelector("[data-history-list]");
    if (!history.length) {
      if (table) table.innerHTML = `<tr><td colspan="5">No payment history loaded. PHP TODO: Query payment_records joined to contributions and groups, ordered by latest update.</td></tr>`;
      renderEmpty(mobileList, "No payment history loaded", "PHP TODO: Members see only their own payment_records; treasurers may filter by group/member/contribution/status.");
      return;
    }

    const rows = history.map((item) => `
      <tr>
        <td>${item.contribution.title}</td>
        <td>${item.group.group_name}</td>
        <td>${formatCurrency(item.contribution.amount)}</td>
        <td><span class="status-chip ${paymentClass(item.status)}">${item.status}</span></td>
        <td>${formatShortDateTime(item.marked_at || item.confirmed_at)}</td>
      </tr>
    `).join("");
    table.innerHTML = rows;
  }
}
