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

const KEY_MURID = 'sukan_sekolah_murid_v6';
const KEY_PENDAFTARAN = 'sukan_sekolah_pendaftaran_v3';
const KEY_ACARA = 'sukan_sekolah_acara_v5';
const KEY_DELETED_MURID_IDS = 'sukan_sk_tudan_deleted_ids_v3';

// In-memory cache for ultra-fast zero-lag access
let cachedMuridList: Murid[] | null = null;
let cachedAcaraList: AcaraSukan[] | null = null;
let cachedPendaftaranList: PendaftaranAcara[] | null = null;

// Tombstone pengesanan murid yang telah dipadam agar tidak timbul semula
export function getDeletedMuridIds(): Set<string> {
  try {
    const data = localStorage.getItem(KEY_DELETED_MURID_IDS);
    if (!data) return new Set();
    const arr = JSON.parse(data) as string[];
    return new Set(arr.map((id) => (id || '').trim().toUpperCase()));
  } catch {
    return new Set();
  }
}

export function addDeletedMuridIds(ids: string[]): void {
  try {
    const set = getDeletedMuridIds();
    ids.forEach((id) => {
      if (id && id.trim()) {
        set.add(id.trim().toUpperCase());
      }
    });
    localStorage.setItem(KEY_DELETED_MURID_IDS, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.warn('Failed to store deleted murid ids', e);
  }
}

export function unmarkDeletedMuridId(id: string): void {
  try {
    const set = getDeletedMuridIds();
    const key = (id || '').trim().toUpperCase();
    if (set.has(key)) {
      set.delete(key);
      localStorage.setItem(KEY_DELETED_MURID_IDS, JSON.stringify(Array.from(set)));
    }
  } catch {}
}

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
  console.warn('Firestore Warning: ', JSON.stringify(errInfo));
  return errInfo;
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
      if (type === 'murid') cachedMuridList = null;
      if (type === 'pendaftaran') cachedPendaftaranList = null;
      if (type === 'acara') cachedAcaraList = null;
      listeners.forEach((listener) => listener(type));
    }
  };
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === KEY_MURID) {
      cachedMuridList = null;
      listeners.forEach((l) => l('murid'));
    }
    if (event.key === KEY_PENDAFTARAN) {
      cachedPendaftaranList = null;
      listeners.forEach((l) => l('pendaftaran'));
    }
    if (event.key === KEY_ACARA) {
      cachedAcaraList = null;
      listeners.forEach((l) => l('acara'));
    }
  });

  // Pembersihan awal automatik: Padam semua data contoh lama agar hanya murid baru yang didaftarkan akan muncul mengikut Rumah Sukan
  const PURGE_FLAG = 'sukan_sk_tudan_purged_mock_v3';
  if (!localStorage.getItem(PURGE_FLAG)) {
    localStorage.setItem(PURGE_FLAG, 'true');
    ['sukan_sekolah_murid', 'sukan_sekolah_murid_v1', 'sukan_sekolah_murid_v2', 'sukan_sekolah_murid_v3', 'sukan_sekolah_murid_v4', 'sukan_sekolah_murid_v5'].forEach((k) => {
      localStorage.removeItem(k);
    });
    localStorage.setItem(KEY_MURID, JSON.stringify([]));
    cachedMuridList = [];
    try {
      getDocs(collection(db, 'murid')).then((snap) => {
        if (!snap.empty) {
          const batch = writeBatch(db);
          snap.forEach((d) => batch.delete(d.ref));
          batch.commit().catch(console.warn);
        }
      }).catch(console.warn);
    } catch {
      // ignore
    }
  }
}

// Debounced sync notifications to prevent UI freezing and lag
let syncTimer: any = null;
function notifySync(type: 'murid' | 'pendaftaran' | 'acara') {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    if (syncChannel) {
      try {
        syncChannel.postMessage({ type, timestamp: Date.now() });
      } catch {
        // ignore
      }
    }
    listeners.forEach((listener) => listener(type));
  }, 40);
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
        const deletedIds = getDeletedMuridIds();
        if (snapshot.empty) {
          if (cachedMuridList && cachedMuridList.length > 0) {
            StorageService.saveMuridList([], true, false);
          }
          return;
        }

        const remoteList: Murid[] = [];
        snapshot.forEach((docSnap) => {
          const m = docSnap.data() as Murid;
          if (m && m.id && m.nama) {
            const cleanKey = m.id.trim().toUpperCase();
            const docKey = docSnap.id.trim().toUpperCase();
            // Jika ID murid ini telah dipadamkan oleh pengguna, pastikan ia TIDAK dimasukkan dan padam dari Firestore
            if (deletedIds.has(cleanKey) || deletedIds.has(docKey)) {
              deleteDoc(docSnap.ref).catch(console.warn);
            } else {
              remoteList.push(m);
            }
          }
        });

        // Elakkan gelung kemas kini sekiranya tiada perubahan (menghentikan lagging & pembekuan)
        const currentLocal = StorageService.getMuridList();
        const hasChange =
          remoteList.length !== currentLocal.length ||
          remoteList.some((rm, idx) => {
            const lm = currentLocal[idx];
            return (
              !lm ||
              lm.id !== rm.id ||
              lm.nama !== rm.nama ||
              lm.kelas !== rm.kelas ||
              lm.rumahSukan !== rm.rumahSukan
            );
          });

        if (hasChange) {
          StorageService.saveMuridList(remoteList, true, false);
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
        if (snapshot.empty) {
          if (cachedPendaftaranList && cachedPendaftaranList.length > 0) {
            StorageService.savePendaftaranList([], true, false);
          }
          return;
        }

        const remoteList: PendaftaranAcara[] = [];
        snapshot.forEach((docSnap) => {
          const p = docSnap.data() as PendaftaranAcara;
          if (p && p.id && p.acaraId) {
            remoteList.push(p);
          }
        });

        // Elakkan gelung kemas kini sekiranya tiada perubahan
        const currentLocal = StorageService.getPendaftaranList();
        const hasChange =
          remoteList.length !== currentLocal.length ||
          remoteList.some((rp, idx) => {
            const lp = currentLocal[idx];
            return !lp || lp.id !== rp.id || lp.peserta?.length !== rp.peserta?.length;
          });

        if (hasChange) {
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
    if (cachedMuridList !== null) {
      return cachedMuridList;
    }
    try {
      const data = localStorage.getItem(KEY_MURID);
      if (!data) {
        cachedMuridList = [];
        return [];
      }
      const deletedIds = getDeletedMuridIds();
      const list = (JSON.parse(data) as Murid[]).filter((m) => !deletedIds.has(m.id));
      cachedMuridList = list;
      return list;
    } catch (e) {
      console.error('Gagal membaca senarai murid dari localStorage', e);
      cachedMuridList = [];
      return [];
    }
  },

  saveMuridList(list: Murid[], triggerNotify = true, syncToRemote = true): void {
    const deletedIds = getDeletedMuridIds();
    const cleanList = list.filter((m) => !deletedIds.has(m.id));
    cachedMuridList = cleanList;

    try {
      localStorage.setItem(KEY_MURID, JSON.stringify(cleanList));
      if (triggerNotify) {
        notifySync('murid');
      }
      if (syncToRemote) {
        this.syncLocalToFirestore(cleanList);
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

      // Pastikan ID ini tidak terhalang oleh tombstone lama
      unmarkDeletedMuridId(cleanId);

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
      const cleanId = item.id.trim();
      const key = cleanId.toUpperCase();
      unmarkDeletedMuridId(cleanId);

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
          id: cleanId,
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
    // 1. Masukkan ID ke dalam senarai tombstone supaya tidak pernah timbul semula
    addDeletedMuridIds([id]);

    // 2. Padam daripada senarai murid tempatan & cache
    const current = this.getMuridList();
    const filtered = current.filter((m) => m.id !== id);
    cachedMuridList = filtered;
    this.saveMuridList(filtered, true, false);

    // 3. Wajib keluarkan murid ini daripada SEMUA pendaftaran acara yang ada
    const allRegs = this.getPendaftaranList();
    let regUpdated = false;
    const cleanRegs: PendaftaranAcara[] = [];

    allRegs.forEach((reg) => {
      const hasPeserta = reg.peserta.some((p) => p.muridId === id || p.idPeserta === id);
      if (hasPeserta) {
        regUpdated = true;
        const bakiPeserta = reg.peserta.filter((p) => p.muridId !== id && p.idPeserta !== id);
        if (bakiPeserta.length > 0) {
          cleanRegs.push({ ...reg, peserta: bakiPeserta });
        } else {
          // Jika tiada lagi peserta dalam acara ini, padam terus dokumen pendaftaran
          try {
            const safeRegId = reg.id.replace(/[^a-zA-Z0-9_-]/g, '_');
            deleteDoc(doc(db, 'pendaftaran', safeRegId)).catch(console.warn);
          } catch {}
        }
      } else {
        cleanRegs.push(reg);
      }
    });

    if (regUpdated) {
      this.savePendaftaranList(cleanRegs, true, true);
    }

    // 4. Padam daripada Firestore serta merta tanpa lagging muat turun seluruh koleksi
    try {
      const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '_');
      deleteDoc(doc(db, 'murid', safeId)).catch(console.warn);
      if (id !== safeId) {
        deleteDoc(doc(db, 'murid', id)).catch(console.warn);
      }
    } catch (err) {
      console.warn('Error deleting murid from Firestore:', err);
    }
  },

  deleteMuridBatch(ids: string[]): { dipadam: number; baki: number } {
    if (!ids || ids.length === 0) return { dipadam: 0, baki: this.getMuridList().length };

    const idSet = new Set(ids);
    addDeletedMuridIds(ids);

    const current = this.getMuridList();
    const filtered = current.filter((m) => !idSet.has(m.id));
    const dipadam = current.length - filtered.length;
    cachedMuridList = filtered;
    this.saveMuridList(filtered, true, false);

    // Keluarkan semua murid yang dipilih daripada senarai pendaftaran
    const allRegs = this.getPendaftaranList();
    let regUpdated = false;
    const cleanRegs: PendaftaranAcara[] = [];

    allRegs.forEach((reg) => {
      const hasPeserta = reg.peserta.some((p) => idSet.has(p.muridId) || (p.idPeserta && idSet.has(p.idPeserta)));
      if (hasPeserta) {
        regUpdated = true;
        const bakiPeserta = reg.peserta.filter((p) => !idSet.has(p.muridId) && (!p.idPeserta || !idSet.has(p.idPeserta)));
        if (bakiPeserta.length > 0) {
          cleanRegs.push({ ...reg, peserta: bakiPeserta });
        } else {
          try {
            const safeRegId = reg.id.replace(/[^a-zA-Z0-9_-]/g, '_');
            deleteDoc(doc(db, 'pendaftaran', safeRegId)).catch(console.warn);
          } catch {}
        }
      } else {
        cleanRegs.push(reg);
      }
    });

    if (regUpdated) {
      this.savePendaftaranList(cleanRegs, true, true);
    }

    // Delete in batches from Firestore
    try {
      const batch = writeBatch(db);
      ids.forEach((id) => {
        const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '_');
        batch.delete(doc(db, 'murid', safeId));
      });
      batch.commit().catch(console.warn);
    } catch (err) {
      console.warn('Error deleting murid batch from Firestore:', err);
    }

    return { dipadam, baki: filtered.length };
  },

  resetSampleMurid(): void {
    this.saveMuridList(INITIAL_STUDENTS, true, true);
  },

  clearAllMurid(): void {
    const current = this.getMuridList();
    addDeletedMuridIds(current.map((m) => m.id));
    cachedMuridList = [];
    this.saveMuridList([], true, false);

    // Padam semua pendaftaran juga supaya tiada rekod lama berlegar
    this.savePendaftaranList([], true, false);

    // Delete all documents in Firestore murid collection & pendaftaran
    try {
      getDocs(collection(db, 'murid')).then((snap) => {
        if (!snap.empty) {
          const batch = writeBatch(db);
          snap.forEach((d) => batch.delete(d.ref));
          batch.commit().catch(console.warn);
        }
      }).catch(console.warn);

      getDocs(collection(db, 'pendaftaran')).then((snap) => {
        if (!snap.empty) {
          const batch = writeBatch(db);
          snap.forEach((d) => batch.delete(d.ref));
          batch.commit().catch(console.warn);
        }
      }).catch(console.warn);
    } catch (err) {
      console.warn('Error clearing remote murid collection:', err);
    }
  },

  clearAllPendaftaran(): void {
    cachedPendaftaranList = [];
    this.savePendaftaranList([], true, false);
    try {
      getDocs(collection(db, 'pendaftaran')).then((snap) => {
        if (!snap.empty) {
          const batch = writeBatch(db);
          snap.forEach((d) => batch.delete(d.ref));
          batch.commit().catch(console.warn);
        }
      }).catch(console.warn);
    } catch (err) {
      console.warn('Error clearing remote pendaftaran collection:', err);
    }
  },

  // Acara API (Cached for maximum performance)
  getAcaraList(): AcaraSukan[] {
    if (cachedAcaraList !== null) {
      return cachedAcaraList;
    }
    try {
      const data = localStorage.getItem(KEY_ACARA);
      let list = DEFAULT_ACARA;
      if (data) {
        list = JSON.parse(data) as AcaraSukan[];
      }
      const sorted = list.sort((a, b) => {
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
      cachedAcaraList = sorted;
      return sorted;
    } catch {
      cachedAcaraList = DEFAULT_ACARA;
      return DEFAULT_ACARA;
    }
  },

  saveAcaraList(list: AcaraSukan[], triggerNotify = true): void {
    cachedAcaraList = list;
    try {
      localStorage.setItem(KEY_ACARA, JSON.stringify(list));
      if (triggerNotify) {
        notifySync('acara');
      }
    } catch (e) {
      console.error('Gagal menyimpan acara', e);
    }
  },

  resetToDefaultAcara(): AcaraSukan[] {
    this.saveAcaraList(DEFAULT_ACARA, true);
    return DEFAULT_ACARA;
  },

  tambahAcara(acara: Omit<AcaraSukan, 'id'>): AcaraSukan {
    const list = this.getAcaraList();
    const newAcara: AcaraSukan = {
      ...acara,
      id: `acara-manual-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    list.push(newAcara);
    this.saveAcaraList(list, true);
    return newAcara;
  },

  kemaskiniAcara(acaraKemaskini: AcaraSukan): void {
    const list = this.getAcaraList();
    const idx = list.findIndex((a) => a.id === acaraKemaskini.id);
    if (idx !== -1) {
      list[idx] = acaraKemaskini;
    } else {
      list.push(acaraKemaskini);
    }
    this.saveAcaraList(list, true);
  },

  padamAcara(id: string): void {
    const list = this.getAcaraList();
    const filtered = list.filter((a) => a.id !== id);
    this.saveAcaraList(filtered, true);
  },

  // Pendaftaran API (Cached for instant responsiveness)
  getPendaftaranList(): PendaftaranAcara[] {
    if (cachedPendaftaranList !== null) {
      return cachedPendaftaranList;
    }
    try {
      const data = localStorage.getItem(KEY_PENDAFTARAN);
      if (!data) {
        cachedPendaftaranList = [];
        return [];
      }
      const list = JSON.parse(data) as PendaftaranAcara[];
      cachedPendaftaranList = list;
      return list;
    } catch {
      cachedPendaftaranList = [];
      return [];
    }
  },

  savePendaftaranList(list: PendaftaranAcara[], triggerNotify = true, syncToRemote = true): void {
    cachedPendaftaranList = list;
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
    cachedPendaftaranList = filtered;
    this.savePendaftaranList(filtered, true, false);

    // Also delete from Firestore instantly without full collection query
    try {
      const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '_');
      deleteDoc(doc(db, 'pendaftaran', safeId)).catch((error) => {
        handleFirestoreError(error, OperationType.DELETE, `pendaftaran/${safeId}`);
      });
      if (id !== safeId) {
        deleteDoc(doc(db, 'pendaftaran', id)).catch(console.warn);
      }
    } catch (error) {
      console.warn('Failed to delete pendaftaran from Firestore:', error);
    }
  },
};

