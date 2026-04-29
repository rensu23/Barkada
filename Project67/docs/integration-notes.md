# Integration Notes

## Root entry

- Open the demo from `index.html` in the project root.
- Recommended local server path with XAMPP: `http://localhost/Project67/`
- Do not begin testing by opening nested pages directly first.

## Current demo architecture

- `js/data/`
  - seeded demo content aligned to the existing SQL schema
- `js/services/`
  - async mock service layer
- `js/utils/storage.js`
  - demo database storage plus session storage handling
- `js/utils/calculations.js`
  - shared summary and graph calculations

## What is stored right now

- `localStorage`
  - `barkada-demo-database`
    - the full demo database snapshot
  - `barkada-session`
    - the remembered session when "Remember me" is checked
  - `barkada-session-type`
    - whether the active session is local or session based
  - `barkada-theme`
    - light or dark mode preference
- `sessionStorage`
  - `barkada-session`
    - the non-remembered session for the current tab only
  - `barkada-session-type`
    - notes that the current session is tab-only
- cookie fallback
  - `barkada-session`
    - a simple demo fallback cookie for remembered sessions

## How to replace the demo layer later

### Authentication

Replace these files first:

- `js/services/auth.service.js`
- `js/utils/storage.js`
- `php/auth/login.php`
- `php/auth/register.php`
- `php/auth/logout.php`
- `php/auth/session.php`

Suggested migration:

1. Keep the frontend form validation.
2. Replace the mock async return values with `fetch()` calls to the PHP auth endpoints.
3. Stop storing user sessions in browser storage for production auth.
4. Use PHP sessions instead.
5. Return safe user details such as `user_id`, `name`, `email`, and role summary after login.

### Groups

Replace:

- `js/services/group.service.js`
- `php/groups/*.php`

Important existing schema tables:

- `groups`
- `group_members`

### Contributions and payments

Replace:

- `js/services/contribution.service.js`
- `js/services/payment.service.js`
- `php/contributions/*.php`
- `php/payments/*.php`

Important existing schema tables:

- `contributions`
- `payment_records`

### Graph data

Current graph calculations come from:

- `js/utils/calculations.js`
- `js/dashboard.js`

To replace them later:

1. Return real grouped counts and totals from PHP or calculate them in frontend from fetched rows.
2. Keep the same data shape if possible.
3. Reuse the existing calculation helpers if your PHP responses stay close to the current schema.

## PHP endpoint intention map

- `php/auth/login.php`
  - login
- `php/auth/register.php`
  - sign up
- `php/auth/forgot-password.php`
  - request reset
- `php/auth/reset-password.php`
  - submit new password
- `php/auth/logout.php`
  - logout
- `php/auth/session.php`
  - restore session
- `php/groups/list.php`
  - groups for the current user
- `php/groups/detail.php`
  - one group detail
- `php/groups/create.php`
  - create group
- `php/groups/update.php`
  - update group
- `php/groups/join.php`
  - join by code
- `php/groups/members.php`
  - group member list
- `php/contributions/list.php`
  - contributions list
- `php/contributions/create.php`
  - add contribution
- `php/payments/mark-paid.php`
  - member marks paid
- `php/payments/confirm.php`
  - treasurer confirms
- `php/payments/reject.php`
  - treasurer rejects
- `php/payments/history.php`
  - payment history

## Access method

Group access should use custom group codes through `groups.join_code`.

Recommended backend flow:

1. User submits a code from `pages/join-group.html`.
2. Frontend calls `php/groups/join.php`.
3. PHP validates the submitted code against `groups.join_code`.
4. PHP inserts into `group_members` if the user is allowed to join.

## Secure auth replacement reminder

The current demo stores plain text passwords in mock data only because the backend is not connected yet.

When you replace this layer:

1. Hash passwords in PHP.
2. Verify them server-side.
3. Use prepared statements for all queries.
4. Store login state in secure PHP sessions.
5. Stop exposing password values to the frontend.
