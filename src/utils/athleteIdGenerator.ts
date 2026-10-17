import { PendaftaranAcara, RumahSukan } from '../types';

/**
 * Prefix kod rumah sukan:
 * Merah -> M
 * Kuning -> K
 * Hijau -> H
 * Biru -> B
 */
export const RUMAH_PREFIX_MAP: Record<RumahSukan, string> = {
  Merah: 'M',
  Kuning: 'K',
  Hijau: 'H',
  Biru: 'B',
};

/**
 * Menjana atau mendapatkan ID Peserta rasmi automatik untuk murid yang dipilih dalam acara.
 * ID Murid / No. Peserta hanya diberikan kepada peserta yang didaftarkan dalam acara mengikut:
 * - Pra Sekolah: PRA-M01, PRA-M02, PRA-K01, dsb.
 * - Tahun 1 hingga 6: M-1001, M-2001, M-3001, K-3001, H-3001, B-3001, dsb.
 * 
 * Sekiranya murid sudah pernah didaftarkan dalam acara terdahulu, ID Peserta sedia ada dikekalkan.
 */
export function getOrGeneratePesertaId(
  murid: { id: string; nama: string; tahun: number; rumahSukan: RumahSukan },
  pendaftaranList: PendaftaranAcara[],
  currentBatchAssignedIds: Map<string, string> = new Map()
): string {
  // 1. Semak jika murid telah diberikan ID dalam batch semasa pendaftaran ini
  if (currentBatchAssignedIds.has(murid.id)) {
    return currentBatchAssignedIds.get(murid.id)!;
  }

  // 2. Semak jika murid telah didaftarkan dalam mana-mana pendaftaran terdahulu
  for (const reg of pendaftaranList) {
    for (const peserta of reg.peserta) {
      if (
        peserta.muridId === murid.id ||
        (peserta.nama.trim().toLowerCase() === murid.nama.trim().toLowerCase() &&
          peserta.rumahSukan === murid.rumahSukan &&
          peserta.tahun === murid.tahun)
      ) {
        if (peserta.idPeserta) {
          currentBatchAssignedIds.set(murid.id, peserta.idPeserta);
          return peserta.idPeserta;
        }
        // Jika format muridId sudah mematuhi pola ID peserta rasmi
        if (/^(PRA-[MKHB]\d{2,3}|[MKHB]-\d{4,5})$/i.test(peserta.muridId)) {
          currentBatchAssignedIds.set(murid.id, peserta.muridId.toUpperCase());
          return peserta.muridId.toUpperCase();
        }
      }
    }
  }

  // 3. Jika belum ada, jana nombor ID Peserta berurutan baharu mengikut Rumah & Tahun
  const housePrefix = RUMAH_PREFIX_MAP[murid.rumahSukan] || 'M';
  const tahun = Number(murid.tahun);

  // Kumpul semua ID sedia ada dalam sistem dan batch pendaftaran semasa
  const existingIds = new Set<string>();
  pendaftaranList.forEach((reg) => {
    reg.peserta.forEach((p) => {
      if (p.idPeserta) existingIds.add(p.idPeserta.toUpperCase());
      if (p.muridId) existingIds.add(p.muridId.toUpperCase());
    });
  });
  currentBatchAssignedIds.forEach((id) => existingIds.add(id.toUpperCase()));

  if (tahun === 0) {
    // Pra Sekolah: Format PRA-M01, PRA-M02...
    const prefix = `PRA-${housePrefix}`;
    let maxSeq = 0;
    existingIds.forEach((id) => {
      const regex = new RegExp(`^PRA-${housePrefix}(\\d+)$`, 'i');
      const match = id.match(regex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    });

    const nextNum = maxSeq + 1;
    const generatedId = `${prefix}${String(nextNum).padStart(2, '0')}`;
    currentBatchAssignedIds.set(murid.id, generatedId);
    return generatedId;
  } else {
    // Tahun 1 hingga 6: Format M-1001, M-3001, K-3001...
    const prefix = `${housePrefix}-${tahun}`;
    let maxSeq = 0;
    existingIds.forEach((id) => {
      const regex = new RegExp(`^${housePrefix}-${tahun}(\\d{3})$`, 'i');
      const match = id.match(regex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    });

    const nextSeq = maxSeq + 1;
    const generatedId = `${prefix}${String(nextSeq).padStart(3, '0')}`;
    currentBatchAssignedIds.set(murid.id, generatedId);
    return generatedId;
  }
}
