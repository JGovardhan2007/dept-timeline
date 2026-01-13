#!/usr/bin/env node
/*
 Migration script to push localStorage entries (exported JSON) into Firestore.
 Usage:
   node scripts/migrateLocalToFirestore.js <serviceAccount.json> <export.json>

 Requirements:
 - A Firebase service account JSON (from Firebase Console -> Project Settings -> Service accounts)
 - The exported localStorage JSON file (the value of localStorage.getItem('dept_timeline_data'))

 This script uses the Admin SDK and writes documents to the `entries` collection.
*/

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

async function main() {
  const [, , saPath, dataPath] = process.argv;
  if (!saPath || !dataPath) {
    console.error('Usage: node scripts/migrateLocalToFirestore.js <serviceAccount.json> <export.json>');
    process.exit(1);
  }

  const absSa = path.resolve(saPath);
  const absData = path.resolve(dataPath);

  if (!fs.existsSync(absSa)) {
    console.error('Service account file not found:', absSa);
    process.exit(1);
  }
  if (!fs.existsSync(absData)) {
    console.error('Data file not found:', absData);
    process.exit(1);
  }

  const sa = require(absSa);
  admin.initializeApp({ credential: admin.credential.cert(sa) });
  const db = admin.firestore();

  const raw = fs.readFileSync(absData, 'utf8');
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse data JSON:', err.message);
    process.exit(1);
  }

  // Determine entries array shape
  let entries = null;
  if (Array.isArray(payload)) entries = payload;
  else if (payload && payload.dept_timeline_data && Array.isArray(payload.dept_timeline_data)) entries = payload.dept_timeline_data;
  else if (payload && Array.isArray(payload.entries)) entries = payload.entries;
  else {
    // Maybe payload is the raw string saved by localStorage (i.e., JSON array string inside)
    if (typeof payload === 'string') {
      try {
        const inner = JSON.parse(payload);
        if (Array.isArray(inner)) entries = inner;
      } catch (e) {
        // fallthrough
      }
    }
  }

  if (!entries) {
    console.error('Unable to find entries array in provided JSON. Expected an array or object with key `dept_timeline_data` or `entries`.');
    process.exit(1);
  }

  console.log(`Found ${entries.length} entries — uploading to Firestore collection 'entries'...`);

  const batchSize = 500;
  let uploaded = 0;
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = db.batch();
    const slice = entries.slice(i, i + batchSize);
    for (const entry of slice) {
      const docRef = entry && entry.id ? db.collection('entries').doc(String(entry.id)) : db.collection('entries').doc();
      batch.set(docRef, entry);
    }
    await batch.commit();
    uploaded += slice.length;
    console.log(`Uploaded ${uploaded}/${entries.length}...`);
  }

  console.log('Migration complete. Uploaded', uploaded, 'entries.');
  process.exit(0);
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
