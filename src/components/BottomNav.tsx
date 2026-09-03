import React from 'react';
import { Home, Plus, ListOrdered, BarChart3 } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'beranda', label: 'Beranda', icon: Home },
    { id: 'catat', label: 'Catat', icon: Plus },
    { id: 'riwayat', label: 'Riwayat', icon: ListOrdered },
    { id: 'analisis', label: 'Analisis', icon: BarChart3 },
  ];

  return (
    <nav
      id="bottom_main_navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-neutral-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] sm:relative sm:border-t-0 sm:shadow-none sm:bg-transparent"
    >
      <div className="max-w-md sm:max-w-4xl mx-auto px-4 py-2 sm:py-0">
        <div className="flex items-center justify-around sm:justify-center sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isCatat = item.id === 'catat';

            if (isCatat) {
              return (
                <button
                  key={item.id}
                  id={`nav_tab_${item.id}`}
                  onClick={() => onChangeTab(item.id)}
                  className="flex flex-col items-center justify-center -mt-5 group focus:outline-none"
                  aria-label="Catat Transaksi Baru"
                >
                  <div
                    className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-200 group-active:scale-95 ${
                      isActive
                        ? 'bg-neutral-900 text-white shadow-neutral-900/30'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/30'
                    }`}
                  >
                    <Plus className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <span
                    className={`text-[11px] font-semibold mt-1 transition-colors ${
                      isActive ? 'text-indigo-700' : 'text-gray-500'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                id={`nav_tab_${item.id}`}
                onClick={() => onChangeTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-3 sm:px-5 sm:py-2.5 rounded-xl sm:flex-row sm:gap-2 transition-all ${
                  isActive
                    ? 'text-indigo-700 font-semibold sm:bg-indigo-50 sm:border sm:border-indigo-100'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/70 font-medium'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-105 text-indigo-600' : 'text-gray-400'
                  }`}
                />
                <span className="text-[11px] sm:text-sm mt-1 sm:mt-0 tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
