import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Transaction } from '../types';
import { formatDateIndonesian, formatRupiah } from '../utils/formatters';

interface DeleteConfirmationModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !transaction) return null;

  return (
    <div
      id="modal_delete_backdrop"
      className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="modal_delete_card"
        className="bg-white w-full max-w-sm rounded-3xl shadow-xl border border-gray-100 p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="text-center">
          <h3 className="text-base font-bold text-gray-900">Hapus Transaksi?</h3>
          <p className="text-xs text-gray-500 mt-1">
            Transaksi ini akan dihapus permanen dan saldo akan dihitung ulang otomatis.
          </p>
        </div>

        {/* Transaction Summary Preview */}
        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-1">
          <div className="flex justify-between font-medium text-gray-600">
            <span>Keterangan:</span>
            <span className="font-bold text-gray-900 truncate max-w-[160px]">
              {transaction.description || '-'}
            </span>
          </div>
          <div className="flex justify-between font-medium text-gray-600">
            <span>Nominal:</span>
            <span
              className={`font-bold ${
                transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {transaction.type === 'income' ? '+' : '-'}
              {formatRupiah(transaction.amount)}
            </span>
          </div>
          <div className="flex justify-between font-medium text-gray-600">
            <span>Tanggal:</span>
            <span>
              {formatDateIndonesian(transaction.date)} {transaction.time}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            id="btn_cancel_delete"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            id="btn_confirm_delete"
            onClick={() => {
              onConfirm(transaction.id);
              onClose();
            }}
            className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Ya, Hapus</span>
          </button>
        </div>
      </div>
    </div>
  );
};
