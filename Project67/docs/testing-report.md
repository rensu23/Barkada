# Testing Report

## Environment note

This report reflects local static verification plus a lightweight HTTP smoke check from the coding environment. No live backend was connected during this test pass.

## What was checked

- root file exists: `index.html`
- all main page files exist in `pages/`
- seeded demo accounts were added
- protected-page guard logic was added
- remember-me storage logic was added for localStorage and sessionStorage
- logout cleanup logic was added
- dashboard metrics now derive from shared calculation helpers
- confirmation actions update payment records and activity logs from the same demo database source
- filter UI exists for members and contributions
- custom group-code access is the only join/access flow

## Manual/code-level verification completed

- SQL schema was read from `../barkada_db.sql`
- `where.exe node` confirmed Node is available in the environment
- required page and doc file presence check returned `REQUIRED_FILES_OK`
- HTML link reference check returned `LINK_CHECK_OK`
- JavaScript relative import check returned `IMPORT_CHECK_OK`
- local HTTP smoke check returned `HTTP_CHECK_OK 200 200` for `index.html`, `pages/login.html`, and `pages/join-group.html`
- legacy access-code UI reference check returned no matches in HTML/CSS/JS/PHP files
- frontend seed names were kept aligned with:
  - `users`
  - `groups`
  - `group_members`
  - `contributions`
  - `payment_records`
- root and page files were checked for presence
- service and storage files were reviewed after changes
- navigation and role logic were reviewed after changes

## Not fully verified here

- real browser rendering
- true console-error-free browser run
- full click-by-click responsive testing in a live viewport
- PHP endpoint behavior
- Playwright automation, because Playwright is not installed in this environment

## Recommended next local checks in browser

1. Open `http://localhost/Project67/`
2. Test all three demo accounts
3. Test `Remember me` on and off
4. Confirm one pending payment and watch dashboard totals change
5. Reject one pending payment and confirm the history/activity changes
6. Test the hybrid account and switch active group from the top header
7. Test theme persistence after refresh
8. Test logout and confirm protected pages redirect to login

## Known demo-only limitations

- password reset is simulated
- backend group-code validation is still simulated
- some frontend fields like contribution due dates and rejection notes are richer than the current SQL schema and are documented separately
