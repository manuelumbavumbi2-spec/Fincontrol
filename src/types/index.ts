export type CurrencyCode = 'AOA' | 'USD' | 'EUR';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  currency: string;
  createdAt: string;
}

export type AccountType = 
  | 'dinheiro'
  | 'banco'
  | 'multicaixa_express'
  | 'carteira_digital'
  | 'poupanca'
  | 'investimento'
  | 'outro';

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  bankName?: string;
  accountNumber?: string;
  balance: number;
  initialBalance: number;
  color: string;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
  isDefault?: boolean;
}

export interface Subcategory {
  id: string;
  userId: string;
  categoryId: string;
  name: string;
}

export type RelationshipType = 'usuario' | 'conjuge' | 'filho' | 'filha' | 'pai' | 'mae' | 'familiar' | 'outro' | 'casa';

export interface Person {
  id: string;
  userId: string;
  name: string;
  relationship: RelationshipType;
  avatarColor: string;
}

export type PaymentMethod = 
  | 'dinheiro' 
  | 'multicaixa' 
  | 'transferencia' 
  | 'cartao' 
  | 'debito_directo' 
  | 'outro';

export type ExpenseStatus = 'pago' | 'pendente' | 'previsto' | 'cancelado';

export type RecurrenceType = 
  | 'nenhuma' 
  | 'diaria' 
  | 'semanal' 
  | 'quinzenal' 
  | 'mensal' 
  | 'trimestral' 
  | 'semestral' 
  | 'anual';

export interface Expense {
  id: string;
  userId: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  categoryId: string;
  subcategoryId?: string;
  personId?: string;
  accountId: string;
  paymentMethod: PaymentMethod;
  status: ExpenseStatus;
  recurrence: RecurrenceType;
  location?: string;
  notes?: string;
  receiptUrl?: string;
  createdAt: string;
}

export interface Income {
  id: string;
  userId: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  categoryId: string;
  source: string;
  accountId: string;
  personId?: string;
  recurrence: RecurrenceType;
  notes?: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface CategoryBudget {
  categoryId: string;
  limitAmount: number;
}

export interface Budget {
  id: string;
  userId: string;
  month: number; // 1 - 12
  year: number;
  overallLimit: number;
  categories: CategoryBudget[];
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  initialAmount: number;
  currentAmount: number;
  startDate: string;
  deadline: string;
  monthlyTarget: number;
  frequency: string;
  accountId?: string;
  notes?: string;
  status: 'em_andamento' | 'concluida' | 'pausada';
  color?: string;
}

export interface SavingsTransaction {
  id: string;
  userId: string;
  goalId: string;
  date: string;
  amount: number;
  accountId: string;
  type: 'deposito' | 'resgate';
  notes?: string;
}

export type InvestmentType = 
  | 'deposito_prazo' 
  | 'obrigacoes' 
  | 'accoes' 
  | 'fundos' 
  | 'imobiliario' 
  | 'negocios' 
  | 'outro';

export interface Investment {
  id: string;
  userId: string;
  name: string;
  type: InvestmentType;
  institution: string;
  investedAmount: number;
  currentValue: number;
  expectedValue?: number;
  startDate: string;
  maturityDate?: string;
  returnRate: number; // in percent e.g. 15.5 for 15.5%
  returnsReceived: number;
  status: 'ativo' | 'resgatado' | 'vencido';
  notes?: string;
}

export interface InvestmentTransaction {
  id: string;
  userId: string;
  investmentId: string;
  date: string;
  amount: number;
  type: 'juros' | 'dividendos' | 'rendimentos' | 'mais_valias' | 'aporte' | 'resgate';
  notes?: string;
}

export interface Debt {
  id: string;
  userId: string;
  creditor: string;
  description: string;
  originalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  startDate: string;
  dueDate: string;
  installmentAmount: number;
  interestRate: number;
  status: 'ativa' | 'paga' | 'em_atraso' | 'renegociada';
  notes?: string;
}

export type AssetType = 
  | 'dinheiro' 
  | 'contas' 
  | 'poupancas' 
  | 'investimentos' 
  | 'imoveis' 
  | 'viaturas' 
  | 'equipamentos' 
  | 'negocios' 
  | 'outros';

export interface Asset {
  id: string;
  userId: string;
  name: string;
  type: AssetType;
  estimatedValue: number;
  purchaseDate?: string;
  notes?: string;
}

export interface FinancialGoal {
  id: string;
  userId: string;
  title: string;
  category: 'poupanca' | 'investimento' | 'compra' | 'casa' | 'viatura' | 'educacao' | 'negocio' | 'emergencia' | 'viagem' | 'outra';
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  monthlyContribution: number;
  status: 'em_andamento' | 'concluida' | 'cancelada';
  notes?: string;
}

export interface RecurringTransaction {
  id: string;
  userId: string;
  description: string;
  amount: number;
  type: 'expense' | 'income';
  categoryId: string;
  accountId: string;
  personId?: string;
  frequency: RecurrenceType;
  startDate: string;
  nextDueDate: string;
  isActive: boolean;
}

export interface PlannedExpense {
  id: string;
  userId: string;
  description: string;
  amount: number;
  plannedDate: string;
  categoryId: string;
  personId?: string;
  status: 'planeado' | 'pago' | 'pendente' | 'previsto';
  notes?: string;
}

export interface Transfer {
  id: string;
  userId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'orcamento_alerta' | 'despesa_vencendo' | 'divida_atraso' | 'meta_progresso' | 'investimento_vencimento' | 'saldo_baixo' | 'geral';
  isRead: boolean;
  date: string;
}

export interface AppSettings {
  userId: string;
  appName: string;
  currency: string;
  darkMode: boolean;
  savingsRuleType: 'percent' | 'fixed';
  savingsRuleValue: number;
  notificationBudgetThreshold: number;
  language: string;
}

export interface MonthlyFinancialSummary {
  receitas: number;
  despesas: number;
  saldo: number;
  poupanca: number;
  investimentos: number;
  dividasPagas: number;
  dividasPendentes: number;
  disponivel: number;
  taxaPoupanca: number;
  taxaInvestimento: number;
  patrimonioLiquido: number;
  maiorDespesa?: { description: string; amount: number };
  maiorCategoria?: { name: string; amount: number };
  comparacaoMesAnterior: {
    despesasPercent: number;
    poupancaPercent: number;
    investimentosPercent: number;
  };
}

export interface FinancialHealthScore {
  score: number; // 0 - 100
  rating: 'Excelente' | 'Boa' | 'Razoável' | 'Atenção' | 'Crítica';
  metrics: {
    controleDespesas: number; // 0-15
    orcamento: number; // 0-15
    taxaPoupanca: number; // 0-20
    investimentos: number; // 0-15
    gestaoDividas: number; // 0-15
    patrimonio: number; // 0-10
    metas: number; // 0-10
  };
  recommendations: string[];
}
