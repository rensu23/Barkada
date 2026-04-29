import { backendNotReady } from "./api.service.js";

export async function getGroupsForUser(userId) {
  // PHP TODO: GET php/groups/list.php for the session user.
  // Query group_members joined to groups; return role as member_role for UI display.
  return [];
}

export async function getGroupById(groupId) {
  // PHP TODO: GET php/groups/detail.php?group_id=...
  // Server must verify the current user belongs to this group before returning it.
  return null;
}

export async function createGroup(payload, currentUserId) {
  // PHP TODO: POST to php/groups/create.php. Insert groups, then group_members
  // role Treasurer in one transaction using the authenticated users.user_id.
  throw backendNotReady("php/groups/create.php");
}

export async function updateGroup(groupId, payload) {
  // PHP TODO: POST to php/groups/update.php. Check group_members.role = Treasurer.
  throw backendNotReady("php/groups/update.php");
}

export async function joinGroupByCode(joinCode, userId) {
  // PHP TODO: POST join_code to php/groups/join.php.
  // Look up groups.join_code, prevent duplicate group_members rows, and return
  // invalid/unauthorized/duplicate errors from the server.
  throw backendNotReady("php/groups/join.php");
}

export async function getMembersForGroup(groupId) {
  // PHP TODO: GET php/groups/members.php?group_id=...
  // Join group_members to users and aggregate payment_records through contributions.
  return [];
}
