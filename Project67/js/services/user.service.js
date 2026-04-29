import { backendNotReady } from "./api.service.js";

export async function getUserProfile(userId) {
  // PHP TODO: GET php/users/profile.php for the current session user.
  // Do not return users.password.
  return null;
}

export async function updateUserProfile(userId, payload) {
  // PHP TODO: POST to php/users/update-profile.php with CSRF protection.
  throw backendNotReady("php/users/update-profile.php");
}

export async function getUsers() {
  // Avoid listing all users unless an authorized member-management endpoint needs it.
  return [];
}
