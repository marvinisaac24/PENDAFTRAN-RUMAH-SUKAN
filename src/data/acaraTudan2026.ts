import { AcaraSukan } from '../types';

/**
 * SENARAI ACARA MENGIKUT TAHUN DAN JANTINA
 * KEJOHANAN SUKAN OLAHRAGA SK TUDAN 2026
 *
 * Acara padang HANYA untuk Tahun 3, 4, dan 5 sahaja.
 * Prasekolah: Sukaneka Prasekolah
 * Tahun 1: Leret Bola dengan Gelung Plastik, Bawa Bola Ping Pong, 60m (L & P)
 * Tahun 2: Pindah Kon dari A ke B, Isi Air dalam Botol, 60m (L & P)
 * Tahun 3: Lompat Tinggi, Lontar Peluru, Lompat Jauh, 60m (L & P)
 * Tahun 4: Lompat Tinggi, Lontar Peluru, Lompat Jauh, 100m, 200m, 4x100m, 4x200m, Merentas Desa (5 pusingan) (L & P)
 * Tahun 5: Lompat Tinggi, Lontar Peluru, Lompat Jauh, 100m, 200m, 4x100m, 4x200m, Merentas Desa (5 pusingan) (L & P)
 * Tahun 6: 100m, 200m, 4x100m, 4x200m (L & P) - Tiada acara padang
 */
export const SENARAI_ACARA_SK_TUDAN_2026: AcaraSukan[] = [
  // ==============================================================
  // 1. PRASEKOLAH (Tahun 0, Terbuka)
  // ==============================================================
  {
    id: 'acara-pra-sukaneka',
    nama: 'Sukaneka Prasekolah',
    kod: 'PRA01',
    kategori: 'Pra Sekolah',
    kategoriMSSR: 'MSSR Prasekolah',
    kategoriJantina: 'Terbuka',
    tahunKelayakan: [0],
    jenis: 'Berkumpulan',
    bilanganAhli: 6,
    masa: '07:30',
    catatan: 'AKHIR (6 Peserta)',
    penerangan: 'Acara sukaneka prasekolah SK Tudan 2026 berkumpulan antara rumah sukan'
  },

  // ==============================================================
  // 2. TAHUN 1 - LELAKI
  // ==============================================================
  {
    id: 'acara-t1-sk-leret-bola-l',
    nama: 'Leret Bola dengan Gelung Plastik (Lelaki Tahun 1)',
    kod: 'SK1-L01',
    kategori: 'Sukaneka',
    kategoriMSSR: 'MSSR Tahap 1',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [1],
    jenis: 'Berkumpulan',
    bilanganAhli: 6,
    masa: '08:00',
    catatan: 'AKHIR (5 Pemain + 1 Simpanan)',
    penerangan: 'Sukaneka Tahun 1 Lelaki: Leret bola dengan gelung plastik'
  },
  {
    id: 'acara-t1-sk-pingpong-l',
    nama: 'Bawa Bola Ping Pong (Lelaki Tahun 1)',
    kod: 'SK1-L02',
    kategori: 'Sukaneka',
    kategoriMSSR: 'MSSR Tahap 1',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [1],
    jenis: 'Berkumpulan',
    bilanganAhli: 6,
    masa: '08:15',
    catatan: 'AKHIR (5 Pemain + 1 Simpanan)',
    penerangan: 'Sukaneka Tahun 1 Lelaki: Bawa bola ping pong dengan sudu'
  },
  {
    id: 'acara-t1-balapan-60m-l',
    nama: '60 Meter (Lelaki Tahun 1)',
    kod: 'B1-L01',
    kategori: 'Balapan',
    kategoriMSSR: 'MSSR Tahap 1',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [1],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '08:30',
    catatan: 'AKHIR (Pecut 60m)',
    penerangan: 'Acara balapan 60 meter lari pecut individu murid lelaki Tahun 1'
  },

  // ==============================================================
  // 3. TAHUN 1 - PEREMPUAN
  // ==============================================================
  {
    id: 'acara-t1-sk-leret-bola-p',
    nama: 'Leret Bola dengan Gelung Plastik (Perempuan Tahun 1)',
    kod: 'SK1-P01',
    kategori: 'Sukaneka',
    kategoriMSSR: 'MSSR Tahap 1',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [1],
    jenis: 'Berkumpulan',
    bilanganAhli: 6,
    masa: '08:45',
    catatan: 'AKHIR (5 Pemain + 1 Simpanan)',
    penerangan: 'Sukaneka Tahun 1 Perempuan: Leret bola dengan gelung plastik'
  },
  {
    id: 'acara-t1-sk-pingpong-p',
    nama: 'Bawa Bola Ping Pong (Perempuan Tahun 1)',
    kod: 'SK1-P02',
    kategori: 'Sukaneka',
    kategoriMSSR: 'MSSR Tahap 1',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [1],
    jenis: 'Berkumpulan',
    bilanganAhli: 6,
    masa: '09:00',
    catatan: 'AKHIR (5 Pemain + 1 Simpanan)',
    penerangan: 'Sukaneka Tahun 1 Perempuan: Bawa bola ping pong dengan sudu'
  },
  {
    id: 'acara-t1-balapan-60m-p',
    nama: '60 Meter (Perempuan Tahun 1)',
    kod: 'B1-P01',
    kategori: 'Balapan',
    kategoriMSSR: 'MSSR Tahap 1',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [1],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '09:15',
    catatan: 'AKHIR (Pecut 60m)',
    penerangan: 'Acara balapan 60 meter lari pecut individu murid perempuan Tahun 1'
  },

  // ==============================================================
  // 4. TAHUN 2 - LELAKI
  // ==============================================================
  {
    id: 'acara-t2-sk-pindah-kon-l',
    nama: 'Pindah Kon dari A ke B (Lelaki Tahun 2)',
    kod: 'SK2-L01',
    kategori: 'Sukaneka',
    kategoriMSSR: 'MSSR Tahap 1',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [2],
    jenis: 'Berkumpulan',
    bilanganAhli: 6,
    masa: '09:30',
    catatan: 'AKHIR (5 Pemain + 1 Simpanan)',
    penerangan: 'Sukaneka Tahun 2 Lelaki: Pindah kon dari A ke B'
  },
  {
    id: 'acara-t2-sk-isi-air-botol-l',
    nama: 'Isi Air dalam Botol (Lelaki Tahun 2)',
    kod: 'SK2-L02',
    kategori: 'Sukaneka',
    kategoriMSSR: 'MSSR Tahap 1',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [2],
    jenis: 'Berkumpulan',
    bilanganAhli: 6,
    masa: '09:45',
    catatan: 'AKHIR (5 Pemain + 1 Simpanan)',
    penerangan: 'Sukaneka Tahun 2 Lelaki: Mengisi air ke dalam botol dengan span'
  },
  {
    id: 'acara-t2-balapan-60m-l',
    nama: '60 Meter (Lelaki Tahun 2)',
    kod: 'B2-L01',
    kategori: 'Balapan',
    kategoriMSSR: 'MSSR Tahap 1',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [2],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '10:00',
    catatan: 'AKHIR (Pecut 60m)',
    penerangan: 'Acara balapan 60 meter lari pecut murid lelaki Tahun 2'
  },

  // ==============================================================
  // 5. TAHUN 2 - PEREMPUAN
  // ==============================================================
  {
    id: 'acara-t2-sk-pindah-kon-p',
    nama: 'Pindah Kon dari A ke B (Perempuan Tahun 2)',
    kod: 'SK2-P01',
    kategori: 'Sukaneka',
    kategoriMSSR: 'MSSR Tahap 1',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [2],
    jenis: 'Berkumpulan',
    bilanganAhli: 6,
    masa: '10:15',
    catatan: 'AKHIR (5 Pemain + 1 Simpanan)',
    penerangan: 'Sukaneka Tahun 2 Perempuan: Pindah kon dari A ke B'
  },
  {
    id: 'acara-t2-sk-isi-air-botol-p',
    nama: 'Isi Air dalam Botol (Perempuan Tahun 2)',
    kod: 'SK2-P02',
    kategori: 'Sukaneka',
    kategoriMSSR: 'MSSR Tahap 1',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [2],
    jenis: 'Berkumpulan',
    bilanganAhli: 6,
    masa: '10:30',
    catatan: 'AKHIR (5 Pemain + 1 Simpanan)',
    penerangan: 'Sukaneka Tahun 2 Perempuan: Mengisi air ke dalam botol dengan span'
  },
  {
    id: 'acara-t2-balapan-60m-p',
    nama: '60 Meter (Perempuan Tahun 2)',
    kod: 'B2-P01',
    kategori: 'Balapan',
    kategoriMSSR: 'MSSR Tahap 1',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [2],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '10:45',
    catatan: 'AKHIR (Pecut 60m)',
    penerangan: 'Acara balapan 60 meter lari pecut murid perempuan Tahun 2'
  },

  // ==============================================================
  // 6. TAHUN 3 - LELAKI (Padang & Balapan)
  // ==============================================================
  {
    id: 'acara-t3-lompat-tinggi-l',
    nama: 'Lompat Tinggi (Lelaki Tahun 3)',
    kod: 'P3-L01',
    kategori: 'Padang',
    kategoriMSSR: 'MSSR Tahap 2',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [3],
    jenis: 'Individu',
    bilanganAhli: 2,
    masa: '08:00',
    catatan: 'AKHIR Padang (1 Utama + 1 Simpanan)',
    penerangan: 'Acara padang lompat tinggi individu murid lelaki Tahun 3'
  },
  {
    id: 'acara-t3-lontar-peluru-l',
    nama: 'Lontar Peluru (Lelaki Tahun 3)',
    kod: 'P3-L02',
    kategori: 'Padang',
    kategoriMSSR: 'MSSR Tahap 2',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [3],
    jenis: 'Individu',
    bilanganAhli: 2,
    masa: '08:45',
    catatan: 'AKHIR Padang (1 Utama + 1 Simpanan)',
    penerangan: 'Acara padang lontar peluru individu murid lelaki Tahun 3'
  },
  {
    id: 'acara-t3-lompat-jauh-l',
    nama: 'Lompat Jauh (Lelaki Tahun 3)',
    kod: 'P3-L03',
    kategori: 'Padang',
    kategoriMSSR: 'MSSR Tahap 2',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [3],
    jenis: 'Individu',
    bilanganAhli: 2,
    masa: '09:30',
    catatan: 'AKHIR Padang (1 Utama + 1 Simpanan)',
    penerangan: 'Acara padang lompat jauh individu murid lelaki Tahun 3'
  },
  {
    id: 'acara-t3-balapan-60m-l',
    nama: '60 Meter (Lelaki Tahun 3)',
    kod: 'B3-L01',
    kategori: 'Balapan',
    kategoriMSSR: 'MSSR Tahap 2',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [3],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '11:00',
    catatan: 'AKHIR (Pecut 60m)',
    penerangan: 'Acara balapan 60 meter lari pecut murid lelaki Tahun 3'
  },

  // ==============================================================
  // 7. TAHUN 3 - PEREMPUAN (Padang & Balapan)
  // ==============================================================
  {
    id: 'acara-t3-lompat-tinggi-p',
    nama: 'Lompat Tinggi (Perempuan Tahun 3)',
    kod: 'P3-P01',
    kategori: 'Padang',
    kategoriMSSR: 'MSSR Tahap 2',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [3],
    jenis: 'Individu',
    bilanganAhli: 2,
    masa: '08:00',
    catatan: 'AKHIR Padang (1 Utama + 1 Simpanan)',
    penerangan: 'Acara padang lompat tinggi individu murid perempuan Tahun 3'
  },
  {
    id: 'acara-t3-lontar-peluru-p',
    nama: 'Lontar Peluru (Perempuan Tahun 3)',
    kod: 'P3-P02',
    kategori: 'Padang',
    kategoriMSSR: 'MSSR Tahap 2',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [3],
    jenis: 'Individu',
    bilanganAhli: 2,
    masa: '08:45',
    catatan: 'AKHIR Padang (1 Utama + 1 Simpanan)',
    penerangan: 'Acara padang lontar peluru individu murid perempuan Tahun 3'
  },
  {
    id: 'acara-t3-lompat-jauh-p',
    nama: 'Lompat Jauh (Perempuan Tahun 3)',
    kod: 'P3-P03',
    kategori: 'Padang',
    kategoriMSSR: 'MSSR Tahap 2',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [3],
    jenis: 'Individu',
    bilanganAhli: 2,
    masa: '09:30',
    catatan: 'AKHIR Padang (1 Utama + 1 Simpanan)',
    penerangan: 'Acara padang lompat jauh individu murid perempuan Tahun 3'
  },
  {
    id: 'acara-t3-balapan-60m-p',
    nama: '60 Meter (Perempuan Tahun 3)',
    kod: 'B3-P01',
    kategori: 'Balapan',
    kategoriMSSR: 'MSSR Tahap 2',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [3],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '11:15',
    catatan: 'AKHIR (Pecut 60m)',
    penerangan: 'Acara balapan 60 meter lari pecut murid perempuan Tahun 3'
  },

  // ==============================================================
  // 8. TAHUN 4 - LELAKI (Padang, Balapan & Merentas Desa)
  // ==============================================================
  {
    id: 'acara-t4-lompat-tinggi-l',
    nama: 'Lompat Tinggi (Lelaki Tahun 4)',
    kod: 'P4-L01',
    kategori: 'Padang',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [4],
    jenis: 'Individu',
    bilanganAhli: 2,
    masa: '08:00',
    catatan: 'AKHIR Padang (1 Utama + 1 Simpanan)',
    penerangan: 'Acara padang lompat tinggi individu murid lelaki Tahun 4'
  },
  {
    id: 'acara-t4-lontar-peluru-l',
    nama: 'Lontar Peluru (Lelaki Tahun 4)',
    kod: 'P4-L02',
    kategori: 'Padang',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [4],
    jenis: 'Individu',
    bilanganAhli: 2,
    masa: '08:45',
    catatan: 'AKHIR Padang (1 Utama + 1 Simpanan)',
    penerangan: 'Acara padang lontar peluru individu murid lelaki Tahun 4'
  },
  {
    id: 'acara-t4-lompat-jauh-l',
    nama: 'Lompat Jauh (Lelaki Tahun 4)',
    kod: 'P4-L03',
    kategori: 'Padang',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [4],
    jenis: 'Individu',
    bilanganAhli: 2,
    masa: '09:30',
    catatan: 'AKHIR Padang (1 Utama + 1 Simpanan)',
    penerangan: 'Acara padang lompat jauh individu murid lelaki Tahun 4'
  },
  {
    id: 'acara-t4-balapan-100m-l',
    nama: '100 Meter (Lelaki Tahun 4)',
    kod: 'B4-L01',
    kategori: 'Balapan',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [4],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '10:15',
    catatan: 'AKHIR',
    penerangan: 'Acara balapan 100 meter lari pecut murid lelaki Tahun 4'
  },
  {
    id: 'acara-t4-balapan-200m-l',
    nama: '200 Meter (Lelaki Tahun 4)',
    kod: 'B4-L02',
    kategori: 'Balapan',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [4],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '11:00',
    catatan: 'AKHIR',
    penerangan: 'Acara balapan 200 meter murid lelaki Tahun 4'
  },
  {
    id: 'acara-t4-balapan-4x100m-l',
    nama: '4 × 100 Meter (Lelaki Tahun 4)',
    kod: 'B4-L03',
    kategori: 'Balapan',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [4],
    jenis: 'Berkumpulan',
    bilanganAhli: 5,
    masa: '11:45',
    catatan: 'AKHIR (4 Pelari + 1 Simpanan)',
    penerangan: 'Acara lari berganti-ganti 4x100 meter lelaki Tahun 4'
  },
  {
    id: 'acara-t4-balapan-4x200m-l',
    nama: '4 × 200 Meter (Lelaki Tahun 4)',
    kod: 'B4-L04',
    kategori: 'Balapan',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [4],
    jenis: 'Berkumpulan',
    bilanganAhli: 5,
    masa: '14:00',
    catatan: 'AKHIR (4 Pelari + 1 Simpanan)',
    penerangan: 'Acara lari berganti-ganti 4x200 meter lelaki Tahun 4'
  },
  {
    id: 'acara-t4-merentas-desa-l',
    nama: 'Merentas Desa (5 pusingan) (Lelaki Tahun 4)',
    kod: 'B4-L05',
    kategori: 'Balapan',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [4],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '07:00',
    catatan: 'AKHIR (5 Pusingan)',
    penerangan: 'Acara larian merentas desa 5 pusingan murid lelaki Tahun 4'
  },

  // ==============================================================
  // 9. TAHUN 4 - PEREMPUAN (Padang, Balapan & Merentas Desa)
  // ==============================================================
  {
    id: 'acara-t4-lompat-tinggi-p',
    nama: 'Lompat Tinggi (Perempuan Tahun 4)',
    kod: 'P4-P01',
    kategori: 'Padang',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [4],
    jenis: 'Individu',
    bilanganAhli: 2,
    masa: '08:00',
    catatan: 'AKHIR Padang (1 Utama + 1 Simpanan)',
    penerangan: 'Acara padang lompat tinggi individu murid perempuan Tahun 4'
  },
  {
    id: 'acara-t4-lontar-peluru-p',
    nama: 'Lontar Peluru (Perempuan Tahun 4)',
    kod: 'P4-P02',
    kategori: 'Padang',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [4],
    jenis: 'Individu',
    bilanganAhli: 2,
    masa: '08:45',
    catatan: 'AKHIR Padang (1 Utama + 1 Simpanan)',
    penerangan: 'Acara padang lontar peluru individu murid perempuan Tahun 4'
  },
  {
    id: 'acara-t4-lompat-jauh-p',
    nama: 'Lompat Jauh (Perempuan Tahun 4)',
    kod: 'P4-P03',
    kategori: 'Padang',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [4],
    jenis: 'Individu',
    bilanganAhli: 2,
    masa: '09:30',
    catatan: 'AKHIR Padang (1 Utama + 1 Simpanan)',
    penerangan: 'Acara padang lompat jauh individu murid perempuan Tahun 4'
  },
  {
    id: 'acara-t4-balapan-100m-p',
    nama: '100 Meter (Perempuan Tahun 4)',
    kod: 'B4-P01',
    kategori: 'Balapan',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [4],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '10:30',
    catatan: 'AKHIR',
    penerangan: 'Acara balapan 100 meter lari pecut murid perempuan Tahun 4'
  },
  {
    id: 'acara-t4-balapan-200m-p',
    nama: '200 Meter (Perempuan Tahun 4)',
    kod: 'B4-P02',
    kategori: 'Balapan',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [4],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '11:15',
    catatan: 'AKHIR',
    penerangan: 'Acara balapan 200 meter murid perempuan Tahun 4'
  },
  {
    id: 'acara-t4-balapan-4x100m-p',
    nama: '4 × 100 Meter (Perempuan Tahun 4)',
    kod: 'B4-P03',
    kategori: 'Balapan',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [4],
    jenis: 'Berkumpulan',
    bilanganAhli: 5,
    masa: '12:00',
    catatan: 'AKHIR (4 Pelari + 1 Simpanan)',
    penerangan: 'Acara lari berganti-ganti 4x100 meter perempuan Tahun 4'
  },
  {
    id: 'acara-t4-balapan-4x200m-p',
    nama: '4 × 200 Meter (Perempuan Tahun 4)',
    kod: 'B4-P04',
    kategori: 'Balapan',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [4],
    jenis: 'Berkumpulan',
    bilanganAhli: 5,
    masa: '14:15',
    catatan: 'AKHIR (4 Pelari + 1 Simpanan)',
    penerangan: 'Acara lari berganti-ganti 4x200 meter perempuan Tahun 4'
  },
  {
    id: 'acara-t4-merentas-desa-p',
    nama: 'Merentas Desa (5 pusingan) (Perempuan Tahun 4)',
    kod: 'B4-P05',
    kategori: 'Balapan',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [4],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '07:15',
    catatan: 'AKHIR (5 Pusingan)',
    penerangan: 'Acara larian merentas desa 5 pusingan murid perempuan Tahun 4'
  },

  // ==============================================================
  // 10. TAHUN 5 - LELAKI (Padang, Balapan & Merentas Desa)
  // ==============================================================
  {
    id: 'acara-t5-lompat-tinggi-l',
    nama: 'Lompat Tinggi (Lelaki Tahun 5)',
    kod: 'P5-L01',
    kategori: 'Padang',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [5],
    jenis: 'Individu',
    bilanganAhli: 2,
    masa: '10:00',
    catatan: 'AKHIR Padang (1 Utama + 1 Simpanan)',
    penerangan: 'Acara padang lompat tinggi murid lelaki Tahun 5'
  },
  {
    id: 'acara-t5-lontar-peluru-l',
    nama: 'Lontar Peluru (Lelaki Tahun 5)',
    kod: 'P5-L02',
    kategori: 'Padang',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [5],
    jenis: 'Individu',
    bilanganAhli: 2,
    masa: '10:45',
    catatan: 'AKHIR Padang (1 Utama + 1 Simpanan)',
    penerangan: 'Acara padang lontar peluru murid lelaki Tahun 5'
  },
  {
    id: 'acara-t5-lompat-jauh-l',
    nama: 'Lompat Jauh (Lelaki Tahun 5)',
    kod: 'P5-L03',
    kategori: 'Padang',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [5],
    jenis: 'Individu',
    bilanganAhli: 2,
    masa: '11:30',
    catatan: 'AKHIR Padang (1 Utama + 1 Simpanan)',
    penerangan: 'Acara padang lompat jauh murid lelaki Tahun 5'
  },
  {
    id: 'acara-t5-balapan-100m-l',
    nama: '100 Meter (Lelaki Tahun 5)',
    kod: 'B5-L01',
    kategori: 'Balapan',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [5],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '13:30',
    catatan: 'AKHIR',
    penerangan: 'Acara balapan 100 meter lari pecut murid lelaki Tahun 5'
  },
  {
    id: 'acara-t5-balapan-200m-l',
    nama: '200 Meter (Lelaki Tahun 5)',
    kod: 'B5-L02',
    kategori: 'Balapan',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [5],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '14:00',
    catatan: 'AKHIR',
    penerangan: 'Acara balapan 200 meter murid lelaki Tahun 5'
  },
  {
    id: 'acara-t5-balapan-4x100m-l',
    nama: '4 × 100 Meter (Lelaki Tahun 5)',
    kod: 'B5-L03',
    kategori: 'Balapan',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [5],
    jenis: 'Berkumpulan',
    bilanganAhli: 5,
    masa: '14:30',
    catatan: 'AKHIR (4 Pelari + 1 Simpanan)',
    penerangan: 'Acara lari berganti-ganti 4x100 meter lelaki Tahun 5'
  },
  {
    id: 'acara-t5-balapan-4x200m-l',
    nama: '4 × 200 Meter (Lelaki Tahun 5)',
    kod: 'B5-L04',
    kategori: 'Balapan',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [5],
    jenis: 'Berkumpulan',
    bilanganAhli: 5,
    masa: '15:00',
    catatan: 'AKHIR (4 Pelari + 1 Simpanan)',
    penerangan: 'Acara lari berganti-ganti 4x200 meter lelaki Tahun 5'
  },
  {
    id: 'acara-t5-merentas-desa-l',
    nama: 'Merentas Desa (5 pusingan) (Lelaki Tahun 5)',
    kod: 'B5-L05',
    kategori: 'Balapan',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [5],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '07:30',
    catatan: 'AKHIR (5 Pusingan)',
    penerangan: 'Acara larian merentas desa 5 pusingan murid lelaki Tahun 5'
  },

  // ==============================================================
  // 11. TAHUN 5 - PEREMPUAN (Padang, Balapan & Merentas Desa)
  // ==============================================================
  {
    id: 'acara-t5-lompat-tinggi-p',
    nama: 'Lompat Tinggi (Perempuan Tahun 5)',
    kod: 'P5-P01',
    kategori: 'Padang',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [5],
    jenis: 'Individu',
    bilanganAhli: 2,
    masa: '10:00',
    catatan: 'AKHIR Padang (1 Utama + 1 Simpanan)',
    penerangan: 'Acara padang lompat tinggi individu murid perempuan Tahun 5'
  },
  {
    id: 'acara-t5-lontar-peluru-p',
    nama: 'Lontar Peluru (Perempuan Tahun 5)',
    kod: 'P5-P02',
    kategori: 'Padang',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [5],
    jenis: 'Individu',
    bilanganAhli: 2,
    masa: '10:45',
    catatan: 'AKHIR Padang (1 Utama + 1 Simpanan)',
    penerangan: 'Acara padang lontar peluru individu murid perempuan Tahun 5'
  },
  {
    id: 'acara-t5-lompat-jauh-p',
    nama: 'Lompat Jauh (Perempuan Tahun 5)',
    kod: 'P5-P03',
    kategori: 'Padang',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [5],
    jenis: 'Individu',
    bilanganAhli: 2,
    masa: '11:30',
    catatan: 'AKHIR Padang (1 Utama + 1 Simpanan)',
    penerangan: 'Acara padang lompat jauh individu murid perempuan Tahun 5'
  },
  {
    id: 'acara-t5-balapan-100m-p',
    nama: '100 Meter (Perempuan Tahun 5)',
    kod: 'B5-P01',
    kategori: 'Balapan',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [5],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '13:45',
    catatan: 'AKHIR',
    penerangan: 'Acara balapan 100 meter lari pecut murid perempuan Tahun 5'
  },
  {
    id: 'acara-t5-balapan-200m-p',
    nama: '200 Meter (Perempuan Tahun 5)',
    kod: 'B5-P02',
    kategori: 'Balapan',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [5],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '14:15',
    catatan: 'AKHIR',
    penerangan: 'Acara balapan 200 meter murid perempuan Tahun 5'
  },
  {
    id: 'acara-t5-balapan-4x100m-p',
    nama: '4 × 100 Meter (Perempuan Tahun 5)',
    kod: 'B5-P03',
    kategori: 'Balapan',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [5],
    jenis: 'Berkumpulan',
    bilanganAhli: 5,
    masa: '14:45',
    catatan: 'AKHIR (4 Pelari + 1 Simpanan)',
    penerangan: 'Acara lari berganti-ganti 4x100 meter perempuan Tahun 5'
  },
  {
    id: 'acara-t5-balapan-4x200m-p',
    nama: '4 × 200 Meter (Perempuan Tahun 5)',
    kod: 'B5-P04',
    kategori: 'Balapan',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [5],
    jenis: 'Berkumpulan',
    bilanganAhli: 5,
    masa: '15:15',
    catatan: 'AKHIR (4 Pelari + 1 Simpanan)',
    penerangan: 'Acara lari berganti-ganti 4x200 meter perempuan Tahun 5'
  },
  {
    id: 'acara-t5-merentas-desa-p',
    nama: 'Merentas Desa (5 pusingan) (Perempuan Tahun 5)',
    kod: 'B5-P05',
    kategori: 'Balapan',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [5],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '07:45',
    catatan: 'AKHIR (5 Pusingan)',
    penerangan: 'Acara larian merentas desa 5 pusingan murid perempuan Tahun 5'
  },

  // ==============================================================
  // 12. TAHUN 6 - LELAKI (Tiada Acara Padang - Balapan Sahaja)
  // ==============================================================
  {
    id: 'acara-t6-balapan-100m-l',
    nama: '100 Meter (Lelaki Tahun 6)',
    kod: 'B6-L01',
    kategori: 'Balapan',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [6],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '14:00',
    catatan: 'AKHIR',
    penerangan: 'Acara balapan 100 meter lari pecut murid lelaki Tahun 6'
  },
  {
    id: 'acara-t6-balapan-200m-l',
    nama: '200 Meter (Lelaki Tahun 6)',
    kod: 'B6-L02',
    kategori: 'Balapan',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [6],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '14:30',
    catatan: 'AKHIR',
    penerangan: 'Acara balapan 200 meter murid lelaki Tahun 6'
  },
  {
    id: 'acara-t6-balapan-4x100m-l',
    nama: '4 × 100 Meter (Lelaki Tahun 6)',
    kod: 'B6-L03',
    kategori: 'Balapan',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [6],
    jenis: 'Berkumpulan',
    bilanganAhli: 5,
    masa: '15:00',
    catatan: 'AKHIR (4 Pelari + 1 Simpanan)',
    penerangan: 'Acara lari berganti-ganti 4x100 meter murid lelaki Tahun 6'
  },
  {
    id: 'acara-t6-balapan-4x200m-l',
    nama: '4 × 200 Meter (Lelaki Tahun 6)',
    kod: 'B6-L04',
    kategori: 'Balapan',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [6],
    jenis: 'Berkumpulan',
    bilanganAhli: 5,
    masa: '15:30',
    catatan: 'AKHIR (4 Pelari + 1 Simpanan)',
    penerangan: 'Acara lari berganti-ganti 4x200 meter murid lelaki Tahun 6'
  },

  // ==============================================================
  // 13. TAHUN 6 - PEREMPUAN (Tiada Acara Padang - Balapan Sahaja)
  // ==============================================================
  {
    id: 'acara-t6-balapan-100m-p',
    nama: '100 Meter (Perempuan Tahun 6)',
    kod: 'B6-P01',
    kategori: 'Balapan',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [6],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '14:15',
    catatan: 'AKHIR',
    penerangan: 'Acara balapan 100 meter lari pecut murid perempuan Tahun 6'
  },
  {
    id: 'acara-t6-balapan-200m-p',
    nama: '200 Meter (Perempuan Tahun 6)',
    kod: 'B6-P02',
    kategori: 'Balapan',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [6],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '14:45',
    catatan: 'AKHIR',
    penerangan: 'Acara balapan 200 meter murid perempuan Tahun 6'
  },
  {
    id: 'acara-t6-balapan-4x100m-p',
    nama: '4 × 100 Meter (Perempuan Tahun 6)',
    kod: 'B6-P03',
    kategori: 'Balapan',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [6],
    jenis: 'Berkumpulan',
    bilanganAhli: 5,
    masa: '15:15',
    catatan: 'AKHIR (4 Pelari + 1 Simpanan)',
    penerangan: 'Acara lari berganti-ganti 4x100 meter murid perempuan Tahun 6'
  },
  {
    id: 'acara-t6-balapan-4x200m-p',
    nama: '4 × 200 Meter (Perempuan Tahun 6)',
    kod: 'B6-P04',
    kategori: 'Balapan',
    kategoriMSSR: 'MSSR B12',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [6],
    jenis: 'Berkumpulan',
    bilanganAhli: 5,
    masa: '15:45',
    catatan: 'AKHIR (4 Pelari + 1 Simpanan)',
    penerangan: 'Acara lari berganti-ganti 4x200 meter murid perempuan Tahun 6'
  }
];
