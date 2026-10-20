import React, { useState, useRef } from 'react';
import {
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileText,
  Database,
  ArrowRight,
  ShieldCheck,
  Info,
  Check,
  Layers,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { HasilPratontonMuatNaik, Murid, RumahSukan } from '../types';
import { SENARAI_RUMAH, SENARAI_RUMAH_KEYS } from '../data/constants';
import { downloadTemplate, parseMuridFile } from '../utils/fileParser';
import { StorageService } from '../services/storageService';

interface AdminUploadProps {
  currentMuridList: Murid[];
  onUploadSuccess: () => void;
}

export const AdminUpload: React.FC<AdminUploadProps> = ({ currentMuridList, onUploadSuccess }) => {
  // Mode: 'gabungan' (Combined file with Rumah Sukan column) OR 'berasingan' (Separate file for each house)
  const [uploadMode, setUploadMode] = useState<'gabungan' | 'berasingan'>('gabungan');
  const [selectedRumah, setSelectedRumah] = useState<RumahSukan>('Merah');

  // Import Action Mode: 'replace' (Ganti semua - pastikan jumlah sama tepat dengan fail) OR 'merge' (Tambah ke senarai sedia ada)
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');

  // Sheet selector for multi-sheet workbooks
  const [selectedSheet, setSelectedSheet] = useState<string>('semua');

  // File & Preview state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasilPratonton, setHasilPratonton] = useState<HasilPratontonMuatNaik | null>(null);
  const [filterPratonton, setFilterPratonton] = useState<'semua' | 'sah' | 'ralat' | 'kemaskini'>('semua');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string; details?: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedSheet('semua');
    await processFile(file, 'semua');
  };

  const processFile = async (file: File, sheetTarget: string = 'semua') => {
    setSelectedFile(file);
    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const houseOverride = uploadMode === 'berasingan' ? selectedRumah : null;
      const preview = await parseMuridFile(file, houseOverride, currentMuridList, sheetTarget);
      setHasilPratonton(preview);
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: 'Ralat membaca fail. Sila pastikan format Excel (.xlsx, .xls) atau CSV yang betul.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSheetChange = async (newSheet: string) => {
    setSelectedSheet(newSheet);
    if (selectedFile) {
      await processFile(selectedFile, newSheet);
    }
  };

  // Drag and drop handlers
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedSheet('semua');
      await processFile(e.dataTransfer.files[0], 'semua');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Confirm import and save to persistent database
  const handleConfirmImport = async () => {
    if (!hasilPratonton) return;

    // Filter valid records (both new and updatable)
    const validRecords = hasilPratonton.rekod.filter(
      (r) => r.status === 'sah' || r.status === 'kemaskini'
    );

    if (validRecords.length === 0) {
      alert('Tiada rekod sah untuk diimport. Sila semak ralat dalam senarai pratonton.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: Murid[] = validRecords.map((r) => ({
        id: r.idMurid,
        nama: r.nama,
        tahun: Number(r.tahun),
        kelas: r.kelas,
        jantina: r.jantina as 'Lelaki' | 'Perempuan',
        rumahSukan: r.rumahSukan as RumahSukan,
        tarikhLahir: r.tarikhLahir,
        noPengenalan: r.noPengenalan || r.noSijilLahir,
        noSijilLahir: r.noPengenalan || r.noSijilLahir,
      }));

      if (importMode === 'replace') {
        // Gantikan seluruh pangkalan data murid dengan senarai fail ini
        const result = await StorageService.replaceMuridList(payload);

        setStatusMessage({
          type: 'success',
          text: `Pangkalan data dikemaskini sepenuhnya! Tepat ${result.total} orang murid daripada fail telah disahkan dan disimpan ke dalam sistem (data lama/contoh telah digantikan).`,
          details: `Jumlah murid dalam fail: ${hasilPratonton.jumlahBaris} | Jumlah berjaya didaftarkan dalam sistem: ${result.total} murid.`,
        });
      } else {
        // Tambah / kemaskini rekod sedia ada
        const result = StorageService.upsertMuridBatch(payload);

        setStatusMessage({
          type: 'success',
          text: `Data berjaya digabungkan! ${result.ditambah} murid baharu ditambah, ${result.dikemaskini} dikemaskini. Jumlah keseluruhan murid dalam sistem kini: ${result.total} orang.`,
          details: `Sebelum ini: ${currentMuridList.length} murid | Ditambah: ${result.ditambah} | Dikemaskini: ${result.dikemaskini} | Jumlah kini: ${result.total}.`,
        });
      }

      // Clear file & preview
      setSelectedFile(null);
      setHasilPratonton(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onUploadSuccess();
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: 'Ralat semasa menyimpan ke pangkalan data. Sila cuba lagi.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredRecords = hasilPratonton?.rekod.filter((r) => {
    if (filterPratonton === 'semua') return true;
    return r.status === filterPratonton;
  });

  const validCount = (hasilPratonton?.jumlahSah || 0) + (hasilPratonton?.jumlahKemaskini || 0);

  return (
    <div className="space-y-6">
      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`p-4 sm:p-5 rounded-2xl flex items-start gap-3.5 shadow-sm border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : statusMessage.type === 'warning'
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
          ) : statusMessage.type === 'warning' ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          )}
          <div className="flex-1">
            <div className="font-bold text-sm">
              {statusMessage.type === 'success'
                ? 'Pengesahan Pangkalan Data Berjaya'
                : statusMessage.type === 'warning'
                ? 'Perhatian'
                : 'Ralat Muat Naik'}
            </div>
            <p className="text-xs sm:text-sm mt-0.5 font-medium">{statusMessage.text}</p>
            {statusMessage.details && (
              <p className="text-xs opacity-80 mt-1 font-mono bg-white/50 px-2 py-1 rounded-md inline-block">
                {statusMessage.details}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-xs font-semibold px-2 py-1 text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Top Configuration & Templates Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-600" />
              Muat Naik Senarai Murid Mengikut Rumah Sukan & Kelas
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Sokongan format Excel (.xlsx, .xls) dan CSV dengan ekstraksi pintar dan penyelarasan masa nyata dengan Firestore.
            </p>
          </div>

          {/* Template Download Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 mr-1">Muat Turun Templat:</span>
            <button
              type="button"
              onClick={() =>
                downloadTemplate('xlsx', uploadMode === 'berasingan' ? selectedRumah : null)
              }
              className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Templat Excel (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={() =>
                downloadTemplate('csv', uploadMode === 'berasingan' ? selectedRumah : null)
              }
              className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all shadow-xs"
            >
              <FileText className="w-4 h-4 text-slate-600" />
              <span>Templat CSV (.csv)</span>
            </button>
          </div>
        </div>

        {/* Panduan Kategori MSSR, ID Murid & Pra Sekolah */}
        <div className="mt-4 p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-950 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
          <div className="space-y-1 flex-1">
            <div className="font-bold text-indigo-900 flex items-center gap-2">
              <span>Panduan Kategori MSSR & Pendaftaran Fail:</span>
              <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Piawaian MSSR
              </span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-indigo-900/80">
              <li>
                <strong>ID Murid Tidak Diperlukan Dalam Fail:</strong> Fail sekolah anda tidak wajib mengandungi ID Murid. Sistem akan menjana ID Murid / No. Peserta secara automatik mengikut Rumah Sukan dan Tahun hanya untuk peserta yang dipilih bagi acara.
              </li>
              <li>
                <strong>Kelas Pra Sekolah Disokong:</strong> Menyokong kelas Pra Sekolah termasuk <em>Pra Cekal</em>, <em>Pra Dinamik</em>, <em>Pra Arif</em>, <em>Pra Bestari</em>, <em>Pra Efisien</em>, dan <em>Pra Fleksibel</em>.
              </li>
            </ul>
          </div>
        </div>

        {/* Upload Mode Selector */}
        <div className="mt-6 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            1. Pilihan Kaedah Fail Muat Naik
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mode 1: Satu fail gabungan */}
            <div
              onClick={() => {
                setUploadMode('gabungan');
                if (selectedFile) processFile(selectedFile, selectedSheet);
              }}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                uploadMode === 'gabungan'
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="font-bold text-sm text-slate-900">
                  A. Satu Fail Gabungan (Ada Lajur / Lembaran Rumah Sukan)
                </div>
                {uploadMode === 'gabungan' && (
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1.5">
                Fail mengandungi senarai murid dengan lajur <code className="bg-white px-1.5 py-0.5 rounded border text-indigo-700 font-semibold">Rumah Sukan</code>, atau fail Excel berbilang lembaran (Merah, Kuning, Hijau, Biru).
              </p>
            </div>

            {/* Mode 2: Fail berasingan ikut rumah */}
            <div
              onClick={() => {
                setUploadMode('berasingan');
                if (selectedFile) processFile(selectedFile, selectedSheet);
              }}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                uploadMode === 'berasingan'
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="font-bold text-sm text-slate-900">
                  B. Fail Berasingan Mengikut Rumah Sukan
                </div>
                {uploadMode === 'berasingan' && (
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1.5">
                Pentadbir memilih rumah sukan di bawah, dan sistem secara automatik menetapkan rumah tersebut kepada semua murid dalam fail.
              </p>
            </div>
          </div>

          {/* Sub-selector for Mode 2 */}
          {uploadMode === 'berasingan' && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-700">
                Pilih Rumah Sukan bagi fail yang hendak dimuat naik:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SENARAI_RUMAH_KEYS.map((rumahKey) => {
                  const info = SENARAI_RUMAH[rumahKey];
                  const isSelected = selectedRumah === rumahKey;
                  return (
                    <button
                      key={rumahKey}
                      type="button"
                      onClick={() => {
                        setSelectedRumah(rumahKey);
                        if (selectedFile) {
                          processFile(selectedFile, selectedSheet);
                        }
                      }}
                      className={`cursor-pointer px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-between ${
                        isSelected
                          ? `${info.bgLightClass} ${info.borderClass} ${info.textClass} ring-2 ring-indigo-500 shadow-xs`
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{info.namaRumah}</span>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: info.warnaTema }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* File Upload Dropzone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-2xl p-8 text-center bg-indigo-50/20 hover:bg-indigo-50/50 transition-all cursor-pointer group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
              <Upload className="w-7 h-7" />
            </div>
            <div className="mt-3 font-bold text-sm text-slate-800">
              {selectedFile ? (
                <span className="text-indigo-700">Fail Terpilih: {selectedFile.name}</span>
              ) : (
                'Klik untuk pilih fail atau seret & lepas fail ke sini'
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Menyokong fail Excel (.xlsx, .xls) atau fail teks CSV (.csv)
            </p>

            {isProcessing && (
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-indigo-700 font-semibold animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Mengekstrak data murid dan menyemak baris...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* PRATONTON & PENGESAHAN KEMASUKAN DATA */}
      {/* ============================================================== */}
      {hasilPratonton && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 animate-fadeIn space-y-6">
          {/* Header & Sheet Switcher */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Pratonton & Pengesahan Data Murid
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Semak maklumat sebelum disahkan. Anda boleh memilih untuk menggantikan sepenuhnya data lama atau menggabungkannya.
              </p>
            </div>

            {/* Sheet Selector if Excel has multiple sheets */}
            {hasilPratonton.senaraiLembaran && hasilPratonton.senaraiLembaran.length > 1 && (
              <div className="flex items-center gap-1.5 flex-wrap bg-slate-100 p-1.5 rounded-xl text-xs">
                <span className="text-slate-500 font-bold px-2 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  Lembaran:
                </span>
                <button
                  type="button"
                  onClick={() => handleSheetChange('semua')}
                  className={`cursor-pointer px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    selectedSheet === 'semua'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  Semua ({hasilPratonton.senaraiLembaran.length} Helai)
                </button>
                {hasilPratonton.senaraiLembaran.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSheetChange(s)}
                    className={`cursor-pointer px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      selectedSheet === s
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Jumlah Dalam Fail</div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">
                {hasilPratonton.jumlahBaris}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Baris rekod diekstrak</div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">
              <div className="text-[11px] font-semibold text-emerald-800 uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Rekod Sah
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-0.5">
                {hasilPratonton.jumlahSah}
              </div>
              <div className="text-[11px] text-emerald-700 mt-1">Data lengkap & bersedia</div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl">
              <div className="text-[11px] font-semibold text-amber-800 uppercase flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Kemaskini / Padanan
              </div>
              <div className="text-2xl font-black text-amber-700 mt-0.5">
                {hasilPratonton.jumlahKemaskini}
              </div>
              <div className="text-[11px] text-amber-700 mt-1">ID sudah wujud dalam sistem</div>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl">
              <div className="text-[11px] font-semibold text-rose-800 uppercase flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                Ralat Dikesan
              </div>
              <div className="text-2xl font-black text-rose-700 mt-0.5">
                {hasilPratonton.jumlahRalat}
              </div>
              <div className="text-[11px] text-rose-700 mt-1">
                {hasilPratonton.jumlahRalat > 0 ? 'Nama kosong / tidak sah' : 'Tiada ralat'}
              </div>
            </div>
          </div>

          {/* Ralat Alert if any rows failed */}
          {hasilPratonton.jumlahRalat > 0 && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Perhatian ketidaksamaan jumlah:</span> Terdapat{' '}
                <strong>{hasilPratonton.jumlahRalat} baris</strong> dalam fail yang tidak dapat dimasukkan
                kerana medan kritikal kosong (contohnya Nama Murid kosong). Hanya{' '}
                <strong>{validCount} baris sah</strong> yang akan didaftarkan ke pangkalan data.
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* PILIHAN MOD IMPORT: GANTI VS GABUNG (PUNCA UTAMA KETIDAKSAMAAN JUMLAH) */}
          {/* ============================================================== */}
          <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-extrabold text-xs sm:text-sm text-indigo-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Pilih Mod Kemasukan ke Pangkalan Data:</span>
              </div>
              <span className="text-[11px] font-bold text-indigo-700 bg-white px-2.5 py-0.5 rounded-full border border-indigo-200">
                Murid Sedia Ada Dalam Sistem: {currentMuridList.length} Orang
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {/* Option 1: Gantikan Semua (Disyorkan agar sama tepat dengan fail) */}
              <div
                onClick={() => setImportMode('replace')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  importMode === 'replace'
                    ? 'border-indigo-600 bg-white shadow-sm ring-1 ring-indigo-500'
                    : 'border-slate-200 bg-white/70 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-900">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="w-4 h-4 text-indigo-600 cursor-pointer"
                    />
                    <span>1. Gantikan Keseluruhan Data Murid (Disyorkan)</span>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                    Jumlah Sama Tepat
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-2 ml-6 leading-relaxed">
                  Kosongkan data murid contoh/lama dan gunakan <strong>hanya murid daripada fail ini</strong>.
                  Jumlah murid dalam sistem selepas disahkan dijamin <strong>tepat {validCount} orang murid</strong>.
                </p>
              </div>

              {/* Option 2: Tambah / Gabung */}
              <div
                onClick={() => setImportMode('merge')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  importMode === 'merge'
                    ? 'border-indigo-600 bg-white shadow-sm ring-1 ring-indigo-500'
                    : 'border-slate-200 bg-white/70 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-900">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className="w-4 h-4 text-indigo-600 cursor-pointer"
                    />
                    <span>2. Tambah / Gabungkan Murid Sedia Ada</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                    Kekalkan Sedia Ada
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-2 ml-6 leading-relaxed">
                  Kekalkan {currentMuridList.length} orang murid yang sedia ada dalam sistem dan tambahkan murid baharu daripada fail ini.
                </p>
              </div>
            </div>
          </div>

          {/* Action Confirmation Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200">
            <div className="text-xs text-slate-600">
              {importMode === 'replace' ? (
                <span>
                  Sistem akan mengandungi tepat <strong>{validCount} orang murid</strong> setelah pengesahan selesai.
                </span>
              ) : (
                <span>
                  Sistem akan menggabungkan <strong>{validCount} murid</strong> dengan data sedia ada ({currentMuridList.length} murid).
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setHasilPratonton(null);
                }}
                className="cursor-pointer px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={validCount === 0 || isSaving}
                className="cursor-pointer px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menyelaras Pangkalan Data...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>
                      {importMode === 'replace'
                        ? `Sahkan & Gantikan Semua (${validCount} Murid)`
                        : `Sahkan & Gabung (${validCount} Murid)`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Filter Bar for Preview Table */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilterPratonton('semua')}
                className={`cursor-pointer px-3 py-1 rounded-lg transition-all ${
                  filterPratonton === 'semua' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Semua ({hasilPratonton.jumlahBaris})
              </button>
              <button
                type="button"
                onClick={() => setFilterPratonton('sah')}
                className={`cursor-pointer px-3 py-1 rounded-lg transition-all ${
                  filterPratonton === 'sah' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Sah ({hasilPratonton.jumlahSah})
              </button>
              <button
                type="button"
                onClick={() => setFilterPratonton('kemaskini')}
                className={`cursor-pointer px-3 py-1 rounded-lg transition-all ${
                  filterPratonton === 'kemaskini' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Kemaskini ({hasilPratonton.jumlahKemaskini})
              </button>
              <button
                type="button"
                onClick={() => setFilterPratonton('ralat')}
                className={`cursor-pointer px-3 py-1 rounded-lg transition-all ${
                  filterPratonton === 'ralat' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Ralat ({hasilPratonton.jumlahRalat})
              </button>
            </div>

            <div className="text-xs text-slate-500 hidden sm:block">
              {hasilPratonton.jumlahRalat > 0 ? (
                <span className="text-rose-600 font-medium">
                  * Baris dengan ralat tidak akan dimasukkan ke pangkalan data.
                </span>
              ) : (
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Semua rekod lulus semakan pengesahan
                </span>
              )}
            </div>
          </div>

          {/* Preview Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto max-h-80">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3">Baris</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">ID Murid</th>
                  <th className="py-2.5 px-3">Nama Murid</th>
                  <th className="py-2.5 px-3">No. Pengenalan</th>
                  <th className="py-2.5 px-3">Tarikh Lahir</th>
                  <th className="py-2.5 px-3">Tahun & Kelas</th>
                  <th className="py-2.5 px-3">Jantina</th>
                  <th className="py-2.5 px-3">Rumah Sukan</th>
                  <th className="py-2.5 px-3">Catatan / Ralat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRecords?.map((rec, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-50 transition-colors ${
                      rec.status === 'ralat'
                        ? 'bg-rose-50/60'
                        : rec.status === 'kemaskini'
                        ? 'bg-amber-50/40'
                        : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono text-slate-500">#{rec.baris}</td>
                    <td className="py-2.5 px-3">
                      {rec.status === 'sah' && (
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          Sah
                        </span>
                      )}
                      {rec.status === 'kemaskini' && (
                        <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          Kemaskini
                        </span>
                      )}
                      {rec.status === 'ralat' && (
                        <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          Ralat
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                      {rec.idMurid || <span className="text-rose-500 italic">[Kosong]</span>}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {rec.nama || <span className="text-rose-500 italic">[Kosong]</span>}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">
                      {rec.noPengenalan || <span className="text-slate-400 italic">-</span>}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {rec.tarikhLahir || <span className="text-slate-400 italic">-</span>}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {rec.kelas} ({rec.tahun === 0 ? 'Pra' : `T${rec.tahun}`})
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          rec.jantina === 'Lelaki'
                            ? 'bg-blue-100 text-blue-800'
                            : rec.jantina === 'Perempuan'
                            ? 'bg-pink-100 text-pink-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {rec.jantina || 'Kosong'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold">
                      {rec.rumahSukan ? (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] ${
                            SENARAI_RUMAH[rec.rumahSukan as RumahSukan]?.badgeClass ||
                            'bg-slate-200 text-slate-800'
                          }`}
                        >
                          Rumah {rec.rumahSukan}
                        </span>
                      ) : (
                        <span className="text-rose-500 italic">[Kosong]</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {rec.ralat.length > 0 ? (
                        <div className="text-rose-700 font-medium text-[11px] space-y-0.5">
                          {rec.ralat.map((err, eIdx) => (
                            <div key={eIdx} className="flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              <span>{err}</span>
                            </div>
                          ))}
                        </div>
                      ) : rec.amaran.length > 0 ? (
                        <div className="text-amber-800 text-[11px]">
                          {rec.amaran.join(', ')}
                        </div>
                      ) : (
                        <span className="text-emerald-700 text-[11px] font-medium flex items-center gap-1">
                          <Check className="w-3 h-3" /> Data lengkap
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
