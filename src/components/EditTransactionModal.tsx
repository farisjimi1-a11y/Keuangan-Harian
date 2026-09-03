import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Trash2, Check } from 'lucide-react';
import { Transaction, TransactionType, CategoryName } from '../types';
import {
  formatInputAmount,
  formatRupiah,
  parseRawAmount,
} from '../utils/formatters';
import { ALL_CATEGORIES, CATEGORY_DETAILS } from '../utils/categorizer';

interface EditTransactionModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Transaction) => void;
  onRequestDelete: (transaction: Transaction) => void;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onSave,
  onRequestDelete,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategoryName>('Lainnya');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmountStr(transaction.amount.toString());
      setDescription(transaction.description || '');
      setCategory((transaction.category as CategoryName) || 'Lainnya');
      setDate(transaction.date || '');
      setTime(transaction.time || '');
      setError('');
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = parseRawAmount(amountStr);
    if (!numeric || numeric <= 0) {
      setError('Nominal harus lebih besar dari Rp0');
      return;
    }

    onSave({
      ...transaction,
      type,
      amount: numeric,
      description: description.trim() || (type === 'income' ? 'Uang Masuk' : 'Pengeluaran'),
      category,
      date,
      time,
    });

    onClose();
  };

  return (
    <div
      id="modal_edit_transaction_backdrop"
      className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="modal_edit_transaction_card"
        className="bg-white w-full max-w-lg rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">Edit Transaksi</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Uang Keluar</span>
            </button>

            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Uang Masuk</span>
            </button>
          </div>

          {/* Nominal */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
              Nominal (Rp)
            </label>
            <div className="relative flex items-center bg-gray-50 rounded-2xl border border-gray-200 px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white transition-all">
              <span className="text-base font-bold text-gray-400 mr-2">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={formatInputAmount(amountStr)}
                onChange={(e) => {
                  setAmountStr(e.target.value.replace(/\D/g, ''));
                  setError('');
                }}
                className="w-full bg-transparent text-xl font-bold text-gray-900 focus:outline-none"
              />
            </div>
            {error && <p className="text-xs text-rose-500 font-medium mt-1">{error}</p>}
          </div>

          {/* Keterangan */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
              Keterangan
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Makan siang, belanja..."
              className="w-full px-3.5 py-2.5 bg-gray-50 border-0 rounded-2xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Kategori & Tanggal Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryName)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {ALL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  Jam
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-between gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => onRequestDelete(transaction)}
              className="p-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
