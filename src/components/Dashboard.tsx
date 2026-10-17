import React, { useState, useMemo } from 'react';
import {
  Users,
  Trophy,
  CheckCircle,
  TrendingUp,
  Activity,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Medal,
  Flame,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { AcaraSukan, Murid, PendaftaranAcara, RumahSukan } from '../types';
import { SENARAI_RUMAH, SENARAI_RUMAH_KEYS } from '../data/constants';

interface DashboardProps {
  muridList: Murid[];
  acaraList: AcaraSukan[];
  pendaftaranList: PendaftaranAcara[];
  onNavigateToRegistration: () => void;
  onNavigateToUpload: () => void;
}

const HOUSE_COLORS: Record<RumahSukan, string> = {
  Merah: '#ef4444',
  Kuning: '#eab308',
  Hijau: '#10b981',
  Biru: '#3b82f6',
};

const CATEGORY_COLORS: Record<string, string> = {
  Balapan: '#6366f1',
  Padang: '#f97316',
  Sukaneka: '#ec4899',
  'Pra Sekolah': '#06b6d4',
};

export const Dashboard: React.FC<DashboardProps> = ({
  muridList,
  acaraList,
  pendaftaranList,
  onNavigateToRegistration,
  onNavigateToUpload,
}) => {
  const [chartView, setChartView] = useState<'semua' | 'taburan' | 'acara'>('semua');

  const totalStudents = muridList.length;
  const totalRegistrations = pendaftaranList.length;

  // Bilangan peserta unik (murid yang dipilih menyertai sekurang-kurangnya 1 acara)
  const uniqueParticipants = useMemo(() => {
    const set = new Set<string>();
    pendaftaranList.forEach((reg) => {
      reg.peserta.forEach((p) => set.add(p.muridId));
    });
    return set;
  }, [pendaftaranList]);

  // Data Carta Pai 1: Taburan Murid Mengikut Rumah Sukan
  const pieDataMurid = useMemo(() => {
    return SENARAI_RUMAH_KEYS.map((rumahKey) => {
      const count = muridList.filter((m) => m.rumahSukan === rumahKey).length;
      return {
        name: `Rumah ${rumahKey}`,
        rumah: rumahKey,
        value: count,
        color: HOUSE_COLORS[rumahKey],
      };
    });
  }, [muridList]);

  // Data Carta Pai 2: Taburan Penyertaan Acara Mengikut Rumah Sukan
  const pieDataPenyertaan = useMemo(() => {
    return SENARAI_RUMAH_KEYS.map((rumahKey) => {
      const count = pendaftaranList.filter((r) => r.rumahSukan === rumahKey).length;
      return {
        name: `Rumah ${rumahKey}`,
        rumah: rumahKey,
        value: count,
        color: HOUSE_COLORS[rumahKey],
      };
    });
  }, [pendaftaranList]);

  // Data Graf Bar: Perbandingan Murid, Pendaftaran Acara & Bilangan Peserta Mengikut Rumah Sukan
  const barDataComparison = useMemo(() => {
    return SENARAI_RUMAH_KEYS.map((rumahKey) => {
      const muridCount = muridList.filter((m) => m.rumahSukan === rumahKey).length;
      const regCount = pendaftaranList.filter((r) => r.rumahSukan === rumahKey).length;

      const houseUniqueAthletes = new Set<string>();
      let totalAthleteSlots = 0;
      pendaftaranList
        .filter((r) => r.rumahSukan === rumahKey)
        .forEach((r) => {
          r.peserta.forEach((p) => {
            houseUniqueAthletes.add(p.muridId);
            totalAthleteSlots++;
          });
        });

      return {
        name: `Rumah ${rumahKey}`,
        rumah: rumahKey,
        'Jumlah Murid': muridCount,
        'Pendaftaran Acara': regCount,
        'Peserta Terpilih (Unik)': houseUniqueAthletes.size,
        'Slot Peserta': totalAthleteSlots,
      };
    });
  }, [muridList, pendaftaranList]);

  // Data Graf Bar Bertindan: Penyertaan Mengikut Kategori Acara bagi Setiap Rumah Sukan
  const barDataCategory = useMemo(() => {
    const categories: ('Balapan' | 'Padang' | 'Sukaneka' | 'Pra Sekolah')[] = [
      'Balapan',
      'Padang',
      'Sukaneka',
      'Pra Sekolah',
    ];

    const acaraMap = new Map<string, string>();
    acaraList.forEach((a) => acaraMap.set(a.id, a.kategori));

    return categories.map((cat) => {
      const row: Record<string, string | number> = { kategori: cat };
      SENARAI_RUMAH_KEYS.forEach((rumah) => {
        const count = pendaftaranList.filter((reg) => {
          const regCat = acaraMap.get(reg.acaraId);
          return reg.rumahSukan === rumah && regCat === cat;
        }).length;
        row[rumah] = count;
      });
      return row;
    });
  }, [acaraList, pendaftaranList]);

  // Custom Tooltip Carta Pai
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percent = totalStudents > 0 ? ((data.value / totalStudents) * 100).toFixed(1) : 0;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs">
          <div className="flex items-center gap-2 font-bold mb-1">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.payload.color }}
            />
            <span>{data.name}</span>
          </div>
          <div>Bilangan: <span className="font-extrabold text-amber-300">{data.value}</span> orang</div>
          <div className="text-slate-400 text-[11px]">Peratusan: {percent}%</div>
        </div>
      );
    }
    return null;
  };

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
            Pusat Kawalan & Statistik Kejohanan Sukan
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Paparan visual masa nyata bagi taburan murid mengikut Rumah Sukan (Merah, Kuning, Hijau, Biru) dan analisis penyertaan mengikut kategori acara.
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
            <div className="text-[11px] text-slate-500 mt-1">Firebase & In-Memory Cache</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visual Charts Controls Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Analisis Graf & Visualisasi Data (Recharts)
            </h2>
            <p className="text-xs text-slate-500">
              Perbandingan taburan murid dan penyertaan acara mengikut rumah sukan secara interaktif.
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setChartView('semua')}
            className={`cursor-pointer px-3 py-1.5 rounded-lg transition-all ${
              chartView === 'semua'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua Graf
          </button>
          <button
            type="button"
            onClick={() => setChartView('taburan')}
            className={`cursor-pointer px-3 py-1.5 rounded-lg transition-all ${
              chartView === 'taburan'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Taburan Rumah (Pai)
          </button>
          <button
            type="button"
            onClick={() => setChartView('acara')}
            className={`cursor-pointer px-3 py-1.5 rounded-lg transition-all ${
              chartView === 'acara'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Penyertaan Acara (Bar)
          </button>
        </div>
      </div>

      {/* SECTION 1: CARTA PAI (PIE CHART) - Taburan Murid Mengikut Rumah Sukan */}
      {(chartView === 'semua' || chartView === 'taburan') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Carta Pai 1: Taburan Murid Keseluruhan */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-indigo-600" />
                  Carta Pai: Taburan Murid Mengikut Rumah Sukan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Peratusan dan nisbah bilangan murid bagi setiap Rumah Sukan.
                </p>
              </div>
            </div>

            {totalStudents === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
                <Users className="w-10 h-10 mb-2 opacity-30" />
                <span>Tiada data murid untuk dipaparkan. Sila daftar atau muat naik senarai murid.</span>
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieDataMurid}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {pieDataMurid.map((entry, index) => (
                        <Cell key={`cell-murid-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => <span className="text-xs font-semibold text-slate-700">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Carta Pai 2: Taburan Penyertaan Acara Mengikut Rumah Sukan */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  Carta Pai: Taburan Penyertaan Acara Mengikut Rumah
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Nisbah pendaftaran acara sukan yang telah disahkan bagi setiap Rumah Sukan.
                </p>
              </div>
            </div>

            {totalRegistrations === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
                <Trophy className="w-10 h-10 mb-2 opacity-30" />
                <span>Belum ada pendaftaran acara. Sila daftar acara dalam Mod Pendaftaran Guru.</span>
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieDataPenyertaan}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {pieDataPenyertaan.map((entry, index) => (
                        <Cell key={`cell-reg-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any) => [`${value} Acara`, name]}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '0.75rem',
                        color: '#fff',
                        fontSize: '12px',
                        border: '1px solid #334155',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => <span className="text-xs font-semibold text-slate-700">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: GRAF BAR (BAR CHART) - Perbandingan Mengikut Rumah Sukan */}
      {(chartView === 'semua' || chartView === 'acara') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graf Bar 1: Perbandingan Jumlah Murid vs Pendaftaran Acara */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  Graf Bar: Perbandingan Murid & Penyertaan Acara
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Membandingkan bilangan murid berdaftar dengan bilangan pendaftaran acara dan peserta terpilih.
                </p>
              </div>
            </div>

            <div className="h-76 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barDataComparison}
                  margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px',
                      border: '1px solid #334155',
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    height={36}
                    formatter={(value) => <span className="text-xs font-semibold text-slate-700">{value}</span>}
                  />
                  <Bar dataKey="Jumlah Murid" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Pendaftaran Acara" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Peserta Terpilih (Unik)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Graf Bar 2: Penyertaan Mengikut Kategori Acara (Balapan, Padang, Sukaneka, Pra Sekolah) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Medal className="w-4 h-4 text-rose-500" />
                  Graf Bar: Penyertaan Acara Mengikut Kategori
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Taburan pendaftaran acara merentas Kategori Balapan, Padang, Sukaneka & Pra Sekolah bagi 4 Rumah Sukan.
                </p>
              </div>
            </div>

            <div className="h-76 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barDataCategory}
                  margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="kategori"
                    tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px',
                      border: '1px solid #334155',
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    height={36}
                    formatter={(value) => <span className="text-xs font-semibold text-slate-700">Rumah {value}</span>}
                  />
                  <Bar dataKey="Merah" fill={HOUSE_COLORS.Merah} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Kuning" fill={HOUSE_COLORS.Kuning} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Hijau" fill={HOUSE_COLORS.Hijau} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Biru" fill={HOUSE_COLORS.Biru} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Breakdown by Sports Houses (Detailed Cards) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="font-bold text-base text-slate-900 mb-1">
          Statistik Terperinci 4 Rumah Sukan
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Bilangan murid dan penyertaan acara bagi setiap rumah sukan rasmi SK Tudan.
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

      {/* Flow Specifications Card */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-xs text-slate-600 space-y-3">
        <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          Ringkasan Aliran Sistem & Pematuhan Spesifikasi Kejohanan
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-indigo-700">1. Pengurusan Murid & Integriti Data</div>
            <p>
              Apabila murid dipadam dari senarai, rekod murid dikeluarkan sepenuhnya dari cache tempatan dan pangkalan data Firebase. Hanya murid yang didaftarkan secara rasmi sahaja akan muncul mengikut Rumah Sukan.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-indigo-700">2. Muat Turun Laporan Lengkap 4 Rumah Sukan</div>
            <p>
              Sistem menyokong muat turun fail Excel multi-lembaran berformat penuh dengan matriks perbandingan acara x 4 rumah sukan (Merah, Kuning, Hijau, Biru), lembaran khusus setiap rumah sukan, dan senarai induk peserta MSSR.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
