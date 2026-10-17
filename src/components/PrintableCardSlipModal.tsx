import React, { useState } from 'react';
import {
  Printer,
  X,
  Trophy,
  CheckCircle,
  QrCode,
  Calendar,
  User,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';
import { PendaftaranAcara, PesertaPendaftaran, RumahSukan } from '../types';
import { SENARAI_RUMAH } from '../data/constants';

interface PrintableCardSlipModalProps {
  pendaftaran: PendaftaranAcara;
  onClose: () => void;
}

export const PrintableCardSlipModal: React.FC<PrintableCardSlipModalProps> = ({
  pendaftaran,
  onClose,
}) => {
  const isBerkumpulan = pendaftaran.peserta.length > 1;
  const [selectedPesertaIndex, setSelectedPesertaIndex] = useState<number>(0);
  const [modeKad, setModeKad] = useState<'individu' | 'pasukan'>(
    isBerkumpulan ? 'pasukan' : 'individu'
  );

  const rumahInfo = SENARAI_RUMAH[pendaftaran.rumahSukan];
  const activePeserta: PesertaPendaftaran =
    pendaftaran.peserta[selectedPesertaIndex] || pendaftaran.peserta[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      {/* On-screen Modal Card */}
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden no-print animate-fadeIn">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                Pratonton Kad Slip Pendaftaran
              </h3>
              <p className="text-[11px] text-slate-300">
                Format kad ringkas rasmi sedia dicetak untuk peserta dan urus setia
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options for Team Events */}
        {isBerkumpulan && (
          <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Pilihan Format Cetakan:</span>
              <div className="inline-flex rounded-xl bg-white p-1 border border-slate-300">
                <button
                  type="button"
                  onClick={() => setModeKad('pasukan')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    modeKad === 'pasukan'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Kad Pasukan (Semua {pendaftaran.peserta.length} Pelari)
                </button>
                <button
                  type="button"
                  onClick={() => setModeKad('individu')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    modeKad === 'individu'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Kad Setiap Murid
                </button>
              </div>
            </div>

            {modeKad === 'individu' && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-500">Pilih Murid:</span>
                {pendaftaran.peserta.map((p, idx) => (
                  <button
                    key={p.muridId}
                    type="button"
                    onClick={() => setSelectedPesertaIndex(idx)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                      selectedPesertaIndex === idx
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-400'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    #{idx + 1} {p.nama.split(' ')[0]}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Preview of the card on screen */}
        <div className="p-6 bg-slate-50 flex items-center justify-center overflow-x-auto">
          {modeKad === 'pasukan' ? (
            /* Format Kad Pasukan Ringkas */
            <div
              className="bg-white rounded-2xl border-2 shadow-md w-full max-w-md p-5 relative overflow-hidden"
              style={{ borderColor: rumahInfo.warnaTema }}
            >
              {/* Top Accent Bar */}
              <div
                className="absolute top-0 left-0 right-0 h-3"
                style={{ backgroundColor: rumahInfo.warnaTema }}
              />

              <div className="text-center pt-2 pb-3 border-b border-slate-200">
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full inline-block border border-indigo-200 mb-1">
                  KATEGORI MSSR (MAJLIS SUKAN SEKOLAH RENDAH)
                </div>
                <div className="text-xs uppercase tracking-wider font-bold text-slate-500">
                  KEJOHANAN OLAHRAGA TAHUNAN SEKOLAH
                </div>
                <div className="text-base font-black text-slate-900 mt-0.5">
                  KAD SLIP PENDAFTARAN PASUKAN
                </div>
                <div className="inline-block mt-1">
                  <span
                    className={`text-xs font-bold px-3 py-0.5 rounded-full border ${rumahInfo.badgeClass}`}
                  >
                    {rumahInfo.namaPenuh}
                  </span>
                </div>
              </div>

              {/* Event Info Box */}
              <div className="my-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500 uppercase font-semibold">Acara Dipertandingkan (MSSR)</div>
                <div className="text-sm font-black text-indigo-950 mt-0.5">{pendaftaran.acaraNama}</div>
                <div className="flex items-center justify-between text-[11px] text-slate-600 mt-1">
                  <span>Jenis: <strong>Acara Berkumpulan</strong></span>
                  <span>Tarikh: <strong>{new Date(pendaftaran.tarikhDaftar).toLocaleDateString('ms-MY')}</strong></span>
                </div>
              </div>

              {/* Participant List in Card */}
              <div className="space-y-1.5 my-3">
                <div className="text-[11px] font-bold uppercase text-slate-600 flex items-center justify-between">
                  <span>Senarai Pelari / Peserta:</span>
                  <span>{pendaftaran.peserta.length} Orang</span>
                </div>
                {pendaftaran.peserta.map((peserta, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px] border border-slate-300">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900">{peserta.nama}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                          <span>{peserta.kelas}</span>
                          <span>•</span>
                          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1 rounded">
                            ID: {peserta.idPeserta || peserta.muridId}
                          </span>
                          <span>•</span>
                          <span>{peserta.jantina}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {peserta.peranan || `Pelari ${idx + 1}`}
                    </span>
                  </div>
                ))}
              </div>

              {/* Sign-off boxes */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 text-[10px] text-slate-600 text-center">
                <div className="p-2 border border-dashed border-slate-300 rounded-lg">
                  <div className="h-6"></div>
                  <div className="border-t border-slate-300 pt-1 font-bold">Guru Rumah Sukan</div>
                </div>
                <div className="p-2 border border-dashed border-slate-300 rounded-lg">
                  <div className="h-6"></div>
                  <div className="border-t border-slate-300 pt-1 font-bold">Pegawai Bilik Panggilan</div>
                </div>
              </div>

              {/* Footer reference */}
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                <span>REF: {pendaftaran.id}</span>
                <span>STATUS: DISAHKAN (MSSR)</span>
              </div>
            </div>
          ) : (
            /* Format Kad Individu Ringkas */
            <div
              className="bg-white rounded-2xl border-2 shadow-md w-full max-w-sm p-5 relative overflow-hidden"
              style={{ borderColor: rumahInfo.warnaTema }}
            >
              {/* Top Accent Bar */}
              <div
                className="absolute top-0 left-0 right-0 h-3"
                style={{ backgroundColor: rumahInfo.warnaTema }}
              />

              <div className="text-center pt-2 pb-3 border-b border-slate-200">
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full inline-block border border-indigo-200 mb-1">
                  KATEGORI MSSR
                </div>
                <div className="text-xs uppercase tracking-wider font-bold text-slate-500">
                  KEJOHANAN OLAHRAGA TAHUNAN SEKOLAH
                </div>
                <div className="text-base font-black text-slate-900 mt-0.5">
                  KAD SLIP PENDAFTARAN PESERTA
                </div>
                <div className="inline-block mt-1">
                  <span
                    className={`text-xs font-bold px-3 py-0.5 rounded-full border ${rumahInfo.badgeClass}`}
                  >
                    {rumahInfo.namaPenuh}
                  </span>
                </div>
              </div>

              {/* Murid Highlight Box */}
              <div className="my-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Nama Murid / Peserta
                </div>
                <div className="text-base font-extrabold text-slate-900 mt-0.5">
                  {activePeserta.nama}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-left bg-white p-2.5 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 block">ID Peserta (MSSR):</span>
                    <strong className="font-mono text-indigo-700 font-extrabold text-sm">
                      {activePeserta.idPeserta || activePeserta.muridId}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Jantina:</span>
                    <strong className="text-slate-800">{activePeserta.jantina}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Kelas:</span>
                    <strong className="text-slate-800">{activePeserta.kelas}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Tahun:</span>
                    <strong className="text-slate-800">
                      {activePeserta.tahun === 0 ? 'Pra Sekolah' : `Tahun ${activePeserta.tahun}`}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Event Info */}
              <div className="mb-4 p-3 bg-indigo-50/60 rounded-xl border border-indigo-200 text-xs">
                <div className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">
                  Acara Yang Didaftar
                </div>
                <div className="font-bold text-indigo-950 text-sm mt-0.5">
                  {pendaftaran.acaraNama}
                </div>
                <div className="flex items-center justify-between text-[11px] text-indigo-800 mt-1">
                  <span>Peranan: <strong>{activePeserta.peranan || 'Peserta Utama'}</strong></span>
                  <span>Rumah: <strong>{activePeserta.rumahSukan}</strong></span>
                </div>
              </div>

              {/* Verification Boxes */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 text-[10px] text-slate-600 text-center">
                <div className="p-2 border border-dashed border-slate-300 rounded-lg">
                  <div className="h-6"></div>
                  <div className="border-t border-slate-300 pt-1 font-bold">Guru Rumah Sukan</div>
                </div>
                <div className="p-2 border border-dashed border-slate-300 rounded-lg">
                  <div className="h-6"></div>
                  <div className="border-t border-slate-300 pt-1 font-bold">Pelepas / Bilik Panggilan</div>
                </div>
              </div>

              {/* Barcode-style visual */}
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                <span>REF: {pendaftaran.id}</span>
                <span>NO. SIRI: {activePeserta.muridId}-{activePeserta.tahun}</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Print Button */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            * Klik <strong>Cetak Slip</strong> untuk membuka dialog cetakan pencetak pelayar.
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Slip (Pencetak)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* PRINT-ONLY SECTION (Rendered ONLY when window.print() is fired) */}
      {/* ============================================================== */}
      <div className="hidden print-only fixed inset-0 bg-white p-4 text-black">
        <div className="max-w-md mx-auto print-card border-2 border-black rounded-xl p-6">
          <div className="text-center pb-3 border-b-2 border-black">
            <div className="text-xs font-bold uppercase tracking-wider">
              KEJOHANAN OLAHRAGA TAHUNAN SEKOLAH
            </div>
            <div className="text-lg font-black mt-1">
              {modeKad === 'pasukan' ? 'KAD SLIP PENDAFTARAN PASUKAN' : 'KAD SLIP PENDAFTARAN PESERTA'}
            </div>
            <div className="text-sm font-bold mt-1">
              RUMAH SUKAN: RUMAH {pendaftaran.rumahSukan.toUpperCase()}
            </div>
          </div>

          <div className="my-4 p-3 border border-black rounded-lg">
            <div className="text-xs uppercase font-bold">Acara Dipertandingkan:</div>
            <div className="text-base font-extrabold">{pendaftaran.acaraNama}</div>
            <div className="flex justify-between text-xs mt-1">
              <span>No. Pendaftaran: <strong>{pendaftaran.id}</strong></span>
              <span>Tarikh: <strong>{new Date(pendaftaran.tarikhDaftar).toLocaleDateString('ms-MY')}</strong></span>
            </div>
          </div>

          {modeKad === 'pasukan' ? (
            <div className="my-4">
              <div className="text-xs font-bold uppercase mb-2">Senarai Pelari / Peserta:</div>
              <table className="w-full text-xs border-collapse border border-black">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black p-1.5 text-center">#</th>
                    <th className="border border-black p-1.5 text-left">Nama Murid</th>
                    <th className="border border-black p-1.5">ID Murid</th>
                    <th className="border border-black p-1.5">Kelas</th>
                    <th className="border border-black p-1.5">Peranan</th>
                  </tr>
                </thead>
                <tbody>
                  {pendaftaran.peserta.map((p, idx) => (
                    <tr key={idx}>
                      <td className="border border-black p-1.5 text-center font-bold">{idx + 1}</td>
                      <td className="border border-black p-1.5 font-bold">{p.nama}</td>
                      <td className="border border-black p-1.5 font-mono">{p.muridId}</td>
                      <td className="border border-black p-1.5">{p.kelas}</td>
                      <td className="border border-black p-1.5 font-semibold">{p.peranan || `Pelari ${idx + 1}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="my-4 p-4 border border-black rounded-lg">
              <div className="text-xs uppercase font-bold">Maklumat Murid:</div>
              <div className="text-lg font-black mt-0.5">{activePeserta.nama}</div>
              <div className="grid grid-cols-2 gap-2 text-xs mt-2 pt-2 border-t border-black">
                <div>ID Murid: <strong>{activePeserta.muridId}</strong></div>
                <div>Jantina: <strong>{activePeserta.jantina}</strong></div>
                <div>Kelas: <strong>{activePeserta.kelas}</strong></div>
                <div>Tahun: <strong>Tahun {activePeserta.tahun}</strong></div>
                <div className="col-span-2">Peranan: <strong>{activePeserta.peranan || 'Peserta Utama'}</strong></div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6 pt-6 border-t-2 border-black text-xs text-center">
            <div>
              <div className="border-b border-black w-36 mx-auto mb-1 h-8"></div>
              <div className="font-bold">Tandatangan Guru Rumah</div>
              <div className="text-[10px]">Tarikh: ______________</div>
            </div>
            <div>
              <div className="border-b border-black w-36 mx-auto mb-1 h-8"></div>
              <div className="font-bold">Pengesahan Bilik Panggilan</div>
              <div className="text-[10px]">Tarikh: ______________</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
