export const mockPayments = [
  { payment_id: 401, user_id: 2, contribution_id: 301, status: "Paid", marked_at: "2026-04-12T08:15:00Z", confirmed_at: "2026-04-12T11:40:00Z", confirmed_by: 1, rejection_note: "" },
  { payment_id: 402, user_id: 3, contribution_id: 301, status: "Pending", marked_at: "2026-04-19T07:20:00Z", confirmed_at: null, confirmed_by: null, rejection_note: "" },
  { payment_id: 403, user_id: 5, contribution_id: 301, status: "Not Paid", marked_at: null, confirmed_at: null, confirmed_by: null, rejection_note: "" },
  { payment_id: 404, user_id: 6, contribution_id: 301, status: "Rejected", marked_at: "2026-04-17T12:00:00Z", confirmed_at: "2026-04-17T13:10:00Z", confirmed_by: 1, rejection_note: "Please resend a clearer payment reference photo." },

  { payment_id: 405, user_id: 2, contribution_id: 302, status: "Not Paid", marked_at: null, confirmed_at: null, confirmed_by: null, rejection_note: "" },
  { payment_id: 406, user_id: 3, contribution_id: 302, status: "Paid", marked_at: "2026-04-10T06:40:00Z", confirmed_at: "2026-04-10T08:10:00Z", confirmed_by: 1, rejection_note: "" },
  { payment_id: 407, user_id: 5, contribution_id: 302, status: "Pending", marked_at: "2026-04-18T10:10:00Z", confirmed_at: null, confirmed_by: null, rejection_note: "" },
  { payment_id: 408, user_id: 6, contribution_id: 302, status: "Paid", marked_at: "2026-04-09T06:40:00Z", confirmed_at: "2026-04-09T07:40:00Z", confirmed_by: 1, rejection_note: "" },

  { payment_id: 409, user_id: 1, contribution_id: 303, status: "Paid", marked_at: "2026-04-08T09:00:00Z", confirmed_at: "2026-04-08T10:10:00Z", confirmed_by: 3, rejection_note: "" },
  { payment_id: 410, user_id: 2, contribution_id: 303, status: "Pending", marked_at: "2026-04-18T05:00:00Z", confirmed_at: null, confirmed_by: null, rejection_note: "" },
  { payment_id: 411, user_id: 5, contribution_id: 303, status: "Not Paid", marked_at: null, confirmed_at: null, confirmed_by: null, rejection_note: "" },

  { payment_id: 412, user_id: 1, contribution_id: 304, status: "Not Paid", marked_at: null, confirmed_at: null, confirmed_by: null, rejection_note: "" },
  { payment_id: 413, user_id: 2, contribution_id: 304, status: "Paid", marked_at: "2026-04-14T05:00:00Z", confirmed_at: "2026-04-14T06:30:00Z", confirmed_by: 3, rejection_note: "" },
  { payment_id: 414, user_id: 5, contribution_id: 304, status: "Pending", marked_at: "2026-04-19T12:30:00Z", confirmed_at: null, confirmed_by: null, rejection_note: "" },

  { payment_id: 415, user_id: 2, contribution_id: 305, status: "Paid", marked_at: "2026-04-05T08:15:00Z", confirmed_at: "2026-04-05T09:40:00Z", confirmed_by: 4, rejection_note: "" },
  { payment_id: 416, user_id: 3, contribution_id: 305, status: "Pending", marked_at: "2026-04-18T07:45:00Z", confirmed_at: null, confirmed_by: null, rejection_note: "" },
  { payment_id: 417, user_id: 6, contribution_id: 305, status: "Not Paid", marked_at: null, confirmed_at: null, confirmed_by: null, rejection_note: "" },

  { payment_id: 418, user_id: 2, contribution_id: 306, status: "Rejected", marked_at: "2026-04-16T08:00:00Z", confirmed_at: "2026-04-16T09:00:00Z", confirmed_by: 4, rejection_note: "Amount sent did not match the posted ambagan." },
  { payment_id: 419, user_id: 3, contribution_id: 306, status: "Not Paid", marked_at: null, confirmed_at: null, confirmed_by: null, rejection_note: "" },
  { payment_id: 420, user_id: 6, contribution_id: 306, status: "Paid", marked_at: "2026-04-13T07:00:00Z", confirmed_at: "2026-04-13T08:10:00Z", confirmed_by: 4, rejection_note: "" },
];
