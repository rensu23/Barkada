# File Structure Guide

## Frontend

- `index.html`
  - landing page
- `pages/`
  - all public/auth pages and authenticated app pages
- `css/`
  - design tokens, layout, components, and page styling
- `js/`
  - modular frontend logic
- `js/data/`
  - starter mock data aligned to the SQL schema
- `js/services/`
  - async service layer that is easy to replace later
- `js/utils/`
  - small helpers, formatters, storage, and shared constants

## Backend scaffold

- `php/config/`
  - setup files such as database config
- `php/helpers/`
  - reusable response, auth, and validation helpers
- `php/auth/`
  - login, register, logout, forgot, reset, and session stubs
- `php/groups/`
  - group list/detail/create/update/join/member stubs
- `php/contributions/`
  - contribution list/detail/create/update/recurring stubs
- `php/payments/`
  - mark-paid, confirm, reject, and history stubs
- `php/users/`
  - profile-related stubs
- `php/qr/`
  - QR and scan-related stubs

## Old starter files

Some original top-level files existed before this redesign. The new structure centers on `index.html`, `pages/`, `css/`, and `js/` so beginners have one clear place to start.
