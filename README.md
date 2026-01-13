<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/17JCPc-LAPvTZ4bdMSOMFpb0rFvCdzbHU

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Firebase (optional) — migrate localStorage to Firestore

This project supports using Firebase Firestore + Storage instead of the built-in `localStorage` persistence. If you configure Firebase (see `.env.example`) the app will automatically use Firestore for CRUD and Storage for uploads.

Setup:

1. Create a Firebase project at https://console.firebase.google.com/
2. In Project Settings -> Service accounts -> Generate new private key and save the JSON file locally (for migration only).
3. Copy `.env.example` to `.env.local` and fill the `VITE_FIREBASE_*` values.
4. Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

One-time migration from your browser localStorage to Firestore:

- Export your existing data from the browser console:

```js
// In your app (opened in the browser console)
copy(localStorage.getItem('dept_timeline_data'))
// Paste into a file named export.json
```

- Run the migration script using a Firebase service account JSON and the exported data:

```bash
# Place your service account JSON somewhere, e.g. ./serviceAccount.json
# Place the exported data in ./export.json
npm run migrate:local-to-firebase -- ./serviceAccount.json ./export.json
```

Notes:
- The migration script uses the Firebase Admin SDK and requires a service account JSON.
- Documents are written to the `entries` collection; existing documents with the same `id` will be overwritten.
- If you prefer a browser-based migration instead of the CLI, ask me and I can add an admin-only migration button in the app.
