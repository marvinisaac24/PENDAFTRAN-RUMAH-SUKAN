import * as XLSX from 'xlsx';
import { AcaraSukan, PendaftaranAcara, RumahSukan } from '../types';
import { SENARAI_RUMAH_KEYS } from '../data/constants';

/**
 * Modul Eksport Rasmi Kejohanan Sukan Olahraga SK Tudan 2026
 * Menjana laporan Excel multi-lembaran (.xlsx) dan CSV yang lengkap, tepat,
 * dan terperinci mengikut jenis acara dan 4 Rumah Sukan (Merah, Kuning, Hijau, Biru).
 */

export interface ExportReportOptions {
  namaKejohanan?: string;
  namaSekolah?: string;
  tahun?: number;
}

export function exportLaporanPendaftaranLengkapExcel(
  pendaftaranList: PendaftaranAcara[],
  acaraList: AcaraSukan[],
  options: ExportReportOptions = {}
): void {
  const {
    namaKejohanan = 'KEJOHANAN SUKAN OLAHRAGA TAHUNAN SK TUDAN 2026',
    namaSekolah = 'SK TUDAN, MIRI',
    tahun = 2026,
  } = options;

  const wb = XLSX.utils.book_new();

  // Map pendaftaran mengikut acaraId -> rumahSukan -> pendaftaran
  const regMap = new Map<string, Map<RumahSukan, PendaftaranAcara>>();
  pendaftaranList.forEach((reg) => {
    if (!regMap.has(reg.acaraId)) {
      regMap.set(reg.acaraId, new Map());
    }
    regMap.get(reg.acaraId)!.set(reg.rumahSukan, reg);
  });

  // --------------------------------------------------------------------------
  // LEMBARAN 1: SENARAI INDUK TERPERINCI MENGIKUT ACARA & RUMAH
  // --------------------------------------------------------------------------
  const sheet1Rows: Record<string, string | number>[] = [];
  let rowNumber = 1;

  // Susun acara mengikut tahun dan kod acara
  const sortedAcara = [...acaraList].sort((a, b) => {
    const minA = Math.min(...a.tahunKelayakan);
    const minB = Math.min(...b.tahunKelayakan);
    if (minA !== minB) return minA - minB;
    return a.kod.localeCompare(b.kod, undefined, { numeric: true });
  });

  sortedAcara.forEach((acara) => {
    const houseMap = regMap.get(acara.id);

    // Untuk setiap rumah sukan (Merah, Kuning, Hijau, Biru)
    SENARAI_RUMAH_KEYS.forEach((rumah) => {
      const reg = houseMap?.get(rumah);
      if (reg && reg.peserta.length > 0) {
        reg.peserta.forEach((peserta, idx) => {
          let perananDisplay = peserta.peranan;
          if (!perananDisplay) {
            if (acara.kategori === 'Padang') {
              perananDisplay = idx === 0 ? 'Pemain Utama' : 'Pemain Simpanan';
            } else if (acara.jenis === 'Berkumpulan') {
              perananDisplay = `Pelari ${idx + 1}`;
            } else {
              perananDisplay = 'Peserta Utama';
            }
          }

          sheet1Rows.push({
            'Bil': rowNumber++,
            'Kategori Acara': acara.kategori,
            'Kod Acara': acara.kod,
            'Nama Acara': acara.nama,
            'Tahun Kelayakan': acara.tahunKelayakan[0] === 0 ? 'Pra Sekolah' : `Tahun ${acara.tahunKelayakan.join(', ')}`,
            'Kategori Jantina': acara.kategoriJantina,
            'Masa Acara': acara.masa || '-',
            'Rumah Sukan': `Rumah ${rumah}`,
            'Peranan Atlet': perananDisplay,
            'No. Peserta MSSR': peserta.idPeserta || peserta.muridId || '-',
            'Nama Murid / Atlet': peserta.nama,
            'Tahun Murid': peserta.tahun === 0 ? 'Pra' : peserta.tahun,
            'Kelas': peserta.kelas,
            'Jantina': peserta.jantina,
            'Catatan': reg.catatan || acara.catatan || '',
          });
        });
      }
    });
  });

  const ws1 = XLSX.utils.json_to_sheet(sheet1Rows.length > 0 ? sheet1Rows : [{
    'Bil': '-',
    'Kategori Acara': '-',
    'Kod Acara': '-',
    'Nama Acara': 'Tiada pendaftaran direkodkan setakat ini',
    'Tahun Kelayakan': '-',
    'Kategori Jantina': '-',
    'Masa Acara': '-',
    'Rumah Sukan': '-',
    'Peranan Atlet': '-',
    'No. Peserta MSSR': '-',
    'Nama Murid / Atlet': '-',
    'Tahun Murid': '-',
    'Kelas': '-',
    'Jantina': '-',
    'Catatan': '-',
  }]);

  ws1['!cols'] = [
    { wch: 6 },  // Bil
    { wch: 14 }, // Kategori Acara
    { wch: 12 }, // Kod
    { wch: 36 }, // Nama Acara
    { wch: 16 }, // Tahun Kelayakan
    { wch: 16 }, // Jantina
    { wch: 12 }, // Masa
    { wch: 16 }, // Rumah Sukan
    { wch: 22 }, // Peranan Atlet
    { wch: 18 }, // No Peserta MSSR
    { wch: 32 }, // Nama Murid
    { wch: 12 }, // Tahun Murid
    { wch: 14 }, // Kelas
    { wch: 12 }, // Jantina
    { wch: 25 }, // Catatan
  ];

  XLSX.utils.book_append_sheet(wb, ws1, 'Induk Acara & 4 Rumah');

  // --------------------------------------------------------------------------
  // LEMBARAN 2: MATRIKS 4 RUMAH SUKAN (MERAH, KUNING, HIJAU, BIRU BERDAMPINGAN)
  // Format khas untuk rujukan guru & hakim di padang
  // --------------------------------------------------------------------------
  const matriksRows: Record<string, string | number>[] = [];
  sortedAcara.forEach((acara, idx) => {
    const houseMap = regMap.get(acara.id);

    const formatPesertaRumah = (rumah: RumahSukan) => {
      const reg = houseMap?.get(rumah);
      if (!reg || reg.peserta.length === 0) return 'Belum Daftar';
      return reg.peserta
        .map((p) => {
          const id = p.idPeserta || p.muridId;
          const role = p.peranan ? ` [${p.peranan}]` : '';
          return `${p.nama} (${p.kelas}) - ${id}${role}`;
        })
        .join('; ');
    };

    matriksRows.push({
      'Bil': idx + 1,
      'Kod': acara.kod,
      'Kategori': acara.kategori,
      'Nama Acara': acara.nama,
      'Tahun': acara.tahunKelayakan[0] === 0 ? 'Pra Sekolah' : `Tahun ${acara.tahunKelayakan.join(',')}`,
      'Jantina': acara.kategoriJantina,
      'Masa': acara.masa || '-',
      'RUMAH MERAH': formatPesertaRumah('Merah'),
      'RUMAH KUNING': formatPesertaRumah('Kuning'),
      'RUMAH HIJAU': formatPesertaRumah('Hijau'),
      'RUMAH BIRU': formatPesertaRumah('Biru'),
    });
  });

  const ws2 = XLSX.utils.json_to_sheet(matriksRows);
  ws2['!cols'] = [
    { wch: 6 },
    { wch: 10 },
    { wch: 14 },
    { wch: 34 },
    { wch: 14 },
    { wch: 12 },
    { wch: 10 },
    { wch: 38 }, // Rumah Merah
    { wch: 38 }, // Rumah Kuning
    { wch: 38 }, // Rumah Hijau
    { wch: 38 }, // Rumah Biru
  ];
  XLSX.utils.book_append_sheet(wb, ws2, 'Matriks 4 Rumah Sukan');

  // --------------------------------------------------------------------------
  // LEMBARAN 3 - 6: LEMBARAN KHAS BAGI SETIAP RUMAH SUKAN (MERAH, KUNING, HIJAU, BIRU)
  // --------------------------------------------------------------------------
  SENARAI_RUMAH_KEYS.forEach((rumah) => {
    const houseRows: Record<string, string | number>[] = [];
    let houseIndex = 1;

    sortedAcara.forEach((acara) => {
      const reg = regMap.get(acara.id)?.get(rumah);
      if (reg && reg.peserta.length > 0) {
        reg.peserta.forEach((p, pIdx) => {
          let perananDisplay = p.peranan;
          if (!perananDisplay) {
            if (acara.kategori === 'Padang') {
              perananDisplay = pIdx === 0 ? 'Pemain Utama' : 'Pemain Simpanan';
            } else if (acara.jenis === 'Berkumpulan') {
              perananDisplay = `Pelari ${pIdx + 1}`;
            } else {
              perananDisplay = 'Peserta Utama';
            }
          }

          houseRows.push({
            'Bil': houseIndex++,
            'Kategori': acara.kategori,
            'Kod Acara': acara.kod,
            'Nama Acara': acara.nama,
            'Peranan': perananDisplay,
            'No. Peserta MSSR': p.idPeserta || p.muridId || '-',
            'Nama Atlet': p.nama,
            'Tahun': p.tahun === 0 ? 'Pra' : p.tahun,
            'Kelas': p.kelas,
            'Jantina': p.jantina,
            'Masa': acara.masa || '-',
            'Catatan Guru': reg.catatan || '',
          });
        });
      }
    });

    const wsHouse = XLSX.utils.json_to_sheet(houseRows.length > 0 ? houseRows : [{
      'Bil': '-',
      'Kategori': '-',
      'Kod Acara': '-',
      'Nama Acara': `Tiada pendaftaran untuk Rumah ${rumah}`,
      'Peranan': '-',
      'No. Peserta MSSR': '-',
      'Nama Atlet': '-',
      'Tahun': '-',
      'Kelas': '-',
      'Jantina': '-',
      'Masa': '-',
      'Catatan Guru': '-',
    }]);

    wsHouse['!cols'] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 12 },
      { wch: 34 },
      { wch: 22 },
      { wch: 18 },
      { wch: 32 },
      { wch: 8 },
      { wch: 14 },
      { wch: 10 },
      { wch: 10 },
      { wch: 24 },
    ];

    XLSX.utils.book_append_sheet(wb, wsHouse, `Rumah ${rumah}`);
  });

  // Jana nama fail yang kemas dan profesional
  const tarikhStr = new Date().toISOString().slice(0, 10);
  const fileName = `Senarai_Peserta_Acara_SK_TUDAN_${tahun}_${tarikhStr}.xlsx`;

  XLSX.writeFile(wb, fileName);
}

/**
 * Muat turun CSV Ringkasan Acara & Peserta Rumah Sukan
 */
export function exportLaporanPendaftaranCSV(
  pendaftaranList: PendaftaranAcara[],
  acaraList: AcaraSukan[]
): void {
  const flatRows: Record<string, string | number>[] = [];
  const acaraMap = new Map<string, AcaraSukan>();
  acaraList.forEach((a) => acaraMap.set(a.id, a));

  let no = 1;
  pendaftaranList.forEach((reg) => {
    const acara = acaraMap.get(reg.acaraId);
    reg.peserta.forEach((p, idx) => {
      let peranan = p.peranan;
      if (!peranan) {
        if (acara?.kategori === 'Padang') {
          peranan = idx === 0 ? 'Pemain Utama' : 'Pemain Simpanan';
        } else if (reg.peserta.length > 1) {
          peranan = `Pelari ${idx + 1}`;
        } else {
          peranan = 'Peserta Utama';
        }
      }

      flatRows.push({
        'Bil': no++,
        'ID Pendaftaran': reg.id,
        'Kategori Acara': acara?.kategori || 'Sukan',
        'Kod Acara': acara?.kod || '-',
        'Nama Acara': reg.acaraNama,
        'Rumah Sukan': reg.rumahSukan,
        'Peranan': peranan,
        'No. Peserta MSSR': p.idPeserta || p.muridId,
        'Nama Murid': p.nama,
        'Tahun': p.tahun === 0 ? 'Pra Sekolah' : p.tahun,
        'Kelas': p.kelas,
        'Jantina': p.jantina,
        'Masa Acara': acara?.masa || '-',
        'Tarikh Daftar': new Date(reg.tarikhDaftar).toLocaleDateString('ms-MY'),
        'Catatan': reg.catatan || '',
      });
    });
  });

  const ws = XLSX.utils.json_to_sheet(flatRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Pendaftaran Acara');
  const tarikhStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Laporan_Pendaftaran_Acara_SK_TUDAN_${tarikhStr}.csv`, {
    bookType: 'csv',
  });
}
