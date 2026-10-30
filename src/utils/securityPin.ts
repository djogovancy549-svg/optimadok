/**
 * Utility untuk validasi PIN keamanan aksi hapus & otorisasi dinamis harian Dokumen.KU PBJ.
 * Aturan: DDMMYY-{suffix} (Tanggal, Bulan, 2 digit tahun terakhir + suffix seperti 'pbj', 'lgttd', atau 'lttd')
 * Contoh Tanggal Hari Ini: 30 Oktober 2026 -> 301026-pbj
 */

export interface PinParts {
  dd: string;
  mm: string;
  yy: string;
  fullYear: number;
  formattedDate: string;
}

/**
 * Mengembalikan bagian tanggal hari ini (prioritas Asia/Makassar - WITA / Nagekeo NTT).
 */
export function getTodayPinParts(date: Date = new Date()): PinParts {
  let dd = String(date.getDate()).padStart(2, '0');
  let mm = String(date.getMonth() + 1).padStart(2, '0');
  let yy = String(date.getFullYear()).slice(-2);
  let fullYear = date.getFullYear();
  let monthIdx = date.getMonth();

  try {
    const formatter = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Makassar',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const parts = formatter.formatToParts(date);
    const d = parts.find((p) => p.type === 'day')?.value;
    const m = parts.find((p) => p.type === 'month')?.value;
    const y = parts.find((p) => p.type === 'year')?.value;
    if (d && m && y) {
      dd = d.padStart(2, '0');
      mm = m.padStart(2, '0');
      yy = y.slice(-2);
      fullYear = parseInt(y, 10);
      monthIdx = parseInt(m, 10) - 1;
    }
  } catch (e) {
    console.warn('WITA timezone formatting fallback to local system time:', e);
  }

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const formattedDate = `${parseInt(dd, 10)} ${months[monthIdx]} ${fullYear}`;

  return { dd, mm, yy, fullYear, formattedDate };
}

/**
 * Mendapatkan PIN harian resmi HARI INI.
 */
export function getTodayPin(suffix: string = 'pbj', date: Date = new Date()): string {
  const { dd, mm, yy } = getTodayPinParts(date);
  return `${dd}${mm}${yy}-${suffix}`;
}

/**
 * Validasi KETAT PIN Harian:
 * - Hanya menerima PIN yang sesuai dengan TANGGAL HARI INI.
 * - Tanggal kemarin, besok, atau string hardcodedTIDAK AKAN DITERIMA.
 */
export function validateDailyPin(
  input: string,
  suffix: string = 'pbj',
  date: Date = new Date()
): boolean {
  if (!input) return false;
  const sanitized = input.trim().toLowerCase().replace(/\s+/g, '');

  // 1. PIN Resmi Hari Ini (Zona Waktu WITA / Nagekeo)
  const expectedWita = getTodayPin(suffix, date).toLowerCase().replace(/\s+/g, '');

  // 2. PIN Resmi Hari Ini (Zona Waktu Perangkat Peramban Lokal)
  const ddLocal = String(date.getDate()).padStart(2, '0');
  const mmLocal = String(date.getMonth() + 1).padStart(2, '0');
  const yyLocal = String(date.getFullYear()).slice(-2);
  const expectedLocal = `${ddLocal}${mmLocal}${yyLocal}-${suffix}`.toLowerCase().replace(/\s+/g, '');

  // Validasi Ketat: Hanya PIN Tanggal Hari Ini yang Lolos
  return sanitized === expectedWita || sanitized === expectedLocal;
}
