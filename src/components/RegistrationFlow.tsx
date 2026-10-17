import React, { useState, useMemo } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  Users,
  Trophy,
  ArrowRight,
  ArrowLeft,
  Search,
  UserCheck,
  Sparkles,
  ShieldAlert,
  GraduationCap,
  RotateCcw,
  Printer,
  Clock,
  Tag,
  Star,
  Check,
  Layers,
  Calendar,
  Plus,
  X
} from 'lucide-react';
import { AcaraSukan, Murid, PendaftaranAcara, PesertaPendaftaran, RumahSukan } from '../types';
import { SENARAI_RUMAH, SENARAI_RUMAH_KEYS, SENARAI_KELAS_PRA, SENARAI_ALIRAN_KELAS } from '../data/constants';
import { StorageService } from '../services/storageService';
import { PrintableCardSlipModal } from './PrintableCardSlipModal';
import { getOrGeneratePesertaId } from '../utils/athleteIdGenerator';

interface RegistrationFlowProps {
  muridList: Murid[];
  acaraList: AcaraSukan[];
  pendaftaranList: PendaftaranAcara[];
  onSuccess: () => void;
}

export const RegistrationFlow: React.FC<RegistrationFlowProps> = ({
  muridList,
  acaraList,
  pendaftaranList,
  onSuccess,
}) => {
  // 4 Mandatory Steps: 1. Rumah Sukan -> 2. Acara & Kategori -> 3. Kelas -> 4. Nama Murid
  const [selectedRumah, setSelectedRumah] = useState<RumahSukan | null>(null);
  const [selectedAcaraId, setSelectedAcaraId] = useState<string | null>(null);
  const [selectedKelas, setSelectedKelas] = useState<string | null>(null);

  // Selected participant IDs and custom roles (for reserve/simpanan)
  const [selectedPesertaIds, setSelectedPesertaIds] = useState<string[]>([]);
  const [simpananIdSet, setSimpananIdSet] = useState<Set<string>>(new Set());
  const [catatan, setCatatan] = useState<string>('');

  // UI helpers
  const [carianAcara, setCarianAcara] = useState<string>('');
  const [carianMurid, setCarianMurid] = useState<string>('');
  const [kategoriFilter, setKategoriFilter] = useState<'Semua' | 'Sukaneka' | 'Balapan' | 'Padang' | 'Pra Sekolah'>('Semua');
  const [tahunFilter, setTahunFilter] = useState<number | 'semua' | 'pra' | 'padang'>('semua');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastSavedReg, setLastSavedReg] = useState<PendaftaranAcara | null>(null);
  const [showSlipModal, setShowSlipModal] = useState<boolean>(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState<boolean>(false);
  const [inlineNama, setInlineNama] = useState<string>('');
  const [inlineJantina, setInlineJantina] = useState<'Lelaki' | 'Perempuan'>('Lelaki');

  // Helper function to assign weight starting strictly from Tahun 1 to Tahun 6:
  // Tahun 1 (weight 1) -> Tahun 2 (weight 2) -> Tahun 3 (weight 3) -> Tahun 4 (weight 4) -> Tahun 5 (weight 5) -> Tahun 6 (weight 6) -> Padang (weight 7) -> Pra Sekolah (weight 8)
  const getYearOrderWeight = (ev: AcaraSukan): number => {
    if (ev.kategori === 'Padang') return 7;
    const minT = Math.min(...ev.tahunKelayakan);
    if (minT >= 1 && minT <= 6) return minT;
    if (minT === 0) return 8; // Pra Sekolah
    return 9;
  };

  // Computed and strictly sorted acara by Year (Tahun 1 -> Tahun 2 -> Tahun 3 -> Tahun 4 -> Tahun 5 -> Tahun 6 -> Padang -> Pra Sekolah)
  const sortedAndFilteredAcara = useMemo(() => {
    let list = [...acaraList];

    // Filter by Kategori
    if (kategoriFilter !== 'Semua') {
      list = list.filter((a) => a.kategori === kategoriFilter);
    }

    // Filter by Tahun tab
    if (tahunFilter === 'pra') {
      list = list.filter((a) => a.tahunKelayakan.includes(0));
    } else if (tahunFilter === 'padang') {
      list = list.filter((a) => a.kategori === 'Padang');
    } else if (typeof tahunFilter === 'number') {
      list = list.filter((a) => a.tahunKelayakan.includes(tahunFilter));
    }

    // Filter by carian query
    if (carianAcara.trim()) {
      const q = carianAcara.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.nama.toLowerCase().includes(q) ||
          a.kod.toLowerCase().includes(q) ||
          (a.catatan && a.catatan.toLowerCase().includes(q))
      );
    }

    // Sort strictly by Year from Tahun 1 to Tahun 6, followed by Padang and Pra Sekolah
    return list.sort((a, b) => {
      const orderA = getYearOrderWeight(a);
      const orderB = getYearOrderWeight(b);
      if (orderA !== orderB) return orderA - orderB;

      // Same year: sort by masa if available
      if (a.masa && b.masa && a.masa !== b.masa) {
        return a.masa.localeCompare(b.masa);
      }

      // Kategori precedence within same year
      const katWeight: Record<string, number> = {
        'Sukaneka': 1,
        'Balapan': 2,
        'Padang': 3,
        'Pra Sekolah': 4,
      };
      const wA = katWeight[a.kategori] || 5;
      const wB = katWeight[b.kategori] || 5;
      if (wA !== wB) return wA - wB;

      return a.kod.localeCompare(b.kod, undefined, { numeric: true });
    });
  }, [acaraList, kategoriFilter, tahunFilter, carianAcara]);

  // Group events by Year for organized display
  const groupedAcaraByYear = useMemo(() => {
    const groups: {
      key: string;
      title: string;
      badgeText: string;
      colorClass: string;
      items: AcaraSukan[];
    }[] = [
      {
        key: 'tahun-1',
        title: 'Tahun 1: Sukaneka Tahap 1 (Kategori MSSR)',
        badgeText: 'Tahun 1 (6 Murid: 5 Pemain + 1 Simpanan)',
        colorClass: 'border-amber-300 bg-amber-50/50 text-amber-900',
        items: [],
      },
      {
        key: 'tahun-2',
        title: 'Tahun 2: Sukaneka Tahap 1 (Kategori MSSR)',
        badgeText: 'Tahun 2 (6 Murid: 5 Pemain + 1 Simpanan)',
        colorClass: 'border-amber-300 bg-amber-50/50 text-amber-900',
        items: [],
      },
      {
        key: 'tahun-3',
        title: 'Tahun 3: Acara Balapan (Kategori MSSR Bawah 9)',
        badgeText: 'Tahun 3 (60m & 80m)',
        colorClass: 'border-blue-300 bg-blue-50/50 text-blue-900',
        items: [],
      },
      {
        key: 'tahun-4',
        title: 'Tahun 4: Acara Balapan (Kategori MSSR Bawah 10)',
        badgeText: 'Tahun 4 (100m & 4x100m)',
        colorClass: 'border-emerald-300 bg-emerald-50/50 text-emerald-900',
        items: [],
      },
      {
        key: 'tahun-5',
        title: 'Tahun 5: Acara Balapan (Kategori MSSR Bawah 11)',
        badgeText: 'Tahun 5 (100m, 200m & 4x100m)',
        colorClass: 'border-purple-300 bg-purple-50/50 text-purple-900',
        items: [],
      },
      {
        key: 'tahun-6',
        title: 'Tahun 6: Acara Balapan (Kategori MSSR Bawah 12)',
        badgeText: 'Tahun 6 (100m, 200m & 4x100m)',
        colorClass: 'border-rose-300 bg-rose-50/50 text-rose-900',
        items: [],
      },
      {
        key: 'padang',
        title: 'Acara Padang & Terbuka (Kategori MSSR: Tahun 3, 4 & 5 Sahaja)',
        badgeText: 'Tahun 3 - 5 Sahaja (Lompat Jauh, Lontar Peluru, Tarik Tali)',
        colorClass: 'border-teal-300 bg-teal-50/50 text-teal-900',
        items: [],
      },
      {
        key: 'pra-sekolah',
        title: 'Pra Sekolah (07:30 - Kategori MSSR Pra Sekolah)',
        badgeText: 'Pra Sekolah (Acara Terbuka 6 Murid: Pra Cekal, Pra Dinamik, dll.)',
        colorClass: 'border-indigo-300 bg-indigo-50/50 text-indigo-900',
        items: [],
      },
    ];

    sortedAndFilteredAcara.forEach((acara) => {
      const minT = Math.min(...acara.tahunKelayakan);
      if (acara.kategori === 'Padang') {
        groups[6].items.push(acara);
      } else if (minT === 1) {
        groups[0].items.push(acara);
      } else if (minT === 2) {
        groups[1].items.push(acara);
      } else if (minT === 3) {
        groups[2].items.push(acara);
      } else if (minT === 4) {
        groups[3].items.push(acara);
      } else if (minT === 5) {
        groups[4].items.push(acara);
      } else if (minT === 6) {
        groups[5].items.push(acara);
      } else if (minT === 0) {
        groups[7].items.push(acara);
      }
    });

    return groups.filter((g) => g.items.length > 0);
  }, [sortedAndFilteredAcara]);

  // Active selected acara object
  const selectedAcara = useMemo(() => {
    return acaraList.find((a) => a.id === selectedAcaraId) || null;
  }, [acaraList, selectedAcaraId]);

  // Step 3 helper: Filter classes for eligible years only!
  const eligibleKelasList = useMemo(() => {
    if (!selectedAcara) return [];
    const eligibleYears = new Set(selectedAcara.tahunKelayakan);

    // Extract unique classes that belong to eligible years from student records
    const kelasSet = new Set<string>();

    // For Pra Sekolah (0), ensure standard preschool classes are included
    if (eligibleYears.has(0)) {
      SENARAI_KELAS_PRA.forEach((k) => kelasSet.add(k));
    }

    // Pastikan kelas standard sekolah (Arif, Bestari, Cekal, Dinamik, Efisien, Fleksibel) sentiasa tersedia bagi tahun berkaitan
    eligibleYears.forEach((yr) => {
      if (yr >= 1 && yr <= 6) {
        SENARAI_ALIRAN_KELAS.forEach((aliran) => {
          kelasSet.add(`${yr} ${aliran}`);
        });
      }
    });

    muridList.forEach((m) => {
      if (eligibleYears.has(Number(m.tahun))) {
        kelasSet.add(m.kelas);
      }
    });

    // Sort natural alphanumeric
    return Array.from(kelasSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [selectedAcara, muridList]);

  // Step 4 helper: Get registered student IDs for this specific event to prevent duplicates
  const registeredMuridIdsInEvent = useMemo(() => {
    if (!selectedAcara) return new Set<string>();
    const ids = new Set<string>();
    pendaftaranList
      .filter((p) => p.acaraId === selectedAcara.id)
      .forEach((p) => {
        p.peserta.forEach((peserta) => ids.add(peserta.muridId));
      });
    return ids;
  }, [selectedAcara, pendaftaranList]);

  // Step 4: Candidate students filtered by Rumah, Kelas, and Gender, sorted alphabetically
  const candidateStudents = useMemo(() => {
    if (!selectedRumah || !selectedAcara || !selectedKelas) return [];

    let filtered = muridList.filter((m) => {
      // 1. Rumah sukan check
      if (m.rumahSukan !== selectedRumah) return false;

      // 2. Kelas check
      if (selectedKelas !== 'SEMUA_KELAS' && m.kelas !== selectedKelas) return false;
      if (selectedKelas === 'SEMUA_KELAS' && !selectedAcara.tahunKelayakan.includes(Number(m.tahun))) {
        return false;
      }

      // 3. Gender check
      if (selectedAcara.kategoriJantina === 'Lelaki' && m.jantina !== 'Lelaki') return false;
      if (selectedAcara.kategoriJantina === 'Perempuan' && m.jantina !== 'Perempuan') return false;

      return true;
    });

    // Carian nama or ID
    if (carianMurid.trim()) {
      const q = carianMurid.trim().toLowerCase();
      filtered = filtered.filter(
        (m) => m.nama.toLowerCase().includes(q) || m.id.toLowerCase().includes(q)
      );
    }

    // Sort alphabetically by student name (A-Z)
    return filtered.sort((a, b) => a.nama.localeCompare(b.nama, 'ms', { sensitivity: 'base' }));
  }, [muridList, selectedRumah, selectedAcara, selectedKelas, carianMurid]);

  // Presets
  const applyPresetExample = () => {
    setSelectedRumah('Merah');
    setTahunFilter(3);
    const targetAcara = acaraList.find(
      (a) => a.nama.includes('60 Meter Lelaki Tahun 3') || (a.kategoriJantina === 'Lelaki' && a.tahunKelayakan.includes(3))
    );
    if (targetAcara) {
      setSelectedAcaraId(targetAcara.id);
    }
    setSelectedKelas('3 Fleksibel');
    setSelectedPesertaIds([]);
    setSimpananIdSet(new Set());
  };

  const applyPresetSukaneka = () => {
    setSelectedRumah('Merah');
    setTahunFilter(1);
    const targetAcara = acaraList.find(
      (a) => a.nama.includes('Leret Bola') && a.kategoriJantina === 'Lelaki' && a.tahunKelayakan.includes(1)
    );
    if (targetAcara) {
      setSelectedAcaraId(targetAcara.id);
    }
    setSelectedKelas('1 Arif');
    setSelectedPesertaIds([]);
    setSimpananIdSet(new Set());
  };

  const handleToggleStudent = (studentId: string) => {
    if (!selectedAcara) return;

    const isPadang = selectedAcara.kategori === 'Padang';

    if (isPadang) {
      // Acara Padang: Pastikan ada Pemain Utama dan Pemain Simpanan murid (Maksimum 2 murid)
      if (selectedPesertaIds.includes(studentId)) {
        const next = selectedPesertaIds.filter((id) => id !== studentId);
        setSelectedPesertaIds(next);
        const nextSimpanan = new Set(simpananIdSet);
        nextSimpanan.delete(studentId);
        setSimpananIdSet(nextSimpanan);
      } else {
        if (selectedPesertaIds.length >= 2) {
          alert('Acara Padang membenarkan 1 Pemain Utama dan 1 Pemain Simpanan (Maksimum 2 murid). Sila buang salah seorang pilihan terdahulu jika ingin menukar murid.');
          return;
        }
        const next = [...selectedPesertaIds, studentId];
        setSelectedPesertaIds(next);

        // Murid kedua secara automatik ditetapkan sebagai Pemain Simpanan
        if (next.length === 2) {
          const nextSimpanan = new Set(simpananIdSet);
          nextSimpanan.add(studentId);
          setSimpananIdSet(nextSimpanan);
        }
      }
    } else if (selectedAcara.jenis === 'Individu') {
      if (selectedPesertaIds.includes(studentId)) {
        setSelectedPesertaIds([]);
        setSimpananIdSet(new Set());
      } else {
        setSelectedPesertaIds([studentId]);
        setSimpananIdSet(new Set());
      }
    } else {
      const maxMembers = selectedAcara.bilanganAhli;
      if (selectedPesertaIds.includes(studentId)) {
        const next = selectedPesertaIds.filter((id) => id !== studentId);
        setSelectedPesertaIds(next);
        const nextSimpanan = new Set(simpananIdSet);
        nextSimpanan.delete(studentId);
        setSimpananIdSet(nextSimpanan);
      } else {
        if (selectedPesertaIds.length >= maxMembers) {
          alert(`Maksimum ${maxMembers} peserta untuk acara berkumpulan ini telah dicapai.`);
          return;
        }
        const next = [...selectedPesertaIds, studentId];
        setSelectedPesertaIds(next);

        // For Sukaneka (6 members: 5 players + 1 reserve), default the 6th as simpanan
        if (selectedAcara.bilanganAhli === 6 && next.length === 6) {
          const nextSimpanan = new Set(simpananIdSet);
          nextSimpanan.add(studentId);
          setSimpananIdSet(nextSimpanan);
        }
      }
    }
  };

  const handleToggleSimpanan = (studentId: string) => {
    if (selectedAcara?.kategori === 'Padang') {
      // Bagi Acara Padang: Tukar peranan murid antara Pemain Utama dan Pemain Simpanan
      const nextSimpanan = new Set<string>();
      if (!simpananIdSet.has(studentId)) {
        nextSimpanan.add(studentId);
      } else {
        const otherId = selectedPesertaIds.find((id) => id !== studentId);
        if (otherId) nextSimpanan.add(otherId);
      }
      setSimpananIdSet(nextSimpanan);
      return;
    }
    const nextSimpanan = new Set(simpananIdSet);
    if (nextSimpanan.has(studentId)) {
      nextSimpanan.delete(studentId);
    } else {
      nextSimpanan.add(studentId);
    }
    setSimpananIdSet(nextSimpanan);
  };

  const resetAllSteps = () => {
    setSelectedRumah(null);
    setSelectedAcaraId(null);
    setSelectedKelas(null);
    setSelectedPesertaIds([]);
    setSimpananIdSet(new Set());
    setCatatan('');
    setCarianMurid('');
    setTahunFilter('semua');
    setKategoriFilter('Semua');
    setSuccessMessage(null);
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRumah || !selectedAcara || !selectedKelas) {
      alert('Sila lengkapkan semua urutan pemilihan.');
      return;
    }

    if (selectedPesertaIds.length === 0) {
      alert('Sila pilih sekurang-kurangnya seorang murid.');
      return;
    }

    // Ketetapan Acara Padang: Pastikan ada Pemain Utama dan Pemain Simpanan murid
    if (selectedAcara.kategori === 'Padang' && selectedPesertaIds.length < 2) {
      alert(
        'Ketetapan Acara Padang: Sila pastikan ada Pemain Utama dan Pemain Simpanan murid (Jumlah 2 orang murid). Sila pilih seorang lagi murid sebagai pemain simpanan sebelum menghantar pendaftaran.'
      );
      return;
    }

    // Auto-fill full student info based on uploaded list and auto-assign official Athlete ID
    const pesertaData: PesertaPendaftaran[] = [];
    const currentBatchAssignedIds = new Map<string, string>();

    selectedPesertaIds.forEach((id, index) => {
      const student = muridList.find((m) => m.id === id);
      if (student) {
        let peranan = 'Peserta Utama';
        const isSimpanan = simpananIdSet.has(id);

        if (selectedAcara.kategori === 'Padang') {
          // Bagi Acara Padang: Tetapkan Pemain Utama dan Pemain Simpanan
          if (isSimpanan || (selectedPesertaIds.length > 1 && index === 1 && !simpananIdSet.has(selectedPesertaIds[0]))) {
            peranan = 'Pemain Simpanan';
          } else {
            peranan = 'Pemain Utama';
          }
        } else if (selectedAcara.jenis === 'Berkumpulan') {
          if (selectedAcara.bilanganAhli === 6) {
            if (isSimpanan || index === 5) {
              peranan = 'Pemain Simpanan (Simpanan)';
            } else {
              peranan = `Pemain Utama ${index + 1}`;
            }
          } else {
            if (isSimpanan || (selectedAcara.bilanganAhli === 5 && index === 4)) {
              peranan = 'Pelari Simpanan';
            } else {
              peranan = `Pelari ${index + 1}`;
            }
          }
        }

        // Auto-assign athlete ID for this selected participant based on house and year
        const officialIdPeserta = getOrGeneratePesertaId(
          student,
          pendaftaranList,
          currentBatchAssignedIds
        );

        const isMarkedSimpanan =
          selectedAcara.kategori === 'Padang'
            ? peranan === 'Pemain Simpanan'
            : isSimpanan || (selectedAcara.bilanganAhli === 6 && index === 5);

        pesertaData.push({
          muridId: officialIdPeserta, // Official athlete ID (cth: M-3001, PRA-M01)
          idPeserta: officialIdPeserta,
          nama: student.nama,
          tahun: student.tahun,
          kelas: student.kelas,
          jantina: student.jantina,
          rumahSukan: student.rumahSukan,
          peranan,
          isSimpanan: isMarkedSimpanan,
        });
      }
    });

    const savedReg = StorageService.tambahPendaftaran({
      acaraId: selectedAcara.id,
      acaraNama: selectedAcara.nama,
      rumahSukan: selectedRumah,
      peserta: pesertaData,
      catatan: catatan.trim() || undefined,
    });
    setLastSavedReg(savedReg);

    const ringkasanMurid = pesertaData.map((p) => `${p.nama} [${p.muridId}]`).join(', ');
    setSuccessMessage(
      `Pendaftaran berjaya disimpan! ${pesertaData.length} peserta (${ringkasanMurid}) telah didaftarkan dalam "${selectedAcara.nama}" untuk Rumah ${selectedRumah} dengan ID Peserta MSSR dijana automatik.`
    );

    setSelectedPesertaIds([]);
    setSimpananIdSet(new Set());
    onSuccess();
  };

  // Determine current step index (1-4)
  const currentStep = !selectedRumah ? 1 : !selectedAcaraId ? 2 : !selectedKelas ? 3 : 4;

  return (
    <div className="space-y-6">
      {/* Quick Test Presets Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 rounded-2xl p-4 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm shrink-0">
            <Sparkles className="w-5 h-5 text-yellow-200" />
          </div>
          <div>
            <div className="text-xs font-semibold tracking-wider uppercase text-red-100">
              Pintasan Ujian Contoh Spesifikasi
            </div>
            <div className="font-bold text-sm sm:text-base">
              Rumah Merah → 60 Meter Lelaki Tahun 3 → 3 Fleksibel
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={applyPresetExample}
            className="cursor-pointer bg-white text-red-700 hover:bg-red-50 font-semibold px-3.5 py-1.5 rounded-xl text-xs transition-all shadow hover:shadow-md flex items-center gap-1.5 whitespace-nowrap active:scale-95"
          >
            <span>Ujian Tahun 3 Fleksibel</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={applyPresetSukaneka}
            className="cursor-pointer bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold px-3.5 py-1.5 rounded-xl text-xs transition-all shadow hover:shadow-md flex items-center gap-1.5 whitespace-nowrap active:scale-95"
          >
            <span>Ujian Sukaneka 6 Murid (T1)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Breadcrumb Steps Header */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
              Urutan Pemilihan Rasmi
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Rumah Sukan → Acara & Kategori → Kelas → Nama Murid
            </span>
          </div>
          <button
            type="button"
            onClick={resetAllSteps}
            className="cursor-pointer text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Mula Semula</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {/* Step 1 Indicator */}
          <div
            onClick={() => {
              if (selectedRumah) {
                setSelectedRumah(null);
                setSelectedAcaraId(null);
                setSelectedKelas(null);
                setSelectedPesertaIds([]);
              }
            }}
            className={`p-3 rounded-xl border transition-all text-left ${
              selectedRumah
                ? 'bg-emerald-50 border-emerald-300 cursor-pointer hover:bg-emerald-100/60'
                : currentStep === 1
                ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-200'
                : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
          >
            <div className="text-[11px] font-bold uppercase text-slate-500">1. Rumah Sukan</div>
            <div className="font-semibold text-sm truncate flex items-center gap-1.5 mt-0.5">
              {selectedRumah ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-emerald-900 truncate">Rumah {selectedRumah}</span>
                </>
              ) : (
                <span className="text-slate-700">Pilih Rumah Sukan</span>
              )}
            </div>
          </div>

          {/* Step 2 Indicator */}
          <div
            onClick={() => {
              if (selectedAcaraId) {
                setSelectedAcaraId(null);
                setSelectedKelas(null);
                setSelectedPesertaIds([]);
              }
            }}
            className={`p-3 rounded-xl border transition-all text-left ${
              selectedAcara
                ? 'bg-emerald-50 border-emerald-300 cursor-pointer hover:bg-emerald-100/60'
                : currentStep === 2
                ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-200'
                : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
          >
            <div className="text-[11px] font-bold uppercase text-slate-500">2. Acara & Kategori</div>
            <div className="font-semibold text-sm truncate flex items-center gap-1.5 mt-0.5">
              {selectedAcara ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-emerald-900 truncate">{selectedAcara.nama}</span>
                </>
              ) : (
                <span className="text-slate-700">Pilih Acara (T1 - T6)</span>
              )}
            </div>
          </div>

          {/* Step 3 Indicator */}
          <div
            onClick={() => {
              if (selectedKelas) {
                setSelectedKelas(null);
                setSelectedPesertaIds([]);
              }
            }}
            className={`p-3 rounded-xl border transition-all text-left ${
              selectedKelas
                ? 'bg-emerald-50 border-emerald-300 cursor-pointer hover:bg-emerald-100/60'
                : currentStep === 3
                ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-200'
                : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
          >
            <div className="text-[11px] font-bold uppercase text-slate-500">3. Kelas Layak</div>
            <div className="font-semibold text-sm truncate flex items-center gap-1.5 mt-0.5">
              {selectedKelas ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-emerald-900 truncate">
                    {selectedKelas === 'SEMUA_KELAS' ? 'Semua Kelas' : selectedKelas}
                  </span>
                </>
              ) : (
                <span className="text-slate-700">Pilih Kelas</span>
              )}
            </div>
          </div>

          {/* Step 4 Indicator */}
          <div
            className={`p-3 rounded-xl border transition-all text-left ${
              selectedPesertaIds.length > 0
                ? 'bg-emerald-50 border-emerald-300'
                : currentStep === 4
                ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-200'
                : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
          >
            <div className="text-[11px] font-bold uppercase text-slate-500">4. Nama Murid</div>
            <div className="font-semibold text-sm truncate flex items-center gap-1.5 mt-0.5">
              {selectedPesertaIds.length > 0 ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-emerald-900 truncate">{selectedPesertaIds.length} Murid Dipilih</span>
                </>
              ) : (
                <span className="text-slate-700">Pilih Nama Murid</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-start justify-between gap-3 shadow-sm animate-fadeIn">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <div className="font-bold text-sm">Pendaftaran Disimpan!</div>
              <p className="text-sm text-emerald-800 mt-0.5">{successMessage}</p>

              {lastSavedReg && (
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSlipModal(true)}
                    className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Slip (Format Kad) Murid Ini Sekarang</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-semibold text-xs cursor-pointer px-2 py-1 self-start sm:self-auto"
          >
            Tutup
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* LANGKAH 1: PILIHAN RUMAH SUKAN */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                1
              </span>
              <h3 className="text-lg font-bold text-slate-900">Pilih Rumah Sukan</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1 ml-9">
              Pilih satu daripada 4 rumah sukan rasmi (Merah, Kuning, Hijau, Biru) untuk mendaftar peserta acara.
            </p>
          </div>

          {selectedRumah && (
            <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
              Terpilih: Rumah {selectedRumah}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SENARAI_RUMAH_KEYS.map((rumahKey) => {
            const info = SENARAI_RUMAH[rumahKey];
            const isSelected = selectedRumah === rumahKey;
            const studentCount = muridList.filter((m) => m.rumahSukan === rumahKey).length;

            return (
              <button
                key={rumahKey}
                type="button"
                onClick={() => {
                  setSelectedRumah(rumahKey);
                  if (selectedRumah !== rumahKey) {
                    setSelectedAcaraId(null);
                    setSelectedKelas(null);
                    setSelectedPesertaIds([]);
                    setSimpananIdSet(new Set());
                  }
                }}
                className={`cursor-pointer rounded-2xl p-4 transition-all text-left border relative overflow-hidden group ${
                  isSelected
                    ? `${info.borderClass} ${info.bgLightClass} ring-2 ring-offset-2 ring-indigo-500 shadow-md`
                    : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/90 hover:border-slate-300'
                }`}
              >
                <div
                  className="absolute top-0 right-0 w-16 h-16 opacity-10 rounded-full -mr-4 -mt-4"
                  style={{ backgroundColor: info.warnaTema }}
                />

                <div className="flex items-center justify-between mb-2">
                  <div
                    className="w-4 h-4 rounded-full border shadow-xs"
                    style={{ backgroundColor: info.warnaTema, borderColor: info.warnaTema }}
                  />
                  {isSelected && (
                    <span className="bg-indigo-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      <Check className="w-3 h-3" />
                      Aktif
                    </span>
                  )}
                </div>

                <div className="font-bold text-base text-slate-900">{info.namaRumah}</div>
                <div className="text-xs text-slate-500 italic mb-3">{info.maskot}</div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                  <span>Jumlah Murid:</span>
                  <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {studentCount}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* LANGKAH 2: PILIHAN ACARA BERURUTAN DARI TAHUN 1 HINGGA TAHUN 6 */}
      {/* ============================================================== */}
      {selectedRumah && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 animate-fadeIn space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  2
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Pilih Acara Sukan (Disusun Berurutan Tahun 1 hingga Tahun 6)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1 ml-9">
                Senarai acara disusun secara berurutan bermula dari <strong className="text-indigo-700">Tahun 1 → Tahun 2 → Tahun 3 → Tahun 4 → Tahun 5 → Tahun 6</strong>, memudahkan guru menyaring acara yang relevan dengan tahun murid.
              </p>
            </div>

            {/* Filter kategori & carian */}
            <div className="flex items-center gap-2 flex-wrap ml-9 md:ml-0">
              <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
                {(['Semua', 'Sukaneka', 'Balapan', 'Padang', 'Pra Sekolah'] as const).map((kat) => (
                  <button
                    key={kat}
                    type="button"
                    onClick={() => setKategoriFilter(kat)}
                    className={`cursor-pointer px-2.5 py-1 rounded-lg transition-all ${
                      kategoriFilter === kat ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {kat}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari acara, kod, pecut..."
                  value={carianAcara}
                  onChange={(e) => setCarianAcara(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-100 rounded-xl border border-transparent focus:bg-white focus:border-indigo-400 focus:outline-none w-44"
                />
              </div>
            </div>
          </div>

          {/* Baris Tab Tapisan Mengikut Urutan Tahun: Bermula dari Tahun 1 hingga Tahun 6 */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100 text-xs">
            <span className="text-slate-400 font-bold uppercase text-[10px] mr-1 shrink-0 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-indigo-600" />
              <span>Urutan Tahun:</span>
            </span>

            {/* Tahun 1 hingga 6 */}
            {[1, 2, 3, 4, 5, 6].map((th) => {
              const countInYear = acaraList.filter((a) => a.tahunKelayakan.includes(th)).length;
              const isSelected = tahunFilter === th;
              const isSukanekaYear = th === 1 || th === 2;

              return (
                <button
                  key={th}
                  type="button"
                  onClick={() => setTahunFilter(th)}
                  className={`cursor-pointer px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : isSukanekaYear
                      ? 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>Tahun {th}</span>
                  {isSukanekaYear && <span className="text-[10px] opacity-75">(Sukaneka & 60m)</span>}
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-600'
                    }`}
                  >
                    {countInYear}
                  </span>
                </button>
              );
            })}

            {/* Padang & Terbuka */}
            <button
              type="button"
              onClick={() => setTahunFilter('padang')}
              className={`cursor-pointer px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                tahunFilter === 'padang'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Acara Padang (T3 - T5)
            </button>

            {/* Pra Sekolah */}
            <button
              type="button"
              onClick={() => setTahunFilter('pra')}
              className={`cursor-pointer px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                tahunFilter === 'pra'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
              }`}
            >
              <Clock className="w-3 h-3 text-purple-600" />
              <span>Pra Sekolah</span>
            </button>

            {/* Semua Acara */}
            <button
              type="button"
              onClick={() => setTahunFilter('semua')}
              className={`cursor-pointer px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                tahunFilter === 'semua'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Semua Acara ({acaraList.length})
            </button>
          </div>

          {/* Paparan Senarai Acara Berurutan Tahun 1 hingga 6 */}
          {sortedAndFilteredAcara.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              Tiada acara dijumpai bagi tapisan yang dipilih.
            </div>
          ) : tahunFilter === 'semua' && !carianAcara.trim() && kategoriFilter === 'Semua' ? (
            /* Paparan Berseksyen Mengikut Tahun (Tahun 1 -> Tahun 2 -> ... -> Tahun 6) */
            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
              {groupedAcaraByYear.map((group) => (
                <div key={group.key} className="space-y-2.5">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-1.5">
                    <span className="font-extrabold text-sm text-slate-800">{group.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {group.items.length} Acara
                    </span>
                    <span className="text-xs text-slate-400">• {group.badgeText}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {group.items.map((acara) => {
                      const isSelected = selectedAcaraId === acara.id;
                      const regForThisHouse = pendaftaranList.find(
                        (p) => p.acaraId === acara.id && p.rumahSukan === selectedRumah
                      );
                      const isRegistered = !!regForThisHouse;

                      return (
                        <button
                          key={acara.id}
                          type="button"
                          onClick={() => {
                            setSelectedAcaraId(acara.id);
                            if (selectedAcaraId !== acara.id) {
                              setSelectedKelas(null);
                              setSelectedPesertaIds([]);
                              setSimpananIdSet(new Set());
                            }
                          }}
                          className={`cursor-pointer p-4 rounded-xl border text-left transition-all relative ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/90 ring-2 ring-indigo-300 shadow-sm'
                              : isRegistered
                              ? 'border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50/70'
                              : 'border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                                {acara.kod}
                              </span>
                              {acara.masa && (
                                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-emerald-600" />
                                  {acara.masa}
                                </span>
                              )}
                              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                {acara.tahunKelayakan[0] === 0 ? 'Pra Sekolah' : `Tahun ${acara.tahunKelayakan.join(', ')}`}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  acara.kategoriJantina === 'Lelaki'
                                    ? 'bg-blue-100 text-blue-800'
                                    : acara.kategoriJantina === 'Perempuan'
                                    ? 'bg-pink-100 text-pink-800'
                                    : 'bg-purple-100 text-purple-800'
                                }`}
                              >
                                {acara.kategoriJantina}
                              </span>
                            </div>
                          </div>

                          <div className="font-bold text-slate-900 text-sm mt-1">{acara.nama}</div>

                          {acara.catatan && (
                            <div className="mt-1 text-[11px] font-semibold text-amber-700 flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              <span>{acara.catatan}</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/50 text-[11px] text-slate-600">
                            <span>
                              {acara.jenis === 'Berkumpulan' ? (
                                <strong className="text-amber-800">
                                  {acara.bilanganAhli === 6 ? '6 Murid (5 Pemain + 1 Simpanan)' : `Kumpulan (${acara.bilanganAhli} orang)`}
                                </strong>
                              ) : (
                                'Individu (1 Orang)'
                              )}
                            </span>

                            {isRegistered ? (
                              <span className="text-emerald-700 font-bold flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Sudah Didaftar</span>
                              </span>
                            ) : isSelected ? (
                              <span className="font-bold text-indigo-600 flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> Terpilih
                              </span>
                            ) : (
                              <span className="text-slate-400">Pilih Acara</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Paparan Grid Mengikut Penapis / Carian */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
              {sortedAndFilteredAcara.map((acara) => {
                const isSelected = selectedAcaraId === acara.id;
                const regForThisHouse = pendaftaranList.find(
                  (p) => p.acaraId === acara.id && p.rumahSukan === selectedRumah
                );
                const isRegistered = !!regForThisHouse;

                return (
                  <button
                    key={acara.id}
                    type="button"
                    onClick={() => {
                      setSelectedAcaraId(acara.id);
                      if (selectedAcaraId !== acara.id) {
                        setSelectedKelas(null);
                        setSelectedPesertaIds([]);
                        setSimpananIdSet(new Set());
                      }
                    }}
                    className={`cursor-pointer p-4 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/90 ring-2 ring-indigo-300 shadow-sm'
                        : isRegistered
                        ? 'border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50/70'
                        : 'border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                          {acara.kod}
                        </span>
                        {acara.masa && (
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-emerald-600" />
                            {acara.masa}
                          </span>
                        )}
                        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {acara.tahunKelayakan[0] === 0 ? 'Pra Sekolah' : `Tahun ${acara.tahunKelayakan.join(', ')}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            acara.kategoriJantina === 'Lelaki'
                              ? 'bg-blue-100 text-blue-800'
                              : acara.kategoriJantina === 'Perempuan'
                              ? 'bg-pink-100 text-pink-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {acara.kategoriJantina}
                        </span>
                      </div>
                    </div>

                    <div className="font-bold text-slate-900 text-sm mt-1">{acara.nama}</div>

                    {acara.catatan && (
                      <div className="mt-1 text-[11px] font-semibold text-amber-700 flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span>{acara.catatan}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/50 text-[11px] text-slate-600">
                      <span>
                        {acara.kategori === 'Padang' ? (
                          <strong className="text-amber-800">
                            Padang (1 Utama + 1 Simpanan)
                          </strong>
                        ) : acara.jenis === 'Berkumpulan' ? (
                          <strong className="text-amber-800">
                            {acara.bilanganAhli === 6 ? '6 Murid (5 Pemain + 1 Simpanan)' : `Kumpulan (${acara.bilanganAhli} orang)`}
                          </strong>
                        ) : (
                          'Individu (1 Orang)'
                        )}
                      </span>

                      {isRegistered ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Sudah Didaftar</span>
                        </span>
                      ) : isSelected ? (
                        <span className="font-bold text-indigo-600 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Terpilih
                        </span>
                      ) : (
                        <span className="text-slate-400">Pilih Acara</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* LANGKAH 3: PILIHAN KELAS BAGI TAHUN YANG LAYAK SAHAJA */}
      {/* ============================================================== */}
      {selectedRumah && selectedAcara && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  3
                </span>
                <h3 className="text-lg font-bold text-slate-900">Pilih Kelas</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1 ml-9">
                Hanya kelas bagi <span className="font-bold text-indigo-700">
                  {selectedAcara.tahunKelayakan[0] === 0 ? 'Pra Sekolah' : `Tahun ${selectedAcara.tahunKelayakan.join(', ')}`}
                </span> dipaparkan (Contoh Tahun 3: 3 Arif, 3 Bestari, 3 Cekal, 3 Dinamik, 3 Efisien, 3 Fleksibel).
              </p>
            </div>

            {selectedKelas && (
              <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full self-start sm:self-auto">
                Kelas: {selectedKelas === 'SEMUA_KELAS' ? 'Semua Kelas' : selectedKelas}
              </span>
            )}
          </div>

          {eligibleKelasList.length === 0 ? (
            <div className="p-6 text-center bg-amber-50 rounded-2xl border border-amber-200">
              <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <div className="font-bold text-sm text-amber-900">Tiada Kelas Dijumpai</div>
              <p className="text-xs text-amber-700 mt-1">
                Tiada murid didaftarkan untuk Tahun {selectedAcara.tahunKelayakan.join(', ')} dalam sistem.
                Sila muat naik senarai murid terlebih dahulu di tab Pentadbir.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {eligibleKelasList.map((kelas) => {
                  const isSelected = selectedKelas === kelas;
                  const countHouseStudents = muridList.filter(
                    (m) =>
                      m.rumahSukan === selectedRumah &&
                      m.kelas === kelas &&
                      (selectedAcara.kategoriJantina === 'Terbuka' || m.jantina === selectedAcara.kategoriJantina)
                  ).length;

                  const is3Fleksibel = kelas.toLowerCase().includes('3 fleksibel');

                  return (
                    <button
                      key={kelas}
                      type="button"
                      onClick={() => {
                        setSelectedKelas(kelas);
                        setSelectedPesertaIds([]);
                        setSimpananIdSet(new Set());
                      }}
                      className={`cursor-pointer p-3.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/90 ring-2 ring-indigo-300 shadow-sm'
                          : is3Fleksibel
                          ? 'border-red-300 bg-red-50/40 hover:bg-red-50'
                          : 'border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-center mb-1">
                        <GraduationCap className={`w-5 h-5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                      </div>
                      <div className="font-bold text-sm text-slate-900 truncate">{kelas}</div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {countHouseStudents} murid ({selectedAcara.kategoriJantina})
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Option to select across all eligible classes of the year for group/sukaneka events */}
              {selectedAcara.jenis === 'Berkumpulan' && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedKelas('SEMUA_KELAS');
                      setSelectedPesertaIds([]);
                      setSimpananIdSet(new Set());
                    }}
                    className={`cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                      selectedKelas === 'SEMUA_KELAS'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    + Gabung / Pilih Dari Semua Kelas Tahun {selectedAcara.tahunKelayakan.join('/')} ({selectedRumah})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* LANGKAH 4: PEMILIHAN MURID */}
      {/* ============================================================== */}
      {selectedRumah && selectedAcara && selectedKelas && (
        <form onSubmit={handleSubmitRegistration} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 animate-fadeIn space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  4
                </span>
                <h3 className="text-lg font-bold text-slate-900">Pilih Nama Murid</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1 ml-9">
                Memaparkan murid <span className="font-semibold text-slate-700">{selectedAcara.kategoriJantina}</span> bagi{' '}
                <span className="font-semibold text-slate-700">
                  {selectedKelas === 'SEMUA_KELAS' ? 'Semua Kelas' : selectedKelas}
                </span>{' '}
                daripada <span className="font-semibold text-slate-700">Rumah {selectedRumah}</span> (Disusun A-Z mengikut abjad).
              </p>
            </div>

            {/* Carian & Tambah Murid Baharu Pantas */}
            <div className="flex items-center gap-2 flex-wrap ml-9 md:ml-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama atau ID murid..."
                  value={carianMurid}
                  onChange={(e) => setCarianMurid(e.target.value)}
                  className="pl-9 pr-4 py-2 text-xs bg-slate-100 rounded-xl border border-transparent focus:bg-white focus:border-indigo-400 focus:outline-none w-52 sm:w-64"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowAddStudentModal(true)}
                className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all whitespace-nowrap"
                title="Daftar murid baharu untuk rumah sukan dan kelas ini"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Daftar Murid</span>
              </button>
            </div>
          </div>

          {/* Sukaneka / Group Event Slots Summary Banner */}
          {selectedAcara.jenis === 'Berkumpulan' && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-700" />
                  <span>
                    Acara Berkumpulan: {selectedAcara.bilanganAhli === 6 ? 'Sukaneka (6 Murid: 5 Pemain Utama + 1 Simpanan)' : `${selectedAcara.bilanganAhli} Peserta`}
                  </span>
                </div>
                <span className="font-bold text-amber-800 bg-white px-2.5 py-0.5 rounded-full border border-amber-300">
                  {selectedPesertaIds.length} / {selectedAcara.bilanganAhli} Dipilih
                </span>
              </div>

              {selectedAcara.bilanganAhli === 6 && (
                <p className="text-amber-800">
                  * <strong>5 Murid</strong> akan bertindak sebagai <em>Pemain Utama</em> dan <strong>1 Murid</strong> sebagai <em>Pemain Simpanan</em>. Anda boleh klik tanda bintang (⭐) pada murid untuk menetapkan peranan Simpanan.
                </p>
              )}
            </div>
          )}

          {/* Acara Padang: Banner Wajib Pemain Utama & Pemain Simpanan */}
          {selectedAcara.kategori === 'Padang' && (
            <div className="bg-gradient-to-r from-amber-50 via-amber-100/70 to-emerald-50 border border-amber-300 p-4 rounded-xl text-xs space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="font-bold text-amber-950 flex items-center gap-2">
                  <span className="p-1 rounded-md bg-amber-500 text-white font-bold text-[10px]">PADANG</span>
                  <span className="text-sm">
                    Ketetapan Acara Padang: 1 Pemain Utama + 1 Pemain Simpanan Murid
                  </span>
                </div>
                <span className="font-bold text-amber-900 bg-white px-3 py-1 rounded-full border border-amber-300 shadow-2xs">
                  {selectedPesertaIds.length} / 2 Murid Dipilih
                </span>
              </div>
              <p className="text-amber-950 leading-relaxed">
                * <strong>Pemain Utama:</strong> Murid utama yang bertanding di padang kejohanan.<br />
                * <strong>Pemain Simpanan:</strong> Murid simpanan jika berlaku kecederaan/halangan. Anda boleh klik butang <strong>[Tukar Peranan]</strong> pada kad murid untuk melaraskan status utama/simpanan.
              </p>
            </div>
          )}

          {/* Prompt requirement #11:
              Jika tiada murid yang sepadan, paparkan:
              “Tiada murid yang memenuhi rumah, kelas dan kategori yang dipilih.” */}
          {candidateStudents.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <div className="font-bold text-base text-slate-800">
                Tiada murid yang memenuhi rumah, kelas dan kategori yang dipilih.
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Tiada rekod murid {selectedAcara.kategoriJantina} daripada Rumah {selectedRumah} dalam {selectedKelas === 'SEMUA_KELAS' ? 'Semua Kelas' : `kelas ${selectedKelas}`}.
              </p>
              <button
                type="button"
                onClick={() => setShowAddStudentModal(true)}
                className="mt-4 cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Daftar Murid Baharu ke Rumah {selectedRumah} ({selectedKelas})</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>
                  Dijumpai: <strong className="text-slate-800">{candidateStudents.length}</strong> murid yang layak
                </span>
                <span>
                  {selectedAcara.kategori === 'Padang' ? (
                    <span className="font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-300">
                      Pilih 2 murid (1 Pemain Utama + 1 Simpanan)
                    </span>
                  ) : selectedAcara.jenis === 'Berkumpulan' ? (
                    <span className="font-semibold text-amber-700">
                      Pilih sehingga {selectedAcara.bilanganAhli} peserta
                    </span>
                  ) : (
                    <span className="text-slate-600">Pilih 1 peserta utama</span>
                  )}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {candidateStudents.map((murid) => {
                  const isRegisteredInThisEvent = registeredMuridIdsInEvent.has(murid.id);
                  const isSelected = selectedPesertaIds.includes(murid.id);
                  const isSimpanan = simpananIdSet.has(murid.id);
                  const selectedIndex = selectedPesertaIds.indexOf(murid.id);

                  return (
                    <div
                      key={murid.id}
                      className={`p-3.5 rounded-xl border transition-all text-left relative flex items-start justify-between gap-3 ${
                        isRegisteredInThisEvent
                          ? 'bg-slate-100 border-slate-200 opacity-60'
                          : isSelected
                          ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-200 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Checkbox or Radio selection */}
                        <div className="pt-0.5">
                          <input
                            type={selectedAcara.jenis === 'Berkumpulan' || selectedAcara.kategori === 'Padang' ? 'checkbox' : 'radio'}
                            name="selectedMurid"
                            id={`murid-${murid.id}`}
                            disabled={isRegisteredInThisEvent}
                            checked={isSelected}
                            onChange={() => handleToggleStudent(murid.id)}
                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed"
                          />
                        </div>

                        <label
                          htmlFor={`murid-${murid.id}`}
                          className={`flex-1 min-w-0 ${isRegisteredInThisEvent ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 truncate">
                              {murid.nama}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white shrink-0">
                                #{selectedIndex + 1}
                              </span>
                            )}
                          </div>

                          {/* Auto-fill details (ID Peserta hanya untuk yang dipilih, Kelas, Tahun, Jantina, Rumah) */}
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 flex-wrap">
                            {isSelected ? (
                              <span className="font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded text-[11px] font-bold">
                                ID Peserta MSSR: {getOrGeneratePesertaId(murid, pendaftaranList)}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-medium italic">
                                ID Murid dijana automatik jika dipilih
                              </span>
                            )}
                            <span>•</span>
                            <span className="font-medium text-slate-700">{murid.kelas}</span>
                            <span>•</span>
                            <span>{murid.tahun === 0 ? 'Pra Sekolah' : `Tahun ${murid.tahun}`}</span>
                            <span>•</span>
                            <span>{murid.jantina}</span>
                            <span>•</span>
                            <span className="font-semibold text-slate-700">Rumah {murid.rumahSukan}</span>
                          </div>

                          {/* Sukaneka role toggle button */}
                          {isSelected && selectedAcara.bilanganAhli === 6 && (
                            <div className="mt-2 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleToggleSimpanan(murid.id);
                                }}
                                className={`cursor-pointer px-2.5 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 border transition-all ${
                                  isSimpanan
                                    ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs'
                                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                                }`}
                              >
                                <Star className={`w-3 h-3 ${isSimpanan ? 'text-amber-600 fill-amber-500' : 'text-slate-400'}`} />
                                <span>{isSimpanan ? 'Pemain Simpanan (Simpanan)' : 'Pemain Utama (Klik untuk Simpanan)'}</span>
                              </button>
                            </div>
                          )}

                          {/* Acara Padang role toggle button: Pemain Utama vs Pemain Simpanan */}
                          {isSelected && selectedAcara.kategori === 'Padang' && (
                            <div className="mt-2 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleToggleSimpanan(murid.id);
                                }}
                                className={`cursor-pointer px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
                                  isSimpanan || (selectedIndex === 1 && !simpananIdSet.has(selectedPesertaIds[0]))
                                    ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs hover:bg-amber-200'
                                    : 'bg-emerald-100 text-emerald-900 border-emerald-300 shadow-2xs hover:bg-emerald-200'
                                }`}
                              >
                                <span>
                                  {isSimpanan || (selectedIndex === 1 && !simpananIdSet.has(selectedPesertaIds[0]))
                                    ? '★ Pemain Simpanan'
                                    : '✔ Pemain Utama'}
                                </span>
                                <span className="text-[10px] font-normal text-slate-600">(Klik untuk tukar peranan)</span>
                              </button>
                            </div>
                          )}
                        </label>
                      </div>

                      {/* Requirement 10: Tandakan murid yang sudah didaftarkan */}
                      {isRegisteredInThisEvent && (
                        <div className="shrink-0 text-right">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-200">
                            <CheckCircle className="w-3 h-3 text-red-600" />
                            Sudah Didaftar (Acara Ini)
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Summary Card before submit */}
          {selectedPesertaIds.length > 0 && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Ringkasan Pendaftaran Semasa:</span>
                <span className="text-slate-500">
                  {selectedPesertaIds.length} daripada {selectedAcara.bilanganAhli} kuota peserta
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedPesertaIds.map((id, index) => {
                  const m = muridList.find((stud) => stud.id === id);
                  if (!m) return null;
                  const isSimp = simpananIdSet.has(id) || (selectedAcara.bilanganAhli === 6 && index === 5);
                  const assignedId = getOrGeneratePesertaId(m, pendaftaranList);

                  return (
                    <div
                      key={id}
                      className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 flex items-center gap-2 shadow-2xs"
                    >
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">
                        {index + 1}
                      </span>
                      <span className="font-bold text-slate-800">{m.nama}</span>
                      <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        {assignedId}
                      </span>
                      <span className="text-[10px] text-slate-500">({m.kelas})</span>
                      {selectedAcara.bilanganAhli === 6 && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            isSimp ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-blue-50 text-blue-800'
                          }`}
                        >
                          {isSimp ? 'Simpanan' : 'Utama'}
                        </span>
                      )}

                      {selectedAcara.kategori === 'Padang' && (
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            isSimp || (index === 1 && !simpananIdSet.has(selectedPesertaIds[0]))
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          }`}
                        >
                          {isSimp || (index === 1 && !simpananIdSet.has(selectedPesertaIds[0]))
                            ? 'Pemain Simpanan'
                            : 'Pemain Utama'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Catatan input (optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Pendaftaran (Pilihan)
            </label>
            <input
              type="text"
              placeholder="Contoh: Giliran pertama, simpanan kecemasan, dsb..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-400 focus:outline-none"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedKelas(null);
                setSelectedPesertaIds([]);
                setSimpananIdSet(new Set());
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Kembali ke Pilih Kelas
            </button>

            <button
              type="submit"
              disabled={selectedPesertaIds.length === 0}
              className="cursor-pointer px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-98"
            >
              <UserCheck className="w-4 h-4" />
              <span>Sahkan & Simpan Pendaftaran ({selectedPesertaIds.length} Murid)</span>
            </button>
          </div>
        </form>
      )}

      {/* Slip Modal Popup */}
      {showSlipModal && lastSavedReg && (
        <PrintableCardSlipModal
          pendaftaran={lastSavedReg}
          onClose={() => setShowSlipModal(false)}
        />
      )}

      {/* Modal Daftar Murid Baharu Secara Pantas */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-700 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-200" />
                <div>
                  <h3 className="font-bold text-base">Daftar Murid Baharu</h3>
                  <p className="text-[11px] text-indigo-200">
                    Daftar ke Rumah {selectedRumah} & Terus Pilih Acara
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStudentModal(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!inlineNama.trim()) {
                  alert('Sila masukkan nama penuh murid.');
                  return;
                }
                const targetKelas =
                  selectedKelas && selectedKelas !== 'SEMUA_KELAS'
                    ? selectedKelas
                    : selectedAcara && selectedAcara.tahunKelayakan[0] === 0
                    ? 'Pra Arif'
                    : `${selectedAcara?.tahunKelayakan[0] || 1} Arif`;
                const targetTahun =
                  selectedAcara && selectedAcara.tahunKelayakan.length > 0
                    ? selectedAcara.tahunKelayakan[0]
                    : 1;
                const targetJantina =
                  selectedAcara?.kategoriJantina === 'Perempuan'
                    ? 'Perempuan'
                    : selectedAcara?.kategoriJantina === 'Lelaki'
                    ? 'Lelaki'
                    : inlineJantina;
                const housePrefix = selectedRumah ? selectedRumah[0].toUpperCase() : 'M';
                const newId = `M-${housePrefix}${targetTahun === 0 ? 'P' : targetTahun}-${Date.now().toString().slice(-4)}`;

                const newStudent: Murid = {
                  id: newId,
                  nama: inlineNama.trim(),
                  tahun: targetTahun,
                  kelas: targetKelas,
                  jantina: targetJantina,
                  rumahSukan: selectedRumah || 'Merah',
                };

                StorageService.upsertMuridBatch([newStudent]);
                onSuccess();

                // Auto-pilih murid baru bagi acara semasa
                if (selectedAcara?.kategori === 'Padang') {
                  if (selectedPesertaIds.length < 2) {
                    const next = [...selectedPesertaIds, newId];
                    setSelectedPesertaIds(next);
                    if (next.length === 2) {
                      const nextSimp = new Set(simpananIdSet);
                      nextSimp.add(newId);
                      setSimpananIdSet(nextSimp);
                    }
                  }
                } else if (selectedAcara?.jenis === 'Individu') {
                  setSelectedPesertaIds([newId]);
                } else {
                  if (selectedPesertaIds.length < (selectedAcara?.bilanganAhli || 6)) {
                    setSelectedPesertaIds([...selectedPesertaIds, newId]);
                  }
                }

                setInlineNama('');
                setShowAddStudentModal(false);
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Penuh Murid <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Danish bin Halim"
                  value={inlineNama}
                  onChange={(e) => setInlineNama(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rumah Sukan</label>
                  <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-800">
                    Rumah {selectedRumah}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kelas</label>
                  <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-800">
                    {selectedKelas && selectedKelas !== 'SEMUA_KELAS'
                      ? selectedKelas
                      : `${selectedAcara?.tahunKelayakan[0] || 1} Arif`}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tahun</label>
                  <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-800">
                    {selectedAcara?.tahunKelayakan[0] === 0 ? 'Pra Sekolah' : `Tahun ${selectedAcara?.tahunKelayakan[0]}`}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jantina</label>
                  {selectedAcara?.kategoriJantina === 'Terbuka' ? (
                    <select
                      value={inlineJantina}
                      onChange={(e) => setInlineJantina(e.target.value as 'Lelaki' | 'Perempuan')}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
                    >
                      <option value="Lelaki">Lelaki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  ) : (
                    <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-800">
                      {selectedAcara?.kategoriJantina}
                    </div>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                Murid yang didaftarkan akan terus dipilih bagi acara ini dan dimasukkan ke dalam senarai Rumah {selectedRumah}.
              </p>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  Simpan & Pilih Murid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
