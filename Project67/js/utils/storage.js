import { mockUsers } from "../data/mock-users.js";
import { mockGroups } from "../data/mock-groups.js";
import { mockMembers } from "../data/mock-members.js";
import { mockContributions } from "../data/mock-contributions.js";
import { mockPayments } from "../data/mock-payments.js";
import { mockActivity } from "../data/mock-activity.js";
import { STORAGE_KEYS } from "./constants.js";

const seedDatabase = {
  users: mockUsers,
  groups: mockGroups,
  group_members: mockMembers,
  contributions: mockContributions,
  payment_records: mockPayments,
  activity_logs: mockActivity,
};

export function getState() {
  const stored = localStorage.getItem(STORAGE_KEYS.database);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.database, JSON.stringify(seedDatabase));
    return structuredClone(seedDatabase);
  }

  return JSON.parse(stored);
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEYS.database, JSON.stringify(state));
  return state;
}

export function resetDemoState() {
  localStorage.setItem(STORAGE_KEYS.database, JSON.stringify(seedDatabase));
}

export function getSession() {
  const stored = localStorage.getItem(STORAGE_KEYS.session);
  if (stored) {
    return JSON.parse(stored);
  }

  const defaultUser = mockUsers[0];
  const session = {
    user_id: defaultUser.user_id,
    name: defaultUser.name,
    email: defaultUser.email,
    role_view: "treasurer",
  };
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
  return session;
}

export function saveSession(session) {
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.session);
}
