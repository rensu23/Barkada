import { logoutUser } from "./services/auth.service.js";
import { resetDemoState } from "./utils/storage.js";
import { showToast } from "./ui.js";

export function initSettingsPage() {
  if (document.body.dataset.appPage !== "settings") return;

  document.querySelector("[data-reset-demo]")?.addEventListener("click", () => {
    resetDemoState();
    showToast("Demo data reset. Refreshing the app now.");
    window.setTimeout(() => window.location.reload(), 500);
  });

  document.querySelector("[data-logout]")?.addEventListener("click", async () => {
    await logoutUser();
    window.location.href = "../pages/login.html";
  });
}
