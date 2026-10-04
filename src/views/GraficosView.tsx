import React from 'react';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Briefcase,
  Landmark,
  PiggyBank
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatPercent } from '../utils/formatters';

export const GraficosView: React.FC = () => {
  const { filteredExpenses, filteredIncomes, categories, summary, settings } = useFinance();
  const cur = settings.currency || 'Kz';

  const categoryMap = new Map(categories.map(c => [c.id, c.name]));

  // Group expenses by category
  const catTotals: Record<string, number> = {};
  let maxCat = 1;
  for (const exp of filteredExpenses) {
    if (exp.status === 'cancelado') continue;
    const name = categoryMap.get(exp.categoryId) || 'Outros';
    catTotals[name] = (catTotals[name] || 0) + exp.amount;
    if (catTotals[name] > maxCat) maxCat = catTotals[name];
  }

  const sortedCatEntries = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      {/* 26. GRÁFICOS: Row 1: Receitas vs Despesas + Orçamento Utilizado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Receitas vs Despesas Bar Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h4 className="font-bold text-base text-slate-900 dark:text-white">Receitas versus Despesas</h4>
          </div>

          <div className="h-60 flex items-end justify-center space-x-12 px-6 pt-6 pb-2 border-b border-slate-100 dark:border-slate-800">
            {/* Receitas Bar */}
            <div className="flex flex-col items-center space-y-2 flex-1 max-w-[100px]">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(summary.receitas, cur)}
              </span>
              <div
                className="w-full bg-gradient-to-t from-emerald-600 to-teal-500 rounded-t-xl transition-all duration-500 shadow-sm"
                style={{
                  height: `${Math.max(15, (summary.receitas / Math.max(summary.receitas, summary.despesas, 1)) * 180)}px`
                }}
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Receitas</span>
            </div>

            {/* Despesas Bar */}
            <div className="flex flex-col items-center space-y-2 flex-1 max-w-[100px]">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(summary.despesas, cur)}
              </span>
              <div
                className="w-full bg-gradient-to-t from-rose-600 to-pink-500 rounded-t-xl transition-all duration-500 shadow-sm"
                style={{
                  height: `${Math.max(15, (summary.despesas / Math.max(summary.receitas, summary.despesas, 1)) * 180)}px`
                }}
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Despesas</span>
            </div>
          </div>

          <div className="mt-4 flex justify-between text-xs text-slate-500">
            <span>Saldo Líquido: <strong className="text-slate-900 dark:text-white font-bold">{formatCurrency(summary.saldo, cur)}</strong></span>
            <span>Taxa Poupança: <strong className="text-blue-600 font-bold">{formatPercent(summary.taxaPoupanca)}</strong></span>
          </div>
        </div>

        {/* Distribuição do Saldo Mensal */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center space-x-2 mb-4">
            <PieChart className="w-5 h-5 text-indigo-600" />
            <h4 className="font-bold text-base text-slate-900 dark:text-white">Alocação do Rendimento Mensal</h4>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-500">Despesas Operacionais ({formatCurrency(summary.despesas, cur)})</span>
                <span className="text-rose-600 font-bold">{summary.receitas > 0 ? ((summary.despesas / summary.receitas) * 100).toFixed(1) : 0}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(100, summary.receitas > 0 ? (summary.despesas / summary.receitas) * 100 : 0)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-500">Poupança Acumulada ({formatCurrency(summary.poupanca, cur)})</span>
                <span className="text-blue-600 font-bold">{formatPercent(summary.taxaPoupanca)}</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(100, summary.taxaPoupanca)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-500">Investimentos ({formatCurrency(summary.investimentos, cur)})</span>
                <span className="text-indigo-600 font-bold">{formatPercent(summary.taxaInvestimento)}</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${Math.min(100, summary.taxaInvestimento)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-500">Saldo Livre Disponível ({formatCurrency(summary.disponivel, cur)})</span>
                <span className="text-emerald-600 font-bold">{summary.receitas > 0 ? ((summary.disponivel / summary.receitas) * 100).toFixed(1) : 0}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, summary.receitas > 0 ? (summary.disponivel / summary.receitas) * 100 : 0)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Despesas por Categoria Ranking */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h4 className="font-bold text-base text-slate-900 dark:text-white mb-4">
          Despesas por Categoria (Ranking de Gastos)
        </h4>

        <div className="space-y-3.5">
          {sortedCatEntries.map(([cat, amt]) => {
            const pctOfTotal = summary.despesas > 0 ? (amt / summary.despesas) * 100 : 0;
            const barWidth = maxCat > 0 ? (amt / maxCat) * 100 : 0;

            return (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{cat}</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(amt, cur)} ({pctOfTotal.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
