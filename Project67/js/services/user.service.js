import { fakeRequest } from "./api.service.js";
import { getState, saveState } from "../utils/storage.js";

export async function getUserProfile(userId) {
  const state = getState();
  const user = state.users.find((item) => Number(item.user_id) === Number(userId));
  return fakeRequest(user, 180);
}

export async function updateUserProfile(userId, payload) {
  const state = getState();
  const user = state.users.find((item) => Number(item.user_id) === Number(userId));
  Object.assign(user, payload);
  saveState(state);
  return fakeRequest(user, 320);
}

export async function getUsers() {
  const state = getState();
  return fakeRequest(state.users, 180);
}
