export const STORAGE_KEYS = {
  theme: "barkada-theme",
  session: "barkada-session",
  database: "barkada-demo-database",
};

export const PAYMENT_STATUS = {
  NOT_PAID: "Not Paid",
  PENDING: "Pending",
  PAID: "Paid",
  REJECTED: "Rejected",
};

export const APP_PAGES = {
  dashboard: "Dashboard",
  groups: "Groups",
  "group-details": "Group Details",
  "create-group": "Create Group",
  "edit-group": "Edit Group",
  contributions: "Contributions",
  "recurring-cycle": "Recurring Cycles",
  confirmations: "Confirmations",
  history: "History",
  members: "Members",
  "group-qr": "Group QR",
  "member-qr": "My QR",
  "scan-qr": "Scan QR",
  profile: "Profile",
  settings: "Settings",
};

export const NAV_ITEMS = {
  treasurer: [
    { page: "dashboard", label: "Dashboard", href: "../pages/dashboard.html" },
    { page: "groups", label: "Groups", href: "../pages/groups.html" },
    { page: "contributions", label: "Contributions", href: "../pages/contributions.html" },
    { page: "confirmations", label: "Confirm", href: "../pages/confirmations.html" },
    { page: "members", label: "Members", href: "../pages/members.html" },
    { page: "history", label: "History", href: "../pages/history.html" },
    { page: "settings", label: "Settings", href: "../pages/settings.html" },
  ],
  member: [
    { page: "dashboard", label: "Dashboard", href: "../pages/dashboard.html" },
    { page: "groups", label: "Groups", href: "../pages/groups.html" },
    { page: "contributions", label: "Dues", href: "../pages/contributions.html" },
    { page: "history", label: "History", href: "../pages/history.html" },
    { page: "member-qr", label: "My QR", href: "../pages/member-qr.html" },
    { page: "settings", label: "Settings", href: "../pages/settings.html" },
  ],
};

export const QUICK_LINKS = [
  { label: "Login", href: "./pages/login.html" },
  { label: "Sign Up", href: "./pages/signup.html" },
  { label: "Join Group", href: "./pages/join-group.html" },
];
