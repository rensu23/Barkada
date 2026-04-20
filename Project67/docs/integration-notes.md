# Barkada Integration Notes

## Frontend to PHP flow

- `js/services/*.service.js` currently use localStorage-backed mock data plus Promise delays.
- Later, each service can swap `fakeRequest()` for `fetch()` calls to matching PHP files inside `/php`.
- The UI already uses schema-aligned field names like `group_id`, `contribution_id`, and `payment_id`.

## Suggested migration order

1. Connect authentication endpoints first.
2. Replace group list/detail/create/update services.
3. Replace contribution and payment services.
4. Add recurring cycle support after deciding on schema strategy.

## Session guidance

- Keep PHP session state simple at first.
- Return safe user information only.
- Store the active user in session after login.

## Known frontend-only parts for now

- Password reset token verification
- Detailed recurring cycle rows
- Rejection note persistence if not added to schema
- Real QR generation and camera scanning
- Activity log history
