import { createGroup, getGroupById, getGroupsForUser, getMembersForGroup, joinGroupByCode, updateGroup } from "./services/group.service.js";
import { getCurrentSession } from "./services/auth.service.js";
import { getContributions } from "./services/contribution.service.js";
import { formatCurrency, formatDate } from "./utils/formatters.js";
import { openDrawer, showToast } from "./ui.js";

function getQueryGroupId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("group_id") || "101";
}

export async function initGroupsPage() {
  const page = document.body.dataset.appPage;
  const session = await getCurrentSession();

  if (page === "groups") {
    const groups = await getGroupsForUser(session.user_id);
    const list = document.querySelector("[data-groups-list]");
    const empty = document.querySelector("[data-groups-empty]");

    empty.classList.toggle("hidden", groups.length > 0);
    list.innerHTML = groups
      .map(
        (group) => `
        <article class="card">
          <div class="page-header">
            <div class="page-header-copy">
              <p class="eyebrow">${group.member_role}</p>
              <h3>${group.group_name}</h3>
              <p class="helper-text">${group.description}</p>
            </div>
            <span class="status-chip status-paid">${formatCurrency(group.target_amount)}</span>
          </div>
          <div class="detail-list">
            <div class="summary-row"><span>Deadline</span><strong>${formatDate(group.deadline)}</strong></div>
            <div class="summary-row"><span>Join code</span><strong>${group.join_code}</strong></div>
          </div>
          <div class="inline-actions">
            <a class="button" href="../pages/group-details.html?group_id=${group.group_id}">Open details</a>
          </div>
        </article>
      `,
      )
      .join("");
  }

  if (page === "group-details") {
    const groupId = getQueryGroupId();
    const group = await getGroupById(groupId);
    const contributions = await getContributions(groupId);
    const members = await getMembersForGroup(groupId);
    document.querySelector("[data-group-title]").textContent = group.group_name;
    document.querySelector("[data-group-description]").textContent = group.description;
    document.querySelector("[data-group-meta]").innerHTML = `
      <div class="summary-row"><span>Target amount</span><strong>${formatCurrency(group.target_amount)}</strong></div>
      <div class="summary-row"><span>Deadline</span><strong>${formatDate(group.deadline)}</strong></div>
      <div class="summary-row"><span>Join code</span><strong>${group.join_code}</strong></div>
    `;
    document.querySelector("[data-group-contributions]").innerHTML = contributions
      .map((item) => `<div class="contribution-row"><span>${item.title}</span><strong>${formatCurrency(item.amount)}</strong></div>`)
      .join("");
    document.querySelector("[data-group-members]").innerHTML = members
      .map((member) => `<div class="member-row"><span>${member.user.name}</span><span class="status-chip status-unpaid">${member.role}</span></div>`)
      .join("");
  }

  if (page === "create-group" || page === "edit-group") {
    const form = document.querySelector("[data-group-form]");
    if (!form) return;

    if (page === "edit-group") {
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
        showToast("Group created. The join link and QR card below are ready for sharing.");
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
    const members = await getMembersForGroup("101");
    const list = document.querySelector("[data-members-list]");
    const search = document.querySelector("[data-members-search]");

    const renderMembers = (term = "") => {
      const filtered = members.filter((member) => member.user.name.toLowerCase().includes(term.toLowerCase()));
      list.innerHTML = filtered
        .map(
          (member) => `
          <article class="card member-row">
            <div>
              <strong>${member.user.name}</strong>
              <p class="helper-text">${member.user.email}</p>
              <p class="helper-text">Joined ${formatDate(member.joined_at)}</p>
            </div>
            <div class="header-actions">
              <span class="status-chip status-unpaid">${member.role}</span>
              <button class="button-ghost" type="button" data-member-drawer="${member.member_id}">View</button>
            </div>
          </article>
        `,
        )
        .join("");

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
              <div class="summary-row"><span>Frontend note</span><strong>Hook payment summary here once the backend aggregates per member.</strong></div>
            </div>
          `);
        });
      });
    };

    renderMembers();
    search?.addEventListener("input", () => renderMembers(search.value));
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
        const group = await joinGroupByCode(payload.code, session.user_id);
        success.classList.remove("hidden");
        success.querySelector("strong").textContent = `You joined ${group.group_name}`;
        showToast("Group joined in demo mode.");
      } catch (error) {
        invalid.classList.remove("hidden");
        invalid.querySelector("strong").textContent = error.message;
      }
    });
  }
}
