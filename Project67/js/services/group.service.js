import { fakeRequest } from "./api.service.js";
import { getState, saveState } from "../utils/storage.js";

export async function getGroupsForUser(userId) {
  const state = getState();
  const memberships = state.group_members.filter((member) => member.user_id === userId);
  const groups = memberships.map((membership) => {
    const group = state.groups.find((item) => item.group_id === membership.group_id);
    return { ...group, member_role: membership.role };
  });
  return fakeRequest(groups, 260);
}

export async function getGroupById(groupId) {
  const state = getState();
  const group = state.groups.find((item) => Number(item.group_id) === Number(groupId));
  return fakeRequest(group, 220);
}

export async function createGroup(payload, currentUserId) {
  const state = getState();
  const group_id = Date.now();
  const newGroup = {
    group_id,
    group_name: payload.group_name,
    description: payload.description,
    treasurer_id: currentUserId,
    target_amount: Number(payload.target_amount || 0),
    deadline: payload.deadline || "",
    join_code: payload.join_code || `JOIN${String(group_id).slice(-4)}`,
    created_at: new Date().toISOString(),
    accent_color: payload.accent_color || "#23617E",
  };

  state.groups.unshift(newGroup);
  state.group_members.push({
    member_id: Date.now() + 1,
    user_id: currentUserId,
    group_id,
    role: "Treasurer",
    joined_at: new Date().toISOString(),
  });

  saveState(state);
  return fakeRequest(newGroup, 420);
}

export async function updateGroup(groupId, payload) {
  const state = getState();
  const group = state.groups.find((item) => Number(item.group_id) === Number(groupId));
  Object.assign(group, payload);
  saveState(state);
  return fakeRequest(group, 420);
}

export async function joinGroupByCode(joinCode, userId) {
  const state = getState();
  const group = state.groups.find((item) => item.join_code.toLowerCase() === joinCode.toLowerCase());
  if (!group) {
    throw new Error("That group code is invalid or has expired.");
  }

  const membershipExists = state.group_members.some((member) => member.group_id === group.group_id && member.user_id === userId);
  if (!membershipExists) {
    state.group_members.push({
      member_id: Date.now(),
      user_id: userId,
      group_id: group.group_id,
      role: "Member",
      joined_at: new Date().toISOString(),
    });
    saveState(state);
  }

  return fakeRequest(group, 320);
}

export async function getMembersForGroup(groupId) {
  const state = getState();
  const rows = state.group_members
    .filter((member) => Number(member.group_id) === Number(groupId))
    .map((member) => ({
      ...member,
      user: state.users.find((user) => user.user_id === member.user_id),
    }));

  return fakeRequest(rows, 260);
}
