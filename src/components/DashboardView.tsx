import React, { useMemo } from 'react';
import {
  Calendar,
  ChevronRight,
  Receipt,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import { FinancialSummary, Transaction, TransactionType } from '../types';
import {
  formatDateShort,
  formatRupiah,
  getJakartaDateTime,
} from '../utils/formatters';
import { CATEGORY_DETAILS } from '../utils/categorizer';
import { QuickInputBar } from './QuickInputBar';

interface DashboardViewProps {
  summary: FinancialSummary;
  recentTransactions: Transaction[];
  onOpenRecord: (type: TransactionType) => void;
  onOpenQuick: (data: {
    type: TransactionType;
    amount: number;
    description: string;
    category: string;
  }) => void;
  onViewAllHistory: () => void;
  onSelectTransaction: (trx: Transaction) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  recentTransactions,
  onOpenRecord,
  onOpenQuick,
  onViewAllHistory,
  onSelectTransaction,
}) => {
  const current = getJakartaDateTime();
  const isBalancePositive = summary.currentBalance >= 0;

  // Calculate 6-day spending flow for the "Alur Pengeluaran" editorial chart
  const spendingFlow = useMemo(() => {
    const days: { label: string; amount: number; isToday: boolean }[] = [];
    const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = getJakartaDateTime(d).date;
      const label = dayLabels[d.getDay()];
      const dayExpense = recentTransactions
        .filter((t) => t.type === 'expense' && t.date === dateStr)
        .reduce((s, t) => s + t.amount, 0);

      days.push({ label, amount: dayExpense, isToday: i === 0 });
    }

    const max = Math.max(...days.map((d) => d.amount), 1);
    const total6Days = days.reduce((sum, d) => sum + d.amount, 0);
    const average = Math.round(total6Days / 6);

    return { days, max, average };
  }, [recentTransactions]);

  // Largest expense category this month for the smart insight
  const topCategoryInsight = useMemo(() => {
    const map = new Map<string, number>();
    recentTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const cat = t.category || 'Lainnya';
        map.set(cat, (map.get(cat) || 0) + t.amount);
      });
    const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : 'Makanan';
  }, [recentTransactions]);

  return (
    <div id="dashboard_view" className="space-y-6 pb-24 sm:pb-8">
      {/* 1. Header (Editorial Style) */}
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-sm text-gray-500 font-medium">Selamat Datang Kembali</h2>
          <p className="text-lg font-bold text-gray-900">{current.fullFormattedDate}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="btn_quick_income"
            type="button"
            onClick={() => onOpenRecord('income')}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            + Uang Masuk
          </button>
          <button
            id="btn_quick_expense"
            type="button"
            onClick={() => onOpenRecord('expense')}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            - Uang Keluar
          </button>
        </div>
      </header>

      {/* 2. Primary 3-Column Grid: Royal Indigo Balance Card & Input Cepat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editorial Balance Card (Col 1-2) */}
        <div
          id="card_current_balance"
          className="col-span-1 lg:col-span-2 bg-indigo-600 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm flex flex-col justify-between"
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <p className="text-indigo-100 text-sm font-medium">Saldo Saat Ini</p>
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                  isBalancePositive ? 'bg-white/15 text-white' : 'bg-rose-500/80 text-white'
                }`}
              >
                {isBalancePositive ? 'Surplus Aktif' : 'Defisit'}
              </span>
            </div>

            <h3 className="text-3xl sm:text-5xl font-bold mt-2 tracking-tight">
              {formatRupiah(summary.currentBalance)}
            </h3>

            {/* Inner Translucent Metric Chips */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
                <p className="text-xs opacity-80 text-indigo-100">Pemasukan Bulan Ini</p>
                <p className="text-base sm:text-lg font-semibold mt-0.5">
                  + {formatRupiah(summary.monthIncome)}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
                <p className="text-xs opacity-80 text-indigo-100">Pengeluaran Bulan Ini</p>
                <p className="text-base sm:text-lg font-semibold mt-0.5">
                  - {formatRupiah(summary.monthExpense)}
                </p>
              </div>
            </div>
          </div>

          {/* Subtle Decorative Circle */}
          <div className="absolute top-[-20px] right-[-20px] w-64 h-64 bg-white/5 rounded-full pointer-events-none" />
        </div>

        {/* Input Cepat & Wawasan Pintar Column (Col 3) */}
        <div className="col-span-1 flex flex-col gap-4">
          <QuickInputBar onSaveQuick={onOpenQuick} />

          {/* Wawasan Pintar banner matching Editorial template */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 shadow-sm">
            <p className="text-[10px] uppercase font-bold text-amber-600 mb-1 tracking-wider">
              Wawasan Pintar
            </p>
            <p className="text-xs text-amber-900 leading-snug">
              Kategori <strong>{topCategoryInsight}</strong> adalah pengeluaran paling aktif
              kamu bulan ini.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Secondary 5-Column Grid: Transaksi Terbaru & Alur Pengeluaran */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Transactions (Col 1-3) */}
        <section
          id="section_recent_transactions"
          className="lg:col-span-3 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-bold text-gray-800 text-base">Transaksi Terbaru</h3>
                <p className="text-xs text-gray-400">10 aktivitas pencatatan terakhir</p>
              </div>
              {recentTransactions.length > 0 && (
                <button
                  id="btn_view_all_history"
                  type="button"
                  onClick={onViewAllHistory}
                  className="text-xs text-indigo-600 font-bold hover:text-indigo-700 transition-colors flex items-center gap-1"
                >
                  <span>Lihat Semua</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {recentTransactions.length === 0 ? (
              <div
                id="empty_state_no_transactions"
                className="text-center py-10 px-4 rounded-2xl bg-gray-50 border border-dashed border-gray-200 my-4"
              >
                <div className="w-12 h-12 mx-auto rounded-2xl bg-gray-200/70 flex items-center justify-center text-gray-400 mb-3">
                  <Receipt className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-gray-800">Belum ada transaksi</h4>
                <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1 mb-4">
                  Mulai catat pemasukan atau pengeluaran pertamamu hari ini.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => onOpenRecord('income')}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    + Uang Masuk
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenRecord('expense')}
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    - Uang Keluar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {recentTransactions.slice(0, 7).map((trx) => {
                  const catDetails =
                    CATEGORY_DETAILS[trx.category as keyof typeof CATEGORY_DETAILS];
                  const initialLetter = (trx.description || trx.category || 'L')
                    .trim()
                    .charAt(0)
                    .toUpperCase();

                  const isIncome = trx.type === 'income';

                  return (
                    <div
                      key={trx.id}
                      id={`item_trx_${trx.id}`}
                      onClick={() => onSelectTransaction(trx)}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl border border-transparent hover:border-gray-100 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center space-x-4 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${
                            isIncome
                              ? 'bg-emerald-50 text-emerald-500'
                              : 'bg-rose-50 text-rose-500'
                          }`}
                        >
                          {initialLetter}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {trx.description || (isIncome ? 'Uang Masuk' : 'Pengeluaran')}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                            {formatDateShort(trx.date)} &bull; {trx.time} &bull;{' '}
                            <span className="font-medium text-gray-500">
                              {trx.category}
                            </span>
                          </p>
                        </div>
                      </div>

                      <span
                        className={`font-bold text-sm sm:text-base flex-shrink-0 ml-3 ${
                          isIncome ? 'text-emerald-500' : 'text-rose-500'
                        }`}
                      >
                        {isIncome ? '+' : '-'} {formatRupiah(trx.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Alur Pengeluaran & Rata-rata Harian (Col 4-5) */}
        <section
          id="section_spending_flow"
          className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between"
        >
          <div>
            <h3 className="font-bold text-gray-800 mb-6">Alur Pengeluaran</h3>

            {/* Visual Bar Columns */}
            <div className="h-40 flex items-end justify-between px-2 mb-4">
              {spendingFlow.days.map((d, idx) => {
                const heightPercent =
                  spendingFlow.max > 0 && d.amount > 0
                    ? Math.max(18, Math.round((d.amount / spendingFlow.max) * 100))
                    : 12;

                const isHighlight = d.isToday || (d.amount === spendingFlow.max && d.amount > 0);

                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 max-w-[40px] px-0.5">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-lg transition-all ${
                        isHighlight ? 'bg-indigo-500' : 'bg-gray-100'
                      }`}
                      title={`${d.label}: ${formatRupiah(d.amount)}`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Day Labels */}
            <div className="flex justify-between text-[10px] text-gray-400 font-bold px-2">
              {spendingFlow.days.map((d, idx) => (
                <span key={idx} className={d.isToday ? 'text-indigo-600' : ''}>
                  {d.label}
                </span>
              ))}
            </div>
          </div>

          {/* Average daily stat matching template */}
          <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-500">Rata-rata harian (6 hari)</span>
            <span className="text-sm font-bold text-gray-900">
              {formatRupiah(spendingFlow.average)}
            </span>
          </div>
        </section>
      </div>
    </div>
  );
};

