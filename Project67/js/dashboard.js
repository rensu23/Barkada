const members = [
  {name: "Oliver", status: "paid"},
  {name: "Renz", status: "pending"},
  {name: "Tom", status: "paid"},
  {name: "Bien", status: "notpaid"},
  {name: "James", status: "paid"}
];

// format badge text
function formatStatus(status) {
  if (status === "paid") return "✔ Paid";
  if (status === "pending") return "⏳ Pending";
  return "❌ Not Paid";
}

// render members
function renderMembers(list) {
  const container = document.getElementById("memberList");
  container.innerHTML = "";

  list.forEach(m => {
    const row = document.createElement("div");
    row.className = "member-row";

    row.innerHTML = `
      <div class="member">
        <div class="left">
          <div class="avatar">${m.name[0]}</div>
          <p>${m.name}</p>
        </div>
        <span class="badge ${m.status}">
          ${formatStatus(m.status)}
        </span>
      </div>
    `;

    container.appendChild(row);
  });
}

// filter
function filterMembers(status) {
  if (status === "all") {
    renderMembers(members);
  } else {
    const filtered = members.filter(m => m.status === status);
    renderMembers(filtered);
  }
}

// progress
function updateProgress() {
  const total = members.length;
  const paid = members.filter(m => m.status === "paid").length;

  const percent = Math.round((paid / total) * 100);

  document.querySelector(".progress").style.width = percent + "%";
  document.getElementById("progressText").innerText = percent + "%";
}

// HEADER BUTTON FUNCTIONS
function editProfile() {
  alert("Edit Profile (Coming Soon)");
}

function showAvatar() {
  alert("Display Avatar (Coming Soon)");
}

function showAchievements() {
  alert("Achievements (Coming Soon)");
}

function showHistory() {
  alert("Progress History (Coming Soon)");
}

// load
renderMembers(members);
updateProgress();