import React from 'react';
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  PiggyBank,
  Briefcase,
  Landmark,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  HeartPulse,
  Target,
  Sparkles,
  ChevronRight,
  CreditCard,
  Plus
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatPercent, formatDate } from '../utils/formatters';
import { ActiveView } from '../components/layout/Sidebar';

interface DashboardViewProps {
  onSelectView: (view: ActiveView) => void;
  onOpenQuickAdd: (tab?: 'despesa' | 'receita' | 'poupanca' | 'investimento' | 'transferencia') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onSelectView, onOpenQuickAdd }) => {
  const {
    summary,
    healthScore,
    filteredExpenses,
    filteredIncomes,
    categories,
    budgets,
    savingsGoals,
    debts,
    people,
    settings
  } = useFinance();

  const cur = settings.currency || 'Kz';
  const currentBudget = budgets[0] || { overallLimit: 550000 };
  const budgetLimit = currentBudget.overallLimit;
  const budgetSpent = summary.despesas;
  const budgetPercent = budgetLimit > 0 ? (budgetSpent / budgetLimit) * 100 : 0;
  const budgetRemaining = Math.max(0, budgetLimit - budgetSpent);

  const categoryMap = new Map(categories.map(c => [c.id, c.name]));
  const personMap = new Map(people.map(p => [p.id, p.name]));

  // Calculate expense breakdown by category for progress bars
  const catTotals: Record<string, number> = {};
  for (const exp of filteredExpenses) {
    if (exp.status === 'cancelado') continue;
    const catName = categoryMap.get(exp.categoryId) || 'Outros';
    catTotals[catName] = (catTotals[catName] || 0) + exp.amount;
  }
  const topCategories = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Active debts with upcoming due dates
  const activeDebts = debts.filter(d => d.status !== 'paga').slice(0, 3);

  // Recent movements (incomes & expenses combined)
  const recentMovements = [
    ...filteredExpenses.map(e => ({ ...e, movementType: 'expense' as const })),
    ...filteredIncomes.map(i => ({ ...i, movementType: 'income' as const }))
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);

  return (
    <div className="space-y-6">
      {/* 4. DASHBOARD PRINCIPAL: Top 6 Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* 1. Saldo Disponível */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Saldo Disponível
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-2 truncate">
            {formatCurrency(summary.disponivel, cur)}
          </p>
          <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-1 font-medium">Contas e Dinheiro em mão</p>
        </div>

        {/* 2. Receitas */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Receitas
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2 truncate">
            {formatCurrency(summary.receitas, cur)}
          </p>
          <div className="flex items-center text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            <span>Entradas no período</span>
          </div>
        </div>

        {/* 3. Despesas */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Despesas
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-2 truncate">
            {formatCurrency(summary.despesas, cur)}
          </p>
          <div className="flex items-center text-[11px] text-slate-700 dark:text-slate-300 mt-1 font-medium">
            <span>{filteredExpenses.length} despesas registadas</span>
          </div>
        </div>

        {/* 4. Poupança */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Poupança
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-2 truncate">
            {formatCurrency(summary.poupanca, cur)}
          </p>
          <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-1 font-medium">
            Taxa: <strong className="text-blue-600 dark:text-blue-400">{formatPercent(summary.taxaPoupanca)}</strong>
          </p>
        </div>

        {/* 5. Investimentos */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Investimentos
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2 truncate">
            {formatCurrency(summary.investimentos, cur)}
          </p>
          <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-1 font-medium">BODIVA / OT / Depósitos</p>
        </div>

        {/* 6. Património Líquido */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Património Líquido
            </span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-teal-600 dark:text-teal-400 mt-2 truncate">
            {formatCurrency(summary.patrimonioLiquido, cur)}
          </p>
          <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-1 font-medium">Activos − Dívidas</p>
        </div>
      </div>

      {/* 5. RESUMO DO MÊS & ORÇAMENTO & SAÚDE FINANCEIRA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card Resumo do Mês Detalhado */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Resumo Financeiro Mensal</h3>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Angola
            </span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-700 dark:text-slate-300">Receitas</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(summary.receitas, cur)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-700 dark:text-slate-300">Despesas</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">{formatCurrency(summary.despesas, cur)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-700 dark:text-slate-300">Poupança</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(summary.poupanca, cur)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-700 dark:text-slate-300">Investimentos</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(summary.investimentos, cur)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-700 dark:text-slate-300">Dívidas Pendentes</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{formatCurrency(summary.dividasPendentes, cur)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-bold text-slate-900 dark:text-white">Saldo do Período</span>
              <span className={`text-base font-extrabold ${summary.saldo >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                {formatCurrency(summary.saldo, cur)}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-medium">
            <span>Taxa Poupança: <strong className="text-slate-900 dark:text-white">{formatPercent(summary.taxaPoupanca)}</strong></span>
            <span>Taxa Investimento: <strong className="text-slate-900 dark:text-white">{formatPercent(summary.taxaInvestimento)}</strong></span>
          </div>
        </div>

        {/* 9. Orçamento Mensal & Progresso */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Orçamento Mensal Geral</h3>
              <button
                onClick={() => onSelectView('orcamento')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Configurar
              </button>
            </div>

            <div className="flex items-baseline justify-between mt-3">
              <div>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(budgetSpent, cur)}
                </span>
                <span className="text-xs text-slate-700 dark:text-slate-300 ml-1.5 font-medium">
                  de {formatCurrency(budgetLimit, cur)}
                </span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                budgetPercent > 90
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                  : budgetPercent > 70
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
              }`}>
                {budgetPercent.toFixed(1)}% Utilizado
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetPercent > 90 ? 'bg-rose-600' : budgetPercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, budgetPercent)}%` }}
              />
            </div>

            <div className="flex justify-between items-center mt-3 text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                Disponível para gastar: <strong className="text-slate-900 dark:text-white">{formatCurrency(budgetRemaining, cur)}</strong>
              </span>
              {budgetPercent >= 80 && (
                <span className="flex items-center text-rose-700 dark:text-rose-400 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Alerta &gt; 80%
                </span>
              )}
            </div>
          </div>

          {/* Quick breakdown preview */}
          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Principais Categorias
            </h4>
            <div className="space-y-2">
              {topCategories.slice(0, 3).map(([cat, amt]) => {
                const pct = summary.despesas > 0 ? (amt / summary.despesas) * 100 : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{cat}</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(amt, cur)} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 39. INTELIGÊNCIA FINANCEIRA: Saúde Financeira (0 a 100) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <HeartPulse className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Saúde Financeira</h3>
              </div>
              <button
                onClick={() => onSelectView('saude')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Ver Detalhes
              </button>
            </div>

            <div className="flex items-center space-x-4 my-2">
              <div className="relative w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-tr from-emerald-500 via-teal-500 to-blue-600 text-white shadow-md">
                <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-slate-900 dark:text-white leading-none">
                    {healthScore.score}
                  </span>
                  <span className="text-[9px] text-slate-700 dark:text-slate-300 font-semibold uppercase">/100</span>
                </div>
              </div>
              <div>
                <p className="text-base font-bold text-slate-900 dark:text-white">Classificação: {healthScore.rating}</p>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">Baseado em orçamento, poupança, dívidas e património.</p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/50">
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Recomendação FinControl:
              </p>
              <p className="text-xs text-blue-800 dark:text-blue-200">
                {healthScore.recommendations[0]}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <button
              onClick={() => onSelectView('ia')}
              className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Consultar Assistente Financeiro IA</span>
            </button>
          </div>
        </div>
      </div>

      {/* RECENT MOVEMENTS & SAVINGS GOALS & UPCOMING DEBTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Movements */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Movimentos Recentes</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onSelectView('despesas')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Ver Todas as Despesas
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentMovements.map(item => {
              const isIncome = item.movementType === 'income';
              const catName = categoryMap.get(item.categoryId) || 'Geral';
              const personName = personMap.get(item.personId || '') || 'Casa';

              return (
                <div key={item.id} className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl px-2 transition-colors">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isIncome
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                    }`}>
                      {isIncome ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {item.description}
                      </p>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-600 dark:text-slate-400">
                        <span>{formatDate(item.date)}</span>
                        <span>•</span>
                        <span className="font-medium">{catName}</span>
                        <span>•</span>
                        <span className="text-slate-700 dark:text-slate-300 font-semibold">{personName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    <p className={`text-sm font-extrabold ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(item.amount, cur)}
                    </p>
                    <span className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400">
                      {'status' in item ? item.status : 'concluído'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between">
            <button
              onClick={() => onOpenQuickAdd('despesa')}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Nova Despesa
            </button>
            <button
              onClick={() => onOpenQuickAdd('receita')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Nova Receita
            </button>
          </div>
        </div>

        {/* Right Col: Metas de Poupança & Obrigações Vencendo */}
        <div className="space-y-6">
          {/* Metas de Poupança */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Metas de Poupança</h3>
              <button
                onClick={() => onSelectView('poupanca')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Gerir Metas
              </button>
            </div>

            <div className="space-y-4">
              {savingsGoals.slice(0, 3).map(goal => {
                const pct = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                return (
                  <div key={goal.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-900 dark:text-white">{goal.name}</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                      <span>{formatCurrency(goal.currentAmount, cur)}</span>
                      <span>Meta: {formatCurrency(goal.targetAmount, cur)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dívidas & Obrigações */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Próximos Pagamentos / Dívidas</h3>
              <button
                onClick={() => onSelectView('dividas')}
                className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
              >
                Ver Dívidas
              </button>
            </div>

            <div className="space-y-3">
              {activeDebts.map(debt => (
                <div key={debt.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{debt.creditor}</p>
                      <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">{debt.description}</p>
                    </div>
                    <span className="text-xs font-extrabold text-red-600 dark:text-red-400">
                      {formatCurrency(debt.installmentAmount, cur)}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between items-center text-[10px] text-slate-600 dark:text-slate-400">
                    <span>Vencimento: {formatDate(debt.dueDate)}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">Resta: {formatCurrency(debt.remainingAmount, cur)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
