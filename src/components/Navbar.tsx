import React from 'react';
import { Database, Plus } from 'lucide-react';
import { getJakartaDateTime } from '../utils/formatters';
import { UserProfile } from '../types';
import { UserProfileMenu } from './UserProfileMenu';

interface NavbarProps {
  onOpenDataManagement: () => void;
  onOpenRecord?: () => void;
  activeTab: string;
  currentUser: UserProfile | null;
  transactionCount: number;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDataManagement,
  onOpenRecord,
  currentUser,
  transactionCount,
  onOpenAuth,
  onLogout,
}) => {
  const current = getJakartaDateTime();

  return (
    <header
      id="app_header"
      className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Editorial Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <h1 className="text-2xl font-bold tracking-tighter text-indigo-600 italic leading-none">
                KH.
              </h1>
              <span className="hidden sm:inline-block text-sm font-semibold text-gray-800 tracking-tight">
                Keuangan Harian
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mt-0.5">
              {current.fullFormattedDate}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {onOpenRecord && (
            <button
              type="button"
              onClick={onOpenRecord}
              className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catat</span>
            </button>
          )}

          <button
            id="btn_open_data_modal"
            onClick={onOpenDataManagement}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 active:scale-95 rounded-xl transition-all border border-gray-200"
            title="Kelola Data (Backup, Export, Reset)"
          >
            <Database className="w-4 h-4 text-gray-500" />
            <span className="hidden sm:inline">Data & Cadangan</span>
          </button>

          {/* User Account Menu */}
          <UserProfileMenu
            user={currentUser}
            transactionCount={transactionCount}
            onOpenAuth={onOpenAuth}
            onLogout={onLogout}
          />
        </div>
      </div>
    </header>
  );
};


