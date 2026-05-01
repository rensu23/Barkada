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

export async function loginUser(email, password, remember) {
  // PHP TODO: POST email/password to php/auth/login.php.
  // Server must query users.email, verify users.password with password_verify,
  // regenerate the PHP session, and return safe user/session details.
    const data = await apiRequest("php/auth/login.php", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

    return await res.json();
}

export async function registerUser(payload) {
  // Path fixed: removed "../" because php is a sibling to the js folder
  const response = await fetch("../php/auth/register.php", {
    method: "POST",
    body: JSON.stringify(payload) // Using JSON to match your professional apiRequest style
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error || "Registration failed");
  }

  return data;
}

export async function requestPasswordReset(formData) {
  // Current schema has no reset token table. Add one before emailing reset links.

  // Logic added to handle the reset request
  return await apiRequest("../php/auth/forgot-password.php", {
      method: "POST",
      body: JSON.stringify(formData),
  });
}

export async function resetPassword(formData) {
  // PHP TODO: Verify a stored reset token, then update users.password hash.
  
  // Logic added to handle the update
  return await apiRequest("../php/auth/reset-password.php", {
      method: "POST",
      body: JSON.stringify(formData),
  });
}

export async function getCurrentSession() {
  // PHP TODO: Replace static fallback by fetching php/auth/session.php.
  try {
        const data = await apiRequest("../php/auth/session.php");
        return updateSession(data.user);
    } catch (error) {
        clearSession();
        return getSession();
    }
}

export async function logoutUser() {
  // PHP TODO: POST to php/auth/logout.php and redirect after session_destroy().

    await fetch("../php/auth/logout.php");

    window.location.href = "login.html";
}

export async function setActiveGroup(groupId) {
  const session = updateSession({ active_group_id: Number(groupId) });
  // PHP TODO: Persist active group in PHP session only after checking group_members.

  await apiRequest("../groups/set_active.php", {
        method: "POST",
        body: JSON.stringify({ group_id: Number(groupId) }),
  });

  return session;

}

export async function checkAuth() {
    const res = await fetch("../php/auth/check.php");
    return await res.json();
}