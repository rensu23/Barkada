# File Structure Guide

- `index.html`: public landing entry.
- `pages/`: static page shells with PHP/MySQL TODO comments near forms and data regions.
- `css/`: interface styles retained for the app shell.
- `js/main.js`: initializes UI behavior and page adapters.
- `js/services/`: backend-facing adapters; no hardcoded application records.
- `js/utils/storage.js`: empty compatibility adapter; no browser database.
- `js/theme.js`: client-side theme preference only.
- `php/`: endpoint placeholders aligned to `barkada_db.sql`.
- `docs/integration-notes.md`: endpoint, security, error handling, and sorting plan.
- `docs/php-mysql-migration-plan.md`: cleanup summary and backend implementation checklist.
