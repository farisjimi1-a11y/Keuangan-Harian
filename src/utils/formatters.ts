/**
 * Indonesian Currency and Date Formatting Utilities
 */

const MONTH_NAMES_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const MONTH_NAMES_SHORT_ID = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

const DAY_NAMES_ID = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

/**
 * Format number into Indonesian Rupiah (e.g., Rp25.000)
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp0';
  }
  const formatted = Math.round(Math.abs(amount))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${amount < 0 ? '-Rp' : 'Rp'}${formatted}`;
}

/**
 * Format number into compact Rupiah (e.g., Rp25 rb, Rp1,5 jt)
 */
export function formatRupiahCompact(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1_000_000_000) {
    const val = (abs / 1_000_000_000).toFixed(1).replace(/\.0$/, '');
    return `${sign}Rp${val.replace('.', ',')} M`;
  }
  if (abs >= 1_000_000) {
    const val = (abs / 1_000_000).toFixed(1).replace(/\.0$/, '');
    return `${sign}Rp${val.replace('.', ',')} jt`;
  }
  if (abs >= 1_000) {
    const val = (abs / 1_000).toFixed(0);
    return `${sign}Rp${val} rb`;
  }
  return formatRupiah(amount);
}

/**
 * Parse a raw string input into a number (strips non-digits)
 */
export function parseRawAmount(input: string): number {
  if (!input) return 0;
  const digits = input.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

/**
 * Formats a raw number string with thousands separators as user types
 */
export function formatInputAmount(input: string | number): string {
  const num = typeof input === 'number' ? input : parseRawAmount(input);
  if (!num) return '';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Get current Jakarta Date and Time
 */
export function getJakartaDateTime(dateObj: Date = new Date()): {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  fullFormattedDate: string; // 2 September 2026
} {
  // Use Intl with Asia/Jakarta timezone
  try {
    const formatterDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const formatterTime = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const dateStr = formatterDate.format(dateObj); // YYYY-MM-DD
    const timeStr = formatterTime.format(dateObj); // HH:mm

    const [yearStr, monthStr, dayStr] = dateStr.split('-');
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const year = parseInt(yearStr, 10);
    const fullFormattedDate = `${day} ${MONTH_NAMES_ID[month]} ${year}`;

    return {
      date: dateStr,
      time: timeStr,
      fullFormattedDate,
    };
  } catch {
    // Fallback to local
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    const h = String(dateObj.getHours()).padStart(2, '0');
    const min = String(dateObj.getMinutes()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    const timeStr = `${h}:${min}`;
    const fullFormattedDate = `${dateObj.getDate()} ${MONTH_NAMES_ID[dateObj.getMonth()]} ${y}`;
    return {
      date: dateStr,
      time: timeStr,
      fullFormattedDate,
    };
  }
}

/**
 * Format "YYYY-MM-DD" into Indonesian readable string (e.g. "2 September 2026")
 */
export function formatDateIndonesian(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  if (monthIdx >= 0 && monthIdx < 12) {
    return `${day} ${MONTH_NAMES_ID[monthIdx]} ${year}`;
  }
  return dateStr;
}

/**
 * Format "YYYY-MM-DD" into short Indonesian readable string (e.g. "2 Sep 2026")
 */
export function formatDateShort(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  if (monthIdx >= 0 && monthIdx < 12) {
    return `${day} ${MONTH_NAMES_SHORT_ID[monthIdx]} ${year}`;
  }
  return dateStr;
}

/**
 * Check if a date string is today or yesterday relative to Jakarta timezone
 */
export function getRelativeDayLabel(dateStr: string): string | null {
  const now = getJakartaDateTime();
  if (dateStr === now.date) {
    return 'Hari Ini';
  }

  // Check yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yestJakarta = getJakartaDateTime(yesterday);
  if (dateStr === yestJakarta.date) {
    return 'Kemarin';
  }

  return null;
}

/**
 * Get Indonesian Month & Year label (e.g., "September 2026")
 */
export function getMonthYearLabel(yearMonthStr: string): string {
  // Format: "YYYY-MM"
  const [year, month] = yearMonthStr.split('-');
  const mIdx = parseInt(month, 10) - 1;
  if (mIdx >= 0 && mIdx < 12) {
    return `${MONTH_NAMES_ID[mIdx]} ${year}`;
  }
  return yearMonthStr;
}
