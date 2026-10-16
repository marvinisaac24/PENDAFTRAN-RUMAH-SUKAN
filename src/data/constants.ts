import { AcaraSukan, Murid, RumahInfo, RumahSukan } from '../types';

export const SENARAI_RUMAH: Record<RumahSukan, RumahInfo> = {
  Merah: {
    id: 'Merah',
    namaPenuh: 'Rumah Merah (Temenggung)',
    namaRumah: 'Rumah Merah',
    warnaTema: '#ef4444',
    badgeClass: 'bg-red-100 text-red-800 border-red-300',
    bgLightClass: 'bg-red-50',
    borderClass: 'border-red-500',
    textClass: 'text-red-600',
    gradientClass: 'from-red-600 to-rose-700',
    maskot: 'Helang Perkasa'
  },
  Kuning: {
    id: 'Kuning',
    namaPenuh: 'Rumah Kuning (Bendahara)',
    namaRumah: 'Rumah Kuning',
    warnaTema: '#eab308',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    bgLightClass: 'bg-amber-50',
    borderClass: 'border-amber-500',
    textClass: 'text-amber-600',
    gradientClass: 'from-amber-500 to-yellow-600',
    maskot: 'Harimau Berani'
  },
  Hijau: {
    id: 'Hijau',
    namaPenuh: 'Rumah Hijau (Laksamana)',
    namaRumah: 'Rumah Hijau',
    warnaTema: '#10b981',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    bgLightClass: 'bg-emerald-50',
    borderClass: 'border-emerald-500',
    textClass: 'text-emerald-600',
    gradientClass: 'from-emerald-600 to-teal-700',
    maskot: 'Garuda Tangkas'
  },
  Biru: {
    id: 'Biru',
    namaPenuh: 'Rumah Biru (Syahbandar)',
    namaRumah: 'Rumah Biru',
    warnaTema: '#3b82f6',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    bgLightClass: 'bg-blue-50',
    borderClass: 'border-blue-500',
    textClass: 'text-blue-600',
    gradientClass: 'from-blue-600 to-indigo-700',
    maskot: 'Rajawali Angkasa'
  }
};

export const SENARAI_RUMAH_KEYS: RumahSukan[] = ['Merah', 'Kuning', 'Hijau', 'Biru'];

export const SENARAI_ALIRAN_KELAS = ['Arif', 'Bestari', 'Cekal', 'Dinamik', 'Efisien', 'Fleksibel'];

export const DEFAULT_ACARA: AcaraSukan[] = [
  // ==============================================================
  // 1. PRA SEKOLAH (07:30)
  // ==============================================================
  {
    id: 'acara-pra-sekolah',
    nama: 'Sukan Pra Sekolah',
    kod: 'PRA01',
    kategori: 'Pra Sekolah',
    kategoriJantina: 'Terbuka',
    tahunKelayakan: [0], // 0 mewakili Pra Sekolah
    jenis: 'Berkumpulan',
    bilanganAhli: 6,
    masa: '07:30',
    catatan: 'AKHIR',
    penerangan: 'Acara sukaneka dan kecergasan untuk murid-murid Pra Sekolah (6 peserta per rumah sukan)'
  },

  // ==============================================================
  // 2. SUKANEKA TAHAP 1 - TAHUN 1 (Hanya Sukaneka)
  // 6 Murid: 5 Pemain + 1 Simpanan
  // ==============================================================
  {
    id: 'acara-sk-leret-bola-l-t1',
    nama: 'Leret Bola Dengan Gelung Plastik (Lelaki Tahun 1)',
    kod: 'SK01',
    kategori: 'Sukaneka',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [1],
    jenis: 'Berkumpulan',
    bilanganAhli: 6,
    masa: '08:00',
    catatan: 'AKHIR (5 Pemain + 1 Simpanan)',
    penerangan: 'Sukaneka Tahun 1 Lelaki: Leret bola dengan gelung plastik (5 murid pemain + 1 murid simpanan)'
  },
  {
    id: 'acara-sk-pingpong-sudu-l-t1',
    nama: 'Bawa Bola Ping Pong Dengan Sudu (Lelaki Tahun 1)',
    kod: 'SK02',
    kategori: 'Sukaneka',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [1],
    jenis: 'Berkumpulan',
    bilanganAhli: 6,
    masa: '08:15',
    catatan: 'AKHIR (5 Pemain + 1 Simpanan)',
    penerangan: 'Sukaneka Tahun 1 Lelaki: Bawa bola ping pong dengan sudu (5 murid pemain + 1 murid simpanan)'
  },
  {
    id: 'acara-sk-leret-bola-p-t1',
    nama: 'Leret Bola Dengan Gelung Plastik (Perempuan Tahun 1)',
    kod: 'SK03',
    kategori: 'Sukaneka',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [1],
    jenis: 'Berkumpulan',
    bilanganAhli: 6,
    masa: '08:30',
    catatan: 'AKHIR (5 Pemain + 1 Simpanan)',
    penerangan: 'Sukaneka Tahun 1 Perempuan: Leret bola dengan gelung plastik (5 murid pemain + 1 murid simpanan)'
  },
  {
    id: 'acara-sk-pingpong-sudu-p-t1',
    nama: 'Bawa Bola Ping Pong Dengan Sudu (Perempuan Tahun 1)',
    kod: 'SK04',
    kategori: 'Sukaneka',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [1],
    jenis: 'Berkumpulan',
    bilanganAhli: 6,
    masa: '08:45',
    catatan: 'AKHIR (5 Pemain + 1 Simpanan)',
    penerangan: 'Sukaneka Tahun 1 Perempuan: Bawa bola ping pong dengan sudu (5 murid pemain + 1 murid simpanan)'
  },

  // ==============================================================
  // 3. SUKANEKA TAHAP 1 - TAHUN 2 (Hanya Sukaneka)
  // 6 Murid: 5 Pemain + 1 Simpanan
  // ==============================================================
  {
    id: 'acara-sk-pindah-kon-l-t2',
    nama: 'Pindah Kon dari A ke B (Lelaki Tahun 2)',
    kod: 'SK05',
    kategori: 'Sukaneka',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [2],
    jenis: 'Berkumpulan',
    bilanganAhli: 6,
    masa: '09:00',
    catatan: 'AKHIR (5 Pemain + 1 Simpanan)',
    penerangan: 'Sukaneka Tahun 2 Lelaki: Pindah kon dari titik A ke titik B (5 murid pemain + 1 murid simpanan)'
  },
  {
    id: 'acara-sk-isi-air-botol-l-t2',
    nama: 'Isi Air Dalam Botol (Lelaki Tahun 2)',
    kod: 'SK06',
    kategori: 'Sukaneka',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [2],
    jenis: 'Berkumpulan',
    bilanganAhli: 6,
    masa: '09:15',
    catatan: 'AKHIR (5 Pemain + 1 Simpanan)',
    penerangan: 'Sukaneka Tahun 2 Lelaki: Isi air dalam botol secara berganti-ganti (5 murid pemain + 1 murid simpanan)'
  },
  {
    id: 'acara-sk-pindah-kon-p-t2',
    nama: 'Pindah Kon dari A ke B (Perempuan Tahun 2)',
    kod: 'SK07',
    kategori: 'Sukaneka',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [2],
    jenis: 'Berkumpulan',
    bilanganAhli: 6,
    masa: '09:30',
    catatan: 'AKHIR (5 Pemain + 1 Simpanan)',
    penerangan: 'Sukaneka Tahun 2 Perempuan: Pindah kon dari titik A ke titik B (5 murid pemain + 1 murid simpanan)'
  },
  {
    id: 'acara-sk-isi-air-botol-p-t2',
    nama: 'Isi Air Dalam Botol (Perempuan Tahun 2)',
    kod: 'SK08',
    kategori: 'Sukaneka',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [2],
    jenis: 'Berkumpulan',
    bilanganAhli: 6,
    masa: '09:45',
    catatan: 'AKHIR (5 Pemain + 1 Simpanan)',
    penerangan: 'Sukaneka Tahun 2 Perempuan: Isi air dalam botol secara berganti-ganti (5 murid pemain + 1 murid simpanan)'
  },

  // ==============================================================
  // 4. TAHUN 3 - BALAPAN
  // ==============================================================
  {
    id: 'acara-60m-l-t3',
    nama: '60 Meter Lelaki Tahun 3',
    kod: 'B01',
    kategori: 'Balapan',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [3],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '10:00',
    catatan: 'AKHIR',
    penerangan: 'Acara pecut balapan 60 meter individu untuk murid lelaki Tahun 3'
  },
  {
    id: 'acara-60m-p-t3',
    nama: '60 Meter Perempuan Tahun 3',
    kod: 'B02',
    kategori: 'Balapan',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [3],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '10:10',
    catatan: 'AKHIR',
    penerangan: 'Acara pecut balapan 60 meter individu untuk murid perempuan Tahun 3'
  },
  {
    id: 'acara-80m-l-t3',
    nama: '80 Meter Lelaki Tahun 3',
    kod: 'B03',
    kategori: 'Balapan',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [3],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '10:20',
    catatan: 'AKHIR',
    penerangan: 'Acara balapan 80 meter individu murid lelaki Tahun 3'
  },
  {
    id: 'acara-80m-p-t3',
    nama: '80 Meter Perempuan Tahun 3',
    kod: 'B04',
    kategori: 'Balapan',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [3],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '10:30',
    catatan: 'AKHIR',
    penerangan: 'Acara balapan 80 meter individu murid perempuan Tahun 3'
  },

  // ==============================================================
  // 5. TAHUN 4 - BALAPAN
  // ==============================================================
  {
    id: 'acara-100m-l-t4',
    nama: '100 Meter Lelaki Tahun 4',
    kod: 'B05',
    kategori: 'Balapan',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [4],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '10:45',
    catatan: 'AKHIR',
    penerangan: 'Acara pecut 100 meter individu murid lelaki Tahun 4'
  },
  {
    id: 'acara-100m-p-t4',
    nama: '100 Meter Perempuan Tahun 4',
    kod: 'B06',
    kategori: 'Balapan',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [4],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '10:55',
    catatan: 'AKHIR',
    penerangan: 'Acara pecut 100 meter individu murid perempuan Tahun 4'
  },
  {
    id: 'acara-4x100m-l-t4',
    nama: '4x100 Meter Lelaki Tahun 4',
    kod: 'B07',
    kategori: 'Balapan',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [4],
    jenis: 'Berkumpulan',
    bilanganAhli: 4,
    masa: '11:05',
    catatan: 'AKHIR (4 Pelari)',
    penerangan: 'Acara lari berganti-ganti 4x100 meter murid lelaki Tahun 4'
  },
  {
    id: 'acara-4x100m-p-t4',
    nama: '4x100 Meter Perempuan Tahun 4',
    kod: 'B08',
    kategori: 'Balapan',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [4],
    jenis: 'Berkumpulan',
    bilanganAhli: 4,
    masa: '11:15',
    catatan: 'AKHIR (4 Pelari)',
    penerangan: 'Acara lari berganti-ganti 4x100 meter murid perempuan Tahun 4'
  },

  // ==============================================================
  // 6. TAHUN 5 - BALAPAN
  // ==============================================================
  {
    id: 'acara-100m-l-t5',
    nama: '100 Meter Lelaki Tahun 5',
    kod: 'B09',
    kategori: 'Balapan',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [5],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '11:25',
    catatan: 'AKHIR'
  },
  {
    id: 'acara-100m-p-t5',
    nama: '100 Meter Perempuan Tahun 5',
    kod: 'B10',
    kategori: 'Balapan',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [5],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '11:35',
    catatan: 'AKHIR'
  },
  {
    id: 'acara-200m-l-t5',
    nama: '200 Meter Lelaki Tahun 5',
    kod: 'B11',
    kategori: 'Balapan',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [5],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '11:45',
    catatan: 'AKHIR'
  },
  {
    id: 'acara-200m-p-t5',
    nama: '200 Meter Perempuan Tahun 5',
    kod: 'B12',
    kategori: 'Balapan',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [5],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '11:55',
    catatan: 'AKHIR'
  },
  {
    id: 'acara-4x100m-l-t5',
    nama: '4x100 Meter Lelaki Tahun 5',
    kod: 'B13',
    kategori: 'Balapan',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [5],
    jenis: 'Berkumpulan',
    bilanganAhli: 4,
    masa: '12:05',
    catatan: 'AKHIR (4 Pelari)'
  },
  {
    id: 'acara-4x100m-p-t5',
    nama: '4x100 Meter Perempuan Tahun 5',
    kod: 'B14',
    kategori: 'Balapan',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [5],
    jenis: 'Berkumpulan',
    bilanganAhli: 4,
    masa: '12:15',
    catatan: 'AKHIR (4 Pelari)'
  },

  // ==============================================================
  // 7. TAHUN 6 - BALAPAN
  // ==============================================================
  {
    id: 'acara-100m-l-t6',
    nama: '100 Meter Lelaki Tahun 6',
    kod: 'B15',
    kategori: 'Balapan',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [6],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '14:00',
    catatan: 'AKHIR'
  },
  {
    id: 'acara-100m-p-t6',
    nama: '100 Meter Perempuan Tahun 6',
    kod: 'B16',
    kategori: 'Balapan',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [6],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '14:10',
    catatan: 'AKHIR'
  },
  {
    id: 'acara-200m-l-t6',
    nama: '200 Meter Lelaki Tahun 6',
    kod: 'B17',
    kategori: 'Balapan',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [6],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '14:20',
    catatan: 'AKHIR'
  },
  {
    id: 'acara-200m-p-t6',
    nama: '200 Meter Perempuan Tahun 6',
    kod: 'B18',
    kategori: 'Balapan',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [6],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '14:30',
    catatan: 'AKHIR'
  },
  {
    id: 'acara-4x100m-l-t6',
    nama: '4x100 Meter Lelaki Tahun 6',
    kod: 'B19',
    kategori: 'Balapan',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [6],
    jenis: 'Berkumpulan',
    bilanganAhli: 4,
    masa: '14:40',
    catatan: 'AKHIR (4 Pelari)'
  },
  {
    id: 'acara-4x100m-p-t6',
    nama: '4x100 Meter Perempuan Tahun 6',
    kod: 'B20',
    kategori: 'Balapan',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [6],
    jenis: 'Berkumpulan',
    bilanganAhli: 4,
    masa: '14:50',
    catatan: 'AKHIR (4 Pelari)'
  },

  // ==============================================================
  // 8. ACARA PADANG & TERBUKA (TAHUN 4 - 6)
  // ==============================================================
  {
    id: 'acara-lompat-jauh-l-t4-6',
    nama: 'Lompat Jauh Lelaki Tahun 4-6',
    kod: 'P01',
    kategori: 'Padang',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [4, 5, 6],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '08:30',
    catatan: 'AKHIR'
  },
  {
    id: 'acara-lompat-jauh-p-t4-6',
    nama: 'Lompat Jauh Perempuan Tahun 4-6',
    kod: 'P02',
    kategori: 'Padang',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [4, 5, 6],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '09:30',
    catatan: 'AKHIR'
  },
  {
    id: 'acara-lontar-peluru-l-t4-6',
    nama: 'Lontar Peluru Lelaki Tahun 4-6',
    kod: 'P03',
    kategori: 'Padang',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [4, 5, 6],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '10:30',
    catatan: 'AKHIR'
  },
  {
    id: 'acara-lontar-peluru-p-t4-6',
    nama: 'Lontar Peluru Perempuan Tahun 4-6',
    kod: 'P04',
    kategori: 'Padang',
    kategoriJantina: 'Perempuan',
    tahunKelayakan: [4, 5, 6],
    jenis: 'Individu',
    bilanganAhli: 1,
    masa: '11:30',
    catatan: 'AKHIR'
  },
  {
    id: 'acara-tarik-tali-l-t5-6',
    nama: 'Tarik Tali Lelaki Terbuka Tahun 5 & 6',
    kod: 'P05',
    kategori: 'Padang',
    kategoriJantina: 'Lelaki',
    tahunKelayakan: [5, 6],
    jenis: 'Berkumpulan',
    bilanganAhli: 8,
    masa: '15:30',
    catatan: 'AKHIR (8 Peserta)',
    penerangan: 'Acara tarik tali berkumpulan antara rumah sukan (8 peserta utama)'
  }
];

export const INITIAL_STUDENTS: Murid[] = [
  // ==============================================================
  // PRA SEKOLAH (Tahun 0)
  // ==============================================================
  { id: 'PRA-M01', nama: 'Rayyan Mikhail bin Azhar', tahun: 0, kelas: 'Pra Arif', jantina: 'Lelaki', rumahSukan: 'Merah' },
  { id: 'PRA-M02', nama: 'Zara Aisyah binti Kamal', tahun: 0, kelas: 'Pra Arif', jantina: 'Perempuan', rumahSukan: 'Merah' },
  { id: 'PRA-K01', nama: 'Adam Iskandar bin Razali', tahun: 0, kelas: 'Pra Arif', jantina: 'Lelaki', rumahSukan: 'Kuning' },
  { id: 'PRA-H01', nama: 'Hana Safiyyah binti Osman', tahun: 0, kelas: 'Pra Bestari', jantina: 'Perempuan', rumahSukan: 'Hijau' },
  { id: 'PRA-B01', nama: 'Lucas Tan Wei Lun', tahun: 0, kelas: 'Pra Bestari', jantina: 'Lelaki', rumahSukan: 'Biru' },

  // ==============================================================
  // TAHUN 1: SUKANEKA (6 peserta per rumah: 5 pemain + 1 simpanan)
  // Kelas: 1 Arif, 1 Bestari, 1 Cekal, 1 Dinamik, 1 Efisien, 1 Fleksibel
  // ==============================================================
  // Rumah Merah - Tahun 1 Lelaki (Untuk Sukaneka: Gelung Plastik & Bola Ping Pong)
  { id: 'M-1001', nama: 'Adam Haziq bin Shukri', tahun: 1, kelas: '1 Arif', jantina: 'Lelaki', rumahSukan: 'Merah' },
  { id: 'M-1002', nama: 'Danish Iskandar bin Halim', tahun: 1, kelas: '1 Arif', jantina: 'Lelaki', rumahSukan: 'Merah' },
  { id: 'M-1003', nama: 'Muhammad Hafiz bin Imran', tahun: 1, kelas: '1 Bestari', jantina: 'Lelaki', rumahSukan: 'Merah' },
  { id: 'M-1004', nama: 'Amirul Danish bin Zulkifli', tahun: 1, kelas: '1 Cekal', jantina: 'Lelaki', rumahSukan: 'Merah' },
  { id: 'M-1005', nama: 'Rayyan Thaqif bin Nizam', tahun: 1, kelas: '1 Dinamik', jantina: 'Lelaki', rumahSukan: 'Merah' },
  { id: 'M-1006', nama: 'Umar Al-Faruq bin Fauzi', tahun: 1, kelas: '1 Fleksibel', jantina: 'Lelaki', rumahSukan: 'Merah' },
  { id: 'M-1007', nama: 'Aisyah Humairah binti Rosli', tahun: 1, kelas: '1 Arif', jantina: 'Perempuan', rumahSukan: 'Merah' },
  { id: 'M-1008', nama: 'Nur Damia binti Saiful', tahun: 1, kelas: '1 Bestari', jantina: 'Perempuan', rumahSukan: 'Merah' },
  { id: 'M-1009', nama: 'Siti Sarah binti Munir', tahun: 1, kelas: '1 Cekal', jantina: 'Perempuan', rumahSukan: 'Merah' },
  { id: 'M-1010', nama: 'Dhiya Qistina binti Ridzuan', tahun: 1, kelas: '1 Dinamik', jantina: 'Perempuan', rumahSukan: 'Merah' },
  { id: 'M-1011', nama: 'Nur Iman binti Johari', tahun: 1, kelas: '1 Efisien', jantina: 'Perempuan', rumahSukan: 'Merah' },
  { id: 'M-1012', nama: 'Fatimah Az-Zahra binti Bakri', tahun: 1, kelas: '1 Fleksibel', jantina: 'Perempuan', rumahSukan: 'Merah' },

  // Rumah Kuning - Tahun 1
  { id: 'K-1001', nama: 'Chong Wei Han', tahun: 1, kelas: '1 Arif', jantina: 'Lelaki', rumahSukan: 'Kuning' },
  { id: 'K-1002', nama: 'Harith Danial bin Zaki', tahun: 1, kelas: '1 Bestari', jantina: 'Lelaki', rumahSukan: 'Kuning' },
  { id: 'K-1003', nama: 'Syakir Iman bin Syamsul', tahun: 1, kelas: '1 Cekal', jantina: 'Lelaki', rumahSukan: 'Kuning' },
  { id: 'K-1004', nama: 'Thineshkumar a/l Ravi', tahun: 1, kelas: '1 Dinamik', jantina: 'Lelaki', rumahSukan: 'Kuning' },
  { id: 'K-1005', nama: 'Wan Hafiz bin Wan Ramli', tahun: 1, kelas: '1 Efisien', jantina: 'Lelaki', rumahSukan: 'Kuning' },
  { id: 'K-1006', nama: 'Zufar Khairi bin Norman', tahun: 1, kelas: '1 Fleksibel', jantina: 'Lelaki', rumahSukan: 'Kuning' },
  { id: 'K-1007', nama: 'Anis Nadirah binti Kamarul', tahun: 1, kelas: '1 Arif', jantina: 'Perempuan', rumahSukan: 'Kuning' },
  { id: 'K-1008', nama: 'Chloe Lim Jia En', tahun: 1, kelas: '1 Bestari', jantina: 'Perempuan', rumahSukan: 'Kuning' },
  { id: 'K-1009', nama: 'Divya a/p Mohan', tahun: 1, kelas: '1 Cekal', jantina: 'Perempuan', rumahSukan: 'Kuning' },
  { id: 'K-1010', nama: 'Nur Afrina binti Sobri', tahun: 1, kelas: '1 Dinamik', jantina: 'Perempuan', rumahSukan: 'Kuning' },
  { id: 'K-1011', nama: 'Puteri Balqis binti Mazlan', tahun: 1, kelas: '1 Efisien', jantina: 'Perempuan', rumahSukan: 'Kuning' },
  { id: 'K-1012', nama: 'Rania Sofea binti Hairi', tahun: 1, kelas: '1 Fleksibel', jantina: 'Perempuan', rumahSukan: 'Kuning' },

  // Rumah Hijau - Tahun 1
  { id: 'H-1001', nama: 'Ahmad Aqil bin Salleh', tahun: 1, kelas: '1 Arif', jantina: 'Lelaki', rumahSukan: 'Hijau' },
  { id: 'H-1002', nama: 'Danish Farhan bin Azlan', tahun: 1, kelas: '1 Bestari', jantina: 'Lelaki', rumahSukan: 'Hijau' },
  { id: 'H-1003', nama: 'Irfan Dani bin Zakaria', tahun: 1, kelas: '1 Cekal', jantina: 'Lelaki', rumahSukan: 'Hijau' },
  { id: 'H-1004', nama: 'Kavinesh a/l Kumar', tahun: 1, kelas: '1 Dinamik', jantina: 'Lelaki', rumahSukan: 'Hijau' },
  { id: 'H-1005', nama: 'Muaz Haziq bin Othman', tahun: 1, kelas: '1 Efisien', jantina: 'Lelaki', rumahSukan: 'Hijau' },
  { id: 'H-1006', nama: 'Nabil Fikri bin Roslan', tahun: 1, kelas: '1 Fleksibel', jantina: 'Lelaki', rumahSukan: 'Hijau' },
  { id: 'H-1007', nama: 'Batrisya binti Halim', tahun: 1, kelas: '1 Arif', jantina: 'Perempuan', rumahSukan: 'Hijau' },
  { id: 'H-1008', nama: 'Dayana Batrisyia binti Anuar', tahun: 1, kelas: '1 Bestari', jantina: 'Perempuan', rumahSukan: 'Hijau' },
  { id: 'H-1009', nama: 'Farah Nadia binti Jamal', tahun: 1, kelas: '1 Cekal', jantina: 'Perempuan', rumahSukan: 'Hijau' },
  { id: 'H-1010', nama: 'Kavitha a/p Murugan', tahun: 1, kelas: '1 Dinamik', jantina: 'Perempuan', rumahSukan: 'Hijau' },
  { id: 'H-1011', nama: 'Nur Wardina binti Latiff', tahun: 1, kelas: '1 Efisien', jantina: 'Perempuan', rumahSukan: 'Hijau' },
  { id: 'H-1012', nama: 'Siti Khadijah binti Asri', tahun: 1, kelas: '1 Fleksibel', jantina: 'Perempuan', rumahSukan: 'Hijau' },

  // Rumah Biru - Tahun 1
  { id: 'B-1001', nama: 'Aiman Naufal bin Shahrul', tahun: 1, kelas: '1 Arif', jantina: 'Lelaki', rumahSukan: 'Biru' },
  { id: 'B-1002', nama: 'Darwish Luqman bin Hairi', tahun: 1, kelas: '1 Bestari', jantina: 'Lelaki', rumahSukan: 'Biru' },
  { id: 'B-1003', nama: 'Justin Lee Sheng', tahun: 1, kelas: '1 Cekal', jantina: 'Lelaki', rumahSukan: 'Biru' },
  { id: 'B-1004', nama: 'Mikhail Iman bin Zaidi', tahun: 1, kelas: '1 Dinamik', jantina: 'Lelaki', rumahSukan: 'Biru' },
  { id: 'B-1005', nama: 'Praveen a/l Sundram', tahun: 1, kelas: '1 Efisien', jantina: 'Lelaki', rumahSukan: 'Biru' },
  { id: 'B-1006', nama: 'Wan Adam bin Wan Rosli', tahun: 1, kelas: '1 Fleksibel', jantina: 'Lelaki', rumahSukan: 'Biru' },
  { id: 'B-1007', nama: 'Aleeya Maisarah binti Fauzi', tahun: 1, kelas: '1 Arif', jantina: 'Perempuan', rumahSukan: 'Biru' },
  { id: 'B-1008', nama: 'Emily Tan Li Yin', tahun: 1, kelas: '1 Bestari', jantina: 'Perempuan', rumahSukan: 'Biru' },
  { id: 'B-1009', nama: 'Hani Insyirah binti Mahadir', tahun: 1, kelas: '1 Cekal', jantina: 'Perempuan', rumahSukan: 'Biru' },
  { id: 'B-1010', nama: 'Janani a/p Suresh', tahun: 1, kelas: '1 Dinamik', jantina: 'Perempuan', rumahSukan: 'Biru' },
  { id: 'B-1011', nama: 'Nur Arissa binti Taufiq', tahun: 1, kelas: '1 Efisien', jantina: 'Perempuan', rumahSukan: 'Biru' },
  { id: 'B-1012', nama: 'Zara Zulaikha binti Yusof', tahun: 1, kelas: '1 Fleksibel', jantina: 'Perempuan', rumahSukan: 'Biru' },

  // ==============================================================
  // TAHUN 2: SUKANEKA (6 peserta per rumah: 5 pemain + 1 simpanan)
  // Kelas: 2 Arif, 2 Bestari, 2 Cekal, 2 Dinamik, 2 Efisien, 2 Fleksibel
  // ==============================================================
  // Rumah Merah - Tahun 2 (Pindah Kon & Isi Air Dalam Botol)
  { id: 'M-2001', nama: 'Irfan Naufal bin Nizam', tahun: 2, kelas: '2 Arif', jantina: 'Lelaki', rumahSukan: 'Merah' },
  { id: 'M-2002', nama: 'Ammar Danish bin Hamidon', tahun: 2, kelas: '2 Bestari', jantina: 'Lelaki', rumahSukan: 'Merah' },
  { id: 'M-2003', nama: 'Fakhrul Razi bin Mahathir', tahun: 2, kelas: '2 Cekal', jantina: 'Lelaki', rumahSukan: 'Merah' },
  { id: 'M-2004', nama: 'Izzat Zikri bin Shahril', tahun: 2, kelas: '2 Dinamik', jantina: 'Lelaki', rumahSukan: 'Merah' },
  { id: 'M-2005', nama: 'Muhammad Qayyum bin Basir', tahun: 2, kelas: '2 Efisien', jantina: 'Lelaki', rumahSukan: 'Merah' },
  { id: 'M-2006', nama: 'Zharif Iman bin Zulkarnain', tahun: 2, kelas: '2 Fleksibel', jantina: 'Lelaki', rumahSukan: 'Merah' },
  { id: 'M-2007', nama: 'Amani Syuhada binti Bakar', tahun: 2, kelas: '2 Arif', jantina: 'Perempuan', rumahSukan: 'Merah' },
  { id: 'M-2008', nama: 'Dhia Insyirah binti Helmi', tahun: 2, kelas: '2 Bestari', jantina: 'Perempuan', rumahSukan: 'Merah' },
  { id: 'M-2009', nama: 'Hana Mardhiah binti Saidin', tahun: 2, kelas: '2 Cekal', jantina: 'Perempuan', rumahSukan: 'Merah' },
  { id: 'M-2010', nama: 'Nur Farisya binti Kamaruddin', tahun: 2, kelas: '2 Dinamik', jantina: 'Perempuan', rumahSukan: 'Merah' },
  { id: 'M-2011', nama: 'Syasya Athirah binti Razali', tahun: 2, kelas: '2 Efisien', jantina: 'Perempuan', rumahSukan: 'Merah' },
  { id: 'M-2012', nama: 'Yasmin Zahira binti Badrol', tahun: 2, kelas: '2 Fleksibel', jantina: 'Perempuan', rumahSukan: 'Merah' },

  // Rumah Kuning - Tahun 2
  { id: 'K-2001', nama: 'Adrian Goh Kah Jun', tahun: 2, kelas: '2 Arif', jantina: 'Lelaki', rumahSukan: 'Kuning' },
  { id: 'K-2002', nama: 'Danial Haziq bin Roslan', tahun: 2, kelas: '2 Bestari', jantina: 'Lelaki', rumahSukan: 'Kuning' },
  { id: 'K-2003', nama: 'Kishore a/l Ganesan', tahun: 2, kelas: '2 Cekal', jantina: 'Lelaki', rumahSukan: 'Kuning' },
  { id: 'K-2004', nama: 'Luqman Nurhakim bin Sabri', tahun: 2, kelas: '2 Dinamik', jantina: 'Lelaki', rumahSukan: 'Kuning' },
  { id: 'K-2005', nama: 'Nik Azim bin Nik Daud', tahun: 2, kelas: '2 Efisien', jantina: 'Lelaki', rumahSukan: 'Kuning' },
  { id: 'K-2006', nama: 'Syahmi Daniel bin Fadhil', tahun: 2, kelas: '2 Fleksibel', jantina: 'Lelaki', rumahSukan: 'Kuning' },
  { id: 'K-2007', nama: 'Alyssa Wong Zi Xuan', tahun: 2, kelas: '2 Arif', jantina: 'Perempuan', rumahSukan: 'Kuning' },
  { id: 'K-2008', nama: 'Balkis binti Ahmad Termizi', tahun: 2, kelas: '2 Bestari', jantina: 'Perempuan', rumahSukan: 'Kuning' },
  { id: 'K-2009', nama: 'Dharshini a/p Balan', tahun: 2, kelas: '2 Cekal', jantina: 'Perempuan', rumahSukan: 'Kuning' },
  { id: 'K-2010', nama: 'Nurul Hani binti Iskandar', tahun: 2, kelas: '2 Dinamik', jantina: 'Perempuan', rumahSukan: 'Kuning' },
  { id: 'K-2011', nama: 'Sarah Batrisya binti Kamal', tahun: 2, kelas: '2 Efisien', jantina: 'Perempuan', rumahSukan: 'Kuning' },
  { id: 'K-2012', nama: 'Zara Zulaikha binti Mazlan', tahun: 2, kelas: '2 Fleksibel', jantina: 'Perempuan', rumahSukan: 'Kuning' },

  // Rumah Hijau - Tahun 2
  { id: 'H-2001', nama: 'Aqil Muhaimin bin Othman', tahun: 2, kelas: '2 Arif', jantina: 'Lelaki', rumahSukan: 'Hijau' },
  { id: 'H-2002', nama: 'Bryan Chan Jun Wei', tahun: 2, kelas: '2 Bestari', jantina: 'Lelaki', rumahSukan: 'Hijau' },
  { id: 'H-2003', nama: 'Harith Fikri bin Zainal', tahun: 2, kelas: '2 Cekal', jantina: 'Lelaki', rumahSukan: 'Hijau' },
  { id: 'H-2004', nama: 'Muhammad Rayyan bin Yusof', tahun: 2, kelas: '2 Dinamik', jantina: 'Lelaki', rumahSukan: 'Hijau' },
  { id: 'H-2005', nama: 'Saravanan a/l Naidu', tahun: 2, kelas: '2 Efisien', jantina: 'Lelaki', rumahSukan: 'Hijau' },
  { id: 'H-2006', nama: 'Zulhairi bin Zulhasnan', tahun: 2, kelas: '2 Fleksibel', jantina: 'Lelaki', rumahSukan: 'Hijau' },
  { id: 'H-2007', nama: 'Ainur Mardhiah binti Affandi', tahun: 2, kelas: '2 Arif', jantina: 'Perempuan', rumahSukan: 'Hijau' },
  { id: 'H-2008', nama: 'Cheong Shu Wen', tahun: 2, kelas: '2 Bestari', jantina: 'Perempuan', rumahSukan: 'Hijau' },
  { id: 'H-2009', nama: 'Erina Maisarah binti Fairuz', tahun: 2, kelas: '2 Cekal', jantina: 'Perempuan', rumahSukan: 'Hijau' },
  { id: 'H-2010', nama: 'Janice Wong Xiao Qi', tahun: 2, kelas: '2 Dinamik', jantina: 'Perempuan', rumahSukan: 'Hijau' },
  { id: 'H-2011', nama: 'Nur Adlina binti Shukor', tahun: 2, kelas: '2 Efisien', jantina: 'Perempuan', rumahSukan: 'Hijau' },
  { id: 'H-2012', nama: 'Syaza Qasrina binti Jalil', tahun: 2, kelas: '2 Fleksibel', jantina: 'Perempuan', rumahSukan: 'Hijau' },

  // Rumah Biru - Tahun 2
  { id: 'B-2001', nama: 'Arif Luqman bin Baharom', tahun: 2, kelas: '2 Arif', jantina: 'Lelaki', rumahSukan: 'Biru' },
  { id: 'B-2002', nama: 'Danish Daniel bin Azhar', tahun: 2, kelas: '2 Bestari', jantina: 'Lelaki', rumahSukan: 'Biru' },
  { id: 'B-2003', nama: 'Isaac Lim Jian Hao', tahun: 2, kelas: '2 Cekal', jantina: 'Lelaki', rumahSukan: 'Biru' },
  { id: 'B-2004', nama: 'Naveen a/l Parthiban', tahun: 2, kelas: '2 Dinamik', jantina: 'Lelaki', rumahSukan: 'Biru' },
  { id: 'B-2005', nama: 'Umar Qayyim bin Redzuan', tahun: 2, kelas: '2 Efisien', jantina: 'Lelaki', rumahSukan: 'Biru' },
  { id: 'B-2006', nama: 'Zafran Amsyar bin Zulkifli', tahun: 2, kelas: '2 Fleksibel', jantina: 'Lelaki', rumahSukan: 'Biru' },
  { id: 'B-2007', nama: 'Aisyah Safiyyah binti Zahari', tahun: 2, kelas: '2 Arif', jantina: 'Perempuan', rumahSukan: 'Biru' },
  { id: 'B-2008', nama: 'Fiona Lee Xin Yi', tahun: 2, kelas: '2 Bestari', jantina: 'Perempuan', rumahSukan: 'Biru' },
  { id: 'B-2009', nama: 'Kavitha a/p Loganathan', tahun: 2, kelas: '2 Cekal', jantina: 'Perempuan', rumahSukan: 'Biru' },
  { id: 'B-2010', nama: 'Nur Hidayah binti Mahfuz', tahun: 2, kelas: '2 Dinamik', jantina: 'Perempuan', rumahSukan: 'Biru' },
  { id: 'B-2011', nama: 'Qistina Balqis binti Samad', tahun: 2, kelas: '2 Efisien', jantina: 'Perempuan', rumahSukan: 'Biru' },
  { id: 'B-2012', nama: 'Zarith Sofea binti Hamzah', tahun: 2, kelas: '2 Fleksibel', jantina: 'Perempuan', rumahSukan: 'Biru' },

  // ==============================================================
  // TAHUN 3: 3 Arif, 3 Bestari, 3 Cekal, 3 Dinamik, 3 Efisien, 3 Fleksibel
  // Termasuk Contoh Spesifikasi Rasmi: Rumah Merah -> 60m L T3 -> 3 Fleksibel
  // ==============================================================
  // Rumah Merah - Tahun 3
  { id: 'M-3001', nama: 'Ahmad Danish bin Rosli', tahun: 3, kelas: '3 Fleksibel', jantina: 'Lelaki', rumahSukan: 'Merah' },
  { id: 'M-3002', nama: 'Muhammad Harith bin Zamri', tahun: 3, kelas: '3 Fleksibel', jantina: 'Lelaki', rumahSukan: 'Merah' },
  { id: 'M-3003', nama: 'Tan Wei Lun', tahun: 3, kelas: '3 Fleksibel', jantina: 'Lelaki', rumahSukan: 'Merah' },
  { id: 'M-3004', nama: 'Kugan a/l Murugan', tahun: 3, kelas: '3 Fleksibel', jantina: 'Lelaki', rumahSukan: 'Merah' },
  { id: 'M-3005', nama: 'Nur Ain binti Zulkifli', tahun: 3, kelas: '3 Fleksibel', jantina: 'Perempuan', rumahSukan: 'Merah' },
  { id: 'M-3006', nama: 'Siti Sarah binti Khairuddin', tahun: 3, kelas: '3 Fleksibel', jantina: 'Perempuan', rumahSukan: 'Merah' },
  { id: 'M-3007', nama: 'Farhan bin Faizal', tahun: 3, kelas: '3 Arif', jantina: 'Lelaki', rumahSukan: 'Merah' },
  { id: 'M-3008', nama: 'Nurul Huda binti Azman', tahun: 3, kelas: '3 Arif', jantina: 'Perempuan', rumahSukan: 'Merah' },
  { id: 'M-3009', nama: 'Khairul Ikhwan bin Dahlan', tahun: 3, kelas: '3 Bestari', jantina: 'Lelaki', rumahSukan: 'Merah' },
  { id: 'M-3010', nama: 'Aina Nabilah binti Salleh', tahun: 3, kelas: '3 Bestari', jantina: 'Perempuan', rumahSukan: 'Merah' },
  { id: 'M-3011', nama: 'Muhammad Syafiq bin Johar', tahun: 3, kelas: '3 Cekal', jantina: 'Lelaki', rumahSukan: 'Merah' },
  { id: 'M-3012', nama: 'Damia Husna binti Bakhtiar', tahun: 3, kelas: '3 Cekal', jantina: 'Perempuan', rumahSukan: 'Merah' },
  { id: 'M-3013', nama: 'Rayyan Hakim bin Firdaus', tahun: 3, kelas: '3 Dinamik', jantina: 'Lelaki', rumahSukan: 'Merah' },
  { id: 'M-3014', nama: 'Nur Qistina binti Mahathir', tahun: 3, kelas: '3 Dinamik', jantina: 'Perempuan', rumahSukan: 'Merah' },
  { id: 'M-3015', nama: 'Haziq Danial bin Ariffin', tahun: 3, kelas: '3 Efisien', jantina: 'Lelaki', rumahSukan: 'Merah' },
  { id: 'M-3016', nama: 'Nurul Syuhada binti Yazid', tahun: 3, kelas: '3 Efisien', jantina: 'Perempuan', rumahSukan: 'Merah' },

  // Rumah Kuning - Tahun 3 (Arif, Bestari, Cekal, Dinamik, Efisien, Fleksibel)
  { id: 'K-3001', nama: 'Chong Jin Wei', tahun: 3, kelas: '3 Fleksibel', jantina: 'Lelaki', rumahSukan: 'Kuning' },
  { id: 'K-3002', nama: 'Zikri Hafiz bin Basri', tahun: 3, kelas: '3 Fleksibel', jantina: 'Lelaki', rumahSukan: 'Kuning' },
  { id: 'K-3003', nama: 'Anis Maisarah binti Kamarudin', tahun: 3, kelas: '3 Fleksibel', jantina: 'Perempuan', rumahSukan: 'Kuning' },
  { id: 'K-3004', nama: 'Afiq Farhan bin Norman', tahun: 3, kelas: '3 Arif', jantina: 'Lelaki', rumahSukan: 'Kuning' },
  { id: 'K-3005', nama: 'Aisyah Humaira binti Ramlan', tahun: 3, kelas: '3 Arif', jantina: 'Perempuan', rumahSukan: 'Kuning' },
  { id: 'K-3006', nama: 'Izzat Hakimi bin Ramli', tahun: 3, kelas: '3 Bestari', jantina: 'Lelaki', rumahSukan: 'Kuning' },
  { id: 'K-3007', nama: 'Kelly Tan Yen Ling', tahun: 3, kelas: '3 Bestari', jantina: 'Perempuan', rumahSukan: 'Kuning' },
  { id: 'K-3008', nama: 'Syakir Naufal bin Zulkarnain', tahun: 3, kelas: '3 Cekal', jantina: 'Lelaki', rumahSukan: 'Kuning' },
  { id: 'K-3009', nama: 'Pavithra a/p Suresh', tahun: 3, kelas: '3 Cekal', jantina: 'Perempuan', rumahSukan: 'Kuning' },
  { id: 'K-3010', nama: 'Wan Daniel bin Wan Harun', tahun: 3, kelas: '3 Dinamik', jantina: 'Lelaki', rumahSukan: 'Kuning' },
  { id: 'K-3011', nama: 'Nurdiana binti Khalid', tahun: 3, kelas: '3 Dinamik', jantina: 'Perempuan', rumahSukan: 'Kuning' },
  { id: 'K-3012', nama: 'Muaz bin Syamsul', tahun: 3, kelas: '3 Efisien', jantina: 'Lelaki', rumahSukan: 'Kuning' },
  { id: 'K-3013', nama: 'Siti Sarah binti Anuar', tahun: 3, kelas: '3 Efisien', jantina: 'Perempuan', rumahSukan: 'Kuning' },

  // Rumah Hijau - Tahun 3 (Arif, Bestari, Cekal, Dinamik, Efisien, Fleksibel)
  { id: 'H-3001', nama: 'Khairul Anwar bin Salleh', tahun: 3, kelas: '3 Fleksibel', jantina: 'Lelaki', rumahSukan: 'Hijau' },
  { id: 'H-3002', nama: 'Danish Aiman bin Azlan', tahun: 3, kelas: '3 Arif', jantina: 'Lelaki', rumahSukan: 'Hijau' },
  { id: 'H-3003', nama: 'Nur Fatihah binti Halim', tahun: 3, kelas: '3 Fleksibel', jantina: 'Perempuan', rumahSukan: 'Hijau' },
  { id: 'H-3004', nama: 'Amir Asyraf bin Jamal', tahun: 3, kelas: '3 Bestari', jantina: 'Lelaki', rumahSukan: 'Hijau' },
  { id: 'H-3005', nama: 'Farah Wahida binti Othman', tahun: 3, kelas: '3 Bestari', jantina: 'Perempuan', rumahSukan: 'Hijau' },
  { id: 'H-3006', nama: 'Hakimi Luqman bin Razak', tahun: 3, kelas: '3 Cekal', jantina: 'Lelaki', rumahSukan: 'Hijau' },
  { id: 'H-3007', nama: 'Low Jia Xin', tahun: 3, kelas: '3 Cekal', jantina: 'Perempuan', rumahSukan: 'Hijau' },
  { id: 'H-3008', nama: 'Muhammad Nabil bin Roslan', tahun: 3, kelas: '3 Dinamik', jantina: 'Lelaki', rumahSukan: 'Hijau' },
  { id: 'H-3009', nama: 'Nur Aleesya binti Badri', tahun: 3, kelas: '3 Dinamik', jantina: 'Perempuan', rumahSukan: 'Hijau' },
  { id: 'H-3010', nama: 'Syazwan bin Mazlan', tahun: 3, kelas: '3 Efisien', jantina: 'Lelaki', rumahSukan: 'Hijau' },
  { id: 'H-3011', nama: 'Tashvini a/p Balakrishnan', tahun: 3, kelas: '3 Efisien', jantina: 'Perempuan', rumahSukan: 'Hijau' },

  // Rumah Biru - Tahun 3 (Arif, Bestari, Cekal, Dinamik, Efisien, Fleksibel)
  { id: 'B-3001', nama: 'Rishan a/l Ananthan', tahun: 3, kelas: '3 Fleksibel', jantina: 'Lelaki', rumahSukan: 'Biru' },
  { id: 'B-3002', nama: 'Muhammad Hafiy bin Shahrul', tahun: 3, kelas: '3 Arif', jantina: 'Lelaki', rumahSukan: 'Biru' },
  { id: 'B-3003', nama: 'Damia Adriana binti Fauzi', tahun: 3, kelas: '3 Fleksibel', jantina: 'Perempuan', rumahSukan: 'Biru' },
  { id: 'B-3004', nama: 'Aiman Faris bin Kamarudin', tahun: 3, kelas: '3 Bestari', jantina: 'Lelaki', rumahSukan: 'Biru' },
  { id: 'B-3005', nama: 'Celeste Wong Xin Rou', tahun: 3, kelas: '3 Bestari', jantina: 'Perempuan', rumahSukan: 'Biru' },
  { id: 'B-3006', nama: 'Daniel Irfan bin Radzi', tahun: 3, kelas: '3 Cekal', jantina: 'Lelaki', rumahSukan: 'Biru' },
  { id: 'B-3007', nama: 'Kavitha a/p Ganesan', tahun: 3, kelas: '3 Cekal', jantina: 'Perempuan', rumahSukan: 'Biru' },
  { id: 'B-3008', nama: 'Mohd Alif bin Iskandar', tahun: 3, kelas: '3 Dinamik', jantina: 'Lelaki', rumahSukan: 'Biru' },
  { id: 'B-3009', nama: 'Nur Batrisyia binti Nazri', tahun: 3, kelas: '3 Dinamik', jantina: 'Perempuan', rumahSukan: 'Biru' },
  { id: 'B-3010', nama: 'Zarif Irfan bin Zaidi', tahun: 3, kelas: '3 Efisien', jantina: 'Lelaki', rumahSukan: 'Biru' },
  { id: 'B-3011', nama: 'Zara Natasha binti Farid', tahun: 3, kelas: '3 Efisien', jantina: 'Perempuan', rumahSukan: 'Biru' },

  // ==============================================================
  // TAHUN 4 (Arif, Bestari, Cekal, Dinamik, Efisien, Fleksibel)
  // ==============================================================
  { id: 'M-4001', nama: 'Haziq Rayyan bin Radzi', tahun: 4, kelas: '4 Dinamik', jantina: 'Lelaki', rumahSukan: 'Merah' },
  { id: 'M-4002', nama: 'Syakir bin Mansor', tahun: 4, kelas: '4 Dinamik', jantina: 'Lelaki', rumahSukan: 'Merah' },
  { id: 'M-4003', nama: 'Amirul Asyraf bin Zaki', tahun: 4, kelas: '4 Dinamik', jantina: 'Lelaki', rumahSukan: 'Merah' },
  { id: 'M-4004', nama: 'Danial Hakim bin Razak', tahun: 4, kelas: '4 Dinamik', jantina: 'Lelaki', rumahSukan: 'Merah' },
  { id: 'M-4005', nama: 'Nur Farhana binti Zulkifli', tahun: 4, kelas: '4 Arif', jantina: 'Perempuan', rumahSukan: 'Merah' },
  { id: 'K-4001', nama: 'Afiq Iskandar bin Norman', tahun: 4, kelas: '4 Dinamik', jantina: 'Lelaki', rumahSukan: 'Kuning' },
  { id: 'K-4002', nama: 'Thivagar a/l Selvam', tahun: 4, kelas: '4 Dinamik', jantina: 'Lelaki', rumahSukan: 'Kuning' },
  { id: 'H-4001', nama: 'Bryan Lee Jun Hao', tahun: 4, kelas: '4 Dinamik', jantina: 'Lelaki', rumahSukan: 'Hijau' },
  { id: 'H-4002', nama: 'Harith Danial bin Roslan', tahun: 4, kelas: '4 Dinamik', jantina: 'Lelaki', rumahSukan: 'Hijau' },
  { id: 'B-4001', nama: 'Aiman Danish bin Hairi', tahun: 4, kelas: '4 Dinamik', jantina: 'Lelaki', rumahSukan: 'Biru' },
  { id: 'B-4002', nama: 'Nicholas Wong Chun Kit', tahun: 4, kelas: '4 Dinamik', jantina: 'Lelaki', rumahSukan: 'Biru' },

  // ==============================================================
  // TAHUN 5 (Arif, Bestari, Cekal, Dinamik, Efisien, Fleksibel)
  // ==============================================================
  { id: 'M-5001', nama: 'Luqman Hakim bin Latif', tahun: 5, kelas: '5 Efisien', jantina: 'Lelaki', rumahSukan: 'Merah' },
  { id: 'M-5002', nama: 'Amirul Faiz bin Jamaluddin', tahun: 5, kelas: '5 Arif', jantina: 'Lelaki', rumahSukan: 'Merah' },
  { id: 'K-5001', nama: 'Muaz bin Syamsul', tahun: 5, kelas: '5 Efisien', jantina: 'Lelaki', rumahSukan: 'Kuning' },
  { id: 'H-5001', nama: 'Hassan Basri bin Othman', tahun: 5, kelas: '5 Efisien', jantina: 'Lelaki', rumahSukan: 'Hijau' },
  { id: 'B-5001', nama: 'Zarif Irfan bin Zaidi', tahun: 5, kelas: '5 Efisien', jantina: 'Lelaki', rumahSukan: 'Biru' },

  // ==============================================================
  // TAHUN 6 (Arif, Bestari, Cekal, Dinamik, Efisien, Fleksibel)
  // ==============================================================
  { id: 'M-6001', nama: 'Mohd Alif bin Kamaruzaman', tahun: 6, kelas: '6 Fleksibel', jantina: 'Lelaki', rumahSukan: 'Merah' },
  { id: 'M-6002', nama: 'Syafiq Danial bin Sabri', tahun: 6, kelas: '6 Arif', jantina: 'Lelaki', rumahSukan: 'Merah' },
  { id: 'K-6001', nama: 'Hariz Fikri bin Johari', tahun: 6, kelas: '6 Fleksibel', jantina: 'Lelaki', rumahSukan: 'Kuning' },
  { id: 'H-6001', nama: 'Imran Syazwan bin Mazlan', tahun: 6, kelas: '6 Fleksibel', jantina: 'Lelaki', rumahSukan: 'Hijau' },
  { id: 'B-6001', nama: 'Wan Muhammad Ariff bin Wan Rosli', tahun: 6, kelas: '6 Fleksibel', jantina: 'Lelaki', rumahSukan: 'Biru' }
];
