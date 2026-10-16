export type RumahSukan = 'Merah' | 'Kuning' | 'Hijau' | 'Biru';

export type Jantina = 'Lelaki' | 'Perempuan';

export interface RumahInfo {
  id: RumahSukan;
  namaPenuh: string;
  namaRumah: string;
  warnaTema: string;
  badgeClass: string;
  bgLightClass: string;
  borderClass: string;
  textClass: string;
  gradientClass: string;
  maskot: string;
}

export interface Murid {
  id: string; // ID Murid
  nama: string; // Nama Murid
  tahun: number; // Tahun (1 - 6)
  kelas: string; // Kelas (contoh: 3 Fleksibel, 3 Cemerlang)
  jantina: Jantina; // Lelaki atau Perempuan
  rumahSukan: RumahSukan; // Merah, Kuning, Hijau, Biru
  tarikhDicipta?: string;
  tarikhKemaskini?: string;
}

export type JenisAcara = 'Individu' | 'Berkumpulan';
export type KategoriJantinaAcara = 'Lelaki' | 'Perempuan' | 'Terbuka';
export type KategoriAcara = 'Balapan' | 'Padang' | 'Sukaneka' | 'Pra Sekolah';

export interface AcaraSukan {
  id: string;
  nama: string;
  kod: string;
  kategori: KategoriAcara;
  kategoriJantina: KategoriJantinaAcara;
  tahunKelayakan: number[]; // 0 untuk Pra Sekolah, 1, 2, 3, 4, 5, 6
  jenis: JenisAcara;
  bilanganAhli: number; // 1 untuk Individu; 4 untuk 4x100m, 6 untuk Sukaneka (5 pemain + 1 simpanan)
  masa?: string; // cth: '07:30', '08:00'
  catatan?: string; // cth: 'AKHIR', '5 Pemain + 1 Simpanan'
  penerangan?: string;
  hadMaksimumPasukanPerRumah?: number;
}

export interface PesertaPendaftaran {
  muridId: string;
  nama: string;
  tahun: number;
  kelas: string;
  jantina: Jantina;
  rumahSukan: RumahSukan;
  peranan?: string; // cth: 'Pemain 1', 'Pemain Simpanan', 'Pelari 1'
  isSimpanan?: boolean;
}

export interface PendaftaranAcara {
  id: string;
  acaraId: string;
  acaraNama: string;
  rumahSukan: RumahSukan;
  peserta: PesertaPendaftaran[];
  tarikhDaftar: string;
  catatan?: string;
}

export interface RekodPratontonMurid {
  baris: number;
  idMurid: string;
  nama: string;
  tahun: string | number;
  kelas: string;
  jantina: string;
  rumahSukan: string;
  ralat: string[];
  amaran: string[];
  status: 'sah' | 'ralat' | 'kemaskini';
}

export interface HasilPratontonMuatNaik {
  jumlahBaris: number;
  jumlahSah: number;
  jumlahRalat: number;
  jumlahKemaskini: number;
  rekod: RekodPratontonMurid[];
  senaraiLembaran?: string[];
  lembaranDipilih?: string;
}
