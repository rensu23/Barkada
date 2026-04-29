# Optional Schema Notes

The current database source of truth is still only:

- `users`
- `groups`
- `group_members`
- `contributions`
- `payment_records`

Do not add tables or columns unless the team intentionally extends the schema.

Optional future additions:

- `password_reset_tokens`: secure forgot/reset password flow.
- `contribution_cycles`: per-cycle rows if recurring contributions need schedules beyond `contributions.frequency`.
- `activity_logs`: permanent recent activity history instead of deriving updates from `payment_records`.
- `payment_record_notes`: treasurer rejection remarks.
- `user_profile_meta`: avatars or profile preferences.

Recommended order: connect the core schema first, then add only the extra tables required by final project scope.
