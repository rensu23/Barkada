import { backendNotReady } from "./api.service.js";

export async function getPendingPayments(groupId = null) {
  // PHP TODO: GET pending payment_records joined to contributions/groups/users.
  // Server must confirm the session user is treasurer for the requested group.
  return [];
}

export async function markPaymentAsDone(paymentId) {
  // PHP TODO: POST to php/payments/mark-paid.php.
  // User may update only their own payment_records row after membership checks.
  throw backendNotReady("php/payments/mark-paid.php");
}

export async function confirmPayment(paymentId, confirmedBy) {
  // PHP TODO: POST to php/payments/confirm.php.
  // Treasurer-only; reject missing, unauthorized, already-confirmed records.
  throw backendNotReady("php/payments/confirm.php");
}

export async function rejectPayment(paymentId, confirmedBy, note) {
  // PHP TODO: POST to php/payments/reject.php.
  // Current schema has no rejection_note column; store status only or extend schema intentionally.
  throw backendNotReady("php/payments/reject.php");
}
