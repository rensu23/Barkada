import { getGroupQrData, getMemberQrData, scanQrInput } from "./services/qr.service.js";
import { showToast } from "./ui.js";
import { getSession } from "./utils/storage.js";

export async function initQrPage() {
  const page = document.body.dataset.appPage;
  const session = getSession();

  if (page === "group-qr") {
    const data = await getGroupQrData(session?.active_group_id || 101);
    document.querySelector("[data-qr-title]").textContent = data.title;
    document.querySelector("[data-qr-code]").textContent = data.code;
    document.querySelector("[data-qr-hint]").textContent = data.hint;
    document.querySelector("[data-qr-link]").textContent = data.invite_link;
  }

  if (page === "member-qr") {
    const data = await getMemberQrData();
    document.querySelector("[data-qr-title]").textContent = data.title;
    document.querySelector("[data-qr-code]").textContent = data.code;
    document.querySelector("[data-qr-hint]").textContent = data.hint;
  }

  if (page === "scan-qr" || page === "join-group") {
    const form = document.querySelector("[data-code-form]");
    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const code = new FormData(form).get("code");
      const result = await scanQrInput(code);
      if (result.ok) {
        const message = result.kind === "group"
          ? `${result.label} matched a valid group code.`
          : `${result.label} matched a member QR code.`;
        document.querySelector("[data-scan-result]")?.classList.remove("hidden");
        const resultBox = document.querySelector("[data-scan-result]");
        if (resultBox) {
          resultBox.innerHTML = `<strong>${message}</strong><p class="helper-text">Scanned code: ${result.code}</p>`;
        }
        showToast(message);
      } else {
        document.querySelector("[data-scan-result]")?.classList.add("hidden");
        showToast(code ? "That demo code did not match any group or member QR." : "Please enter a code first.", "error");
      }
    });
  }
}
