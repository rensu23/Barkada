import { fakeRequest } from "./api.service.js";
import { getGroupById } from "./group.service.js";
import { getUserProfile } from "./user.service.js";
import { getSession, getState } from "../utils/storage.js";
import { getGroupsForUserFromState } from "../utils/calculations.js";

export async function getGroupQrData(groupId) {
  const group = await getGroupById(groupId);
  return fakeRequest({
    title: group?.group_name || "Group QR",
    code: group?.join_code || "JOIN0000",
    invite_link: `https://barkada.local/join/${group?.join_code || "JOIN0000"}`,
    hint: "Point a device camera here or use the join code manually.",
  }, 200);
}

export async function getMemberQrData() {
  const session = getSession();
  const user = await getUserProfile(session.user_id);
  const groups = getGroupsForUserFromState(getState(), session.user_id);
  return fakeRequest({
    title: user.name,
    code: `MEM-${user.user_id}`,
    hint: `${groups.length} active group${groups.length === 1 ? "" : "s"} connected to this demo account.`,
  }, 200);
}

export async function scanQrInput(code) {
  const normalizedCode = String(code || "").toLowerCase();
  const state = getState();
  const group = state.groups.find((item) => item.join_code.toLowerCase() === normalizedCode);
  const member = state.users.find((item) => `MEM-${item.user_id}`.toLowerCase() === normalizedCode);
  return fakeRequest({
    ok: Boolean(group || member),
    code,
    kind: group ? "group" : member ? "member" : "unknown",
    label: group ? group.group_name : member ? member.name : "",
  }, 280);
}
