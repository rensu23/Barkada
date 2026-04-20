# Optional Schema Notes

The current demo stays aligned with the existing SQL schema:

- `users`
- `groups`
- `group_members`
- `contributions`
- `payment_records`

## Where the demo temporarily goes beyond the schema

These are frontend-only extras or notes for future backend work:

- rejection notes
  - the demo keeps a `rejection_note` field in local state for better testing
  - the current SQL file does not include that column
- due dates and notes on contributions
  - used in the frontend demo to make pages richer
  - the current SQL schema does not store them yet
- activity timeline rows
  - currently frontend-only
- QR metadata
  - currently frontend-only

## Optional future additions

- `password_reset_tokens`
  - secure forgot/reset password flow
- `contribution_cycles`
  - if recurring contributions need per-cycle storage
- `activity_logs`
  - if you want permanent recent activity history
- `payment_record_notes`
  - if you want treasurer rejection notes stored cleanly
- `user_profile_meta`
  - if you want avatars or profile extras later

## Recommendation

Do not add all optional tables immediately. Connect the core schema first, then add only the extra tables your final backend really needs.
