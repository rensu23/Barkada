# File Structure Guide

## Start here first

- `index.html`
  - root landing page and recommended first page to open
- `README.md`
  - quick local-running notes
- `docs/demo-accounts.md`
  - demo credentials and what each account can test
- `docs/demo-flow-guide.md`
  - guided demo walkthrough

## Frontend files beginners should edit first

- `pages/`
  - if you want to change page content or layout sections
- `css/tokens.css`
  - if you want to change colors, spacing, or shadows
- `css/components.css`
  - if you want to change shared cards, buttons, forms, and tables
- `js/data/`
  - if you want to change seeded demo content
- `js/services/`
  - if you want to understand how data currently flows through the demo

## Frontend files to be more careful with

- `js/utils/storage.js`
  - controls demo database persistence and session storage behavior
- `js/utils/calculations.js`
  - controls totals, summaries, and graph inputs
- `js/main.js`
  - initializes the whole frontend app
- `js/navigation.js`
  - controls shared nav and group context switching

## Folder breakdown

- `pages/`
  - public pages and app pages
- `css/`
  - tokens, themes, layout, components, utilities, and page-specific styles
- `js/data/`
  - centralized seeded demo rows aligned with the SQL schema
- `js/services/`
  - Promise-based mock service layer that can later become real fetch calls
- `js/utils/`
  - helpers for storage, formatting, cookies, and summary calculations
- `php/`
  - backend stubs only, ready for future PHP + MySQL hookup
- `docs/`
  - handoff notes, demo notes, and testing notes

## Old starter files

Top-level compatibility files such as `login.html`, `signup.html`, and `dashboard.html` now redirect to the newer files inside `pages/`. Keep using the `pages/` versions for real edits.
