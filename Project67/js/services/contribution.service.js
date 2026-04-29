import { backendNotReady } from "./api.service.js";

export async function getContributions(filterGroupId = "") {
  // PHP TODO: GET php/contributions/list.php with optional group_id/status/type/sort.
  // Join contributions to groups and payment_records only after authorization.
  return [];
}

export async function createContribution(payload) {
  // PHP TODO: POST to php/contributions/create.php.
  // Validate group_id, title, amount, type, frequency; authorize treasurer role.
  // Current schema has no due_date or notes column, so store only schema fields
  // unless the schema is intentionally extended later.
  throw backendNotReady("php/contributions/create.php");
}

export async function getContributionHistory(userId) {
  // PHP TODO: GET php/payments/history.php.
  // Members should receive only their own payment_records; treasurers may filter by group.
  return [];
}

export async function getRecurringCycles(userId) {
  // Schema note: contributions.frequency exists, but no separate cycle rows exist.
  return [];
}
