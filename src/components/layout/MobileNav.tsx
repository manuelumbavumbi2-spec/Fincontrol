import React from 'react';
import {
  LayoutDashboard,
  TrendingDown,
  Plus,
  PiggyBank,
  Menu
} from 'lucide-react';
import { ActiveView } from './Sidebar';

interface MobileNavProps {
  currentView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  onOpenQuickAdd: () => void;
  onOpenSidebar: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentView,
  onSelectView,
  onOpenQuickAdd,
  onOpenSidebar
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 lg:hidden px-3 py-2 shadow-lg">
      <div className="flex items-center justify-around">
        <button
          onClick={() => onSelectView('dashboard')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors ${
            currentView === 'dashboard'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Início</span>
        </button>

        <button
          onClick={() => onSelectView('despesas')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors ${
            currentView === 'despesas' || currentView === 'receitas'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <TrendingDown className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Movimentos</span>
        </button>

        {/* Center Floating "+" Button */}
        <div className="-mt-6">
          <button
            onClick={onOpenQuickAdd}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform cursor-pointer"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        <button
          onClick={() => onSelectView('poupanca')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors ${
            currentView === 'poupanca' || currentView === 'investimentos'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <PiggyBank className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Poupança</span>
        </button>

        <button
          onClick={onOpenSidebar}
          className="flex flex-col items-center justify-center p-1.5 rounded-lg text-slate-500 dark:text-slate-400"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Mais</span>
        </button>
      </div>
    </nav>
  );
};
