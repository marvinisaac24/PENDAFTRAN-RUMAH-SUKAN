import React from 'react';
import {
  Users,
  Trophy,
  CheckCircle,
  TrendingUp,
  Activity,
  ArrowRight,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';
import { AcaraSukan, Murid, PendaftaranAcara, RumahSukan } from '../types';
import { SENARAI_RUMAH, SENARAI_RUMAH_KEYS } from '../data/constants';

interface DashboardProps {
  muridList: Murid[];
  acaraList: AcaraSukan[];
  pendaftaranList: PendaftaranAcara[];
  onNavigateToRegistration: () => void;
  onNavigateToUpload: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  muridList,
  acaraList,
  pendaftaranList,
  onNavigateToRegistration,
  onNavigateToUpload,
}) => {
  const totalStudents = muridList.length;
  const totalRegistrations = pendaftaranList.length;

  // Total unique participants
  const uniqueParticipants = new Set<string>();
  pendaftaranList.forEach((reg) => {
    reg.peserta.forEach((p) => uniqueParticipants.add(p.muridId));
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-radial from-white to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-indigo-300 border border-white/15 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Sistem Pengurusan & Pendaftaran Kejohanan Sukan Sekolah
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Pusat Kawalan Pendaftaran Sukan
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Pengurusan senarai murid mengikut Rumah Sukan (Merah, Kuning, Hijau, Biru) dan kelas secara masa nyata. Aliran pendaftaran pintar menyaring murid mengikut kategori dan jantina acara secara automatik.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              type="button"
              onClick={onNavigateToRegistration}
              className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>Buka Mod Pendaftaran Guru</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onNavigateToUpload}
              className="cursor-pointer bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all border border-white/20 flex items-center gap-2"
            >
              <span>Muat Naik Senarai Murid (Excel/CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Jumlah Murid</div>
            <div className="text-3xl font-black text-slate-900 mt-1">{totalStudents}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Tersimpan dalam database</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Pendaftaran Acara</div>
            <div className="text-3xl font-black text-slate-900 mt-1">{totalRegistrations}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Penyertaan disahkan</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Peserta Terlibat</div>
            <div className="text-3xl font-black text-slate-900 mt-1">{uniqueParticipants.size}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Murid unik berdaftar</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Penyegerakan</div>
            <div className="text-sm font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
              Masa Nyata
            </div>
            <div className="text-[11px] text-slate-500 mt-1">BroadcastChannel & Storage</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Breakdown by Sports Houses */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="font-bold text-base text-slate-900 mb-1">
          Statistik Taburan Murid Mengikut Rumah Sukan
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Bilangan murid dan penyertaan acara bagi setiap rumah sukan rasmi.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SENARAI_RUMAH_KEYS.map((rumahKey) => {
            const info = SENARAI_RUMAH[rumahKey];
            const houseStudents = muridList.filter((m) => m.rumahSukan === rumahKey);
            const count = houseStudents.length;
            const percentage = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
            const houseRegistrations = pendaftaranList.filter((r) => r.rumahSukan === rumahKey).length;

            return (
              <div
                key={rumahKey}
                className={`p-5 rounded-2xl border transition-all ${info.bgLightClass} ${info.borderClass}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 text-sm">{info.namaRumah}</span>
                  <span
                    className="w-3.5 h-3.5 rounded-full shadow-xs"
                    style={{ backgroundColor: info.warnaTema }}
                  />
                </div>

                <div className="text-2xl font-black text-slate-900">{count}</div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  murid berdaftar ({percentage}% daripada keseluruhan)
                </div>

                {/* Progress bar */}
                <div className="w-full bg-white/80 rounded-full h-2 mt-3 overflow-hidden border border-slate-200/50">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%`, backgroundColor: info.warnaTema }}
                  />
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                  <span>Penyertaan Acara:</span>
                  <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {houseRegistrations} acara
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Flow Specifications Card according to User Requirements */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-xs text-slate-600 space-y-3">
        <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          Ringkasan Aliran Sistem & Pematuhan Spesifikasi
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-indigo-700">1. Muat Naik & Pratonton</div>
            <p>
              Menyokong fail gabungan atau fail berasingan mengikut rumah (Merah, Kuning, Hijau, Biru). Pratonton menyemak medan kosong, rumah tidak sah dan mengelakkan penggandaan murid dengan kaedah kemaskini pintar.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-indigo-700">2. Urutan Pemilihan 4 Langkah</div>
            <p>
              <strong>Rumah Sukan → Acara dan Kategori → Kelas → Nama Murid</strong>.
              Sistem hanya memaparkan kelas yang layak dan murid mengikut jantina kategori acara secara automatik.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
