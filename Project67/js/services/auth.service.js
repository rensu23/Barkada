import { backendNotReady } from "./api.service.js";
import { clearSession, getSession, updateSession } from "../utils/storage.js";

export async function loginUser(email, password) {
  // PHP TODO: POST email/password to php/auth/login.php.
  // Server must query users.email, verify users.password with password_verify,
  // regenerate the PHP session, and return safe user/session details.
  const res = await fetch("php/auth/login.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return await res.json();
}

export async function registerUser(formData) {
  // PHP TODO: POST to php/auth/register.php. Validate name/email/password,
  // check duplicate users.email, hash with password_hash, insert users row.
  throw backendNotReady("php/auth/register.php");
}

export async function requestPasswordReset(formData) {
  // Current schema has no reset token table. Add one before emailing reset links.
  throw backendNotReady("php/auth/forgot-password.php");
}

export async function resetPassword(formData) {
  // PHP TODO: Verify a stored reset token, then update users.password hash.
  throw backendNotReady("php/auth/reset-password.php");
}

export async function getCurrentSession() {
  // PHP TODO: Replace static fallback by fetching php/auth/session.php.
  return getSession();
}

export async function logoutUser() {
  clearSession();
  // PHP TODO: POST to php/auth/logout.php and redirect after session_destroy().
  return { ok: true };
}

export async function setActiveGroup(groupId) {
  const session = updateSession({ active_group_id: Number(groupId) });
  // PHP TODO: Persist active group in PHP session only after checking group_members.
  return session;
}
