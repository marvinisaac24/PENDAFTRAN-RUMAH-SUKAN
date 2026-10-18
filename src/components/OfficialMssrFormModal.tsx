import React, { useState, useMemo, useCallback } from 'react';
import {
  Printer,
  X,
  FileSpreadsheet,
  Download,
  Filter,
  Users,
  Trophy,
  CheckCircle,
  Calendar,
  School,
  Sparkles,
  Edit3,
  Save,
  RotateCcw,
  FileText,
  Loader2,
  Layers
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { AcaraSukan, Murid, PendaftaranAcara, RumahSukan } from '../types';
import { SENARAI_RUMAH, SENARAI_RUMAH_KEYS } from '../data/constants';
import {
  generateMssrLandscapePdf,
  generateFullMssrTournamentPdfBundle,
} from '../utils/mssrPdfGenerator';

interface OfficialMssrFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendaftaranList: PendaftaranAcara[];
  acaraList: AcaraSukan[];
  muridList: Murid[];
}

export type MssrAgeGroup = '12TKB' | '11TKB' | '10TKB' | '9TKB' | 'SEMUA';
export type MssrGender = 'Lelaki' | 'Perempuan' | 'SEMUA';

// 10 Acara Rasmi Kejohanan Balapan & Padang MSSR mengikut Borang Rasmi
export interface MssrEventCol {
  id: string;
  code: string;
  label: string;
  sublabel?: string;
  isRelay?: boolean;
  // Semak sama ada acara ini sesuai atau digelapkan (shaded) untuk kategori tertentu
  isShadedFor: (ageGroup: MssrAgeGroup) => boolean;
  matcher: (acaraNama: string) => boolean;
}

export const MSSR_COLUMNS: MssrEventCol[] = [
  {
    id: '60m',
    code: '60M',
    label: '60M',
    isShadedFor: (ag) => ag === '12TKB' || ag === '11TKB', // Shaded bagi 12&11 TKB seperti dalam borang
    matcher: (name) => {
      const n = name.toLowerCase();
      return n.includes('60m') || n.includes('60 meter') || n.includes('60 m');
    },
  },
  {
    id: '100m',
    code: '100M',
    label: '100M',
    isShadedFor: (ag) => ag === '9TKB',
    matcher: (name) => {
      const n = name.toLowerCase();
      return (n.includes('100m') || n.includes('100 meter') || n.includes('100 m')) && !n.includes('4x100') && !n.includes('4 x 100');
    },
  },
  {
    id: '200m',
    code: '200M',
    label: '200M',
    isShadedFor: (ag) => ag === '9TKB',
    matcher: (name) => {
      const n = name.toLowerCase();
      return (n.includes('200m') || n.includes('200 meter') || n.includes('200 m')) && !n.includes('4x200') && !n.includes('4 x 200');
    },
  },
  {
    id: '70m_pagar',
    code: '70M L/Pagar',
    label: '70M',
    sublabel: 'L/Pagar',
    isShadedFor: (ag) => ag === '12TKB' || ag === '11TKB', // 70M pagar shaded bagi 12&11 TKB (hanya 10TKB)
    matcher: (name) => {
      const n = name.toLowerCase();
      return (n.includes('70m') || n.includes('70 meter')) && (n.includes('pagar') || n.includes('l/pagar'));
    },
  },
  {
    id: '80m_pagar',
    code: '80M Lari /Pagar',
    label: '80M',
    sublabel: 'Lari /Pagar',
    isShadedFor: (ag) => ag === '10TKB' || ag === '9TKB',
    matcher: (name) => {
      const n = name.toLowerCase();
      return (n.includes('80m') || n.includes('80 meter')) && (n.includes('pagar') || n.includes('l/pagar'));
    },
  },
  {
    id: 'lompat_jauh',
    code: 'L. Jauh',
    label: 'L. Jauh',
    isShadedFor: () => false,
    matcher: (name) => {
      const n = name.toLowerCase();
      return n.includes('lompat jauh') || n.includes('l.jauh') || n.includes('l. jauh');
    },
  },
  {
    id: 'lompat_tinggi',
    code: 'L. Tinggi',
    label: 'L. Tinggi',
    isShadedFor: () => false,
    matcher: (name) => {
      const n = name.toLowerCase();
      return n.includes('lompat tinggi') || n.includes('l.tinggi') || n.includes('l. tinggi');
    },
  },
  {
    id: 'lontar_peluru',
    code: 'L. Peluru',
    label: 'L. Peluru',
    isShadedFor: () => false,
    matcher: (name) => {
      const n = name.toLowerCase();
      return n.includes('lontar peluru') || n.includes('l.peluru') || n.includes('l. peluru');
    },
  },
  {
    id: '4x100m',
    code: '4X 100M',
    label: '4X 100M',
    isRelay: true,
    isShadedFor: (ag) => ag === '9TKB',
    matcher: (name) => {
      const n = name.toLowerCase();
      return n.includes('4x100') || n.includes('4 x 100') || n.includes('4 x 100m');
    },
  },
  {
    id: '4x200m',
    code: '4X 200M',
    label: '4X 200M',
    isRelay: true,
    isShadedFor: (ag) => ag === '9TKB',
    matcher: (name) => {
      const n = name.toLowerCase();
      return n.includes('4x200') || n.includes('4 x 200') || n.includes('4 x 200m');
    },
  },
];

export interface MssrParticipantRowData {
  idPeserta: string;
  nama: string;
  tahun: number;
  kelas: string;
  jantina: string;
  rumahSukan: RumahSukan | string;
  tarikhLahir: string;
  noSijilLahir: string;
  eventTicks: Record<string, 'X' | '(S)' | string>;
}

export const OfficialMssrFormModal: React.FC<OfficialMssrFormModalProps> = ({
  isOpen,
  onClose,
  pendaftaranList,
  acaraList,
  muridList,
}) => {
  const [selectedHouse, setSelectedHouse] = useState<string>('SEMUA');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<MssrAgeGroup>('12TKB');
  const [selectedGender, setSelectedGender] = useState<MssrGender>('Lelaki');
  const [minRows, setMinRows] = useState<number>(10); // Minimum 10 baris seperti borang asal

  // Simpanan data edit manual (Tarikh Lahir & No Sijil Lahir) jika pengguna ingin melengkapkan
  const [manualEdits, setManualEdits] = useState<Record<string, { tarikhLahir?: string; noSijil?: string }>>({});

  if (!isOpen) return null;

  // 1. Peta murid berdasarkan ID untuk carian pantas
  const muridMap = new Map<string, Murid>();
  muridList.forEach((m) => muridMap.set(m.id, m));

  // 2. Tahun yang sepadan dengan Kumpulan Umur MSSR 2026:
  // 12TKB = Tahun 6 (Lahir 2014)
  // 11TKB = Tahun 5 (Lahir 2015)
  // 10TKB = Tahun 4 (Lahir 2016)
  // 9TKB  = Tahun 3 (Lahir 2017)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // Helper untuk mendapatkan tahun-tahun kelayakan bagi kumpulan umur
  const getYearsForAgeGroup = useCallback((ag: MssrAgeGroup): number[] => {
    switch (ag) {
      case '12TKB':
        return [6];
      case '11TKB':
        return [5];
      case '10TKB':
        return [4];
      case '9TKB':
        return [3];
      case 'SEMUA':
      default:
        return [3, 4, 5, 6];
    }
  }, []);

  // Fungsi menjana baris data peserta bagi mana-mana kategori
  const computeRowsForCategory = useCallback(
    (ag: MssrAgeGroup, g: MssrGender, h: string, minR: number = 10) => {
      const allowedYears = getYearsForAgeGroup(ag);
      const pMap = new Map<string, MssrParticipantRowData>();

      pendaftaranList.forEach((reg) => {
        if (h !== 'SEMUA' && reg.rumahSukan !== h) return;

        const acara = acaraList.find((a) => a.id === reg.acaraId);
        if (g !== 'SEMUA' && acara && acara.kategoriJantina !== 'Terbuka' && acara.kategoriJantina !== g) {
          return;
        }

        const matchedCol = MSSR_COLUMNS.find((col) => col.matcher(reg.acaraNama));
        if (!matchedCol) return;

        reg.peserta.forEach((p) => {
          if (g !== 'SEMUA' && p.jantina !== g) return;
          if (!allowedYears.includes(p.tahun)) return;

          const student = muridMap.get(p.muridId);
          const uniqueKey = p.muridId || p.nama.trim().toUpperCase();

          const defaultBirthYear = 2026 - p.tahun;
          const fallbackTarikhLahir = student?.tarikhLahir || p.tarikhLahir || `01/01/${defaultBirthYear}`;
          const fallbackNoSijil = student?.noSijilLahir || p.noSijilLahir || student?.id || p.muridId || '';

          const isSimpanan =
            p.isSimpanan ||
            (p.peranan && p.peranan.toLowerCase().includes('simpanan')) ||
            false;
          const mark = isSimpanan ? '(S)' : 'X';

          const existing = pMap.get(uniqueKey);
          if (existing) {
            existing.eventTicks[matchedCol.id] = mark;
          } else {
            pMap.set(uniqueKey, {
              idPeserta: p.idPeserta || p.muridId || '',
              nama: p.nama.toUpperCase(),
              tahun: p.tahun,
              kelas: p.kelas,
              jantina: p.jantina,
              rumahSukan: p.rumahSukan,
              tarikhLahir: manualEdits[uniqueKey]?.tarikhLahir || fallbackTarikhLahir,
              noSijilLahir: manualEdits[uniqueKey]?.noSijil || fallbackNoSijil,
              eventTicks: {
                [matchedCol.id]: mark,
              },
            });
          }
        });
      });

      const list = Array.from(pMap.values());
      list.sort((a, b) => a.nama.localeCompare(b.nama));

      const totalCount = Math.max(list.length, minR);
      const rows: { bil: number; isEmpty: boolean; data: MssrParticipantRowData }[] = [];
      for (let i = 0; i < totalCount; i++) {
        if (i < list.length) {
          rows.push({
            bil: i + 1,
            isEmpty: false,
            data: list[i],
          });
        } else {
          rows.push({
            bil: i + 1,
            isEmpty: true,
            data: {
              idPeserta: '',
              nama: '',
              tahun: 0,
              kelas: '',
              jantina: '',
              rumahSukan: '',
              tarikhLahir: '',
              noSijilLahir: '',
              eventTicks: {},
            },
          });
        }
      }
      return rows;
    },
    [pendaftaranList, acaraList, muridMap, manualEdits, getYearsForAgeGroup]
  );

  // Baris-baris bagi tetapan semasa
  const displayRows = useMemo(() => {
    return computeRowsForCategory(selectedAgeGroup, selectedGender, selectedHouse, minRows);
  }, [computeRowsForCategory, selectedAgeGroup, selectedGender, selectedHouse, minRows]);

  const participantRows = useMemo(() => {
    return displayRows.filter((r) => !r.isEmpty).map((r) => r.data);
  }, [displayRows]);

  // Fungsi Muat Turun Borang Rasmi PDF (Landskap)
  const handleDownloadLandscapePdf = () => {
    setIsGeneratingPdf(true);
    try {
      generateMssrLandscapePdf({
        schoolName: 'SEKOLAH KEBANGSAAN TUDAN',
        houseName: selectedHouse,
        ageGroup: selectedAgeGroup,
        gender: selectedGender,
        displayRows,
      });
    } catch (err) {
      console.error('Ralat menjana PDF Landskap:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Fungsi Muat Turun Semua Kategori & Jantina dalam 1 Berkas PDF Landskap
  const handleDownloadAllCategoriesPdf = () => {
    setIsGeneratingPdf(true);
    try {
      const ageCategories: MssrAgeGroup[] = ['12TKB', '11TKB', '10TKB', '9TKB'];
      const genders: MssrGender[] = ['Lelaki', 'Perempuan'];
      const allRowsByFilter: Array<{
        ageGroup: MssrAgeGroup;
        gender: MssrGender;
        rows: { bil: number; isEmpty: boolean; data: MssrParticipantRowData }[];
      }> = [];

      ageCategories.forEach((ag) => {
        genders.forEach((g) => {
          const rows = computeRowsForCategory(ag, g, selectedHouse, 10);
          allRowsByFilter.push({
            ageGroup: ag,
            gender: g,
            rows,
          });
        });
      });

      generateFullMssrTournamentPdfBundle({
        schoolName: 'SEKOLAH KEBANGSAAN TUDAN',
        houseName: selectedHouse,
        allRowsByFilter,
      });
    } catch (err) {
      console.error('Ralat menjana Berkas PDF Landskap:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Fungsi Cetak (Print / PDF)
  const handlePrint = () => {
    window.print();
  };

  // Fungsi Muat Turun Fail Excel Berformat Rasmi
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const titleHeader = [
      ['BORANG PENDAFTARAN KONTINGEN BALAPAN DAN PADANG MSSR 2026'],
      ['10 NOVEMBER 2026 DAN 11 NOVEMBER 2026'],
      ['( SILA TANDAKAN X UNTUK ACARA YANG ANDA INGIN DAFTAR – PESERTA SIMPANAN TANDAKAN (S) )'],
      ['SETIAP ACARA INDIVIDU HANYA BOLEH DAFTAR DUA PESERTA.'],
      ['(12&11TKB) ACARA INDIVIDU = 2, ACARA RELAY = 2 ) (10TKB: 2 INDIVIDU: 1 RELAY)'],
      [],
      [
        'NAMA SEKOLAH',
        ': SEKOLAH KEBANGSAAN TUDAN',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
      ],
      [
        'KUMPULAN',
        `: ${selectedHouse === 'SEMUA' ? 'KONTINGEN KESELURUHAN' : `RUMAH ${selectedHouse.toUpperCase()}`}`,
        '',
        '',
        'Kategori',
        `: ${selectedGender.toUpperCase()} ${selectedAgeGroup}`,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
      ],
      [],
      // Baris Tajuk Jadual
      [
        'Bil',
        'Nombor Peserta',
        'Nama Peserta',
        'Tarikh Lahir',
        'No. Sijil Lahir',
        'Acara',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
      ],
      [
        '',
        '',
        '',
        '',
        '',
        '60M',
        '100M',
        '200M',
        '70M L/Pagar',
        '80M Lari /Pagar',
        'L. Jauh',
        'L. Tinggi',
        'L. Peluru',
        '4X 100M',
        '4X 200M',
      ],
    ];

    // Baris Data
    const tableDataRows: any[] = [];
    displayRows.forEach((row) => {
      const p = row.data;
      tableDataRows.push([
        row.bil,
        p.idPeserta || '',
        p.nama || '',
        p.tarikhLahir || '',
        p.noSijilLahir || '',
        p.eventTicks['60m'] || '',
        p.eventTicks['100m'] || '',
        p.eventTicks['200m'] || '',
        p.eventTicks['70m_pagar'] || '',
        p.eventTicks['80m_pagar'] || '',
        p.eventTicks['lompat_jauh'] || '',
        p.eventTicks['lompat_tinggi'] || '',
        p.eventTicks['lontar_peluru'] || '',
        p.eventTicks['4x100m'] || '',
        p.eventTicks['4x200m'] || '',
      ]);
    });

    const footerRows = [
      [],
      ['* P/S: Sila isi dengan huruf besar'],
      [],
      [],
      [
        '(                                             )',
        '',
        '',
        '',
        '_______________________',
        '',
        '',
        '',
        '(                                             )',
      ],
      [
        'Pengesahan Guru Besar',
        '',
        '',
        '',
        'Cop Sekolah',
        '',
        '',
        '',
        'Tandatangan Ketua Jurulatih',
      ],
    ];

    const allSheetData = [...titleHeader, ...tableDataRows, ...footerRows];
    const ws = XLSX.utils.aoa_to_sheet(allSheetData);

    // Merge Cells
    ws['!merges'] = [
      // Tajuk Utama
      { s: { r: 0, c: 0 }, e: { r: 0, c: 14 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 14 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 14 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 14 } },
      { s: { r: 4, c: 0 }, e: { r: 4, c: 14 } },
      // Header Jadual: Bil, Nombor Peserta, Nama, Tarikh Lahir, No Sijil Lahir
      { s: { r: 9, c: 0 }, e: { r: 10, c: 0 } },
      { s: { r: 9, c: 1 }, e: { r: 10, c: 1 } },
      { s: { r: 9, c: 2 }, e: { r: 10, c: 2 } },
      { s: { r: 9, c: 3 }, e: { r: 10, c: 3 } },
      { s: { r: 9, c: 4 }, e: { r: 10, c: 4 } },
      // Header Acara (Colspan 10)
      { s: { r: 9, c: 5 }, e: { r: 9, c: 14 } },
    ];

    // Lebar Kolum
    ws['!cols'] = [
      { wch: 5 },   // Bil
      { wch: 15 },  // Nombor Peserta
      { wch: 32 },  // Nama Peserta
      { wch: 14 },  // Tarikh Lahir
      { wch: 18 },  // No. Sijil Lahir
      { wch: 8 },   // 60M
      { wch: 8 },   // 100M
      { wch: 8 },   // 200M
      { wch: 12 },  // 70M L/Pagar
      { wch: 14 },  // 80M Lari /Pagar
      { wch: 10 },  // L. Jauh
      { wch: 10 },  // L. Tinggi
      { wch: 10 },  // L. Peluru
      { wch: 10 },  // 4X 100M
      { wch: 10 },  // 4X 200M
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Borang MSSR 2026');
    const filename = `Borang_Pendaftaran_MSSR_2026_${selectedGender}_${selectedAgeGroup}_${selectedHouse}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  const handleUpdateManual = (key: string, field: 'tarikhLahir' | 'noSijil', val: string) => {
    setManualEdits((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: val,
      },
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      {/* Modal Dialog Box */}
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-6xl max-h-[96vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Control Bar (Tidak dicetak) */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 no-print">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                <FileSpreadsheet className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight flex items-center gap-2">
                  <span>Borang Pendaftaran Kontingen Balapan & Padang MSSR 2026</span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
                    Format Rasmi
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Jana dan cetak borang pendaftaran rasmi MSSR mengikut spesifikasi borang kontinjen sekolah.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            {/* Butang Utama: Muat Turun PDF Landskap */}
            <button
              type="button"
              onClick={handleDownloadLandscapePdf}
              disabled={isGeneratingPdf}
              className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black text-white bg-red-600 hover:bg-red-700 active:scale-95 rounded-xl transition-all shadow-md shadow-red-600/30 disabled:opacity-50"
              title="Muat turun borang pendaftaran lengkap dalam format PDF Landskap (A4)"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <FileText className="w-4 h-4 text-white" />
              )}
              <span>Muat Turun PDF (Landscape)</span>
            </button>

            {/* Butang Muat Turun Semua Kategori PDF Landskap */}
            <button
              type="button"
              onClick={handleDownloadAllCategoriesPdf}
              disabled={isGeneratingPdf}
              className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 active:scale-95 rounded-xl transition-all disabled:opacity-50"
              title="Muat turun berkas PDF Landskap untuk semua kumpulan umur (12TKB, 11TKB, 10TKB, 9TKB)"
            >
              <Layers className="w-3.5 h-3.5 text-red-600" />
              <span className="hidden sm:inline">Semua Kategori (PDF)</span>
              <span className="sm:hidden">Semua PDF</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-95"
              title="Muat turun borang pendaftaran dalam fail Microsoft Excel (.xlsx)"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Muat Turun Excel (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95"
              title="Cetak borang terus ke pencetak atau simpan sebagai PDF Landskap"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>Cetak (Print / PDF)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Controls Bar (Tidak dicetak) */}
        <div className="p-3 sm:px-6 bg-slate-100 border-b border-slate-200 text-xs flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-indigo-600" />
              Tetapan Borang:
            </span>

            {/* Tapisan Kumpulan / Rumah Sukan */}
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-medium">Rumah:</span>
              <select
                value={selectedHouse}
                onChange={(e) => setSelectedHouse(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 font-bold text-slate-800 focus:outline-none"
              >
                <option value="SEMUA">Semua Rumah (Kontingen)</option>
                {SENARAI_RUMAH_KEYS.map((r) => (
                  <option key={r} value={r}>
                    Rumah {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Tapisan Kategori Umur MSSR */}
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-medium">Kumpulan Umur:</span>
              <select
                value={selectedAgeGroup}
                onChange={(e) => setSelectedAgeGroup(e.target.value as MssrAgeGroup)}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 font-bold text-slate-800 focus:outline-none"
              >
                <option value="12TKB">12TKB (Tahun 6)</option>
                <option value="11TKB">11TKB (Tahun 5)</option>
                <option value="10TKB">10TKB (Tahun 4)</option>
                <option value="9TKB">9TKB (Tahun 3)</option>
                <option value="SEMUA">Semua Kumpulan Umur</option>
              </select>
            </div>

            {/* Tapisan Jantina */}
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-medium">Jantina:</span>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value as MssrGender)}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 font-bold text-slate-800 focus:outline-none"
              >
                <option value="Lelaki">Lelaki</option>
                <option value="Perempuan">Perempuan</option>
                <option value="SEMUA">Semua Jantina</option>
              </select>
            </div>

            {/* Bilangan Baris Minimum */}
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-medium">Baris:</span>
              <select
                value={minRows}
                onChange={(e) => setMinRows(Number(e.target.value))}
                className="px-2 py-1.5 rounded-lg bg-white border border-slate-300 font-bold text-slate-800 focus:outline-none"
              >
                <option value={10}>10 Baris (Standard)</option>
                <option value={15}>15 Baris</option>
                <option value={20}>20 Baris</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-semibold">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>{participantRows.length} Peserta Berdaftar</span>
            </span>
          </div>
        </div>

        {/* Paper Document Preview Area (Borang Rasmi MSSR - Format Landskap) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-200/60 print:p-0 print:bg-white print:overflow-visible">
          {/* Banner Maklumat Landskap (Tidak dicetak) */}
          <div className="max-w-[297mm] mx-auto mb-3 bg-red-50 border border-red-200 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-red-900 no-print shadow-xs">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-red-600 text-white rounded-lg shrink-0">
                <FileText className="w-4 h-4" />
              </span>
              <div>
                <span className="font-bold">Format Dokumen: A4 Landskap (297mm × 210mm). </span>
                <span className="text-red-700">
                  Semua ruangan maklumat sekolah, acara, tanda 'X'/'(S)' dan pengesahan guru besar telah dijana lengkap.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadLandscapePdf}
              disabled={isGeneratingPdf}
              className="cursor-pointer shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Muat Turun PDF Sekarang</span>
            </button>
          </div>

          <div className="max-w-[297mm] mx-auto bg-white p-6 sm:p-8 shadow-md border border-slate-300 print:shadow-none print:border-none print:max-w-none print:w-full print:p-2 text-black text-xs font-sans">
            <style>{`
              @media print {
                @page {
                  size: A4 landscape !important;
                  margin: 6mm !important;
                }
              }
            `}</style>
            
            {/* 1. Header Borang */}
            <div className="text-center space-y-1 mb-4">
              <h1 className="font-extrabold text-sm sm:text-base tracking-wide uppercase text-black">
                BORANG PENDAFTARAN KONTINGEN BALAPAN DAN PADANG MSSR 2026
              </h1>
              <h2 className="font-bold text-xs sm:text-sm tracking-wider uppercase text-black">
                10 NOVEMBER 2026 DAN 11 NOVEMBER 2026
              </h2>
              <p className="text-[11px] font-semibold text-black italic">
                ( SILA TANDAKAN X UNTUK ACARA YANG ANDA INGIN DAFTAR – PESERTA SIMPANAN TANDAKAN (S) )
              </p>
              <p className="text-[10px] font-bold text-black uppercase">
                SETIAP ACARA INDIVIDU HANYA BOLEH DAFTAR DUA PESERTA.
              </p>
              <p className="text-[10px] font-bold text-black uppercase">
                (12&11TKB) ACARA INDIVIDU = 2, ACARA RELAY = 2 ) (10TKB: 2 INDIVIDU: 1 RELAY)
              </p>
            </div>

            {/* 2. Maklumat Sekolah & Kategori */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-xs font-bold text-black border-t border-b border-black py-2">
              <div className="space-y-1">
                <div>
                  NAMA SEKOLAH : <span className="font-black">SEKOLAH KEBANGSAAN TUDAN</span>
                </div>
                <div>
                  KUMPULAN : <span className="font-black">{selectedHouse === 'SEMUA' ? '*' : `RUMAH ${selectedHouse.toUpperCase()}`}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div>
                  Kategori : <span className="font-black">{selectedGender.toUpperCase()} {selectedAgeGroup}</span>
                </div>
                <div className="text-[10px] text-slate-600 font-normal">
                  MSSR Bahagian Miri • Zon Bandar
                </div>
              </div>
            </div>

            {/* 3. Jadual Pendaftaran Acara (Grid Matriks) */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-black text-center text-[10px] sm:text-[11px]">
                <thead>
                  {/* Baris Tajuk 1 */}
                  <tr className="bg-slate-100 print:bg-transparent font-bold">
                    <th rowSpan={2} className="border border-black px-1.5 py-2 w-8">
                      Bil
                    </th>
                    <th rowSpan={2} className="border border-black px-2 py-2 w-20">
                      Nombor Peserta
                    </th>
                    <th rowSpan={2} className="border border-black px-3 py-2 text-left min-w-[140px]">
                      Nama Peserta
                    </th>
                    <th rowSpan={2} className="border border-black px-2 py-2 w-16">
                      Tarikh Lahir
                    </th>
                    <th rowSpan={2} className="border border-black px-2 py-2 w-20">
                      No. Sijil Lahir
                    </th>
                    <th colSpan={10} className="border border-black py-1 font-extrabold uppercase">
                      Acara
                    </th>
                  </tr>

                  {/* Baris Tajuk 2 (Senarai 10 Acara MSSR) */}
                  <tr className="bg-slate-50 print:bg-transparent font-bold text-[9px] sm:text-[10px]">
                    {MSSR_COLUMNS.map((col) => {
                      const isShaded = col.isShadedFor(selectedAgeGroup);
                      return (
                        <th
                          key={col.id}
                          className={`border border-black px-1 py-1.5 w-10 sm:w-11 ${
                            isShaded ? 'bg-slate-700 text-white print:bg-slate-600' : ''
                          }`}
                          title={col.code}
                        >
                          <div className="leading-tight">
                            {col.label}
                            {col.sublabel && <div className="text-[8px] font-normal">{col.sublabel}</div>}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody>
                  {displayRows.map((row) => {
                    const p = row.data;
                    const rowKey = p.idPeserta || `row-${row.bil}`;

                    return (
                      <tr key={row.bil} className="hover:bg-slate-50/50">
                        {/* Bil */}
                        <td className="border border-black py-1 px-1 font-semibold">
                          {row.bil}
                        </td>

                        {/* Nombor Peserta */}
                        <td className="border border-black py-1 px-1.5 font-bold uppercase whitespace-nowrap">
                          {p.idPeserta}
                        </td>

                        {/* Nama Peserta */}
                        <td className="border border-black py-1 px-2 text-left font-bold uppercase truncate max-w-[180px]">
                          {p.nama}
                        </td>

                        {/* Tarikh Lahir (Boleh diedit pantas) */}
                        <td className="border border-black py-0.5 px-1 whitespace-nowrap text-[9px]">
                          {!row.isEmpty ? (
                            <input
                              type="text"
                              value={p.tarikhLahir}
                              onChange={(e) => handleUpdateManual(rowKey, 'tarikhLahir', e.target.value)}
                              className="w-full text-center bg-transparent border-0 focus:outline-none p-0 text-[10px]"
                            />
                          ) : null}
                        </td>

                        {/* No Sijil Lahir (Boleh diedit pantas) */}
                        <td className="border border-black py-0.5 px-1 whitespace-nowrap text-[9px]">
                          {!row.isEmpty ? (
                            <input
                              type="text"
                              value={p.noSijilLahir}
                              onChange={(e) => handleUpdateManual(rowKey, 'noSijil', e.target.value)}
                              className="w-full text-center bg-transparent border-0 focus:outline-none p-0 text-[10px]"
                            />
                          ) : null}
                        </td>

                        {/* 10 Kolum Acara MSSR */}
                        {MSSR_COLUMNS.map((col) => {
                          const isShaded = col.isShadedFor(selectedAgeGroup);
                          const mark = p.eventTicks[col.id] || '';

                          return (
                            <td
                              key={col.id}
                              className={`border border-black py-1 px-0.5 text-center font-extrabold ${
                                isShaded
                                  ? 'bg-slate-700 text-white print:bg-slate-600'
                                  : mark === 'X'
                                  ? 'text-black font-black text-xs'
                                  : mark === '(S)'
                                  ? 'text-indigo-900 font-bold text-[9px]'
                                  : ''
                              }`}
                            >
                              {!isShaded && mark}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 4. Nota Kaki */}
            <div className="mt-3 text-[10px] font-bold text-black italic">
              * P/S: Sila isi dengan huruf besar
            </div>

            {/* 5. Ruangan Tandatangan & Pengesahan */}
            <div className="mt-8 pt-6 grid grid-cols-3 gap-6 text-center text-xs font-bold text-black">
              {/* Kiri: Pengesahan Guru Besar */}
              <div>
                <div className="mb-8">
                  ( ______________________________________ )
                </div>
                <div>Pengesahan Guru Besar</div>
                <div className="text-[10px] text-slate-500 font-normal">SK Tudan, Miri</div>
              </div>

              {/* Tengah: Cop Sekolah */}
              <div className="flex flex-col items-center justify-end">
                <div className="w-28 border-b border-black mb-2" />
                <div>Cop Sekolah</div>
              </div>

              {/* Kanan: Tandatangan Ketua Jurulatih */}
              <div>
                <div className="mb-8">
                  ( ______________________________________ )
                </div>
                <div>Tandatangan Ketua Jurulatih</div>
                <div className="text-[10px] text-slate-500 font-normal">Pengurus Pasukan Olahraga</div>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Bottom Information Bar (Tidak dicetak) */}
        <div className="p-3 sm:px-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 no-print">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>
              Tandakan <strong>X</strong> untuk Peserta Utama, dan <strong>(S)</strong> untuk Peserta Simpanan. Kolum gelap menandakan acara yang tidak dipertandingkan bagi kumpulan umur tersebut.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer px-4 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
