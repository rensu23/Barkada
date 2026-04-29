import { createGroup, getGroupById, getGroupsForUser, getMembersForGroup, joinGroupByCode, updateGroup } from "./services/group.service.js";
import { getCurrentSession } from "./services/auth.service.js";
import { getContributions } from "./services/contribution.service.js";
import { formatCurrency, formatDate } from "./utils/formatters.js";
import { showToast } from "./ui.js";

function getQueryGroupId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("group_id") || "";
}

function renderEmpty(target, title, message) {
  if (!target) return;
  target.innerHTML = `<article class="empty-card"><h3>${title}</h3><p class="helper-text">${message}</p></article>`;
}

export async function initGroupsPage() {
  const page = document.body.dataset.appPage;
  if (!["groups", "group-details", "create-group", "edit-group", "members", "join-group"].includes(page || "")) return;

  const session = await getCurrentSession();

  if (page === "groups") {
    const groups = await getGroupsForUser(session?.user_id);
    const list = document.querySelector("[data-groups-list]");
    const empty = document.querySelector("[data-groups-empty]");

    empty?.classList.toggle("hidden", groups.length > 0);
    if (!groups.length) {
      renderEmpty(list, "No groups loaded", "PHP TODO: Load current user's groups from group_members joined with groups. Show create/join actions when the SQL result is empty.");
      return;
    }

    list.innerHTML = groups.map((group) => `
      <article class="card group-card">
        <div class="page-header">
          <div class="page-header-copy">
            <p class="eyebrow">${group.member_role}</p>
            <h3>${group.group_name}</h3>
            <p class="helper-text">${group.description || ""}</p>
          </div>
        </div>
        <div class="detail-list">
          <div class="summary-row"><span>Deadline</span><strong>${formatDate(group.deadline)}</strong></div>
          <div class="summary-row"><span>Target</span><strong>${formatCurrency(group.target_amount)}</strong></div>
          ${group.member_role === "Treasurer" ? `<div class="summary-row"><span>Group code</span><strong>${group.join_code}</strong></div>` : ""}
        </div>
        <div class="inline-actions">
          <a class="button" href="../pages/group-details.html?group_id=${group.group_id}">${group.member_role === "Treasurer" ? "Manage group" : "Open details"}</a>
        </div>
      </article>
    `).join("");
  }

  if (page === "group-details") {
    const groupId = getQueryGroupId();
    const group = groupId ? await getGroupById(groupId) : null;
    const contributions = groupId ? await getContributions(groupId) : [];
    const members = groupId ? await getMembersForGroup(groupId) : [];

    document.querySelector("[data-group-title]").textContent = group?.group_name || "Group not loaded";
    document.querySelector("[data-group-description]").textContent = group?.description || "PHP TODO: Fetch group by group_id after verifying current user is in group_members.";
    document.querySelector("[data-group-meta]").innerHTML = group
      ? `
        <div class="summary-row"><span>Target amount</span><strong>${formatCurrency(group.target_amount)}</strong></div>
        <div class="summary-row"><span>Deadline</span><strong>${formatDate(group.deadline)}</strong></div>
      `
      : `<div class="summary-row"><span>Backend source</span><strong>groups + group_members</strong></div>`;
    document.querySelector("[data-group-tools] .detail-list").innerHTML = `
      <div class="summary-row"><span>Authorization</span><strong>Server must check group_members.role before edit/copy actions.</strong></div>
      <div class="summary-row"><span>Join code</span><strong>Treasurer-only display from groups.join_code.</strong></div>
    `;
    renderEmpty(document.querySelector("[data-group-contributions]"), "No contributions loaded", "PHP TODO: Fetch contributions where contributions.group_id matches this group.");
    renderEmpty(document.querySelector("[data-group-members]"), "No members loaded", "PHP TODO: Join group_members to users and hide management actions for non-treasurers.");

    if (contributions.length || members.length) {
      // Future PHP-backed rendering can reuse this page without client-side records.
    }
  }

  if (page === "create-group" || page === "edit-group") {
    const form = document.querySelector("[data-group-form]");
    if (!form) return;

    if (page === "edit-group") {
      const group = getQueryGroupId() ? await getGroupById(getQueryGroupId()) : null;
      if (group) {
        form.group_name.value = group.group_name || "";
        form.description.value = group.description || "";
        form.target_amount.value = group.target_amount || "";
        form.deadline.value = group.deadline || "";
        form.join_code.value = group.join_code || "";
      }
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const payload = Object.fromEntries(new FormData(form).entries());
      try {
        if (page === "create-group") {
          await createGroup(payload, session?.user_id);
        } else {
          await updateGroup(getQueryGroupId(), payload);
        }
        showToast("Group saved.");
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  }

  if (page === "members") {
    const list = document.querySelector("[data-members-list]");
    renderEmpty(list, "No roster loaded", "PHP TODO: GET php/groups/members.php?group_id=active_group_id. Server must enforce treasurer/member permissions and SQL-backed filters.");
  }

  if (page === "join-group") {
    const form = document.querySelector("[data-join-form]");
    const success = document.querySelector("[data-join-success]");
    const invalid = document.querySelector("[data-join-invalid]");

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      success?.classList.add("hidden");
      invalid?.classList.add("hidden");
      const payload = Object.fromEntries(new FormData(form).entries());

      try {
        await joinGroupByCode(payload.join_code, session?.user_id);
        success?.classList.remove("hidden");
      } catch (error) {
        invalid?.classList.remove("hidden");
        invalid.querySelector("strong").textContent = error.message;
      }
    });
  }
}
