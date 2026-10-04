import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  Plus,
  Check,
  Clock,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { PlannedExpense } from '../types';

export const DespesasPlaneadasView: React.FC = () => {
  const {
    plannedExpenses,
    addPlannedExpense,
    updatePlannedExpense,
    deletePlannedExpense,
    categories,
    people,
    settings
  } = useFinance();

  const cur = settings.currency || 'Kz';
  const categoryMap = new Map(categories.map(c => [c.id, c.name]));
  const personMap = new Map(people.map(p => [p.id, p.name]));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [catId, setCatId] = useState(categories[0]?.id || '');
  const [personId, setPersonId] = useState(people[0]?.id || '');
  const [status, setStatus] = useState<any>('planeado');
  const [notes, setNotes] = useState('');

  // 10. Despesas Planeadas Calculations:
  // Total planeado, Total pago, Total pendente, Total previsto
  const totals = useMemo(() => {
    let planeado = 0;
    let pago = 0;
    let pendente = 0;
    let previsto = 0;

    for (const p of plannedExpenses) {
      planeado += p.amount;
      if (p.status === 'pago') pago += p.amount;
      else if (p.status === 'pendente') pendente += p.amount;
      else previsto += p.amount;
    }

    return { planeado, pago, pendente, previsto };
  }, [plannedExpenses]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;

    await addPlannedExpense({
      description: desc,
      amount: Number(amount),
      plannedDate: date,
      categoryId: catId,
      personId,
      status,
      notes
    });

    setIsModalOpen(false);
    setDesc('');
    setAmount('');
  };

  const handleMarkAsPaid = async (item: PlannedExpense) => {
    await updatePlannedExpense(item.id, { status: 'pago' });
  };

  return (
    <div className="space-y-6">
      {/* 4 Totals Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Planeado</span>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(totals.planeado, cur)}
          </p>
          <span className="text-[11px] text-slate-500">Soma de todos os compromissos</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Já Pago</span>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totals.pago, cur)}
          </p>
          <span className="text-[11px] text-slate-500">Compromissos liquidados</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Pendente</span>
          <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {formatCurrency(totals.pendente, cur)}
          </p>
          <span className="text-[11px] text-slate-500">A vencer brevemente</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Previsto</span>
          <p className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {formatCurrency(totals.previsto, cur)}
          </p>
          <span className="text-[11px] text-slate-500">Estimativas futuras</span>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Compromissos Futuros ({plannedExpenses.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Registe despesas futuras como creche, universidade, internet, seguros e revisões.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Planear Nova Despesa</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Data Planeada</th>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Pessoa</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Valor ({cur})</th>
                <th className="py-3 px-4 text-center">Acções</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {plannedExpenses.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{formatDate(p.plannedDate)}</td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{p.description}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs">
                      {categoryMap.get(p.categoryId) || 'Geral'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{personMap.get(p.personId || '') || '-'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      p.status === 'pago' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                    {formatCurrency(p.amount, cur)}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center space-x-1">
                      {p.status !== 'pago' && (
                        <button
                          onClick={() => handleMarkAsPaid(p)}
                          className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md font-bold text-[10px] cursor-pointer"
                        >
                          Marcar Pago
                        </button>
                      )}
                      <button
                        onClick={() => deletePlannedExpense(p.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Criar Planeada */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Planear Despesa Futura</h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Descrição *</label>
                <input
                  type="text"
                  placeholder="Ex: Seguro Automóvel ENSA, Matrícula..."
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Valor Previsto ({cur}) *</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Ex: 65000"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                    className="w-full px-2 py-1.5 text-base font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Data Planeada</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
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
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl cursor-pointer shadow-sm"
                >
                  Guardar Previsão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
