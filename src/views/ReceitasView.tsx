import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Download,
  Copy,
  Trash2,
  Edit,
  TrendingUp,
  User,
  Wallet,
  Building2
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Income, RecurrenceType } from '../types';

export const ReceitasView: React.FC<{ onOpenQuickAdd: (tab?: 'receita') => void }> = ({ onOpenQuickAdd }) => {
  const {
    filteredIncomes,
    categories,
    people,
    accounts,
    deleteIncome,
    duplicateIncome,
    updateIncome,
    addIncome,
    settings
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

  const totalReceitas = useMemo(() => {
    return filteredIncomes.reduce((acc, i) => acc + i.amount, 0);
  }, [filteredIncomes]);

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
    setRecurrence(inc.recurrence);
    setNotes(inc.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount || Number(amount) <= 0) return;

    if (editingIncome) {
      await updateIncome(editingIncome.id, {
        description: desc,
        amount: Number(amount),
        date,
        categoryId: catId,
        source,
        accountId: accId,
        personId,
        recurrence,
        notes
      });
    } else {
      await addIncome({
        description: desc,
        amount: Number(amount),
        date,
        categoryId: catId,
        source,
        accountId: accId,
        personId,
        recurrence,
        notes
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">Total de Receitas no Período</span>
          <p className="text-3xl font-black mt-1">{formatCurrency(totalReceitas, cur)}</p>
          <p className="text-xs text-emerald-100 mt-1">{displayedIncomes.length} fontes de rendimento registadas</p>
        </div>
        <button
          onClick={openNewModal}
          className="self-start sm:self-center px-4 py-2.5 bg-white text-emerald-700 hover:bg-emerald-50 rounded-xl font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Registar Nova Receita</span>
        </button>
      </div>

      {/* Filters and search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar receitas por descrição, entidade pagadora ou categoria..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <select
              value={selectedCat}
              onChange={e => setSelectedCat(e.target.value)}
              className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="todas">Todas as Categorias</option>
              {categories.filter(c => c.type === 'income').map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              value={selectedPerson}
              onChange={e => setSelectedPerson(e.target.value)}
              className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="todas">Todas as Pessoas</option>
              {people.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Fonte / Origem</th>
                <th className="py-3 px-4">Conta Destino</th>
                <th className="py-3 px-4">Pessoa</th>
                <th className="py-3 px-4">Recorrência</th>
                <th className="py-3 px-4 text-right">Valor ({cur})</th>
                <th className="py-3 px-4 text-center">Acções</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayedIncomes.map(inc => (
                <tr key={inc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{formatDate(inc.date)}</td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{inc.description}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold text-xs">
                      {categoryMap.get(inc.categoryId) || 'Rendimento'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{inc.source || '-'}</td>
                  <td className="py-3 px-4 text-slate-500">{accountMap.get(inc.accountId) || 'Principal'}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">{personMap.get(inc.personId || '') || '-'}</td>
                  <td className="py-3 px-4 text-slate-400 capitalize">{inc.recurrence}</td>
                  <td className="py-3 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    +{formatCurrency(inc.amount, cur)}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => duplicateIncome(inc)}
                        title="Duplicar"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(inc)}
                        title="Editar"
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Eliminar receita "${inc.description}"?`)) {
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
              ))}

              {displayedIncomes.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                    Nenhuma receita encontrada para os filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingIncome ? 'Editar Receita' : 'Nova Receita'}
            </h3>

            <form onSubmit={handleSaveIncome} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Descrição *</label>
                <input
                  type="text"
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="Ex: Salário Mensal, Consultoria..."
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
                  placeholder="Ex: 650000"
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
                    {categories.filter(c => c.type === 'income').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Entidade / Fonte</label>
                  <input
                    type="text"
                    value={source}
                    onChange={e => setSource(e.target.value)}
                    placeholder="Ex: Empresa, Cliente..."
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Conta de Destino *</label>
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
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pessoa</label>
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
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Recorrência</label>
                  <select
                    value={recurrence}
                    onChange={e => setRecurrence(e.target.value as RecurrenceType)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="mensal">Mensal</option>
                    <option value="quinzenal">Quinzenal</option>
                    <option value="semanal">Semanal</option>
                    <option value="nenhuma">Pontual / Nenhuma</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Observações</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl cursor-pointer shadow-sm"
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
