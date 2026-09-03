import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  FileSpreadsheet,
  Upload,
  RotateCcw,
  AlertOctagon,
  FileJson,
  CheckCircle,
  Database,
} from 'lucide-react';
import { Transaction } from '../types';
import {
  exportBackupJSON,
  exportToCSV,
  exportToExcelCSV,
  importFromJSON,
  resetAllData,
} from '../utils/storage';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  userId?: string;
  onDataChanged: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  transactions,
  userId,
  onDataChanged,
  onShowToast,
}) => {
  const [resetConfirmStep, setResetConfirmStep] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportCSV = () => {
    exportToCSV(transactions);
    onShowToast('File CSV berhasil diunduh.', 'success');
  };

  const handleExportExcel = () => {
    exportToExcelCSV(transactions);
    onShowToast('File Excel (CSV) berhasil diunduh.', 'success');
  };

  const handleBackupJSON = () => {
    exportBackupJSON(transactions);
    onShowToast('Cadangan JSON berhasil diunduh.', 'success');
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        const res = importFromJSON(content, 'merge', userId);
        if (res.success) {
          onShowToast(`Berhasil memulihkan ${res.count} transaksi ke akun ini.`, 'success');
          onDataChanged();
          onClose();
        } else {
          onShowToast(res.error || 'Gagal memulihkan file.', 'error');
        }
      } catch (err: any) {
        onShowToast('Gagal memproses file cadangan.', 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleResetData = () => {
    resetAllData(userId);
    onDataChanged();
    setResetConfirmStep(false);
    onShowToast('Semua data transaksi pada akun ini telah berhasil dihapus.', 'info');
    onClose();
  };


  return (
    <div
      id="modal_data_management_backdrop"
      className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="modal_data_management_card"
        className="bg-white w-full max-w-lg rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-gray-900">
              Kelola Data & Cadangan
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Export Data */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Ekspor Laporan ({transactions.length} Transaksi)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                id="btn_export_csv"
                onClick={handleExportCSV}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-100 text-left transition-all group active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-900 block">
                    Unduh CSV
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Format spreadsheet standar
                  </span>
                </div>
              </button>

              <button
                type="button"
                id="btn_export_excel"
                onClick={handleExportExcel}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-100 text-left transition-all group active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-900 block">
                    Unduh Excel
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Kompatibel dengan Excel
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: Backup & Restore */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Cadangan & Pemulihan (Backup & Restore)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                id="btn_backup_json"
                onClick={handleBackupJSON}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-100 text-left transition-all group active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <FileJson className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-900 block">
                    Cadangkan JSON
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Simpan salinan data lengkap
                  </span>
                </div>
              </button>

              <label
                htmlFor="input_file_restore"
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-100 text-left transition-all group cursor-pointer active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-900 block">
                    Pulihkan Data
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Impor file cadangan JSON
                  </span>
                </div>
                <input
                  ref={fileInputRef}
                  id="input_file_restore"
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Section 3: Reset Data */}
          <div className="pt-2 border-t border-gray-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-2">
              Zona Berbahaya
            </h4>

            {!resetConfirmStep ? (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100">
                <div>
                  <span className="text-xs font-bold text-rose-900 block">
                    Hapus Seluruh Data
                  </span>
                  <span className="text-[11px] text-rose-600">
                    Reset riwayat transaksi dan saldo ke nol
                  </span>
                </div>
                <button
                  type="button"
                  id="btn_trigger_reset"
                  onClick={() => setResetConfirmStep(true)}
                  className="px-3.5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  Reset Data
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3 animate-in fade-in">
                <div className="flex items-start gap-2.5 text-rose-950">
                  <AlertOctagon className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold block">
                      Konfirmasi Penghapusan
                    </span>
                    <p className="text-xs text-rose-700 mt-0.5">
                      Semua transaksi akan dihapus dan tindakan ini tidak dapat dibatalkan.
                      Apakah kamu benar-benar yakin?
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setResetConfirmStep(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    id="btn_confirm_reset_all"
                    onClick={handleResetData}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
                  >
                    Ya, Hapus Semua Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50/50 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
