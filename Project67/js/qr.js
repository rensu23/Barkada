import { getGroupQrData, getMemberQrData, scanQrInput } from "./services/qr.service.js";
import { showToast } from "./ui.js";

export async function initQrPage() {
  const page = document.body.dataset.appPage;

  if (page === "group-qr") {
    const data = await getGroupQrData(101);
    document.querySelector("[data-qr-title]").textContent = data.title;
    document.querySelector("[data-qr-code]").textContent = data.code;
    document.querySelector("[data-qr-hint]").textContent = data.hint;
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
        showToast(`Code ${result.code} is ready for backend validation.`);
      } else {
        showToast("Please enter a code first.", "error");
      }
    });
  }
}
