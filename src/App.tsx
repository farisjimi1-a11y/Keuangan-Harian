/**
 * Keuangan Harian - Aplikasi Pencatat Keuangan Pribadi Cepat & Otomatis
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ActiveTab, Transaction, TransactionType, UserProfile, UserSession } from './types';
import {
  addTransaction,
  calculateSummary,
  deleteTransaction,
  getStoredTransactions,
  updateTransaction,
} from './utils/storage';
import { formatRupiah } from './utils/formatters';
import { getActiveSession, clearActiveSession } from './utils/auth';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { RecordView } from './components/RecordView';
import { HistoryView } from './components/HistoryView';
import { AnalyticsView } from './components/AnalyticsView';
import { EditTransactionModal } from './components/EditTransactionModal';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { DataManagementModal } from './components/DataManagementModal';
import { AuthModal } from './components/AuthModal';
import { Toast, ToastMessage } from './components/Toast';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('beranda');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    return getActiveSession()?.user || null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recordInitialType, setRecordInitialType] = useState<TransactionType>('expense');

  // Modals & Notifications
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  // Load transactions for active user
  const refreshTransactions = useCallback((userId?: string) => {
    const list = getStoredTransactions(userId || currentUser?.id);
    setTransactions(list);
  }, [currentUser?.id]);

  useEffect(() => {
    refreshTransactions();
  }, [refreshTransactions]);

  // Toast helper
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToast({ id, message, type });
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Auth Success Handler
  const handleAuthSuccess = (session: UserSession, message: string) => {
    setCurrentUser(session.user);
    refreshTransactions(session.user.id);
    setIsAuthModalOpen(false);
    showToast(message, 'success');
  };

  // Logout Handler
  const handleLogout = () => {
    clearActiveSession();
    setCurrentUser(null);
    refreshTransactions('usr_guest');
    showToast('Anda telah keluar. Masuk kembali kapan saja untuk mengakses data Anda.', 'info');
    setIsAuthModalOpen(true);
  };

  // Recalculate summary dynamically after any transaction change
  const summary = useMemo(() => {
    return calculateSummary(transactions);
  }, [transactions]);

  // Handler: Save new transaction from Record Form
  const handleSaveTransaction = (data: {
    type: TransactionType;
    amount: number;
    description: string;
    category: string;
  }) => {
    const created = addTransaction(data, currentUser?.id);
    refreshTransactions();

    const typeLabel = created.type === 'income' ? 'Uang Masuk' : 'Uang Keluar';
    showToast(
      `${typeLabel} ${formatRupiah(created.amount)} berhasil dicatat!`,
      'success'
    );

    // Prompt rule: "Setelah menyimpan transaksi, kembali ke halaman utama."
    setActiveTab('beranda');
  };

  // Handler: Save from One-Line Quick Input Bar
  const handleQuickSave = (data: {
    type: TransactionType;
    amount: number;
    description: string;
    category: string;
  }) => {
    const created = addTransaction(data, currentUser?.id);
    refreshTransactions();

    const typeLabel = created.type === 'income' ? 'Uang Masuk' : 'Uang Keluar';
    showToast(
      `Catat cepat: ${typeLabel} ${formatRupiah(created.amount)} (${created.category}) berhasil!`,
      'success'
    );
  };

  // Handler: Open Record form with explicit type button (+ Uang Masuk or - Uang Keluar)
  const handleOpenRecordWithType = (type: TransactionType) => {
    setRecordInitialType(type);
    setActiveTab('catat');
  };

  // Handler: Update transaction
  const handleUpdate = (updated: Transaction) => {
    updateTransaction(updated, currentUser?.id);
    refreshTransactions();
    showToast('Transaksi berhasil diperbarui.', 'success');
  };

  // Handler: Confirm delete
  const handleConfirmDelete = (id: string) => {
    const success = deleteTransaction(id, currentUser?.id);
    if (success) {
      refreshTransactions();
      showToast('Transaksi telah berhasil dihapus.', 'info');
    }
    setDeletingTransaction(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        onOpenDataManagement={() => setIsDataModalOpen(true)}
        currentUser={currentUser}
        transactionCount={transactions.length}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Desktop Tabs Header Navigation */}
      <div className="hidden sm:block border-b border-gray-200 bg-white/70 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-2 flex items-center justify-between">
          <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-5">
        {/* Persistent Account Reminder Banner when not logged in with permanent account */}
        {(!currentUser || currentUser.id === 'usr_guest') && (
          <div
            id="banner_account_reminder"
            className="mb-5 p-4 bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-indigo-50/90 border border-indigo-200/70 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          >
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-gray-900 leading-snug">
                  Masuk dengan Akun agar Data Tidak Berubah Saat Dibuka
                </p>
                <p className="text-[11px] sm:text-xs text-gray-600 mt-0.5">
                  Dengan login, seluruh pencatatan tersimpan permanen di akun Anda dan tidak akan
                  terhapus atau berganti saat aplikasi dibuka kembali.
                </p>
              </div>
            </div>
            <button
              type="button"
              id="btn_banner_login"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold rounded-xl shrink-0 transition-all shadow-sm"
            >
              Masuk / Daftar Akun
            </button>
          </div>
        )}

        {activeTab === 'beranda' && (
          <DashboardView
            summary={summary}
            recentTransactions={transactions}
            onOpenRecord={handleOpenRecordWithType}
            onOpenQuick={handleQuickSave}
            onViewAllHistory={() => setActiveTab('riwayat')}
            onSelectTransaction={(trx) => setEditingTransaction(trx)}
          />
        )}

        {activeTab === 'catat' && (
          <RecordView
            initialType={recordInitialType}
            onSave={handleSaveTransaction}
            onCancel={() => setActiveTab('beranda')}
          />
        )}

        {activeTab === 'riwayat' && (
          <HistoryView
            transactions={transactions}
            onEditTransaction={(trx) => setEditingTransaction(trx)}
            onDeleteTransaction={(trx) => setDeletingTransaction(trx)}
            onOpenRecord={handleOpenRecordWithType}
          />
        )}

        {activeTab === 'analisis' && <AnalyticsView transactions={transactions} />}
      </main>

      {/* Mobile Bottom Fixed Navigation */}
      <div className="sm:hidden">
        <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
      </div>

      {/* Authentication (Login / Register) Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        canDismiss={true}
      />

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        isOpen={Boolean(editingTransaction)}
        transaction={editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onSave={handleUpdate}
        onRequestDelete={(trx) => {
          setEditingTransaction(null);
          setDeletingTransaction(trx);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={Boolean(deletingTransaction)}
        transaction={deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Data Management (Export / Backup / Restore / Reset) Modal */}
      <DataManagementModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        transactions={transactions}
        userId={currentUser?.id}
        onDataChanged={refreshTransactions}
        onShowToast={showToast}
      />
    </div>
  );
}

