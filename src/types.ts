export type TransactionType = 'income' | 'expense';

export type CategoryName =
  | 'Makanan'
  | 'Transportasi'
  | 'Belanja'
  | 'Rumah'
  | 'Tagihan'
  | 'Internet & Teknologi'
  | 'Hiburan'
  | 'Kesehatan'
  | 'Pendidikan'
  | 'Gaji'
  | 'Bisnis'
  | 'Bonus'
  | 'Penjualan'
  | 'Investasi'
  | 'Lainnya';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: CategoryName | string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
  todayIncome: number;
  todayExpense: number;
  monthIncome: number;
  monthExpense: number;
  monthNet: number;
}

export type DateFilterType =
  | 'all'
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'thisMonth'
  | 'lastMonth'
  | 'custom';

export interface DateFilterRange {
  startDate?: string;
  endDate?: string;
}

export type ActiveTab = 'beranda' | 'catat' | 'riwayat' | 'analisis';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  lastLoginAt: string;
  avatarColor?: string;
}

export interface UserSession {
  user: UserProfile;
  rememberMe: boolean;
  token: string;
  loginTime: string;
}
