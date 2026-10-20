import React, { useState, useEffect } from 'react';
import {
  Trophy,
  UploadCloud,
  Users,
  LayoutDashboard,
  ClipboardList,
  Sparkles,
  School,
  Activity,
  ArrowRight,
  Settings
} from 'lucide-react';
import { AcaraSukan, Murid, PendaftaranAcara } from './types';
import { StorageService, initFirebaseSync } from './services/storageService';
import { RegistrationFlow } from './components/RegistrationFlow';
import { AdminUpload } from './components/AdminUpload';
import { StudentDirectory } from './components/StudentDirectory';
import { RegistrationList } from './components/RegistrationList';
import { Dashboard } from './components/Dashboard';
import { EventSettings } from './components/EventSettings';
import { GlobalSearchBar } from './components/GlobalSearchBar';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pendaftaran' | 'senarai' | 'muatnaik' | 'murid' | 'tetapan'>('dashboard');
  const [muridList, setMuridList] = useState<Murid[]>([]);
  const [acaraList, setAcaraList] = useState<AcaraSukan[]>([]);
  const [pendaftaranList, setPendaftaranList] = useState<PendaftaranAcara[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // Load state and subscribe to real-time events
  const refreshAllData = () => {
    setMuridList(StorageService.getMuridList());
    setAcaraList(StorageService.getAcaraList());
    setPendaftaranList(StorageService.getPendaftaranList());
    setLastSyncTime(new Date());
  };

  useEffect(() => {
    // Initialize Firebase Firestore sync
    initFirebaseSync();
    refreshAllData();

    // Subscribe to real-time sync via BroadcastChannel / localStorage / Firestore
    const unsubscribe = StorageService.subscribe((type) => {
      console.log('Real-time sync event received:', type);
      refreshAllData();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Header & Brand Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* School Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-rose-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
                    Kejohanan Sukan Tahunan Sekolah
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Firebase Terhubung (Masa Nyata)
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Modul Pendaftaran Acara Murid Mengikut Rumah Sukan & Kelas
                </p>
              </div>
            </div>

            {/* Global Search Bar merentas semua tab */}
            <GlobalSearchBar
              muridList={muridList}
              pendaftaranList={pendaftaranList}
              acaraList={acaraList}
              onNavigateToTab={setActiveTab}
            />

            {/* Quick Stats & House Colors */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>{muridList.length} Murid</span>
                <span className="text-slate-300">|</span>
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                <span>{pendaftaranList.length} Pendaftaran</span>
              </div>

              {/* 4 House indicators */}
              <div className="flex items-center gap-1 pl-2">
                <div className="w-3 h-3 rounded-full bg-red-500" title="Rumah Merah" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" title="Rumah Kuning" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" title="Rumah Hijau" />
                <div className="w-3 h-3 rounded-full bg-blue-500" title="Rumah Biru" />
              </div>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-2 overflow-x-auto py-2 -mb-px border-t border-slate-100 text-xs sm:text-sm font-semibold">
            {/* 1. Dashboard Ringkasan (Halaman Utama) */}
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`cursor-pointer flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>1. Dashboard Ringkasan (Utama)</span>
            </button>

            {/* 2. Pendaftaran Guru */}
            <button
              type="button"
              onClick={() => setActiveTab('pendaftaran')}
              className={`cursor-pointer flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'pendaftaran'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>2. Pendaftaran Guru (Pilih Rumah Sukan)</span>
            </button>

            {/* 3. Senarai Pendaftaran & Slip */}
            <button
              type="button"
              onClick={() => setActiveTab('senarai')}
              className={`cursor-pointer flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'senarai'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>3. Senarai Pendaftaran & Slip ({pendaftaranList.length})</span>
            </button>

            {/* 4. Pengurusan Murid */}
            <button
              type="button"
              onClick={() => setActiveTab('murid')}
              className={`cursor-pointer flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'murid'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>4. Pengurusan Murid ({muridList.length})</span>
            </button>

            {/* 5. Muat Naik Pentadbir */}
            <button
              type="button"
              onClick={() => setActiveTab('muatnaik')}
              className={`cursor-pointer flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'muatnaik'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>5. Muat Naik Pentadbir (Excel / CSV)</span>
            </button>

            {/* 6. Tetapan Acara */}
            <button
              type="button"
              onClick={() => setActiveTab('tetapan')}
              className={`cursor-pointer flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'tetapan'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>6. Tetapan Acara ({acaraList.length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'pendaftaran' && (
          <RegistrationFlow
            muridList={muridList}
            acaraList={acaraList}
            pendaftaranList={pendaftaranList}
            onSuccess={refreshAllData}
          />
        )}

        {activeTab === 'senarai' && (
          <RegistrationList
            pendaftaranList={pendaftaranList}
            acaraList={acaraList}
            muridList={muridList}
            onRefresh={refreshAllData}
          />
        )}

        {activeTab === 'muatnaik' && (
          <AdminUpload
            currentMuridList={muridList}
            onUploadSuccess={refreshAllData}
          />
        )}

        {activeTab === 'murid' && (
          <StudentDirectory
            muridList={muridList}
            pendaftaranList={pendaftaranList}
            acaraList={acaraList}
            onRefresh={refreshAllData}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            muridList={muridList}
            acaraList={acaraList}
            pendaftaranList={pendaftaranList}
            onNavigateToRegistration={() => setActiveTab('pendaftaran')}
            onNavigateToUpload={() => setActiveTab('muatnaik')}
          />
        )}

        {activeTab === 'tetapan' && (
          <EventSettings
            acaraList={acaraList}
            onRefresh={refreshAllData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-indigo-600" />
            <span>Sistem Pengurusan Kejohanan Sukan & Olahraga Sekolah</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Pematuhan Format Excel & CSV</span>
            <span>•</span>
            <span>Pangkalan Data Masa Nyata</span>
            <span>•</span>
            <span>Kategori MSSR</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
