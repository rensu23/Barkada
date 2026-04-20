# Optional Schema Notes

These ideas are separated from the core schema on purpose so your current `barkada_db` compatibility stays intact.

## Possible future additions

- `password_reset_tokens`
  - needed for secure forgot/reset password flows
- `contribution_cycles`
  - useful if recurring dues need member-by-member cycle history
- `activity_logs`
  - helpful for timeline pages and audit history
- `payment_rejection_notes`
  - useful if your team does not want to add a note field directly to `payment_records`
- `user_profiles`
  - useful for avatars, bios, or optional contact fields

## Important note

Do not rush these tables into the project unless your backend flow needs them. The current frontend works with mock state while these decisions stay open.
