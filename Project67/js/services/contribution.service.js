import { fakeRequest } from "./api.service.js";
import { PAYMENT_STATUS } from "../utils/constants.js";
import { getState, saveState } from "../utils/storage.js";

export async function getContributions(filterGroupId = "") {
  const state = getState();
  // Later PHP should return SQL-backed member payment status rows for each contribution.
  const contributions = state.contributions
    .filter((item) => (filterGroupId ? Number(item.group_id) === Number(filterGroupId) : true))
    .map((item) => ({
      ...item,
      group: state.groups.find((group) => group.group_id === item.group_id),
      payments: state.payment_records
        .filter((payment) => payment.contribution_id === item.contribution_id)
        .map((payment) => ({
          ...payment,
          user: state.users.find((user) => user.user_id === payment.user_id),
        })),
    }));

  return fakeRequest(contributions, 260);
}

export async function createContribution(payload) {
  const state = getState();
  // Keep core field names aligned with the current contributions table.
  // due_date and notes are demo-only until the SQL schema is extended. PHP must
  // verify the active user is a treasurer for group_id before inserting.
  const contribution = {
    contribution_id: Date.now(),
    group_id: Number(payload.group_id),
    title: payload.title,
    amount: Number(payload.amount),
    type: payload.type,
    frequency: payload.frequency,
    due_date: payload.due_date || "",
    notes: payload.notes || "",
  };

  state.contributions.unshift(contribution);

  const groupMembers = state.group_members.filter((member) => member.group_id === Number(payload.group_id));
  groupMembers.forEach((member) => {
    state.payment_records.push({
      payment_id: Date.now() + member.user_id,
      user_id: member.user_id,
      contribution_id: contribution.contribution_id,
      status: member.role === "Treasurer" ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.NOT_PAID,
      marked_at: null,
      confirmed_at: null,
      confirmed_by: null,
      rejection_note: "",
    });
  });

  saveState(state);
  return fakeRequest(contribution, 440);
}

export async function getContributionHistory(userId) {
  const state = getState();
  const history = state.payment_records
    .filter((payment) => Number(payment.user_id) === Number(userId))
    .map((payment) => {
      const contribution = state.contributions.find((item) => item.contribution_id === payment.contribution_id);
      const group = state.groups.find((item) => item.group_id === contribution.group_id);
      return { ...payment, contribution, group };
    });

  return fakeRequest(history, 260);
}

export async function getRecurringCycles(userId) {
  const history = await getContributionHistory(userId);
  return history.filter((item) => item.contribution.type === "Recurring");
}
