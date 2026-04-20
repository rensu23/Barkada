import { fakeRequest } from "./api.service.js";
import { PAYMENT_STATUS } from "../utils/constants.js";
import { getState, saveState } from "../utils/storage.js";

function appendActivity(state, title, meta) {
  state.activity_logs.unshift({
    id: Date.now(),
    type: "payment",
    title,
    meta,
    created_at: new Date().toISOString(),
  });
}

export async function getPendingPayments() {
  const state = getState();
  const rows = state.payment_records
    .filter((payment) => payment.status === PAYMENT_STATUS.PENDING)
    .map((payment) => {
      const user = state.users.find((item) => item.user_id === payment.user_id);
      const contribution = state.contributions.find((item) => item.contribution_id === payment.contribution_id);
      const group = state.groups.find((item) => item.group_id === contribution.group_id);
      return { ...payment, user, contribution, group };
    });
  return fakeRequest(rows, 260);
}

export async function markPaymentAsDone(paymentId) {
  const state = getState();
  const payment = state.payment_records.find((item) => Number(item.payment_id) === Number(paymentId));
  payment.status = PAYMENT_STATUS.PENDING;
  payment.marked_at = new Date().toISOString();
  payment.confirmed_at = null;
  payment.confirmed_by = null;
  appendActivity(state, "A member marked a contribution as paid", "Status changed to pending confirmation.");
  saveState(state);
  return fakeRequest(payment, 360);
}

export async function confirmPayment(paymentId, confirmedBy) {
  const state = getState();
  const payment = state.payment_records.find((item) => Number(item.payment_id) === Number(paymentId));
  payment.status = PAYMENT_STATUS.PAID;
  payment.confirmed_at = new Date().toISOString();
  payment.confirmed_by = confirmedBy;
  payment.rejection_note = "";
  appendActivity(state, "A payment was confirmed", "Dashboard totals should now increase.");
  saveState(state);
  return fakeRequest(payment, 360);
}

export async function rejectPayment(paymentId, confirmedBy, note) {
  const state = getState();
  const payment = state.payment_records.find((item) => Number(item.payment_id) === Number(paymentId));
  payment.status = PAYMENT_STATUS.REJECTED;
  payment.confirmed_at = new Date().toISOString();
  payment.confirmed_by = confirmedBy;
  payment.rejection_note = note;
  appendActivity(state, "A payment was rejected", note || "The treasurer asked for a clearer payment reference.");
  saveState(state);
  return fakeRequest(payment, 360);
}
