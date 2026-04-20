import { loginUser, registerUser, requestPasswordReset, resetPassword } from "./services/auth.service.js";
import { DEMO_ACCOUNTS } from "./utils/constants.js";
import { getSession } from "./utils/storage.js";
import { hasStrongEnoughPassword, isRequired, isValidEmail, passwordsMatch } from "./validators.js";
import { showToast } from "./ui.js";

function showFieldError(form, name, message = "") {
  const target = form.querySelector(`[data-error-for="${name}"]`);
  if (target) target.textContent = message;
}

function clearErrors(form) {
  form.querySelectorAll("[data-error-for]").forEach((item) => {
    item.textContent = "";
  });
}

function bindPasswordToggles() {
  document.querySelectorAll("[data-password-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.passwordToggle);
      const isPassword = target.type === "password";
      target.type = isPassword ? "text" : "password";
      button.textContent = isPassword ? "Hide" : "Show";
    });
  });
}

export function initRouteGuards() {
  const appPage = document.body.dataset.appPage;
  const publicPage = document.body.dataset.page;
  const session = getSession();

  if (appPage && !["join-group"].includes(appPage) && !session) {
    window.location.href = "../pages/login.html?redirect=" + encodeURIComponent(window.location.pathname);
    return false;
  }

  if (session && ["login", "signup"].includes(publicPage || "")) {
    window.location.href = "../pages/dashboard.html";
    return false;
  }

  return true;
}

export function initAuthPages() {
  bindPasswordToggles();
  const page = document.body.dataset.page;
  const demoWrap = document.querySelector("[data-demo-accounts]");

  if (demoWrap) {
    demoWrap.innerHTML = DEMO_ACCOUNTS.map((account) => `
      <article class="mobile-list-item">
        <strong>${account.label}</strong>
        <p class="helper-text">${account.description}</p>
        <button class="button-secondary button-block space-top" type="button" data-demo-fill="${account.email}">Use ${account.role_label}</button>
      </article>
    `).join("");
  }

  if (page === "login") {
    const form = document.querySelector("[data-login-form]");
    document.querySelectorAll("[data-demo-fill]").forEach((button) => {
      button.addEventListener("click", () => {
        const account = DEMO_ACCOUNTS.find((item) => item.email === button.dataset.demoFill);
        form.email.value = account.email;
        form.password.value = account.password;
        form.remember_me.checked = true;
      });
    });
    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearErrors(form);
      const payload = Object.fromEntries(new FormData(form).entries());
      let valid = true;

      if (!isValidEmail(payload.email)) {
        showFieldError(form, "email", "Enter a valid email address.");
        valid = false;
      }
      if (!isRequired(payload.password)) {
        showFieldError(form, "password", "Enter your password.");
        valid = false;
      }
      if (!valid) return;

      const button = form.querySelector("button[type='submit']");
      button.disabled = true;
      button.textContent = "Logging in...";
      try {
        await loginUser(payload);
        showToast("Welcome back. Redirecting to your dashboard.");
        window.setTimeout(() => {
          const redirect = new URLSearchParams(window.location.search).get("redirect");
          window.location.href = redirect || "../pages/dashboard.html";
        }, 420);
      } catch (error) {
        showFieldError(form, "password", error.message);
      } finally {
        button.disabled = false;
        button.textContent = "Log in";
      }
    });
  }

  if (page === "signup") {
    const form = document.querySelector("[data-signup-form]");
    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearErrors(form);
      const payload = Object.fromEntries(new FormData(form).entries());
      let valid = true;

      if (!isRequired(payload.name)) {
        showFieldError(form, "name", "Please enter your full name.");
        valid = false;
      }
      if (!isValidEmail(payload.email)) {
        showFieldError(form, "email", "Enter a valid email address.");
        valid = false;
      }
      if (!hasStrongEnoughPassword(payload.password)) {
        showFieldError(form, "password", "Use at least 8 characters.");
        valid = false;
      }
      if (!passwordsMatch(payload.password, payload.confirm_password)) {
        showFieldError(form, "confirm_password", "Passwords do not match.");
        valid = false;
      }
      if (!valid) return;

      const button = form.querySelector("button[type='submit']");
      button.disabled = true;
      button.textContent = "Creating account...";
      try {
        await registerUser(payload);
        showToast("Account created. You can now log in with your new demo account.");
        window.setTimeout(() => {
          window.location.href = "../pages/login.html";
        }, 420);
      } catch (error) {
        showFieldError(form, "email", error.message);
      } finally {
        button.disabled = false;
        button.textContent = "Create account";
      }
    });
  }

  if (page === "forgot-password") {
    const form = document.querySelector("[data-forgot-form]");
    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearErrors(form);
      const payload = Object.fromEntries(new FormData(form).entries());
      if (!isValidEmail(payload.email)) {
        showFieldError(form, "email", "Enter a valid email address.");
        return;
      }
      const result = await requestPasswordReset(payload);
      document.querySelector("[data-auth-feedback]").textContent = result.message;
      document.querySelector("[data-auth-feedback]").className = "success-text";
    });
  }

  if (page === "reset-password") {
    const form = document.querySelector("[data-reset-form]");
    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearErrors(form);
      const payload = Object.fromEntries(new FormData(form).entries());
      let valid = true;
      if (!isValidEmail(payload.email)) {
        showFieldError(form, "email", "Enter the email tied to your account.");
        valid = false;
      }
      if (!hasStrongEnoughPassword(payload.password)) {
        showFieldError(form, "password", "Use at least 8 characters.");
        valid = false;
      }
      if (!passwordsMatch(payload.password, payload.confirm_password)) {
        showFieldError(form, "confirm_password", "Passwords do not match.");
        valid = false;
      }
      if (!valid) return;

      await resetPassword(payload);
      showToast("Password updated in demo mode.");
      window.setTimeout(() => {
        window.location.href = "../pages/login.html";
      }, 380);
    });
  }
}
