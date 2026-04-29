import { createGroup, getGroupById, getGroupsForUser, getMembersForGroup, joinGroupByCode, updateGroup } from "./services/group.service.js";
import { getCurrentSession } from "./services/auth.service.js";
import { getContributions } from "./services/contribution.service.js";
import { getSession, getState } from "./utils/storage.js";
import { formatCurrency, formatDate } from "./utils/formatters.js";
import { openDrawer, showToast } from "./ui.js";
import { buildDashboardMetrics } from "./utils/calculations.js";
import { canManageActiveGroup, canManageGroup } from "./utils/roles.js";

function getQueryGroupId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("group_id") || "101";
}

export async function initGroupsPage() {
  const page = document.body.dataset.appPage;
  const localSession = getSession();
  const session = localSession ? await getCurrentSession() : null;

  if (page === "groups") {
    const groups = await getGroupsForUser(session.user_id);
    const metrics = buildDashboardMetrics(getState(), session.user_id);
    const list = document.querySelector("[data-groups-list]");
    const empty = document.querySelector("[data-groups-empty]");
    const today = new Date("2026-04-29T00:00:00");

    function getUrgency(group) {
      const deadline = group.deadline ? new Date(`${group.deadline}T00:00:00`) : null;
      if (!deadline) return { label: "Flexible", className: "status-unpaid" };
      const daysLeft = Math.ceil((deadline - today) / 86400000);
      if (daysLeft < 0) return { label: "Behind schedule", className: "status-rejected" };
      if (daysLeft <= 7) return { label: "Due soon", className: "status-pending" };
      return { label: "On track", className: "status-paid" };
    }

    empty.classList.toggle("hidden", groups.length > 0);
    list.innerHTML = groups
      .map((group) => {
        const progress = metrics.groupProgress.find((item) => item.group_id === group.group_id);
        const urgency = getUrgency(group);
        const canManage = group.member_role === "Treasurer";
        return `
        <article class="card group-card">
          <div class="page-header">
            <div class="page-header-copy">
              <p class="eyebrow">${group.member_role}</p>
              <h3>${group.group_name}</h3>
              <p class="helper-text">${group.description}</p>
            </div>
            <span class="status-chip ${urgency.className}">${urgency.label}</span>
          </div>
          <div class="progress-track space-top"><div class="progress-fill" style="--value:${progress?.completion || 0}%"></div></div>
          <div class="detail-list">
            <div class="summary-row"><span>Deadline</span><strong>${formatDate(group.deadline)}</strong></div>
            <div class="summary-row"><span>Progress</span><strong>${formatCurrency(progress?.collected || 0)} / ${formatCurrency(group.target_amount)}</strong></div>
            <div class="summary-row"><span>Group code</span><strong>${group.join_code}</strong></div>
          </div>
          <div class="inline-actions">
            <a class="button" href="../pages/group-details.html?group_id=${group.group_id}">${canManage ? "Manage group" : "Open details"}</a>
            ${canManage ? `<button class="button-ghost" type="button" data-copy-code="${group.join_code}">Copy code</button>` : `<a class="button-ghost" href="../pages/contributions.html">View dues</a>`}
          </div>
        </article>
      `;
      })
      .join("");

    list.querySelectorAll("[data-copy-code]").forEach((button) => {
      button.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(button.dataset.copyCode);
          showToast(`Group code ${button.dataset.copyCode} copied.`);
        } catch {
          showToast(`Group code: ${button.dataset.copyCode}`);
        }
      });
    });
  }

  if (page === "group-details") {
    const groupId = getQueryGroupId();
    const group = await getGroupById(groupId);
    const contributions = await getContributions(groupId);
    const members = await getMembersForGroup(groupId);
    const isTreasurerForGroup = canManageGroup(getState(), session, groupId);
    const editLink = document.querySelector("[data-group-edit-link]");
    const copyButton = document.querySelector("[data-copy-group-code]");
    if (isTreasurerForGroup) {
      editLink?.setAttribute("href", `./edit-group.html?group_id=${groupId}`);
    } else {
      editLink?.remove();
      copyButton?.remove();
    }
    copyButton?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(group.join_code);
        showToast(`Group code ${group.join_code} copied.`);
      } catch {
        showToast(`Group code: ${group.join_code}`);
      }
    });
    document.querySelector("[data-group-title]").textContent = group.group_name;
    document.querySelector("[data-group-description]").textContent = group.description;
    document.querySelector("[data-group-meta]").innerHTML = `
      <div class="summary-row"><span>Target amount</span><strong>${formatCurrency(group.target_amount)}</strong></div>
      <div class="summary-row"><span>Deadline</span><strong>${formatDate(group.deadline)}</strong></div>
      ${isTreasurerForGroup ? `<div class="summary-row"><span>Join code</span><strong>${group.join_code}</strong></div>` : ""}
    `;
    document.querySelector("[data-group-tools] .detail-list").innerHTML = isTreasurerForGroup
      ? `
        <div class="summary-row"><span>Join code</span><strong>${group.join_code}</strong></div>
        <div class="summary-row"><span>Share guidance</span><strong>Send this code to members who need to join.</strong></div>
        <div class="summary-row"><span>Backend check</span><strong>Validate through groups.join_code.</strong></div>
      `
      : `
        <div class="summary-row"><span>Your role</span><strong>Member</strong></div>
        <div class="summary-row"><span>Next step</span><strong>Review dues on the contributions page.</strong></div>
      `;
    document.querySelector("[data-group-contributions]").innerHTML = contributions
      .map((item) => `<div class="contribution-row"><div><strong>${item.title}</strong><p class="helper-text">${item.frequency} - ${item.type}</p></div><strong>${formatCurrency(item.amount)}</strong></div>`)
      .join("");
    document.querySelector("[data-group-members]").innerHTML = members
      .map((member) => `<div class="member-row"><div><strong>${member.user.name}</strong><p class="helper-text">Paid ${member.payment_summary.Paid} - Pending ${member.payment_summary.Pending}</p></div><span class="status-chip status-unpaid">${member.role}</span></div>`)
      .join("");
  }

  if (page === "create-group" || page === "edit-group") {
    const form = document.querySelector("[data-group-form]");
    if (!form) return;

    if (page === "edit-group") {
      if (!canManageGroup(getState(), session, getQueryGroupId())) {
        window.location.replace("./dashboard.html");
        return;
      }
      const group = await getGroupById(getQueryGroupId());
      form.group_name.value = group.group_name;
      form.description.value = group.description;
      form.target_amount.value = group.target_amount;
      form.deadline.value = group.deadline;
      form.join_code.value = group.join_code;
      form.accent_color.value = group.accent_color;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submitButton = form.querySelector("button[type='submit']");
      submitButton.disabled = true;
      submitButton.textContent = page === "create-group" ? "Creating group..." : "Saving changes...";
      const payload = Object.fromEntries(new FormData(form).entries());

      if (page === "create-group") {
        await createGroup(payload, session.user_id);
        showToast("Group created. The custom group code is ready for sharing.");
        form.reset();
      } else {
        await updateGroup(getQueryGroupId(), payload);
        showToast("Group details updated.");
      }

      submitButton.disabled = false;
      submitButton.textContent = page === "create-group" ? "Create group" : "Save changes";
    });
  }

  if (page === "members") {
    if (!canManageActiveGroup(getState(), session)) {
      window.location.replace("./dashboard.html");
      return;
    }
    const groupId = session?.active_group_id || "101";
    const members = await getMembersForGroup(groupId);
    const list = document.querySelector("[data-members-list]");
    const search = document.querySelector("[data-members-search]");
    const roleFilter = document.querySelector("[data-members-role-filter]");
    const statusFilter = document.querySelector("[data-members-status-filter]");

    const renderMembers = () => {
      const term = search?.value || "";
      const roleValue = roleFilter?.value || "";
      const statusValue = statusFilter?.value || "";
      const filtered = members.filter((member) => {
        const matchesName = member.user.name.toLowerCase().includes(term.toLowerCase());
        const matchesRole = !roleValue || roleValue === "All" || member.role === roleValue;
        const matchesStatus =
          !statusValue ||
          statusValue === "All" ||
          member.payment_summary[statusValue] > 0;
        return matchesName && matchesRole && matchesStatus;
      });
      list.innerHTML = filtered
        .map(
          (member) => `
          <article class="member-list-row">
            <div class="page-header-copy">
              <strong>${member.user.name}</strong>
              <p class="helper-text">${member.user.email}</p>
              <p class="helper-text">Joined ${formatDate(member.joined_at)}</p>
            </div>
            <div class="member-status-grid" aria-label="Payment summary for ${member.user.name}">
              <div class="mini-stat"><span>Paid</span><strong>${member.payment_summary.Paid}</strong></div>
              <div class="mini-stat"><span>Pending</span><strong>${member.payment_summary.Pending}</strong></div>
              <div class="mini-stat"><span>Open</span><strong>${member.payment_summary["Not Paid"] + member.payment_summary.Rejected}</strong></div>
            </div>
            <div class="inline-actions">
              <span class="status-chip status-unpaid">${member.role}</span>
              <button class="button-ghost" type="button" data-member-drawer="${member.member_id}">View</button>
            </div>
          </article>
        `,
        )
        .join("");
      if (!filtered.length) {
        list.innerHTML = `<article class="empty-card"><h3>No members match</h3><p class="helper-text">Try a different name, role, or payment status filter.</p></article>`;
      }

      list.querySelectorAll("[data-member-drawer]").forEach((button) => {
        button.addEventListener("click", () => {
          const member = filtered.find((item) => Number(item.member_id) === Number(button.dataset.memberDrawer));
          openDrawer(`
            <div class="stack">
              <div class="page-header">
                <div class="page-header-copy">
                  <p class="eyebrow">Member details</p>
                  <h3>${member.user.name}</h3>
                  <p class="helper-text">${member.user.email}</p>
                </div>
              </div>
              <div class="summary-row"><span>Role</span><strong>${member.role}</strong></div>
              <div class="summary-row"><span>Joined at</span><strong>${formatDate(member.joined_at)}</strong></div>
              <div class="summary-row"><span>Paid</span><strong>${member.payment_summary.Paid}</strong></div>
              <div class="summary-row"><span>Pending</span><strong>${member.payment_summary.Pending}</strong></div>
              <div class="summary-row"><span>Not Paid</span><strong>${member.payment_summary["Not Paid"]}</strong></div>
            </div>
          `);
        });
      });
    };

    renderMembers();
    search?.addEventListener("input", renderMembers);
    roleFilter?.addEventListener("change", renderMembers);
    statusFilter?.addEventListener("change", renderMembers);
  }

  if (page === "join-group") {
    const form = document.querySelector("[data-join-form]");
    const success = document.querySelector("[data-join-success]");
    const invalid = document.querySelector("[data-join-invalid]");

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      success.classList.add("hidden");
      invalid.classList.add("hidden");
      const payload = Object.fromEntries(new FormData(form).entries());

      try {
        const group = await joinGroupByCode(payload.code, session?.user_id);
        success.classList.remove("hidden");
        success.querySelector("strong").textContent = group.preview_only
          ? `${group.group_name} is a valid group code`
          : `You joined ${group.group_name}`;
        showToast(group.preview_only ? "Code accepted. Log in to complete the join." : "Group joined in demo mode.");
      } catch (error) {
        invalid.classList.remove("hidden");
        invalid.querySelector("strong").textContent = error.message;
      }
    });
  }
}
