import React, { useState } from 'react';
import {
  Target,
  Plus,
  Calendar,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatPercent, formatDate } from '../utils/formatters';
import { FinancialGoal } from '../types';

export const MetasView: React.FC = () => {
  const { financialGoals, addFinancialGoal, updateFinancialGoal, deleteFinancialGoal, settings } = useFinance();
  const cur = settings.currency || 'Kz';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<any>('educacao');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [deadline, setDeadline] = useState(`${new Date().getFullYear() + 3}-12-31`);
  const [notes, setNotes] = useState('');

  // Calculate monthly contribution automatically
  const calcMonthly = (target: number, current: number, deadlineStr: string): number => {
    const d = new Date(deadlineStr);
    const now = new Date();
    const months = Math.max(1, (d.getFullYear() - now.getFullYear()) * 12 + (d.getMonth() - now.getMonth()));
    const remaining = Math.max(0, target - current);
    return Math.round(remaining / months);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount) return;

    const target = Number(targetAmount);
    const curr = Number(currentAmount) || 0;
    const monthly = calcMonthly(target, curr, deadline);

    await addFinancialGoal({
      title,
      category,
      targetAmount: target,
      currentAmount: curr,
      deadline,
      monthlyContribution: monthly,
      status: 'em_andamento',
      notes
    });

    setIsModalOpen(false);
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('0');
  };

  const handleAddProgress = async (goal: FinancialGoal) => {
    const input = prompt(`Adicionar quanto à meta "${goal.title}" (${cur})?`, String(goal.monthlyContribution));
    if (!input || isNaN(Number(input))) return;

    const added = Number(input);
    const newTotal = goal.currentAmount + added;
    const isCompleted = newTotal >= goal.targetAmount;

    await updateFinancialGoal(goal.id, {
      currentAmount: newTotal,
      status: isCompleted ? 'concluida' : 'em_andamento'
    });

    if (isCompleted) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Metas Financeiras ({financialGoals.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Objectivos de vida calculados com base no tempo e esforço mensal necessário.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Meta Financeira</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {financialGoals.map(goal => {
          const pct = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
          const falta = Math.max(0, goal.targetAmount - goal.currentAmount);

          return (
            <div
              key={goal.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      {goal.category}
                    </span>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white mt-0.5">
                      {goal.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">Prazo alvo: {formatDate(goal.deadline)}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    goal.status === 'concluida' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-50 text-purple-700'
                  }`}>
                    {pct.toFixed(0)}%
                  </span>
                </div>

                <div className="mt-4 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Progresso Actual:</span>
                    <strong className="text-purple-600 dark:text-purple-400 font-bold">{formatCurrency(goal.currentAmount, cur)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Objectivo Final:</span>
                    <strong className="text-slate-700 dark:text-slate-300">{formatCurrency(goal.targetAmount, cur)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Valor em Falta:</span>
                    <strong className="text-rose-600 font-semibold">{formatCurrency(falta, cur)}</strong>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>

                <div className="mt-3 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs flex justify-between items-center">
                  <span className="text-slate-500">Esforço Mensal Recomendado:</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{formatCurrency(goal.monthlyContribution, cur)}/mês</strong>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex space-x-2">
                <button
                  onClick={() => handleAddProgress(goal)}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Aportar à Meta</span>
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Eliminar meta "${goal.title}"?`)) {
                      deleteFinancialGoal(goal.id);
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Nova Meta */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Criar Nova Meta Financeira</h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Título da Meta *</label>
                <input
                  type="text"
                  placeholder="Ex: Educação dos Filhos, Construção de Vivenda..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Categoria *</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="educacao">Educação</option>
                    <option value="casa">Habitação / Casa</option>
                    <option value="viatura">Viatura</option>
                    <option value="negocio">Negócio Próprio</option>
                    <option value="emergencia">Emergência</option>
                    <option value="viagem">Viagem</option>
                    <option value="compra">Compra Importante</option>
                    <option value="outra">Outra</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Valor Alvo ({cur}) *</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Ex: 6000000"
                    value={targetAmount}
                    onChange={e => setTargetAmount(e.target.value)}
                    required
                    className="w-full px-2 py-1.5 text-base font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Valor Inicial</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Ex: 500000"
                    value={currentAmount}
                    onChange={e => setCurrentAmount(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Prazo Alvo</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    required
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
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
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl cursor-pointer shadow-sm"
                >
                  Criar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
