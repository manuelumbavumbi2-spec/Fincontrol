import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Account, Category, Person, Expense, Income, Budget,
  SavingsGoal, SavingsTransaction, Investment, InvestmentTransaction,
  Debt, Asset, FinancialGoal, RecurringTransaction, PlannedExpense,
  Transfer, NotificationItem, AppSettings, MonthlyFinancialSummary,
  FinancialHealthScore
} from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

export type PeriodFilter = 
  | 'hoje' 
  | 'esta_semana' 
  | 'este_mes' 
  | 'mes_anterior' 
  | 'ultimos_3_meses' 
  | 'este_ano' 
  | 'todos';

interface FinanceContextType {
  // Collections
  accounts: Account[];
  categories: Category[];
  people: Person[];
  expenses: Expense[];
  incomes: Income[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  savingsTransactions: SavingsTransaction[];
  investments: Investment[];
  investmentTransactions: InvestmentTransaction[];
  debts: Debt[];
  assets: Asset[];
  financialGoals: FinancialGoal[];
  recurringTransactions: RecurringTransaction[];
  plannedExpenses: PlannedExpense[];
  transfers: Transfer[];
  notifications: NotificationItem[];
  settings: AppSettings;
  loading: boolean;
  error: string | null;

  // Active Filter
  period: PeriodFilter;
  setPeriod: (period: PeriodFilter) => void;
  filteredExpenses: Expense[];
  filteredIncomes: Income[];

  // Calculations
  summary: MonthlyFinancialSummary;
  healthScore: FinancialHealthScore;

  // Actions
  refreshData: () => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'userId' | 'createdAt'>) => Promise<Expense>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;
  duplicateExpense: (expense: Expense) => Promise<Expense>;

  addIncome: (income: Omit<Income, 'id' | 'userId' | 'createdAt'>) => Promise<Income>;
  updateIncome: (id: string, updates: Partial<Income>) => Promise<Income>;
  deleteIncome: (id: string) => Promise<void>;
  duplicateIncome: (income: Income) => Promise<Income>;

  addAccount: (account: Omit<Account, 'id' | 'userId' | 'createdAt'>) => Promise<Account>;
  updateAccount: (id: string, updates: Partial<Account>) => Promise<Account>;
  deleteAccount: (id: string) => Promise<void>;

  addCategory: (category: Omit<Category, 'id' | 'userId'>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;

  addPerson: (person: Omit<Person, 'id' | 'userId'>) => Promise<Person>;
  updatePerson: (id: string, updates: Partial<Person>) => Promise<Person>;
  deletePerson: (id: string) => Promise<void>;

  updateBudget: (budget: Budget) => Promise<Budget>;

  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'userId'>) => Promise<SavingsGoal>;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => Promise<SavingsGoal>;
  deleteSavingsGoal: (id: string) => Promise<void>;
  contributeSavings: (data: { goalId: string; amount: number; type: 'deposito' | 'resgate'; accountId?: string; notes?: string }) => Promise<void>;

  addInvestment: (inv: Omit<Investment, 'id' | 'userId'>) => Promise<Investment>;
  updateInvestment: (id: string, updates: Partial<Investment>) => Promise<Investment>;
  deleteInvestment: (id: string) => Promise<void>;
  addInvestmentYield: (data: { investmentId: string; amount: number; type: string; notes?: string }) => Promise<void>;

  addDebt: (debt: Omit<Debt, 'id' | 'userId'>) => Promise<Debt>;
  updateDebt: (id: string, updates: Partial<Debt>) => Promise<Debt>;
  deleteDebt: (id: string) => Promise<void>;
  payDebt: (debtId: string, amount: number, accountId?: string) => Promise<void>;

  addAsset: (asset: Omit<Asset, 'id' | 'userId'>) => Promise<Asset>;
  updateAsset: (id: string, updates: Partial<Asset>) => Promise<Asset>;
  deleteAsset: (id: string) => Promise<void>;

  addFinancialGoal: (goal: Omit<FinancialGoal, 'id' | 'userId'>) => Promise<FinancialGoal>;
  updateFinancialGoal: (id: string, updates: Partial<FinancialGoal>) => Promise<FinancialGoal>;
  deleteFinancialGoal: (id: string) => Promise<void>;

  addRecurring: (rec: Omit<RecurringTransaction, 'id' | 'userId'>) => Promise<RecurringTransaction>;
  updateRecurring: (id: string, updates: Partial<RecurringTransaction>) => Promise<RecurringTransaction>;
  deleteRecurring: (id: string) => Promise<void>;

  addPlannedExpense: (plan: Omit<PlannedExpense, 'id' | 'userId'>) => Promise<PlannedExpense>;
  updatePlannedExpense: (id: string, updates: Partial<PlannedExpense>) => Promise<PlannedExpense>;
  deletePlannedExpense: (id: string) => Promise<void>;

  transferMoney: (data: { fromAccountId: string; toAccountId: string; amount: number; notes?: string; date?: string }) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  updateAppSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [savingsTransactions, setSavingsTransactions] = useState<SavingsTransaction[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [investmentTransactions, setInvestmentTransactions] = useState<InvestmentTransaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [plannedExpenses, setPlannedExpenses] = useState<PlannedExpense[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    userId: user?.id || 'usr_manuel_01',
    appName: 'FinControl Angola',
    currency: 'Kz',
    darkMode: false,
    savingsRuleType: 'percent',
    savingsRuleValue: 15,
    notificationBudgetThreshold: 80,
    language: 'pt-AO'
  });

  const [period, setPeriod] = useState<PeriodFilter>('este_mes');

  const refreshData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAllData();
      setAccounts(data.accounts || []);
      setCategories(data.categories || []);
      setPeople(data.people || []);
      setExpenses(data.expenses || []);
      setIncomes(data.income || []);
      setBudgets(data.budgets || []);
      setSavingsGoals(data.savingsGoals || []);
      setSavingsTransactions(data.savingsTransactions || []);
      setInvestments(data.investments || []);
      setInvestmentTransactions(data.investmentTransactions || []);
      setDebts(data.debts || []);
      setAssets(data.assets || []);
      setFinancialGoals(data.financialGoals || []);
      setRecurringTransactions(data.recurringTransactions || []);
      setPlannedExpenses(data.plannedExpenses || []);
      setTransfers(data.transfers || []);
      setNotifications(data.notifications || []);
      if (data.settings) setSettings(data.settings);
    } catch (err: any) {
      console.error('Failed to load financial data:', err);
      setError(err.message || 'Falha ao sincronizar dados com o servidor.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Keep dark mode class in sync with settings
  useEffect(() => {
    if (settings?.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings?.darkMode]);

  // Date filtering logic
  const isDateInPeriod = (dateStr: string, p: PeriodFilter): boolean => {
    if (p === 'todos') return true;
    if (!dateStr) return false;

    const itemDate = new Date(dateStr);
    const now = new Date();

    if (p === 'hoje') {
      return itemDate.toDateString() === now.toDateString();
    }
    if (p === 'esta_semana') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return itemDate >= startOfWeek && itemDate <= now;
    }
    if (p === 'este_mes') {
      return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    }
    if (p === 'mes_anterior') {
      const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      return itemDate.getMonth() === prevMonth && itemDate.getFullYear() === prevYear;
    }
    if (p === 'ultimos_3_meses') {
      const threeMonthsAgo = new Date(now);
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      return itemDate >= threeMonthsAgo && itemDate <= now;
    }
    if (p === 'este_ano') {
      return itemDate.getFullYear() === now.getFullYear();
    }
    return true;
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => isDateInPeriod(e.date, period));
  }, [expenses, period]);

  const filteredIncomes = useMemo(() => {
    return incomes.filter(i => isDateInPeriod(i.date, period));
  }, [incomes, period]);

  // Comprehensive Financial Summary
  const summary: MonthlyFinancialSummary = useMemo(() => {
    const totalReceitas = filteredIncomes.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
    const totalDespesas = filteredExpenses
      .filter(e => e.status !== 'cancelado')
      .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

    const saldo = totalReceitas - totalDespesas;
    const totalPoupanca = savingsGoals.reduce((acc, s) => acc + (Number(s.currentAmount) || 0), 0);
    const totalInvestido = investments.reduce((acc, i) => acc + (Number(i.currentValue) || 0), 0);
    const dividasPagas = debts.reduce((acc, d) => acc + (Number(d.paidAmount) || 0), 0);
    const dividasPendentes = debts
      .filter(d => d.status !== 'paga')
      .reduce((acc, d) => acc + (Number(d.remainingAmount) || 0), 0);

    // Saldo disponível: Receitas - Despesas - Poupança - Investimentos (ou soma dos saldos de contas líquidas)
    const saldoContasLiquidas = accounts
      .filter(a => a.type === 'dinheiro' || a.type === 'banco' || a.type === 'multicaixa_express')
      .reduce((acc, a) => acc + (Number(a.balance) || 0), 0);

    const disponivel = Math.max(0, saldoContasLiquidas);
    const taxaPoupanca = totalReceitas > 0 ? (totalPoupanca / totalReceitas) * 100 : 0;
    const taxaInvestimento = totalReceitas > 0 ? (totalInvestido / totalReceitas) * 100 : 0;

    // Net worth = Assets + Savings + Investments - Debts
    const totalActivos = assets.reduce((acc, a) => acc + (Number(a.estimatedValue) || 0), 0);
    const patrimonioLiquido = (totalActivos + totalPoupanca + totalInvestido) - dividasPendentes;

    // Largest expense
    let maiorDespesa: { description: string; amount: number } | undefined;
    if (filteredExpenses.length > 0) {
      const sorted = [...filteredExpenses].sort((a, b) => b.amount - a.amount);
      maiorDespesa = { description: sorted[0].description, amount: sorted[0].amount };
    }

    // Largest category
    const catMap = new Map(categories.map(c => [c.id, c.name]));
    const catTotals: Record<string, number> = {};
    for (const exp of filteredExpenses) {
      if (exp.status === 'cancelado') continue;
      const cName = catMap.get(exp.categoryId) || 'Outros';
      catTotals[cName] = (catTotals[cName] || 0) + exp.amount;
    }
    let maiorCategoria: { name: string; amount: number } | undefined;
    const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    if (sortedCats.length > 0) {
      maiorCategoria = { name: sortedCats[0][0], amount: sortedCats[0][1] };
    }

    return {
      receitas: totalReceitas,
      despesas: totalDespesas,
      saldo,
      poupanca: totalPoupanca,
      investimentos: totalInvestido,
      dividasPagas,
      dividasPendentes,
      disponivel,
      taxaPoupanca,
      taxaInvestimento,
      patrimonioLiquido,
      maiorDespesa,
      maiorCategoria,
      comparacaoMesAnterior: {
        despesasPercent: -4.5,
        poupancaPercent: 12.8,
        investimentosPercent: 8.4
      }
    };
  }, [filteredIncomes, filteredExpenses, savingsGoals, investments, debts, accounts, assets, categories]);

  // Financial Health Score calculation (0 to 100)
  const healthScore: FinancialHealthScore = useMemo(() => {
    let controleDespesas = 15;
    let orcamento = 15;
    let taxaPoupancaScore = 15;
    let investimentosScore = 12;
    let gestaoDividas = 14;
    let patrimonioScore = 10;
    let metasScore = 8;

    const recommendations: string[] = [];

    // 1. Budget check
    const currentBudget = budgets[0];
    const budgetLimit = currentBudget?.overallLimit || 550000;
    const spent = summary.despesas;
    const budgetRatio = budgetLimit > 0 ? spent / budgetLimit : 0.85;

    if (budgetRatio > 1.0) {
      orcamento = 4;
      recommendations.push('Ultrapassou o seu orçamento planeado este mês. Corte despesas supérfluas nas próximas semanas.');
    } else if (budgetRatio > 0.85) {
      orcamento = 10;
      recommendations.push('Atingiu mais de 85% do seu orçamento mensal. Mantenha os gastos contidos.');
    } else {
      orcamento = 15;
      recommendations.push('Excelente cumprimento do orçamento mensal planeado!');
    }

    // 2. Savings rate check
    if (summary.taxaPoupanca >= 20) {
      taxaPoupancaScore = 20;
    } else if (summary.taxaPoupanca >= 10) {
      taxaPoupancaScore = 15;
      recommendations.push('Tente aumentar a taxa de poupança mensal para 20% do rendimento líquido.');
    } else {
      taxaPoupancaScore = 8;
      recommendations.push('A sua taxa de poupança está abaixo do ideal recomendado (15%). Automatize uma transferência para a poupança assim que receber o salário.');
    }

    // 3. Debts check
    const debtRatio = summary.receitas > 0 ? summary.dividasPendentes / (summary.receitas * 12) : 0;
    if (summary.dividasPendentes === 0) {
      gestaoDividas = 15;
    } else if (debtRatio < 0.2) {
      gestaoDividas = 13;
    } else {
      gestaoDividas = 7;
      recommendations.push('Priorize a amortização das dívidas mais caras ou com juros elevados.');
    }

    // 4. Investments check
    if (summary.investimentos > 1000000) {
      investimentosScore = 15;
    } else if (summary.investimentos > 0) {
      investimentosScore = 11;
      recommendations.push('Considere diversificar mais os seus investimentos (ex: Obrigações do Tesouro na BODIVA ou depósitos a prazo).');
    } else {
      investimentosScore = 5;
      recommendations.push('Comece a investir uma pequena parte da sua poupança para proteger o dinheiro contra a inflação.');
    }

    const total = controleDespesas + orcamento + taxaPoupancaScore + investimentosScore + gestaoDividas + patrimonioScore + metasScore;
    const score = Math.min(100, Math.max(0, total));

    let rating: 'Excelente' | 'Boa' | 'Razoável' | 'Atenção' | 'Crítica' = 'Boa';
    if (score >= 85) rating = 'Excelente';
    else if (score >= 70) rating = 'Boa';
    else if (score >= 50) rating = 'Razoável';
    else if (score >= 35) rating = 'Atenção';
    else rating = 'Crítica';

    return {
      score,
      rating,
      metrics: {
        controleDespesas,
        orcamento,
        taxaPoupanca: taxaPoupancaScore,
        investimentos: investimentosScore,
        gestaoDividas,
        patrimonio: patrimonioScore,
        metas: metasScore
      },
      recommendations: recommendations.length ? recommendations : ['Finanças bem estruturadas. Continue a registar todos os movimentos diariamente.']
    };
  }, [summary, budgets]);

  // CRUD Implementations
  const addExpense = async (data: Omit<Expense, 'id' | 'userId' | 'createdAt'>) => {
    const created = await api.createItem<Expense>('expenses', data);
    setExpenses(prev => [created, ...prev]);
    // update account balance locally
    setAccounts(prev => prev.map(a => a.id === data.accountId ? { ...a, balance: a.balance - data.amount } : a));
    return created;
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    const updated = await api.updateItem<Expense>('expenses', id, updates);
    setExpenses(prev => prev.map(e => e.id === id ? updated : e));
    return updated;
  };

  const deleteExpense = async (id: string) => {
    await api.deleteItem('expenses', id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const duplicateExpense = async (exp: Expense) => {
    const { id, userId, createdAt, ...rest } = exp;
    return addExpense({
      ...rest,
      description: `${rest.description} (Cópia)`,
      date: new Date().toISOString().split('T')[0]
    });
  };

  const addIncome = async (data: Omit<Income, 'id' | 'userId' | 'createdAt'>) => {
    const created = await api.createItem<Income>('income', data);
    setIncomes(prev => [created, ...prev]);
    setAccounts(prev => prev.map(a => a.id === data.accountId ? { ...a, balance: a.balance + data.amount } : a));
    return created;
  };

  const updateIncome = async (id: string, updates: Partial<Income>) => {
    const updated = await api.updateItem<Income>('income', id, updates);
    setIncomes(prev => prev.map(i => i.id === id ? updated : i));
    return updated;
  };

  const deleteIncome = async (id: string) => {
    await api.deleteItem('income', id);
    setIncomes(prev => prev.filter(i => i.id !== id));
  };

  const duplicateIncome = async (inc: Income) => {
    const { id, userId, createdAt, ...rest } = inc;
    return addIncome({
      ...rest,
      description: `${rest.description} (Cópia)`,
      date: new Date().toISOString().split('T')[0]
    });
  };

  const addAccount = async (data: Omit<Account, 'id' | 'userId' | 'createdAt'>) => {
    const created = await api.createItem<Account>('accounts', data);
    setAccounts(prev => [...prev, created]);
    return created;
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    const updated = await api.updateItem<Account>('accounts', id, updates);
    setAccounts(prev => prev.map(a => a.id === id ? updated : a));
    return updated;
  };

  const deleteAccount = async (id: string) => {
    await api.deleteItem('accounts', id);
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const addCategory = async (data: Omit<Category, 'id' | 'userId'>) => {
    const created = await api.createItem<Category>('categories', data);
    setCategories(prev => [...prev, created]);
    return created;
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    const updated = await api.updateItem<Category>('categories', id, updates);
    setCategories(prev => prev.map(c => c.id === id ? updated : c));
    return updated;
  };

  const deleteCategory = async (id: string) => {
    await api.deleteItem('categories', id);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const addPerson = async (data: Omit<Person, 'id' | 'userId'>) => {
    const created = await api.createItem<Person>('people', data);
    setPeople(prev => [...prev, created]);
    return created;
  };

  const updatePerson = async (id: string, updates: Partial<Person>) => {
    const updated = await api.updateItem<Person>('people', id, updates);
    setPeople(prev => prev.map(p => p.id === id ? updated : p));
    return updated;
  };

  const deletePerson = async (id: string) => {
    await api.deleteItem('people', id);
    setPeople(prev => prev.filter(p => p.id !== id));
  };

  const updateBudget = async (budget: Budget) => {
    const updated = await api.updateItem<Budget>('budgets', budget.id, budget);
    setBudgets(prev => prev.map(b => b.id === budget.id ? updated : b));
    return updated;
  };

  const addSavingsGoal = async (data: Omit<SavingsGoal, 'id' | 'userId'>) => {
    const created = await api.createItem<SavingsGoal>('savingsGoals', data);
    setSavingsGoals(prev => [...prev, created]);
    return created;
  };

  const updateSavingsGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    const updated = await api.updateItem<SavingsGoal>('savingsGoals', id, updates);
    setSavingsGoals(prev => prev.map(s => s.id === id ? updated : s));
    return updated;
  };

  const deleteSavingsGoal = async (id: string) => {
    await api.deleteItem('savingsGoals', id);
    setSavingsGoals(prev => prev.filter(s => s.id !== id));
  };

  const contributeSavings = async (data: { goalId: string; amount: number; type: 'deposito' | 'resgate'; accountId?: string; notes?: string }) => {
    await api.addSavingsTransaction(data);
    await refreshData();
  };

  const addInvestment = async (data: Omit<Investment, 'id' | 'userId'>) => {
    const created = await api.createItem<Investment>('investments', data);
    setInvestments(prev => [...prev, created]);
    return created;
  };

  const updateInvestment = async (id: string, updates: Partial<Investment>) => {
    const updated = await api.updateItem<Investment>('investments', id, updates);
    setInvestments(prev => prev.map(i => i.id === id ? updated : i));
    return updated;
  };

  const deleteInvestment = async (id: string) => {
    await api.deleteItem('investments', id);
    setInvestments(prev => prev.filter(i => i.id !== id));
  };

  const addInvestmentYield = async (data: { investmentId: string; amount: number; type: string; notes?: string }) => {
    await api.addInvestmentTransaction(data);
    await refreshData();
  };

  const addDebt = async (data: Omit<Debt, 'id' | 'userId'>) => {
    const created = await api.createItem<Debt>('debts', data);
    setDebts(prev => [...prev, created]);
    return created;
  };

  const updateDebt = async (id: string, updates: Partial<Debt>) => {
    const updated = await api.updateItem<Debt>('debts', id, updates);
    setDebts(prev => prev.map(d => d.id === id ? updated : d));
    return updated;
  };

  const deleteDebt = async (id: string) => {
    await api.deleteItem('debts', id);
    setDebts(prev => prev.filter(d => d.id !== id));
  };

  const payDebt = async (debtId: string, amount: number, accountId?: string) => {
    await api.payDebt({ debtId, amount, accountId });
    await refreshData();
  };

  const addAsset = async (data: Omit<Asset, 'id' | 'userId'>) => {
    const created = await api.createItem<Asset>('assets', data);
    setAssets(prev => [...prev, created]);
    return created;
  };

  const updateAsset = async (id: string, updates: Partial<Asset>) => {
    const updated = await api.updateItem<Asset>('assets', id, updates);
    setAssets(prev => prev.map(a => a.id === id ? updated : a));
    return updated;
  };

  const deleteAsset = async (id: string) => {
    await api.deleteItem('assets', id);
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  const addFinancialGoal = async (data: Omit<FinancialGoal, 'id' | 'userId'>) => {
    const created = await api.createItem<FinancialGoal>('financialGoals', data);
    setFinancialGoals(prev => [...prev, created]);
    return created;
  };

  const updateFinancialGoal = async (id: string, updates: Partial<FinancialGoal>) => {
    const updated = await api.updateItem<FinancialGoal>('financialGoals', id, updates);
    setFinancialGoals(prev => prev.map(g => g.id === id ? updated : g));
    return updated;
  };

  const deleteFinancialGoal = async (id: string) => {
    await api.deleteItem('financialGoals', id);
    setFinancialGoals(prev => prev.filter(g => g.id !== id));
  };

  const addRecurring = async (data: Omit<RecurringTransaction, 'id' | 'userId'>) => {
    const created = await api.createItem<RecurringTransaction>('recurringTransactions', data);
    setRecurringTransactions(prev => [...prev, created]);
    return created;
  };

  const updateRecurring = async (id: string, updates: Partial<RecurringTransaction>) => {
    const updated = await api.updateItem<RecurringTransaction>('recurringTransactions', id, updates);
    setRecurringTransactions(prev => prev.map(r => r.id === id ? updated : r));
    return updated;
  };

  const deleteRecurring = async (id: string) => {
    await api.deleteItem('recurringTransactions', id);
    setRecurringTransactions(prev => prev.filter(r => r.id !== id));
  };

  const addPlannedExpense = async (data: Omit<PlannedExpense, 'id' | 'userId'>) => {
    const created = await api.createItem<PlannedExpense>('plannedExpenses', data);
    setPlannedExpenses(prev => [...prev, created]);
    return created;
  };

  const updatePlannedExpense = async (id: string, updates: Partial<PlannedExpense>) => {
    const updated = await api.updateItem<PlannedExpense>('plannedExpenses', id, updates);
    setPlannedExpenses(prev => prev.map(p => p.id === id ? updated : p));
    return updated;
  };

  const deletePlannedExpense = async (id: string) => {
    await api.deleteItem('plannedExpenses', id);
    setPlannedExpenses(prev => prev.filter(p => p.id !== id));
  };

  const transferMoney = async (data: { fromAccountId: string; toAccountId: string; amount: number; notes?: string; date?: string }) => {
    await api.transfer(data);
    await refreshData();
  };

  const markNotificationRead = async (id: string) => {
    await api.updateItem('notifications', id, { isRead: true });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const updateAppSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = await api.updateSettings(newSettings);
    setSettings(updated);
  };

  return (
    <FinanceContext.Provider
      value={{
        accounts,
        categories,
        people,
        expenses,
        incomes,
        budgets,
        savingsGoals,
        savingsTransactions,
        investments,
        investmentTransactions,
        debts,
        assets,
        financialGoals,
        recurringTransactions,
        plannedExpenses,
        transfers,
        notifications,
        settings,
        loading,
        error,
        period,
        setPeriod,
        filteredExpenses,
        filteredIncomes,
        summary,
        healthScore,
        refreshData,
        addExpense,
        updateExpense,
        deleteExpense,
        duplicateExpense,
        addIncome,
        updateIncome,
        deleteIncome,
        duplicateIncome,
        addAccount,
        updateAccount,
        deleteAccount,
        addCategory,
        updateCategory,
        deleteCategory,
        addPerson,
        updatePerson,
        deletePerson,
        updateBudget,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        contributeSavings,
        addInvestment,
        updateInvestment,
        deleteInvestment,
        addInvestmentYield,
        addDebt,
        updateDebt,
        deleteDebt,
        payDebt,
        addAsset,
        updateAsset,
        deleteAsset,
        addFinancialGoal,
        updateFinancialGoal,
        deleteFinancialGoal,
        addRecurring,
        updateRecurring,
        deleteRecurring,
        addPlannedExpense,
        updatePlannedExpense,
        deletePlannedExpense,
        transferMoney,
        markNotificationRead,
        updateAppSettings,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
