import { TimelineEntry } from '../types';
import { SEED_DATA } from '../constants';
import { firebaseConfigured, firestore, storage } from '@/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const STORAGE_KEY = 'dept_timeline_data';

// Simulate a network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const dataService = {
  getAllEntries: async (): Promise<TimelineEntry[]> => {
    await delay(300); // Simulate network latency
    if (firebaseConfigured && firestore) {
      const q = query(collection(firestore, 'entries'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const items = snap.docs.map(d => {
        const data = d.data() as any;
        // Migration/Normalization: Ensure mediaUrls exists
        if (!data.mediaUrls && data.mediaUrl) {
          data.mediaUrls = [data.mediaUrl];
        }
        return { ...data, id: d.id };
      }) as TimelineEntry[];
      return items;
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Initialize with seed data if empty
      const initialData: TimelineEntry[] = [...SEED_DATA] as TimelineEntry[];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      return initialData;
    }
    const parsed = JSON.parse(raw) as TimelineEntry[];
    // Normalize local data too
    return parsed.map(p => ({
      ...p,
      mediaUrls: p.mediaUrls || (p.mediaUrl ? [p.mediaUrl] : [])
    }));
  },

  addEntry: async (entry: Omit<TimelineEntry, 'id' | 'createdAt'>): Promise<TimelineEntry> => {
    await delay(300);
    const createdAt = Date.now();
    if (firebaseConfigured && firestore) {
      const payload = { ...entry, createdAt } as any;
      const ref = await addDoc(collection(firestore, 'entries'), payload);
      return { id: ref.id, ...payload } as TimelineEntry;
    }

    const entries = await dataService.getAllEntries();
    const newEntry: TimelineEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt,
    };
    const updatedEntries = [newEntry, ...entries];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    return newEntry;
  },

  updateEntry: async (entry: TimelineEntry): Promise<TimelineEntry> => {
    await delay(300);
    if (firebaseConfigured && firestore) {
      const docRef = doc(firestore, 'entries', entry.id);
      await setDoc(docRef, entry, { merge: true });
      return entry;
    }

    const entries = await dataService.getAllEntries();
    const index = entries.findIndex(e => e.id === entry.id);
    if (index !== -1) {
      entries[index] = entry;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }
    return entry;
  },

  deleteEntry: async (id: string): Promise<void> => {
    await delay(300);
    if (firebaseConfigured && firestore) {
      await deleteDoc(doc(firestore, 'entries', id));
      return;
    }
    const entries = await dataService.getAllEntries();
    const updated = entries.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  // Upload file to Firebase Storage if configured, otherwise return a blob URL
  uploadFile: async (file: File): Promise<string> => {
    await delay(1000);
    if (firebaseConfigured && storage) {
      const path = `uploads/${Date.now()}_${file.name}`;
      const sRef = storageRef(storage, path);
      await uploadBytes(sRef, file);
      const downloadURL = await getDownloadURL(sRef);
      return downloadURL;
    }

    // Fallback: return blob URL for instant preview in demo mode
    return URL.createObjectURL(file);
  }
};
