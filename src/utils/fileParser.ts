import * as XLSX from 'xlsx';
import { HasilPratontonMuatNaik, Jantina, Murid, RekodPratontonMurid, RumahSukan } from '../types';

// Robust normalization of column headers to handle Malaysian school formats and English variations
function normalizeHeader(rawHeader: string): string {
  if (!rawHeader) return '';
  const text = String(rawHeader).trim();
  const clean = text.toLowerCase().replace(/[^a-z0-9]/g, '');
  const lower = text.toLowerCase();

  // 0. Explicit ignore for serial row numbering ('bil', 'bilangan', 'no.', 'no', '#', 'seq')
  if (
    clean === 'bil' ||
    clean === 'bilangan' ||
    clean === 'no' ||
    clean === 'nombor' ||
    clean === 'seq' ||
    clean === 'num' ||
    clean === 'index'
  ) {
    return 'bil';
  }

  // 1. Nama Murid (MUST check BEFORE 'id' because 'namamurid' ends with 'id'!)
  if (
    clean.includes('nama') ||
    lower.includes('name') ||
    clean === 'murid' ||
    clean === 'pelajar' ||
    clean === 'student'
  ) {
    return 'nama';
  }

  // 2. No. Pengenalan / MyKid / No. Kad Pengenalan / No. Sijil Lahir
  if (
    clean.includes('pengenalan') ||
    clean.includes('mykid') ||
    clean.includes('sijillahir') ||
    clean.includes('sijil') ||
    clean.includes('nokp') ||
    clean.includes('kadpengenalan') ||
    clean.includes('icno') ||
    clean.includes('nric') ||
    clean.includes('sbno') ||
    lower.includes('no pengenalan') ||
    lower.includes('no. pengenalan') ||
    lower.includes('no kp') ||
    lower.includes('no. kp') ||
    lower.includes('no sijil') ||
    lower.includes('no. sijil')
  ) {
    return 'noPengenalan';
  }

  // 2b. Tarikh Lahir (DOB)
  if (
    clean.includes('tarikhlahir') ||
    clean.includes('tlahir') ||
    clean.includes('dob') ||
    clean.includes('birthdate') ||
    clean.includes('birthday') ||
    (clean.includes('tarikh') && clean.includes('lahir')) ||
    lower.includes('tarikh lahir') ||
    lower.includes('t.lahir')
  ) {
    return 'tarikhLahir';
  }

  // 2c. ID Murid / Kod Murid / No Matrik / No Pendaftaran
  if (
    clean === 'id' ||
    clean === 'idmurid' ||
    clean === 'idpelajar' ||
    clean === 'studentid' ||
    clean === 'studentno' ||
    clean.includes('matrik') ||
    clean.includes('pendaftaran') ||
    clean.includes('kodmurid') ||
    lower.includes('id murid') ||
    lower.includes('no id') ||
    lower.includes('no. id') ||
    lower.includes('no matrik') ||
    lower.includes('no. matrik') ||
    lower.includes('no daftar')
  ) {
    return 'idMurid';
  }

  // 3. Tahun / Tingkatan / Darjah
  if (
    clean.includes('tahun') ||
    clean.includes('darjah') ||
    clean.includes('tingkatan') ||
    clean.includes('year') ||
    clean.includes('grade') ||
    clean.includes('standard') ||
    clean === 'thn'
  ) {
    return 'tahun';
  }

  // 4. Kelas
  if (
    clean.includes('kelas') ||
    clean.includes('class') ||
    clean.includes('bilik') ||
    clean === 'kls'
  ) {
    return 'kelas';
  }

  // 5. Jantina
  if (
    clean.includes('jantina') ||
    clean.includes('gender') ||
    clean.includes('sex') ||
    clean === 'j' ||
    clean === 'jant'
  ) {
    return 'jantina';
  }

  // 6. Rumah Sukan
  if (
    clean.includes('rumah') ||
    clean.includes('house') ||
    clean.includes('kumpulan') ||
    clean.includes('pasukan') ||
    clean.includes('warna')
  ) {
    return 'rumahSukan';
  }

  return clean;
}

// Normalize Jantina input
export function normalizeJantina(value: string | undefined): Jantina | null {
  if (!value) return null;
  const val = String(value).trim().toLowerCase();
  if (
    val === 'l' ||
    val === 'lelaki' ||
    val === 'male' ||
    val === 'm' ||
    val === 'boy' ||
    val.startsWith('lel')
  ) {
    return 'Lelaki';
  }
  if (
    val === 'p' ||
    val === 'perempuan' ||
    val === 'female' ||
    val === 'f' ||
    val === 'girl' ||
    val === 'wanita' ||
    val === 'w' ||
    val.startsWith('per')
  ) {
    return 'Perempuan';
  }
  return null;
}

// Normalize Rumah Sukan input
export function normalizeRumahSukan(value: string | undefined): RumahSukan | null {
  if (!value) return null;
  const val = String(value).trim().toLowerCase();
  if (val.includes('merah') || val === 'red' || val.includes('temenggung')) return 'Merah';
  if (val.includes('kuning') || val === 'yellow' || val.includes('bendahara')) return 'Kuning';
  if (val.includes('hijau') || val === 'green' || val.includes('laksamana')) return 'Hijau';
  if (val.includes('biru') || val === 'blue' || val.includes('shahbandar')) return 'Biru';
  return null;
}

// Normalize Tahun input (Supports 0 for Pra Sekolah, 1 to 6 for standard primary)
export function normalizeTahun(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const str = String(value).trim().toLowerCase();
  if (str === '0' || str.includes('pra') || str === 'prasekolah') return 0;
  const match = str.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    if (num >= 0 && num <= 6) return num;
  }
  return null;
}

interface SheetParseResult {
  sheetName: string;
  records: RekodPratontonMurid[];
}

function parseSingleSheet(
  worksheet: XLSX.WorkSheet,
  sheetName: string,
  selectedRumahOverride: RumahSukan | null | undefined,
  existingIds: Set<string>,
  seenIdsInFile: Set<string>,
  sheetRumahSukanDefault: RumahSukan | null,
  globalRowOffset: number
): { records: RekodPratontonMurid[]; nextOffset: number } {
  // Convert worksheet to raw 2D array
  const rawRows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    defval: '',
    blankrows: false,
  });

  if (!rawRows || rawRows.length === 0) {
    return { records: [], nextOffset: globalRowOffset };
  }

  // Find the true header row by scoring each of the first 10 rows
  let bestHeaderRowIndex = 0;
  let maxRecognizedFields = 0;
  let bestNormalizedHeaderMap: Record<number, string> = {};

  const maxScanRows = Math.min(rawRows.length, 10);
  for (let r = 0; r < maxScanRows; r++) {
    const row = rawRows[r];
    if (!Array.isArray(row) || row.length === 0) continue;

    const rowHeaderMap: Record<number, string> = {};
    const recognizedSet = new Set<string>();

    row.forEach((cell, idx) => {
      const cellText = String(cell ?? '').trim();
      if (!cellText) return;
      const normalized = normalizeHeader(cellText);
      if (['nama', 'idMurid', 'noPengenalan', 'tarikhLahir', 'tahun', 'kelas', 'jantina', 'rumahSukan'].includes(normalized)) {
        recognizedSet.add(normalized);
        rowHeaderMap[idx] = normalized;
      } else if (normalized === 'bil') {
        rowHeaderMap[idx] = 'bil';
      }
    });

    if (recognizedSet.size > maxRecognizedFields) {
      maxRecognizedFields = recognizedSet.size;
      bestHeaderRowIndex = r;
      bestNormalizedHeaderMap = rowHeaderMap;
    }
  }

  // Fallback if header not detected with >= 2 fields
  if (maxRecognizedFields < 2) {
    bestHeaderRowIndex = 0;
    bestNormalizedHeaderMap = {};
    const firstRow = (rawRows[0] || []) as unknown[];
    firstRow.forEach((cell, idx) => {
      const cellText = String(cell ?? '').trim();
      if (cellText) {
        bestNormalizedHeaderMap[idx] = normalizeHeader(cellText);
      }
    });
  }

  const sheetRecords: RekodPratontonMurid[] = [];
  let currentRowNum = globalRowOffset;

  for (let r = bestHeaderRowIndex + 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || !Array.isArray(row) || row.every((c) => String(c ?? '').trim() === '')) {
      continue; // Skip blank separator rows
    }

    const rowData: Record<string, string> = {};
    row.forEach((cellVal, colIdx) => {
      const fieldKey = bestNormalizedHeaderMap[colIdx];
      if (fieldKey && fieldKey !== 'bil') {
        if (cellVal instanceof Date && !isNaN(cellVal.getTime())) {
          const dd = String(cellVal.getDate()).padStart(2, '0');
          const mm = String(cellVal.getMonth() + 1).padStart(2, '0');
          const yyyy = cellVal.getFullYear();
          rowData[fieldKey] = `${dd}/${mm}/${yyyy}`;
        } else {
          rowData[fieldKey] = String(cellVal ?? '').trim();
        }
      }
    });

    // Extract raw fields
    let rawId = rowData.idMurid || '';
    const rawNama = rowData.nama || '';
    let rawTahun = rowData.tahun || '';
    const rawKelas = rowData.kelas || '';
    let rawJantina = rowData.jantina || '';
    let rawRumah = selectedRumahOverride || rowData.rumahSukan || sheetRumahSukanDefault || '';
    const rawNoPengenalan = rowData.noPengenalan || '';
    let rawTarikhLahir = rowData.tarikhLahir || '';

    // Auto-detect Tarikh Lahir daripada No. Pengenalan (MyKid / IC) jika tarikh kosong
    if (!rawTarikhLahir && rawNoPengenalan) {
      const digits = rawNoPengenalan.replace(/\D/g, '');
      if (digits.length >= 6) {
        const yy = parseInt(digits.slice(0, 2), 10);
        const mm = digits.slice(2, 4);
        const dd = digits.slice(4, 6);
        const mNum = parseInt(mm, 10);
        const dNum = parseInt(dd, 10);
        if (mNum >= 1 && mNum <= 12 && dNum >= 1 && dNum <= 31) {
          const fullYear = yy <= 30 ? 2000 + yy : 1900 + yy;
          rawTarikhLahir = `${dd}/${mm}/${fullYear}`;
        }
      }
    }

    // Pemformatan ISO YYYY-MM-DD ke DD/MM/YYYY jika diperlukan
    if (rawTarikhLahir) {
      const isoMatch = rawTarikhLahir.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
      if (isoMatch) {
        const [, y, m, d] = isoMatch;
        rawTarikhLahir = `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
      }
    }

    // If completely empty row data extracted, skip
    if (!rawId && !rawNama && !rawTahun && !rawKelas && !rawNoPengenalan) {
      continue;
    }

    currentRowNum++;
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Validation: Nama Murid
    if (!rawNama) {
      errors.push('Medan Nama Murid kosong');
    }

    // 2. Intelligent Auto-Inference: Tahun from Kelas if missing
    if (!rawTahun && rawKelas) {
      const match = rawKelas.match(/\b([1-6])\b/) || rawKelas.match(/^([1-6])/);
      if (match) {
        rawTahun = match[1];
        warnings.push(`Tahun ${rawTahun} dikesan secara automatik daripada nama kelas "${rawKelas}"`);
      } else if (rawKelas.toLowerCase().includes('pra')) {
        rawTahun = '0';
        warnings.push(`Tahun Pra Sekolah dikesan daripada nama kelas "${rawKelas}"`);
      }
    }

    // 3. Validation: Tahun
    if (!rawTahun && rawTahun !== '0') {
      errors.push('Medan Tahun kosong');
    }
    const validatedTahun = normalizeTahun(rawTahun);
    if (rawTahun && validatedTahun === null) {
      errors.push(`Tahun mestilah nombor 1 hingga 6 atau Pra Sekolah (Diterima: "${rawTahun}")`);
    }

    // 4. Intelligent Auto-Generate / Deduplicate: ID Murid
    if (!rawId) {
      if (rawNama) {
        const cleanTahun = validatedTahun !== null ? validatedTahun : 'X';
        const houseInitial = rawRumah ? rawRumah[0].toUpperCase() : 'M';
        rawId = `${houseInitial}-${cleanTahun}${String(currentRowNum).padStart(3, '0')}`;
        warnings.push(`ID Murid dijana secara automatik: ${rawId}`);
      } else {
        errors.push('Medan ID Murid kosong');
      }
    }

    // Prevent duplicate ID loss: if ID already seen in file, auto-adjust instead of dropping student
    let adjustedId = rawId;
    let upperId = adjustedId.toUpperCase();
    if (upperId && seenIdsInFile.has(upperId)) {
      let counter = 2;
      while (seenIdsInFile.has(`${upperId}-${counter}`)) {
        counter++;
      }
      adjustedId = `${rawId}-${counter}`;
      upperId = adjustedId.toUpperCase();
      warnings.push(`ID pendua dikesan (${rawId}), dilaraskan secara automatik kepada "${adjustedId}"`);
    }
    if (upperId) {
      seenIdsInFile.add(upperId);
    }

    // 5. Validation: Kelas
    if (!rawKelas) {
      errors.push('Medan Kelas kosong');
    }

    // 6. Validation: Jantina
    if (!rawJantina) {
      errors.push('Medan Jantina kosong');
    }
    const validatedJantina = normalizeJantina(rawJantina);
    if (rawJantina && !validatedJantina) {
      errors.push(`Jantina tidak sah: "${rawJantina}" (Gunakan Lelaki/Perempuan atau L/P)`);
    }

    // 7. Validation: Rumah Sukan
    if (!rawRumah) {
      // Try to infer from class name or ID
      const inferredFromClass = normalizeRumahSukan(rawKelas);
      if (inferredFromClass) {
        rawRumah = inferredFromClass;
        warnings.push(`Rumah Sukan dikesan daripada nama kelas ("${inferredFromClass}")`);
      } else if (adjustedId.toUpperCase().startsWith('M-')) {
        rawRumah = 'Merah';
      } else if (adjustedId.toUpperCase().startsWith('K-')) {
        rawRumah = 'Kuning';
      } else if (adjustedId.toUpperCase().startsWith('H-')) {
        rawRumah = 'Hijau';
      } else if (adjustedId.toUpperCase().startsWith('B-')) {
        rawRumah = 'Biru';
      } else {
        // Fallback default so student is NOT rejected
        rawRumah = 'Merah';
        warnings.push('Medan Rumah Sukan tiada, ditetapkan kepada Rumah Merah secara lalai');
      }
    }

    const validatedRumah = normalizeRumahSukan(rawRumah) || 'Merah';

    // 8. Existing record check in current database
    let status: 'sah' | 'ralat' | 'kemaskini' = 'sah';
    if (errors.length > 0) {
      status = 'ralat';
    } else if (existingIds.has(upperId)) {
      status = 'kemaskini';
      warnings.push('Rekod sedia ada akan dikemaskini (tiada duplikasi)');
    }

    sheetRecords.push({
      baris: currentRowNum,
      idMurid: adjustedId,
      nama: rawNama,
      tahun: validatedTahun !== null ? validatedTahun : rawTahun,
      kelas: rawKelas,
      jantina: validatedJantina ?? rawJantina,
      rumahSukan: validatedRumah,
      tarikhLahir: rawTarikhLahir || undefined,
      noPengenalan: rawNoPengenalan || undefined,
      noSijilLahir: rawNoPengenalan || undefined,
      ralat: errors,
      amaran: warnings,
      status,
    });
  }

  return { records: sheetRecords, nextOffset: currentRowNum };
}

export async function parseMuridFile(
  file: File,
  selectedRumahOverride?: RumahSukan | null,
  currentMuridList: Murid[] = [],
  targetSheetName?: string
): Promise<HasilPratontonMuatNaik> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  const sheetNames = workbook.SheetNames;

  if (!sheetNames || sheetNames.length === 0) {
    return {
      jumlahBaris: 0,
      jumlahSah: 0,
      jumlahRalat: 0,
      jumlahKemaskini: 0,
      rekod: [],
      senaraiLembaran: [],
    };
  }

  const existingIds = new Set(currentMuridList.map((m) => m.id.trim().toUpperCase()));
  const seenIdsInFile = new Set<string>();
  const allRecords: RekodPratontonMurid[] = [];
  let globalRowOffset = 0;

  // Determine which sheets to parse
  const shouldParseAllSheets =
    !targetSheetName ||
    targetSheetName === 'semua' ||
    (sheetNames.length > 1 &&
      sheetNames.some((s) => normalizeRumahSukan(s) !== null));

  const sheetsToProcess = shouldParseAllSheets
    ? sheetNames
    : sheetNames.includes(targetSheetName || '')
    ? [targetSheetName!]
    : [sheetNames[0]];

  for (const sheetName of sheetsToProcess) {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) continue;

    // Infer house from sheet name if sheet name is named after a house (e.g. 'Merah', 'Rumah Merah')
    const sheetHouse = normalizeRumahSukan(sheetName);

    const { records, nextOffset } = parseSingleSheet(
      worksheet,
      sheetName,
      selectedRumahOverride,
      existingIds,
      seenIdsInFile,
      sheetHouse,
      globalRowOffset
    );

    globalRowOffset = nextOffset;
    allRecords.push(...records);
  }

  const jumlahSah = allRecords.filter((r) => r.status === 'sah').length;
  const jumlahRalat = allRecords.filter((r) => r.status === 'ralat').length;
  const jumlahKemaskini = allRecords.filter((r) => r.status === 'kemaskini').length;

  return {
    jumlahBaris: allRecords.length,
    jumlahSah,
    jumlahRalat,
    jumlahKemaskini,
    rekod: allRecords,
    senaraiLembaran: sheetNames,
    lembaranDipilih: targetSheetName || (shouldParseAllSheets ? 'semua' : sheetNames[0]),
  };
}

// Generate template data as Excel or CSV
export function downloadTemplate(format: 'xlsx' | 'csv', rumahSukanPrefix?: RumahSukan | null): void {
  const headers = ['ID Murid', 'Nama Murid', 'No. Pengenalan', 'Tarikh Lahir', 'Tahun', 'Kelas', 'Jantina', 'Rumah Sukan'];

  const sampleRows = [
    {
      'ID Murid': '', // ID Murid pilihan - akan dijana automatik semasa murid dipilih untuk acara
      'Nama Murid': 'Muhammad Daniyal bin Azman',
      'No. Pengenalan': '200115-13-1111',
      'Tarikh Lahir': '15/01/2020',
      'Tahun': 0,
      'Kelas': 'Pra Cekal',
      'Jantina': 'Lelaki',
      'Rumah Sukan': rumahSukanPrefix || 'Merah',
    },
    {
      'ID Murid': '', // ID Murid pilihan - akan dijana automatik semasa murid dipilih untuk acara
      'Nama Murid': 'Nur Arissa Sofea binti Hamdan',
      'No. Pengenalan': '200420-13-2222',
      'Tarikh Lahir': '20/04/2020',
      'Tahun': 0,
      'Kelas': 'Pra Dinamik',
      'Jantina': 'Perempuan',
      'Rumah Sukan': rumahSukanPrefix || 'Merah',
    },
    {
      'ID Murid': '',
      'Nama Murid': 'Ahmad Danish bin Rosli',
      'No. Pengenalan': '170312-13-3333',
      'Tarikh Lahir': '12/03/2017',
      'Tahun': 3,
      'Kelas': '3 Fleksibel',
      'Jantina': 'Lelaki',
      'Rumah Sukan': rumahSukanPrefix || 'Merah',
    },
    {
      'ID Murid': '',
      'Nama Murid': 'Muhammad Harith bin Zamri',
      'No. Pengenalan': '170825-13-4444',
      'Tarikh Lahir': '25/08/2017',
      'Tahun': 3,
      'Kelas': '3 Arif',
      'Jantina': 'Lelaki',
      'Rumah Sukan': rumahSukanPrefix || 'Merah',
    },
    {
      'ID Murid': '',
      'Nama Murid': 'Nur Ain binti Zulkifli',
      'No. Pengenalan': '171109-13-5555',
      'Tarikh Lahir': '09/11/2017',
      'Tahun': 3,
      'Kelas': '3 Bestari',
      'Jantina': 'Perempuan',
      'Rumah Sukan': rumahSukanPrefix || 'Merah',
    },
    {
      'ID Murid': '',
      'Nama Murid': 'Muhammad Adam Rayyan',
      'No. Pengenalan': '190614-13-6666',
      'Tarikh Lahir': '14/06/2019',
      'Tahun': 1,
      'Kelas': '1 Cekal',
      'Jantina': 'Lelaki',
      'Rumah Sukan': rumahSukanPrefix || 'Merah',
    },
    {
      'ID Murid': '',
      'Nama Murid': 'Siti Nur Aisyah binti Latif',
      'No. Pengenalan': '180218-13-7777',
      'Tarikh Lahir': '18/02/2018',
      'Tahun': 2,
      'Kelas': '2 Dinamik',
      'Jantina': 'Perempuan',
      'Rumah Sukan': rumahSukanPrefix || 'Merah',
    },
    {
      'ID Murid': '',
      'Nama Murid': 'Chong Jin Wei',
      'No. Pengenalan': '170505-13-8888',
      'Tarikh Lahir': '05/05/2017',
      'Tahun': 3,
      'Kelas': '3 Cekal',
      'Jantina': 'Lelaki',
      'Rumah Sukan': rumahSukanPrefix || 'Kuning',
    },
    {
      'ID Murid': '',
      'Nama Murid': 'Bryan Lee Jun Hao',
      'No. Pengenalan': '160719-13-9999',
      'Tarikh Lahir': '19/07/2016',
      'Tahun': 4,
      'Kelas': '4 Dinamik',
      'Jantina': 'Lelaki',
      'Rumah Sukan': rumahSukanPrefix || 'Hijau',
    },
    {
      'ID Murid': '',
      'Nama Murid': 'Zarif Irfan bin Zaidi',
      'No. Pengenalan': '150923-13-1010',
      'Tarikh Lahir': '23/09/2015',
      'Tahun': 5,
      'Kelas': '5 Efisien',
      'Jantina': 'Lelaki',
      'Rumah Sukan': rumahSukanPrefix || 'Biru',
    },
    {
      'ID Murid': '',
      'Nama Murid': 'Farah Nabilah binti Khairul',
      'No. Pengenalan': '140402-13-2020',
      'Tarikh Lahir': '02/04/2014',
      'Tahun': 6,
      'Kelas': '6 Fleksibel',
      'Jantina': 'Perempuan',
      'Rumah Sukan': rumahSukanPrefix || 'Biru',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleRows, { header: headers });

  // Column widths
  ws['!cols'] = [
    { wch: 14 }, // ID Murid
    { wch: 32 }, // Nama Murid
    { wch: 18 }, // No. Pengenalan
    { wch: 14 }, // Tarikh Lahir
    { wch: 8 },  // Tahun
    { wch: 16 }, // Kelas
    { wch: 12 }, // Jantina
    { wch: 15 }, // Rumah Sukan
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Senarai Murid');

  const fileName = rumahSukanPrefix
    ? `Templat_Murid_Rumah_${rumahSukanPrefix}.${format}`
    : `Templat_Senarai_Murid_Sukan_Sekolah.${format}`;

  if (format === 'xlsx') {
    XLSX.writeFile(wb, fileName);
  } else {
    XLSX.writeFile(wb, fileName, { bookType: 'csv' });
  }
}

// Export current student list to Excel or CSV
export function exportMuridToExcel(muridList: Murid[], format: 'xlsx' | 'csv' = 'xlsx'): void {
  const data = muridList.map((m) => ({
    'ID Murid': m.id,
    'Nama Murid': m.nama,
    'No. Pengenalan': m.noPengenalan || m.noSijilLahir || '',
    'Tarikh Lahir': m.tarikhLahir || '',
    'Tahun': m.tahun,
    'Kelas': m.kelas,
    'Jantina': m.jantina,
    'Rumah Sukan': m.rumahSukan,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 14 },
    { wch: 32 },
    { wch: 18 },
    { wch: 14 },
    { wch: 8 },
    { wch: 16 },
    { wch: 12 },
    { wch: 15 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Senarai Murid');
  const fileName = `Senarai_Murid_Kejohanan_Sukan_${new Date().toISOString().slice(0, 10)}.${format}`;
  XLSX.writeFile(wb, fileName, { bookType: format });
}
