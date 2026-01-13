import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Read Vite env variables. These are available at build/runtime via import.meta.env
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined;
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined;
const appId = import.meta.env.VITE_FIREBASE_APP_ID as string | undefined;

export const firebaseConfigured = Boolean(
  apiKey && authDomain && projectId && storageBucket && messagingSenderId && appId
);

let _app: ReturnType<typeof initializeApp> | null = null;
let _firestore: ReturnType<typeof getFirestore> | null = null;
let _storage: ReturnType<typeof getStorage> | null = null;

if (firebaseConfigured) {
  const config = {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId
  } as Record<string, string>;

  _app = initializeApp(config as any);
  _firestore = getFirestore(_app);
  _storage = getStorage(_app);
}

export const firestore = _firestore;
export const storage = _storage;

export default {
  firebaseConfigured,
  firestore,
  storage
};
