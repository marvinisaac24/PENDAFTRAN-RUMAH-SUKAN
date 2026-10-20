import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MssrAgeGroup, MssrGender, MSSR_COLUMNS, MssrParticipantRowData } from '../components/OfficialMssrFormModal';
import { RumahSukan } from '../types';

export interface GenerateMssrPdfOptions {
  schoolName?: string;
  houseName: string;
  ageGroup: MssrAgeGroup;
  gender: MssrGender;
  displayRows: { bil: number; isEmpty: boolean; data: MssrParticipantRowData }[];
  locationInfo?: string;
  eventDates?: string;
}

/**
 * Format label Kategori rasmi MSSR (9TKB, 10TKB, 11TKB, 12TKB).
 * Mengelakkan label seperti 'SEMUA SEMUA'.
 */
export function formatMssrKategori(ageGroup: MssrAgeGroup, gender: MssrGender): string {
  let ageLabel = '';
  switch (ageGroup) {
    case '9TKB':
      ageLabel = '9TKB';
      break;
    case '10TKB':
      ageLabel = '10TKB';
      break;
    case '11TKB':
      ageLabel = '11TKB';
      break;
    case '12TKB':
      ageLabel = '12TKB';
      break;
    case 'SEMUA':
    default:
      ageLabel = '9TKB 10TKB 11TKB 12TKB';
      break;
  }

  if (gender === 'Lelaki') {
    return `${ageLabel} (LELAKI)`;
  }
  if (gender === 'Perempuan') {
    return `${ageLabel} (PEREMPUAN)`;
  }
  return ageLabel;
}

/**
 * Menjana dan memuat turun fail PDF Landskap bagi Borang Pendaftaran Rasmi MSSR 2026.
 * Menggunakan format A4 Landskap (297mm x 210mm) dengan susun atur rasmi kejohanan.
 */
export function generateMssrLandscapePdf(options: GenerateMssrPdfOptions) {
  const {
    schoolName = 'SEKOLAH KEBANGSAAN TUDAN',
    houseName,
    ageGroup,
    gender,
    displayRows,
    locationInfo = 'MSSR Bahagian Miri • Zon Bandar',
    eventDates = '10 NOVEMBER 2026 DAN 11 NOVEMBER 2026',
  } = options;

  // Cipta dokumen A4 Landskap
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 297mm
  const marginX = 10;
  let currentY = 10;

  // 1. Header Borang Rasmi
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(0, 0, 0);
  doc.text('BORANG PENDAFTARAN KONTINGEN BALAPAN DAN PADANG MSSR 2026', pageWidth / 2, currentY, { align: 'center' });

  currentY += 4.5;
  doc.setFontSize(10.5);
  doc.text(eventDates.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });

  currentY += 4;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.text('( SILA TANDAKAN X UNTUK ACARA YANG ANDA INGIN DAFTAR – PESERTA SIMPANAN TANDAKAN (S) )', pageWidth / 2, currentY, { align: 'center' });

  currentY += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('SETIAP ACARA INDIVIDU HANYA BOLEH DAFTAR DUA PESERTA.', pageWidth / 2, currentY, { align: 'center' });

  currentY += 3.8;
  doc.text('(12&11TKB) ACARA INDIVIDU = 2, ACARA RELAY = 2 ) (10TKB: 2 INDIVIDU: 1 RELAY)', pageWidth / 2, currentY, { align: 'center' });

  currentY += 3.5;

  // Garisan pemisah atas maklumat
  doc.setLineWidth(0.4);
  doc.setDrawColor(0, 0, 0);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);

  currentY += 4;

  // 2. Maklumat Sekolah, Kumpulan & Kategori
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);

  const kumpulanLabel = houseName === 'SEMUA' ? 'KONTINGEN KESELURUHAN' : `RUMAH ${houseName.toUpperCase()}`;
  const kategoriLabel = formatMssrKategori(ageGroup, gender);

  // Kiri
  doc.text(`NAMA SEKOLAH :  ${schoolName.toUpperCase()}`, marginX, currentY);
  doc.text(`KUMPULAN         :  ${kumpulanLabel}`, marginX, currentY + 4.5);

  // Kanan
  doc.text(`Kategori :  ${kategoriLabel}`, pageWidth - marginX - 80, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(locationInfo, pageWidth - marginX - 80, currentY + 4.5);

  currentY += 7;

  // Garisan pemisah bawah maklumat
  doc.line(marginX, currentY, pageWidth - marginX, currentY);
  currentY += 2;

  // 3. Persediaan Kolum Jadual
  // Baris Header 1 (Bil, No Peserta, Nama, Tarikh Lahir, No. Pengenalan, Acara)
  const headRow1: any[] = [
    { content: 'Bil', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
    { content: 'Nombor Peserta', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
    { content: 'Nama Peserta', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
    { content: 'Tarikh Lahir', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
    { content: 'No. Pengenalan', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
    { content: 'Acara', colSpan: 10, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold' } },
  ];

  // Baris Header 2 (10 Acara MSSR)
  const headRow2: any[] = MSSR_COLUMNS.map((col) => {
    const isShaded = col.isShadedFor(ageGroup);
    return {
      content: col.sublabel ? `${col.label}\n${col.sublabel}` : col.label,
      styles: {
        halign: 'center',
        valign: 'middle',
        fillColor: isShaded ? [71, 85, 105] : [248, 250, 252], // Shaded slate jika tidak berkenaan
        textColor: isShaded ? [255, 255, 255] : [0, 0, 0],
        fontSize: 8.5,
      },
    };
  });

  // Baris Data Peserta
  const bodyRows: any[] = displayRows.map((row) => {
    const p = row.data;
    const nameContent =
      p.acaraLain && p.acaraLain.length > 0 && Object.keys(p.eventTicks || {}).length === 0
        ? `${p.nama || ''}\n[${p.acaraLain.join(', ')}]`
        : p.nama || '';

    const rowCells: any[] = [
      { content: String(row.bil), styles: { halign: 'center', fontStyle: 'bold' } },
      { content: p.idPeserta || '', styles: { halign: 'center', fontStyle: 'bold' } },
      { content: nameContent, styles: { halign: 'left', fontStyle: 'bold' } },
      { content: p.tarikhLahir || '', styles: { halign: 'center' } },
      { content: p.noPengenalan || p.noSijilLahir || '', styles: { halign: 'center' } },
    ];

    // Masukkan tanda 10 acara
    MSSR_COLUMNS.forEach((col) => {
      const isShaded = col.isShadedFor(ageGroup);
      const mark = p.eventTicks[col.id] || '';

      if (isShaded) {
        rowCells.push({
          content: '',
          styles: {
            fillColor: [71, 85, 105], // Gelap / Shaded
            halign: 'center',
          },
        });
      } else {
        rowCells.push({
          content: mark,
          styles: {
            halign: 'center',
            fontStyle: 'bold',
            fontSize: mark === 'X' ? 11.5 : 9,
            textColor: mark === '(S)' ? [49, 46, 129] : [0, 0, 0],
          },
        });
      }
    });

    return rowCells;
  });

  // Bina Jadual autoTable dengan saiz font yang lebih besar dan jelas dibaca
  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX, bottom: 25 },
    head: [headRow1, headRow2],
    body: bodyRows,
    theme: 'grid',
    styles: {
      lineWidth: 0.25,
      lineColor: [0, 0, 0],
      textColor: [0, 0, 0],
      fontSize: 9.2,
      cellPadding: 1.5,
      minCellHeight: 6.8,
      overflow: 'ellipsize',
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 8.8,
      lineWidth: 0.25,
      lineColor: [0, 0, 0],
    },
    columnStyles: {
      0: { cellWidth: 9 },   // Bil
      1: { cellWidth: 23 },  // Nombor Peserta
      2: { cellWidth: 67 },  // Nama Peserta
      3: { cellWidth: 20 },  // Tarikh Lahir
      4: { cellWidth: 28 },  // No. Pengenalan
      // 10 Acara MSSR: masing-masing 13mm = 130mm
      5: { cellWidth: 13 },
      6: { cellWidth: 13 },
      7: { cellWidth: 13 },
      8: { cellWidth: 13 },
      9: { cellWidth: 13 },
      10: { cellWidth: 13 },
      11: { cellWidth: 13 },
      12: { cellWidth: 13 },
      13: { cellWidth: 13 },
      14: { cellWidth: 13 },
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || currentY + 90;

  // Pastikan ruangan tandatangan muat, jika tidak tambah halaman baru
  const pageHeight = doc.internal.pageSize.getHeight(); // 210mm
  let signY = finalY + 4;

  if (signY + 28 > pageHeight) {
    doc.addPage('a4', 'landscape');
    signY = 15;
  }

  // Nota kaki
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(0, 0, 0);
  doc.text('* P/S: Sila isi dengan huruf besar', marginX, signY);

  signY += 12;

  // 4. Ruangan Tandatangan & Pengesahan Rasmi (3 Kolum: Guru Besar, Cop Sekolah, Ketua Jurulatih)
  const col1X = marginX + 35;
  const col2X = pageWidth / 2;
  const col3X = pageWidth - marginX - 35;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  // Kiri: Pengesahan Guru Besar
  doc.text('( ______________________________________ )', col1X, signY, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('Pengesahan Guru Besar', col1X, signY + 4.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(schoolName, col1X, signY + 8, { align: 'center' });

  // Tengah: Cop Sekolah
  doc.setLineWidth(0.3);
  doc.line(col2X - 20, signY - 2, col2X + 20, signY - 2);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Cop Sekolah', col2X, signY + 3, { align: 'center' });

  // Kanan: Tandatangan Ketua Jurulatih
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('( ______________________________________ )', col3X, signY, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('Tandatangan Ketua Jurulatih', col3X, signY + 4.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Pengurus Pasukan Olahraga', col3X, signY + 8, { align: 'center' });

  // Muat turun fail PDF dengan nama fail yang terperinci
  const safeHouse = houseName.replace(/\s+/g, '_');
  const fileName = `Borang_MSSR_2026_${gender}_${ageGroup}_${safeHouse}_LANDSCAPE.pdf`;
  doc.save(fileName);
}

/**
 * Menjana berkas PDF Landskap lengkap untuk SEMUA kategori (12TKB, 11TKB, 10TKB, 9TKB)
 * dan kedua-dua Jantina (Lelaki & Perempuan) dalam satu fail PDF berhalaman kemas.
 */
export function generateFullMssrTournamentPdfBundle(options: {
  schoolName?: string;
  houseName: string;
  allRowsByFilter: Array<{
    ageGroup: MssrAgeGroup;
    gender: MssrGender;
    rows: { bil: number; isEmpty: boolean; data: MssrParticipantRowData }[];
  }>;
}) {
  const {
    schoolName = 'SEKOLAH KEBANGSAAN TUDAN',
    houseName,
    allRowsByFilter,
  } = options;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 10;

  allRowsByFilter.forEach((group, pageIndex) => {
    if (pageIndex > 0) {
      doc.addPage('a4', 'landscape');
    }

    let currentY = 10;

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text('BORANG PENDAFTARAN KONTINGEN BALAPAN DAN PADANG MSSR 2026', pageWidth / 2, currentY, { align: 'center' });

    currentY += 4.5;
    doc.setFontSize(9.5);
    doc.text('10 NOVEMBER 2026 DAN 11 NOVEMBER 2026', pageWidth / 2, currentY, { align: 'center' });

    currentY += 4;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text('( SILA TANDAKAN X UNTUK ACARA YANG ANDA INGIN DAFTAR – PESERTA SIMPANAN TANDAKAN (S) )', pageWidth / 2, currentY, { align: 'center' });

    currentY += 3.8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('SETIAP ACARA INDIVIDU HANYA BOLEH DAFTAR DUA PESERTA.', pageWidth / 2, currentY, { align: 'center' });

    currentY += 3.5;
    doc.text('(12&11TKB) ACARA INDIVIDU = 2, ACARA RELAY = 2 ) (10TKB: 2 INDIVIDU: 1 RELAY)', pageWidth / 2, currentY, { align: 'center' });

    currentY += 3.5;
    doc.setLineWidth(0.4);
    doc.line(marginX, currentY, pageWidth - marginX, currentY);

    currentY += 4;

    // Maklumat
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    const kumpulanLabel = houseName === 'SEMUA' ? 'KONTINGEN KESELURUHAN' : `RUMAH ${houseName.toUpperCase()}`;
    const kategoriLabel = formatMssrKategori(group.ageGroup, group.gender);

    doc.text(`NAMA SEKOLAH :  ${schoolName.toUpperCase()}`, marginX, currentY);
    doc.text(`KUMPULAN         :  ${kumpulanLabel}`, marginX, currentY + 4.5);

    doc.text(`Kategori :  ${kategoriLabel}`, pageWidth - marginX - 80, currentY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('MSSR Bahagian Miri • Zon Bandar', pageWidth - marginX - 80, currentY + 4.5);

    currentY += 7;
    doc.line(marginX, currentY, pageWidth - marginX, currentY);
    currentY += 2;

    // Jadual
    const headRow1: any[] = [
      { content: 'Bil', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      { content: 'Nombor Peserta', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      { content: 'Nama Peserta', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      { content: 'Tarikh Lahir', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      { content: 'No. Pengenalan', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      { content: 'Acara', colSpan: 10, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold' } },
    ];

    const headRow2: any[] = MSSR_COLUMNS.map((col) => {
      const isShaded = col.isShadedFor(group.ageGroup);
      return {
        content: col.sublabel ? `${col.label}\n${col.sublabel}` : col.label,
        styles: {
          halign: 'center',
          valign: 'middle',
          fillColor: isShaded ? [71, 85, 105] : [248, 250, 252],
          textColor: isShaded ? [255, 255, 255] : [0, 0, 0],
          fontSize: 8.5,
        },
      };
    });

    const bodyRows: any[] = group.rows.map((row) => {
      const p = row.data;
      const nameContent =
        p.acaraLain && p.acaraLain.length > 0 && Object.keys(p.eventTicks || {}).length === 0
          ? `${p.nama || ''}\n[${p.acaraLain.join(', ')}]`
          : p.nama || '';

      const rowCells: any[] = [
        { content: String(row.bil), styles: { halign: 'center', fontStyle: 'bold' } },
        { content: p.idPeserta || '', styles: { halign: 'center', fontStyle: 'bold' } },
        { content: nameContent, styles: { halign: 'left', fontStyle: 'bold' } },
        { content: p.tarikhLahir || '', styles: { halign: 'center' } },
        { content: p.noPengenalan || p.noSijilLahir || '', styles: { halign: 'center' } },
      ];

      MSSR_COLUMNS.forEach((col) => {
        const isShaded = col.isShadedFor(group.ageGroup);
        const mark = p.eventTicks[col.id] || '';

        if (isShaded) {
          rowCells.push({
            content: '',
            styles: { fillColor: [71, 85, 105], halign: 'center' },
          });
        } else {
          rowCells.push({
            content: mark,
            styles: {
              halign: 'center',
              fontStyle: 'bold',
              fontSize: mark === 'X' ? 11.5 : 9,
              textColor: mark === '(S)' ? [49, 46, 129] : [0, 0, 0],
            },
          });
        }
      });

      return rowCells;
    });

    autoTable(doc, {
      startY: currentY,
      margin: { left: marginX, right: marginX, bottom: 25 },
      head: [headRow1, headRow2],
      body: bodyRows,
      theme: 'grid',
      styles: {
        lineWidth: 0.25,
        lineColor: [0, 0, 0],
        textColor: [0, 0, 0],
        fontSize: 9.2,
        cellPadding: 1.5,
        minCellHeight: 6.8,
      },
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: 8.8,
      },
      columnStyles: {
        0: { cellWidth: 9 },
        1: { cellWidth: 23 },
        2: { cellWidth: 67 },
        3: { cellWidth: 20 },
        4: { cellWidth: 28 },
        5: { cellWidth: 13 },
        6: { cellWidth: 13 },
        7: { cellWidth: 13 },
        8: { cellWidth: 13 },
        9: { cellWidth: 13 },
        10: { cellWidth: 13 },
        11: { cellWidth: 13 },
        12: { cellWidth: 13 },
        13: { cellWidth: 13 },
        14: { cellWidth: 13 },
      },
    });

    const finalY = (doc as any).lastAutoTable?.finalY || currentY + 80;
    let signY = finalY + 4;

    if (signY + 28 > pageHeight) {
      doc.addPage('a4', 'landscape');
      signY = 15;
    }

    // Nota kaki
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.text('* P/S: Sila isi dengan huruf besar', marginX, signY);

    signY += 12;

    const col1X = marginX + 35;
    const col2X = pageWidth / 2;
    const col3X = pageWidth - marginX - 35;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('( ______________________________________ )', col1X, signY, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text('Pengesahan Guru Besar', col1X, signY + 4.5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(schoolName, col1X, signY + 8, { align: 'center' });

    doc.setLineWidth(0.3);
    doc.line(col2X - 20, signY - 2, col2X + 20, signY - 2);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Cop Sekolah', col2X, signY + 3, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('( ______________________________________ )', col3X, signY, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text('Tandatangan Ketua Jurulatih', col3X, signY + 4.5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('Pengurus Pasukan Olahraga', col3X, signY + 8, { align: 'center' });
  });

  const safeHouse = houseName.replace(/\s+/g, '_');
  const fileName = `Borang_Lengkap_MSSR_2026_Semua_Kategori_${safeHouse}_LANDSCAPE.pdf`;
  doc.save(fileName);
}
