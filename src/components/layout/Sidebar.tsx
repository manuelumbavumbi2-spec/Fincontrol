import React from 'react';
import {
  LayoutDashboard,
  TrendingDown,
  TrendingUp,
  ArrowRightLeft,
  PieChart,
  CalendarDays,
  Repeat,
  CalendarCheck,
  PiggyBank,
  Briefcase,
  Target,
  Landmark,
  CreditCard,
  FileSpreadsheet,
  BarChart3,
  HeartPulse,
  Bot,
  UserCheck,
  Wallet,
  Tags,
  Users,
  Bell,
  DatabaseBackup,
  Settings as SettingsIcon,
  LogOut,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';

export type ActiveView = 
  | 'dashboard'
  | 'receitas'
  | 'despesas'
  | 'transferencias'
  | 'orcamento'
  | 'planeadas'
  | 'recorrencias'
  | 'calendario'
  | 'poupanca'
  | 'investimentos'
  | 'metas'
  | 'patrimonio'
  | 'dividas'
  | 'relatorios'
  | 'graficos'
  | 'saude'
  | 'ia'
  | 'perfil'
  | 'contas'
  | 'categorias'
  | 'pessoas'
  | 'notificacoes'
  | 'backup'
  | 'configuracoes';

interface MenuItem {
  id: ActiveView;
  label: string;
  icon: any;
  color?: string;
  badge?: string;
  badgeCount?: number;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface SidebarProps {
  currentView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onSelectView, isOpenMobile, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const { settings, notifications } = useFinance();

  const unreadNotifs = notifications.filter(n => !n.isRead).length;

  const menuSections: MenuSection[] = [
    {
      title: 'Principal',
      items: [
        { id: 'dashboard' as ActiveView, label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'Movimentos',
      items: [
        { id: 'despesas' as ActiveView, label: 'Despesas', icon: TrendingDown, color: 'text-rose-500' },
        { id: 'receitas' as ActiveView, label: 'Receitas', icon: TrendingUp, color: 'text-emerald-500' },
        { id: 'transferencias' as ActiveView, label: 'Transferências', icon: ArrowRightLeft, color: 'text-amber-500' },
      ]
    },
    {
      title: 'Planeamento',
      items: [
        { id: 'orcamento' as ActiveView, label: 'Orçamento Mensal', icon: PieChart },
        { id: 'planeadas' as ActiveView, label: 'Despesas Planeadas', icon: CalendarCheck },
        { id: 'recorrencias' as ActiveView, label: 'Despesas Recorrentes', icon: Repeat },
        { id: 'calendario' as ActiveView, label: 'Calendário Financeiro', icon: CalendarDays },
      ]
    },
    {
      title: 'Construção de Património',
      items: [
        { id: 'poupanca' as ActiveView, label: 'Poupança', icon: PiggyBank, color: 'text-blue-500' },
        { id: 'investimentos' as ActiveView, label: 'Investimentos', icon: Briefcase, color: 'text-indigo-500' },
        { id: 'metas' as ActiveView, label: 'Metas Financeiras', icon: Target, color: 'text-purple-500' },
        { id: 'patrimonio' as ActiveView, label: 'Património Líquido', icon: Landmark, color: 'text-emerald-500' },
      ]
    },
    {
      title: 'Obrigações',
      items: [
        { id: 'dividas' as ActiveView, label: 'Dívidas & Pagamentos', icon: CreditCard, color: 'text-red-500' },
      ]
    },
    {
      title: 'Análise & Inteligência',
      items: [
        { id: 'relatorios' as ActiveView, label: 'Relatórios & Exportações', icon: FileSpreadsheet },
        { id: 'graficos' as ActiveView, label: 'Gráficos Analíticos', icon: BarChart3 },
        { id: 'saude' as ActiveView, label: 'Saúde Financeira', icon: HeartPulse, color: 'text-rose-500' },
        { id: 'ia' as ActiveView, label: 'Assistente IA', icon: Bot, badge: 'IA', color: 'text-violet-500' },
      ]
    },
    {
      title: 'Configurações',
      items: [
        { id: 'contas' as ActiveView, label: 'Contas Bancárias', icon: Wallet },
        { id: 'categorias' as ActiveView, label: 'Categorias', icon: Tags },
        { id: 'pessoas' as ActiveView, label: 'Família / Pessoas', icon: Users },
        { id: 'notificacoes' as ActiveView, label: 'Notificações', icon: Bell, badgeCount: unreadNotifs },
        { id: 'backup' as ActiveView, label: 'Backup & Dados', icon: DatabaseBackup },
        { id: 'perfil' as ActiveView, label: 'Perfil do Utilizador', icon: UserCheck },
        { id: 'configuracoes' as ActiveView, label: 'Configurações', icon: SettingsIcon },
      ]
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-300 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                {settings.appName || 'FinControl Angola'}
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">Gestão Pessoal & Familiar</p>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {menuSections.map((section, idx) => (
            <div key={idx}>
              <h2 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                {section.title}
              </h2>
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectView(item.id);
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color || 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        {item.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-violet-500 text-white animate-pulse">
                            {item.badge}
                          </span>
                        )}
                        {item.badgeCount !== undefined && item.badgeCount > 0 && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500 text-white">
                            {item.badgeCount}
                          </span>
                        )}
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/50">
            <div
              onClick={() => { onSelectView('perfil'); onCloseMobile(); }}
              className="flex items-center space-x-2.5 cursor-pointer flex-1 min-w-0"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : 'FC'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Manuel Umbavumbi'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || 'Luanda, Angola'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Terminar Sessão"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
