import * as XLSX from 'xlsx';
import { AcaraSukan, Murid, PendaftaranAcara, RumahSukan } from '../types';

export interface SportsReportData {
  acaraList: AcaraSukan[];
  pendaftaranList: PendaftaranAcara[];
  muridList?: Murid[];
}

const RUMAH_LIST: RumahSukan[] = ['Merah', 'Kuning', 'Hijau', 'Biru'];

/**
 * Format string peserta untuk paparan sel matriks
 */
function formatPesertaListCell(pendaftaran?: PendaftaranAcara): string {
  if (!pendaftaran || !pendaftaran.peserta || pendaftaran.peserta.length === 0) {
    return '- Belum Didaftar -';
  }
  return pendaftaran.peserta
    .map((p, idx) => {
      const perananStr = p.peranan ? ` [${p.peranan}]` : (idx === 0 ? ' [Utama]' : '');
      const noStr = p.idPeserta ? ` (${p.idPeserta})` : '';
      return `${idx + 1}. ${p.nama}${noStr} - ${p.kelas}${perananStr}`;
    })
    .join('\n');
}

/**
 * Jana Buku Kerja Excel Lengkap dengan Lembaran Multi-Tab
 * Mengandungi:
 * 1. Matriks Lengkap Acara x 4 Rumah Sukan (Merah, Kuning, Hijau, Biru)
 * 2. Lembaran Khusus Rumah Merah
 * 3. Lembaran Khusus Rumah Kuning
 * 4. Lembaran Khusus Rumah Hijau
 * 5. Lembaran Khusus Rumah Biru
 * 6. Senarai Induk Semua Peserta Terpilih
 */
export function exportMasterSportsWorkbook({
  acaraList,
  pendaftaranList,
  muridList = [],
}: SportsReportData): void {
  const wb = XLSX.utils.book_new();

  // Peta pendaftaran mengikut acaraId & RumahSukan
  const regMap = new Map<string, Map<RumahSukan, PendaftaranAcara>>();
  pendaftaranList.forEach((reg) => {
    if (!regMap.has(reg.acaraId)) {
      regMap.set(reg.acaraId, new Map());
    }
    regMap.get(reg.acaraId)!.set(reg.rumahSukan, reg);
  });

  // Susun acara mengikut tahun & masa/kategori
  const sortedAcara = [...acaraList].sort((a, b) => {
    const minA = Math.min(...a.tahunKelayakan);
    const minB = Math.min(...b.tahunKelayakan);
    if (minA !== minB) return minA - minB;
    if (a.masa && b.masa && a.masa !== b.masa) return a.masa.localeCompare(b.masa);
    return a.kod.localeCompare(b.kod, undefined, { numeric: true });
  });

  // =========================================================================
  // LEMBARAN 1: Matriks Acara & 4 Rumah Sukan
  // =========================================================================
  const matrixRows = sortedAcara.map((acara, index) => {
    const houseMap = regMap.get(acara.id) || new Map();
    const regMerah = houseMap.get('Merah');
    const regKuning = houseMap.get('Kuning');
    const regHijau = houseMap.get('Hijau');
    const regBiru = houseMap.get('Biru');

    let registeredHousesCount = 0;
    if (regMerah && regMerah.peserta.length > 0) registeredHousesCount++;
    if (regKuning && regKuning.peserta.length > 0) registeredHousesCount++;
    if (regHijau && regHijau.peserta.length > 0) registeredHousesCount++;
    if (regBiru && regBiru.peserta.length > 0) registeredHousesCount++;

    const tahunLabel =
      acara.tahunKelayakan.length === 1 && acara.tahunKelayakan[0] === 0
        ? 'Pra Sekolah'
        : `Tahun ${acara.tahunKelayakan.join(', ')}`;

    return {
      'No.': index + 1,
      'Kod Acara': acara.kod,
      'Nama Acara': acara.nama,
      'Kategori': acara.kategori,
      'Tahun Kelayakan': tahunLabel,
      'Jantina': acara.jantina,
      'Masa / Jadual': acara.masa || '-',
      '🔴 RUMAH MERAH': formatPesertaListCell(regMerah),
      '🟡 RUMAH KUNING': formatPesertaListCell(regKuning),
      '🟢 RUMAH HIJAU': formatPesertaListCell(regHijau),
      '🔵 RUMAH BIRU': formatPesertaListCell(regBiru),
      'Status Pendaftaran': `${registeredHousesCount}/4 Rumah (${registeredHousesCount === 4 ? 'Lengkap' : 'Belum Lengkap'})`,
    };
  });

  const wsMatrix = XLSX.utils.json_to_sheet(matrixRows);
  wsMatrix['!cols'] = [
    { wch: 6 },   // No
    { wch: 12 },  // Kod
    { wch: 32 },  // Nama Acara
    { wch: 14 },  // Kategori
    { wch: 16 },  // Tahun Kelayakan
    { wch: 12 },  // Jantina
    { wch: 14 },  // Masa
    { wch: 38 },  // Merah
    { wch: 38 },  // Kuning
    { wch: 38 },  // Hijau
    { wch: 38 },  // Biru
    { wch: 22 },  // Status
  ];
  XLSX.utils.book_append_sheet(wb, wsMatrix, 'Matriks Acara & 4 Rumah');

  // =========================================================================
  // LEMBARAN 2 - 5: Lembaran Khas bagi Setiap Rumah Sukan
  // =========================================================================
  RUMAH_LIST.forEach((rumah) => {
    const houseRows: Record<string, string | number>[] = [];
    let count = 1;

    sortedAcara.forEach((acara) => {
      const houseMap = regMap.get(acara.id);
      const reg = houseMap?.get(rumah);

      if (reg && reg.peserta && reg.peserta.length > 0) {
        reg.peserta.forEach((p, pIdx) => {
          let perananLabel = p.peranan || '';
          if (!perananLabel) {
            if (acara.kategori === 'Padang') {
              perananLabel = pIdx === 0 ? 'Pemain Utama' : 'Pemain Simpanan';
            } else if (reg.peserta.length > 1) {
              perananLabel = `Pelari ${pIdx + 1}`;
            } else {
              perananLabel = 'Peserta Utama';
            }
          }

          houseRows.push({
            'Bil.': count++,
            'Kod Acara': acara.kod,
            'Nama Acara': acara.nama,
            'Kategori': acara.kategori,
            'Rumah Sukan': rumah,
            'Peranan': perananLabel,
            'No. Peserta MSSR': p.idPeserta || p.muridId || '-',
            'Nama Peserta': p.nama,
            'Tahun': p.tahun === 0 ? 'Pra Sekolah' : p.tahun,
            'Kelas': p.kelas,
            'Jantina': p.jantina,
            'Catatan': reg.catatan || '',
          });
        });
      }
    });

    const sheetName = `Rumah ${rumah}`;
    const wsHouse = XLSX.utils.json_to_sheet(
      houseRows.length > 0
        ? houseRows
        : [
            {
              'Bil.': 1,
              'Kod Acara': '-',
              'Nama Acara': 'Tiada pendaftaran untuk rumah ini setakat ini',
              'Kategori': '-',
              'Rumah Sukan': rumah,
              'Peranan': '-',
              'No. Peserta MSSR': '-',
              'Nama Peserta': '-',
              'Tahun': '-',
              'Kelas': '-',
              'Jantina': '-',
              'Catatan': '-',
            },
          ]
    );

    wsHouse['!cols'] = [
      { wch: 6 },
      { wch: 12 },
      { wch: 30 },
      { wch: 14 },
      { wch: 14 },
      { wch: 18 },
      { wch: 18 },
      { wch: 34 },
      { wch: 12 },
      { wch: 14 },
      { wch: 10 },
      { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(wb, wsHouse, sheetName);
  });

  // =========================================================================
  // LEMBARAN 6: Senarai Induk Semua Peserta (Master Participant Roster)
  // =========================================================================
  const allParticipantsMap = new Map<
    string,
    {
      idPeserta: string;
      nama: string;
      tahun: number | string;
      kelas: string;
      jantina: string;
      rumahSukan: RumahSukan;
      acaraJoined: string[];
      perananList: string[];
    }
  >();

  pendaftaranList.forEach((reg) => {
    reg.peserta.forEach((p) => {
      const key = `${p.muridId || p.nama.trim().toUpperCase()}_${reg.rumahSukan}`;
      const existing = allParticipantsMap.get(key);
      const acaraInfo = `${reg.acaraNama} (${p.peranan || 'Utama'})`;

      if (existing) {
        if (!existing.acaraJoined.includes(acaraInfo)) {
          existing.acaraJoined.push(acaraInfo);
        }
      } else {
        allParticipantsMap.set(key, {
          idPeserta: p.idPeserta || p.muridId || '-',
          nama: p.nama,
          tahun: p.tahun === 0 ? 'Pra Sekolah' : p.tahun,
          kelas: p.kelas,
          jantina: p.jantina,
          rumahSukan: reg.rumahSukan,
          acaraJoined: [acaraInfo],
          perananList: p.peranan ? [p.peranan] : [],
        });
      }
    });
  });

  const masterRows = Array.from(allParticipantsMap.values())
    .sort((a, b) => {
      // Susun mengikut Rumah Sukan, kemudian Kelas, kemudian Nama
      if (a.rumahSukan !== b.rumahSukan) {
        return a.rumahSukan.localeCompare(b.rumahSukan);
      }
      if (a.kelas !== b.kelas) {
        return a.kelas.localeCompare(b.kelas, undefined, { numeric: true });
      }
      return a.nama.localeCompare(b.nama);
    })
    .map((item, idx) => ({
      'Bil.': idx + 1,
      'Rumah Sukan': item.rumahSukan,
      'No. Peserta MSSR': item.idPeserta,
      'Nama Murid': item.nama,
      'Tahun': item.tahun,
      'Kelas': item.kelas,
      'Jantina': item.jantina,
      'Jumlah Acara': item.acaraJoined.length,
      'Senarai Acara Disertai': item.acaraJoined.join('; '),
    }));

  const wsMaster = XLSX.utils.json_to_sheet(
    masterRows.length > 0
      ? masterRows
      : [
          {
            'Bil.': 1,
            'Rumah Sukan': '-',
            'No. Peserta MSSR': '-',
            'Nama Murid': 'Tiada peserta didaftarkan lagi',
            'Tahun': '-',
            'Kelas': '-',
            'Jantina': '-',
            'Jumlah Acara': 0,
            'Senarai Acara Disertai': '-',
          },
        ]
  );

  wsMaster['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 18 },
    { wch: 34 },
    { wch: 12 },
    { wch: 14 },
    { wch: 10 },
    { wch: 14 },
    { wch: 50 },
  ];
  XLSX.utils.book_append_sheet(wb, wsMaster, 'Senarai Induk Peserta');

  // Muat turun fail Excel
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `Senarai_Penyertaan_Sukan_4_Rumah_MSSR_${dateStr}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Muat turun senarai peserta bagi Satu Rumah Sukan Sahaja (Merah / Kuning / Hijau / Biru)
 */
export function exportSingleHouseReport(
  rumah: RumahSukan,
  pendaftaranList: PendaftaranAcara[],
  acaraList: AcaraSukan[],
  format: 'xlsx' | 'csv' = 'xlsx'
): void {
  const houseRegs = pendaftaranList.filter((r) => r.rumahSukan === rumah);
  const acaraMap = new Map<string, AcaraSukan>();
  acaraList.forEach((a) => acaraMap.set(a.id, a));

  const rows: Record<string, string | number>[] = [];
  let count = 1;

  houseRegs.forEach((reg) => {
    const acara = acaraMap.get(reg.acaraId);
    const kod = acara?.kod || '-';
    const kategori = acara?.kategori || '-';

    reg.peserta.forEach((p, idx) => {
      let peranan = p.peranan;
      if (!peranan) {
        if (kategori === 'Padang') {
          peranan = idx === 0 ? 'Pemain Utama' : 'Pemain Simpanan';
        } else if (reg.peserta.length > 1) {
          peranan = `Pelari ${idx + 1}`;
        } else {
          peranan = 'Peserta Utama';
        }
      }

      rows.push({
        'Bil.': count++,
        'Rumah Sukan': rumah,
        'Kod Acara': kod,
        'Nama Acara': reg.acaraNama,
        'Kategori': kategori,
        'Peranan': peranan,
        'No. Peserta MSSR': p.idPeserta || p.muridId || '-',
        'Nama Murid': p.nama,
        'Tahun': p.tahun === 0 ? 'Pra Sekolah' : p.tahun,
        'Kelas': p.kelas,
        'Jantina': p.jantina,
        'Catatan': reg.catatan || '',
      });
    });
  });

  const ws = XLSX.utils.json_to_sheet(
    rows.length > 0
      ? rows
      : [
          {
            'Bil.': 1,
            'Rumah Sukan': rumah,
            'Kod Acara': '-',
            'Nama Acara': `Tiada rekod pendaftaran untuk Rumah ${rumah}`,
            'Kategori': '-',
            'Peranan': '-',
            'No. Peserta MSSR': '-',
            'Nama Murid': '-',
            'Tahun': '-',
            'Kelas': '-',
            'Jantina': '-',
            'Catatan': '-',
          },
        ]
  );

  ws['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 12 },
    { wch: 32 },
    { wch: 14 },
    { wch: 18 },
    { wch: 18 },
    { wch: 34 },
    { wch: 12 },
    { wch: 14 },
    { wch: 10 },
    { wch: 20 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Rumah ${rumah}`);

  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `Senarai_Peserta_Rumah_${rumah}_${dateStr}.${format}`;
  XLSX.writeFile(wb, fileName, { bookType: format });
}
