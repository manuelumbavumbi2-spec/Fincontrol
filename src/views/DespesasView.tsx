import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Download,
  Copy,
  Trash2,
  Edit,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  Clock,
  Calendar,
  Wallet,
  ArrowRightLeft,
  Repeat,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Expense, ExpenseStatus, PaymentMethod, RecurrenceType, ActiveView } from '../types';
import { exportCustomToCSV } from '../utils/exports';

interface DespesasViewProps {
  onOpenQuickAdd: (tab?: 'despesa' | 'receita') => void;
  onSelectView?: (view: ActiveView) => void;
}

export const DespesasView: React.FC<DespesasViewProps> = ({ onOpenQuickAdd, onSelectView }) => {
  const {
    filteredExpenses,
    filteredIncomes,
    categories,
    people,
    accounts,
    deleteExpense,
    duplicateExpense,
    updateExpense,
    addExpense,
    addRecurring,
    settings,
    period
  } = useFinance();

  const cur = settings.currency || 'Kz';

  // Filters & search
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('todas');
  const [selectedPerson, setSelectedPerson] = useState('todas');
  const [selectedStatus, setSelectedStatus] = useState('todos');
  const [selectedRecurrenceFilter, setSelectedRecurrenceFilter] = useState<'todas' | 'recorrentes' | 'pontuais'>('todas');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  // Modal states
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<Expense | null>(null);

  // Form states for Add/Edit
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [catId, setCatId] = useState(categories.find(c => c.type === 'expense')?.id || '');
  const [personId, setPersonId] = useState(people[0]?.id || '');
  const [accId, setAccId] = useState(accounts[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('multicaixa');
  const [status, setStatus] = useState<ExpenseStatus>('pago');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('nenhuma');
  const [recurrenceDay, setRecurrenceDay] = useState('1');
  const [syncToRecurringLedger, setSyncToRecurringLedger] = useState(true);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const categoryMap = new Map(categories.map(c => [c.id, c.name]));
  const personMap = new Map(people.map(p => [p.id, p.name]));
  const accountMap = new Map(accounts.map(a => [a.id, a.name]));

  // Synchronized Financial Metrics: Incomes vs Expenses
  const totalReceitasPeriodo = useMemo(() => {
    return filteredIncomes.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
  }, [filteredIncomes]);

  const stats = useMemo(() => {
    let totalGasto = 0;
    let totalPago = 0;
    let totalPendente = 0;
    let totalPrevisto = 0;
    let countRecorrentes = 0;
    let countPontuais = 0;

    for (const exp of filteredExpenses) {
      if (exp.status === 'cancelado') continue;
      const val = Number(exp.amount) || 0;
      totalGasto += val;
      if (exp.status === 'pago') totalPago += val;
      else if (exp.status === 'pendente') totalPendente += val;
      else if (exp.status === 'previsto') totalPrevisto += val;

      if (exp.recurrence && exp.recurrence !== 'nenhuma') {
        countRecorrentes++;
      } else {
        countPontuais++;
      }
    }

    const saldoPeriodo = totalReceitasPeriodo - totalGasto;
    const taxaComprometimento = totalReceitasPeriodo > 0 ? (totalGasto / totalReceitasPeriodo) * 100 : 0;

    return {
      totalGasto,
      totalPago,
      totalPendente,
      totalPrevisto,
      countRecorrentes,
      countPontuais,
      saldoPeriodo,
      taxaComprometimento
    };
  }, [filteredExpenses, totalReceitasPeriodo]);

  // Filtered and sorted list
  const displayedExpenses = useMemo(() => {
    return filteredExpenses
      .filter(exp => {
        if (selectedCat !== 'todas' && exp.categoryId !== selectedCat) return false;
        if (selectedPerson !== 'todas' && exp.personId !== selectedPerson) return false;
        if (selectedStatus !== 'todos' && exp.status !== selectedStatus) return false;
        
        if (selectedRecurrenceFilter === 'recorrentes') {
          if (!exp.recurrence || exp.recurrence === 'nenhuma') return false;
        } else if (selectedRecurrenceFilter === 'pontuais') {
          if (exp.recurrence && exp.recurrence !== 'nenhuma') return false;
        }

        if (search.trim()) {
          const s = search.toLowerCase();
          const matchDesc = exp.description.toLowerCase().includes(s);
          const matchCat = (categoryMap.get(exp.categoryId) || '').toLowerCase().includes(s);
          const matchPer = (personMap.get(exp.personId || '') || '').toLowerCase().includes(s);
          const matchLoc = (exp.location || '').toLowerCase().includes(s);
          return matchDesc || matchCat || matchPer || matchLoc;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        return 0;
      });
  }, [filteredExpenses, selectedCat, selectedPerson, selectedStatus, selectedRecurrenceFilter, search, sortBy, categoryMap, personMap]);

  const openNewModal = () => {
    setEditingExpense(null);
    setDesc('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setCatId(categories.find(c => c.type === 'expense')?.id || '');
    setPersonId(people[0]?.id || '');
    setAccId(accounts[0]?.id || '');
    setPaymentMethod('multicaixa');
    setStatus('pago');
    setRecurrence('nenhuma');
    setRecurrenceDay('1');
    setSyncToRecurringLedger(true);
    setLocation('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setDesc(exp.description);
    setAmount(String(exp.amount));
    setDate(exp.date);
    setCatId(exp.categoryId);
    setPersonId(exp.personId || people[0]?.id || '');
    setAccId(exp.accountId);
    setPaymentMethod(exp.paymentMethod);
    setStatus(exp.status);
    setRecurrence(exp.recurrence || 'nenhuma');
    const day = exp.date ? new Date(exp.date).getDate() : 1;
    setRecurrenceDay(String(day));
    setSyncToRecurringLedger(false);
    setLocation(exp.location || '');
    setNotes(exp.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim() || !amount || Number(amount) <= 0) return;

    const payload = {
      description: desc.trim(),
      amount: Number(amount),
      date,
      categoryId: catId,
      personId: personId || undefined,
      accountId: accId,
      paymentMethod,
      status,
      recurrence,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined
    };

    if (editingExpense) {
      await updateExpense(editingExpense.id, payload);
    } else {
      await addExpense(payload);

      // If classified as recurrent and checkbox checked, also add to recurring transactions
      if (recurrence !== 'nenhuma' && syncToRecurringLedger) {
        try {
          await addRecurring({
            description: desc.trim(),
            amount: Number(amount),
            type: 'expense',
            categoryId: catId,
            accountId: accId,
            personId: personId || undefined,
            frequency: recurrence,
            startDate: date,
            nextDueDate: date,
            isActive: true
          });
        } catch (err) {
          console.error('Failed to register recurring transaction link:', err);
        }
      }
    }

    setIsModalOpen(false);
  };

  // Instant 1-click status toggle between Pago and Previsto
  const handleToggleStatus = async (exp: Expense, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus: ExpenseStatus = exp.status === 'pago' ? 'previsto' : 'pago';
    await updateExpense(exp.id, { status: newStatus });
  };

  const handleExportCSV = () => {
    const dataToExport = displayedExpenses.map(exp => ({
      Data: formatDate(exp.date),
      Descricao: exp.description,
      Valor_Kz: exp.amount,
      Categoria: categoryMap.get(exp.categoryId) || '',
      Pessoa: personMap.get(exp.personId || '') || '',
      Conta: accountMap.get(exp.accountId) || '',
      Forma_Pagamento: exp.paymentMethod,
      Estado: exp.status,
      Classificacao: exp.recurrence && exp.recurrence !== 'nenhuma' ? `Recorrente (${exp.recurrence})` : 'Pontual',
      Local: exp.location || '',
      Observacoes: exp.notes || ''
    }));
    exportCustomToCSV(dataToExport, `despesas_fincontrol_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6">
      {/* 1. PAINEL DE SINCRONIZAÇÃO: RECEITAS & DESPESAS (Cashflow Sync) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-indigo-900/50">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-indigo-800/40">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1">
                <ArrowRightLeft className="w-3 h-3" />
                Sincronização Despesas & Receitas
              </span>
              <span className="text-xs text-indigo-200">Período: {period.replace('_', ' ')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black mt-1">
              Balanço Operacional do Mês
            </h2>
            <p className="text-xs text-indigo-200/80">
              As despesas são calculadas em tempo real em confronto com todas as receitas auferidas.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {onSelectView && (
              <button
                type="button"
                onClick={() => onSelectView('receitas')}
                className="px-3.5 py-2 bg-indigo-600/60 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 border border-indigo-400/30"
              >
                <span>Ver Menu Receitas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenQuickAdd('receita')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Receita</span>
            </button>
          </div>
        </div>

        {/* 4 Synchronized Financial Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Receitas do Período
            </span>
            <p className="text-lg sm:text-xl font-black text-white mt-1">
              {formatCurrency(totalReceitasPeriodo, cur)}
            </p>
            <span className="text-[10px] text-emerald-300/80 font-medium">Entradas confirmadas</span>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
              Despesas Computadas
            </span>
            <p className="text-lg sm:text-xl font-black text-white mt-1">
              {formatCurrency(stats.totalGasto, cur)}
            </p>
            <span className="text-[10px] text-rose-300/80 font-medium">{filteredExpenses.length} movimentos</span>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-indigo-400" />
              Saldo Líquido
            </span>
            <p className={`text-lg sm:text-xl font-black mt-1 ${stats.saldoPeriodo >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(stats.saldoPeriodo, cur)}
            </p>
            <span className="text-[10px] text-indigo-200/80 font-medium">
              {stats.saldoPeriodo >= 0 ? 'Excedente disponível' : 'Défice no período'}
            </span>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <div className="flex justify-between items-center text-[11px] font-bold text-amber-300 uppercase tracking-wider">
              <span>Comprometimento</span>
              <span>{stats.taxaComprometimento.toFixed(1)}%</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2.5 bg-black/40 rounded-full mt-2 overflow-hidden border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  stats.taxaComprometimento > 95
                    ? 'bg-rose-500'
                    : stats.taxaComprometimento > 75
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, stats.taxaComprometimento))}%` }}
              />
            </div>
            <span className="text-[10px] text-amber-200/80 font-medium block mt-1">
              {stats.taxaComprometimento <= 70 ? 'Nível confortável' : stats.taxaComprometimento <= 90 ? 'Atenção aos limites' : 'Alerta de sobrecarga'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. STATS CARDS: PAGO vs PREVISTO vs RECORRÊNCIAS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Pago</span>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(stats.totalPago, cur)}
          </p>
          <span className="text-[11px] text-slate-400">Transacções liquidadas</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Previsto / A Pagar</span>
          <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {formatCurrency(stats.totalPrevisto + stats.totalPendente, cur)}
          </p>
          <span className="text-[11px] text-slate-400">Calendário de pagamentos</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Repeat className="w-3.5 h-3.5 text-blue-500" />
            Despesas Recorrentes
          </span>
          <p className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {stats.countRecorrentes}
          </p>
          <span className="text-[11px] text-slate-400">Fixas (renda, propina, fibra)</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Despesas Pontuais</span>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {stats.countPontuais}
          </p>
          <span className="text-[11px] text-slate-400">Variáveis e ocasionais</span>
        </div>
      </div>

      {/* 3. SEARCH & CONTROLS BAR */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar despesa, estabelecimento, membro da família ou categoria..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
              title="Exportar para Excel / CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar</span>
            </button>

            <button
              type="button"
              onClick={openNewModal}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Despesa</span>
            </button>
          </div>
        </div>

        {/* Filter dropdowns: Category, Person, Status, Recurrence, Sort */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-0.5">Categoria</label>
            <select
              value={selectedCat}
              onChange={e => setSelectedCat(e.target.value)}
              className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="todas">Todas as Categorias</option>
              {categories.filter(c => c.type === 'expense').map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-0.5">Família / Pessoa</label>
            <select
              value={selectedPerson}
              onChange={e => setSelectedPerson(e.target.value)}
              className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="todas">Todos os Membros</option>
              {people.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-0.5">Estado</label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="todos">Todos os Estados</option>
              <option value="pago">✓ Pago</option>
              <option value="previsto">⏰ Previsto</option>
              <option value="pendente">⏳ Pendente</option>
              <option value="cancelado">✕ Cancelado</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-0.5">Recorrência</label>
            <select
              value={selectedRecurrenceFilter}
              onChange={e => setSelectedRecurrenceFilter(e.target.value as any)}
              className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="todas">Todas as Despesas</option>
              <option value="recorrentes">🔁 Apenas Recorrentes</option>
              <option value="pontuais">🔹 Apenas Pontuais</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-0.5">Ordenar</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="date_desc">Mais Recentes</option>
              <option value="date_asc">Mais Antigas</option>
              <option value="amount_desc">Maior Valor</option>
              <option value="amount_asc">Menor Valor</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. EXPENSES TABLE WITH RECURRENCE CLASSIFICATION & 1-CLICK STATUS TOGGLE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4">Classificação</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Membro</th>
                <th className="py-3 px-4">Conta</th>
                <th className="py-3 px-4">Forma</th>
                <th className="py-3 px-4 text-center">Estado (Clique p/ alterar)</th>
                <th className="py-3 px-4 text-right">Valor ({cur})</th>
                <th className="py-3 px-4 text-center">Acções</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayedExpenses.map(exp => {
                const cat = categoryMap.get(exp.categoryId) || 'Geral';
                const per = personMap.get(exp.personId || '') || 'Casa';
                const acc = accountMap.get(exp.accountId) || 'Principal';
                const isRecurrent = exp.recurrence && exp.recurrence !== 'nenhuma';

                return (
                  <tr
                    key={exp.id}
                    onClick={() => setSelectedDetail(exp)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap font-medium">
                      {formatDate(exp.date)}
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                      {exp.description}
                      {exp.location && (
                        <span className="block text-[10px] font-normal text-slate-400 truncate">{exp.location}</span>
                      )}
                    </td>

                    {/* Recurrence Classification Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {isRecurrent ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          <Repeat className="w-2.5 h-2.5" />
                          <span>Recorrente ({exp.recurrence})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          <span>Pontual</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs">
                        {cat}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">{per}</td>
                    <td className="py-3 px-4 text-slate-500 truncate max-w-[120px]">{acc}</td>
                    <td className="py-3 px-4 text-slate-500 capitalize">{exp.paymentMethod}</td>

                    {/* Interactive 1-click status badge: Syncs with Calendar and Accounts */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={e => handleToggleStatus(exp, e)}
                        title="Clique para alternar entre Pago e Previsto"
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black uppercase transition-all cursor-pointer shadow-2xs hover:scale-105 ${
                          exp.status === 'pago'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200'
                            : exp.status === 'previsto'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 hover:bg-amber-200'
                            : exp.status === 'pendente'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 hover:bg-orange-200'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {exp.status === 'pago' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                        <span>{exp.status}</span>
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white whitespace-nowrap font-mono">
                      {formatCurrency(exp.amount, cur)}
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          type="button"
                          onClick={() => duplicateExpense(exp)}
                          title="Duplicar Despesa"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(exp)}
                          title="Editar Despesa"
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Tem certeza que deseja eliminar a despesa "${exp.description}"?`)) {
                              deleteExpense(exp.id);
                            }
                          }}
                          title="Eliminar Despesa"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {displayedExpenses.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 text-xs">
                    Nenhuma despesa encontrada para os filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL: NOVA / EDITAR DESPESA COM CLASSIFICAÇÃO DE RECORRÊNCIA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden p-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {editingExpense ? 'Editar Despesa' : 'Registar Nova Despesa'}
                </h3>
                <p className="text-xs text-slate-500">Defina o valor, categoria, classificação e dados de pagamento.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Descrição da Despesa *</label>
                <input
                  type="text"
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="Ex: Renda de Casa, Propinas Universidade, Compras Candando..."
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Valor ({cur}) *</label>
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="Ex: 85000"
                  required
                  className="w-full px-3 py-2.5 text-lg font-black bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-hidden"
                />
              </div>

              {/* CLASSIFICAÇÃO DE RECORRÊNCIA DA DESPESA (Requisito do Utilizador) */}
              <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 dark:text-blue-200 text-xs flex items-center gap-1.5">
                    <Repeat className="w-4 h-4 text-blue-600" />
                    Classificação de Recorrência da Despesa:
                  </span>
                  <span className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold">
                    {recurrence === 'nenhuma' ? 'Pontual' : 'Automática'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setRecurrence('nenhuma')}
                    className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                      recurrence === 'nenhuma'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    🔹 Pontual
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecurrence('mensal')}
                    className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                      recurrence === 'mensal'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    🔁 Mensal
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecurrence('semanal')}
                    className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                      recurrence === 'semanal'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    🔁 Semanal
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecurrence('anual')}
                    className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                      recurrence === 'anual'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    🔁 Anual
                  </button>
                </div>

                {recurrence !== 'nenhuma' && (
                  <div className="pt-2 border-t border-blue-200/60 dark:border-blue-800/40 space-y-2">
                    <p className="text-[11px] text-blue-800 dark:text-blue-300">
                      💡 <strong>Despesa Recorrente:</strong> Ideal para compromissos fixos como rendas de casa, propinas escolares, planos de internet Net@Casa Fibra, Zap/DStv ou salários domésticos.
                    </p>
                    {!editingExpense && (
                      <label className="flex items-center space-x-2 text-[11px] text-slate-800 dark:text-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={syncToRecurringLedger}
                          onChange={e => setSyncToRecurringLedger(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>Adicionar também à lista fixa de Recorrências do sistema</span>
                      </label>
                    )}
                  </div>
                )}
              </div>

              {/* Data e Categoria */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Data *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Categoria *</label>
                  <select
                    value={catId}
                    onChange={e => setCatId(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  >
                    {categories.filter(c => c.type === 'expense').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Membro da Família e Conta Bancária */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Membro da Família</label>
                  <select
                    value={personId}
                    onChange={e => setPersonId(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  >
                    {people.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.relationship})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Conta Bancária</label>
                  <select
                    value={accId}
                    onChange={e => setAccId(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.balance, cur)})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Forma de Pagamento e Estado (Pago ou Previsto) */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Forma de Pagamento</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  >
                    <option value="multicaixa">Multicaixa / Multicaixa Express</option>
                    <option value="dinheiro">Dinheiro Físico em Mão</option>
                    <option value="transferencia">Transferência Bancária</option>
                    <option value="cartao">Cartão de Débito/Crédito</option>
                    <option value="debito_directo">Débito Directo / Automático</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Estado (Sincronizado c/ Calendário)
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as ExpenseStatus)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                  >
                    <option value="pago">✓ Pago (Liquidado)</option>
                    <option value="previsto">⏰ Previsto (Compromisso futuro)</option>
                    <option value="pendente">⏳ Pendente (A aguardar acção)</option>
                    <option value="cancelado">✕ Cancelado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Local / Estabelecimento (Opcional)</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Ex: Kero Kilamba, Candando Morro Bento, Farmácia..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Observações (Opcional)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Notas adicionais sobre a transacção ou factura..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  {editingExpense ? 'Actualizar Despesa' : 'Guardar Despesa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL DE DETALHES DA DESPESA */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedDetail.description}</h3>
                <p className="text-xs text-slate-400">Registo nº {selectedDetail.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex justify-between items-center">
                <span className="text-slate-500">Valor da Despesa:</span>
                <strong className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">
                  {formatCurrency(selectedDetail.amount, cur)}
                </strong>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Data</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatDate(selectedDetail.date)}</span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Estado</span>
                  <span className="font-bold text-slate-900 dark:text-white capitalize">{selectedDetail.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Classificação</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {selectedDetail.recurrence && selectedDetail.recurrence !== 'nenhuma'
                      ? `Recorrente (${selectedDetail.recurrence})`
                      : 'Pontual'}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Categoria</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {categoryMap.get(selectedDetail.categoryId) || 'Geral'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Membro Familiar</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {personMap.get(selectedDetail.personId || '') || 'Geral'}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Conta Utilizada</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {accountMap.get(selectedDetail.accountId) || 'Principal'}
                  </span>
                </div>
              </div>

              {selectedDetail.location && (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Local / Estabelecimento</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedDetail.location}</span>
                </div>
              )}

              {selectedDetail.notes && (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Observações</span>
                  <p className="text-slate-700 dark:text-slate-300 italic">{selectedDetail.notes}</p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const toEdit = selectedDetail;
                  setSelectedDetail(null);
                  openEditModal(toEdit);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs cursor-pointer"
              >
                Editar Despesa
              </button>
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
