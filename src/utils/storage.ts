import { FinancialSummary, Transaction } from '../types';
import { getJakartaDateTime } from './formatters';
import { getActiveSession } from './auth';

const LEGACY_STORAGE_KEY = 'keuangan_harian_transaksi_v1';
const LEGACY_INITIALIZED_KEY = 'keuangan_harian_initialized_v1';

export function getStorageKey(userId?: string): string {
  const activeId = userId || getActiveSession()?.user?.id;
  if (activeId) {
    return `keuangan_harian_trx_user_${activeId}`;
  }
  return LEGACY_STORAGE_KEY;
}

export function getInitializedKey(userId?: string): string {
  const activeId = userId || getActiveSession()?.user?.id;
  if (activeId) {
    return `keuangan_harian_init_user_${activeId}`;
  }
  return LEGACY_INITIALIZED_KEY;
}

/**
 * Generate initial sample transactions with fixed dates
 */
function createSampleTransactions(): Transaction[] {
  const now = getJakartaDateTime();
  const today = now.date;
  const currentTime = now.time;

  const d = new Date();
  const yesterdayDateObj = new Date(d);
  yesterdayDateObj.setDate(yesterdayDateObj.getDate() - 1);
  const yesterday = getJakartaDateTime(yesterdayDateObj).date;

  const threeDaysAgoObj = new Date(d);
  threeDaysAgoObj.setDate(threeDaysAgoObj.getDate() - 3);
  const threeDaysAgo = getJakartaDateTime(threeDaysAgoObj).date;

  const fiveDaysAgoObj = new Date(d);
  fiveDaysAgoObj.setDate(fiveDaysAgoObj.getDate() - 5);
  const fiveDaysAgo = getJakartaDateTime(fiveDaysAgoObj).date;

  return [
    {
      id: 'trx_init_1',
      type: 'income',
      amount: 5000000,
      description: 'Gaji Bulanan',
      category: 'Gaji',
      date: today,
      time: '09:00',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'trx_init_2',
      type: 'expense',
      amount: 25000,
      description: 'Makan siang',
      category: 'Makanan',
      date: today,
      time: currentTime || '12:30',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'trx_init_3',
      type: 'expense',
      amount: 50000,
      description: 'Bensin motor',
      category: 'Transportasi',
      date: yesterday,
      time: '08:15',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'trx_init_4',
      type: 'income',
      amount: 250000,
      description: 'Jual barang bekas',
      category: 'Penjualan',
      date: threeDaysAgo,
      time: '14:20',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'trx_init_5',
      type: 'expense',
      amount: 150000,
      description: 'Belanja mingguan pasar',
      category: 'Belanja',
      date: fiveDaysAgo,
      time: '07:45',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
  ];
}

/**
 * Get all stored transactions for user (keeps data permanent and persistent)
 */
export function getStoredTransactions(userId?: string): Transaction[] {
  try {
    const storageKey = getStorageKey(userId);
    const initKey = getInitializedKey(userId);

    const raw = localStorage.getItem(storageKey);
    const initialized = localStorage.getItem(initKey);

    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }

    // Check if migrating legacy data to a newly logged in user
    if (!initialized) {
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        try {
          const legacyParsed = JSON.parse(legacyRaw);
          if (Array.isArray(legacyParsed) && legacyParsed.length > 0) {
            saveStoredTransactions(legacyParsed, userId);
            localStorage.setItem(initKey, 'true');
            return legacyParsed;
          }
        } catch {
          // ignore
        }
      }

      // If this is the demo account or initial visit without account
      const activeId = userId || getActiveSession()?.user?.id;
      if (!activeId || activeId === 'usr_default_faris') {
        const sample = createSampleTransactions();
        saveStoredTransactions(sample, userId);
        localStorage.setItem(initKey, 'true');
        return sample;
      }

      // New registered user starts with a clean slate
      saveStoredTransactions([], userId);
      localStorage.setItem(initKey, 'true');
      return [];
    }

    return [];
  } catch (err) {
    console.error('Error reading transactions from storage:', err);
    return [];
  }
}

/**
 * Save transactions to user-scoped localStorage
 */
export function saveStoredTransactions(transactions: Transaction[], userId?: string): void {
  try {
    const storageKey = getStorageKey(userId);
    localStorage.setItem(storageKey, JSON.stringify(transactions));
  } catch (err) {
    console.error('Error saving transactions to storage:', err);
  }
}

/**
 * Add a new transaction
 */
export function addTransaction(
  data: {
    type: 'income' | 'expense';
    amount: number;
    description?: string;
    category?: string;
    date?: string;
    time?: string;
  },
  userId?: string
): Transaction {
  const now = getJakartaDateTime();
  const currentIso = new Date().toISOString();

  const newTransaction: Transaction = {
    id: `trx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type: data.type,
    amount: Math.abs(Math.round(data.amount)),
    description: data.description?.trim() || (data.type === 'income' ? 'Uang Masuk' : 'Pengeluaran'),
    category: data.category || 'Lainnya',
    date: data.date || now.date,
    time: data.time || now.time,
    createdAt: currentIso,
    updatedAt: currentIso,
  };

  const list = getStoredTransactions(userId);
  const updated = [newTransaction, ...list];
  saveStoredTransactions(updated, userId);
  return newTransaction;
}

/**
 * Update an existing transaction
 */
export function updateTransaction(transaction: Transaction, userId?: string): Transaction {
  const currentIso = new Date().toISOString();
  const updatedTrx: Transaction = {
    ...transaction,
    amount: Math.abs(Math.round(transaction.amount)),
    updatedAt: currentIso,
  };

  const list = getStoredTransactions(userId);
  const idx = list.findIndex((t) => t.id === transaction.id);
  if (idx !== -1) {
    list[idx] = updatedTrx;
    saveStoredTransactions(list, userId);
  }
  return updatedTrx;
}

/**
 * Delete transaction by ID
 */
export function deleteTransaction(id: string, userId?: string): boolean {
  const list = getStoredTransactions(userId);
  const filtered = list.filter((t) => t.id !== id);
  if (filtered.length !== list.length) {
    saveStoredTransactions(filtered, userId);
    return true;
  }
  return false;
}


/**
 * Calculate dynamic financial summaries (never stored statically)
 */
export function calculateSummary(transactions: Transaction[]): FinancialSummary {
  const now = getJakartaDateTime();
  const todayStr = now.date;
  const currentYearMonth = now.date.substring(0, 7); // "YYYY-MM"

  let totalIncome = 0;
  let totalExpense = 0;
  let todayIncome = 0;
  let todayExpense = 0;
  let monthIncome = 0;
  let monthExpense = 0;

  for (const trx of transactions) {
    const amt = Number(trx.amount) || 0;
    if (trx.type === 'income') {
      totalIncome += amt;
      if (trx.date === todayStr) {
        todayIncome += amt;
      }
      if (trx.date.startsWith(currentYearMonth)) {
        monthIncome += amt;
      }
    } else {
      totalExpense += amt;
      if (trx.date === todayStr) {
        todayExpense += amt;
      }
      if (trx.date.startsWith(currentYearMonth)) {
        monthExpense += amt;
      }
    }
  }

  const currentBalance = totalIncome - totalExpense;
  const monthNet = monthIncome - monthExpense;

  return {
    totalIncome,
    totalExpense,
    currentBalance,
    todayIncome,
    todayExpense,
    monthIncome,
    monthExpense,
    monthNet,
  };
}

/**
 * Export transactions to CSV file
 */
export function exportToCSV(transactions: Transaction[]): void {
  const headers = ['ID', 'Tanggal', 'Jam', 'Jenis', 'Kategori', 'Keterangan', 'Nominal (IDR)'];
  const rows = transactions.map((t) => [
    t.id,
    t.date,
    t.time,
    t.type === 'income' ? 'Uang Masuk' : 'Uang Keluar',
    `"${(t.category || '').replace(/"/g, '""')}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.amount,
  ]);

  const csvContent =
    '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');

  downloadBlob(
    new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }),
    `keuangan_harian_${getJakartaDateTime().date}.csv`
  );
}

/**
 * Export transactions to Excel-formatted CSV file (semicolon delimited for Indonesian/European Excel)
 */
export function exportToExcelCSV(transactions: Transaction[]): void {
  const headers = ['ID', 'Tanggal', 'Jam', 'Jenis', 'Kategori', 'Keterangan', 'Nominal (IDR)'];
  const rows = transactions.map((t) => [
    t.id,
    t.date,
    t.time,
    t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    `"${(t.category || '').replace(/"/g, '""')}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.amount,
  ]);

  const csvContent =
    '\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\r\n');

  downloadBlob(
    new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }),
    `keuangan_harian_excel_${getJakartaDateTime().date}.csv`
  );
}

/**
 * Export backup as JSON
 */
export function exportBackupJSON(transactions: Transaction[]): void {
  const payload = {
    appName: 'Keuangan Harian',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    transactionCount: transactions.length,
    transactions,
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  downloadBlob(
    new Blob([jsonStr], { type: 'application/json' }),
    `backup_keuangan_harian_${getJakartaDateTime().date}.json`
  );
}

/**
 * Import and validate transactions from JSON file content
 */
export function importFromJSON(
  jsonString: string,
  mode: 'replace' | 'merge' = 'merge',
  userId?: string
): { success: boolean; count: number; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    let list: any[] = [];

    if (Array.isArray(data)) {
      list = data;
    } else if (data && Array.isArray(data.transactions)) {
      list = data.transactions;
    } else {
      return { success: false, count: 0, error: 'Format file backup tidak dikenali.' };
    }

    const validated: Transaction[] = [];
    for (const item of list) {
      if (
        item &&
        typeof item.amount === 'number' &&
        (item.type === 'income' || item.type === 'expense')
      ) {
        validated.push({
          id: item.id || `trx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          type: item.type,
          amount: Math.abs(Math.round(item.amount)),
          description: String(item.description || '').trim(),
          category: String(item.category || 'Lainnya'),
          date: item.date || getJakartaDateTime().date,
          time: item.time || getJakartaDateTime().time,
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
        });
      }
    }

    if (validated.length === 0) {
      return { success: false, count: 0, error: 'Tidak ada transaksi valid yang ditemukan di file.' };
    }

    let finalTransactions: Transaction[] = [];
    if (mode === 'replace') {
      finalTransactions = validated;
    } else {
      const existing = getStoredTransactions(userId);
      const existingIds = new Set(existing.map((e) => e.id));
      const newItems = validated.filter((v) => !existingIds.has(v.id));
      finalTransactions = [...newItems, ...existing];
    }

    saveStoredTransactions(finalTransactions, userId);
    return { success: true, count: validated.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || 'Gagal membaca file JSON.' };
  }
}

/**
 * Reset all transactions for user (with confirmation state)
 */
export function resetAllData(userId?: string): void {
  try {
    const storageKey = getStorageKey(userId);
    const initKey = getInitializedKey(userId);
    localStorage.removeItem(storageKey);
    localStorage.setItem(initKey, 'true'); // Prevents auto re-seeding immediately
  } catch (err) {
    console.error('Error resetting data:', err);
  }
}


function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
