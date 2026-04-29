import { createContribution, getContributionHistory, getContributions, getRecurringCycles } from "./services/contribution.service.js";
import { confirmPayment, markPaymentAsDone, rejectPayment } from "./services/payment.service.js";
import { getCurrentSession } from "./services/auth.service.js";
import { getState } from "./utils/storage.js";
import { PAYMENT_STATUS } from "./utils/constants.js";
import { formatCurrency, formatDate, formatShortDateTime } from "./utils/formatters.js";
import { showToast, openModal } from "./ui.js";
import { buildDashboardMetrics, getGroupsForUserFromState } from "./utils/calculations.js";
import { canManageGroup } from "./utils/roles.js";

function statusDetails(payment, contribution) {
  const due = contribution.due_date ? new Date(`${contribution.due_date}T00:00:00`) : null;
  const daysLeft = due ? Math.ceil((due - new Date()) / 86400000) : null;

  if (payment?.status === PAYMENT_STATUS.PAID) return { label: "Confirmed / paid", className: "status-paid", action: "done" };
  if (payment?.status === PAYMENT_STATUS.PENDING) return { label: "Pending confirmation", className: "status-pending", action: "wait" };
  if (payment?.status === PAYMENT_STATUS.REJECTED) return { label: "Rejected / needs update", className: "status-rejected", action: "mark" };
  if (daysLeft !== null && daysLeft < 0) return { label: "Overdue", className: "status-rejected", action: "mark" };
  if (daysLeft !== null && daysLeft <= 7) return { label: "Due soon", className: "status-pending", action: "mark" };
  return { label: "Not paid", className: "status-unpaid", action: "mark" };
}

function dueDistance(contribution) {
  if (!contribution.due_date) return "No fixed due date";
  const due = new Date(`${contribution.due_date}T00:00:00`);
  const days = Math.ceil((due - new Date()) / 86400000);
  if (days < 0) return `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"}`;
  if (days === 0) return "Due today";
  return `Due in ${days} day${days === 1 ? "" : "s"}`;
}

function paymentClass(status) {
  if (status === PAYMENT_STATUS.PAID) return "status-paid";
  if (status === PAYMENT_STATUS.PENDING) return "status-pending";
  if (status === PAYMENT_STATUS.REJECTED) return "status-rejected";
  return "status-unpaid";
}

function contributionCounts(item) {
  return item.payments.reduce(
    (summary, payment) => {
      summary[payment.status] = (summary[payment.status] || 0) + 1;
      return summary;
    },
    { Paid: 0, Pending: 0, "Not Paid": 0, Rejected: 0 },
  );
}

function memberContributionCard(item, session) {
  const payment = item.payments.find((row) => Number(row.user_id) === Number(session.user_id));
  if (!payment) {
    return `
      <article class="card contribution-card">
        <div class="page-header">
          <div class="page-header-copy">
            <p class="eyebrow">${item.type}</p>
            <h3>${item.title}</h3>
            <p class="helper-text">${item.group.group_name}</p>
          </div>
          <span class="status-chip status-unpaid">No record yet</span>
        </div>
        <p class="helper-text">This contribution has not been assigned to your account yet.</p>
      </article>
    `;
  }
  const status = statusDetails(payment, item);
  const amount = Number(item.amount || 0);
  const paidValue = [PAYMENT_STATUS.PAID, PAYMENT_STATUS.PENDING].includes(payment.status) ? amount : 0;
  const remaining = Math.max(0, amount - paidValue);
  const progress = amount ? Math.round((paidValue / amount) * 100) : 0;
  const remainingText = payment.status === PAYMENT_STATUS.PAID
    ? "Paid in full"
    : payment.status === PAYMENT_STATUS.PENDING
      ? "Awaiting confirmation"
      : `${formatCurrency(remaining)} remaining`;
  const action = status.action === "mark"
    ? `<button class="button" type="button" data-mark-paid="${payment.payment_id}">Mark as paid</button>`
    : status.action === "wait"
      ? `<span class="status-chip status-pending">Waiting for treasurer review</span>`
      : `<span class="status-chip status-paid">No action needed</span>`;

  return `
    <article class="card contribution-card">
      <div class="page-header">
        <div class="page-header-copy">
          <p class="eyebrow">${item.type}</p>
          <h3>${item.title}</h3>
          <p class="helper-text">${item.group.group_name}</p>
        </div>
        <span class="status-chip ${status.className}">${status.label}</span>
      </div>
      <div class="detail-list">
        <div class="summary-row"><span>Required amount</span><strong>${formatCurrency(amount)}</strong></div>
        <div class="summary-row"><span>Your progress</span><strong>${remainingText}</strong></div>
        <div class="summary-row"><span>Due date</span><strong>${formatDate(item.due_date)}</strong></div>
        ${payment?.rejection_note ? `<div class="summary-row"><span>Update needed</span><strong>${payment.rejection_note}</strong></div>` : ""}
      </div>
      <div class="contribution-metrics">
        <div class="progress-track" aria-label="${progress}% of this contribution is paid or pending"><div class="progress-fill" style="--value:${progress}%"></div></div>
        <p class="compact-note">${dueDistance(item)} - ${item.frequency}</p>
      </div>
      <div class="inline-actions">
        ${action}
      </div>
      <p class="compact-note">Pending confirmation means your mark is saved and the treasurer needs to review it.</p>
    </article>
  `;
}

function treasurerContributionCard(item) {
  const counts = contributionCounts(item);
  const pendingRows = item.payments.filter((row) => row.status === PAYMENT_STATUS.PENDING);
  const total = item.payments.length || 1;
  const paidPct = Math.round((counts.Paid / total) * 100);
  const openCount = counts["Not Paid"] + counts.Rejected;
  return `
    <article class="card contribution-card">
      <div class="page-header">
        <div class="page-header-copy">
          <p class="eyebrow">${item.type}</p>
          <h3>${item.title}</h3>
          <p class="helper-text">${item.group.group_name} - ${formatCurrency(item.amount)} due ${formatDate(item.due_date)}</p>
        </div>
        <span class="status-chip status-pending">${counts.Pending} pending</span>
      </div>
      <div class="detail-list">
        <div class="summary-row"><span>Required amount</span><strong>${formatCurrency(item.amount)} per member</strong></div>
        <div class="summary-row"><span>Status summary</span><strong>${counts.Paid} paid, ${counts.Pending} pending, ${openCount} open</strong></div>
        <div class="summary-row"><span>Notes</span><strong>${item.notes || "No notes"}</strong></div>
      </div>
      <div class="contribution-metrics">
        <div class="progress-track" aria-label="${paidPct}% confirmed"><div class="progress-fill" style="--value:${paidPct}%"></div></div>
        <p class="compact-note">${paidPct}% confirmed - ${dueDistance(item)}</p>
      </div>
      <div class="surface-list">
        ${pendingRows.length ? pendingRows.map((payment) => `
          <div class="payment-row">
            <div>
              <strong>${payment.user?.name || "Member"}</strong>
              <p class="helper-text">Marked ${formatShortDateTime(payment.marked_at)} for ${item.title}</p>
            </div>
            <div class="payment-row-actions">
              <button class="button" type="button" data-confirm-payment="${payment.payment_id}">Confirm</button>
              <button class="button-danger" type="button" data-reject-payment="${payment.payment_id}">Reject</button>
            </div>
          </div>
        `).join("") : `<div class="payment-row"><div><strong>No pending claims</strong><p class="helper-text">When members mark this as paid, confirmation actions will appear here.</p></div><span class="status-chip status-paid">Clear</span></div>`}
      </div>
    </article>
  `;
}

function bindPaymentActions(list, session) {
  list.querySelectorAll("[data-mark-paid]").forEach((button) => {
    button.addEventListener("click", async () => {
      await markPaymentAsDone(button.dataset.markPaid);
      showToast("Marked as paid. It now needs treasurer confirmation.");
      window.location.reload();
    });
  });

  list.querySelectorAll("[data-confirm-payment]").forEach((button) => {
    button.addEventListener("click", async () => {
      await confirmPayment(button.dataset.confirmPayment, session.user_id);
      showToast("Payment confirmed and totals updated.");
      window.location.reload();
    });
  });

  list.querySelectorAll("[data-reject-payment]").forEach((button) => {
    button.addEventListener("click", () => {
      const overlay = openModal({
        title: "Reject payment",
        body: "Add a short note so the member knows what to fix.",
        actions: `
          <form data-rejection-form class="stack">
            <label class="field-group">Reason<textarea name="note" rows="4" placeholder="Example: Please send a clearer payment reference."></textarea></label>
            <button class="button-danger button-block" type="submit">Reject payment</button>
          </form>
        `,
      });
      overlay.querySelector("[data-rejection-form]").addEventListener("submit", async (event) => {
        event.preventDefault();
        const note = new FormData(event.currentTarget).get("note");
        await rejectPayment(button.dataset.rejectPayment, session.user_id, note);
        showToast("Payment marked as rejected.", "error");
        window.location.reload();
      });
    });
  });
}

export async function initContributionsPage() {
  const page = document.body.dataset.appPage;
  if (!["contributions", "recurring-cycle", "history"].includes(page || "")) return;
  const session = await getCurrentSession();

  if (page === "contributions") {
    const contributions = await getContributions();
    const state = getState();
    const scoped = buildDashboardMetrics(state, session.user_id, session.active_group_id);
    const memberships = getGroupsForUserFromState(state, session.user_id);
    const list = document.querySelector("[data-contributions-list]");
    const search = document.querySelector("[data-contributions-search]");
    const typeFilter = document.querySelector("[data-contributions-type]");
    const groupFilter = document.querySelector("[data-contributions-group]");
    const sortFilter = document.querySelector("[data-contributions-sort]");
    const form = document.querySelector("[data-contribution-form]");
    const createPanel = document.querySelector("[data-contribution-create-panel]");
    const managedGroups = scoped.groups.filter((group) => group.member_role === "Treasurer");

    groupFilter.innerHTML = `<option value="">All groups</option>${scoped.groups.map((group) => `<option value="${group.group_id}">${group.group_name}</option>`).join("")}`;

    if (!managedGroups.length) {
      createPanel?.remove();
    } else if (form) {
      const groupSelect = form.querySelector("[name='group_id']");
      groupSelect.innerHTML = managedGroups.map((group) => `<option value="${group.group_id}">${group.group_id} - ${group.group_name}</option>`).join("");
    }

    const renderContributions = () => {
      const term = search?.value?.toLowerCase() || "";
      const typeValue = typeFilter?.value || "";
      const groupValue = groupFilter?.value || "";
      const sorted = contributions
        .filter((item) => scoped.groups.some((group) => group.group_id === item.group_id))
        .filter((item) => item.title.toLowerCase().includes(term) || item.group.group_name.toLowerCase().includes(term))
        .filter((item) => !typeValue || typeValue === "All" || item.type === typeValue)
        .filter((item) => !groupValue || Number(item.group_id) === Number(groupValue));

      sorted.sort((a, b) => {
        const sortValue = sortFilter?.value || "due-soon";
        if (sortValue === "amount-high") return Number(b.amount) - Number(a.amount);
        if (sortValue === "amount-low") return Number(a.amount) - Number(b.amount);
        if (sortValue === "title") return a.title.localeCompare(b.title);
        return new Date(a.due_date || "2999-12-31") - new Date(b.due_date || "2999-12-31");
      });

      list.innerHTML = sorted.length
        ? sorted
          .map((item) => {
            const membership = memberships.find((group) => Number(group.group_id) === Number(item.group_id));
            return membership?.member_role === "Treasurer" || canManageGroup(state, session, item.group_id)
              ? treasurerContributionCard(item)
              : memberContributionCard(item, session);
          })
          .join("")
        : `<article class="empty-card"><h3>No contributions match</h3><p class="helper-text">Try a different search, group, type, or sort setting.</p></article>`;

      bindPaymentActions(list, session);
    };

    renderContributions();
    search?.addEventListener("input", renderContributions);
    typeFilter?.addEventListener("change", renderContributions);
    groupFilter?.addEventListener("change", renderContributions);
    sortFilter?.addEventListener("change", renderContributions);

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
            <span class="status-chip ${paymentClass(item.status)}">${item.status}</span>
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
    const mobileList = document.querySelector("[data-history-list]");
    const rows = history
      .map(
        (item) => `
        <tr>
          <td>${item.contribution.title}</td>
          <td>${item.group.group_name}</td>
          <td>${formatCurrency(item.contribution.amount)}</td>
          <td><span class="status-chip ${paymentClass(item.status)}">${item.status}</span></td>
          <td>${formatShortDateTime(item.marked_at || item.confirmed_at)}</td>
        </tr>
      `,
      )
      .join("");
    table.innerHTML = rows || `<tr><td colspan="5">No payment history yet.</td></tr>`;
    if (mobileList) {
      mobileList.innerHTML = history.length
        ? history.map((item) => `
          <article class="history-card">
            <div>
              <strong>${item.contribution.title}</strong>
              <p class="helper-text">${item.group.group_name}</p>
            </div>
            <div class="summary-row"><span>Amount</span><strong>${formatCurrency(item.contribution.amount)}</strong></div>
            <div class="summary-row"><span>Status</span><span class="status-chip ${paymentClass(item.status)}">${item.status}</span></div>
            <div class="summary-row"><span>Latest update</span><strong>${formatShortDateTime(item.marked_at || item.confirmed_at)}</strong></div>
          </article>
        `).join("")
        : `<article class="empty-card"><h3>No payment history yet</h3><p class="helper-text">Marked and confirmed payments will appear here.</p></article>`;
    }
  }
}
