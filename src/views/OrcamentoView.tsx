import React, { useState, useMemo } from 'react';
import {
  PieChart,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Edit,
  Plus,
  Save,
  ChevronDown,
  ChevronUp,
  Receipt,
  Eye,
  EyeOff,
  User,
  CreditCard,
  Calendar,
  Search,
  Layers,
  ArrowUpRight,
  Sparkles,
  Info
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatPercent, formatDate } from '../utils/formatters';
import { Expense } from '../types';

export const OrcamentoView: React.FC = () => {
  const { budgets, updateBudget, filteredExpenses, categories, people, accounts, settings } = useFinance();
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

  // State to track which categories have their expenses expanded - default TRUE to illustrate expenses!
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [expandAll, setExpandAll] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const categoryMap = new Map(categories.map(c => [c.id, c.name]));
  const personMap = new Map(people.map(p => [p.id, p.name]));
  const accountMap = new Map(accounts.map(a => [a.id, a.name]));

  // Group non-cancelled expenses by category
  const expensesByCategory = useMemo(() => {
    const map: Record<string, Expense[]> = {};
    for (const exp of filteredExpenses) {
      if (exp.status === 'cancelado') continue;
      if (!map[exp.categoryId]) map[exp.categoryId] = [];
      map[exp.categoryId].push(exp);
    }
    return map;
  }, [filteredExpenses]);

  // Spent per category
  const spentByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const [catId, exps] of Object.entries(expensesByCategory)) {
      map[catId] = exps.reduce((acc, e) => acc + e.amount, 0);
    }
    return map;
  }, [expensesByCategory]);

  const totalSpent = useMemo(() => {
    return filteredExpenses
      .filter(exp => exp.status !== 'cancelado')
      .reduce((acc, exp) => acc + exp.amount, 0);
  }, [filteredExpenses]);

  const overall = Number(overallLimit) || 550000;
  const overallSpent = totalSpent;
  const overallRemaining = Math.max(0, overall - overallSpent);
  const overallPercent = overall > 0 ? (overallSpent / overall) * 100 : 0;

  const expenseCategories = categories.filter(c => c.type === 'expense');

  // Sum of all category ceiling limits
  const totalCategoryLimits = useMemo(() => {
    return expenseCategories.reduce((acc, cat) => {
      const limit = Number(catLimits[cat.id]) || (cat.id === 'cat_alim' ? 200000 : cat.id === 'cat_creche' ? 60000 : 30000);
      return acc + limit;
    }, 0);
  }, [expenseCategories, catLimits]);

  // Categories exceeded count
  const exceededCount = useMemo(() => {
    return expenseCategories.filter(cat => {
      const limit = Number(catLimits[cat.id]) || (cat.id === 'cat_alim' ? 200000 : cat.id === 'cat_creche' ? 60000 : 30000);
      const spent = spentByCategory[cat.id] || 0;
      return spent > limit;
    }).length;
  }, [expenseCategories, catLimits, spentByCategory]);

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

  const toggleCategoryExpand = (catId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: prev[catId] !== undefined ? !prev[catId] : false
    }));
  };

  const handleToggleExpandAll = () => {
    const newState = !expandAll;
    setExpandAll(newState);
    const newMap: Record<string, boolean> = {};
    categories.forEach(c => {
      newMap[c.id] = newState;
    });
    setExpandedCategories(newMap);
  };

  const getAlertBadge = (pct: number) => {
    if (pct >= 100) {
      return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">100%+ Ultrapassado!</span>;
    }
    if (pct >= 90) {
      return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900">90% Crítico</span>;
    }
    if (pct >= 80) {
      return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">80% Atenção</span>;
    }
    if (pct >= 70) {
      return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-900">70% Utilizado</span>;
    }
    if (pct >= 50) {
      return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">50% Metade</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">Confortável</span>;
  };

  // Filter categories and their expenses based on search query
  const filteredCategoryList = useMemo(() => {
    if (!searchQuery.trim()) return expenseCategories;
    const q = searchQuery.toLowerCase().trim();
    return expenseCategories.filter(cat => {
      const matchCat = cat.name.toLowerCase().includes(q);
      const catExps = expensesByCategory[cat.id] || [];
      const matchExp = catExps.some(e => 
        e.description.toLowerCase().includes(q) ||
        (personMap.get(e.personId || '') || '').toLowerCase().includes(q) ||
        (e.notes || '').toLowerCase().includes(q) ||
        (e.paymentMethod || '').toLowerCase().includes(q)
      );
      return matchCat || matchExp;
    });
  }, [expenseCategories, searchQuery, expensesByCategory, personMap]);

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-blue-500" />
              Painel de Orçamento Mensal & Tectos por Categoria
            </span>
            <div className="flex flex-wrap items-baseline gap-3 mt-1">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {formatCurrency(overall, cur)}
              </span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Total Gasto Computado: <strong className="text-rose-600 dark:text-rose-400">{formatCurrency(overallSpent, cur)}</strong>
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {filteredExpenses.filter(e => e.status !== 'cancelado').length} despesas consideradas
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-600 dark:text-slate-400">
              Utilização Geral: <strong className="text-slate-900 dark:text-white">{overallPercent.toFixed(1)}%</strong>
            </span>
            <span className={overallRemaining === 0 ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-bold'}>
              {overallRemaining > 0 ? `Margem Restante Disponível: ${formatCurrency(overallRemaining, cur)}` : 'Orçamento Geral Ultrapassado!'}
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

        {/* Summary Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
            <span className="text-slate-500 text-[11px] block">Soma dos Tectos:</span>
            <strong className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(totalCategoryLimits, cur)}</strong>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
            <span className="text-slate-500 text-[11px] block">Despesas Consideradas:</span>
            <strong className="text-sm font-bold text-rose-600 dark:text-rose-400">{formatCurrency(overallSpent, cur)}</strong>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
            <span className="text-slate-500 text-[11px] block">Saldo Livre Global:</span>
            <strong className={`text-sm font-bold ${overallRemaining > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
              {formatCurrency(overallRemaining, cur)}
            </strong>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
            <span className="text-slate-500 text-[11px] block">Tectos Excedidos:</span>
            <strong className={`text-sm font-bold ${exceededCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {exceededCount} {exceededCount === 1 ? 'categoria' : 'categorias'}
            </strong>
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

      {/* Category Budgets Grid with Explicit Expenses Illustration */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              Tectos por Categoria & Despesas Consideradas nos Tectos
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Cada tecto abaixo ilustra detalhadamente as despesas reais computadas, a percentagem de consumo e a margem restante.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input for Considered Expenses */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar despesa ou pessoa..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white w-48 sm:w-56 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleToggleExpandAll}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              {expandAll ? <EyeOff className="w-3.5 h-3.5 text-slate-500" /> : <Eye className="w-3.5 h-3.5 text-blue-600" />}
              <span>{expandAll ? 'Recolher Todas as Despesas' : 'Ilustrar Todas as Despesas'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCategoryList.map(cat => {
            const limit = Number(catLimits[cat.id]) || (cat.id === 'cat_alim' ? 200000 : cat.id === 'cat_creche' ? 60000 : 30000);
            const allCatExpenses = expensesByCategory[cat.id] || [];
            
            // Filter expenses if search query is active
            const catExpenses = searchQuery.trim()
              ? allCatExpenses.filter(e =>
                  e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (personMap.get(e.personId || '') || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (e.notes || '').toLowerCase().includes(searchQuery.toLowerCase())
                )
              : allCatExpenses;

            const spent = spentByCategory[cat.id] || 0;
            const pct = limit > 0 ? (spent / limit) * 100 : 0;
            const remaining = Math.max(0, limit - spent);
            
            // Default to true (illustrated) unless explicitly collapsed by user
            const isExpanded = expandedCategories[cat.id] !== undefined ? expandedCategories[cat.id] : expandAll;

            return (
              <div
                key={cat.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: cat.color || '#3B82F6' }}
                      />
                      <span>{cat.name}</span>
                    </span>
                    {getAlertBadge(pct)}
                  </div>

                  <div className="flex justify-between items-baseline text-xs mt-3">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Total Gasto: </span>
                      <strong className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(spent, cur)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Tecto Definido: </span>
                      <strong className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatCurrency(limit, cur)}</strong>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        pct >= 100 ? 'bg-rose-600' : pct >= 80 ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] pt-1.5 font-medium">
                    <span className="text-slate-500 dark:text-slate-400">{pct.toFixed(1)}% do tecto consumido</span>
                    <span className={spent > limit ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-semibold'}>
                      {spent > limit ? `Excedido em ${formatCurrency(spent - limit, cur)}` : `Disponível: ${formatCurrency(remaining, cur)}`}
                    </span>
                  </div>

                  {isEditing && (
                    <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2 mt-2.5">
                      <label className="text-[11px] text-slate-500 font-bold">Alterar tecto:</label>
                      <input
                        type="number"
                        value={catLimits[cat.id] || ''}
                        onChange={e => setCatLimits({ ...catLimits, [cat.id]: e.target.value })}
                        placeholder="Ex: 50000"
                        className="px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md w-32 text-slate-900 dark:text-white font-bold"
                      />
                      <span className="text-[10px] text-slate-400">{cur}</span>
                    </div>
                  )}
                </div>

                {/* DETAILED ILLUSTRATION OF EXPENSES CONSIDERED IN THIS BUDGET CEILING */}
                <div className="pt-3.5 mt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <button
                      type="button"
                      onClick={() => toggleCategoryExpand(cat.id)}
                      className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5 text-blue-500" />
                      <span>Despesas consideradas neste tecto ({allCatExpenses.length})</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-400 ml-1" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
                      )}
                    </button>
                    <span className="text-[11px] font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(spent, cur)}
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="space-y-1.5 mt-2 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      {catExpenses.map(exp => {
                        const expensePctOfLimit = limit > 0 ? (exp.amount / limit) * 100 : 0;
                        const personName = personMap.get(exp.personId || '') || 'Família';
                        const accountName = accountMap.get(exp.accountId || '') || 'Conta';

                        return (
                          <div
                            key={exp.id}
                            className="p-2 bg-white dark:bg-slate-900 rounded-lg text-xs border border-slate-100 dark:border-slate-800 shadow-2xs space-y-1"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 dark:text-white truncate">
                                  {exp.description}
                                </p>
                                <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                  <span className="flex items-center gap-0.5 font-medium">
                                    <Calendar className="w-2.5 h-2.5 text-slate-400" />
                                    {formatDate(exp.date)}
                                  </span>
                                  <span>•</span>
                                  <span className="px-1.5 py-0.2 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold">
                                    {personName}
                                  </span>
                                  <span>•</span>
                                  <span className="text-slate-600 dark:text-slate-300 capitalize">
                                    {accountName} ({exp.paymentMethod})
                                  </span>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="font-black text-rose-600 dark:text-rose-400 text-xs block">
                                  {formatCurrency(exp.amount, cur)}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {expensePctOfLimit.toFixed(1)}% do tecto
                                </span>
                              </div>
                            </div>

                            {exp.notes && (
                              <p className="text-[10px] text-slate-400 italic pt-0.5 border-t border-slate-50 dark:border-slate-850">
                                {exp.notes}
                              </p>
                            )}
                          </div>
                        );
                      })}

                      {catExpenses.length === 0 && (
                        <div className="text-center py-3 text-slate-400 dark:text-slate-500 space-y-1">
                          <CheckCircle2 className="w-4 h-4 mx-auto text-emerald-500" />
                          <p className="text-[11px] font-medium">
                            Nenhuma despesa registada para este tecto no período seleccionado.
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Tecto 100% disponível ({formatCurrency(limit, cur)}).
                          </p>
                        </div>
                      )}

                      {catExpenses.length > 0 && (
                        <div className="flex items-center justify-between text-[10px] pt-1 text-slate-500 dark:text-slate-400 font-medium px-1">
                          <span>Subtotal de {catExpenses.length} despesa(s)</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {formatCurrency(spent, cur)} ({pct.toFixed(1)}% do tecto de {formatCurrency(limit, cur)})
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
