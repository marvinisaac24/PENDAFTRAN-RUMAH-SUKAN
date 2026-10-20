import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Trash2,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  CheckSquare,
  Square,
  AlertTriangle,
  X,
  ShieldAlert
} from 'lucide-react';
import { Jantina, Murid, RumahSukan } from '../types';
import { SENARAI_RUMAH, SENARAI_RUMAH_KEYS, SENARAI_KELAS_PRA } from '../data/constants';
import { StorageService } from '../services/storageService';
import { exportMuridToExcel } from '../utils/fileParser';
import { exportMasterSportsWorkbook } from '../utils/sportsReportExporter';
import { AcaraSukan, PendaftaranAcara } from '../types';

interface StudentDirectoryProps {
  muridList: Murid[];
  pendaftaranList?: PendaftaranAcara[];
  acaraList?: AcaraSukan[];
  onRefresh: () => void;
}

export const StudentDirectory: React.FC<StudentDirectoryProps> = ({
  muridList,
  pendaftaranList,
  acaraList,
  onRefresh,
}) => {
  const [filterRumah, setFilterRumah] = useState<string>('semua');
  const [filterTahun, setFilterTahun] = useState<string>('semua');
  const [filterKelas, setFilterKelas] = useState<string>('semua');
  const [filterJantina, setFilterJantina] = useState<string>('semua');
  const [carian, setCarian] = useState<string>('');

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  // Add Single Student Modal State
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newId, setNewId] = useState<string>('');
  const [newNama, setNewNama] = useState<string>('');
  const [newNoPengenalan, setNewNoPengenalan] = useState<string>('');
  const [newTarikhLahir, setNewTarikhLahir] = useState<string>('');
  const [newTahun, setNewTahun] = useState<number>(3);
  const [newKelas, setNewKelas] = useState<string>('3 Fleksibel');
  const [newJantina, setNewJantina] = useState<Jantina>('Lelaki');
  const [newRumah, setNewRumah] = useState<RumahSukan>('Merah');

  // Senarai pendaftaran berkesan tanpa overhead capaian storan
  const effectivePendaftaranList = useMemo(() => {
    return pendaftaranList || StorageService.getPendaftaranList();
  }, [pendaftaranList]);

  // Map peserta yang didaftarkan dalam acara kepada ID Peserta rasmi mereka
  const studentAthleteIdMap = useMemo(() => {
    const map = new Map<string, string>();
    effectivePendaftaranList.forEach((reg) => {
      reg.peserta.forEach((p) => {
        const idToDisplay = p.idPeserta || p.muridId;
        if (idToDisplay) {
          map.set(p.muridId, idToDisplay);
          map.set(p.nama.trim().toLowerCase(), idToDisplay);
        }
      });
    });
    return map;
  }, [effectivePendaftaranList]);

  // Distinct classes for filter (merangkumi Pra Cekal & Pra Dinamik)
  const distinctKelas = useMemo(() => {
    const set = new Set<string>();
    if (filterTahun === 'semua' || filterTahun === '0') {
      SENARAI_KELAS_PRA.forEach((k) => set.add(k));
    }
    muridList.forEach((m) => {
      if (filterTahun === 'semua' || String(m.tahun) === filterTahun) {
        set.add(m.kelas);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [muridList, filterTahun]);

  // Filtered students
  const filteredMurid = useMemo(() => {
    return muridList.filter((m) => {
      if (filterRumah !== 'semua' && m.rumahSukan !== filterRumah) return false;
      if (filterTahun !== 'semua' && String(m.tahun) !== filterTahun) return false;
      if (filterKelas !== 'semua' && m.kelas !== filterKelas) return false;
      if (filterJantina !== 'semua' && m.jantina !== filterJantina) return false;

      if (carian.trim()) {
        const q = carian.trim().toLowerCase();
        const officialId = studentAthleteIdMap.get(m.id) || studentAthleteIdMap.get(m.nama.trim().toLowerCase()) || '';
        return (
          m.nama.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          officialId.toLowerCase().includes(q)
        );
      }

      return true;
    }).sort((a, b) => a.nama.localeCompare(b.nama, 'ms', { sensitivity: 'base' }));
  }, [muridList, filterRumah, filterTahun, filterKelas, filterJantina, carian, studentAthleteIdMap]);

  // Checkbox helpers
  const allFilteredSelected =
    filteredMurid.length > 0 && filteredMurid.every((m) => selectedIds.has(m.id));

  const handleToggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      // Unselect all filtered
      const next = new Set(selectedIds);
      filteredMurid.forEach((m) => next.delete(m.id));
      setSelectedIds(next);
    } else {
      // Select all filtered
      const next = new Set(selectedIds);
      filteredMurid.forEach((m) => next.add(m.id));
      setSelectedIds(next);
    }
  };

  const handleToggleStudent = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  // Perform Bulk Delete
  const handleConfirmBulkDelete = () => {
    if (selectedIds.size === 0) return;

    const count = selectedIds.size;
    const result = StorageService.deleteMuridBatch(Array.from(selectedIds));

    setSelectedIds(new Set());
    setShowBulkDeleteModal(false);
    onRefresh();

    setNotification({
      type: 'success',
      message: `Berjaya memadam ${result.dipadam} orang murid secara pukal daripada pangkalan data! (Baki murid: ${result.baki})`,
    });

    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };

  // Quick Bulk Delete All Filtered
  const handleBulkDeleteAllFiltered = () => {
    if (filteredMurid.length === 0) return;
    const next = new Set<string>();
    filteredMurid.forEach((m) => next.add(m.id));
    setSelectedIds(next);
    setShowBulkDeleteModal(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama.trim() || !newKelas.trim()) {
      alert('Sila lengkapkan nama murid dan kelas.');
      return;
    }

    // ID Murid tidak wajib diisi untuk semua murid. Jika kosong, sistem menjana rujukan dalaman.
    const housePrefix = newRumah ? newRumah[0].toUpperCase() : 'M';
    const autoRefId =
      newId.trim() ||
      `S-${housePrefix}${newTahun === 0 ? 'P' : newTahun}-${Date.now().toString().slice(-4)}`;

    let dob = newTarikhLahir.trim();
    if (!dob && newNoPengenalan.trim()) {
      const digits = newNoPengenalan.replace(/\D/g, '');
      if (digits.length >= 6) {
        const yy = parseInt(digits.slice(0, 2), 10);
        const mm = digits.slice(2, 4);
        const dd = digits.slice(4, 6);
        const mNum = parseInt(mm, 10);
        const dNum = parseInt(dd, 10);
        if (mNum >= 1 && mNum <= 12 && dNum >= 1 && dNum <= 31) {
          const fullYear = yy <= 30 ? 2000 + yy : 1900 + yy;
          dob = `${dd}/${mm}/${fullYear}`;
        }
      }
    }

    StorageService.upsertMuridBatch([
      {
        id: autoRefId,
        nama: newNama.trim(),
        tahun: newTahun,
        kelas: newKelas.trim(),
        jantina: newJantina,
        rumahSukan: newRumah,
        noPengenalan: newNoPengenalan.trim() || undefined,
        noSijilLahir: newNoPengenalan.trim() || undefined,
        tarikhLahir: dob || undefined,
      },
    ]);

    setIsAdding(false);
    setNewId('');
    setNewNama('');
    setNewNoPengenalan('');
    setNewTarikhLahir('');
    onRefresh();
    setNotification({
      type: 'success',
      message: `Murid "${newNama.trim()}" berjaya didaftarkan ke Rumah ${newRumah}! ID Murid rasmi akan diberikan secara automatik apabila dipilih menyertai acara.`,
    });
  };

  const handleDeleteSingle = (id: string, nama: string) => {
    if (confirm(`Adakah anda pasti ingin memadamkan murid "${nama}" (${id})?`)) {
      StorageService.deleteMurid(id);
      const next = new Set(selectedIds);
      next.delete(id);
      setSelectedIds(next);
      onRefresh();
      setNotification({
        type: 'info',
        message: `Murid "${nama}" telah dipadam.`,
      });
    }
  };

  const handleClearAll = () => {
    if (
      confirm(
        'AMARAN: Adakah anda pasti ingin memadamkan SEMUA murid daripada pangkalan data? Hanya murid yang didaftarkan nanti sahaja akan muncul dalam senarai mengikut Rumah Sukan.'
      )
    ) {
      StorageService.clearAllMurid();
      setSelectedIds(new Set());
      onRefresh();
      setNotification({
        type: 'info',
        message: 'Semua rekod murid telah berjaya dipadamkan. Pangkalan data murid kini kosong.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification banner */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-xs transition-all animate-fadeIn ${
          notification.type === 'success'
            ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
            : 'bg-blue-50 border border-blue-300 text-blue-900'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-500 hover:text-slate-800 cursor-pointer p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top action header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Pangkalan Data Murid & Pengurusan Pukal
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Urus senarai murid, tambah murid baharu, atau padam rekod murid secara pukal sekiranya tersalah isi/muat naik.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="cursor-pointer px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Murid</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const effectiveAcara = acaraList || StorageService.getAcaraList();
                exportMasterSportsWorkbook({
                  acaraList: effectiveAcara,
                  pendaftaranList: effectivePendaftaranList,
                  muridList,
                });
              }}
              className="cursor-pointer px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              title="Muat turun senarai lengkap mengikut jenis acara & 4 rumah sukan (Merah, Kuning, Hijau, Biru) dalam fail Excel multi-lembaran"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Muat Turun 4 Rumah Sukan (Excel)</span>
            </button>

            <button
              type="button"
              onClick={() => exportMuridToExcel(filteredMurid, 'xlsx')}
              className="cursor-pointer px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all border border-slate-200 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Eksport Murid (Excel)</span>
            </button>

            <button
              type="button"
              onClick={() => exportMuridToExcel(filteredMurid, 'csv')}
              className="cursor-pointer px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all border border-slate-200 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Eksport CSV</span>
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-4">
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari mengikut nama atau ID murid..."
              value={carian}
              onChange={(e) => setCarian(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <select
              value={filterRumah}
              onChange={(e) => setFilterRumah(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            >
              <option value="semua">Semua Rumah Sukan</option>
              {SENARAI_RUMAH_KEYS.map((r) => (
                <option key={r} value={r}>
                  Rumah {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterTahun}
              onChange={(e) => {
                setFilterTahun(e.target.value);
                setFilterKelas('semua');
              }}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            >
              <option value="semua">Semua Tahun (Pra, 1 - 6)</option>
              <option value="0">Pra Sekolah</option>
              {[1, 2, 3, 4, 5, 6].map((t) => (
                <option key={t} value={t}>
                  Tahun {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterJantina}
              onChange={(e) => setFilterJantina(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            >
              <option value="semua">Semua Jantina</option>
              <option value="Lelaki">Lelaki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>
        </div>

        {/* Quick Class Chips */}
        {distinctKelas.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-slate-400 font-semibold mr-1">Kelas:</span>
            <button
              type="button"
              onClick={() => setFilterKelas('semua')}
              className={`cursor-pointer px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors ${
                filterKelas === 'semua' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Semua Kelas
            </button>
            {distinctKelas.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setFilterKelas(k)}
                className={`cursor-pointer px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors ${
                  filterKelas === k ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bulk Action Sticky Bar when items are selected */}
      {selectedIds.size > 0 && (
        <div className="sticky top-20 z-20 bg-rose-900 text-white rounded-2xl p-4 shadow-xl border border-rose-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-800 rounded-xl shrink-0">
              <CheckSquare className="w-5 h-5 text-rose-200" />
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base flex items-center gap-2">
                <span>{selectedIds.size} orang murid dipilih</span>
                <span className="text-xs bg-rose-800 px-2.5 py-0.5 rounded-full border border-rose-600">
                  Mod Tindakan Pukal
                </span>
              </div>
              <p className="text-xs text-rose-200">
                Gunakan ciri ini untuk memadam rekod murid yang tersalah isi atau tersalah muat naik secara pukal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleClearSelection}
              className="cursor-pointer px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
            >
              Batal Pilihan
            </button>

            <button
              type="button"
              onClick={() => setShowBulkDeleteModal(true)}
              className="cursor-pointer px-4 py-2 rounded-xl bg-white text-rose-900 hover:bg-rose-50 text-xs font-extrabold transition-all shadow-md flex items-center gap-1.5 active:scale-95"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Padam Pukal ({selectedIds.size} Murid)</span>
            </button>
          </div>
        </div>
      )}

      {/* Table & Record Count */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span>
              Memaparkan <strong>{filteredMurid.length}</strong> daripada <strong>{muridList.length}</strong> jumlah murid
            </span>

            {filteredMurid.length > 0 && (
              <button
                type="button"
                onClick={handleToggleSelectAllFiltered}
                className="cursor-pointer text-indigo-600 hover:text-indigo-800 font-bold underline flex items-center gap-1"
              >
                {allFilteredSelected ? 'Nyahpilih Semua Hasil Ini' : `Pilih Semua (${filteredMurid.length})`}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {filteredMurid.length > 0 && (
              <button
                type="button"
                onClick={handleBulkDeleteAllFiltered}
                className="cursor-pointer text-[11px] text-rose-700 hover:text-rose-900 hover:underline flex items-center gap-1 font-bold mr-2"
                title="Pilih semua hasil tapisan semasa dan buka dialog padam pukal"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Padam Pukal Hasil Tapisan Ini ({filteredMurid.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleClearAll}
              className="cursor-pointer text-[11px] font-bold text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1"
              title="Padam semua murid dari pangkalan data"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Padam Semua Murid</span>
            </button>
          </div>
        </div>

        {muridList.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs bg-slate-50/50 rounded-xl m-4 border-2 border-dashed border-slate-200">
            <Users className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
            <div className="font-bold text-slate-800 text-base">Pangkalan Data Murid Kosong</div>
            <p className="text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              Semua nama telah dipadamkan. Hanya murid yang didaftarkan nanti sahaja akan muncul dalam senarai mengikut Rumah Sukan.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Murid Baharu</span>
              </button>
            </div>
          </div>
        ) : filteredMurid.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <div className="font-bold text-slate-700">Tiada murid yang sepadan</div>
            <p className="text-slate-400 mt-1">Sila laraskan kriteria carian atau tapisan di atas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[550px]">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={handleToggleSelectAllFiltered}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      title="Pilih / Nyahpilih semua pada tapisan ini"
                    />
                  </th>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Nama Murid</th>
                  <th className="py-2.5 px-3">No. Pengenalan</th>
                  <th className="py-2.5 px-3">Tarikh Lahir</th>
                  <th className="py-2.5 px-3">ID Peserta Acara (Auto)</th>
                  <th className="py-2.5 px-3">Tahun</th>
                  <th className="py-2.5 px-3">Kelas</th>
                  <th className="py-2.5 px-3">Jantina</th>
                  <th className="py-2.5 px-3">Rumah Sukan</th>
                  <th className="py-2.5 px-3 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredMurid.map((murid, idx) => {
                  const isChecked = selectedIds.has(murid.id);
                  const officialAthleteId =
                    studentAthleteIdMap.get(murid.id) ||
                    studentAthleteIdMap.get(murid.nama.trim().toLowerCase());

                  return (
                    <tr
                      key={murid.id}
                      className={`transition-colors ${
                        isChecked ? 'bg-rose-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleStudent(murid.id)}
                          className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {murid.nama}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">
                        {murid.noPengenalan || murid.noSijilLahir || <span className="text-slate-400 italic">-</span>}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {murid.tarikhLahir || <span className="text-slate-400 italic">-</span>}
                      </td>
                      <td className="py-2.5 px-3">
                        {officialAthleteId ? (
                          <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 shadow-2xs">
                            {officialAthleteId}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Auto semasa daftar acara
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {murid.tahun === 0 ? 'Pra Sekolah' : `Tahun ${murid.tahun}`}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{murid.kelas}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            murid.jantina === 'Lelaki'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-pink-100 text-pink-800'
                          }`}
                        >
                          {murid.jantina}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            SENARAI_RUMAH[murid.rumahSukan]?.badgeClass || 'bg-slate-100'
                          }`}
                        >
                          Rumah {murid.rumahSukan}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteSingle(murid.id, murid.nama)}
                          className="cursor-pointer text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Padam murid individu"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Bulk Delete */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="p-6 bg-rose-600 text-white flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Sahkan Pemadaman Pukal</h3>
                <p className="text-xs text-rose-100 mt-1">
                  Tindakan ini akan memadam data murid terpilih daripada pangkalan data kekal dan Firestore secara serta-merta.
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-950">
                <div className="font-bold text-sm mb-1">
                  Jumlah yang akan dipadam: {selectedIds.size} orang murid
                </div>
                <p className="text-rose-800">
                  Gunakan fungsi ini jika anda tersalah isi data, tersalah pilih rumah sukan semasa muat naik, atau memuat naik fail yang salah.
                </p>
              </div>

              {/* Preview of some selected names */}
              <div className="border border-slate-200 rounded-xl p-3 max-h-48 overflow-y-auto text-xs space-y-1">
                <div className="font-bold text-slate-500 uppercase text-[10px] mb-1">
                  Senarai Murid Yang Akan Dipadam:
                </div>
                {Array.from(selectedIds).map((id) => {
                  const m = muridList.find((stud) => stud.id === id);
                  if (!m) return null;
                  return (
                    <div key={id} className="flex items-center justify-between py-1 border-b border-slate-100 text-[11px]">
                      <span className="font-semibold text-slate-800 truncate">{m.nama}</span>
                      <span className="text-slate-500 shrink-0 font-mono">
                        {m.kelas} • Rumah {m.rumahSukan}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBulkDeleteModal(false)}
                  className="cursor-pointer px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleConfirmBulkDelete}
                  className="cursor-pointer px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Sahkan Padam ({selectedIds.size} Murid)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Single Student Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="px-6 py-4 bg-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-300" />
                <h3 className="font-bold text-sm sm:text-base">Tambah Murid Baharu</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ID Murid (Pilihan Sahaja)
                </label>
                <input
                  type="text"
                  placeholder="Dikosongkan - Sistem auto berikan ID jika dipilih acara"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none placeholder:text-slate-400"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  * ID Murid tidak perlu diisi. Sistem akan menjana ID Peserta MSSR secara automatik apabila murid dipilih untuk acara sukan.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Penuh Murid *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Ali bin Ahmad"
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No. Pengenalan (MyKid / IC)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 140512-13-1234"
                    value={newNoPengenalan}
                    onChange={(e) => setNewNoPengenalan(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tarikh Lahir
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 12/05/2014"
                    value={newTarikhLahir}
                    onChange={(e) => setNewTarikhLahir(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tahun *
                  </label>
                  <select
                    value={newTahun}
                    onChange={(e) => {
                      const t = Number(e.target.value);
                      setNewTahun(t);
                      if (t === 0) {
                        setNewKelas('Pra Cekal');
                      } else {
                        setNewKelas(`${t} Fleksibel`);
                      }
                    }}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  >
                    <option value={0}>Pra Sekolah</option>
                    {[1, 2, 3, 4, 5, 6].map((t) => (
                      <option key={t} value={t}>
                        Tahun {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kelas *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={newTahun === 0 ? 'Contoh: Pra Cekal / Pra Dinamik' : 'Contoh: 3 Fleksibel'}
                    value={newKelas}
                    onChange={(e) => setNewKelas(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Quick Class Presets for Pra Sekolah */}
              {newTahun === 0 && (
                <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-200">
                  <div className="text-[11px] font-bold text-purple-900 mb-1.5">
                    Pilihan Pantas Kelas Pra Sekolah:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {SENARAI_KELAS_PRA.map((praKelas) => (
                      <button
                        key={praKelas}
                        type="button"
                        onClick={() => setNewKelas(praKelas)}
                        className={`cursor-pointer px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                          newKelas === praKelas
                            ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                            : 'bg-white text-purple-800 border-purple-200 hover:bg-purple-100'
                        }`}
                      >
                        {praKelas}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jantina *
                  </label>
                  <select
                    value={newJantina}
                    onChange={(e) => setNewJantina(e.target.value as Jantina)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  >
                    <option value="Lelaki">Lelaki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rumah Sukan *
                  </label>
                  <select
                    value={newRumah}
                    onChange={(e) => setNewRumah(e.target.value as RumahSukan)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  >
                    {SENARAI_RUMAH_KEYS.map((r) => (
                      <option key={r} value={r}>
                        Rumah {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="cursor-pointer px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="cursor-pointer px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
                >
                  Simpan Murid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
