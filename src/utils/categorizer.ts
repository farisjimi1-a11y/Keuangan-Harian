import { CategoryName, TransactionType } from '../types';

export const ALL_CATEGORIES: CategoryName[] = [
  'Makanan',
  'Transportasi',
  'Belanja',
  'Rumah',
  'Tagihan',
  'Internet & Teknologi',
  'Hiburan',
  'Kesehatan',
  'Pendidikan',
  'Gaji',
  'Bisnis',
  'Bonus',
  'Penjualan',
  'Investasi',
  'Lainnya',
];

export const CATEGORY_DETAILS: Record<
  CategoryName,
  {
    icon: string;
    color: string;
    bgLight: string;
    textLight: string;
    defaultType: TransactionType;
  }
> = {
  Makanan: {
    icon: 'UtensilsCrossed',
    color: '#F97316',
    bgLight: 'bg-orange-50',
    textLight: 'text-orange-700',
    defaultType: 'expense',
  },
  Transportasi: {
    icon: 'Car',
    color: '#0284C7',
    bgLight: 'bg-sky-50',
    textLight: 'text-sky-700',
    defaultType: 'expense',
  },
  Belanja: {
    icon: 'ShoppingBag',
    color: '#EC4899',
    bgLight: 'bg-pink-50',
    textLight: 'text-pink-700',
    defaultType: 'expense',
  },
  Rumah: {
    icon: 'Home',
    color: '#8B5CF6',
    bgLight: 'bg-purple-50',
    textLight: 'text-purple-700',
    defaultType: 'expense',
  },
  Tagihan: {
    icon: 'Receipt',
    color: '#DC2626',
    bgLight: 'bg-rose-50',
    textLight: 'text-rose-700',
    defaultType: 'expense',
  },
  'Internet & Teknologi': {
    icon: 'Wifi',
    color: '#2563EB',
    bgLight: 'bg-blue-50',
    textLight: 'text-blue-700',
    defaultType: 'expense',
  },
  Hiburan: {
    icon: 'Gamepad2',
    color: '#D946EF',
    bgLight: 'bg-fuchsia-50',
    textLight: 'text-fuchsia-700',
    defaultType: 'expense',
  },
  Kesehatan: {
    icon: 'HeartPulse',
    color: '#10B981',
    bgLight: 'bg-emerald-50',
    textLight: 'text-emerald-700',
    defaultType: 'expense',
  },
  Pendidikan: {
    icon: 'GraduationCap',
    color: '#6366F1',
    bgLight: 'bg-indigo-50',
    textLight: 'text-indigo-700',
    defaultType: 'expense',
  },
  Gaji: {
    icon: 'Briefcase',
    color: '#059669',
    bgLight: 'bg-emerald-50',
    textLight: 'text-emerald-700',
    defaultType: 'income',
  },
  Bisnis: {
    icon: 'Building2',
    color: '#0D9488',
    bgLight: 'bg-teal-50',
    textLight: 'text-teal-700',
    defaultType: 'income',
  },
  Bonus: {
    icon: 'Gift',
    color: '#EAB308',
    bgLight: 'bg-yellow-50',
    textLight: 'text-yellow-800',
    defaultType: 'income',
  },
  Penjualan: {
    icon: 'Store',
    color: '#16A34A',
    bgLight: 'bg-green-50',
    textLight: 'text-green-700',
    defaultType: 'income',
  },
  Investasi: {
    icon: 'TrendingUp',
    color: '#0891B2',
    bgLight: 'bg-cyan-50',
    textLight: 'text-cyan-700',
    defaultType: 'income',
  },
  Lainnya: {
    icon: 'CircleDot',
    color: '#64748B',
    bgLight: 'bg-slate-50',
    textLight: 'text-slate-700',
    defaultType: 'expense',
  },
};

// Keyword mapping for automatic category detection
const CATEGORY_KEYWORDS: Record<CategoryName, string[]> = {
  Makanan: [
    'makan',
    'sarapan',
    'lunch',
    'dinner',
    'nasi',
    'mie',
    'ayam',
    'bakso',
    'baso',
    'soto',
    'sate',
    'kopi',
    'coffee',
    'cafe',
    'kafe',
    'snack',
    'jajan',
    'cemilan',
    'warteg',
    'padang',
    'resto',
    'restoran',
    'burger',
    'pizza',
    'martabak',
    'roti',
    'es krim',
    'gofood',
    'grabfood',
    'shopeefood',
    'minum',
    'boba',
    'teh',
    'jus',
    'kue',
    'pecel',
    'bebek',
    'gorengan',
  ],
  Transportasi: [
    'bensin',
    'pertalite',
    'pertamax',
    'solar',
    'spbu',
    'ojek',
    'gojek',
    'goride',
    'gocar',
    'grab',
    'grabride',
    'grabcar',
    'maxim',
    'inドライブ',
    'indrive',
    'parkir',
    'tol',
    'kereta',
    'krl',
    'mrt',
    'lrt',
    'bus',
    'transjakarta',
    'angkot',
    'taxi',
    'taksi',
    'tiket pesawat',
    'travel',
    'servis motor',
    'service mobil',
    'oli',
    'bengkel',
    'tambal ban',
    'cuci motor',
    'cuci mobil',
    'helm',
  ],
  Belanja: [
    'baju',
    'kaos',
    'celana',
    'kemeja',
    'jaket',
    'sepatu',
    'sandal',
    'tas',
    'dompet',
    'skincare',
    'serum',
    'sunscreen',
    'parfum',
    'make up',
    'kosmetik',
    'lipstik',
    'shopee',
    'tokopedia',
    'lazada',
    'tiktok shop',
    'indomaret',
    'alfamart',
    'superindo',
    'hypermart',
    'pasar',
    'mall',
    'belanja',
    'beli barang',
    'fashion',
    'aksesoris',
    'buku catatan',
  ],
  Rumah: [
    'kos',
    'kost',
    'kontrakan',
    'sewa rumah',
    'galon',
    'gas',
    'lpg',
    'elpiji',
    'aqua',
    'perabot',
    'kasur',
    'sprei',
    'sabun cuci',
    'rinso',
    'molto',
    'deterjen',
    'laundry',
    'kebersihan',
    'sampah',
    'iuran rt',
    'iuran warga',
    'satpam',
    'renovasi',
    'cat',
  ],
  Tagihan: [
    'listrik',
    'pln',
    'token listrik',
    'pdam',
    'air pdam',
    'bpjs',
    'pajak',
    'pbb',
    'cicilan',
    'kpr',
    'kartu kredit',
    'asuransi',
    'leasing',
    'paylater',
    'denda',
    'angsuran',
  ],
  'Internet & Teknologi': [
    'pulsa',
    'kuota',
    'paket data',
    'wifi',
    'internet',
    'indihome',
    'biznet',
    'first media',
    'myrepublic',
    'telkomsel',
    'indosat',
    'xl',
    'tri',
    'smartfren',
    'netflix',
    'spotify',
    'youtube',
    'disney',
    'icloud',
    'google one',
    'hosting',
    'domain',
    'software',
  ],
  Hiburan: [
    'bioskop',
    'xxi',
    'cgv',
    'cinepolis',
    'nonton',
    'game',
    'steam',
    'playstation',
    'topup ml',
    'diamond ml',
    'mobile legends',
    'valorant',
    'genshin',
    'liburan',
    'hotel',
    'staycation',
    'villa',
    'pantai',
    'karaoke',
    'konser',
    'tiket konser',
    'rekreasi',
    'wisata',
    'taman hiburan',
    'dufan',
  ],
  Kesehatan: [
    'obat',
    'apotek',
    'apotik',
    'dokter',
    'klinik',
    'rumah sakit',
    'rs',
    'puskesmas',
    'vitamin',
    'suplemen',
    'periksa',
    'gigi',
    'tambal gigi',
    'kacamata',
    'optik',
    'vaksin',
    'rapid',
    'swab',
    'medical',
    'fisioterapi',
    'minyak kayu putih',
    'tolak angin',
    'panadol',
  ],
  Pendidikan: [
    'spp',
    'sekolah',
    'ukt',
    'kuliah',
    'buku pelajaran',
    'les',
    'kursus',
    'bimbel',
    'seminar',
    'workshop',
    'ujian',
    'pendaftaran',
    'wisuda',
    'alat tulis',
    'fotocopy materi',
  ],
  Gaji: [
    'gaji',
    'salary',
    'upah',
    'payroll',
    'honor',
    'gajian',
    'uang bulanan',
    'tunjangan',
    'slip gaji',
  ],
  Bisnis: [
    'omset',
    'omzet',
    'proyek',
    'project',
    'klien',
    'client',
    'invoice',
    'freelance',
    'kerjaan lepas',
    'modal usaha',
    'profit',
    'keuntungan',
    'komisi',
  ],
  Bonus: [
    'bonus',
    'thr',
    'reward',
    'hadiah',
    'cashback',
    'angpao',
    'insentif',
    'tip',
    'sawer',
    'giveaway',
  ],
  Penjualan: [
    'jual',
    'penjualan',
    'laku',
    'orderan',
    'dagangan',
    'preloved',
    'thrift',
    'jualan',
    'toko',
    'hasil jual',
  ],
  Investasi: [
    'investasi',
    'saham',
    'reksadana',
    'crypto',
    'bitcoin',
    'btc',
    'eth',
    'emas',
    'logam mulia',
    'bibit',
    'bareksa',
    'ajaib',
    'deposito',
    'dividen',
    'bunga bank',
  ],
  Lainnya: [],
};

// Keywords that strongly signal transaction type
const INCOME_KEYWORDS = [
  'gaji',
  'jual',
  'penjualan',
  'bonus',
  'thr',
  'terima',
  'dapat',
  'transfer masuk',
  'masuk',
  'upah',
  'honor',
  'cashback',
  'dividen',
  'profit',
  'komisi',
  'laku',
  'orderan',
  'hadiah',
  'uang masuk',
  'income',
];

const EXPENSE_KEYWORDS = [
  'beli',
  'bayar',
  'makan',
  'bensin',
  'jajan',
  'ngopi',
  'pulsa',
  'listrik',
  'tagihan',
  'sewa',
  'kos',
  'belanja',
  'tiket',
  'parkir',
  'obat',
  'donasi',
  'uang keluar',
  'keluar',
  'expense',
];

/**
 * Automatically detects category from transaction description
 */
export function detectCategory(
  description: string,
  type: TransactionType = 'expense'
): CategoryName {
  if (!description || !description.trim()) {
    return type === 'income' ? 'Gaji' : 'Lainnya';
  }

  const normalized = description.toLowerCase().trim();

  // If transaction is income, prioritize income categories
  if (type === 'income') {
    if (CATEGORY_KEYWORDS.Gaji.some((kw) => normalized.includes(kw))) return 'Gaji';
    if (CATEGORY_KEYWORDS.Penjualan.some((kw) => normalized.includes(kw))) return 'Penjualan';
    if (CATEGORY_KEYWORDS.Bonus.some((kw) => normalized.includes(kw))) return 'Bonus';
    if (CATEGORY_KEYWORDS.Bisnis.some((kw) => normalized.includes(kw))) return 'Bisnis';
    if (CATEGORY_KEYWORDS.Investasi.some((kw) => normalized.includes(kw))) return 'Investasi';
  }

  // General check across all categories
  for (const [catName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      // Word boundary or inclusion check
      if (normalized.includes(kw)) {
        return catName as CategoryName;
      }
    }
  }

  // Fallback defaults
  if (type === 'income') return 'Lainnya';
  return 'Lainnya';
}

/**
 * Parse a one-line quick input string like:
 * - "25000 makan siang"
 * - "50000 bensin"
 * - "500000 jual kaos"
 * - "+ 100000 bonus"
 * - "- 15000 es teh"
 */
export interface ParsedQuickInput {
  amount: number;
  type: TransactionType;
  description: string;
  category: CategoryName;
  isAmbiguousType?: boolean;
}

export function parseQuickInput(input: string): ParsedQuickInput | null {
  if (!input || !input.trim()) return null;

  const trimmed = input.trim();
  let explicitType: TransactionType | null = null;
  let workingText = trimmed;

  // Check prefix "+" or "-" or explicit keywords
  if (workingText.startsWith('+')) {
    explicitType = 'income';
    workingText = workingText.slice(1).trim();
  } else if (workingText.startsWith('-')) {
    explicitType = 'expense';
    workingText = workingText.slice(1).trim();
  }

  // Look for amount pattern at start or end
  // E.g.: "25000 makan siang", "25.000 makan siang", "25k makan siang", "25rb makan siang", "makan siang 25000"
  let amount = 0;
  let description = '';

  // Case 1: Amount at beginning: "25000 makan siang" or "25rb makan siang"
  const startMatch = workingText.match(
    /^(\d+(?:[.,]\d+)?\s*(?:k|rb|ribu|jt|juta)?)\s+(.*)$/i
  );

  // Case 2: Amount at end: "makan siang 25000" or "makan siang 25rb"
  const endMatch = workingText.match(
    /^(.*?)\s+(\d+(?:[.,]\d+)?\s*(?:k|rb|ribu|jt|juta)?)$/i
  );

  // Case 3: Just a number: "25000"
  const onlyNumberMatch = workingText.match(
    /^(\d+(?:[.,]\d+)?\s*(?:k|rb|ribu|jt|juta)?)$/i
  );

  if (startMatch) {
    amount = parseCompactNumberString(startMatch[1]);
    description = startMatch[2].trim();
  } else if (endMatch) {
    amount = parseCompactNumberString(endMatch[2]);
    description = endMatch[1].trim();
  } else if (onlyNumberMatch) {
    amount = parseCompactNumberString(onlyNumberMatch[1]);
    description = '';
  } else {
    // Attempt extracting first sequence of digits
    const generalDigitsMatch = workingText.match(/\d+/);
    if (generalDigitsMatch) {
      amount = parseInt(generalDigitsMatch[0], 10);
      description = workingText.replace(generalDigitsMatch[0], '').trim();
    } else {
      return null;
    }
  }

  if (amount <= 0) return null;

  // Determine transaction type
  const lowerDesc = description.toLowerCase();
  let type: TransactionType = 'expense'; // Default to expense as per typical daily tracker
  let isAmbiguous = false;

  if (explicitType) {
    type = explicitType;
  } else {
    const hasIncomeKw = INCOME_KEYWORDS.some((kw) => lowerDesc.includes(kw));
    const hasExpenseKw = EXPENSE_KEYWORDS.some((kw) => lowerDesc.includes(kw));

    if (hasIncomeKw && !hasExpenseKw) {
      type = 'income';
    } else if (hasExpenseKw && !hasIncomeKw) {
      type = 'expense';
    } else {
      // If no description or no explicit signal, default to expense but flag as ambiguous
      type = 'expense';
      if (!description) {
        isAmbiguous = true;
      }
    }
  }

  const category = detectCategory(description, type);

  return {
    amount,
    type,
    description: description || (type === 'income' ? 'Uang Masuk' : 'Pengeluaran'),
    category,
    isAmbiguousType: isAmbiguous,
  };
}

function parseCompactNumberString(str: string): number {
  const cleaned = str.toLowerCase().replace(/\s+/g, '').replace(/rp/g, '');
  if (cleaned.endsWith('jt') || cleaned.endsWith('juta')) {
    const val = parseFloat(cleaned.replace(/(jt|juta)/g, '').replace(/,/g, '.'));
    return Math.round((val || 0) * 1_000_000);
  }
  if (cleaned.endsWith('k') || cleaned.endsWith('rb') || cleaned.endsWith('ribu')) {
    const val = parseFloat(cleaned.replace(/(k|rb|ribu)/g, '').replace(/,/g, '.'));
    return Math.round((val || 0) * 1_000);
  }
  // Standard number with optional thousand separator dots
  const digits = cleaned.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
}
