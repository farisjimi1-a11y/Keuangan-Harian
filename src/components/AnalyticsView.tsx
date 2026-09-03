import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  PieChart as PieIcon,
  Flame,
  Lightbulb,
  Receipt,
  Calendar,
} from 'lucide-react';
import { Transaction } from '../types';
import {
  formatDateShort,
  formatRupiah,
  formatRupiahCompact,
  getJakartaDateTime,
  getMonthYearLabel,
} from '../utils/formatters';
import { CATEGORY_DETAILS } from '../utils/categorizer';

interface AnalyticsViewProps {
  transactions: Transaction[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ transactions }) => {
  const now = getJakartaDateTime();
  const currentMonthStr = now.date.substring(0, 7); // "YYYY-MM"

  // 1. Overall Income vs Expense Totals
  const incomeVsExpenseData = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach((t) => {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    });

    return [
      { name: 'Pemasukan', amount: income, fill: '#10B981' },
      { name: 'Pengeluaran', amount: expense, fill: '#F43F5E' },
    ];
  }, [transactions]);

  // 2. Expense by Category Data
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    let totalExpense = 0;

    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const cat = t.category || 'Lainnya';
        map.set(cat, (map.get(cat) || 0) + t.amount);
        totalExpense += t.amount;
      });

    const result = Array.from(map.entries())
      .map(([name, value]) => ({
        name,
        value,
        percentage: totalExpense > 0 ? Math.round((value / totalExpense) * 100) : 0,
        color: CATEGORY_DETAILS[name as keyof typeof CATEGORY_DETAILS]?.color || '#64748B',
      }))
      .sort((a, b) => b.value - a.value);

    return { items: result, totalExpense };
  }, [transactions]);

  // 3. Largest Expenses (Top 5)
  const largestExpenses = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions]);

  // 4. Daily Spending Trend (Last 7 active days or last 14 days)
  const dailySpendingData = useMemo(() => {
    const daysMap = new Map<string, number>();
    // Pre-populate last 7 days
    const d = new Date();
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(d);
      targetDate.setDate(targetDate.getDate() - i);
      const dateStr = getJakartaDateTime(targetDate).date;
      daysMap.set(dateStr, 0);
    }

    // Populate with actual expense data
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        if (daysMap.has(t.date)) {
          daysMap.set(t.date, (daysMap.get(t.date) || 0) + t.amount);
        }
      });

    return Array.from(daysMap.entries()).map(([dateStr, amount]) => ({
      date: dateStr,
      displayDate: formatDateShort(dateStr),
      amount,
    }));
  }, [transactions]);

  // 5. Monthly Comparison (Grouped by YYYY-MM)
  const monthlyComparisonData = useMemo(() => {
    const monthMap = new Map<string, { income: number; expense: number }>();

    transactions.forEach((t) => {
      const monthKey = t.date.substring(0, 7);
      let entry = monthMap.get(monthKey);
      if (!entry) {
        entry = { income: 0, expense: 0 };
        monthMap.set(monthKey, entry);
      }
      if (t.type === 'income') entry.income += t.amount;
      else entry.expense += t.amount;
    });

    return Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([monthKey, vals]) => ({
        month: monthKey,
        displayMonth: getMonthYearLabel(monthKey),
        Pemasukan: vals.income,
        Pengeluaran: vals.expense,
        Selisih: vals.income - vals.expense,
      }));
  }, [transactions]);

  // 6. Smart Insights Generation (Indonesian, rule-based on actual user data)
  const smartInsights = useMemo(() => {
    const insights: { title: string; text: string; type: 'neutral' | 'positive' | 'warning' }[] = [];

    if (transactions.length === 0) {
      return [
        {
          title: 'Mulai Menabung',
          text: 'Catat transaksi pertamamu untuk melihat insight pola keuangan otomatis.',
          type: 'neutral' as const,
        },
      ];
    }

    // Insight A: Largest category this month
    if (categoryData.items.length > 0) {
      const topCat = categoryData.items[0];
      insights.push({
        title: 'Pengeluaran Terbesar',
        text: `Kategori ${topCat.name} menyumbang ${topCat.percentage}% dari seluruh pengeluaran (${formatRupiah(topCat.value)}).`,
        type: 'warning',
      });
    }

    // Insight B: Today's spending
    const todayExpenses = transactions
      .filter((t) => t.type === 'expense' && t.date === now.date)
      .reduce((s, t) => s + t.amount, 0);

    if (todayExpenses > 0) {
      insights.push({
        title: 'Pengeluaran Hari Ini',
        text: `Hari ini kamu sudah mengeluarkan total ${formatRupiah(todayExpenses)}.`,
        type: 'neutral',
      });
    }

    // Insight C: Monthly Comparison (Current vs Previous Month)
    const prevMonthDate = new Date();
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    const prevMonthStr = getJakartaDateTime(prevMonthDate).date.substring(0, 7);

    const currentMonthExpense = transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonthStr))
      .reduce((s, t) => s + t.amount, 0);

    const prevMonthExpense = transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(prevMonthStr))
      .reduce((s, t) => s + t.amount, 0);

    if (prevMonthExpense > 0 && currentMonthExpense > 0) {
      if (currentMonthExpense > prevMonthExpense) {
        const diff = currentMonthExpense - prevMonthExpense;
        insights.push({
          title: 'Tren Pengeluaran Meningkat',
          text: `Pengeluaran bulan ini lebih tinggi ${formatRupiah(diff)} dibanding bulan lalu.`,
          type: 'warning',
        });
      } else {
        const diff = prevMonthExpense - currentMonthExpense;
        insights.push({
          title: 'Penghematan Berhasil',
          text: `Pengeluaran bulan ini lebih hemat ${formatRupiah(diff)} dibanding bulan lalu. Kerja bagus!`,
          type: 'positive',
        });
      }
    }

    // Insight D: Cashflow Health
    let totalInc = 0;
    let totalExp = 0;
    transactions.forEach((t) => {
      if (t.type === 'income') totalInc += t.amount;
      else totalExp += t.amount;
    });

    if (totalInc > 0 && totalExp > 0) {
      const savingsRate = Math.round(((totalInc - totalExp) / totalInc) * 100);
      if (savingsRate > 0) {
        insights.push({
          title: 'Kesehatan Finansial',
          text: `Rasio sisa dana bersih kamu berada di kisaran positif ${savingsRate}% dari total pemasukan.`,
          type: 'positive',
        });
      }
    }

    return insights;
  }, [transactions, categoryData, now.date, currentMonthStr]);

  return (
    <div id="view_analytics" className="space-y-6 pb-24 sm:pb-8">
      {/* Smart Insights Cards */}
      <div id="section_smart_insights" className="space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-bold text-gray-900">Insight Keuangan Cerdas</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {smartInsights.map((insight, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all ${
                insight.type === 'positive'
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : insight.type === 'warning'
                  ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                  : 'bg-white border-gray-100 text-gray-800 shadow-sm'
              }`}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider mb-1">
                {insight.title}
              </h4>
              <p className="text-sm font-medium leading-relaxed">{insight.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Income vs Expense & Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Income vs Expense Chart */}
        <div
          id="chart_income_vs_expense"
          className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-gray-900">
                Pemasukan vs Pengeluaran
              </h3>
            </div>
            <span className="text-xs text-gray-400">Total Kumulatif</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={incomeVsExpenseData}
                margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis
                  tickFormatter={(val) => formatRupiahCompact(val)}
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                />
                <Tooltip
                  formatter={(val: number) => [formatRupiah(val), 'Jumlah']}
                  contentStyle={{
                    borderRadius: '16px',
                    borderColor: '#F3F4F6',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                  }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {incomeVsExpenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense by Category (Donut) */}
        <div
          id="chart_expense_by_category"
          className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-gray-900">
                Pengeluaran per Kategori
              </h3>
            </div>
            <span className="text-xs font-bold text-rose-600">
              Total: {formatRupiah(categoryData.totalExpense)}
            </span>
          </div>

          {categoryData.items.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 text-xs">
              <Receipt className="w-8 h-8 mb-2 opacity-50" />
              <span>Belum ada transaksi pengeluaran</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData.items}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.items.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [formatRupiah(val), 'Nominal']}
                      contentStyle={{
                        borderRadius: '16px',
                        borderColor: '#F3F4F6',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend with percentages */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {categoryData.items.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-xs py-1 px-1.5 rounded-xl hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-semibold text-gray-800 truncate">
                        {item.name}
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-bold text-gray-900">
                        {item.percentage}%
                      </span>
                      <span className="text-[10px] text-gray-400 ml-1.5">
                        ({formatRupiahCompact(item.value)})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Daily Spending Trend */}
      <div
        id="chart_daily_spending"
        className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-gray-900">
              Tren Pengeluaran Harian
            </h3>
          </div>
          <span className="text-xs text-gray-400">7 Hari Terakhir</span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dailySpendingData}
              margin={{ top: 15, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="displayDate" tick={{ fontSize: 11, fill: '#6B7280' }} />
              <YAxis
                tickFormatter={(val) => formatRupiahCompact(val)}
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
              />
              <Tooltip
                formatter={(val: number) => [formatRupiah(val), 'Pengeluaran']}
                contentStyle={{
                  borderRadius: '16px',
                  borderColor: '#F3F4F6',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                }}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#F43F5E"
                strokeWidth={3}
                dot={{ r: 4, fill: '#F43F5E' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Comparison and Largest Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly Comparison */}
        <div
          id="chart_monthly_comparison"
          className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-gray-900">
                Perbandingan Antarbulan
              </h3>
            </div>
            <span className="text-xs text-gray-400">Pemasukan vs Pengeluaran</span>
          </div>

          {monthlyComparisonData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-gray-400 text-xs">
              Belum ada riwayat bulanan
            </div>
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyComparisonData}
                  margin={{ top: 15, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="displayMonth" tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <YAxis
                    tickFormatter={(val) => formatRupiahCompact(val)}
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  />
                  <Tooltip
                    formatter={(val: number) => [formatRupiah(val), '']}
                    contentStyle={{
                      borderRadius: '16px',
                      borderColor: '#F3F4F6',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                    }}
                  />
                  <Bar dataKey="Pemasukan" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Pengeluaran" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Largest Expenses (Top 5) */}
        <div
          id="list_largest_expenses"
          className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-bold text-gray-900">
                Pengeluaran Terbesar
              </h3>
            </div>
            <span className="text-xs text-gray-400">Top 5 Nominal</span>
          </div>

          {largestExpenses.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-gray-400 text-xs">
              Belum ada pengeluaran
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {largestExpenses.map((exp, idx) => (
                <div key={exp.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-gray-900">
                        {exp.description || 'Pengeluaran'}
                      </p>
                      <span className="text-[11px] text-gray-400">
                        {exp.category} &bull; {formatDateShort(exp.date)}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs sm:text-sm font-bold text-rose-600">
                    -{formatRupiah(exp.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
