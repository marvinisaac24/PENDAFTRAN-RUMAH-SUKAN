import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  X,
  User,
  Trophy,
  CheckCircle,
  AlertCircle,
  Printer,
  ArrowRight,
  GraduationCap,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { AcaraSukan, Murid, PendaftaranAcara, RumahSukan } from '../types';
import { SENARAI_RUMAH } from '../data/constants';
import { PrintableCardSlipModal } from './PrintableCardSlipModal';

interface GlobalSearchBarProps {
  muridList: Murid[];
  pendaftaranList: PendaftaranAcara[];
  acaraList: AcaraSukan[];
  onNavigateToTab: (tab: 'pendaftaran' | 'senarai' | 'muatnaik' | 'murid' | 'dashboard') => void;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  muridList,
  pendaftaranList,
  acaraList,
  onNavigateToTab,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeSlipModal, setActiveSlipModal] = useState<PendaftaranAcara | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut (Ctrl+K or Command+K or /) to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Map each student to their registered events
  const studentRegistrationsMap = useMemo(() => {
    const map = new Map<string, PendaftaranAcara[]>();
    pendaftaranList.forEach((reg) => {
      reg.peserta.forEach((peserta) => {
        const current = map.get(peserta.muridId) || [];
        current.push(reg);
        map.set(peserta.muridId, current);
      });
    });
    return map;
  }, [pendaftaranList]);

  // Search Results
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { muridMatches: [], acaraMatches: [] };

    // 1. Search students
    const matchedStudents = muridList
      .filter((m) => {
        return (
          m.nama.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          m.kelas.toLowerCase().includes(q) ||
          m.rumahSukan.toLowerCase().includes(q)
        );
      })
      .slice(0, 8); // limit top 8 for fast rendering

    // 2. Search events
    const matchedEvents = acaraList
      .filter((a) => {
        return (
          a.nama.toLowerCase().includes(q) ||
          a.kod.toLowerCase().includes(q) ||
          a.kategori.toLowerCase().includes(q)
        );
      })
      .slice(0, 4);

    return {
      muridMatches: matchedStudents,
      acaraMatches: matchedEvents,
    };
  }, [query, muridList, acaraList]);

  const hasResults =
    searchResults.muridMatches.length > 0 || searchResults.acaraMatches.length > 0;

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md mx-2 sm:mx-4">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Cari murid, ID, kelas, rumah atau acara..."
          className="w-full pl-9 pr-14 py-2 text-xs sm:text-sm bg-slate-100 hover:bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
        />

        <div className="absolute right-2.5 flex items-center gap-1.5">
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
              Ctrl K
            </kbd>
          )}
        </div>
      </div>

      {/* Dropdown Results Box */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-fadeIn max-h-[480px] overflow-y-auto">
          {!hasResults ? (
            <div className="p-6 text-center text-xs text-slate-500">
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <div className="font-bold text-slate-700">Tiada Maklumat Dijumpai</div>
              <p className="mt-0.5 text-slate-400">
                Tiada murid atau acara yang sepadan dengan "<strong>{query}</strong>".
              </p>
            </div>
          ) : (
            <div className="p-2 divide-y divide-slate-100">
              {/* Section 1: Murid & Status Pendaftaran */}
              {searchResults.muridMatches.length > 0 && (
                <div className="p-2 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-600" />
                      Hasil Murid & Status Pendaftaran
                    </span>
                    <span>{searchResults.muridMatches.length} dijumpai</span>
                  </div>

                  <div className="space-y-1.5">
                    {searchResults.muridMatches.map((murid) => {
                      const rumah = SENARAI_RUMAH[murid.rumahSukan];
                      const registrations = studentRegistrationsMap.get(murid.id) || [];
                      const isRegistered = registrations.length > 0;

                      return (
                        <div
                          key={murid.id}
                          className="p-3 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:bg-slate-50/80 transition-all text-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                  {murid.id}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${rumah.badgeClass}`}
                                >
                                  Rumah {murid.rumahSukan}
                                </span>
                                <span className="text-[11px] font-medium text-slate-500">
                                  {murid.kelas} (Tahun {murid.tahun}) • {murid.jantina}
                                </span>
                              </div>
                              <div className="font-bold text-slate-900 text-sm mt-1">
                                {murid.nama}
                              </div>
                            </div>

                            {/* Status badge */}
                            <div className="shrink-0 text-right">
                              {isRegistered ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                                  <span>{registrations.length} Acara Didaftar</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                  <span>Belum Didaftar Acara</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* List of Registered Events for this student */}
                          {isRegistered ? (
                            <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
                              <div className="text-[10px] font-bold text-slate-500 uppercase">
                                Acara Disertai:
                              </div>
                              {registrations.map((reg) => (
                                <div
                                  key={reg.id}
                                  className="flex items-center justify-between gap-2 p-1.5 bg-white rounded-lg border border-slate-200 text-[11px]"
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                    <span className="font-semibold text-slate-800 truncate">
                                      {reg.acaraNama}
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveSlipModal(reg);
                                    }}
                                    className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-2xs transition-all shrink-0 active:scale-95"
                                  >
                                    <Printer className="w-3 h-3" />
                                    <span>Cetak Slip</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                              <span className="text-slate-400 italic">
                                Belum ada penyertaan acara bagi kejohanan ini.
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsOpen(false);
                                  onNavigateToTab('pendaftaran');
                                }}
                                className="cursor-pointer text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1"
                              >
                                <span>Daftar Acara Sekarang</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section 2: Acara Sukan */}
              {searchResults.acaraMatches.length > 0 && (
                <div className="p-2 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                    <span className="flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-600" />
                      Acara Sukan
                    </span>
                    <span>{searchResults.acaraMatches.length} dijumpai</span>
                  </div>

                  <div className="space-y-1">
                    {searchResults.acaraMatches.map((acara) => {
                      const totalRegisteredInAcara = pendaftaranList.filter(
                        (p) => p.acaraId === acara.id
                      ).length;

                      return (
                        <div
                          key={acara.id}
                          onClick={() => {
                            setIsOpen(false);
                            onNavigateToTab('senarai');
                          }}
                          className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/60 hover:border-indigo-300 transition-all cursor-pointer flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] font-bold text-slate-500 bg-white px-1.5 py-0.2 rounded border">
                                {acara.kod}
                              </span>
                              <strong className="text-slate-900">{acara.nama}</strong>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {acara.kategori} • Kategori {acara.kategoriJantina} • Tahun {acara.tahunKelayakan.join(', ')}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border">
                              {totalRegisteredInAcara} pendaftaran
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Footer inside Dropdown */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span>Tekan <strong>ESC</strong> untuk tutup</span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onNavigateToTab('murid');
              }}
              className="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
            >
              Lihat Direktori Penuh Murid →
            </button>
          </div>
        </div>
      )}

      {/* Slip Modal if triggered from search */}
      {activeSlipModal && (
        <PrintableCardSlipModal
          pendaftaran={activeSlipModal}
          onClose={() => setActiveSlipModal(null)}
        />
      )}
    </div>
  );
};
