import React, { useState } from 'react';
import {
  Repeat,
  Plus,
  Calendar,
  CheckCircle,
  PlayCircle,
  Trash2,
  TrendingDown
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { RecurringTransaction, RecurrenceType } from '../types';

export const DespesasRecorrentesView: React.FC = () => {
  const {
    recurringTransactions,
    addRecurring,
    deleteRecurring,
    addExpense,
    categories,
    accounts,
    people,
    settings
  } = useFinance();

  const cur = settings.currency || 'Kz';
  const categoryMap = new Map(categories.map(c => [c.id, c.name]));
  const personMap = new Map(people.map(p => [p.id, p.name]));
  const accountMap = new Map(accounts.map(a => [a.id, a.name]));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [catId, setCatId] = useState(categories[0]?.id || '');
  const [accId, setAccId] = useState(accounts[0]?.id || '');
  const [personId, setPersonId] = useState(people[0]?.id || '');
  const [frequency, setFrequency] = useState<RecurrenceType>('mensal');
  const [nextDate, setNextDate] = useState(new Date().toISOString().split('T')[0]);

  const totalRecorrenteMensal = recurringTransactions
    .filter(r => r.type === 'expense' && r.isActive)
    .reduce((acc, r) => {
      if (r.frequency === 'anual') return acc + r.amount / 12;
      if (r.frequency === 'trimestral') return acc + r.amount / 3;
      if (r.frequency === 'semanal') return acc + r.amount * 4;
      return acc + r.amount;
    }, 0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;

    await addRecurring({
      description: desc,
      amount: Number(amount),
      type: 'expense',
      categoryId: catId,
      accountId: accId,
      personId,
      frequency,
      startDate: new Date().toISOString().split('T')[0],
      nextDueDate: nextDate,
      isActive: true
    });

    setIsModalOpen(false);
    setDesc('');
    setAmount('');
  };

  const handleLaunchNow = async (rec: RecurringTransaction) => {
    await addExpense({
      description: rec.description,
      amount: rec.amount,
      date: new Date().toISOString().split('T')[0],
      categoryId: rec.categoryId,
      accountId: rec.accountId,
      personId: rec.personId,
      paymentMethod: 'transferencia',
      status: 'pago',
      recurrence: rec.frequency,
      notes: `Gerado a partir da recorrência (${rec.frequency})`
    });

    alert(`Despesa "${rec.description}" lançada e debitada com sucesso!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Compromissos Recorrentes Mensais</span>
          <p className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatCurrency(totalRecorrenteMensal, cur)}/mês
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {recurringTransactions.length} assinaturas e despesas fixas cadastradas
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Recorrência</span>
        </button>
      </div>

      {/* Grid of Recurrings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {recurringTransactions.map(rec => (
          <div
            key={rec.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                    {rec.frequency}
                  </span>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white mt-0.5">{rec.description}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{categoryMap.get(rec.categoryId)} • {personMap.get(rec.personId || '') || 'Casa'}</p>
                </div>
                <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <Repeat className="w-4 h-4" />
                </span>
              </div>

              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-xs text-slate-400">Valor Cobrado</span>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  {formatCurrency(rec.amount, cur)}
                </p>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-500 mt-3">
                <span>Próximo vencimento:</span>
                <strong className="text-slate-800 dark:text-slate-200">{formatDate(rec.nextDueDate)}</strong>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex space-x-2">
              <button
                onClick={() => handleLaunchNow(rec)}
                className="flex-1 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Lançar Agora</span>
              </button>
              <button
                onClick={() => deleteRecurring(rec.id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nova Recorrência */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nova Despesa Recorrente</h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Descrição *</label>
                <input
                  type="text"
                  placeholder="Ex: Internet Zap Fibra, Creche, Propina..."
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Valor ({cur}) *</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Ex: 24500"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                    className="w-full px-2 py-1.5 text-base font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Frequência *</label>
                  <select
                    value={frequency}
                    onChange={e => setFrequency(e.target.value as RecurrenceType)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="mensal">Mensal</option>
                    <option value="quinzenal">Quinzenal</option>
                    <option value="semanal">Semanal</option>
                    <option value="diaria">Diária</option>
                    <option value="trimestral">Trimestral</option>
                    <option value="semestral">Semestral</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
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
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Próxima Data</label>
                  <input
                    type="date"
                    value={nextDate}
                    onChange={e => setNextDate(e.target.value)}
                    required
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
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
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl cursor-pointer shadow-sm"
                >
                  Criar Recorrência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
