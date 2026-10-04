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
  Info,
  Trash2,
  X,
  Tag,
  FolderPlus,
  Check,
  HelpCircle
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatPercent, formatDate } from '../utils/formatters';
import { Expense, Category } from '../types';

export const OrcamentoView: React.FC = () => {
  const {
    budgets,
    updateBudget,
    addCategory,
    deleteCategory,
    filteredExpenses,
    categories,
    people,
    accounts,
    settings
  } = useFinance();

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
  
  // Track limits by category
  const [catLimits, setCatLimits] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const cb of currentBudget.categories) {
      map[cb.categoryId] = String(cb.limitAmount);
    }
    return map;
  });

  // Track which category IDs are explicitly included in the budget
  const [budgetedCategoryIds, setBudgetedCategoryIds] = useState<string[]>(() => {
    if (currentBudget.categories && currentBudget.categories.length > 0) {
      return currentBudget.categories.map(c => c.categoryId);
    }
    // Default initial budgeted category IDs
    return ['cat_alim', 'cat_creche', 'cat_univ', 'cat_trans', 'cat_net', 'cat_vest', 'cat_casa', 'cat_tec', 'cat_fam'];
  });

  // State to track which categories have their expenses expanded - default TRUE to illustrate expenses!
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [expandAll, setExpandAll] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<'existing' | 'new'>('existing');
  const [selectedExistingCatId, setSelectedExistingCatId] = useState('');
  const [existingCatLimit, setExistingCatLimit] = useState('50000');
  
  // New category creation form
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#3B82F6');
  const [newCatLimit, setNewCatLimit] = useState('50000');

  // Remove confirmation modal
  const [categoryToRemove, setCategoryToRemove] = useState<Category | null>(null);

  // Notification / Feedback banner
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const showFeedback = (text: string, type: 'success' | 'info' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const categoryMap = new Map(categories.map(c => [c.id, c.name]));
  const personMap = new Map(people.map(p => [p.id, p.name]));
  const accountMap = new Map(accounts.map(a => [a.id, a.name]));

  // Expense categories that are currently budgeted
  const budgetedCategories = useMemo(() => {
    return categories
      .filter(c => c.type === 'expense')
      .filter(c => budgetedCategoryIds.includes(c.id));
  }, [categories, budgetedCategoryIds]);

  // Expense categories that are not currently in the budget
  const unbudgetedCategories = useMemo(() => {
    return categories
      .filter(c => c.type === 'expense')
      .filter(c => !budgetedCategoryIds.includes(c.id));
  }, [categories, budgetedCategoryIds]);

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

  // Sum of all budgeted category ceiling limits
  const totalCategoryLimits = useMemo(() => {
    return budgetedCategories.reduce((acc, cat) => {
      const limit = Number(catLimits[cat.id]) || (cat.id === 'cat_alim' ? 200000 : cat.id === 'cat_creche' ? 60000 : 30000);
      return acc + limit;
    }, 0);
  }, [budgetedCategories, catLimits]);

  // Categories exceeded count
  const exceededCount = useMemo(() => {
    return budgetedCategories.filter(cat => {
      const limit = Number(catLimits[cat.id]) || (cat.id === 'cat_alim' ? 200000 : cat.id === 'cat_creche' ? 60000 : 30000);
      const spent = spentByCategory[cat.id] || 0;
      return spent > limit;
    }).length;
  }, [budgetedCategories, catLimits, spentByCategory]);

  // Save budget limits
  const handleSave = async () => {
    const newCategories = budgetedCategoryIds.map(catId => ({
      categoryId: catId,
      limitAmount: Number(catLimits[catId]) || (catId === 'cat_alim' ? 200000 : catId === 'cat_creche' ? 60000 : 30000)
    }));

    await updateBudget({
      ...currentBudget,
      overallLimit: Number(overallLimit),
      categories: newCategories
    });
    setIsEditing(false);
    showFeedback('Limites orçamentais guardados com sucesso!');
  };

  // Add existing category to budget
  const handleAddExistingCategory = async () => {
    if (!selectedExistingCatId) return;
    const limit = Number(existingCatLimit) || 30000;
    
    const updatedIds = [...budgetedCategoryIds, selectedExistingCatId];
    setBudgetedCategoryIds(updatedIds);
    const newLimits = { ...catLimits, [selectedExistingCatId]: String(limit) };
    setCatLimits(newLimits);

    const newCategories = updatedIds.map(catId => ({
      categoryId: catId,
      limitAmount: Number(newLimits[catId]) || 30000
    }));

    await updateBudget({
      ...currentBudget,
      categories: newCategories
    });

    const catName = categoryMap.get(selectedExistingCatId) || 'Categoria';
    showFeedback(`Categoria "${catName}" adicionada ao orçamento mensal com tecto de ${formatCurrency(limit, cur)}!`);
    setIsAddModalOpen(false);
    setSelectedExistingCatId('');
  };

  // Create new category and add to budget
  const handleCreateAndAddCategory = async () => {
    if (!newCatName.trim()) return;
    const limit = Number(newCatLimit) || 50000;

    const created = await addCategory({
      name: newCatName.trim(),
      type: 'expense',
      color: newCatColor,
      icon: 'Tag'
    });

    const updatedIds = [...budgetedCategoryIds, created.id];
    setBudgetedCategoryIds(updatedIds);
    const newLimits = { ...catLimits, [created.id]: String(limit) };
    setCatLimits(newLimits);

    const newCategories = updatedIds.map(catId => ({
      categoryId: catId,
      limitAmount: Number(newLimits[catId]) || 30000
    }));

    await updateBudget({
      ...currentBudget,
      categories: newCategories
    });

    showFeedback(`Nova categoria "${created.name}" criada e adicionada com tecto de ${formatCurrency(limit, cur)}!`);
    setIsAddModalOpen(false);
    setNewCatName('');
    setNewCatLimit('50000');
  };

  // Quick 1-click add from unbudgeted list
  const handleQuickAddCategory = async (catId: string) => {
    const limit = 50000;
    const updatedIds = [...budgetedCategoryIds, catId];
    setBudgetedCategoryIds(updatedIds);
    const newLimits = { ...catLimits, [catId]: String(limit) };
    setCatLimits(newLimits);

    const newCategories = updatedIds.map(id => ({
      categoryId: id,
      limitAmount: Number(newLimits[id]) || 30000
    }));

    await updateBudget({
      ...currentBudget,
      categories: newCategories
    });

    const catName = categoryMap.get(catId) || 'Categoria';
    showFeedback(`Categoria "${catName}" adicionada ao orçamento com tecto de ${formatCurrency(limit, cur)}!`);
  };

  // Remove category from budget
  const handleConfirmRemoveFromBudget = async (deleteFromSystem: boolean = false) => {
    if (!categoryToRemove) return;
    const catId = categoryToRemove.id;
    const catName = categoryToRemove.name;

    const updatedIds = budgetedCategoryIds.filter(id => id !== catId);
    setBudgetedCategoryIds(updatedIds);

    const newLimits = { ...catLimits };
    delete newLimits[catId];
    setCatLimits(newLimits);

    const newCategories = updatedIds.map(id => ({
      categoryId: id,
      limitAmount: Number(newLimits[id]) || 30000
    }));

    await updateBudget({
      ...currentBudget,
      categories: newCategories
    });

    if (deleteFromSystem) {
      await deleteCategory(catId);
      showFeedback(`Categoria "${catName}" eliminada do sistema e do orçamento.`);
    } else {
      showFeedback(`Categoria "${catName}" removida do orçamento mensal. As despesas continuam guardadas.`);
    }

    setCategoryToRemove(null);
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
    if (!searchQuery.trim()) return budgetedCategories;
    const q = searchQuery.toLowerCase().trim();
    return budgetedCategories.filter(cat => {
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
  }, [budgetedCategories, searchQuery, expensesByCategory, personMap]);

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-xs transition-all ${
          feedbackMsg.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
            : 'bg-blue-50 dark:bg-blue-950/70 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-200'
        }`}>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="p-1 hover:bg-black/10 rounded-lg cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
                {budgetedCategories.length} categorias orçamentadas
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Categoria</span>
            </button>

            <button
              onClick={() => {
                if (isEditing) handleSave();
                else setIsEditing(true);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
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
              Tectos por Categoria ({budgetedCategories.length}) & Despesas Consideradas
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Adicione ou remova categorias do orçamento mensal. Cada tecto ilustra detalhadamente as despesas computadas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input for Considered Expenses */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar despesa ou categoria..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white w-48 sm:w-56 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Categoria</span>
            </button>

            <button
              onClick={handleToggleExpandAll}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              {expandAll ? <EyeOff className="w-3.5 h-3.5 text-slate-500" /> : <Eye className="w-3.5 h-3.5 text-blue-600" />}
              <span>{expandAll ? 'Recolher Todas as Despesas' : 'Ilustrar Todas as Despesas'}</span>
            </button>
          </div>
        </div>

        {/* Grid of Budgeted Categories */}
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
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors relative group"
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

                    <div className="flex items-center space-x-1.5">
                      {getAlertBadge(pct)}
                      
                      {/* REMOVER CATEGORIA DO ORÇAMENTO BUTTON */}
                      <button
                        type="button"
                        onClick={() => setCategoryToRemove(cat)}
                        title="Remover esta categoria do orçamento mensal"
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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

        {filteredCategoryList.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800 space-y-3">
            <PieChart className="w-10 h-10 mx-auto text-slate-400" />
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Nenhuma categoria encontrada no orçamento</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Adicione categorias ao seu orçamento mensal para acompanhar os tectos de gastos e as despesas computadas.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Categoria ao Orçamento</span>
            </button>
          </div>
        )}
      </div>

      {/* UNBUDGETED CATEGORIES SECTION - Quick 1-click addition */}
      {unbudgetedCategories.length > 0 && (
        <div className="bg-slate-100/70 dark:bg-slate-900/40 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <FolderPlus className="w-4 h-4 text-emerald-600" />
                Outras Categorias Disponíveis para Orçamentar ({unbudgetedCategories.length})
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Estas categorias de despesa ainda não têm tecto orçamental definido. Clique em "+ Adicionar" para incluí-las no orçamento.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {unbudgetedCategories.map(cat => {
              const catExpenses = expensesByCategory[cat.id] || [];
              const spent = spentByCategory[cat.id] || 0;

              return (
                <div
                  key={cat.id}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color || '#64748B' }}
                  />
                  <span>{cat.name}</span>
                  {spent > 0 && (
                    <span className="text-[10px] text-rose-500 font-bold">
                      ({formatCurrency(spent, cur)})
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleQuickAddCategory(cat.id)}
                    className="ml-1 px-2 py-0.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-300 rounded-lg text-[10px] font-bold transition-colors cursor-pointer border border-blue-200 dark:border-blue-800"
                  >
                    + Definir Tecto
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: ADICIONAR CATEGORIA AO ORÇAMENTO */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-blue-600" />
                Adicionar Categoria ao Orçamento
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setAddMode('existing')}
                className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  addMode === 'existing'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Categoria Existente
              </button>
              <button
                type="button"
                onClick={() => setAddMode('new')}
                className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  addMode === 'new'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Criar Nova Categoria
              </button>
            </div>

            {/* Form: Existing Category */}
            {addMode === 'existing' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Seleccionar Categoria:
                  </label>
                  <select
                    value={selectedExistingCatId}
                    onChange={e => setSelectedExistingCatId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold cursor-pointer focus:outline-hidden"
                  >
                    <option value="">-- Escolha uma categoria --</option>
                    {unbudgetedCategories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                    {unbudgetedCategories.length === 0 && (
                      <option disabled value="">
                        Todas as categorias já estão no orçamento
                      </option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tecto Orçamental Mensal ({cur}):
                  </label>
                  <input
                    type="number"
                    value={existingCatLimit}
                    onChange={e => setExistingCatLimit(e.target.value)}
                    placeholder="Ex: 50000"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                  />
                  <div className="flex gap-1.5 mt-1.5">
                    {[20000, 30000, 50000, 100000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setExistingCatLimit(String(val))}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-md text-[10px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        {formatCurrency(val, cur)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleAddExistingCategory}
                    disabled={!selectedExistingCatId}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    Adicionar ao Orçamento
                  </button>
                </div>
              </div>
            )}

            {/* Form: New Category */}
            {addMode === 'new' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nome da Categoria:
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Combustível, Ginásio, Farmácia..."
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cor da Categoria:
                  </label>
                  <div className="flex items-center space-x-2">
                    {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'].map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewCatColor(color)}
                        className={`w-7 h-7 rounded-full cursor-pointer flex items-center justify-center transition-transform ${
                          newCatColor === color ? 'scale-125 ring-2 ring-blue-500 ring-offset-2' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      >
                        {newCatColor === color && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tecto Orçamental Mensal ({cur}):
                  </label>
                  <input
                    type="number"
                    value={newCatLimit}
                    onChange={e => setNewCatLimit(e.target.value)}
                    placeholder="Ex: 50000"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateAndAddCategory}
                    disabled={!newCatName.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    Criar e Adicionar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAÇÃO DE REMOÇÃO DE CATEGORIA */}
      {categoryToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Remover Categoria do Orçamento?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {categoryToRemove.name}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Deseja remover <strong>{categoryToRemove.name}</strong> dos tectos orçamentais deste mês?
              As despesas já registadas permanecerão intactas no seu histórico financeiro.
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Tecto actual:</span>
                <strong className="text-slate-800 dark:text-slate-200">
                  {formatCurrency(Number(catLimits[categoryToRemove.id]) || 0, cur)}
                </strong>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Despesas associadas:</span>
                <strong className="text-rose-600 dark:text-rose-400">
                  {expensesByCategory[categoryToRemove.id]?.length || 0} despesa(s)
                </strong>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => setCategoryToRemove(null)}
                className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => handleConfirmRemoveFromBudget(false)}
                className="flex-1 py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Remover do Orçamento
              </button>

              <button
                type="button"
                onClick={() => handleConfirmRemoveFromBudget(true)}
                className="py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                title="Eliminar também a categoria da lista de categorias"
              >
                Eliminar Categoria
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
