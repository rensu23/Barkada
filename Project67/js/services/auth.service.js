import { backendNotReady } from "./api.service.js";
import { clearSession, getSession, updateSession } from "../utils/storage.js";

/**
* API request helper to handle fetch and errors.
*/
async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: { "Content-Type": "application/json", ...options.headers },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'API Error');
    return data;
}

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

  // Logic to fulfill the registration request
  return await apiRequest("php/auth/register.php", {
        method: "POST",
        body: JSON.stringify(formData),
  });
}

export async function requestPasswordReset(formData) {
  // Current schema has no reset token table. Add one before emailing reset links.

  // Logic added to handle the reset request
  return await apiRequest("php/auth/forgot-password.php", {
      method: "POST",
      body: JSON.stringify(formData),
  });
}

export async function resetPassword(formData) {
  // PHP TODO: Verify a stored reset token, then update users.password hash.
  
  // Logic added to handle the update
  return await apiRequest("php/auth/reset-password.php", {
      method: "POST",
      body: JSON.stringify(formData),
  });
}

export async function getCurrentSession() {
  // PHP TODO: Replace static fallback by fetching php/auth/session.php.
  try {
        const data = await apiRequest("php/auth/session.php");
        return updateSession(data.user);
    } catch (error) {
        clearSession();
        return getSession();
    }
}

export async function logoutUser() {
  clearSession();
  // PHP TODO: POST to php/auth/logout.php and redirect after session_destroy().

  try {
        await apiRequest("php/auth/logout.php", { method: "POST" });
    } finally {
        clearSession();
    }
    return { ok: true };
}

export async function setActiveGroup(groupId) {
  const session = updateSession({ active_group_id: Number(groupId) });
  // PHP TODO: Persist active group in PHP session only after checking group_members.

  await apiRequest("php/groups/set_active.php", {
        method: "POST",
        body: JSON.stringify({ group_id: Number(groupId) }),
  });

  return session;

}
