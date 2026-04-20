import { fakeRequest } from "./api.service.js";
import { getGroupById } from "./group.service.js";
import { getUserProfile } from "./user.service.js";
import { getSession } from "../utils/storage.js";

export async function getGroupQrData(groupId) {
  const group = await getGroupById(groupId);
  return fakeRequest({
    title: group?.group_name || "Group QR",
    code: group?.join_code || "JOIN0000",
    hint: "Point a device camera here or use the join code manually.",
  }, 200);
}

export async function getMemberQrData() {
  const session = getSession();
  const user = await getUserProfile(session.user_id);
  return fakeRequest({
    title: user.name,
    code: `MEM-${user.user_id}`,
    hint: "Treasurers can use this page as a quick in-person check reference.",
  }, 200);
}

export async function scanQrInput(code) {
  return fakeRequest({
    ok: Boolean(code),
    code,
  }, 280);
}
