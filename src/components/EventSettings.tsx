import React, { useState } from 'react';
import {
  Trophy,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Info,
  Calendar,
  Layers,
  Sparkles,
  X,
  FileSpreadsheet,
  Clock,
  Users
} from 'lucide-react';
import { AcaraSukan, KategoriAcara, KategoriJantinaAcara, JenisAcara } from '../types';
import { StorageService } from '../services/storageService';
import { DEFAULT_ACARA } from '../data/constants';

interface EventSettingsProps {
  acaraList: AcaraSukan[];
  onRefresh: () => void;
}

export const EventSettings: React.FC<EventSettingsProps> = ({
  acaraList,
  onRefresh,
}) => {
  const [carian, setCarian] = useState<string>('');
  const [filterKategori, setFilterKategori] = useState<string>('semua');
  const [filterTahun, setFilterTahun] = useState<string>('semua');
  const [filterJantina, setFilterJantina] = useState<string>('semua');
  const [modalMode, setModalMode] = useState<'tambah' | 'edit' | null>(null);
  const [editingAcara, setEditingAcara] = useState<AcaraSukan | null>(null);
  const [notisMesej, setNotisMesej] = useState<string | null>(null);

  // Form states for manual event registration
  const [formNama, setFormNama] = useState<string>('');
  const [formKod, setFormKod] = useState<string>('');
  const [formKategori, setFormKategori] = useState<KategoriAcara>('Balapan');
  const [formJantina, setFormJantina] = useState<KategoriJantinaAcara>('Lelaki');
  const [formKategoriMSSR, setFormKategoriMSSR] = useState<string>('MSSR B12');
  const [formTahun, setFormTahun] = useState<number[]>([4]);
  const [formJenis, setFormJenis] = useState<JenisAcara>('Individu');
  const [formBilanganAhli, setFormBilanganAhli] = useState<number>(1);
  const [formMasa, setFormMasa] = useState<string>('09:00');
  const [formCatatan, setFormCatatan] = useState<string>('AKHIR');
  const [formPenerangan, setFormPenerangan] = useState<string>('');

  const filteredAcara = acaraList.filter((acara) => {
    if (filterKategori !== 'semua' && acara.kategori !== filterKategori) return false;
    if (filterJantina !== 'semua' && acara.kategoriJantina !== filterJantina) return false;
    if (filterTahun !== 'semua') {
      const t = parseInt(filterTahun, 10);
      if (!acara.tahunKelayakan.includes(t)) return false;
    }
    if (carian.trim()) {
      const q = carian.trim().toLowerCase();
      const matchKod = acara.kod.toLowerCase().includes(q);
      const matchNama = acara.nama.toLowerCase().includes(q);
      const matchCatatan = acara.catatan?.toLowerCase().includes(q) || false;
      return matchKod || matchNama || matchCatatan;
    }
    return true;
  });

  const handleOpenTambahModal = () => {
    setModalMode('tambah');
    setEditingAcara(null);
    setFormNama('');
    setFormKod(`AC-${Date.now().toString().slice(-4)}`);
    setFormKategori('Balapan');
    setFormJantina('Lelaki');
    setFormKategoriMSSR('MSSR B12');
    setFormTahun([4]);
    setFormJenis('Individu');
    setFormBilanganAhli(1);
    setFormMasa('09:00');
    setFormCatatan('AKHIR');
    setFormPenerangan('');
  };

  const handleOpenEditModal = (acara: AcaraSukan) => {
    setModalMode('edit');
    setEditingAcara(acara);
    setFormNama(acara.nama);
    setFormKod(acara.kod);
    setFormKategori(acara.kategori);
    setFormJantina(acara.kategoriJantina);
    setFormKategoriMSSR(acara.kategoriMSSR || 'MSSR');
    setFormTahun([...acara.tahunKelayakan]);
    setFormJenis(acara.jenis);
    setFormBilanganAhli(acara.bilanganAhli);
    setFormMasa(acara.masa || '');
    setFormCatatan(acara.catatan || '');
    setFormPenerangan(acara.penerangan || '');
  };

  const handleToggleTahun = (tahunVal: number) => {
    if (formTahun.includes(tahunVal)) {
      if (formTahun.length > 1) {
        setFormTahun(formTahun.filter((t) => t !== tahunVal));
      }
    } else {
      setFormTahun([...formTahun, tahunVal].sort((a, b) => a - b));
    }
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim() || !formKod.trim()) {
      alert('Sila isikan Nama Acara dan Kod Acara.');
      return;
    }

    if (modalMode === 'tambah') {
      StorageService.tambahAcara({
        nama: formNama.trim(),
        kod: formKod.trim().toUpperCase(),
        kategori: formKategori,
        kategoriJantina: formJantina,
        kategoriMSSR: formKategoriMSSR.trim() || 'MSSR',
        tahunKelayakan: formTahun,
        jenis: formJenis,
        bilanganAhli: formJenis === 'Individu' ? 1 : Math.max(2, formBilanganAhli),
        masa: formMasa.trim(),
        catatan: formCatatan.trim(),
        penerangan: formPenerangan.trim(),
      });
      setNotisMesej(`Acara "${formNama}" berjaya didaftarkan secara manual ke dalam sistem!`);
    } else if (modalMode === 'edit' && editingAcara) {
      StorageService.kemaskiniAcara({
        ...editingAcara,
        nama: formNama.trim(),
        kod: formKod.trim().toUpperCase(),
        kategori: formKategori,
        kategoriJantina: formJantina,
        kategoriMSSR: formKategoriMSSR.trim() || 'MSSR',
        tahunKelayakan: formTahun,
        jenis: formJenis,
        bilanganAhli: formJenis === 'Individu' ? 1 : Math.max(2, formBilanganAhli),
        masa: formMasa.trim(),
        catatan: formCatatan.trim(),
        penerangan: formPenerangan.trim(),
      });
      setNotisMesej(`Acara "${formNama}" berjaya dikemaskini!`);
    }

    setModalMode(null);
    onRefresh();
    setTimeout(() => setNotisMesej(null), 4000);
  };

  const handleDeleteAcara = (acara: AcaraSukan) => {
    if (confirm(`Adakah anda pasti ingin memadamkan acara "${acara.kod} - ${acara.nama}" daripada sistem?`)) {
      StorageService.padamAcara(acara.id);
      setNotisMesej(`Acara "${acara.nama}" telah dipadam.`);
      onRefresh();
      setTimeout(() => setNotisMesej(null), 4000);
    }
  };

  const handleResetToLatestOfficial = () => {
    if (
      confirm(
        'Adakah anda ingin mengemaskini / memuat semula senarai acara kepada 61 Acara Rasmi SK Tudan 2026 mengikut ketetapan terkini?'
      )
    ) {
      StorageService.resetToDefaultAcara();
      setNotisMesej('Senarai acara telah berjaya dikemaskini kepada 61 Acara Terkini SK Tudan 2026!');
      onRefresh();
      setTimeout(() => setNotisMesej(null), 5000);
    }
  };

  // Quick stats
  const countBalapan = acaraList.filter((a) => a.kategori === 'Balapan').length;
  const countPadang = acaraList.filter((a) => a.kategori === 'Padang').length;
  const countSukaneka = acaraList.filter((a) => a.kategori === 'Sukaneka' || a.kategori === 'Pra Sekolah').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                <Trophy className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  Tetapan & Pengurusan Acara Sukan
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    SK Tudan 2026
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Urus dan daftarkan acara secara manual, atau kemaskini kepada senarai rasmi 61 acara terkini kejohanan.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Butang Kemaskini Acara Terkini */}
            <button
              type="button"
              onClick={handleResetToLatestOfficial}
              className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs transition-all shadow-xs active:scale-95"
              title="Kemaskini senarai acara kepada 61 Acara Rasmi SK Tudan 2026 mengikut tahun dan jantina"
            >
              <RefreshCw className="w-4 h-4 text-amber-700" />
              <span>Kemaskini ke Senarai Acara Terkini (SK Tudan 2026)</span>
            </button>

            {/* Butang Tambah Acara Manual */}
            <button
              type="button"
              onClick={handleOpenTambahModal}
              className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Daftar Acara Manual</span>
            </button>
          </div>
        </div>

        {/* Informative Stats & Rule Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div className="text-xs text-slate-500 font-medium">Jumlah Acara</div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">{acaraList.length}</div>
          </div>
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-center">
            <div className="text-xs text-blue-700 font-medium">Balapan (Tahun 1 - 6)</div>
            <div className="text-xl font-extrabold text-blue-900 mt-0.5">{countBalapan}</div>
          </div>
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-center">
            <div className="text-xs text-amber-700 font-medium">Padang (Tahun 3, 4 & 5 Sahaja)</div>
            <div className="text-xl font-extrabold text-amber-900 mt-0.5">{countPadang}</div>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-center">
            <div className="text-xs text-emerald-700 font-medium">Sukaneka & Prasekolah</div>
            <div className="text-xl font-extrabold text-emerald-900 mt-0.5">{countSukaneka}</div>
          </div>
        </div>

        {/* Rule Alert Banner */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Ketetapan Khas Acara Padang SK Tudan 2026:</strong> Acara Padang (Lompat Tinggi, Lontar Peluru, Lompat Jauh) dihadkan khas untuk murid <strong>Tahun 3, 4, dan 5 sahaja</strong>. Tahun 1 & 2 hanya menyertai Sukaneka dan Balapan 60m, manakala Tahun 6 hanya menyertai Balapan (100m, 200m, 4x100m, 4x200m).
          </div>
        </div>

        {/* Success Alert */}
        {notisMesej && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notisMesej}</span>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kod atau nama acara..."
              value={carian}
              onChange={(e) => setCarian(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            >
              <option value="semua">Semua Kategori</option>
              <option value="Balapan">Balapan</option>
              <option value="Padang">Padang</option>
              <option value="Sukaneka">Sukaneka</option>
              <option value="Pra Sekolah">Pra Sekolah</option>
            </select>
          </div>

          <div>
            <select
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            >
              <option value="semua">Semua Tahun</option>
              <option value="0">Prasekolah (Tahun 0)</option>
              <option value="1">Tahun 1</option>
              <option value="2">Tahun 2</option>
              <option value="3">Tahun 3</option>
              <option value="4">Tahun 4</option>
              <option value="5">Tahun 5</option>
              <option value="6">Tahun 6</option>
            </select>
          </div>

          <div>
            <select
              value={filterJantina}
              onChange={(e) => setFilterJantina(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            >
              <option value="semua">Semua Jantina</option>
              <option value="Lelaki">Lelaki Sahaja</option>
              <option value="Perempuan">Perempuan Sahaja</option>
              <option value="Terbuka">Terbuka (Campuran)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Menunjukkan <strong>{filteredAcara.length}</strong> daripada {acaraList.length} acara berdaftar
          </div>
          <div className="text-[11px] text-slate-500">
            * Acara yang didaftarkan di sini akan terus dipaparkan dalam borang pendaftaran guru.
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold sticky top-0 z-10">
              <tr>
                <th className="py-3 px-3.5 w-12 text-center">Bil</th>
                <th className="py-3 px-3.5 w-24">Kod</th>
                <th className="py-3 px-3.5">Nama Acara</th>
                <th className="py-3 px-3.5">Kategori & MSSR</th>
                <th className="py-3 px-3.5">Jantina</th>
                <th className="py-3 px-3.5">Tahun Kelayakan</th>
                <th className="py-3 px-3.5">Jenis & Kuota</th>
                <th className="py-3 px-3.5">Masa</th>
                <th className="py-3 px-3.5 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAcara.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Tiada acara dijumpai menepati kriteria tapisan carian.
                  </td>
                </tr>
              ) : (
                filteredAcara.map((acara, index) => {
                  const katColor =
                    acara.kategori === 'Padang'
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : acara.kategori === 'Balapan'
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-200';

                  const jantinaColor =
                    acara.kategoriJantina === 'Lelaki'
                      ? 'bg-sky-50 text-sky-700'
                      : acara.kategoriJantina === 'Perempuan'
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-slate-100 text-slate-700';

                  return (
                    <tr key={acara.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3.5 text-center font-bold text-slate-400">
                        {index + 1}
                      </td>
                      <td className="py-3 px-3.5 font-mono font-bold text-indigo-700">
                        {acara.kod}
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900">{acara.nama}</div>
                        {acara.catatan && (
                          <div className="text-[11px] text-slate-500 font-medium">
                            {acara.catatan}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${katColor}`}>
                            {acara.kategori}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {acara.kategoriMSSR || 'MSSR'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3.5">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${jantinaColor}`}>
                          {acara.kategoriJantina}
                        </span>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-1 flex-wrap">
                          {acara.tahunKelayakan.map((t) => (
                            <span
                              key={t}
                              className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800"
                            >
                              {t === 0 ? 'Pra' : `T${t}`}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="font-semibold text-slate-700">
                          {acara.jenis} ({acara.bilanganAhli} org)
                        </span>
                      </td>
                      <td className="py-3 px-3.5 font-mono text-slate-600">
                        {acara.masa || '-'}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(acara)}
                            className="cursor-pointer p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit maklumat acara"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAcara(acara)}
                            className="cursor-pointer p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Padam acara"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Event Modal (Tambah / Edit) */}
      {modalMode && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                  {modalMode === 'tambah' ? <Plus className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                </span>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {modalMode === 'tambah' ? 'Daftar Acara Sukan Baharu (Manual)' : 'Edit Maklumat Acara'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {modalMode === 'tambah'
                      ? 'Daftarkan acara baharu mengikut keperluan kejohanan'
                      : `Mengemaskini acara ${editingAcara?.kod}`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="cursor-pointer p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModal} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kod Acara *
                  </label>
                  <input
                    type="text"
                    required
                    value={formKod}
                    onChange={(e) => setFormKod(e.target.value.toUpperCase())}
                    placeholder="cth: B4-L01, P3-L01, SK1-L01"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kategori Acara *
                  </label>
                  <select
                    value={formKategori}
                    onChange={(e) => setFormKategori(e.target.value as KategoriAcara)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Balapan">Balapan</option>
                    <option value="Padang">Padang</option>
                    <option value="Sukaneka">Sukaneka</option>
                    <option value="Pra Sekolah">Pra Sekolah</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Penuh Acara *
                </label>
                <input
                  type="text"
                  required
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  placeholder="cth: 100 Meter (Lelaki Tahun 4)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kategori Jantina *
                  </label>
                  <select
                    value={formJantina}
                    onChange={(e) => setFormJantina(e.target.value as KategoriJantinaAcara)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                  >
                    <option value="Lelaki">Lelaki</option>
                    <option value="Perempuan">Perempuan</option>
                    <option value="Terbuka">Terbuka / Campuran</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kategori MSSR
                  </label>
                  <input
                    type="text"
                    value={formKategoriMSSR}
                    onChange={(e) => setFormKategoriMSSR(e.target.value)}
                    placeholder="cth: MSSR B12, MSSR Tahap 1"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Tahun Kelayakan Selection Checkboxes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tahun Kelayakan Murid *
                </label>
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {[
                    { label: 'Prasekolah', val: 0 },
                    { label: 'Tahun 1', val: 1 },
                    { label: 'Tahun 2', val: 2 },
                    { label: 'Tahun 3', val: 3 },
                    { label: 'Tahun 4', val: 4 },
                    { label: 'Tahun 5', val: 5 },
                    { label: 'Tahun 6', val: 6 },
                  ].map((t) => {
                    const isSelected = formTahun.includes(t.val);
                    return (
                      <button
                        key={t.val}
                        type="button"
                        onClick={() => handleToggleTahun(t.val)}
                        className={`cursor-pointer px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
                {formKategori === 'Padang' && (
                  <p className="text-[11px] text-amber-800 mt-1.5 flex items-center gap-1.5 font-bold bg-amber-50 p-2 rounded-lg border border-amber-300">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Ketetapan Acara Padang SK Tudan 2026: Dikhaskan hanya untuk Tahun 3, 4, dan 5. Setiap rumah sukan mendaftar 1 Pemain Utama dan 1 Pemain Simpanan murid (Jumlah: 2 murid).
                    </span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Jenis Acara *
                  </label>
                  <select
                    value={formJenis}
                    onChange={(e) => {
                      const j = e.target.value as JenisAcara;
                      setFormJenis(j);
                      if (j === 'Individu') setFormBilanganAhli(1);
                      else if (formBilanganAhli <= 1) setFormBilanganAhli(4);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                  >
                    <option value="Individu">Individu</option>
                    <option value="Berkumpulan">Berkumpulan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Bilangan Peserta
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={formBilanganAhli}
                    disabled={formJenis === 'Individu'}
                    onChange={(e) => setFormBilanganAhli(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Masa Acara
                  </label>
                  <input
                    type="text"
                    value={formMasa}
                    onChange={(e) => setFormMasa(e.target.value)}
                    placeholder="cth: 08:30"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Catatan / Peringkat
                  </label>
                  <input
                    type="text"
                    value={formCatatan}
                    onChange={(e) => setFormCatatan(e.target.value)}
                    placeholder="cth: AKHIR, 5 Pusingan, 4 Pelari"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Penerangan Ringkas
                  </label>
                  <input
                    type="text"
                    value={formPenerangan}
                    onChange={(e) => setFormPenerangan(e.target.value)}
                    placeholder="cth: Acara larian pecut individu"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="cursor-pointer px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="cursor-pointer px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
                >
                  {modalMode === 'tambah' ? 'Simpan Acara Baharu' : 'Kemaskini Acara'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
