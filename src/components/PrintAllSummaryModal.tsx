import React, { useState } from 'react';
import {
  Printer,
  X,
  Trophy,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  School,
  Award,
  ChevronRight,
  Info,
  Download
} from 'lucide-react';
import { AcaraSukan, PendaftaranAcara, RumahSukan } from '../types';
import { SENARAI_RUMAH, SENARAI_RUMAH_KEYS } from '../data/constants';
import { exportMasterSportsWorkbook } from '../utils/sportsReportExporter';

interface PrintAllSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendaftaranList: PendaftaranAcara[];
  acaraList: AcaraSukan[];
}

export const PrintAllSummaryModal: React.FC<PrintAllSummaryModalProps> = ({
  isOpen,
  onClose,
  pendaftaranList,
  acaraList,
}) => {
  const [filterKategori, setFilterKategori] = useState<string>('semua');
  const [filterTahun, setFilterTahun] = useState<string>('semua');
  const [filterRumah, setFilterRumah] = useState<string>('semua');
  const [hanyaAcaraAdaDaftar, setHanyaAcaraAdaDaftar] = useState<boolean>(true);

  if (!isOpen) return null;

  // Map pendaftaran by acaraId
  const regByAcaraMap = new Map<string, PendaftaranAcara[]>();
  pendaftaranList.forEach((reg) => {
    const list = regByAcaraMap.get(reg.acaraId) || [];
    list.push(reg);
    regByAcaraMap.set(reg.acaraId, list);
  });

  // Filter events according to selections
  const filteredAcara = acaraList.filter((acara) => {
    if (filterKategori !== 'semua' && acara.kategori !== filterKategori) return false;
    if (filterTahun !== 'semua') {
      const t = parseInt(filterTahun, 10);
      if (!acara.tahunKelayakan.includes(t)) return false;
    }
    const regs = regByAcaraMap.get(acara.id) || [];
    if (filterRumah !== 'semua') {
      const hasHouse = regs.some((r) => r.rumahSukan === filterRumah);
      if (!hasHouse && hanyaAcaraAdaDaftar) return false;
    }
    if (hanyaAcaraAdaDaftar && regs.length === 0) {
      return false;
    }
    return true;
  });

  // Group events by Category
  const groupedByCategory: Record<string, AcaraSukan[]> = {};
  filteredAcara.forEach((acara) => {
    const cat = acara.kategori;
    if (!groupedByCategory[cat]) {
      groupedByCategory[cat] = [];
    }
    groupedByCategory[cat].push(acara);
  });

  // Summary counts
  const totalPeserta = pendaftaranList.reduce((acc, curr) => acc + curr.peserta.length, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      {/* Modal Dialog Container */}
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 no-print">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                <Printer className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-tight">
                  Laporan Ringkasan Pendaftaran & Rujukan Guru Hari Kejohanan
                </h3>
                <p className="text-xs text-slate-500">
                  Kejohanan Sukan Olahraga SK Tudan 2026 • Lengkap dengan ruangan catatan hakim & keputusan
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => {
                exportMasterSportsWorkbook({
                  acaraList,
                  pendaftaranList,
                });
              }}
              className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95"
              title="Muat turun senarai lengkap acara dan peserta 4 rumah sukan (Excel multi-lembaran)"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Muat Turun Excel (4 Rumah)</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang (Print / PDF)</span>
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

        {/* Filter Controls Bar (Hidden on print) */}
        <div className="p-3 sm:px-6 bg-slate-100/70 border-b border-slate-200 text-xs flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-indigo-600" />
              Tapis Cetakan:
            </span>

            {/* Kategori */}
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 font-medium text-slate-700 focus:outline-none"
            >
              <option value="semua">Semua Kategori</option>
              <option value="Balapan">Hanya Balapan</option>
              <option value="Padang">Hanya Padang (Tahun 3-5)</option>
              <option value="Sukaneka">Hanya Sukaneka</option>
              <option value="Pra Sekolah">Hanya Pra Sekolah</option>
            </select>

            {/* Tahun */}
            <select
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 font-medium text-slate-700 focus:outline-none"
            >
              <option value="semua">Semua Tahun</option>
              <option value="0">Prasekolah</option>
              <option value="1">Tahun 1</option>
              <option value="2">Tahun 2</option>
              <option value="3">Tahun 3</option>
              <option value="4">Tahun 4</option>
              <option value="5">Tahun 5</option>
              <option value="6">Tahun 6</option>
            </select>

            {/* Rumah Sukan */}
            <select
              value={filterRumah}
              onChange={(e) => setFilterRumah(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 font-medium text-slate-700 focus:outline-none"
            >
              <option value="semua">Semua Rumah Sukan</option>
              {SENARAI_RUMAH_KEYS.map((r) => (
                <option key={r} value={r}>
                  Rumah {r}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={hanyaAcaraAdaDaftar}
              onChange={(e) => setHanyaAcaraAdaDaftar(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-0"
            />
            <span>Hanya tunjuk acara yang telah didaftarkan murid</span>
          </label>
        </div>

        {/* Printable Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-white print:p-0 print:overflow-visible text-slate-900">
          
          {/* Official Document Header */}
          <div className="text-center pb-6 mb-6 border-b-2 border-slate-800">
            <div className="flex items-center justify-center gap-3 mb-2">
              <School className="w-8 h-8 text-indigo-800 print:text-black" />
              <div className="text-left">
                <h1 className="text-lg sm:text-xl font-extrabold uppercase tracking-wide text-slate-900 print:text-black">
                  SEKOLAH KEBANGSAAN TUDAN, MIRI
                </h1>
                <h2 className="text-sm sm:text-base font-bold text-slate-700 print:text-black">
                  KEJOHANAN SUKAN OLAHRAGA TAHUNAN SK TUDAN 2026
                </h2>
              </div>
            </div>

            <div className="inline-block px-4 py-1.5 rounded-full bg-slate-100 print:bg-transparent border border-slate-300 print:border-black font-extrabold text-xs sm:text-sm text-slate-900 uppercase tracking-wider my-2">
              SENARAI INDUK PENDAFTARAN PESERTA & BORANG HAKIM KEJOHANAN
            </div>

            <div className="flex items-center justify-center gap-4 text-[11px] sm:text-xs text-slate-600 print:text-black mt-1">
              <span>Tarikh Cetakan: <strong>{new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
              <span>•</span>
              <span>Jumlah Pendaftaran: <strong>{pendaftaranList.length}</strong></span>
              <span>•</span>
              <span>Jumlah Atlet: <strong>{totalPeserta}</strong></span>
              <span>•</span>
              <span>Piawaian: <strong>Kategori MSSR SK Tudan 2026</strong></span>
            </div>
          </div>

          {/* Acara Sections */}
          {filteredAcara.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Info className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <div className="font-bold text-sm text-slate-600">Tiada acara menepati tapisan pilihan.</div>
              <p className="text-xs text-slate-400 mt-1">
                Sila longgarkan pilihan tapisan atau pastikan pendaftaran telah dimasukkan oleh guru rumah sukan.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedByCategory).map(([kategori, acaraGroup]) => (
                <div key={kategori} className="space-y-6">
                  {/* Category Header Badge */}
                  <div className="flex items-center justify-between pb-2 border-b-2 border-indigo-600 print:border-black">
                    <h3 className="font-black text-sm sm:text-base uppercase tracking-wider text-indigo-950 print:text-black flex items-center gap-2">
                      <Award className="w-4 h-4 text-indigo-600 print:text-black" />
                      KATEGORI: {kategori.toUpperCase()}
                      {kategori === 'Padang' && (
                        <span className="text-xs font-semibold text-amber-700 bg-amber-100 print:text-black print:bg-transparent px-2 py-0.5 rounded-md">
                          (Tahun 3, 4 & 5 Sahaja)
                        </span>
                      )}
                    </h3>
                    <span className="text-xs font-bold text-slate-500 print:text-black">
                      {acaraGroup.length} Acara
                    </span>
                  </div>

                  {/* Individual Event Tables */}
                  {acaraGroup.map((acara, acaraIdx) => {
                    const registrations = regByAcaraMap.get(acara.id) || [];
                    const filteredRegs = filterRumah === 'semua'
                      ? registrations
                      : registrations.filter((r) => r.rumahSukan === filterRumah);

                    return (
                      <div
                        key={acara.id}
                        className="border border-slate-300 print:border-slate-800 rounded-xl overflow-hidden shadow-xs print:shadow-none break-inside-avoid mb-6"
                      >
                        {/* Event Sub-header */}
                        <div className="bg-slate-100 print:bg-slate-200/60 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-300 print:border-slate-800">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded font-black text-xs bg-indigo-700 text-white print:bg-black print:text-white">
                                {acara.kod}
                              </span>
                              <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                                {acara.nama}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 print:border print:border-black print:text-black">
                                {acara.kategoriMSSR || 'MSSR'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 print:text-black mt-0.5">
                              {acara.penerangan || `${acara.kategori} • ${acara.kategoriJantina} • ${acara.jenis}`}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 text-xs font-bold text-slate-700 print:text-black self-start sm:self-auto">
                            {acara.masa && (
                              <span className="flex items-center gap-1 bg-white print:bg-transparent px-2 py-1 rounded border border-slate-200 print:border-black">
                                <Calendar className="w-3.5 h-3.5" />
                                Masa: {acara.masa}
                              </span>
                            )}
                            <span className="bg-white print:bg-transparent px-2 py-1 rounded border border-slate-200 print:border-black">
                              {acara.jenis} ({acara.bilanganAhli} orang)
                            </span>
                          </div>
                        </div>

                        {/* Participants Table */}
                        {filteredRegs.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-500 italic bg-white">
                            Tiada murid didaftarkan untuk acara ini setakat ini.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50 print:bg-slate-100 text-slate-700 print:text-black font-bold border-b border-slate-300 print:border-slate-800">
                                  <th className="py-2 px-2.5 w-10 text-center border-r border-slate-200 print:border-slate-400">Bil</th>
                                  <th className="py-2 px-3 w-28 border-r border-slate-200 print:border-slate-400">Rumah Sukan</th>
                                  <th className="py-2 px-3 w-24 border-r border-slate-200 print:border-slate-400">ID Peserta</th>
                                  <th className="py-2 px-3 border-r border-slate-200 print:border-slate-400">Nama Murid / Atlet</th>
                                  <th className="py-2 px-2.5 w-24 border-r border-slate-200 print:border-slate-400">Tahun/Kelas</th>
                                  <th className="py-2 px-2.5 w-24 border-r border-slate-200 print:border-slate-400">Peranan</th>
                                  <th className="py-2 px-3 w-28 border-r border-slate-200 print:border-slate-400 text-center">Catatan/Masa</th>
                                  <th className="py-2 px-2.5 w-20 text-center">Kedudukan</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200 print:divide-slate-400 bg-white">
                                {filteredRegs.flatMap((reg) =>
                                  reg.peserta.map((peserta, pIdx) => {
                                    const houseInfo = SENARAI_RUMAH[reg.rumahSukan];
                                    return (
                                      <tr key={`${reg.id}-${peserta.muridId}-${pIdx}`} className="hover:bg-slate-50/80">
                                        <td className="py-2 px-2.5 text-center font-bold text-slate-500 print:text-black border-r border-slate-200 print:border-slate-400">
                                          {pIdx + 1}
                                        </td>
                                        <td className="py-2 px-3 font-bold border-r border-slate-200 print:border-slate-400">
                                          <span
                                            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold"
                                            style={{
                                              backgroundColor: houseInfo ? `${houseInfo.warnaTema}15` : '#f1f5f9',
                                              color: houseInfo ? houseInfo.warnaTema : '#000',
                                              border: `1px solid ${houseInfo ? houseInfo.warnaTema : '#cbd5e1'}`
                                            }}
                                          >
                                            {reg.rumahSukan}
                                          </span>
                                        </td>
                                        <td className="py-2 px-3 font-mono font-bold text-indigo-700 print:text-black border-r border-slate-200 print:border-slate-400">
                                          {peserta.idPeserta || peserta.muridId}
                                        </td>
                                        <td className="py-2 px-3 font-semibold text-slate-900 border-r border-slate-200 print:border-slate-400">
                                          {peserta.nama}
                                        </td>
                                        <td className="py-2 px-2.5 text-slate-700 border-r border-slate-200 print:border-slate-400">
                                          {peserta.kelas}
                                        </td>
                                        <td className="py-2 px-2.5 text-slate-700 border-r border-slate-200 print:border-slate-400 text-[11px] font-bold">
                                          <span
                                            className={`inline-block px-2 py-0.5 rounded text-[10px] ${
                                              peserta.isSimpanan || (peserta.peranan && peserta.peranan.toLowerCase().includes('simpanan'))
                                                ? 'bg-amber-100 text-amber-900 border border-amber-300 print:border-black print:text-black print:bg-transparent font-black'
                                                : 'bg-emerald-50 text-emerald-900 border border-emerald-300 print:border-black print:text-black print:bg-transparent font-black'
                                            }`}
                                          >
                                            {peserta.peranan || (acara.kategori === 'Padang' ? (pIdx === 0 ? 'Pemain Utama' : 'Pemain Simpanan') : (pIdx === 0 ? 'Peserta Utama' : `Pelari ${pIdx + 1}`))}
                                          </span>
                                        </td>
                                        {/* Blank fields for teachers and judges on the sports field */}
                                        <td className="py-2 px-3 border-r border-slate-200 print:border-slate-400 bg-slate-50/50 print:bg-white text-center text-slate-400">
                                          &nbsp;
                                        </td>
                                        <td className="py-2 px-2.5 bg-slate-50/50 print:bg-white text-center text-slate-400">
                                          &nbsp;
                                        </td>
                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Official Sign-off Box */}
              <div className="pt-8 mt-12 border-t-2 border-slate-400 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-slate-800 break-inside-avoid">
                <div className="space-y-12">
                  <div className="font-bold">Disediakan Oleh (Guru Pengurus):</div>
                  <div className="border-t border-slate-400 pt-1">
                    Nama: <br />
                    Rumah Sukan: <br />
                    Tarikh:
                  </div>
                </div>

                <div className="space-y-12">
                  <div className="font-bold">Disemak & Disahkan Oleh (Ketua Hakim):</div>
                  <div className="border-t border-slate-400 pt-1">
                    Nama: <br />
                    Jawatan: Ketua Hakim Padang / Balapan<br />
                    Tarikh:
                  </div>
                </div>

                <div className="space-y-12 hidden sm:block">
                  <div className="font-bold">Pengesahan Penolong Kanan Kokurikulum:</div>
                  <div className="border-t border-slate-400 pt-1">
                    Nama: <br />
                    SK Tudan, Miri<br />
                    Tarikh:
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Modal Bottom Footer (Hidden on print) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between no-print">
          <div className="text-xs text-slate-500">
            Format dioptimumkan untuk cetakan kertas saiz A4 menegak (Portrait) atau mendatar (Landscape).
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer px-4 py-2 rounded-xl border border-slate-300 font-semibold text-xs text-slate-700 hover:bg-slate-100"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="cursor-pointer inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
