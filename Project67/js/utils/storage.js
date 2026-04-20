import { mockUsers } from "../data/mock-users.js";
import { mockGroups } from "../data/mock-groups.js";
import { mockMembers } from "../data/mock-members.js";
import { mockContributions } from "../data/mock-contributions.js";
import { mockPayments } from "../data/mock-payments.js";
import { mockActivity } from "../data/mock-activity.js";
import { mockQr } from "../data/mock-qr.js";
import { STORAGE_KEYS } from "./constants.js";
import { clearCookie, getCookie, setCookie } from "./cookies.js";
import { getEffectiveRole, getGroupsForUserFromState, resolveActiveGroupId } from "./calculations.js";

const seedDatabase = {
  users: mockUsers,
  groups: mockGroups,
  group_members: mockMembers,
  contributions: mockContributions,
  payment_records: mockPayments,
  activity_logs: mockActivity,
  qr_meta: mockQr,
};

function getSessionStorageTarget() {
  const storedType = localStorage.getItem(STORAGE_KEYS.session_type) || sessionStorage.getItem(STORAGE_KEYS.session_type);
  return storedType === "session" ? sessionStorage : localStorage;
}

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
  const storedLocal = localStorage.getItem(STORAGE_KEYS.session);
  const storedSession = sessionStorage.getItem(STORAGE_KEYS.session);
  const stored = storedLocal || storedSession || getCookie(STORAGE_KEYS.session);

  if (stored) {
    return JSON.parse(stored);
  }
  return null;
}

export function buildSessionForUser(user) {
  const state = getState();
  const groups = getGroupsForUserFromState(state, user.user_id);
  const active_group_id = resolveActiveGroupId(groups, {});

  return {
    user_id: user.user_id,
    name: user.name,
    email: user.email,
    effective_role: getEffectiveRole(groups),
    active_group_id,
    remember_me: false,
  };
}

export function saveSession(session, rememberMe = true) {
  const target = rememberMe ? localStorage : sessionStorage;
  const other = rememberMe ? sessionStorage : localStorage;
  const storageType = rememberMe ? "local" : "session";
  const payload = JSON.stringify({ ...session, remember_me: rememberMe });

  other.removeItem(STORAGE_KEYS.session);
  other.removeItem(STORAGE_KEYS.session_type);
  target.setItem(STORAGE_KEYS.session, payload);
  target.setItem(STORAGE_KEYS.session_type, storageType);
  if (rememberMe) {
    setCookie(STORAGE_KEYS.session, payload, 60 * 60 * 24 * 7);
  } else {
    clearCookie(STORAGE_KEYS.session);
  }
}

export function updateSession(patch) {
  const session = getSession();
  if (!session) return null;
  const nextSession = { ...session, ...patch };
  const rememberMe = getSessionStorageTarget() === localStorage;
  saveSession(nextSession, rememberMe);
  return nextSession;
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.session);
  localStorage.removeItem(STORAGE_KEYS.session_type);
  sessionStorage.removeItem(STORAGE_KEYS.session);
  sessionStorage.removeItem(STORAGE_KEYS.session_type);
  clearCookie(STORAGE_KEYS.session);
}
