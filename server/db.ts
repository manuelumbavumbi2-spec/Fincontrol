import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

export interface DatabaseSchema {
  users: any[];
  accounts: any[];
  categories: any[];
  subcategories: any[];
  people: any[];
  income: any[];
  expenses: any[];
  budgets: any[];
  savingsGoals: any[];
  savingsTransactions: any[];
  investments: any[];
  investmentTransactions: any[];
  debts: any[];
  assets: any[];
  financialGoals: any[];
  recurringTransactions: any[];
  plannedExpenses: any[];
  transfers: any[];
  notifications: any[];
  settings: any[];
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'fincontrol_salt_angola').digest('hex');
}

export function seedInitialData(): DatabaseSchema {
  const userId = 'usr_manuel_01';
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Accounts in Angola
  const accounts = [
    {
      id: 'acc_bai_01',
      userId,
      name: 'Banco BAI - Ordem',
      type: 'banco',
      bankName: 'Banco Angolano de Investimentos (BAI)',
      accountNumber: 'AO06.0040.0000.1234.5678.9012.3',
      balance: 450000,
      initialBalance: 500000,
      color: '#1E3A8A', // BAI Blue
      isActive: true,
      createdAt: today
    },
    {
      id: 'acc_bfa_02',
      userId,
      name: 'Conta BFA',
      type: 'banco',
      bankName: 'Banco de Fomento Angola (BFA)',
      accountNumber: 'AO06.0006.0000.9876.5432.1098.7',
      balance: 180000,
      initialBalance: 200000,
      color: '#EA580C', // Orange
      isActive: true,
      createdAt: today
    },
    {
      id: 'acc_mcx_03',
      userId,
      name: 'Multicaixa Express',
      type: 'multicaixa_express',
      bankName: 'EMIS Multicaixa',
      accountNumber: '+244 923 000 000',
      balance: 45000,
      initialBalance: 50000,
      color: '#DC2626', // Red
      isActive: true,
      createdAt: today
    },
    {
      id: 'acc_cash_04',
      userId,
      name: 'Dinheiro Físico em Mão',
      type: 'dinheiro',
      balance: 35000,
      initialBalance: 50000,
      color: '#16A34A', // Green
      isActive: true,
      createdAt: today
    },
    {
      id: 'acc_sav_05',
      userId,
      name: 'Conta Poupança Mais BAI',
      type: 'poupanca',
      bankName: 'BAI',
      balance: 850000,
      initialBalance: 600000,
      color: '#059669', // Emerald
      isActive: true,
      createdAt: today
    }
  ];

  // People / Family
  const people = [
    { id: 'per_manuel', userId, name: 'Manuel', relationship: 'usuario', avatarColor: '#2563EB' },
    { id: 'per_roseth', userId, name: 'Roseth', relationship: 'conjuge', avatarColor: '#EC4899' },
    { id: 'per_mariel', userId, name: 'Mariel', relationship: 'filha', avatarColor: '#8B5CF6' },
    { id: 'per_marilson', userId, name: 'Marilson', relationship: 'filho', avatarColor: '#10B981' },
    { id: 'per_maribel', userId, name: 'Maribel', relationship: 'filha', avatarColor: '#F59E0B' },
    { id: 'per_casa', userId, name: 'Casa', relationship: 'casa', avatarColor: '#6B7280' }
  ];

  // Initial Expense Categories
  const categories = [
    { id: 'cat_alim', userId, name: 'Alimentação', type: 'expense', icon: 'Utensils', color: '#F97316' },
    { id: 'cat_casa', userId, name: 'Casa', type: 'expense', icon: 'Home', color: '#3B82F6' },
    { id: 'cat_trans', userId, name: 'Transporte', type: 'expense', icon: 'Car', color: '#10B981' },
    { id: 'cat_educ', userId, name: 'Educação', type: 'expense', icon: 'GraduationCap', color: '#8B5CF6' },
    { id: 'cat_creche', userId, name: 'Creche', type: 'expense', icon: 'Baby', color: '#EC4899' },
    { id: 'cat_univ', userId, name: 'Universidade', type: 'expense', icon: 'BookOpen', color: '#6366F1' },
    { id: 'cat_saude', userId, name: 'Saúde', type: 'expense', icon: 'HeartPulse', color: '#EF4444' },
    { id: 'cat_vest', userId, name: 'Vestuário', type: 'expense', icon: 'Shirt', color: '#14B8A6' },
    { id: 'cat_net', userId, name: 'Internet', type: 'expense', icon: 'Wifi', color: '#06B6D4' },
    { id: 'cat_tv', userId, name: 'TV', type: 'expense', icon: 'Tv', color: '#A855F7' },
    { id: 'cat_energ', userId, name: 'Energia', type: 'expense', icon: 'Zap', color: '#EAB308' },
    { id: 'cat_agua', userId, name: 'Água', type: 'expense', icon: 'Droplets', color: '#0284C7' },
    { id: 'cat_fam', userId, name: 'Família', type: 'expense', icon: 'Users', color: '#F43F5E' },
    { id: 'cat_tec', userId, name: 'Tecnologia', type: 'expense', icon: 'Laptop', color: '#4F46E5' },
    { id: 'cat_lazer', userId, name: 'Lazer', type: 'expense', icon: 'Sparkles', color: '#D97706' },
    { id: 'cat_manut', userId, name: 'Manutenção', type: 'expense', icon: 'Wrench', color: '#78716C' },
    { id: 'cat_dividas', userId, name: 'Dívidas', type: 'expense', icon: 'CreditCard', color: '#B91C1C' },
    { id: 'cat_outros', userId, name: 'Outros', type: 'expense', icon: 'MoreHorizontal', color: '#64748B' },
    // Income Categories
    { id: 'cat_salario', userId, name: 'Salário', type: 'income', icon: 'Briefcase', color: '#16A34A' },
    { id: 'cat_subsidio', userId, name: 'Subsídio', type: 'income', icon: 'Gift', color: '#059669' },
    { id: 'cat_extra', userId, name: 'Trabalho extra', type: 'income', icon: 'PlusCircle', color: '#10B981' },
    { id: 'cat_negocio', userId, name: 'Negócio', type: 'income', icon: 'Store', color: '#0D9488' },
    { id: 'cat_comissao', userId, name: 'Comissão', type: 'income', icon: 'TrendingUp', color: '#0284C7' },
    { id: 'cat_inv_rend', userId, name: 'Investimentos', type: 'income', icon: 'PiggyBank', color: '#2563EB' },
    { id: 'cat_outros_inc', userId, name: 'Outros Rendimentos', type: 'income', icon: 'Coins', color: '#64748B' }
  ];

  // Specific initial demo expenses strictly matching User Request requirement 30:
  // Creche 55.000, Roupa Mariel 30.000, Alimentação Casa 70.000, Alimentação Serviço 60.000, Transporte 24.000,
  // Pão 14.000, Matabicho 40.000, Universidade Roseth 45.000, Internet 24.500, TV 5.000, Comando descodificador 5.000,
  // Reparação ar condicionado 20.000, Meia 20.000, Escova 1.000, Mochila 20.000, Marilson 10.000, Maribel 10.000,
  // IA 15.000, Cozer 2.000. Total = 470.500 Kz!
  const expenses = [
    {
      id: 'exp_01',
      userId,
      description: 'Creche',
      amount: 55000,
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-02`,
      categoryId: 'cat_creche',
      personId: 'per_mariel',
      accountId: 'acc_bai_01',
      paymentMethod: 'transferencia',
      status: 'pago',
      recurrence: 'mensal',
      location: 'Luanda',
      notes: 'Mensalidade do colégio infantil',
      createdAt: today
    },
    {
      id: 'exp_02',
      userId,
      description: 'Roupa da Mariel',
      amount: 30000,
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-03`,
      categoryId: 'cat_vest',
      personId: 'per_mariel',
      accountId: 'acc_mcx_03',
      paymentMethod: 'multicaixa',
      status: 'pago',
      recurrence: 'nenhuma',
      location: 'Kero Kilamba',
      notes: 'Roupas para a estação e calçado',
      createdAt: today
    },
    {
      id: 'exp_03',
      userId,
      description: 'Alimentação Casa',
      amount: 70000,
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-04`,
      categoryId: 'cat_alim',
      personId: 'per_casa',
      accountId: 'acc_bai_01',
      paymentMethod: 'multicaixa',
      status: 'pago',
      recurrence: 'mensal',
      location: 'Candando Morro Bento',
      notes: 'Compras gerais do mês do supermercado',
      createdAt: today
    },
    {
      id: 'exp_04',
      userId,
      description: 'Alimentação Serviço',
      amount: 60000,
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-05`,
      categoryId: 'cat_alim',
      personId: 'per_manuel',
      accountId: 'acc_mcx_03',
      paymentMethod: 'multicaixa',
      status: 'pago',
      recurrence: 'mensal',
      location: 'Restaurante Marginal',
      notes: 'Almoços durante os dias de expediente',
      createdAt: today
    },
    {
      id: 'exp_05',
      userId,
      description: 'Transporte',
      amount: 24000,
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-06`,
      categoryId: 'cat_trans',
      personId: 'per_manuel',
      accountId: 'acc_cash_04',
      paymentMethod: 'dinheiro',
      status: 'pago',
      recurrence: 'mensal',
      location: 'Luanda',
      notes: 'Combustível e táxis urbanos',
      createdAt: today
    },
    {
      id: 'exp_06',
      userId,
      description: 'Pão',
      amount: 14000,
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-07`,
      categoryId: 'cat_alim',
      personId: 'per_casa',
      accountId: 'acc_cash_04',
      paymentMethod: 'dinheiro',
      status: 'pago',
      recurrence: 'mensal',
      location: 'Padaria do Bairro',
      notes: 'Pão fresco diário para a família',
      createdAt: today
    },
    {
      id: 'exp_07',
      userId,
      description: 'Matabicho',
      amount: 40000,
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-08`,
      categoryId: 'cat_alim',
      personId: 'per_casa',
      accountId: 'acc_bai_01',
      paymentMethod: 'multicaixa',
      status: 'pago',
      recurrence: 'mensal',
      location: 'Supermercado Deskontão',
      notes: 'Queijo, leite, fiambre, cereais e ovos',
      createdAt: today
    },
    {
      id: 'exp_08',
      userId,
      description: 'Universidade Roseth',
      amount: 45000,
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-09`,
      categoryId: 'cat_univ',
      personId: 'per_roseth',
      accountId: 'acc_bfa_02',
      paymentMethod: 'transferencia',
      status: 'pago',
      recurrence: 'mensal',
      location: 'Universidade Católica de Angola',
      notes: 'Propina universitária do mês',
      createdAt: today
    },
    {
      id: 'exp_09',
      userId,
      description: 'Internet',
      amount: 24500,
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-10`,
      categoryId: 'cat_net',
      personId: 'per_casa',
      accountId: 'acc_mcx_03',
      paymentMethod: 'multicaixa',
      status: 'pago',
      recurrence: 'mensal',
      location: 'Zap Fibra / Unitel Net@Casa',
      notes: 'Mensalidade de Internet Residencial Fibra',
      createdAt: today
    },
    {
      id: 'exp_10',
      userId,
      description: 'TV',
      amount: 5000,
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-11`,
      categoryId: 'cat_tv',
      personId: 'per_casa',
      accountId: 'acc_mcx_03',
      paymentMethod: 'multicaixa',
      status: 'pago',
      recurrence: 'mensal',
      location: 'DStv / Zap',
      notes: 'Pacote Família de televisão por satélite',
      createdAt: today
    },
    {
      id: 'exp_11',
      userId,
      description: 'Comando do descodificador',
      amount: 5000,
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-12`,
      categoryId: 'cat_tec',
      personId: 'per_casa',
      accountId: 'acc_cash_04',
      paymentMethod: 'dinheiro',
      status: 'pago',
      recurrence: 'nenhuma',
      location: 'Mercado do Rocha',
      notes: 'Substituição de comando avariado',
      createdAt: today
    },
    {
      id: 'exp_12',
      userId,
      description: 'Reparação do ar condicionado',
      amount: 20000,
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-13`,
      categoryId: 'cat_manut',
      personId: 'per_casa',
      accountId: 'acc_cash_04',
      paymentMethod: 'dinheiro',
      status: 'pago',
      recurrence: 'nenhuma',
      location: 'Técnico de Frio',
      notes: 'Carga de gás e limpeza do split da sala',
      createdAt: today
    },
    {
      id: 'exp_13',
      userId,
      description: 'Meia',
      amount: 20000,
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-14`,
      categoryId: 'cat_vest',
      personId: 'per_manuel',
      accountId: 'acc_mcx_03',
      paymentMethod: 'multicaixa',
      status: 'pago',
      recurrence: 'nenhuma',
      location: 'Belas Shopping',
      notes: 'Pack de meias executivas e desportivas',
      createdAt: today
    },
    {
      id: 'exp_14',
      userId,
      description: 'Escova',
      amount: 1000,
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-15`,
      categoryId: 'cat_saude',
      personId: 'per_casa',
      accountId: 'acc_cash_04',
      paymentMethod: 'dinheiro',
      status: 'pago',
      recurrence: 'nenhuma',
      location: 'Farmácia Popular',
      notes: 'Escova de dentes suave',
      createdAt: today
    },
    {
      id: 'exp_15',
      userId,
      description: 'Mochila',
      amount: 20000,
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-16`,
      categoryId: 'cat_educ',
      personId: 'per_marilson',
      accountId: 'acc_mcx_03',
      paymentMethod: 'multicaixa',
      status: 'pago',
      recurrence: 'nenhuma',
      location: 'Kero Talatona',
      notes: 'Mochila escolar resistente',
      createdAt: today
    },
    {
      id: 'exp_16',
      userId,
      description: 'Marilson',
      amount: 10000,
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-17`,
      categoryId: 'cat_fam',
      personId: 'per_marilson',
      accountId: 'acc_cash_04',
      paymentMethod: 'dinheiro',
      status: 'pago',
      recurrence: 'mensal',
      location: 'Mesada',
      notes: 'Mesada e lanches semanais',
      createdAt: today
    },
    {
      id: 'exp_17',
      userId,
      description: 'Maribel',
      amount: 10000,
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-18`,
      categoryId: 'cat_fam',
      personId: 'per_maribel',
      accountId: 'acc_cash_04',
      paymentMethod: 'dinheiro',
      status: 'pago',
      recurrence: 'mensal',
      location: 'Mesada',
      notes: 'Mesada e lanches escolares',
      createdAt: today
    },
    {
      id: 'exp_18',
      userId,
      description: 'IA',
      amount: 15000,
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-19`,
      categoryId: 'cat_tec',
      personId: 'per_manuel',
      accountId: 'acc_bfa_02',
      paymentMethod: 'cartao',
      status: 'pago',
      recurrence: 'mensal',
      location: 'Subscrição Digital',
      notes: 'Subscrição de ferramentas de Inteligência Artificial',
      createdAt: today
    },
    {
      id: 'exp_19',
      userId,
      description: 'Cozer',
      amount: 2000,
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-20`,
      categoryId: 'cat_vest',
      personId: 'per_casa',
      accountId: 'acc_cash_04',
      paymentMethod: 'dinheiro',
      status: 'pago',
      recurrence: 'nenhuma',
      location: 'Alfaiataria do Bairro',
      notes: 'Ajuste e costura de calças e fardas',
      createdAt: today
    }
  ];

  // Incomes for the current month
  const income = [
    {
      id: 'inc_01',
      userId,
      description: 'Salário Mensal Principal',
      amount: 650000,
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`,
      categoryId: 'cat_salario',
      source: 'Empresa de Tecnologia e Telecomunicações',
      accountId: 'acc_bai_01',
      personId: 'per_manuel',
      recurrence: 'mensal',
      notes: 'Vencimento mensal líquido com subsídio de transporte',
      createdAt: today
    },
    {
      id: 'inc_02',
      userId,
      description: 'Consultoria e Trabalho Extra',
      amount: 150000,
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-15`,
      categoryId: 'cat_extra',
      source: 'Cliente Empresarial Luanda',
      accountId: 'acc_bfa_02',
      personId: 'per_manuel',
      recurrence: 'mensal',
      notes: 'Prestação de serviços de consultoria informática',
      createdAt: today
    },
    {
      id: 'inc_03',
      userId,
      description: 'Negócio de Confeitaria Roseth',
      amount: 80000,
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-18`,
      categoryId: 'cat_negocio',
      source: 'Encomendas de Bolos e Doces',
      accountId: 'acc_mcx_03',
      personId: 'per_roseth',
      recurrence: 'mensal',
      notes: 'Vendas da semana',
      createdAt: today
    }
  ];

  // Monthly Budget
  const budgets = [
    {
      id: 'bgt_current',
      userId,
      month: currentMonth,
      year: currentYear,
      overallLimit: 550000,
      categories: [
        { categoryId: 'cat_alim', limitAmount: 200000 },
        { categoryId: 'cat_creche', limitAmount: 60000 },
        { categoryId: 'cat_univ', limitAmount: 50000 },
        { categoryId: 'cat_trans', limitAmount: 30000 },
        { categoryId: 'cat_net', limitAmount: 25000 },
        { categoryId: 'cat_vest', limitAmount: 60000 },
        { categoryId: 'cat_casa', limitAmount: 50000 },
        { categoryId: 'cat_tec', limitAmount: 25000 },
        { categoryId: 'cat_fam', limitAmount: 30000 }
      ]
    }
  ];

  // Savings Goals
  const savingsGoals = [
    {
      id: 'sav_01',
      userId,
      name: 'Fundo de Emergência Familiar',
      targetAmount: 2000000,
      initialAmount: 400000,
      currentAmount: 850000,
      startDate: `${currentYear}-01-01`,
      deadline: `${currentYear + 1}-12-31`,
      monthlyTarget: 100000,
      frequency: 'mensal',
      accountId: 'acc_sav_05',
      notes: 'Garantia de 6 meses de custo fixo familiar em Angola',
      status: 'em_andamento',
      color: '#10B981'
    },
    {
      id: 'sav_02',
      userId,
      name: 'Fundo para Viatura Familiar',
      targetAmount: 5000000,
      initialAmount: 500000,
      currentAmount: 1800000,
      startDate: `${currentYear}-01-01`,
      deadline: `${currentYear + 2}-06-30`,
      monthlyTarget: 150000,
      frequency: 'mensal',
      accountId: 'acc_sav_05',
      notes: 'Aquisição de viatura SUV para a família',
      status: 'em_andamento',
      color: '#3B82F6'
    },
    {
      id: 'sav_03',
      userId,
      name: 'Férias em Benguela / Namibe',
      targetAmount: 600000,
      initialAmount: 100000,
      currentAmount: 350000,
      startDate: `${currentYear}-03-01`,
      deadline: `${currentYear}-12-15`,
      monthlyTarget: 50000,
      frequency: 'mensal',
      accountId: 'acc_bai_01',
      notes: 'Viagem de fim de ano com as crianças',
      status: 'em_andamento',
      color: '#F59E0B'
    }
  ];

  const savingsTransactions = [
    {
      id: 'sav_tx_01',
      userId,
      goalId: 'sav_01',
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-05`,
      amount: 100000,
      accountId: 'acc_bai_01',
      type: 'deposito',
      notes: 'Reforço mensal automático'
    }
  ];

  // Investments in Angola (Depósitos a Prazo no BAI, Obrigações do Tesouro na BODIVA)
  const investments = [
    {
      id: 'inv_01',
      userId,
      name: 'Obrigações do Tesouro Não Reajustáveis (OT-NR)',
      type: 'obrigacoes',
      institution: 'BODIVA / BAI Invest',
      investedAmount: 1500000,
      currentValue: 1725000,
      expectedValue: 1800000,
      startDate: `${currentYear - 1}-06-15`,
      maturityDate: `${currentYear + 2}-06-15`,
      returnRate: 17.5,
      returnsReceived: 225000,
      status: 'ativo',
      notes: 'Juros semestrais pagos em conta BAI'
    },
    {
      id: 'inv_02',
      userId,
      name: 'Depósito a Prazo Rendimento Máximo',
      type: 'deposito_prazo',
      institution: 'Banco de Fomento Angola (BFA)',
      investedAmount: 800000,
      currentValue: 896000,
      expectedValue: 920000,
      startDate: `${currentYear}-01-10`,
      maturityDate: `${currentYear}-12-31`,
      returnRate: 14.0,
      returnsReceived: 96000,
      status: 'ativo',
      notes: 'Prazo de 365 dias com taxa garantida'
    },
    {
      id: 'inv_03',
      userId,
      name: 'Participação Micro-Negócio Agro',
      type: 'negocios',
      institution: 'Cooperativa Agrícola Kwanza Sul',
      investedAmount: 500000,
      currentValue: 580000,
      expectedValue: 650000,
      startDate: `${currentYear}-02-01`,
      maturityDate: `${currentYear + 1}-02-01`,
      returnRate: 16.0,
      returnsReceived: 80000,
      status: 'ativo',
      notes: 'Produção hortícola distribuída em Luanda'
    }
  ];

  const investmentTransactions = [
    {
      id: 'inv_tx_01',
      userId,
      investmentId: 'inv_01',
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-02`,
      amount: 112500,
      type: 'juros',
      notes: 'Pagamento de cupão semestral'
    }
  ];

  // Debts
  const debts = [
    {
      id: 'deb_01',
      userId,
      creditor: 'Banco BAI',
      description: 'Crédito Automóvel',
      originalAmount: 1200000,
      paidAmount: 800000,
      remainingAmount: 400000,
      startDate: `${currentYear - 1}-01-15`,
      dueDate: `${currentYear}-${String(currentMonth).padStart(2, '0')}-28`,
      installmentAmount: 80000,
      interestRate: 12.0,
      status: 'ativa',
      notes: 'Restam 5 prestações mensais'
    },
    {
      id: 'deb_02',
      userId,
      creditor: 'Loja de Eletrodomésticos',
      description: 'Geleira e Fogão em Prestações',
      originalAmount: 250000,
      paidAmount: 200000,
      remainingAmount: 50000,
      startDate: `${currentYear}-01-10`,
      dueDate: `${currentYear}-${String(currentMonth).padStart(2, '0')}-25`,
      installmentAmount: 25000,
      interestRate: 0,
      status: 'ativa',
      notes: 'Últimas 2 mensalidades sem juros'
    }
  ];

  // Assets (Património)
  const assets = [
    {
      id: 'ast_01',
      userId,
      name: 'Apartamento T3 Centralidade do Kilamba',
      type: 'imoveis',
      estimatedValue: 28000000,
      purchaseDate: `${currentYear - 4}-05-20`,
      notes: 'Habitação própria familiar'
    },
    {
      id: 'ast_02',
      userId,
      name: 'Viatura Hyundai Tucson',
      type: 'viaturas',
      estimatedValue: 7500000,
      purchaseDate: `${currentYear - 2}-11-10`,
      notes: 'Viatura de uso familiar'
    },
    {
      id: 'ast_03',
      userId,
      name: 'Equipamentos Informáticos & Trabalho',
      type: 'equipamentos',
      estimatedValue: 1200000,
      purchaseDate: `${currentYear - 1}-08-15`,
      notes: 'MacBook Pro, monitores e escritório'
    },
    {
      id: 'ast_04',
      userId,
      name: 'Terreno / Parcela no Benfica',
      type: 'imoveis',
      estimatedValue: 4500000,
      purchaseDate: `${currentYear - 2}-03-12`,
      notes: 'Parcela de 20x30m com vedação'
    }
  ];

  // Financial Goals
  const financialGoals = [
    {
      id: 'fg_01',
      userId,
      title: 'Educação Universitária dos Filhos',
      category: 'educacao',
      targetAmount: 6000000,
      currentAmount: 2100000,
      deadline: `${currentYear + 4}-12-31`,
      monthlyContribution: 85000,
      status: 'em_andamento',
      notes: 'Garantir custos superiores para Mariel, Marilson e Maribel'
    },
    {
      id: 'fg_02',
      userId,
      title: 'Construção da Vivenda no Benfica',
      category: 'casa',
      targetAmount: 15000000,
      currentAmount: 3200000,
      deadline: `${currentYear + 5}-06-30`,
      monthlyContribution: 180000,
      status: 'em_andamento',
      notes: 'Fase de fundações e alvenaria'
    }
  ];

  // Recurring committed transactions
  const recurringTransactions = [
    {
      id: 'rec_01',
      userId,
      description: 'Internet Residencial Fibra',
      amount: 24500,
      type: 'expense',
      categoryId: 'cat_net',
      accountId: 'acc_mcx_03',
      personId: 'per_casa',
      frequency: 'mensal',
      startDate: `${currentYear}-01-10`,
      nextDueDate: `${currentYear}-${String(currentMonth + 1 > 12 ? 1 : currentMonth + 1).padStart(2, '0')}-10`,
      isActive: true
    },
    {
      id: 'rec_02',
      userId,
      description: 'Creche Mariel',
      amount: 55000,
      type: 'expense',
      categoryId: 'cat_creche',
      accountId: 'acc_bai_01',
      personId: 'per_mariel',
      frequency: 'mensal',
      startDate: `${currentYear}-01-02`,
      nextDueDate: `${currentYear}-${String(currentMonth + 1 > 12 ? 1 : currentMonth + 1).padStart(2, '0')}-02`,
      isActive: true
    },
    {
      id: 'rec_03',
      userId,
      description: 'Universidade Roseth',
      amount: 45000,
      type: 'expense',
      categoryId: 'cat_univ',
      accountId: 'acc_bfa_02',
      personId: 'per_roseth',
      frequency: 'mensal',
      startDate: `${currentYear}-01-09`,
      nextDueDate: `${currentYear}-${String(currentMonth + 1 > 12 ? 1 : currentMonth + 1).padStart(2, '0')}-09`,
      isActive: true
    }
  ];

  // Planned Expenses
  const plannedExpenses = [
    {
      id: 'plan_01',
      userId,
      description: 'Seguro Automóvel Contra Terceiros',
      amount: 65000,
      plannedDate: `${currentYear}-${String(currentMonth).padStart(2, '0')}-28`,
      categoryId: 'cat_trans',
      personId: 'per_manuel',
      status: 'pendente',
      notes: 'Renovação anual ENSA'
    },
    {
      id: 'plan_02',
      userId,
      description: 'Material Escolar e Livros',
      amount: 35000,
      plannedDate: `${currentYear}-${String(currentMonth).padStart(2, '0')}-30`,
      categoryId: 'cat_educ',
      personId: 'per_marilson',
      status: 'planeado',
      notes: 'Cadernos e manuais adicionais'
    }
  ];

  // Transfers
  const transfers = [
    {
      id: 'trf_01',
      userId,
      fromAccountId: 'acc_bai_01',
      toAccountId: 'acc_sav_05',
      amount: 100000,
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-05`,
      notes: 'Transferência para Fundo Poupança Mais BAI'
    }
  ];

  // Notifications
  const notifications = [
    {
      id: 'notif_01',
      userId,
      title: 'Orçamento Familiar sob Controlo',
      message: 'Gastou 470.500 Kz de um orçamento mensal de 550.000 Kz (85,5%). Restam 79.500 Kz para despesas.',
      type: 'orcamento_alerta',
      isRead: false,
      date: today
    },
    {
      id: 'notif_02',
      userId,
      title: 'Prestação do Crédito Automóvel',
      message: 'Prestação de 80.000 Kz vence dia 28 no Banco BAI.',
      type: 'despesa_vencendo',
      isRead: false,
      date: today
    },
    {
      id: 'notif_03',
      userId,
      title: 'Meta de Poupança em Crescimento!',
      message: 'O seu Fundo de Emergência atingiu 850.000 Kz (42,5% do alvo de 2.000.000 Kz).',
      type: 'meta_progresso',
      isRead: true,
      date: today
    }
  ];

  // Users
  const users = [
    {
      id: userId,
      name: 'Manuel Umbavumbi',
      email: 'manuelumbavumbi2@gmail.com',
      passwordHash: hashPassword('password123'),
      phone: '+244 923 456 789',
      avatar: '',
      currency: 'Kz',
      createdAt: today
    }
  ];

  const settings = [
    {
      userId,
      appName: 'FinControl Angola',
      currency: 'Kz',
      darkMode: false,
      savingsRuleType: 'percent',
      savingsRuleValue: 15,
      notificationBudgetThreshold: 80,
      language: 'pt-AO'
    }
  ];

  return {
    users,
    accounts,
    categories,
    subcategories: [],
    people,
    income,
    expenses,
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
    settings
  };
}

export class DBManager {
  private data: DatabaseSchema;

  constructor() {
    ensureDataDir();
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Error reading db file, seeding new database:', err);
        this.data = seedInitialData();
        this.save();
      }
    } else {
      this.data = seedInitialData();
      this.save();
    }
  }

  public save() {
    ensureDataDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  public getRawData(): DatabaseSchema {
    return this.data;
  }

  public restoreData(newData: DatabaseSchema) {
    this.data = newData;
    this.save();
  }

  // Users & Auth
  public getUserByEmail(email: string) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  public getUserById(id: string) {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(userData: { name: string; email: string; password: string }) {
    const newUser = {
      id: 'usr_' + Date.now(),
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      passwordHash: hashPassword(userData.password),
      currency: 'Kz',
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);

    // Seed default settings and categories for new user
    const defaultSettings = {
      userId: newUser.id,
      appName: 'FinControl Angola',
      currency: 'Kz',
      darkMode: false,
      savingsRuleType: 'percent',
      savingsRuleValue: 15,
      notificationBudgetThreshold: 80,
      language: 'pt-AO'
    };
    this.data.settings.push(defaultSettings);

    this.save();
    return newUser;
  }

  public updateUserPassword(userId: string, newPassword: string) {
    const user = this.getUserById(userId);
    if (user) {
      user.passwordHash = hashPassword(newPassword);
      this.save();
      return true;
    }
    return false;
  }

  public verifyPassword(user: any, plainPassword: string) {
    return user.passwordHash === hashPassword(plainPassword);
  }

  // Collection CRUD Helpers
  public getForUser<T = any>(collection: keyof DatabaseSchema, userId: string): T[] {
    const list = (this.data[collection] as any[]) || [];
    return list.filter(item => item.userId === userId);
  }

  public insertItem<T = any>(collection: keyof DatabaseSchema, item: any): T {
    if (!item.id) {
      item.id = `${collection.substring(0, 3)}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    }
    if (!item.createdAt) {
      item.createdAt = new Date().toISOString();
    }
    (this.data[collection] as any[]).push(item);
    this.save();
    return item as T;
  }

  public updateItem<T = any>(collection: keyof DatabaseSchema, id: string, userId: string, updates: Partial<T>): T | null {
    const list = this.data[collection] as any[];
    const index = list.findIndex(item => item.id === id && item.userId === userId);
    if (index === -1) return null;
    list[index] = { ...list[index], ...updates };
    this.save();
    return list[index] as T;
  }

  public deleteItem(collection: keyof DatabaseSchema, id: string, userId: string): boolean {
    const list = this.data[collection] as any[];
    const index = list.findIndex(item => item.id === id && item.userId === userId);
    if (index === -1) return false;
    list.splice(index, 1);
    this.save();
    return true;
  }

  public getSettings(userId: string) {
    let settings = this.data.settings.find(s => s.userId === userId);
    if (!settings) {
      settings = {
        userId,
        appName: 'FinControl Angola',
        currency: 'Kz',
        darkMode: false,
        savingsRuleType: 'percent',
        savingsRuleValue: 15,
        notificationBudgetThreshold: 80,
        language: 'pt-AO'
      };
      this.data.settings.push(settings);
      this.save();
    }
    return settings;
  }

  public updateSettings(userId: string, updates: any) {
    let settings = this.getSettings(userId);
    Object.assign(settings, updates);
    this.save();
    return settings;
  }
}

export const db = new DBManager();
