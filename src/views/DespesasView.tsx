import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Copy,
  Trash2,
  Edit,
  TrendingDown,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  Wallet,
  Tag,
  AlertCircle
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Expense, ExpenseStatus, PaymentMethod, RecurrenceType } from '../types';
import { exportToCSV } from '../utils/exports';

export const DespesasView: React.FC<{ onOpenQuickAdd: (tab?: 'despesa') => void }> = ({ onOpenQuickAdd }) => {
  const {
    filteredExpenses,
    categories,
    people,
    accounts,
    deleteExpense,
    duplicateExpense,
    updateExpense,
    addExpense,
    settings
  } = useFinance();

  const cur = settings.currency || 'Kz';

  // Filters & search
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('todas');
  const [selectedPerson, setSelectedPerson] = useState('todas');
  const [selectedStatus, setSelectedStatus] = useState('todos');
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
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const categoryMap = new Map(categories.map(c => [c.id, c.name]));
  const personMap = new Map(people.map(p => [p.id, p.name]));
  const accountMap = new Map(accounts.map(a => [a.id, a.name]));

  // Stats calculation
  const stats = useMemo(() => {
    let totalGasto = 0;
    let totalPago = 0;
    let totalPendente = 0;
    let totalPrevisto = 0;

    for (const exp of filteredExpenses) {
      if (exp.status === 'cancelado') continue;
      totalGasto += exp.amount;
      if (exp.status === 'pago') totalPago += exp.amount;
      else if (exp.status === 'pendente') totalPendente += exp.amount;
      else if (exp.status === 'previsto') totalPrevisto += exp.amount;
    }

    return { totalGasto, totalPago, totalPendente, totalPrevisto };
  }, [filteredExpenses]);

  // Filtered and sorted list
  const displayedExpenses = useMemo(() => {
    return filteredExpenses
      .filter(exp => {
        if (selectedCat !== 'todas' && exp.categoryId !== selectedCat) return false;
        if (selectedPerson !== 'todas' && exp.personId !== selectedPerson) return false;
        if (selectedStatus !== 'todos' && exp.status !== selectedStatus) return false;
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
  }, [filteredExpenses, selectedCat, selectedPerson, selectedStatus, search, sortBy, categoryMap, personMap]);

  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setDesc(exp.description);
    setAmount(String(exp.amount));
    setDate(exp.date);
    setCatId(exp.categoryId);
    setPersonId(exp.personId || '');
    setAccId(exp.accountId);
    setPaymentMethod(exp.paymentMethod);
    setStatus(exp.status);
    setRecurrence(exp.recurrence);
    setLocation(exp.location || '');
    setNotes(exp.notes || '');
    setIsModalOpen(true);
  };

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
    setLocation('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount || Number(amount) <= 0) return;

    if (editingExpense) {
      await updateExpense(editingExpense.id, {
        description: desc,
        amount: Number(amount),
        date,
        categoryId: catId,
        personId,
        accountId: accId,
        paymentMethod,
        status,
        recurrence,
        location,
        notes
      });
    } else {
      await addExpense({
        description: desc,
        amount: Number(amount),
        date,
        categoryId: catId,
        personId,
        accountId: accId,
        paymentMethod,
        status,
        recurrence,
        location,
        notes
      });
    }

    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    exportToCSV(displayedExpenses, categories, people, accounts);
  };

  return (
    <div className="space-y-6">
      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Total de Despesas</span>
          <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatCurrency(stats.totalGasto, cur)}
          </p>
          <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">{displayedExpenses.length} despesas no filtro actual</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Despesas Pagas</span>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(stats.totalPago, cur)}
          </p>
          <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Liquidadas e deduzidas da conta</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Despesas Pendentes</span>
          <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {formatCurrency(stats.totalPendente, cur)}
          </p>
          <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Aguardando pagamento</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Despesas Previstas</span>
          <p className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {formatCurrency(stats.totalPrevisto, cur)}
          </p>
          <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Compromissos agendados</span>
        </div>
      </div>

      {/* Action Bar & Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por descrição, categoria, pessoa, local..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={openNewModal}
              className="flex items-center space-x-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Despesa</span>
            </button>
          </div>
        </div>

        {/* Filter dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-0.5">Categoria</label>
            <select
              value={selectedCat}
              onChange={e => setSelectedCat(e.target.value)}
              className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            >
              <option value="todas">Todas as Categorias</option>
              {categories.filter(c => c.type === 'expense').map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-0.5">Pessoa</label>
            <select
              value={selectedPerson}
              onChange={e => setSelectedPerson(e.target.value)}
              className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            >
              <option value="todas">Todos os Membros</option>
              {people.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-0.5">Estado</label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            >
              <option value="todos">Todos os Estados</option>
              <option value="pago">Pago</option>
              <option value="pendente">Pendente</option>
              <option value="previsto">Previsto</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-0.5">Ordenar</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            >
              <option value="date_desc">Mais Recentes</option>
              <option value="date_asc">Mais Antigas</option>
              <option value="amount_desc">Maior Valor</option>
              <option value="amount_asc">Menor Valor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Pessoa</th>
                <th className="py-3 px-4">Conta</th>
                <th className="py-3 px-4">Forma</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Valor ({cur})</th>
                <th className="py-3 px-4 text-center">Acções</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayedExpenses.map(exp => {
                const cat = categoryMap.get(exp.categoryId) || 'Geral';
                const per = personMap.get(exp.personId || '') || 'Casa';
                const acc = accountMap.get(exp.accountId) || 'Principal';

                return (
                  <tr
                    key={exp.id}
                    onClick={() => setSelectedDetail(exp)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{formatDate(exp.date)}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                      {exp.description}
                      {exp.location && <span className="block text-[10px] font-normal text-slate-400">{exp.location}</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs">
                        {cat}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">{per}</td>
                    <td className="py-3 px-4 text-slate-500 truncate max-w-[120px]">{acc}</td>
                    <td className="py-3 px-4 text-slate-500 capitalize">{exp.paymentMethod}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        exp.status === 'pago'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : exp.status === 'pendente'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                      }`}>
                        {exp.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatCurrency(exp.amount, cur)}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => duplicateExpense(exp)}
                          title="Duplicar"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(exp)}
                          title="Editar"
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Eliminar a despesa "${exp.description}"?`)) {
                              deleteExpense(exp.id);
                            }
                          }}
                          title="Eliminar"
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
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                    Nenhuma despesa encontrada para os filtros actuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova / Editar Despesa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {editingExpense ? 'Editar Despesa' : 'Nova Despesa'}
            </h3>

            <form onSubmit={handleSaveExpense} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Descrição *</label>
                <input
                  type="text"
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="Ex: Creche, Alimentação..."
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Valor ({cur}) *</label>
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="Ex: 55000"
                  required
                  className="w-full px-3 py-2 text-base font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Data *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Categoria *</label>
                  <select
                    value={catId}
                    onChange={e => setCatId(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    {categories.filter(c => c.type === 'expense').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pessoa / Família</label>
                  <select
                    value={personId}
                    onChange={e => setPersonId(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    {people.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Conta Bancária</label>
                  <select
                    value={accId}
                    onChange={e => setAccId(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Forma de Pagamento</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="multicaixa">Multicaixa / Express</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="transferencia">Transferência</option>
                    <option value="cartao">Cartão</option>
                    <option value="debito_directo">Débito Directo</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Estado</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as ExpenseStatus)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="pago">Pago</option>
                    <option value="pendente">Pendente</option>
                    <option value="previsto">Previsto</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Local / Estabelecimento</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Ex: Kero Kilamba, Candando Morro Bento..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Observações</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Notas adicionais sobre este pagamento..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl cursor-pointer shadow-sm"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Detail View Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Detalhe da Despesa</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{selectedDetail.description}</h3>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                selectedDetail.status === 'pago' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {selectedDetail.status}
              </span>
            </div>

            <div className="text-center py-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <span className="text-xs text-slate-400">Valor Total</span>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {formatCurrency(selectedDetail.amount, cur)}
              </p>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800">
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Data</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(selectedDetail.date)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Categoria</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{categoryMap.get(selectedDetail.categoryId)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Pessoa / Familiar</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{personMap.get(selectedDetail.personId || '') || 'Casa'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Conta</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{accountMap.get(selectedDetail.accountId)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Forma de Pagamento</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{selectedDetail.paymentMethod}</span>
              </div>
              {selectedDetail.location && (
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Local</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedDetail.location}</span>
                </div>
              )}
              {selectedDetail.notes && (
                <div className="py-1">
                  <span className="text-slate-400 block mb-0.5">Observações:</span>
                  <p className="text-slate-700 dark:text-slate-300 italic">{selectedDetail.notes}</p>
                </div>
              )}
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setSelectedDetail(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-xs cursor-pointer"
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
