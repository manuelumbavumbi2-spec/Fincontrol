import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Sidebar, ActiveView } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { QuickAddModal } from './components/modals/QuickAddModal';
import { FloatingCalculatorKeypad } from './components/common/FloatingCalculatorKeypad';

// Views
import { DashboardView } from './views/DashboardView';
import { DespesasView } from './views/DespesasView';
import { ReceitasView } from './views/ReceitasView';
import { OrcamentoView } from './views/OrcamentoView';
import { PoupancaView } from './views/PoupancaView';
import { InvestimentosView } from './views/InvestimentosView';
import { DividasView } from './views/DividasView';
import { PatrimonioView } from './views/PatrimonioView';
import { MetasView } from './views/MetasView';
import { DespesasPlaneadasView } from './views/DespesasPlaneadasView';
import { DespesasRecorrentesView } from './views/DespesasRecorrentesView';
import { CalendarioView } from './views/CalendarioView';
import { FamiliaView } from './views/FamiliaView';
import { ContasView } from './views/ContasView';
import { CategoriasView } from './views/CategoriasView';
import { RelatoriosView } from './views/RelatoriosView';
import { GraficosView } from './views/GraficosView';
import { SaudeFinanceiraView } from './views/SaudeFinanceiraView';
import { AssistenteIAView } from './views/AssistenteIAView';
import { NotificacoesView } from './views/NotificacoesView';
import { BackupView } from './views/BackupView';
import { ConfiguracoesView } from './views/ConfiguracoesView';
import { PerfilView } from './views/PerfilView';
import { AuthView } from './views/AuthView';

const MainAppContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState<ActiveView>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddTab, setQuickAddTab] = useState<'despesa' | 'receita' | 'poupanca' | 'investimento' | 'transferencia'>('despesa');

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-blue-600 flex items-center justify-center animate-pulse shadow-lg shadow-emerald-500/30 mb-4" />
        <h2 className="text-lg font-bold">FinControl Angola</h2>
        <p className="text-xs text-slate-400 mt-1">A carregar ambiente financeiro...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  const openQuickAddWithTab = (tab: 'despesa' | 'receita' | 'poupanca' | 'investimento' | 'transferencia' = 'despesa') => {
    setQuickAddTab(tab);
    setIsQuickAddOpen(true);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView onSelectView={setCurrentView} onOpenQuickAdd={openQuickAddWithTab} />;
      case 'despesas':
        return <DespesasView onOpenQuickAdd={() => openQuickAddWithTab('despesa')} />;
      case 'receitas':
        return <ReceitasView onOpenQuickAdd={() => openQuickAddWithTab('receita')} />;
      case 'transferencias':
      case 'contas':
        return <ContasView />;
      case 'orcamento':
        return <OrcamentoView />;
      case 'poupanca':
        return <PoupancaView />;
      case 'investimentos':
        return <InvestimentosView />;
      case 'dividas':
        return <DividasView />;
      case 'patrimonio':
        return <PatrimonioView />;
      case 'metas':
        return <MetasView />;
      case 'planeadas':
        return <DespesasPlaneadasView />;
      case 'recorrencias':
        return <DespesasRecorrentesView />;
      case 'calendario':
        return <CalendarioView />;
      case 'pessoas':
        return <FamiliaView />;
      case 'categorias':
        return <CategoriasView />;
      case 'relatorios':
        return <RelatoriosView />;
      case 'graficos':
        return <GraficosView />;
      case 'saude':
        return <SaudeFinanceiraView />;
      case 'ia':
        return <AssistenteIAView />;
      case 'notificacoes':
        return <NotificacoesView />;
      case 'backup':
        return <BackupView />;
      case 'configuracoes':
        return <ConfiguracoesView />;
      case 'perfil':
        return <PerfilView />;
      default:
        return <DashboardView onSelectView={setCurrentView} onOpenQuickAdd={openQuickAddWithTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors">
      {/* Sidebar for Desktop & Mobile drawer */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 pb-20 lg:pb-8">
        <Navbar
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenQuickAdd={() => openQuickAddWithTab('despesa')}
          currentView={currentView}
          onSelectView={setCurrentView}
        />

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {renderCurrentView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentView={currentView}
        onSelectView={setCurrentView}
        onOpenQuickAdd={() => openQuickAddWithTab('despesa')}
        onOpenSidebar={() => setIsMobileSidebarOpen(true)}
      />

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        initialTab={quickAddTab}
      />

      {/* Global Calculator & Keypad Widget - Visible throughout the entire system */}
      <FloatingCalculatorKeypad />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <MainAppContent />
      </FinanceProvider>
    </AuthProvider>
  );
}
