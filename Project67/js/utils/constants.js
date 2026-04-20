export const STORAGE_KEYS = {
  theme: "barkada-theme",
  session: "barkada-session",
  database: "barkada-demo-database",
  session_type: "barkada-session-type",
};

export const PAYMENT_STATUS = {
  NOT_PAID: "Not Paid",
  PENDING: "Pending",
  PAID: "Paid",
  REJECTED: "Rejected",
};

export const APP_PAGES = {
  dashboard: "Dashboard",
  "join-group": "Join Group",
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
  hybrid: [
    { page: "dashboard", label: "Dashboard", href: "../pages/dashboard.html" },
    { page: "groups", label: "Groups", href: "../pages/groups.html" },
    { page: "contributions", label: "Contributions", href: "../pages/contributions.html" },
    { page: "confirmations", label: "Confirm", href: "../pages/confirmations.html" },
    { page: "members", label: "Members", href: "../pages/members.html" },
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

export const DEMO_ACCOUNTS = [
  {
    email: "treasurer@demo.com",
    password: "Demo123!",
    label: "Treasurer Demo",
    role_label: "Treasurer-only",
    description: "Best for testing pending confirmations, group management, and summary dashboards.",
  },
  {
    email: "member@demo.com",
    password: "Demo123!",
    label: "Member Demo",
    role_label: "Member-only",
    description: "Best for testing dues, payment history, mark-as-paid, and personal QR pages.",
  },
  {
    email: "hybrid@demo.com",
    password: "Demo123!",
    label: "Hybrid Demo",
    role_label: "Treasurer + Member",
    description: "Best for testing mixed permissions across different groups and group-context switching.",
  },
];
