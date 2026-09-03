import React, { useState, useMemo } from 'react';
import { Zap, CornerDownLeft, ArrowDownRight, ArrowUpRight, HelpCircle } from 'lucide-react';
import { parseQuickInput } from '../utils/categorizer';
import { formatRupiah } from '../utils/formatters';
import { TransactionType } from '../types';

interface QuickInputBarProps {
  onSaveQuick: (data: {
    type: TransactionType;
    amount: number;
    description: string;
    category: string;
  }) => void;
}

export const QuickInputBar: React.FC<QuickInputBarProps> = ({ onSaveQuick }) => {
  const [text, setText] = useState('');
  const [forcedType, setForcedType] = useState<TransactionType | null>(null);

  const parsed = useMemo(() => {
    const result = parseQuickInput(text);
    if (!result) return null;
    if (forcedType) {
      return {
        ...result,
        type: forcedType,
      };
    }
    return result;
  }, [text, forcedType]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!parsed || parsed.amount <= 0) return;

    onSaveQuick({
      type: parsed.type,
      amount: parsed.amount,
      description: parsed.description,
      category: parsed.category,
    });

    setText('');
    setForcedType(null);
  };

  const handleApplyExample = (example: string) => {
    setText(example);
    setForcedType(null);
  };

  return (
    <div
      id="quick_input_container"
      className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-3"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-xs uppercase tracking-wider font-bold text-gray-400">
          Input Cepat
        </h4>
        <span className="text-[11px] text-gray-400 hidden sm:inline font-medium">
          Ketik nominal + keterangan
        </span>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <input
            id="input_quick_text"
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setForcedType(null);
            }}
            placeholder="25000 makan siang"
            className="w-full bg-gray-50 border-0 rounded-2xl p-4 pr-16 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
          />
          <button
            id="btn_submit_quick"
            type="submit"
            disabled={!parsed || parsed.amount <= 0}
            className={`absolute right-2 top-2 bottom-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              parsed && parsed.amount > 0
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span className="hidden sm:inline">Simpan</span>
            <CornerDownLeft className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Live Interpretation Preview */}
      {parsed && (
        <div
          id="quick_input_live_preview"
          className="p-3 bg-indigo-50/80 rounded-2xl border border-indigo-100 flex flex-wrap items-center justify-between gap-2 text-xs animate-in fade-in"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-indigo-900 font-semibold">Terdeteksi:</span>
            <span
              className={`inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full ${
                parsed.type === 'income'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {parsed.type === 'income' ? (
                <ArrowDownRight className="w-3 h-3 text-emerald-600" />
              ) : (
                <ArrowUpRight className="w-3 h-3 text-rose-600" />
              )}
              {parsed.type === 'income' ? 'Uang Masuk' : 'Uang Keluar'}
            </span>

            <span className="font-bold text-gray-900">
              {formatRupiah(parsed.amount)}
            </span>

            <span className="text-gray-600 font-medium">
              &bull; {parsed.description}
            </span>

            <span className="bg-white text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md font-semibold text-[11px]">
              {parsed.category}
            </span>
          </div>

          {/* If user wants to switch type */}
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-[11px] text-gray-500 font-medium">Jenis:</span>
            <button
              type="button"
              id="btn_toggle_to_income"
              onClick={() => setForcedType('income')}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-colors ${
                parsed.type === 'income'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              id="btn_toggle_to_expense"
              onClick={() => setForcedType('expense')}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-colors ${
                parsed.type === 'expense'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Keluar
            </button>
          </div>
        </div>
      )}

      {/* Examples Chips */}
      <div className="flex items-center gap-1.5 flex-wrap pt-1">
        <span className="text-[11px] text-gray-400 font-semibold flex items-center gap-1">
          <HelpCircle className="w-3 h-3" /> Coba:
        </span>
        {[
          '25000 makan siang',
          '50000 bensin',
          '500000 jual kaos',
          '35k kopi latte',
        ].map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => handleApplyExample(ex)}
            className="text-[11px] px-2.5 py-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
};
