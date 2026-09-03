import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  if (!toast) return null;

  const bgStyles = {
    success: 'bg-emerald-900 text-white shadow-emerald-900/20',
    error: 'bg-rose-900 text-white shadow-rose-900/20',
    info: 'bg-neutral-900 text-white shadow-neutral-900/20',
  }[toast.type];

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  }[toast.type];

  return (
    <div
      id="global_toast_notification"
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border border-white/10 transition-all duration-300 animate-in fade-in slide-in-from-top-4 max-w-[92vw] sm:max-w-md"
    >
      <div className={`${bgStyles} flex items-center gap-2.5 px-4 py-2.5 rounded-xl w-full`}>
        <Icon className="w-5 h-5 flex-shrink-0 text-emerald-300" />
        <p className="text-sm font-medium flex-1 leading-tight">{toast.message}</p>
        <button
          id="btn_close_toast"
          onClick={onClose}
          className="p-1 -mr-1 text-white/70 hover:text-white rounded-lg transition-colors"
          aria-label="Tutup notifikasi"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
