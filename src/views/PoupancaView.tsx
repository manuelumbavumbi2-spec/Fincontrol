import React, { useState } from 'react';
import {
  PiggyBank,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CheckCircle,
  Clock,
  Sparkles,
  TrendingUp,
  Percent,
  Coins
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatPercent, formatDate } from '../utils/formatters';
import { SavingsGoal } from '../types';

export const PoupancaView: React.FC = () => {
  const {
    savingsGoals,
    savingsTransactions,
    accounts,
    addSavingsGoal,
    contributeSavings,
    updateSavingsGoal,
    deleteSavingsGoal,
    settings,
    updateAppSettings,
    summary
  } = useFinance();

  const cur = settings.currency || 'Kz';

  // Modal states
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isContribModalOpen, setIsContribModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  // New goal form
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [deadline, setDeadline] = useState(`${new Date().getFullYear() + 1}-12-31`);
  const [monthlyTarget, setMonthlyTarget] = useState('');
  const [accountId, setAccountId] = useState(accounts.find(a => a.type === 'poupanca')?.id || accounts[0]?.id || '');
  const [notes, setNotes] = useState('');

  // Contribution form
  const [contribAmount, setContribAmount] = useState('');
  const [contribType, setContribType] = useState<'deposito' | 'resgate'>('deposito');
  const [contribAccount, setContribAccount] = useState(accounts[0]?.id || '');
  const [contribNotes, setContribNotes] = useState('');

  // Auto-savings rule settings
  const [ruleType, setRuleType] = useState<'percent' | 'fixed'>(settings.savingsRuleType || 'percent');
  const [ruleValue, setRuleValue] = useState(String(settings.savingsRuleValue || 15));
  const [savedRuleSuccess, setSavedRuleSuccess] = useState(false);

  const totalPoupado = savingsGoals.reduce((acc, s) => acc + s.currentAmount, 0);
  const totalAlvo = savingsGoals.reduce((acc, s) => acc + s.targetAmount, 0);
  const progressoGlobal = totalAlvo > 0 ? (totalPoupado / totalAlvo) * 100 : 0;

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) return;

    const target = Number(targetAmount);
    const initial = Number(initialAmount) || 0;

    await addSavingsGoal({
      name,
      targetAmount: target,
      initialAmount: initial,
      currentAmount: initial,
      startDate: new Date().toISOString().split('T')[0],
      deadline,
      monthlyTarget: Number(monthlyTarget) || Math.round(target / 12),
      frequency: 'mensal',
      accountId,
      notes,
      status: 'em_andamento'
    });

    setIsGoalModalOpen(false);
    setName('');
    setTargetAmount('');
    setInitialAmount('');
  };

  const handleContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal || !contribAmount || Number(contribAmount) <= 0) return;

    await contributeSavings({
      goalId: selectedGoal.id,
      amount: Number(contribAmount),
      type: contribType,
      accountId: contribAccount,
      notes: contribNotes
    });

    if (contribType === 'deposito') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.85 }
      });
    }

    setIsContribModalOpen(false);
    setContribAmount('');
    setContribNotes('');
  };

  const handleSaveRule = async () => {
    await updateAppSettings({
      savingsRuleType: ruleType,
      savingsRuleValue: Number(ruleValue)
    });
    setSavedRuleSuccess(true);
    setTimeout(() => setSavedRuleSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
              Total Acumulado em Poupança
            </span>
            <p className="text-3xl sm:text-4xl font-black mt-1">
              {formatCurrency(totalPoupado, cur)}
            </p>
            <p className="text-xs text-blue-100 mt-1">
              Meta Combinada: {formatCurrency(totalAlvo, cur)} ({progressoGlobal.toFixed(1)}% alcançado)
            </p>
          </div>

          <button
            onClick={() => setIsGoalModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Nova Meta de Poupança</span>
          </button>
        </div>

        {/* Global Progress */}
        <div className="w-full h-2.5 bg-blue-950/40 rounded-full mt-4 overflow-hidden">
          <div
            className="h-full bg-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, progressoGlobal)}%` }}
          />
        </div>
      </div>

      {/* 14. POUPANÇA AUTOMÁTICA & CÁLCULOS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Regra de Poupança Automática</h3>
          </div>
          {savedRuleSuccess && (
            <span className="text-xs font-bold text-emerald-600">Regra guardada com sucesso!</span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setRuleType('percent')}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition-colors ${
                ruleType === 'percent'
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              Percentagem do Rendimento (%)
            </button>
            <button
              onClick={() => setRuleType('fixed')}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition-colors ${
                ruleType === 'fixed'
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              Valor Fixo Mensal ({cur})
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={ruleValue}
              onChange={e => setRuleValue(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white"
            />
            <button
              onClick={handleSaveRule}
              className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Aplicar
            </button>
          </div>

          <div className="text-xs p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-slate-600 dark:text-slate-300">
            <p className="font-semibold text-slate-800 dark:text-slate-200">Fórmula de Disponibilidade:</p>
            <p className="text-[11px] font-mono mt-0.5">Receitas − Despesas − Poupança − Investimentos</p>
            <p className="text-[11px] font-bold text-emerald-600 mt-0.5">
              Disponível actual: {formatCurrency(summary.disponivel, cur)}
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Savings Goals */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
          Metas de Poupança em Andamento ({savingsGoals.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savingsGoals.map(goal => {
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
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">{goal.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Prazo: {formatDate(goal.deadline)}</p>
                    </div>
                    <span className="text-xs font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                      {pct.toFixed(0)}%
                    </span>
                  </div>

                  <div className="mt-4 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Poupado:</span>
                      <strong className="text-sm font-black text-blue-600 dark:text-blue-400">{formatCurrency(goal.currentAmount, cur)}</strong>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Meta:</span>
                      <strong className="text-slate-700 dark:text-slate-300">{formatCurrency(goal.targetAmount, cur)}</strong>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Falta:</span>
                      <strong className="text-rose-600 font-semibold">{formatCurrency(falta, cur)}</strong>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>

                  {goal.monthlyTarget > 0 && (
                    <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-[11px] text-slate-500 flex justify-between">
                      <span>Reforço planeado:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(goal.monthlyTarget, cur)}/mês</strong>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedGoal(goal);
                      setContribType('deposito');
                      setIsContribModalOpen(true);
                    }}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Contribuir</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedGoal(goal);
                      setContribType('resgate');
                      setIsContribModalOpen(true);
                    }}
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Retirar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Criar Nova Meta de Poupança */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Criar Nova Meta de Poupança</h3>

            <form onSubmit={handleCreateGoal} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome da Meta *</label>
                <input
                  type="text"
                  placeholder="Ex: Fundo de Emergência, Compra de Casa, Férias..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Valor-Alvo ({cur}) *</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Ex: 2000000"
                    value={targetAmount}
                    onChange={e => setTargetAmount(e.target.value)}
                    required
                    className="w-full px-2 py-1.5 text-base font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Valor Inicial ({cur})</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Ex: 100000"
                    value={initialAmount}
                    onChange={e => setInitialAmount(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Prazo Final</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    required
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Meta Mensal Pretendida</label>
                  <input
                    type="number"
                    placeholder="Ex: 100000"
                    value={monthlyTarget}
                    onChange={e => setMonthlyTarget(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Conta Onde Está Guardado</label>
                <select
                  value={accountId}
                  onChange={e => setAccountId(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.bankName || a.type})</option>
                  ))}
                </select>
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
                  onClick={() => setIsGoalModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl cursor-pointer shadow-sm"
                >
                  Criar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Contribuir para Poupança */}
      {isContribModalOpen && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {contribType === 'deposito' ? 'Reforçar Poupança' : 'Retirar da Poupança'}
            </h3>
            <p className="text-xs text-blue-600 font-bold">{selectedGoal.name}</p>

            <form onSubmit={handleContribution} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Valor ({cur}) *</label>
                <input
                  type="number"
                  step="any"
                  placeholder="Ex: 50000"
                  value={contribAmount}
                  onChange={e => setContribAmount(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-3 py-2 text-xl font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Conta Bancária</label>
                <select
                  value={contribAccount}
                  onChange={e => setContribAccount(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.balance, cur)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Observações</label>
                <input
                  type="text"
                  placeholder="Ex: Reforço mensal"
                  value={contribNotes}
                  onChange={e => setContribNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsContribModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl cursor-pointer shadow-sm"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
