# Demo Flow Guide

## Best way to start

1. Open `index.html` from the project root.
2. Click `Login`.
3. Use one of the demo account buttons.

## Suggested walkthroughs

### Treasurer demo

1. Log in with `treasurer@demo.com`
2. Open the dashboard
3. Go to `Confirmations`
4. Confirm or reject a pending payment
5. Return to the dashboard and see totals update
6. Open `Members` and test the filters

### Member demo

1. Log in with `member@demo.com`
2. Open `Contributions`
3. Use `Mark as Paid` on an unpaid item
4. Open `History`
5. Open `My QR`

### Hybrid demo

1. Log in with `hybrid@demo.com`
2. Use the group switcher in the top header
3. Switch to the class group where the user is treasurer
4. Open `Confirmations`
5. Switch to another group where the same user is only a member
6. Open `Contributions` and test member-only actions

## Sign up flow

- The sign-up page creates a new local demo user entry.
- It does not create a real backend account yet.

## Password reset flow

- Forgot password and reset password are simulated frontend flows only.
- They are present so your team can test the UI before adding backend token handling.
