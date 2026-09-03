import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  LogOut,
  ShieldCheck,
  ChevronDown,
  UserCheck,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
import { UserProfile } from '../types';

interface UserProfileMenuProps {
  user: UserProfile | null;
  transactionCount: number;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  user,
  transactionCount,
  onOpenAuth,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!user) {
    return (
      <button
        type="button"
        id="btn_navbar_login"
        onClick={onOpenAuth}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
      >
        <KeyRound className="w-3.5 h-3.5" />
        <span>Masuk / Daftar</span>
      </button>
    );
  }

  const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
  const isGuest = user.id === 'usr_guest';

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        id="btn_user_profile_trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 sm:pr-2.5 sm:py-1 rounded-xl bg-gray-100 hover:bg-gray-200/80 transition-colors border border-gray-200/60"
        title="Menu Profil Akun"
      >
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shadow-xs ${
            user.avatarColor || 'bg-indigo-600 text-white'
          }`}
        >
          {initial}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-semibold text-gray-800 leading-tight max-w-[110px] truncate">
            {user.name}
          </span>
          <span className="text-[10px] text-gray-500 font-medium leading-none mt-0.5">
            {isGuest ? 'Tamu' : 'Tersimpan Aman'}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
      </button>

      {isOpen && (
        <div
          id="user_profile_dropdown"
          className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fadeIn"
        >
          {/* Header detail */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                  user.avatarColor || 'bg-indigo-600 text-white'
                }`}
              >
                {initial}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>

            <div className="mt-3 p-2 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2 text-[11px] text-emerald-800 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{transactionCount} transaksi tersimpan di akun ini</span>
            </div>
          </div>

          {/* Account Status Info */}
          <div className="px-4 py-2 text-[11px] text-gray-500 leading-relaxed">
            {isGuest ? (
              <p className="text-amber-700 bg-amber-50 p-2 rounded-lg">
                Mode Tamu: Buat akun permanen agar data Anda tidak hilang saat browser dibersihkan.
              </p>
            ) : (
              <p className="text-gray-500">
                Akun ini aktif. Catatan keuangan Anda akan tetap sama saat aplikasi dibuka kembali.
              </p>
            )}
          </div>

          <div className="my-1 border-t border-gray-100"></div>

          {/* Action options */}
          <div className="px-1 space-y-0.5">
            <button
              type="button"
              id="btn_menu_switch_account"
              onClick={() => {
                setIsOpen(false);
                onOpenAuth();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors text-left"
            >
              <RefreshCw className="w-4 h-4 text-gray-400" />
              <span>Ganti Akun / Masuk Akun Lain</span>
            </button>

            <button
              type="button"
              id="btn_menu_logout"
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Keluar dari Akun</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
