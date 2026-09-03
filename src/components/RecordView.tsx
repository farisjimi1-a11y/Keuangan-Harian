import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Calendar,
  Sparkles,
  ChevronDown,
  Check,
} from 'lucide-react';
import { TransactionType, CategoryName } from '../types';
import {
  formatInputAmount,
  formatRupiah,
  getJakartaDateTime,
  parseRawAmount,
} from '../utils/formatters';
import { ALL_CATEGORIES, CATEGORY_DETAILS, detectCategory } from '../utils/categorizer';

interface RecordViewProps {
  initialType?: TransactionType;
  onSave: (data: {
    type: TransactionType;
    amount: number;
    description: string;
    category: string;
  }) => void;
  onCancel: () => void;
}

export const RecordView: React.FC<RecordViewProps> = ({
  initialType = 'expense',
  onSave,
  onCancel,
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [rawAmountString, setRawAmountString] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryName | null>(null);
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const currentTime = getJakartaDateTime();

  // Focus input automatically on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Update initial type when prop changes
  useEffect(() => {
    setType(initialType);
  }, [initialType]);

  // Auto-detect category whenever description changes (unless manually picked)
  const currentAutoCategory = detectCategory(description, type);
  const activeCategory = selectedCategory || currentAutoCategory;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const cleanDigits = val.replace(/\D/g, '');
    setRawAmountString(cleanDigits);
    if (errorMessage) setErrorMessage('');
  };

  const handleQuickAddAmount = (addValue: number) => {
    const currentVal = parseRawAmount(rawAmountString);
    const nextVal = currentVal + addValue;
    setRawAmountString(nextVal.toString());
    if (errorMessage) setErrorMessage('');
  };

  const handleClearAmount = () => {
    setRawAmountString('');
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseRawAmount(rawAmountString);

    if (!numericAmount || numericAmount <= 0) {
      setErrorMessage('Nominal wajib diisi dan harus lebih besar dari Rp0');
      inputRef.current?.focus();
      return;
    }

    onSave({
      type,
      amount: numericAmount,
      description: description.trim() || (type === 'income' ? 'Uang Masuk' : 'Uang Keluar'),
      category: activeCategory,
    });
  };

  const amountNumber = parseRawAmount(rawAmountString);

  return (
    <div id="view_record_transaction" className="max-w-xl mx-auto pb-24 sm:pb-8">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Transaction Type Segment Switch */}
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/50">
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-200/60 rounded-2xl">
            <button
              id="btn_type_expense"
              type="button"
              onClick={() => {
                setType('expense');
                setSelectedCategory(null);
              }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm sm:text-base transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 font-medium'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              <span>Uang Keluar</span>
            </button>

            <button
              id="btn_type_income"
              type="button"
              onClick={() => {
                setType('income');
                setSelectedCategory(null);
              }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm sm:text-base transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 font-medium'
              }`}
            >
              <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
              <span>Uang Masuk</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-6">
          {/* Main Nominal Input (Core Focus) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="input_nominal_field"
                className="text-xs font-bold uppercase tracking-wider text-gray-400"
              >
                Nominal Uang ({type === 'income' ? 'Pemasukan' : 'Pengeluaran'})
              </label>
              {amountNumber > 0 && (
                <button
                  type="button"
                  onClick={handleClearAmount}
                  className="text-xs font-semibold text-gray-400 hover:text-rose-600 transition-colors"
                >
                  Hapus
                </button>
              )}
            </div>

            <div
              className={`relative flex items-center bg-gray-50 rounded-2xl border transition-all p-3 sm:p-4 ${
                errorMessage
                  ? 'border-rose-400 bg-rose-50/30'
                  : type === 'income'
                  ? 'border-gray-200 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white'
                  : 'border-gray-200 focus-within:ring-2 focus-within:ring-rose-500 focus-within:bg-white'
              }`}
            >
              <span
                className={`text-2xl sm:text-3xl font-black mr-2 select-none ${
                  type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                Rp
              </span>
              <input
                ref={inputRef}
                id="input_nominal_field"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                value={formatInputAmount(rawAmountString)}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full bg-transparent text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight focus:outline-none placeholder:text-gray-300"
              />
            </div>

            {errorMessage && (
              <p className="text-xs font-semibold text-rose-600 mt-1 pl-1">
                {errorMessage}
              </p>
            )}

            {/* Quick Amount Helper Chips */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-gray-400 block mb-1.5">
                Pilihan Cepat Nominal:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { label: '+10 rb', value: 10000 },
                  { label: '+20 rb', value: 20000 },
                  { label: '+50 rb', value: 50000 },
                  { label: '+100 rb', value: 100000 },
                  { label: '+200 rb', value: 200000 },
                  { label: '+500 rb', value: 500000 },
                  { label: '+1 jt', value: 1000000 },
                ].map((chip) => (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => handleQuickAddAmount(chip.value)}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 transition-all"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Optional Keterangan Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="input_keterangan_field"
                className="text-xs font-bold uppercase tracking-wider text-gray-400"
              >
                Keterangan <span className="text-gray-400 font-normal">(Opsional)</span>
              </label>
              <span className="text-[11px] text-gray-400">
                Kategori terdeteksi otomatis
              </span>
            </div>

            <input
              id="input_keterangan_field"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                type === 'income'
                  ? 'Gaji bulanan, Jual barang, Bonus proyek...'
                  : 'Makan siang, Bensin motor, Bayar listrik...'
              }
              className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder:text-gray-400 text-sm font-medium transition-all"
            />
          </div>

          {/* Automatic Category & Category Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Kategori Transaksi
              </span>
              <button
                type="button"
                id="btn_toggle_custom_category"
                onClick={() => setIsCategoryPickerOpen(!isCategoryPickerOpen)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>{isCategoryPickerOpen ? 'Tutup Pilihan' : 'Ubah Kategori'}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    isCategoryPickerOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {/* Current Active Category Pill */}
            <div className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm"
                style={{
                  backgroundColor:
                    CATEGORY_DETAILS[activeCategory]?.color || '#64748B',
                }}
              >
                {activeCategory.substring(0, 2)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">
                    {activeCategory}
                  </span>
                  {!selectedCategory && description && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                      <Sparkles className="w-2.5 h-2.5" /> Otomatis
                    </span>
                  )}
                  {selectedCategory && (
                    <span className="text-[10px] font-semibold text-gray-600 bg-gray-200 px-2 py-0.5 rounded-full">
                      Dipilih Manual
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {!selectedCategory
                    ? 'Dihitung otomatis dari keterangan transaksi'
                    : 'Kategori ditetapkan secara khusus'}
                </p>
              </div>

              {selectedCategory && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className="text-xs text-gray-400 hover:text-gray-700 font-medium px-2 py-1"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Category Choices Grid (Accordion) */}
            {isCategoryPickerOpen && (
              <div
                id="category_picker_grid"
                className="p-3 bg-gray-50 rounded-2xl border border-gray-200/80 grid grid-cols-2 sm:grid-cols-3 gap-2 animate-in fade-in"
              >
                {ALL_CATEGORIES.map((cat) => {
                  const isCatSelected = activeCategory === cat;
                  const details = CATEGORY_DETAILS[cat];
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setIsCategoryPickerOpen(false);
                      }}
                      className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all text-xs font-semibold ${
                        isCatSelected
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/60'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: details.color }}
                      />
                      <span className="truncate flex-1">{cat}</span>
                      {isCatSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Automatic Date & Time Info Banner */}
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{currentTime.fullFormattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>
                {currentTime.time} <span className="text-[10px] text-gray-400">(WIB)</span>
              </span>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 space-y-2">
            <button
              id="btn_submit_transaction"
              type="submit"
              className={`w-full py-3.5 rounded-2xl text-sm sm:text-base font-bold text-white shadow-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2 ${
                type === 'income'
                  ? 'bg-emerald-500 hover:bg-emerald-600'
                  : 'bg-rose-500 hover:bg-rose-600'
              }`}
            >
              <span>
                {type === 'income' ? 'Simpan Uang Masuk' : 'Simpan Uang Keluar'}
              </span>
              {amountNumber > 0 && (
                <span className="text-white/80 font-normal text-sm">
                  ({formatRupiah(amountNumber)})
                </span>
              )}
            </button>

            <button
              id="btn_cancel_transaction"
              type="button"
              onClick={onCancel}
              className="w-full py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
            >
              Batal dan Kembali
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
