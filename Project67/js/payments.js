import { getPendingPayments, confirmPayment, rejectPayment } from "./services/payment.service.js";
import { getCurrentSession } from "./services/auth.service.js";
import { getState } from "./utils/storage.js";
import { formatCurrency, formatShortDateTime } from "./utils/formatters.js";
import { openModal, showToast } from "./ui.js";
import { canManageActiveGroup } from "./utils/roles.js";

export async function initPaymentsPage() {
  const page = document.body.dataset.appPage;
  if (!["confirmations", "contributions"].includes(page || "")) return;
  const session = await getCurrentSession();
  const state = getState();
  const isTreasurerHere = canManageActiveGroup(state, session);

  if (page === "confirmations") {
    const list = document.querySelector("[data-confirmations-list]");
    if (!isTreasurerHere) {
      window.location.replace("./dashboard.html");
      return;
    }

    const pending = await getPendingPayments(session.active_group_id);
    list.innerHTML = pending
      .map(
        (item) => `
        <article class="card contribution-card">
          <div class="page-header">
            <div class="page-header-copy">
              <p class="eyebrow">${item.group.group_name}</p>
              <h3>${item.user.name}</h3>
              <p class="helper-text">${item.contribution.title} - ${formatCurrency(item.contribution.amount)}</p>
            </div>
            <span class="status-chip status-pending">${item.status}</span>
          </div>
          <div class="summary-row"><span>Marked at</span><strong>${formatShortDateTime(item.marked_at)}</strong></div>
          <div class="inline-actions space-top">
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

}
