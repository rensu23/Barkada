import { getPendingPayments, confirmPayment, markPaymentAsDone, rejectPayment } from "./services/payment.service.js";
import { getCurrentSession } from "./services/auth.service.js";
import { getContributionHistory } from "./services/contribution.service.js";
import { formatCurrency, formatShortDateTime } from "./utils/formatters.js";
import { openModal, showToast } from "./ui.js";

export async function initPaymentsPage() {
  const page = document.body.dataset.appPage;
  const session = await getCurrentSession();

  if (page === "confirmations") {
    const pending = await getPendingPayments();
    const list = document.querySelector("[data-confirmations-list]");
    list.innerHTML = pending
      .map(
        (item) => `
        <article class="card">
          <div class="page-header">
            <div class="page-header-copy">
              <p class="eyebrow">${item.group.group_name}</p>
              <h3>${item.user.name}</h3>
              <p class="helper-text">${item.contribution.title} • ${formatCurrency(item.contribution.amount)}</p>
            </div>
            <span class="status-chip status-pending">${item.status}</span>
          </div>
          <div class="summary-row"><span>Marked at</span><strong>${formatShortDateTime(item.marked_at)}</strong></div>
          <div class="header-actions space-top">
            <button class="button" type="button" data-confirm-payment="${item.payment_id}">Confirm</button>
            <button class="button-danger" type="button" data-reject-payment="${item.payment_id}">Reject</button>
          </div>
        </article>
      `,
      )
      .join("");

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
              <textarea name="note" rows="4" placeholder="Example: Please send a clearer payment photo."></textarea>
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

  if (page === "contributions") {
    const history = await getContributionHistory(session.user_id);
    const actionsWrap = document.querySelector("[data-member-actions]");
    if (!actionsWrap) return;

    actionsWrap.innerHTML = history
      .filter((item) => item.status === "Not Paid" || item.status === "Rejected")
      .slice(0, 2)
      .map(
        (item) => `
        <article class="mobile-list-item">
          <div class="page-header">
            <div class="page-header-copy">
              <strong>${item.contribution.title}</strong>
              <p class="helper-text">${item.group.group_name}</p>
            </div>
            <span class="status-chip ${item.status === "Rejected" ? "status-rejected" : "status-unpaid"}">${item.status}</span>
          </div>
          <button class="button button-block space-top" type="button" data-mark-paid="${item.payment_id}">Mark as Paid</button>
        </article>
      `,
      )
      .join("");

    actionsWrap.querySelectorAll("[data-mark-paid]").forEach((button) => {
      button.addEventListener("click", async () => {
        await markPaymentAsDone(button.dataset.markPaid);
        showToast("Marked as paid. The treasurer will now see it under confirmations.");
        window.location.reload();
      });
    });
  }
}
