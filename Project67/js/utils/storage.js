const emptyDatabaseShape = {
  users: [],
  groups: [],
  group_members: [],
  contributions: [],
  payment_records: [],
};

/*
  Backend-ready state adapter.
  The previous browser-backed data store has been removed. Real data must come from
  PHP endpoints backed by barkada_db.sql tables, with PHP sessions as auth truth.
*/

export function getState() {
  return structuredClone(emptyDatabaseShape);
}

export function saveState(state) {
  // PHP TODO: Remove callers of saveState as each POST action moves to PHP.
  // This no-op intentionally prevents frontend persistence from pretending to be MySQL.
  return state;
}

export function getSession() {
  // PHP TODO: Authenticated pages should render a safe window.BARKADA_SESSION
  // object from php/auth/session.php or server-side PHP before this JS runs.
  return window.BARKADA_SESSION || null;
}

export function buildSessionForUser(user) {
  // Kept only for import stability while PHP login replaces client sessions.
  return user ? { user_id: user.user_id, name: user.name, email: user.email } : null;
}

export function saveSession(session) {
  // PHP TODO: Login should call php/auth/login.php, regenerate the PHP session,
  // and never store production auth state in browser storage.
  return session;
}

export function updateSession(patch) {
  return { ...(getSession() || {}), ...patch };
}

export function clearSession() {
  // PHP TODO: Sign-out belongs in php/auth/logout.php with session_destroy().
}
