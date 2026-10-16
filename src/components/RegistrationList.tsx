import React, { useState } from 'react';
import {
  Trophy,
  Users,
  Search,
  Filter,
  Trash2,
  Printer,
  Calendar,
  FileSpreadsheet,
  Table as TableIcon,
  LayoutGrid,
  CheckCircle,
  Tag,
  ExternalLink,
  FileText,
  Download
} from 'lucide-react';
import { PendaftaranAcara, RumahSukan } from '../types';
import { SENARAI_RUMAH, SENARAI_RUMAH_KEYS } from '../data/constants';
import { StorageService } from '../services/storageService';
import { PrintableCardSlipModal } from './PrintableCardSlipModal';
import * as XLSX from 'xlsx';

interface RegistrationListProps {
  pendaftaranList: PendaftaranAcara[];
  onRefresh: () => void;
}

export const RegistrationList: React.FC<RegistrationListProps> = ({
  pendaftaranList,
  onRefresh,
}) => {
  const [filterRumah, setFilterRumah] = useState<string>('semua');
  const [carian, setCarian] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [activeSlipModal, setActiveSlipModal] = useState<PendaftaranAcara | null>(null);

  const filteredList = pendaftaranList.filter((reg) => {
    if (filterRumah !== 'semua' && reg.rumahSukan !== filterRumah) return false;
    if (carian.trim()) {
      const q = carian.trim().toLowerCase();
      const matchAcara = reg.acaraNama.toLowerCase().includes(q);
      const matchPeserta = reg.peserta.some(
        (p) => p.nama.toLowerCase().includes(q) || p.muridId.toLowerCase().includes(q)
      );
      return matchAcara || matchPeserta;
    }
    return true;
  });

  const handleDelete = (id: string, namaAcara: string) => {
    if (confirm(`Batalkan pendaftaran acara "${namaAcara}"?`)) {
      StorageService.padamPendaftaran(id);
      onRefresh();
    }
  };

  const handleOpenSlip = (reg: PendaftaranAcara) => {
    setActiveSlipModal(reg);
  };

  const handleExportAll = () => {
    const flatRows: Record<string, string | number>[] = [];
    pendaftaranList.forEach((reg) => {
      reg.peserta.forEach((p, idx) => {
        flatRows.push({
          'ID Pendaftaran': reg.id,
          'Acara': reg.acaraNama,
          'Rumah Sukan': reg.rumahSukan,
          'Tarikh Daftar': new Date(reg.tarikhDaftar).toLocaleDateString('ms-MY'),
          'Peranan': p.peranan || (idx === 0 ? 'Peserta Utama' : `Pelari ${idx + 1}`),
          'ID Murid': p.muridId,
          'Nama Murid': p.nama,
          'Tahun': p.tahun,
          'Kelas': p.kelas,
          'Jantina': p.jantina,
          'Catatan': reg.catatan || '',
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(flatRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Senarai Pendaftaran');
    XLSX.writeFile(wb, `Pendaftaran_Kejohanan_Sukan_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleExportCSV = () => {
    const flatRows: Record<string, string | number>[] = [];
    pendaftaranList.forEach((reg) => {
      reg.peserta.forEach((p, idx) => {
        flatRows.push({
          'ID Pendaftaran': reg.id,
          'Acara': reg.acaraNama,
          'Rumah Sukan': reg.rumahSukan,
          'Tarikh Daftar': new Date(reg.tarikhDaftar).toLocaleDateString('ms-MY'),
          'Peranan': p.peranan || (idx === 0 ? 'Peserta Utama' : `Pelari ${idx + 1}`),
          'ID Murid': p.muridId,
          'Nama Murid': p.nama,
          'Tahun': p.tahun,
          'Kelas': p.kelas,
          'Jantina': p.jantina,
          'Catatan': reg.catatan || '',
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(flatRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pendaftaran');
    XLSX.writeFile(wb, `Pendaftaran_Kejohanan_Sukan_${new Date().toISOString().slice(0, 10)}.csv`, {
      bookType: 'csv',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-indigo-600" />
              Senarai Pendaftaran Acara Kejohanan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Semua penyertaan murid yang disahkan. Klik <strong>'Cetak Slip'</strong> pada setiap baris untuk mencetak kad slip pendaftaran rasmi.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`cursor-pointer px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  viewMode === 'table' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Jadual</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`cursor-pointer px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  viewMode === 'cards' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kad</span>
              </button>
            </div>

            {/* Butang 'Eksport ke CSV' yang diminta pengguna */}
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={pendaftaranList.length === 0}
              className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              title="Muat turun keseluruhan pendaftaran dalam format fail CSV"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Eksport ke CSV</span>
            </button>

            {/* Butang Eksport Excel */}
            <button
              type="button"
              onClick={handleExportAll}
              disabled={pendaftaranList.length === 0}
              className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
              title="Muat turun fail Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Eksport Excel</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari acara, nama murid atau ID murid..."
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
        </div>
      </div>

      {/* Main Content: Table View vs Cards View */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-xs">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <div className="font-bold text-slate-800 text-base">Tiada Pendaftaran Dijumpai</div>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Belum ada murid yang didaftarkan atau tiada padanan dengan tapisan carian. Sila ke tab "Pendaftaran Guru" untuk mula mendaftar acara.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* ============================================================== */
        /* PAPARAN JADUAL DENGAN BUTANG 'CETAK SLIP' PADA SETIAP BARIS */
        /* ============================================================== */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div>
              Jumlah: <strong>{filteredList.length}</strong> pendaftaran acara
            </div>
            <div className="text-[11px] text-indigo-700 font-medium">
              * Klik butang <strong>Cetak Slip</strong> untuk menjana kad slip ringkas murid.
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-3.5">Bil</th>
                  <th className="py-3 px-3.5">Rumah Sukan</th>
                  <th className="py-3 px-3.5">Acara Sukan</th>
                  <th className="py-3 px-3.5">Jenis</th>
                  <th className="py-3 px-3.5">Maklumat Murid / Peserta</th>
                  <th className="py-3 px-3.5">Tarikh Daftar</th>
                  <th className="py-3 px-3.5 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredList.map((reg, idx) => {
                  const info = SENARAI_RUMAH[reg.rumahSukan];
                  const isBerkumpulan = reg.peserta.length > 1;

                  return (
                    <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3.5 font-mono text-slate-400 font-bold">
                        {idx + 1}
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border inline-block ${info.badgeClass}`}
                        >
                          Rumah {reg.rumahSukan}
                        </span>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900 text-sm">{reg.acaraNama}</div>
                        {reg.catatan && (
                          <div className="text-[11px] text-slate-500 italic mt-0.5">
                            Nota: {reg.catatan}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        {isBerkumpulan ? (
                          <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                            Pasukan ({reg.peserta.length} ahli)
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-full text-[10px]">
                            Individu
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="space-y-1 max-w-md">
                          {reg.peserta.map((peserta, pIdx) => (
                            <div
                              key={pIdx}
                              className="text-xs flex items-center justify-between gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200/60"
                            >
                              <div className="truncate">
                                <strong className="text-slate-900">{peserta.nama}</strong>
                                <span className="text-slate-500 text-[11px] ml-1.5">
                                  ({peserta.kelas} • ID: {peserta.muridId})
                                </span>
                              </div>
                              <span className="text-[10px] font-semibold text-slate-600 bg-white px-1.5 py-0.2 rounded border shrink-0">
                                {peserta.peranan || (isBerkumpulan ? `Pelari ${pIdx + 1}` : 'Utama')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-3.5 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                        {new Date(reg.tarikhDaftar).toLocaleDateString('ms-MY')}
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Dedicated 'Cetak Slip' button per row */}
                          <button
                            type="button"
                            onClick={() => handleOpenSlip(reg)}
                            className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-xs transition-all"
                            title="Cetak slip format kad ringkas"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak Slip</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(reg.id, reg.acaraNama)}
                            className="cursor-pointer p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Batal pendaftaran"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* PAPARAN KAD GRID DENGAN BUTANG 'CETAK SLIP' */
        /* ============================================================== */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((reg) => {
            const info = SENARAI_RUMAH[reg.rumahSukan];
            const isBerkumpulan = reg.peserta.length > 1;

            return (
              <div
                key={reg.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${info.badgeClass}`}
                    >
                      Rumah {reg.rumahSukan}
                    </span>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(reg.tarikhDaftar).toLocaleDateString('ms-MY')}</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-slate-900">{reg.acaraNama}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {isBerkumpulan ? (
                      <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Acara Berkumpulan ({reg.peserta.length} peserta)
                      </span>
                    ) : (
                      <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        Acara Individu
                      </span>
                    )}
                  </div>

                  {/* List of Participants */}
                  <div className="mt-3 space-y-2">
                    {reg.peserta.map((peserta, pIdx) => (
                      <div
                        key={pIdx}
                        className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{peserta.nama}</div>
                          <div className="text-[11px] text-slate-500">
                            {peserta.kelas} • Tahun {peserta.tahun} • {peserta.jantina} (ID: {peserta.muridId})
                          </div>
                        </div>

                        {peserta.peranan && (
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                            {peserta.peranan}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {reg.catatan && (
                    <div className="mt-2 text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg">
                      Catatan: {reg.catatan}
                    </div>
                  )}
                </div>

                {/* Card Actions with prominent 'Cetak Slip' */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleOpenSlip(reg)}
                    className="cursor-pointer text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Slip (Format Kad)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(reg.id, reg.acaraNama)}
                    className="cursor-pointer text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Batal</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Printable Card Slip Modal */}
      {activeSlipModal && (
        <PrintableCardSlipModal
          pendaftaran={activeSlipModal}
          onClose={() => setActiveSlipModal(null)}
        />
      )}
    </div>
  );
};
