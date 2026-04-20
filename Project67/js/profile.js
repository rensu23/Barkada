import { getCurrentSession } from "./services/auth.service.js";
import { getUserProfile, updateUserProfile } from "./services/user.service.js";
import { initialsFromName } from "./utils/helpers.js";
import { showToast } from "./ui.js";

export async function initProfilePage() {
  const page = document.body.dataset.appPage;
  if (page !== "profile") return;

  const session = await getCurrentSession();
  const profile = await getUserProfile(session.user_id);
  document.querySelector("[data-profile-name]").textContent = profile.name;
  document.querySelector("[data-profile-email]").textContent = profile.email;
  document.querySelector("[data-avatar]").textContent = initialsFromName(profile.name);

  const form = document.querySelector("[data-profile-form]");
  form.name.value = profile.name;
  form.email.value = profile.email;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(form).entries());
    await updateUserProfile(session.user_id, payload);
    showToast("Profile details updated in demo state.");
  });
}
