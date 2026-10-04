import React, { useState } from 'react';
import {
  Menu,
  Plus,
  Moon,
  Sun,
  Bell,
  Search,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFinance, PeriodFilter } from '../../context/FinanceContext';
import { ActiveView } from './Sidebar';

interface NavbarProps {
  onOpenMobileSidebar: () => void;
  onOpenQuickAdd: () => void;
  currentView: ActiveView;
  onSelectView: (view: ActiveView) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobileSidebar,
  onOpenQuickAdd,
  currentView,
  onSelectView
}) => {
  const { user } = useAuth();
  const { settings, updateAppSettings, notifications, markNotificationRead, period, setPeriod } = useFinance();
  const [showNotifPopover, setShowNotifPopover] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.isRead);

  const toggleDarkMode = () => {
    const isDark = !settings.darkMode;
    updateAppSettings({ darkMode: isDark });
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const periodLabels: Record<PeriodFilter, string> = {
    este_mes: 'Este Mês',
    hoje: 'Hoje',
    esta_semana: 'Esta Semana',
    mes_anterior: 'Mês Anterior',
    ultimos_3_meses: 'Últimos 3 Meses',
    este_ano: 'Este Ano',
    todos: 'Todo o Período'
  };

  const viewTitles: Record<ActiveView, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard Financeiro', subtitle: 'Controle as suas despesas. Organize o seu dinheiro. Construa o seu futuro.' },
    despesas: { title: 'Gestão de Despesas', subtitle: 'Registo e categorização detalhada de todas as despesas familiares.' },
    receitas: { title: 'Registo de Receitas', subtitle: 'Acompanhamento de salários, subsídios, trabalhos extras e negócios.' },
    transferencias: { title: 'Transferências entre Contas', subtitle: 'Movimentações entre contas bancárias, multicaixa e poupança.' },
    orcamento: { title: 'Orçamento Mensal', subtitle: 'Controlo de tectos orçamentais e limites de gastos por categoria.' },
    planeadas: { title: 'Despesas Planeadas', subtitle: 'Previsão de compromissos e despesas futuras para os próximos meses.' },
    recorrencias: { title: 'Despesas Recorrentes', subtitle: 'Mensalidades fixas, colégios, Internet e subscrições automáticas.' },
    calendario: { title: 'Calendário Financeiro', subtitle: 'Visão cronológica de pagamentos, vencimentos e receitas.' },
    poupanca: { title: 'Módulo de Poupança', subtitle: 'Metas e fundos de emergência para segurança familiar.' },
    investimentos: { title: 'Investimentos & Rentabilidade', subtitle: 'Depósitos a prazo, Obrigações do Tesouro na BODIVA e negócios.' },
    metas: { title: 'Metas Financeiras', subtitle: 'Objectivos de médio e longo prazo com cálculo de esforço mensal.' },
    patrimonio: { title: 'Património Líquido', subtitle: 'Balanço entre o total dos seus activos e as dívidas pendentes.' },
    dividas: { title: 'Dívidas & Obrigações', subtitle: 'Controlo rigoroso de empréstimos, créditos e prestações em atraso.' },
    relatorios: { title: 'Relatórios & Exportações', subtitle: 'Exportação executiva para PDF, folhas de cálculo Excel e ficheiros CSV.' },
    graficos: { title: 'Gráficos Analíticos', subtitle: 'Evolução mensal, proporção de despesas e distribuição patrimonial.' },
    saude: { title: 'Saúde Financeira', subtitle: 'Diagnóstico inteligente com pontuação de 0 a 100 e recomendações.' },
    ia: { title: 'Assistente Financeiro com IA', subtitle: 'Pergunte em tempo real sobre os seus números com inteligência artificial.' },
    perfil: { title: 'Perfil do Utilizador', subtitle: 'Dados da conta, segurança e preferências individuais.' },
    contas: { title: 'Contas Financeiras', subtitle: 'BAI, BFA, Multicaixa Express, Carteiras Digitais e Dinheiro em Mão.' },
    categorias: { title: 'Categorias & Subcategorias', subtitle: 'Personalização da estrutura de custos e receitas da família.' },
    pessoas: { title: 'Pessoas / Controlo Familiar', subtitle: 'Distribuição dos gastos por membro da família.' },
    notificacoes: { title: 'Notificações & Alertas', subtitle: 'Avisos de vencimentos, limites de orçamento e metas.' },
    backup: { title: 'Exportação & Backup', subtitle: 'Cópia de segurança completa e restauro de base de dados.' },
    configuracoes: { title: 'Configurações da Aplicação', subtitle: 'Nome da app, moeda Kwanza (Kz) e automação de poupança.' }
  };

  const currentInfo = viewTitles[currentView] || { title: 'FinControl Angola', subtitle: 'Gestão Financeira Pessoal e Familiar' };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenMobileSidebar}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {currentInfo.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block truncate max-w-md">
              {currentInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Period selector */}
          <div className="hidden md:flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
            <select
              value={period}
              onChange={e => setPeriod(e.target.value as PeriodFilter)}
              className="bg-transparent text-slate-700 dark:text-slate-200 font-semibold focus:outline-hidden pr-2 cursor-pointer"
            >
              {Object.entries(periodLabels).map(([key, label]) => (
                <option key={key} value={key} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            title={settings.darkMode ? 'Modo Claro' : 'Modo Escuro'}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {settings.darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => setShowNotifPopover(!showNotifPopover)}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              )}
            </button>

            {showNotifPopover && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Notificações Inteligentes</h4>
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    {unreadNotifs.length} novas
                  </span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto mt-2 space-y-2">
                  {notifications.slice(0, 5).map(n => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`pt-2 pb-1 text-xs cursor-pointer rounded-lg p-2 transition-colors ${
                        n.isRead ? 'opacity-70 bg-transparent' : 'bg-blue-50/50 dark:bg-blue-950/30'
                      }`}
                    >
                      <p className="font-semibold text-slate-900 dark:text-white">{n.title}</p>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5">{n.message}</p>
                      <span className="text-[10px] text-slate-400 block mt-1">{n.date}</span>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <p className="text-xs text-center py-4 text-slate-400">Sem notificações no momento.</p>
                  )}
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                  <button
                    onClick={() => { setShowNotifPopover(false); onSelectView('notificacoes'); }}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Ver todas as notificações
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Add Button */}
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center space-x-1.5 px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-sm text-xs sm:text-sm font-semibold transition-all hover:shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Registar Movimento</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
