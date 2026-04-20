import { APP_PAGES, NAV_ITEMS, QUICK_LINKS } from "./utils/constants.js";
import { getSession, saveSession } from "./utils/storage.js";
import { initialsFromName } from "./utils/helpers.js";

function publicHeaderTemplate() {
  const isPageFolder = window.location.pathname.includes("/pages/");
  const homeHref = isPageFolder ? "../index.html" : "./index.html";
  const loginHref = isPageFolder ? "./login.html" : "./pages/login.html";
  const signupHref = isPageFolder ? "./signup.html" : "./pages/signup.html";
  const joinHref = isPageFolder ? "./join-group.html" : "./pages/join-group.html";

  return `
    <div class="brand">
      <span class="brand-mark">B</span>
      <span>Barkada</span>
    </div>
    <nav class="public-nav">
      <a href="${homeHref}">Home</a>
      <a href="${loginHref}">Login</a>
      <a href="${signupHref}">Sign up</a>
      <a href="${joinHref}">Join group</a>
    </nav>
    <div class="header-actions">
      <button class="button-ghost" type="button" data-theme-toggle>
        <span data-theme-label>Dark mode</span>
      </button>
    </div>
  `;
}

function appSidebarTemplate(role, currentPage, session) {
  const links = NAV_ITEMS[role] || NAV_ITEMS.member;
  return `
    <a class="brand" href="../pages/dashboard.html">
      <span class="brand-mark">B</span>
      <span>Barkada</span>
    </a>
    <div class="spotlight-card">
      <p class="eyebrow">${role === "treasurer" ? "Treasurer view" : "Member view"}</p>
      <h3>${session.name}</h3>
      <p class="helper-text">Switch the demo role in settings to preview both user experiences.</p>
    </div>
    <nav class="surface-list">
      ${links
        .map(
          (item) => `
          <a class="${item.page === currentPage ? "tab is-active" : "tab"}" href="${item.href}">
            ${item.label}
          </a>
        `,
        )
        .join("")}
    </nav>
    <div class="card">
      <p class="eyebrow">Quick links</p>
      <div class="surface-list">
        <a href="../pages/group-qr.html">Group QR</a>
        <a href="../pages/member-qr.html">Member QR</a>
        <a href="../pages/scan-qr.html">Scan QR</a>
      </div>
    </div>
  `;
}

function appTopbarTemplate(currentPage, session) {
  return `
    <div>
      <p class="app-kicker">Group Contribution Tracker</p>
      <h2>${APP_PAGES[currentPage] || "Barkada"}</h2>
    </div>
    <div class="header-actions">
      <button class="button-ghost mobile-only" type="button" data-open-drawer-nav>Menu</button>
      <button class="button-ghost" type="button" data-theme-toggle>
        <span data-theme-label>Dark mode</span>
      </button>
      <a class="button-secondary" href="../pages/profile.html">
        <span>${initialsFromName(session.name)}</span>
        <span>${session.name.split(" ")[0]}</span>
      </a>
    </div>
  `;
}

function bottomNavTemplate(role, currentPage) {
  const links = (NAV_ITEMS[role] || NAV_ITEMS.member).slice(0, 4);
  return links
    .map(
      (item) => `
        <a class="${item.page === currentPage ? "tab is-active" : "tab"}" href="${item.href}">
          ${item.label}
        </a>
      `,
    )
    .join("");
}

export function initPublicNavigation() {
  const header = document.querySelector("[data-public-header]");
  if (header) {
    header.classList.add("public-header", "container");
    header.innerHTML = publicHeaderTemplate();
  }
}

export function initAppNavigation() {
  const shell = document.body.dataset.appPage;
  if (!shell) return;

  const session = getSession();
  const role = session.role_view || "member";
  const sidebar = document.querySelector("[data-sidebar]");
  const topbar = document.querySelector("[data-topbar]");
  const bottomNav = document.querySelector("[data-bottom-nav]");

  if (sidebar) sidebar.innerHTML = appSidebarTemplate(role, shell, session);
  if (topbar) topbar.innerHTML = appTopbarTemplate(shell, session);
  if (bottomNav) bottomNav.innerHTML = bottomNavTemplate(role, shell);
}

export function initRoleSwitcher() {
  const field = document.querySelector("[data-role-switch]");
  if (!field) return;
  const session = getSession();
  field.value = session.role_view || "treasurer";
  field.addEventListener("change", () => {
    session.role_view = field.value;
    saveSession(session);
    window.location.reload();
  });
}

export function initLandingLinks() {
  const target = document.querySelector("[data-quick-links]");
  if (!target) return;
  target.innerHTML = QUICK_LINKS.map((link) => `<a class="button-secondary" href="${link.href}">${link.label}</a>`).join("");
}
