import { AcaraSukan, Murid, RumahInfo, RumahSukan } from '../types';
import { SENARAI_ACARA_SK_TUDAN_2026 } from './acaraTudan2026';

export const SENARAI_RUMAH: Record<RumahSukan, RumahInfo> = {
  Merah: {
    id: 'Merah',
    namaPenuh: 'Rumah Merah',
    namaRumah: 'Rumah Merah',
    warnaTema: '#ef4444',
    badgeClass: 'bg-red-100 text-red-800 border-red-300',
    bgLightClass: 'bg-red-50',
    borderClass: 'border-red-500',
    textClass: 'text-red-600',
    gradientClass: 'from-red-600 to-rose-700',
    maskot: 'Warna Merah'
  },
  Kuning: {
    id: 'Kuning',
    namaPenuh: 'Rumah Kuning',
    namaRumah: 'Rumah Kuning',
    warnaTema: '#eab308',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    bgLightClass: 'bg-amber-50',
    borderClass: 'border-amber-500',
    textClass: 'text-amber-600',
    gradientClass: 'from-amber-500 to-yellow-600',
    maskot: 'Warna Kuning'
  },
  Hijau: {
    id: 'Hijau',
    namaPenuh: 'Rumah Hijau',
    namaRumah: 'Rumah Hijau',
    warnaTema: '#10b981',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    bgLightClass: 'bg-emerald-50',
    borderClass: 'border-emerald-500',
    textClass: 'text-emerald-600',
    gradientClass: 'from-emerald-600 to-teal-700',
    maskot: 'Warna Hijau'
  },
  Biru: {
    id: 'Biru',
    namaPenuh: 'Rumah Biru',
    namaRumah: 'Rumah Biru',
    warnaTema: '#3b82f6',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    bgLightClass: 'bg-blue-50',
    borderClass: 'border-blue-500',
    textClass: 'text-blue-600',
    gradientClass: 'from-blue-600 to-indigo-700',
    maskot: 'Warna Biru'
  }
};

export const SENARAI_RUMAH_KEYS: RumahSukan[] = ['Merah', 'Kuning', 'Hijau', 'Biru'];

export const SENARAI_ALIRAN_KELAS = ['Arif', 'Bestari', 'Cekal', 'Dinamik', 'Efisien', 'Fleksibel'];

export const SENARAI_KELAS_PRA = [
  'Pra Arif',
  'Pra Bestari',
  'Pra Cekal',
  'Pra Dinamik',
  'Pra Efisien',
  'Pra Fleksibel'
];

export const DEFAULT_ACARA: AcaraSukan[] = SENARAI_ACARA_SK_TUDAN_2026;

// Pangkalan data murid dikosongkan: Hanya murid yang didaftarkan nanti sahaja akan muncul dalam senarai mengikut Rumah Sukan.
export const INITIAL_STUDENTS: Murid[] = [];
