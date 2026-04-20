export const mockPayments = [
  { payment_id: 401, user_id: 2, contribution_id: 301, status: "Paid", marked_at: "2026-04-12T08:15:00Z", confirmed_at: "2026-04-12T11:40:00Z", confirmed_by: 1, rejection_note: "" },
  { payment_id: 402, user_id: 3, contribution_id: 301, status: "Pending", marked_at: "2026-04-19T07:20:00Z", confirmed_at: null, confirmed_by: null, rejection_note: "" },
  { payment_id: 403, user_id: 4, contribution_id: 301, status: "Not Paid", marked_at: null, confirmed_at: null, confirmed_by: null, rejection_note: "" },
  { payment_id: 404, user_id: 1, contribution_id: 303, status: "Paid", marked_at: "2026-04-09T09:00:00Z", confirmed_at: "2026-04-09T10:10:00Z", confirmed_by: 2, rejection_note: "" },
  { payment_id: 405, user_id: 3, contribution_id: 303, status: "Rejected", marked_at: "2026-04-11T05:00:00Z", confirmed_at: "2026-04-11T06:00:00Z", confirmed_by: 2, rejection_note: "Photo was blurry. Please send a clearer reference." },
  { payment_id: 406, user_id: 4, contribution_id: 304, status: "Pending", marked_at: "2026-04-18T12:30:00Z", confirmed_at: null, confirmed_by: null, rejection_note: "" },
];
