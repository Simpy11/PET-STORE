# Running and checking the dashboard

- `npm.cmd run dev` starts the local application on Windows PowerShell.
- `npm.cmd run lint` checks application source and configuration.
- `npm.cmd test` checks legacy record normalization and product validation.
- `npm.cmd run build` creates the production bundle.

## Firestore access

Browser verification found `FirebaseError: Missing or insufficient permissions` for products, orders, activity logs, and notifications. The application currently initializes Firestore without signing in a user. This repository contains no Firebase security rules or authentication flow.

A Firebase project administrator must provide the intended authentication/access setup and deploy rules granting that identity the required collection access. Verify that `.env.local` points to the intended project. Do not grant unrestricted public database writes to make the error disappear.

The pages now display database failures with a retry action. Successful live reads and writes still depend on resolving these backend permissions. Browser checks did not create, edit, or delete live database records.
