/*
  Thin API adapter for the PHP/MySQL migration.
  Keep this file free of sample records and local persistence.
*/

export function backendNotReady(endpoint) {
  return new Error(`${endpoint} is ready to connect, but the PHP/MySQL implementation is not wired yet.`);
}

export async function fetchJson(endpoint, options = {}) {
  // PHP TODO: Use this wrapper once endpoints return JSON with consistent errors.
  const response = await fetch(endpoint, {
    credentials: "same-origin",
    headers: { Accept: "application/json", ...(options.headers || {}) },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed with HTTP ${response.status}.`);
  }

  return response.json();
}
