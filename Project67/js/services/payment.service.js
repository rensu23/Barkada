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

export async function getPendingPayments(groupId = null) {
  const state = getState();
  // SQL migration: join payment_records -> contributions -> groups and scope by treasurer authorization.
  const rows = state.payment_records
    .filter((payment) => payment.status === PAYMENT_STATUS.PENDING)
    .map((payment) => {
      const user = state.users.find((item) => item.user_id === payment.user_id);
      const contribution = state.contributions.find((item) => item.contribution_id === payment.contribution_id);
      const group = state.groups.find((item) => item.group_id === contribution.group_id);
      return { ...payment, user, contribution, group };
    })
    .filter((payment) => (groupId ? Number(payment.group.group_id) === Number(groupId) : true));
  return fakeRequest(rows, 260);
}

export async function markPaymentAsDone(paymentId) {
  const state = getState();
  // Future PHP endpoint: update payment_records.status and marked_at for this payment_id.
  const payment = state.payment_records.find((item) => Number(item.payment_id) === Number(paymentId));
  const contribution = state.contributions.find((item) => item.contribution_id === payment.contribution_id);
  const member = state.users.find((item) => item.user_id === payment.user_id);
  payment.status = PAYMENT_STATUS.PENDING;
  payment.marked_at = new Date().toISOString();
  payment.confirmed_at = null;
  payment.confirmed_by = null;
  appendActivity(state, `${member.name} marked ${contribution.title} as paid`, `Group ${contribution.group_id} now needs treasurer review.`);
  saveState(state);
  return fakeRequest(payment, 360);
}

export async function confirmPayment(paymentId, confirmedBy) {
  const state = getState();
  // Future PHP endpoint: verify treasurer permission before setting confirmed_at/confirmed_by.
  const payment = state.payment_records.find((item) => Number(item.payment_id) === Number(paymentId));
  const contribution = state.contributions.find((item) => item.contribution_id === payment.contribution_id);
  const member = state.users.find((item) => item.user_id === payment.user_id);
  payment.status = PAYMENT_STATUS.PAID;
  payment.confirmed_at = new Date().toISOString();
  payment.confirmed_by = confirmedBy;
  payment.rejection_note = "";
  appendActivity(state, `${member.name} was confirmed for ${contribution.title}`, "Dashboard totals updated from the same payment source.");
  saveState(state);
  return fakeRequest(payment, 360);
}

export async function rejectPayment(paymentId, confirmedBy, note) {
  const state = getState();
  // Future PHP endpoint: verify treasurer permission and persist rejection_note if the schema adds it.
  const payment = state.payment_records.find((item) => Number(item.payment_id) === Number(paymentId));
  const contribution = state.contributions.find((item) => item.contribution_id === payment.contribution_id);
  const member = state.users.find((item) => item.user_id === payment.user_id);
  payment.status = PAYMENT_STATUS.REJECTED;
  payment.confirmed_at = new Date().toISOString();
  payment.confirmed_by = confirmedBy;
  payment.rejection_note = note;
  appendActivity(state, `${member.name}'s ${contribution.title} claim was rejected`, note || "The treasurer asked for a clearer payment reference.");
  saveState(state);
  return fakeRequest(payment, 360);
}
