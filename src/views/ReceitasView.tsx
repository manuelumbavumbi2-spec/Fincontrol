import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Download,
  Copy,
  Trash2,
  Edit,
  TrendingUp,
  TrendingDown,
  User,
  Wallet,
  Building2,
  ArrowRightLeft,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Income, RecurrenceType, ActiveView } from '../types';
import { exportCustomToCSV } from '../utils/exports';

interface ReceitasViewProps {
  onOpenQuickAdd: (tab?: 'receita' | 'despesa') => void;
  onSelectView?: (view: ActiveView) => void;
}

export const ReceitasView: React.FC<ReceitasViewProps> = ({ onOpenQuickAdd, onSelectView }) => {
  const {
    filteredIncomes,
    filteredExpenses,
    categories,
    people,
    accounts,
    deleteIncome,
    duplicateIncome,
    updateIncome,
    addIncome,
    settings,
    period
  } = useFinance();

  const cur = settings.currency || 'Kz';

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('todas');
  const [selectedPerson, setSelectedPerson] = useState('todas');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  // Form states
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [catId, setCatId] = useState(categories.find(c => c.type === 'income')?.id || '');
  const [source, setSource] = useState('');
  const [accId, setAccId] = useState(accounts[0]?.id || '');
  const [personId, setPersonId] = useState(people[0]?.id || '');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('mensal');
  const [notes, setNotes] = useState('');

  const categoryMap = new Map(categories.map(c => [c.id, c.name]));
  const personMap = new Map(people.map(p => [p.id, p.name]));
  const accountMap = new Map(accounts.map(a => [a.id, a.name]));

  // Synchronized metrics
  const totalReceitas = useMemo(() => {
    return filteredIncomes.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
  }, [filteredIncomes]);

  const totalDespesas = useMemo(() => {
    return filteredExpenses
      .filter(e => e.status !== 'cancelado')
      .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  }, [filteredExpenses]);

  const saldoLiquido = totalReceitas - totalDespesas;
  const taxaPoupanca = totalReceitas > 0 ? Math.max(0, (saldoLiquido / totalReceitas) * 100) : 0;

  const displayedIncomes = useMemo(() => {
    return filteredIncomes
      .filter(inc => {
        if (selectedCat !== 'todas' && inc.categoryId !== selectedCat) return false;
        if (selectedPerson !== 'todas' && inc.personId !== selectedPerson) return false;
        if (search.trim()) {
          const s = search.toLowerCase();
          return (
            inc.description.toLowerCase().includes(s) ||
            (inc.source || '').toLowerCase().includes(s) ||
            (categoryMap.get(inc.categoryId) || '').toLowerCase().includes(s)
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredIncomes, selectedCat, selectedPerson, search, categoryMap]);

  const openNewModal = () => {
    setEditingIncome(null);
    setDesc('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setCatId(categories.find(c => c.type === 'income')?.id || '');
    setSource('');
    setAccId(accounts[0]?.id || '');
    setPersonId(people[0]?.id || '');
    setRecurrence('mensal');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (inc: Income) => {
    setEditingIncome(inc);
    setDesc(inc.description);
    setAmount(String(inc.amount));
    setDate(inc.date);
    setCatId(inc.categoryId);
    setSource(inc.source || '');
    setAccId(inc.accountId);
    setPersonId(inc.personId || '');
    setRecurrence(inc.recurrence || 'mensal');
    setNotes(inc.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim() || !amount || Number(amount) <= 0) return;

    const payload = {
      description: desc.trim(),
      amount: Number(amount),
      date,
      categoryId: catId,
      source: source.trim() || 'Rendimento',
      accountId: accId,
      personId: personId || undefined,
      recurrence,
      notes: notes.trim() || undefined
    };

    if (editingIncome) {
      await updateIncome(editingIncome.id, payload);
    } else {
      await addIncome(payload);
    }

    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    const dataToExport = displayedIncomes.map(inc => ({
      Data: formatDate(inc.date),
      Descricao: inc.description,
      Valor_Kz: inc.amount,
      Fonte: inc.source || '',
      Categoria: categoryMap.get(inc.categoryId) || '',
      Pessoa: personMap.get(inc.personId || '') || '',
      Conta: accountMap.get(inc.accountId) || '',
      Recorrencia: inc.recurrence || '',
      Observacoes: inc.notes || ''
    }));
    exportCustomToCSV(dataToExport, `receitas_fincontrol_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6">
      {/* 1. PAINEL DE SINCRONIZAÇÃO: RECEITAS & DESPESAS */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-emerald-900/50">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-emerald-800/40">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <ArrowRightLeft className="w-3 h-3" />
                Sincronização Receitas & Despesas
              </span>
              <span className="text-xs text-emerald-200">Período: {period.replace('_', ' ')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black mt-1">
              Entradas & Fluxo de Caixa Integrado
            </h2>
            <p className="text-xs text-emerald-200/80">
              Todas as receitas alimentam o saldo das contas e cobrem os tectos de despesas em tempo real.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {onSelectView && (
              <button
                type="button"
                onClick={() => onSelectView('despesas')}
                className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 border border-slate-700"
              >
                <span>Ver Menu Despesas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenQuickAdd('despesa')}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Despesa</span>
            </button>
          </div>
        </div>

        {/* 4 Synchronized Financial Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Total de Receitas
            </span>
            <p className="text-lg sm:text-xl font-black text-white mt-1">
              {formatCurrency(totalReceitas, cur)}
            </p>
            <span className="text-[10px] text-emerald-300/80 font-medium">{filteredIncomes.length} registos auferidos</span>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
              Despesas Realizadas
            </span>
            <p className="text-lg sm:text-xl font-black text-white mt-1">
              {formatCurrency(totalDespesas, cur)}
            </p>
            <span className="text-[10px] text-rose-300/80 font-medium">Consumidas no período</span>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-indigo-400" />
              Saldo Líquido
            </span>
            <p className={`text-lg sm:text-xl font-black mt-1 ${saldoLiquido >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(saldoLiquido, cur)}
            </p>
            <span className="text-[10px] text-indigo-200/80 font-medium">
              {saldoLiquido >= 0 ? 'Margem disponível' : 'Excesso de despesas'}
            </span>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <div className="flex justify-between items-center text-[11px] font-bold text-teal-300 uppercase tracking-wider">
              <span>Margem Livre</span>
              <span>{taxaPoupanca.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2.5 bg-black/40 rounded-full mt-2 overflow-hidden border border-white/10">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, taxaPoupanca))}%` }}
              />
            </div>
            <span className="text-[10px] text-teal-200/80 font-medium block mt-1">
              Capacidade de poupança/investimento
            </span>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & ACTION BAR */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por descrição, entidade pagadora ou categoria..."
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
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar</span>
            </button>

            <button
              type="button"
              onClick={openNewModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Receita</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-0.5">Categoria</label>
            <select
              value={selectedCat}
              onChange={e => setSelectedCat(e.target.value)}
              className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="todas">Todas as Categorias</option>
              {categories.filter(c => c.type === 'income').map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-0.5">Pessoa / Titular</label>
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
        </div>
      </div>

      {/* 3. INCOMES TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4">Entidade Pagadora</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Membro</th>
                <th className="py-3 px-4">Conta Creditada</th>
                <th className="py-3 px-4 text-right">Valor ({cur})</th>
                <th className="py-3 px-4 text-center">Acções</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayedIncomes.map(inc => {
                const cat = categoryMap.get(inc.categoryId) || 'Geral';
                const per = personMap.get(inc.personId || '') || 'Família';
                const acc = accountMap.get(inc.accountId) || 'Principal';

                return (
                  <tr key={inc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap font-medium">
                      {formatDate(inc.date)}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                      {inc.description}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">
                      {inc.source || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold text-xs">
                        {cat}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">{per}</td>
                    <td className="py-3 px-4 text-slate-500 truncate max-w-[140px]">{acc}</td>
                    <td className="py-3 px-4 text-right font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap font-mono text-sm sm:text-base">
                      +{formatCurrency(inc.amount, cur)}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          type="button"
                          onClick={() => duplicateIncome(inc)}
                          title="Duplicar"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(inc)}
                          title="Editar"
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Eliminar a receita "${inc.description}"?`)) {
                              deleteIncome(inc.id);
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

              {displayedIncomes.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    Nenhuma receita registada com os filtros actuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MODAL NOVA / EDITAR RECEITA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">
              {editingIncome ? 'Editar Receita' : 'Nova Receita'}
            </h3>

            <form onSubmit={handleSaveIncome} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Descrição *</label>
                <input
                  type="text"
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="Ex: Salário Mensal, Subsídio de Férias, Consultoria..."
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
                  placeholder="Ex: 450000"
                  required
                  className="w-full px-3 py-2 text-base font-black bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Data *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Categoria *</label>
                  <select
                    value={catId}
                    onChange={e => setCatId(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  >
                    {categories.filter(c => c.type === 'income').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Entidade Pagadora / Fonte</label>
                <input
                  type="text"
                  value={source}
                  onChange={e => setSource(e.target.value)}
                  placeholder="Ex: Empresa, Ministério, Cliente Particular..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Membro Titular</label>
                  <select
                    value={personId}
                    onChange={e => setPersonId(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  >
                    {people.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Conta Creditada</label>
                  <select
                    value={accId}
                    onChange={e => setAccId(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.balance, cur)})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Recorrência</label>
                <select
                  value={recurrence}
                  onChange={e => setRecurrence(e.target.value as RecurrenceType)}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                >
                  <option value="mensal">Mensal (Salário regular)</option>
                  <option value="quinzenal">Quinzenal</option>
                  <option value="semanal">Semanal</option>
                  <option value="nenhuma">Pontual / Extra (Única vez)</option>
                  <option value="anual">Anual (Bónus / Subsídio)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Observações</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Detalhes adicionais sobre a receita..."
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
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  Guardar Receita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
