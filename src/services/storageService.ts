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
import { AcaraSukan, Jantina, Murid, PendaftaranAcara, RumahSukan } from '../types';
import { auth, db, testFirestoreConnection } from './firebase';

const KEY_MURID = 'sukan_sekolah_murid_v7';
const KEY_PENDAFTARAN = 'sukan_sekolah_pendaftaran_v4';
const KEY_ACARA = 'sukan_sekolah_acara_v5';
const KEY_DELETED_MURID_IDS = 'sukan_sk_tudan_deleted_ids_v5';
const KEY_DELETED_PENDAFTARAN_IDS = 'sukan_sk_tudan_deleted_pendaftaran_ids_v2';

// Purge obsolete local storage caches from earlier versions so stale data never persists
if (typeof window !== 'undefined') {
  try {
    [
      'sukan_sekolah_murid_v1',
      'sukan_sekolah_murid_v2',
      'sukan_sekolah_murid_v3',
      'sukan_sekolah_murid_v4',
      'sukan_sekolah_murid_v5',
      'sukan_sekolah_murid_v6',
      'sukan_sk_tudan_deleted_ids_v1',
      'sukan_sk_tudan_deleted_ids_v2',
      'sukan_sk_tudan_deleted_ids_v3',
      'sukan_sk_tudan_deleted_ids_v4',
    ].forEach((k) => localStorage.removeItem(k));
  } catch {}
}

// In-memory cache for ultra-fast zero-lag access
let cachedMuridList: Murid[] | null = null;
let cachedAcaraList: AcaraSukan[] | null = null;
let cachedPendaftaranList: PendaftaranAcara[] | null = null;

/**
 * Pembersihan objek sebelum disimpan ke Firestore
 * Membuang sebarang nilai 'undefined' yang menyebabkan ralat Firestore
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) return data;
  return JSON.parse(JSON.stringify(data));
}

// Tombstone pengesanan murid yang telah dipadam secara jelas oleh pengguna
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

// Tombstone pengesanan pendaftaran yang telah dipadam secara jelas
export function getDeletedPendaftaranIds(): Set<string> {
  try {
    const data = localStorage.getItem(KEY_DELETED_PENDAFTARAN_IDS);
    if (!data) return new Set();
    const arr = JSON.parse(data) as string[];
    return new Set(arr.map((id) => (id || '').trim()));
  } catch {
    return new Set();
  }
}

export function addDeletedPendaftaranIds(ids: string[]): void {
  try {
    const set = getDeletedPendaftaranIds();
    ids.forEach((id) => {
      if (id && id.trim()) {
        set.add(id.trim());
      }
    });
    localStorage.setItem(KEY_DELETED_PENDAFTARAN_IDS, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.warn('Failed to store deleted pendaftaran ids', e);
  }
}

export function unmarkDeletedPendaftaranId(id: string): void {
  try {
    const set = getDeletedPendaftaranIds();
    const key = (id || '').trim();
    if (set.has(key)) {
      set.delete(key);
      localStorage.setItem(KEY_DELETED_PENDAFTARAN_IDS, JSON.stringify(Array.from(set)));
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
  console.warn('Firestore Notice: ', JSON.stringify(errInfo));
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

  // 1. Listen to remote 'murid' collection across ALL devices in real-time
  try {
    const muridCol = collection(db, 'murid');
    onSnapshot(
      muridCol,
      (snapshot) => {
        // Jika Firestore kosong (semua murid dipadam atau belum dimuat naik), kosongkan cache pada SEMUA peranti
        if (snapshot.empty) {
          cachedMuridList = [];
          try {
            localStorage.setItem(KEY_MURID, JSON.stringify([]));
          } catch {}
          notifySync('murid');
          return;
        }

        const remoteMap = new Map<string, Murid>();
        snapshot.forEach((docSnap) => {
          const raw = docSnap.data() as Partial<Murid>;
          const cleanId = (raw.id || docSnap.id || '').trim();
          if (cleanId && raw.nama) {
            remoteMap.set(cleanId.toUpperCase(), {
              id: cleanId,
              nama: raw.nama,
              tahun: raw.tahun !== undefined ? Number(raw.tahun) : 1,
              kelas: raw.kelas || '',
              jantina: (raw.jantina as Jantina) || 'Lelaki',
              rumahSukan: (raw.rumahSukan as RumahSukan) || 'Merah',
              idPeserta: raw.idPeserta || cleanId,
              noPengenalan: raw.noPengenalan || raw.noSijilLahir || '',
              noSijilLahir: raw.noSijilLahir || raw.noPengenalan || '',
              tarikhLahir: raw.tarikhLahir || '',
              tarikhDicipta: raw.tarikhDicipta || new Date().toISOString(),
              tarikhKemaskini: raw.tarikhKemaskini || new Date().toISOString(),
            });
          }
        });

        const remoteList = Array.from(remoteMap.values());
        remoteList.sort((a, b) => a.nama.localeCompare(b.nama, 'ms', { sensitivity: 'base' }));

        cachedMuridList = remoteList;
        try {
          localStorage.setItem(KEY_MURID, JSON.stringify(remoteList));
        } catch {}
        notifySync('murid');
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'murid');
      }
    );
  } catch (error) {
    console.warn('Failed to attach murid snapshot listener:', error);
  }

  // 2. Listen to remote 'pendaftaran' collection across ALL devices in real-time
  try {
    const pendaftaranCol = collection(db, 'pendaftaran');
    onSnapshot(
      pendaftaranCol,
      (snapshot) => {
        if (snapshot.empty) {
          cachedPendaftaranList = [];
          try {
            localStorage.setItem(KEY_PENDAFTARAN, JSON.stringify([]));
          } catch {}
          notifySync('pendaftaran');
          return;
        }

        const remoteMap = new Map<string, PendaftaranAcara>();
        snapshot.forEach((docSnap) => {
          const raw = docSnap.data() as Partial<PendaftaranAcara>;
          const cleanId = (raw.id || docSnap.id || '').trim();
          if (cleanId && raw.acaraId && Array.isArray(raw.peserta)) {
            remoteMap.set(cleanId, {
              id: cleanId,
              acaraId: raw.acaraId,
              acaraNama: raw.acaraNama || '',
              rumahSukan: (raw.rumahSukan as RumahSukan) || 'Merah',
              peserta: raw.peserta,
              tarikhDaftar: raw.tarikhDaftar || new Date().toISOString(),
              catatan: raw.catatan || '',
            });
          }
        });

        const remoteList = Array.from(remoteMap.values());
        remoteList.sort((a, b) => {
          const timeA = new Date(a.tarikhDaftar || 0).getTime();
          const timeB = new Date(b.tarikhDaftar || 0).getTime();
          return timeB - timeA;
        });

        cachedPendaftaranList = remoteList;
        try {
          localStorage.setItem(KEY_PENDAFTARAN, JSON.stringify(remoteList));
        } catch {}
        notifySync('pendaftaran');
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
      const list = JSON.parse(data) as Murid[];
      cachedMuridList = list;
      return list;
    } catch (e) {
      console.error('Gagal membaca senarai murid dari localStorage', e);
      cachedMuridList = [];
      return [];
    }
  },

  saveMuridList(list: Murid[], triggerNotify = true, syncToRemote = true): void {
    cachedMuridList = list;

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
      for (let i = 0; i < list.length; i += 450) {
        const chunk = list.slice(i, i + 450);
        const batch = writeBatch(db);
        for (const m of chunk) {
          const safeId = m.id.replace(/[^a-zA-Z0-9_-]/g, '_');
          const ref = doc(db, 'murid', safeId);
          batch.set(ref, sanitizeForFirestore(m), { merge: true });
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

      unmarkDeletedMuridId(cleanId);

      formattedList.push({
        id: cleanId,
        nama: item.nama.trim(),
        tahun: item.tahun,
        kelas: item.kelas.trim(),
        jantina: item.jantina,
        rumahSukan: item.rumahSukan,
        noPengenalan: item.noPengenalan || item.noSijilLahir || undefined,
        noSijilLahir: item.noSijilLahir || item.noPengenalan || undefined,
        tarikhLahir: item.tarikhLahir || undefined,
        idPeserta: item.idPeserta || undefined,
        tarikhDicipta: now,
        tarikhKemaskini: now,
      });
    }

    // 1. Simpan serta merta ke localStorage dan cache
    this.saveMuridList(formattedList, true, false);

    // 2. Segerakkan ke Firestore
    try {
      const snap = await getDocs(collection(db, 'murid'));
      const newSafeIds = new Set(formattedList.map((m) => m.id.replace(/[^a-zA-Z0-9_-]/g, '_')));

      const obsoleteDocs = snap.docs.filter((d) => !newSafeIds.has(d.id));
      for (let i = 0; i < obsoleteDocs.length; i += 450) {
        const chunk = obsoleteDocs.slice(i, i + 450);
        const deleteBatch = writeBatch(db);
        chunk.forEach((d) => deleteBatch.delete(d.ref));
        await deleteBatch.commit();
      }

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

    const modifiedStudents: Murid[] = [];

    for (const item of newMuridList) {
      const cleanId = item.id.trim();
      const key = cleanId.toUpperCase();
      unmarkDeletedMuridId(cleanId);

      const existing = map.get(key);
      if (existing) {
        const updated: Murid = {
          ...existing,
          nama: item.nama.trim(),
          tahun: item.tahun,
          kelas: item.kelas.trim(),
          jantina: item.jantina,
          rumahSukan: item.rumahSukan,
          noPengenalan: item.noPengenalan || existing.noPengenalan || undefined,
          noSijilLahir: item.noSijilLahir || item.noPengenalan || existing.noSijilLahir || undefined,
          tarikhLahir: item.tarikhLahir || existing.tarikhLahir || undefined,
          idPeserta: item.idPeserta || existing.idPeserta || undefined,
          tarikhKemaskini: now,
        };
        map.set(key, updated);
        modifiedStudents.push(updated);
        dikemaskini++;
      } else {
        const created: Murid = {
          id: cleanId,
          nama: item.nama.trim(),
          tahun: item.tahun,
          kelas: item.kelas.trim(),
          jantina: item.jantina,
          rumahSukan: item.rumahSukan,
          noPengenalan: item.noPengenalan || item.noSijilLahir || undefined,
          noSijilLahir: item.noSijilLahir || item.noPengenalan || undefined,
          tarikhLahir: item.tarikhLahir || undefined,
          idPeserta: item.idPeserta || undefined,
          tarikhDicipta: now,
          tarikhKemaskini: now,
        };
        map.set(key, created);
        modifiedStudents.push(created);
        ditambah++;
      }
    }

    const updatedList = Array.from(map.values());
    this.saveMuridList(updatedList, true, false);

    // Sync hanya murid yang ditambah / dikemaskini bagi mengelakkan bebanan Firestore
    if (modifiedStudents.length > 0) {
      this.syncLocalToFirestore(modifiedStudents);
    }

    return { ditambah, dikemaskini, total: updatedList.length };
  },

  deleteMurid(id: string): void {
    addDeletedMuridIds([id]);

    const current = this.getMuridList();
    const filtered = current.filter((m) => m.id !== id);
    cachedMuridList = filtered;
    this.saveMuridList(filtered, true, false);

    // Keluarkan murid ini daripada semua pendaftaran acara
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

    // Padam daripada Firestore
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

    // Keluarkan murid daripada senarai pendaftaran
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

  async clearAllMurid(): Promise<void> {
    cachedMuridList = [];
    this.saveMuridList([], true, false);

    try {
      localStorage.removeItem(KEY_DELETED_MURID_IDS);
    } catch {}

    // Padam dokumen murid dalam Firestore secara batch 450
    try {
      const snap = await getDocs(collection(db, 'murid'));
      if (!snap.empty) {
        const docs = snap.docs;
        for (let i = 0; i < docs.length; i += 450) {
          const chunk = docs.slice(i, i + 450);
          const batch = writeBatch(db);
          chunk.forEach((d) => batch.delete(d.ref));
          await batch.commit();
        }
      }
    } catch (err) {
      console.warn('Error clearing remote murid collection:', err);
    }
  },

  async clearAllPendaftaran(): Promise<void> {
    cachedPendaftaranList = [];
    this.savePendaftaranList([], true, false);

    try {
      localStorage.removeItem(KEY_DELETED_PENDAFTARAN_IDS);
    } catch {}

    try {
      const snap = await getDocs(collection(db, 'pendaftaran'));
      if (!snap.empty) {
        const docs = snap.docs;
        for (let i = 0; i < docs.length; i += 450) {
          const chunk = docs.slice(i, i + 450);
          const batch = writeBatch(db);
          chunk.forEach((d) => batch.delete(d.ref));
          await batch.commit();
        }
      }
    } catch (err) {
      console.warn('Error clearing remote pendaftaran collection:', err);
    }
  },

  // Segerak paksa merentas semua peranti dari pelayan awan Firestore
  async forcePullFromRemote(): Promise<{ muridCount: number; pendaftaranCount: number }> {
    try {
      const muridSnap = await getDocs(collection(db, 'murid'));
      const remoteMurid: Murid[] = [];
      muridSnap.forEach((docSnap) => {
        const raw = docSnap.data() as Partial<Murid>;
        const cleanId = (raw.id || docSnap.id || '').trim();
        if (cleanId && raw.nama) {
          remoteMurid.push({
            id: cleanId,
            nama: raw.nama,
            tahun: raw.tahun !== undefined ? Number(raw.tahun) : 1,
            kelas: raw.kelas || '',
            jantina: (raw.jantina as Jantina) || 'Lelaki',
            rumahSukan: (raw.rumahSukan as RumahSukan) || 'Merah',
            idPeserta: raw.idPeserta || cleanId,
            noPengenalan: raw.noPengenalan || raw.noSijilLahir || '',
            noSijilLahir: raw.noSijilLahir || raw.noPengenalan || '',
            tarikhLahir: raw.tarikhLahir || '',
            tarikhDicipta: raw.tarikhDicipta || new Date().toISOString(),
            tarikhKemaskini: raw.tarikhKemaskini || new Date().toISOString(),
          });
        }
      });
      remoteMurid.sort((a, b) => a.nama.localeCompare(b.nama, 'ms', { sensitivity: 'base' }));
      cachedMuridList = remoteMurid;
      try {
        localStorage.setItem(KEY_MURID, JSON.stringify(remoteMurid));
      } catch {}
      notifySync('murid');

      const pendaftaranSnap = await getDocs(collection(db, 'pendaftaran'));
      const remotePendaftaran: PendaftaranAcara[] = [];
      pendaftaranSnap.forEach((docSnap) => {
        const raw = docSnap.data() as Partial<PendaftaranAcara>;
        const cleanId = (raw.id || docSnap.id || '').trim();
        if (cleanId && raw.acaraId && Array.isArray(raw.peserta)) {
          remotePendaftaran.push({
            id: cleanId,
            acaraId: raw.acaraId,
            acaraNama: raw.acaraNama || '',
            rumahSukan: (raw.rumahSukan as RumahSukan) || 'Merah',
            peserta: raw.peserta,
            tarikhDaftar: raw.tarikhDaftar || new Date().toISOString(),
            catatan: raw.catatan || '',
          });
        }
      });
      remotePendaftaran.sort((a, b) => {
        const timeA = new Date(a.tarikhDaftar || 0).getTime();
        const timeB = new Date(b.tarikhDaftar || 0).getTime();
        return timeB - timeA;
      });
      cachedPendaftaranList = remotePendaftaran;
      try {
        localStorage.setItem(KEY_PENDAFTARAN, JSON.stringify(remotePendaftaran));
      } catch {}
      notifySync('pendaftaran');

      return { muridCount: remoteMurid.length, pendaftaranCount: remotePendaftaran.length };
    } catch (err) {
      console.error('Error in forcePullFromRemote:', err);
      return { muridCount: cachedMuridList?.length || 0, pendaftaranCount: cachedPendaftaranList?.length || 0 };
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
        this.syncPendaftaranToFirestore(list);
      }
    } catch (e) {
      console.error('Gagal menyimpan pendaftaran', e);
    }
  },

  async syncPendaftaranToFirestore(list: PendaftaranAcara[]): Promise<void> {
    try {
      for (let i = 0; i < list.length; i += 450) {
        const chunk = list.slice(i, i + 450);
        const batch = writeBatch(db);
        for (const p of chunk) {
          const safeId = p.id.replace(/[^a-zA-Z0-9_-]/g, '_');
          const ref = doc(db, 'pendaftaran', safeId);
          batch.set(ref, sanitizeForFirestore(p), { merge: true });
        }
        await batch.commit();
      }
    } catch (err) {
      console.warn('Error batch syncing pendaftaran to Firestore:', err);
    }
  },

  async tambahPendaftaran(pendaftaran: Omit<PendaftaranAcara, 'id' | 'tarikhDaftar'>): Promise<PendaftaranAcara> {
    const list = this.getPendaftaranList();
    const newEntry: PendaftaranAcara = {
      ...pendaftaran,
      id: `REG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tarikhDaftar: new Date().toISOString(),
    };

    // Pastikan sebarang peserta yang didaftarkan juga direkodkan ke dalam muridList
    if (newEntry.peserta && newEntry.peserta.length > 0) {
      const currentMurid = this.getMuridList();
      const muridMap = new Map(currentMurid.map((m) => [m.id, m]));
      let hasNewMurid = false;
      const newMuridToAdd: Murid[] = [];

      newEntry.peserta.forEach((p) => {
        if (!muridMap.has(p.muridId)) {
          hasNewMurid = true;
          newMuridToAdd.push({
            id: p.muridId,
            idPeserta: p.idPeserta || p.muridId,
            nama: p.nama,
            tahun: p.tahun,
            kelas: p.kelas,
            jantina: p.jantina,
            rumahSukan: p.rumahSukan,
            tarikhDicipta: new Date().toISOString(),
            tarikhKemaskini: new Date().toISOString(),
          });
        }
      });

      if (hasNewMurid && newMuridToAdd.length > 0) {
        this.upsertMuridBatch(newMuridToAdd);
      }
    }

    // Nyah-tanda daripada senarai dipadam
    unmarkDeletedPendaftaranId(newEntry.id);

    // Masukkan ke bahagian atas senarai pendaftaran tempatan
    list.unshift(newEntry);
    this.savePendaftaranList(list, true, false);

    // Simpan terus ke Firestore dengan pembersihan data
    try {
      const safeId = newEntry.id.replace(/[^a-zA-Z0-9_-]/g, '_');
      const cleanData = sanitizeForFirestore(newEntry);
      await setDoc(doc(db, 'pendaftaran', safeId), cleanData);
      console.log('Pendaftaran berjaya disimpan ke Firestore:', safeId);
    } catch (error) {
      console.error('Ralat simpan pendaftaran ke Firestore:', error);
      handleFirestoreError(error, OperationType.WRITE, `pendaftaran/${newEntry.id}`);
    }

    return newEntry;
  },

  padamPendaftaran(id: string): void {
    addDeletedPendaftaranIds([id]);
    const list = this.getPendaftaranList();
    const filtered = list.filter((p) => p.id !== id);
    cachedPendaftaranList = filtered;
    this.savePendaftaranList(filtered, true, false);

    // Padam daripada Firestore
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
