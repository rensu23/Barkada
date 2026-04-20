import { fakeRequest } from "./api.service.js";
import { buildSessionForUser, clearSession, getSession, getState, saveSession, saveState, updateSession } from "../utils/storage.js";

export async function loginUser(formData) {
  const state = getState();
  const matchedUser = state.users.find((user) => user.email.toLowerCase() === formData.email.toLowerCase());

  if (!matchedUser) {
    throw new Error("We could not find an account with that email.");
  }

  if (matchedUser.password !== formData.password) {
    throw new Error("The password did not match our demo account.");
  }

  const session = buildSessionForUser(matchedUser);
  saveSession(session, Boolean(formData.remember_me));
  return fakeRequest(session);
}

export async function registerUser(formData) {
  const state = getState();
  const emailExists = state.users.some((user) => user.email.toLowerCase() === formData.email.toLowerCase());
  if (emailExists) {
    throw new Error("That email is already used in the demo data.");
  }

  const newUser = {
    user_id: Date.now(),
    name: formData.name,
    email: formData.email,
    password: formData.password,
    created_at: new Date().toISOString(),
  };

  state.users.push(newUser);
  saveState(state);
  return fakeRequest(newUser, 480);
}

export async function requestPasswordReset(formData) {
  /* TODO: Later connect this to php/auth/forgot-password.php.
     The current SQL schema does not include reset tokens yet. */
  return fakeRequest({
    ok: true,
    message: `A reset link would be sent to ${formData.email} once backend email handling is ready.`,
  }, 540);
}

export async function resetPassword(formData) {
  /* TODO: Add token verification table or secure reset token flow later. */
  const state = getState();
  const matchedUser = state.users.find((user) => user.email.toLowerCase() === formData.email.toLowerCase());
  if (!matchedUser) {
    throw new Error("Use one of the demo emails first so the mock reset can continue.");
  }

  matchedUser.password = formData.password;
  saveState(state);
  return fakeRequest({ ok: true }, 520);
}

export async function getCurrentSession() {
  const session = getSession();
  if (!session) {
    throw new Error("No active session found.");
  }
  return fakeRequest(session, 120);
}

export async function logoutUser() {
  clearSession();
  return fakeRequest({ ok: true }, 120);
}

export async function setActiveGroup(groupId) {
  const session = updateSession({ active_group_id: Number(groupId) });
  return fakeRequest(session, 120);
}
