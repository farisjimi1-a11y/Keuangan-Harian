import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Calendar,
  Trash2,
  Edit3,
  X,
  Plus,
} from 'lucide-react';
import { Transaction, TransactionType, DateFilterType } from '../types';
import {
  formatDateIndonesian,
  formatRupiah,
  getJakartaDateTime,
  getRelativeDayLabel,
} from '../utils/formatters';
import { ALL_CATEGORIES, CATEGORY_DETAILS } from '../utils/categorizer';

interface HistoryViewProps {
  transactions: Transaction[];
  onEditTransaction: (trx: Transaction) => void;
  onDeleteTransaction: (trx: Transaction) => void;
  onOpenRecord: (type: TransactionType) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  transactions,
  onEditTransaction,
  onDeleteTransaction,
  onOpenRecord,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const now = getJakartaDateTime();
  const todayStr = now.date;

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((trx) => {
      // 1. Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const descMatch = (trx.description || '').toLowerCase().includes(query);
        const catMatch = (trx.category || '').toLowerCase().includes(query);
        const amountMatch = trx.amount.toString().includes(query);
        if (!descMatch && !catMatch && !amountMatch) return false;
      }

      // 2. Type filter
      if (typeFilter !== 'all' && trx.type !== typeFilter) {
        return false;
      }

      // 3. Category filter
      if (categoryFilter !== 'all' && trx.category !== categoryFilter) {
        return false;
      }

      // 4. Date filter
      if (dateFilter === 'today') {
        if (trx.date !== todayStr) return false;
      } else if (dateFilter === 'yesterday') {
        const yesterdayObj = new Date();
        yesterdayObj.setDate(yesterdayObj.getDate() - 1);
        const yestStr = getJakartaDateTime(yesterdayObj).date;
        if (trx.date !== yestStr) return false;
      } else if (dateFilter === 'last7days') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const minDate = getJakartaDateTime(sevenDaysAgo).date;
        if (trx.date < minDate || trx.date > todayStr) return false;
      } else if (dateFilter === 'thisMonth') {
        const currentMonth = todayStr.substring(0, 7);
        if (!trx.date.startsWith(currentMonth)) return false;
      } else if (dateFilter === 'lastMonth') {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        const lastMonthStr = getJakartaDateTime(d).date.substring(0, 7);
        if (!trx.date.startsWith(lastMonthStr)) return false;
      } else if (dateFilter === 'custom') {
        if (customStartDate && trx.date < customStartDate) return false;
        if (customEndDate && trx.date > customEndDate) return false;
      }

      return true;
    });
  }, [
    transactions,
    searchTerm,
    typeFilter,
    categoryFilter,
    dateFilter,
    customStartDate,
    customEndDate,
    todayStr,
  ]);

  // Group transactions by Date for natural reading
  const groupedByDate = useMemo(() => {
    const groups: {
      date: string;
      items: Transaction[];
      totalIncome: number;
      totalExpense: number;
    }[] = [];

    const dateMap = new Map<
      string,
      { items: Transaction[]; totalIncome: number; totalExpense: number }
    >();

    filteredTransactions.forEach((trx) => {
      let group = dateMap.get(trx.date);
      if (!group) {
        group = { items: [], totalIncome: 0, totalExpense: 0 };
        dateMap.set(trx.date, group);
      }
      group.items.push(trx);
      if (trx.type === 'income') {
        group.totalIncome += trx.amount;
      } else {
        group.totalExpense += trx.amount;
      }
    });

    // Sort dates descending
    const sortedDates = Array.from(dateMap.keys()).sort((a, b) => b.localeCompare(a));

    sortedDates.forEach((date) => {
      const g = dateMap.get(date)!;
      // Sort items within group by time or createdAt descending
      g.items.sort((a, b) => {
        if (a.time && b.time && a.time !== b.time) {
          return b.time.localeCompare(a.time);
        }
        return b.createdAt.localeCompare(a.createdAt);
      });
      groups.push({
        date,
        items: g.items,
        totalIncome: g.totalIncome,
        totalExpense: g.totalExpense,
      });
    });

    return groups;
  }, [filteredTransactions]);

  const totalFilteredIncome = useMemo(
    () =>
      filteredTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  const totalFilteredExpense = useMemo(
    () =>
      filteredTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  const clearAllFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setDateFilter('all');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    typeFilter !== 'all' ||
    categoryFilter !== 'all' ||
    dateFilter !== 'all' ||
    customStartDate !== '' ||
    customEndDate !== '';

  return (
    <div id="view_history" className="space-y-4 pb-24 sm:pb-8">
      {/* Search & Filter Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-3">
        {/* Search Bar */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-4 text-gray-400" />
          <input
            id="input_search_history"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari transaksi berdasarkan keterangan, nominal, kategori..."
            className="w-full pl-11 pr-10 py-3 text-sm bg-gray-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder:text-gray-400 font-medium transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 p-1 text-gray-400 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Filter Segmented Buttons: Type */}
        <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
          <div className="inline-flex p-1 bg-gray-100 rounded-xl text-xs font-semibold">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'expense', label: 'Uang Keluar' },
              { id: 'income', label: 'Uang Masuk' },
            ].map((tab) => (
              <button
                key={tab.id}
                id={`filter_type_${tab.id}`}
                onClick={() => setTypeFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  typeFilter === tab.id
                    ? 'bg-white text-indigo-700 shadow-sm font-bold'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            id="btn_toggle_advanced_filters"
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              isFilterExpanded || hasActiveFilters
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Lanjutan</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
            )}
          </button>
        </div>

        {/* Collapsible Filter Panel */}
        {isFilterExpanded && (
          <div className="pt-3 border-t border-gray-100 space-y-3 animate-in fade-in">
            {/* Date Filters Chips */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                Filter Tanggal
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'all', label: 'Semua Waktu' },
                  { id: 'today', label: 'Hari Ini' },
                  { id: 'yesterday', label: 'Kemarin' },
                  { id: 'last7days', label: '7 Hari Terakhir' },
                  { id: 'thisMonth', label: 'Bulan Ini' },
                  { id: 'lastMonth', label: 'Bulan Lalu' },
                  { id: 'custom', label: 'Custom' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setDateFilter(f.id as any)}
                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-all ${
                      dateFilter === f.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Custom Date Range Picker */}
              {dateFilter === 'custom' && (
                <div className="mt-2.5 p-3 bg-gray-50 rounded-2xl border border-gray-200 flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500 font-medium">Mulai:</span>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-800"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500 font-medium">Sampai:</span>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-800"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Category Filter Dropdown */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                Kategori
              </span>
              <select
                id="select_category_filter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full sm:w-64 px-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Semua Kategori</option>
                {ALL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset Semua Filter</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter Summary Banner (when filtered) */}
      <div className="flex items-center justify-between px-2 text-xs text-neutral-500 font-medium">
        <span>Menampilkan {filteredTransactions.length} transaksi</span>
        <div className="flex items-center gap-3 font-semibold">
          <span className="text-emerald-700">+{formatRupiah(totalFilteredIncome)}</span>
          <span className="text-rose-700">-{formatRupiah(totalFilteredExpense)}</span>
        </div>
      </div>

      {/* Transactions List Grouped by Day */}
      {groupedByDate.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-neutral-200/90 shadow-sm">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-neutral-900">
            Tidak ada transaksi yang cocok
          </h4>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto mt-1 mb-4">
            {hasActiveFilters
              ? 'Coba sesuaikan kata kunci atau filter tanggal/kategori.'
              : 'Belum ada data transaksi yang dicatat.'}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold"
            >
              Hapus Filter
            </button>
          ) : (
            <button
              onClick={() => onOpenRecord('expense')}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Transaksi Pertama</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByDate.map((group) => {
            const relDay = getRelativeDayLabel(group.date);
            const netDay = group.totalIncome - group.totalExpense;

            return (
              <div
                key={group.date}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Date Group Header */}
                <div className="bg-gray-50/80 px-4 sm:px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-gray-900">
                      {relDay ? `${relDay}, ` : ''}
                      {formatDateIndonesian(group.date)}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-400">
                      ({group.items.length})
                    </span>
                  </div>

                  <div className="text-right text-[11px] font-bold">
                    {group.totalIncome > 0 && (
                      <span className="text-emerald-600 mr-2">
                        +{formatRupiah(group.totalIncome)}
                      </span>
                    )}
                    {group.totalExpense > 0 && (
                      <span className="text-rose-600">
                        -{formatRupiah(group.totalExpense)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Items in Day */}
                <div className="divide-y divide-gray-100">
                  {group.items.map((trx) => {
                    const catDetails =
                      CATEGORY_DETAILS[trx.category as keyof typeof CATEGORY_DETAILS];

                    return (
                      <div
                        key={trx.id}
                        id={`history_item_${trx.id}`}
                        className="p-4 sm:p-4.5 flex items-center justify-between gap-3 hover:bg-gray-50/70 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm"
                            style={{
                              backgroundColor: catDetails?.color || '#64748B',
                            }}
                          >
                            {(trx.category || 'Lainnya').substring(0, 2)}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-gray-900 truncate">
                                {trx.description ||
                                  (trx.type === 'income' ? 'Uang Masuk' : 'Pengeluaran')}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                              <span className="font-semibold text-gray-600">
                                {trx.category}
                              </span>
                              <span>&bull;</span>
                              <span>{trx.time}</span>
                            </div>
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span
                              className={`text-sm sm:text-base font-bold ${
                                trx.type === 'income'
                                  ? 'text-emerald-500'
                                  : 'text-rose-500'
                              }`}
                            >
                              {trx.type === 'income' ? '+' : '-'}
                              {formatRupiah(trx.amount)}
                            </span>
                          </div>

                          {/* Action Buttons (Edit & Delete) */}
                          <div className="flex items-center gap-1 opacity-80 sm:opacity-40 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              id={`btn_edit_${trx.id}`}
                              onClick={() => onEditTransaction(trx)}
                              className="p-2 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="Edit Transaksi"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              id={`btn_delete_${trx.id}`}
                              onClick={() => onDeleteTransaction(trx)}
                              className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Hapus Transaksi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
