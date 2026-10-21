# Production diagnosis and deployment

## Confirmed causes

Read-only checks of https://pet-store-28n1.vercel.app found:

- `/` returns HTTP 200, but `/inventory`, `/orders`, `/analytics`, `/logs`, and `/add` return HTTP 404. The repository had no Vercel SPA rewrite.
- The deployed JavaScript `/assets/index-CPqqk8sc.js` has `undefined` for Firebase apiKey, authDomain, projectId, storageBucket, messagingSenderId, and appId. The Vite build did not receive those environment values. This was checked without printing configuration values.
- All six Firebase variables and both Cloudinary variables are present in local `.env.local`. That file is ignored by Git and is not automatically supplied to Vercel.
- Earlier local browser checks reached Firestore but received `Missing or insufficient permissions`. The application does not implement Firebase Authentication. Deployed Firebase rules and account settings cannot be inspected from this repository.
- NotificationCenter used `motion.div` without importing `motion`, causing a crash when the notifications dropdown opens.
- Reads and listeners did not have a connection deadline. SDK retries could leave skeletons active indefinitely. Module-level Firestore collection construction could throw before the application could display a configuration error.

No localhost API endpoint exists in `src`. Data comes directly from Firebase's browser SDK; image uploads use Cloudinary HTTPS. No separate Express/API backend needs deploying for this implementation. No CORS failure was confirmed; missing configuration and authorization errors must be resolved before assuming a CORS issue.

## Vercel setup (required)

1. Open the Vercel project connected to `Simpy11/PET-STORE`. In Settings, set Framework Preset to Vite, Root Directory to the directory containing this repository's `package.json`, Build Command to `npm run build`, Output Directory to `dist`, and Node.js Version to 22.x. The installed compatible versions are Vite 7.3.7, React plugin 5.2.0, Tailwind and its Vite plugin 4.2.1, and React/React DOM 19.2.4.
2. Open Firebase Console > the intended project > Project settings > General > Your apps > your web app > SDK setup and configuration. Use the values from that web app, not a service account.
3. In Vercel > Settings > Environment Variables, add these exact names to Production and Preview as appropriate:
   - `VITE_FIREBASE_API_KEY` = web config `apiKey`
   - `VITE_FIREBASE_AUTH_DOMAIN` = `authDomain`
   - `VITE_FIREBASE_PROJECT_ID` = `projectId`
   - `VITE_FIREBASE_STORAGE_BUCKET` = `storageBucket`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID` = `messagingSenderId`
   - `VITE_FIREBASE_APP_ID` = `appId`
   - Optional: `VITE_FIREBASE_MEASUREMENT_ID` = `measurementId`
4. For uploads, add `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` from the intended Cloudinary account. In Cloudinary Console > Settings > Upload > Upload presets, use an unsigned preset restricted to the intended image formats and maximum size (5 MB). The frontend intentionally does not use an API secret. If your account requires signed uploads, implement a server-side signing endpoint; never put its signing secret in `VITE_*`.
5. Save the variables and create a NEW deployment (Deployments > latest deployment > Redeploy, or push the commit). Vite embeds these values at build time; changing settings does not update an existing JavaScript bundle.
6. Verify the new deployment's dashboard and directly refresh `/inventory`, `/orders`, `/analytics`, `/logs`, and `/add`. Open DevTools > Network and Console. Missing configuration should name the missing variables, denied access should identify authentication/rules, and stalled reads should report a connectivity error after 15 seconds.

All `VITE_*` values are public browser configuration. Firebase web configuration and Cloudinary unsigned cloud/preset identifiers are expected to be public; private service-account keys, Firebase Admin credentials, and Cloudinary API secrets must stay server-side. `.env.example` lists names only; `.env.local` remains untracked.

## Firebase access (required if access is denied)

1. In the intended Firebase project, confirm Firestore Database exists and inspect the deployed Rules tab for the `products`, `orders`, `activityLogs`, and `notifications` collections.
2. Use the Rules Playground to test the exact collection read/write with the intended admin identity. The current frontend does not sign in, so rules requiring `request.auth` will reject its requests.
3. A project administrator must select/enable the intended Firebase Authentication provider, implement the corresponding admin sign-in flow, and assign the intended admin identity/role before deploying matching least-privilege rules. There are no admin credentials or rules in this repository from which to infer those choices. Do not change rules to unrestricted public reads/writes or treat anonymous users as administrators.
4. If API key restrictions are enabled, confirm the Firebase web key permits the required Firebase APIs and intended deployed origin. If authentication is added, include the deployment domain in Firebase Authentication > Settings > Authorized domains. If App Check enforcement is enabled, configure the intended app's provider before expecting browser access.
5. Retest list/read and write permissions for all four collections with that admin session. A Firestore `failed-precondition` error may include an index-creation link in the browser console; create that index in the intended project if requested.

The code now handles these errors; it does not bypass backend authorization. Live Firestore CRUD and successful Cloudinary uploads cannot be certified until the account configuration is resolved. No live records or uploaded assets were created, edited, or deleted during verification.

## Changes

`vercel.json` adds SPA routing. Firebase config is validated without crashing module import. Firestore references are lazy, one-shot reads have a 15-second deadline, and subscriptions report first-response timeouts while retaining automatic recovery. An empty offline cache is not presented as an empty server collection. All pages display specific configuration/access/network failures. Entry animations and existing UI are retained. Notifications have their missing motion import and an error state. Cloudinary uploads have a 30-second timeout, cancellation, blob URL cleanup, repeat-file selection, and a guard preventing product save while uploading. Missing/broken product images use a local placeholder. Revenue no longer invents a price for a missing product.

## Local checks and deploy commands

On Windows PowerShell use `npm.cmd` if script execution policy blocks `npm.ps1`.

```powershell
cd "D:\pet store"
npm.cmd install
npm.cmd run lint
npm.cmd test
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1
```

Review and push the actual changes from the repository's existing `main` branch:

```powershell
cd "D:\pet store"
git status --short
git diff --check
git diff
git add .gitignore .env.example vercel.json eslint.config.js package.json package-lock.json DEBUGGING.md src tests public/product-placeholder.svg
git diff --cached --stat
git commit -m "Fix production Firebase configuration, loading states and SPA routing"
git push origin main
```

A Git-connected Vercel project deploying `main` will build that push. Otherwise select the new commit in Vercel and deploy it. This work does not push, change cloud account settings, or publish a deployment automatically.

References: https://vite.dev/guide/env-and-mode.html ; https://vercel.com/docs/frameworks/frontend/vite ; https://firebase.google.com/docs/firestore/security/get-started ; https://cloudinary.com/documentation/upload_presets

## Verification results

- `npm.cmd install --no-audit --no-fund`: passed with no dependency conflict.
- `npm.cmd run lint`, `npm.cmd test`, `npm run build`: passed; 9 regression tests cover normalization, numeric validation, missing configuration, denied access, timeouts, cleanup and recovery.
- Chrome checks of the production bundle: all six routes render headings and appropriate database permission errors; Add Product renders its form with valid local configuration. No uncaught application exceptions. The notification dropdown opens, and mobile navigation opens/closes.
- A separate production build with all six Firebase values intentionally empty was checked in Chrome: all six pages render explicit missing-variable messages without module-import crashes. `.env.local` was not modified.
- Current deployed route status checks: homepage 200, five deep links 404. The new `vercel.json` rewrite requires a new Vercel deployment to verify on hosting.
- Successful live CRUD and Cloudinary uploads remain unverified; there were no live test writes/uploads. Build reports a non-blocking large JavaScript chunk warning.

## Files changed in this production fix

- `.env.example`
- `.gitignore`
- `DEBUGGING.md`
- `eslint.config.js`
- `package-lock.json`
- `package.json`
- `public/product-placeholder.svg`
- `src/App.jsx`
- `src/components/common/DataError.jsx`
- `src/components/common/ImageUpload.jsx`
- `src/components/common/ProductImage.jsx`
- `src/components/layout/TopNav.jsx`
- `src/components/notifications/NotificationCenter.jsx`
- `src/pages/AddProduct.jsx`
- `src/pages/Analytics.jsx`
- `src/pages/Dashboard.jsx`
- `src/pages/Inventory.jsx`
- `src/pages/Logs.jsx`
- `src/pages/Orders.jsx`
- `src/services/activityLogs.js`
- `src/services/config.js`
- `src/services/firebase.js`
- `src/services/firestoreAccess.js`
- `src/services/notifications.js`
- `src/services/orders.js`
- `src/services/products.js`
- `src/services/requestState.js`
- `src/services/stats.js`
- `tests/production.test.mjs`
- `vercel.json`
