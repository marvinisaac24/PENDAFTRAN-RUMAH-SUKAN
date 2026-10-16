import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { DEFAULT_ACARA, INITIAL_STUDENTS } from '../data/constants';
import { AcaraSukan, Murid, PendaftaranAcara } from '../types';
import { auth, db, testFirestoreConnection } from './firebase';

const KEY_MURID = 'sukan_sekolah_murid_v2';
const KEY_PENDAFTARAN = 'sukan_sekolah_pendaftaran_v2';
const KEY_ACARA = 'sukan_sekolah_acara_v2';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// BroadcastChannel for instant real-time sync across tabs and windows
let syncChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    syncChannel = new BroadcastChannel('sukan_sekolah_realtime_channel');
  }
} catch (e) {
  console.warn('BroadcastChannel not supported', e);
}

const listeners: Set<(type: 'murid' | 'pendaftaran' | 'acara') => void> = new Set();

if (syncChannel) {
  syncChannel.onmessage = (event) => {
    const type = event.data?.type;
    if (type) {
      listeners.forEach((listener) => listener(type));
    }
  };
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === KEY_MURID) listeners.forEach((l) => l('murid'));
    if (event.key === KEY_PENDAFTARAN) listeners.forEach((l) => l('pendaftaran'));
    if (event.key === KEY_ACARA) listeners.forEach((l) => l('acara'));
  });
}

function notifySync(type: 'murid' | 'pendaftaran' | 'acara') {
  if (syncChannel) {
    try {
      syncChannel.postMessage({ type, timestamp: Date.now() });
    } catch {
      // ignore
    }
  }
  listeners.forEach((listener) => listener(type));
}

// Initialize Firestore listeners and bootstrap default data
let isFirestoreInitialized = false;

export function initFirebaseSync() {
  if (isFirestoreInitialized || typeof window === 'undefined') return;
  isFirestoreInitialized = true;

  testFirestoreConnection().catch((err) =>
    console.warn('Firestore test connection failed:', err)
  );

  // Listen to remote 'murid' collection
  try {
    const muridCol = collection(db, 'murid');
    onSnapshot(
      muridCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteList: Murid[] = [];
          snapshot.forEach((docSnap) => {
            remoteList.push(docSnap.data() as Murid);
          });
          StorageService.saveMuridList(remoteList, true, false);
        } else {
          // If Firestore is empty, seed initial sample data into Firestore
          const local = StorageService.getMuridList();
          if (local.length > 0) {
            StorageService.syncLocalToFirestore(local);
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'murid');
      }
    );
  } catch (error) {
    console.warn('Failed to attach murid snapshot listener:', error);
  }

  // Listen to remote 'pendaftaran' collection
  try {
    const pendaftaranCol = collection(db, 'pendaftaran');
    onSnapshot(
      pendaftaranCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteList: PendaftaranAcara[] = [];
          snapshot.forEach((docSnap) => {
            remoteList.push(docSnap.data() as PendaftaranAcara);
          });
          StorageService.savePendaftaranList(remoteList, true, false);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'pendaftaran');
      }
    );
  } catch (error) {
    console.warn('Failed to attach pendaftaran snapshot listener:', error);
  }
}

export const StorageService = {
  subscribe(callback: (type: 'murid' | 'pendaftaran' | 'acara') => void) {
    listeners.add(callback);
    return () => {
      listeners.delete(callback);
    };
  },

  // Murid API
  getMuridList(): Murid[] {
    try {
      const data = localStorage.getItem(KEY_MURID);
      if (!data) {
        this.saveMuridList(INITIAL_STUDENTS, false, true);
        return INITIAL_STUDENTS;
      }
      return JSON.parse(data) as Murid[];
    } catch (e) {
      console.error('Gagal membaca senarai murid dari localStorage', e);
      return INITIAL_STUDENTS;
    }
  },

  saveMuridList(list: Murid[], triggerNotify = true, syncToRemote = true): void {
    try {
      localStorage.setItem(KEY_MURID, JSON.stringify(list));
      if (triggerNotify) {
        notifySync('murid');
      }
      if (syncToRemote) {
        this.syncLocalToFirestore(list);
      }
    } catch (e) {
      console.error('Gagal menyimpan senarai murid', e);
    }
  },

  async syncLocalToFirestore(list: Murid[]): Promise<void> {
    try {
      // Chunk writes by 450 to stay within Firestore 500-op limit
      for (let i = 0; i < list.length; i += 450) {
        const chunk = list.slice(i, i + 450);
        const batch = writeBatch(db);
        for (const m of chunk) {
          const safeId = m.id.replace(/[^a-zA-Z0-9_-]/g, '_');
          const ref = doc(db, 'murid', safeId);
          batch.set(ref, m, { merge: true });
        }
        await batch.commit();
      }
    } catch (err) {
      console.warn('Sync to Firestore notice:', err);
    }
  },

  async replaceMuridList(
    newList: Array<Omit<Murid, 'tarikhDicipta' | 'tarikhKemaskini'>>
  ): Promise<{ total: number }> {
    const now = new Date().toISOString();
    const seen = new Set<string>();
    const formattedList: Murid[] = [];

    // Ensure strictly unique IDs across all items so none are lost
    for (let i = 0; i < newList.length; i++) {
      const item = newList[i];
      let cleanId = item.id.trim();
      let upperKey = cleanId.toUpperCase();
      let counter = 2;
      while (seen.has(upperKey)) {
        cleanId = `${item.id.trim()}-${counter}`;
        upperKey = cleanId.toUpperCase();
        counter++;
      }
      seen.add(upperKey);

      formattedList.push({
        id: cleanId,
        nama: item.nama.trim(),
        tahun: item.tahun,
        kelas: item.kelas.trim(),
        jantina: item.jantina,
        rumahSukan: item.rumahSukan,
        tarikhDicipta: now,
        tarikhKemaskini: now,
      });
    }

    // 1. Immediately save to local storage and update React components
    this.saveMuridList(formattedList, true, false);

    // 2. Sync with Firestore: remove documents not present in the new replacement list
    try {
      const snap = await getDocs(collection(db, 'murid'));
      const newSafeIds = new Set(formattedList.map((m) => m.id.replace(/[^a-zA-Z0-9_-]/g, '_')));

      // Delete obsolete documents from Firestore
      const obsoleteDocs = snap.docs.filter((d) => !newSafeIds.has(d.id));
      for (let i = 0; i < obsoleteDocs.length; i += 450) {
        const chunk = obsoleteDocs.slice(i, i + 450);
        const deleteBatch = writeBatch(db);
        chunk.forEach((d) => deleteBatch.delete(d.ref));
        await deleteBatch.commit();
      }

      // Write all new documents to Firestore
      await this.syncLocalToFirestore(formattedList);
    } catch (err) {
      console.warn('Sync replace to Firestore notice:', err);
    }

    return { total: formattedList.length };
  },

  upsertMuridBatch(
    newMuridList: Array<Omit<Murid, 'tarikhDicipta' | 'tarikhKemaskini'>>
  ): { ditambah: number; dikemaskini: number; total: number } {
    const current = this.getMuridList();
    const map = new Map<string, Murid>();
    current.forEach((m) => map.set(m.id.trim().toUpperCase(), m));

    let ditambah = 0;
    let dikemaskini = 0;
    const now = new Date().toISOString();

    for (const item of newMuridList) {
      const key = item.id.trim().toUpperCase();
      const existing = map.get(key);
      if (existing) {
        map.set(key, {
          ...existing,
          nama: item.nama.trim(),
          tahun: item.tahun,
          kelas: item.kelas.trim(),
          jantina: item.jantina,
          rumahSukan: item.rumahSukan,
          tarikhKemaskini: now,
        });
        dikemaskini++;
      } else {
        map.set(key, {
          id: item.id.trim(),
          nama: item.nama.trim(),
          tahun: item.tahun,
          kelas: item.kelas.trim(),
          jantina: item.jantina,
          rumahSukan: item.rumahSukan,
          tarikhDicipta: now,
          tarikhKemaskini: now,
        });
        ditambah++;
      }
    }

    const updatedList = Array.from(map.values());
    this.saveMuridList(updatedList, true, true);
    return { ditambah, dikemaskini, total: updatedList.length };
  },

  deleteMurid(id: string): void {
    const current = this.getMuridList();
    const filtered = current.filter((m) => m.id !== id);
    this.saveMuridList(filtered, true, false);

    // Also delete from Firestore
    try {
      const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '_');
      deleteDoc(doc(db, 'murid', safeId)).catch((e) =>
        handleFirestoreError(e, OperationType.DELETE, `murid/${safeId}`)
      );
    } catch (err) {
      console.warn('Error deleting murid from Firestore:', err);
    }
  },

  deleteMuridBatch(ids: string[]): { dipadam: number; baki: number } {
    if (!ids || ids.length === 0) return { dipadam: 0, baki: this.getMuridList().length };

    const idSet = new Set(ids);
    const current = this.getMuridList();
    const filtered = current.filter((m) => !idSet.has(m.id));
    const dipadam = current.length - filtered.length;
    this.saveMuridList(filtered, true, false);

    // Delete in batches from Firestore
    try {
      const batch = writeBatch(db);
      ids.forEach((id) => {
        const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '_');
        batch.delete(doc(db, 'murid', safeId));
      });
      batch.commit().catch((e) =>
        handleFirestoreError(e, OperationType.DELETE, 'murid/batch')
      );
    } catch (err) {
      console.warn('Error deleting murid batch from Firestore:', err);
    }

    return { dipadam, baki: filtered.length };
  },

  resetSampleMurid(): void {
    this.saveMuridList(INITIAL_STUDENTS, true, true);
  },

  clearAllMurid(): void {
    this.saveMuridList([], true, false);
    // Delete all documents in Firestore murid collection
    try {
      getDocs(collection(db, 'murid')).then((snap) => {
        const batch = writeBatch(db);
        snap.forEach((d) => batch.delete(d.ref));
        batch.commit().catch(console.warn);
      });
    } catch (err) {
      console.warn('Error clearing remote murid collection:', err);
    }
  },

  // Acara API
  getAcaraList(): AcaraSukan[] {
    try {
      const data = localStorage.getItem(KEY_ACARA);
      let list = DEFAULT_ACARA;
      if (data) {
        list = JSON.parse(data) as AcaraSukan[];
      }
      // Ensure strictly sorted by Year chronologically (Pra Sekolah 0 -> Tahun 1 Sukaneka -> Tahun 2 -> 3 -> 4 -> 5 -> 6 -> Padang)
      return list.sort((a, b) => {
        const minA = Math.min(...a.tahunKelayakan);
        const minB = Math.min(...b.tahunKelayakan);
        if (minA !== minB) return minA - minB;

        if (a.masa && b.masa && a.masa !== b.masa) {
          return a.masa.localeCompare(b.masa);
        }

        const katWeight: Record<string, number> = {
          'Pra Sekolah': 1,
          'Sukaneka': 2,
          'Balapan': 3,
          'Padang': 4,
        };
        const wA = katWeight[a.kategori] || 5;
        const wB = katWeight[b.kategori] || 5;
        if (wA !== wB) return wA - wB;

        return a.kod.localeCompare(b.kod, undefined, { numeric: true });
      });
    } catch {
      return DEFAULT_ACARA;
    }
  },

  saveAcaraList(list: AcaraSukan[], triggerNotify = true): void {
    try {
      localStorage.setItem(KEY_ACARA, JSON.stringify(list));
      if (triggerNotify) {
        notifySync('acara');
      }
    } catch (e) {
      console.error('Gagal menyimpan acara', e);
    }
  },

  // Pendaftaran API
  getPendaftaranList(): PendaftaranAcara[] {
    try {
      const data = localStorage.getItem(KEY_PENDAFTARAN);
      if (!data) return [];
      return JSON.parse(data) as PendaftaranAcara[];
    } catch {
      return [];
    }
  },

  savePendaftaranList(list: PendaftaranAcara[], triggerNotify = true, syncToRemote = true): void {
    try {
      localStorage.setItem(KEY_PENDAFTARAN, JSON.stringify(list));
      if (triggerNotify) {
        notifySync('pendaftaran');
      }
      if (syncToRemote) {
        try {
          const batch = writeBatch(db);
          list.slice(0, 100).forEach((p) => {
            const safeId = p.id.replace(/[^a-zA-Z0-9_-]/g, '_');
            batch.set(doc(db, 'pendaftaran', safeId), p, { merge: true });
          });
          batch.commit().catch(console.warn);
        } catch (err) {
          console.warn('Error batch syncing pendaftaran to Firestore:', err);
        }
      }
    } catch (e) {
      console.error('Gagal menyimpan pendaftaran', e);
    }
  },

  tambahPendaftaran(pendaftaran: Omit<PendaftaranAcara, 'id' | 'tarikhDaftar'>): PendaftaranAcara {
    const list = this.getPendaftaranList();
    const newEntry: PendaftaranAcara = {
      ...pendaftaran,
      id: `REG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tarikhDaftar: new Date().toISOString(),
    };
    list.unshift(newEntry);
    this.savePendaftaranList(list, true, false);

    // Save directly to Firestore with error handling
    try {
      const safeId = newEntry.id.replace(/[^a-zA-Z0-9_-]/g, '_');
      setDoc(doc(db, 'pendaftaran', safeId), newEntry).catch((error) => {
        handleFirestoreError(error, OperationType.WRITE, `pendaftaran/${safeId}`);
      });
    } catch (error) {
      console.warn('Failed to write pendaftaran to Firestore directly:', error);
    }

    return newEntry;
  },

  padamPendaftaran(id: string): void {
    const list = this.getPendaftaranList();
    const filtered = list.filter((p) => p.id !== id);
    this.savePendaftaranList(filtered, true, false);

    // Also delete from Firestore
    try {
      const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '_');
      deleteDoc(doc(db, 'pendaftaran', safeId)).catch((error) => {
        handleFirestoreError(error, OperationType.DELETE, `pendaftaran/${safeId}`);
      });
    } catch (error) {
      console.warn('Failed to delete pendaftaran from Firestore:', error);
    }
  },
};
