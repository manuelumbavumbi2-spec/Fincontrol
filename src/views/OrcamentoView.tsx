import React, { useState } from 'react';
import {
  PieChart,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Edit,
  Plus,
  Save,
  ArrowRight
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatPercent } from '../utils/formatters';

export const OrcamentoView: React.FC = () => {
  const { budgets, updateBudget, filteredExpenses, categories, settings } = useFinance();
  const cur = settings.currency || 'Kz';

  const currentBudget = budgets[0] || {
    id: 'bgt_current',
    userId: 'usr_manuel_01',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    overallLimit: 550000,
    categories: []
  };

  const [isEditing, setIsEditing] = useState(false);
  const [overallLimit, setOverallLimit] = useState(String(currentBudget.overallLimit));
  const [catLimits, setCatLimits] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const cb of currentBudget.categories) {
      map[cb.categoryId] = String(cb.limitAmount);
    }
    return map;
  });

  const categoryMap = new Map(categories.map(c => [c.id, c.name]));

  // Spent per category
  const spentByCategory: Record<string, number> = {};
  let totalSpent = 0;
  for (const exp of filteredExpenses) {
    if (exp.status === 'cancelado') continue;
    spentByCategory[exp.categoryId] = (spentByCategory[exp.categoryId] || 0) + exp.amount;
    totalSpent += exp.amount;
  }

  const overall = Number(overallLimit) || 550000;
  const overallSpent = totalSpent;
  const overallRemaining = Math.max(0, overall - overallSpent);
  const overallPercent = overall > 0 ? (overallSpent / overall) * 100 : 0;

  const handleSave = async () => {
    const newCategories = Object.entries(catLimits).map(([catId, amt]) => ({
      categoryId: catId,
      limitAmount: Number(amt) || 0
    }));

    await updateBudget({
      ...currentBudget,
      overallLimit: Number(overallLimit),
      categories: newCategories
    });
    setIsEditing(false);
  };

  const getAlertBadge = (pct: number) => {
    if (pct >= 100) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">100%+ Ultrapassado!</span>;
    }
    if (pct >= 90) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">90% Crítico</span>;
    }
    if (pct >= 80) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">80% Atenção</span>;
    }
    if (pct >= 70) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300">70% Utilizado</span>;
    }
    if (pct >= 50) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">50% Metade</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">Confortável</span>;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Orçamento Geral Mensal</span>
            <div className="flex items-baseline space-x-3 mt-1">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {formatCurrency(overall, cur)}
              </span>
              <span className="text-sm font-semibold text-slate-500">
                Gasto: <strong className="text-rose-600 dark:text-rose-400">{formatCurrency(overallSpent, cur)}</strong>
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (isEditing) handleSave();
              else setIsEditing(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
            <span>{isEditing ? 'Gravar Alterações' : 'Ajustar Limites'}</span>
          </button>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-600 dark:text-slate-400">
              Utilização Geral: <strong className="text-slate-900 dark:text-white">{overallPercent.toFixed(1)}%</strong>
            </span>
            <span className={overallRemaining === 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
              {overallRemaining > 0 ? `Ainda pode gastar: ${formatCurrency(overallRemaining, cur)}` : 'Orçamento Ultrapassado!'}
            </span>
          </div>

          <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallPercent >= 100
                  ? 'bg-rose-600'
                  : overallPercent >= 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, overallPercent)}%` }}
            />
          </div>
        </div>

        {/* Edit general input */}
        {isEditing && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Definir Novo Limite Geral do Mês ({cur}):
            </label>
            <input
              type="number"
              value={overallLimit}
              onChange={e => setOverallLimit(e.target.value)}
              className="w-full max-w-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-base font-bold text-slate-900 dark:text-white"
            />
          </div>
        )}
      </div>

      {/* Category Budgets Grid */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
          Tectos Orçamentais por Categoria
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.filter(c => c.type === 'expense').map(cat => {
            const limit = Number(catLimits[cat.id]) || (cat.id === 'cat_alim' ? 200000 : cat.id === 'cat_creche' ? 60000 : 30000);
            const spent = spentByCategory[cat.id] || 0;
            const pct = limit > 0 ? (spent / limit) * 100 : 0;
            const remaining = Math.max(0, limit - spent);

            return (
              <div
                key={cat.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    {cat.name}
                  </span>
                  {getAlertBadge(pct)}
                </div>

                <div className="flex justify-between items-baseline text-xs">
                  <div>
                    <span className="text-slate-400">Gasto: </span>
                    <strong className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(spent, cur)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Tecto: </span>
                    <strong className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatCurrency(limit, cur)}</strong>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      pct >= 100 ? 'bg-rose-600' : pct >= 80 ? 'bg-amber-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] pt-1">
                  <span className="text-slate-500 font-medium">{pct.toFixed(1)}% utilizado</span>
                  <span className={spent > limit ? 'text-rose-600 font-bold' : 'text-slate-600 dark:text-slate-300'}>
                    {spent > limit ? `Excedido em ${formatCurrency(spent - limit, cur)}` : `Resta: ${formatCurrency(remaining, cur)}`}
                  </span>
                </div>

                {isEditing && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2">
                    <label className="text-[10px] text-slate-400">Alterar tecto:</label>
                    <input
                      type="number"
                      value={catLimits[cat.id] || ''}
                      onChange={e => setCatLimits({ ...catLimits, [cat.id]: e.target.value })}
                      placeholder="Ex: 50000"
                      className="px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md w-28 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
