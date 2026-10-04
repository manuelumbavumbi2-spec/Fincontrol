// Client-side fallback database for static hosting environments (Netlify, Vercel, GitHub Pages)
import { formatCurrency } from '../utils/formatters';

const CLIENT_DB_KEY = 'fincontrol_angola_client_db_v1';

export function getInitialSeedData() {
  const userId = 'usr_manuel_01';
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

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
      color: '#1E3A8A',
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
      color: '#EA580C',
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
      color: '#DC2626',
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
      color: '#16A34A',
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
      color: '#059669',
      isActive: true,
      createdAt: today
    }
  ];

  const people = [
    { id: 'per_manuel', userId, name: 'Manuel', relationship: 'usuario', avatarColor: '#2563EB' },
    { id: 'per_roseth', userId, name: 'Roseth', relationship: 'conjuge', avatarColor: '#EC4899' },
    { id: 'per_mariel', userId, name: 'Mariel', relationship: 'filha', avatarColor: '#8B5CF6' },
    { id: 'per_marilson', userId, name: 'Marilson', relationship: 'filho', avatarColor: '#10B981' },
    { id: 'per_maribel', userId, name: 'Maribel', relationship: 'filha', avatarColor: '#F59E0B' },
    { id: 'per_casa', userId, name: 'Casa', relationship: 'casa', avatarColor: '#6B7280' }
  ];

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
    // Income
    { id: 'cat_salario', userId, name: 'Salário', type: 'income', icon: 'Briefcase', color: '#16A34A' },
    { id: 'cat_subsidio', userId, name: 'Subsídio', type: 'income', icon: 'Gift', color: '#059669' },
    { id: 'cat_extra', userId, name: 'Trabalho extra', type: 'income', icon: 'PlusCircle', color: '#10B981' },
    { id: 'cat_negocio', userId, name: 'Negócio', type: 'income', icon: 'Store', color: '#0D9488' },
    { id: 'cat_comissao', userId, name: 'Comissão', type: 'income', icon: 'TrendingUp', color: '#0284C7' },
    { id: 'cat_inv_rend', userId, name: 'Investimentos', type: 'income', icon: 'PiggyBank', color: '#2563EB' },
    { id: 'cat_outros_inc', userId, name: 'Outros Rendimentos', type: 'income', icon: 'Coins', color: '#64748B' }
  ];

  // Specific initial demo expenses: exact total 470.500 Kz
  const expenses = [
    { id: 'exp_01', userId, description: 'Creche', amount: 55000, date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-02`, categoryId: 'cat_creche', personId: 'per_mariel', accountId: 'acc_bai_01', paymentMethod: 'transferencia', status: 'pago', recurrence: 'mensal', location: 'Luanda', notes: 'Mensalidade do colégio infantil', createdAt: today },
    { id: 'exp_02', userId, description: 'Roupa da Mariel', amount: 30000, date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-03`, categoryId: 'cat_vest', personId: 'per_mariel', accountId: 'acc_mcx_03', paymentMethod: 'multicaixa', status: 'pago', recurrence: 'nenhuma', location: 'Kero Kilamba', notes: 'Roupas para a estação e calçado', createdAt: today },
    { id: 'exp_03', userId, description: 'Alimentação Casa', amount: 70000, date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-04`, categoryId: 'cat_alim', personId: 'per_casa', accountId: 'acc_bai_01', paymentMethod: 'multicaixa', status: 'pago', recurrence: 'mensal', location: 'Candando Morro Bento', notes: 'Compras gerais do mês do supermercado', createdAt: today },
    { id: 'exp_04', userId, description: 'Alimentação Serviço', amount: 60000, date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-05`, categoryId: 'cat_alim', personId: 'per_manuel', accountId: 'acc_mcx_03', paymentMethod: 'multicaixa', status: 'pago', recurrence: 'mensal', location: 'Restaurante Marginal', notes: 'Almoços durante os dias de expediente', createdAt: today },
    { id: 'exp_05', userId, description: 'Transporte', amount: 24000, date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-06`, categoryId: 'cat_trans', personId: 'per_manuel', accountId: 'acc_cash_04', paymentMethod: 'dinheiro', status: 'pago', recurrence: 'mensal', location: 'Luanda', notes: 'Combustível e táxis urbanos', createdAt: today },
    { id: 'exp_06', userId, description: 'Pão', amount: 14000, date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-07`, categoryId: 'cat_alim', personId: 'per_casa', accountId: 'acc_cash_04', paymentMethod: 'dinheiro', status: 'pago', recurrence: 'mensal', location: 'Padaria do Bairro', notes: 'Pão fresco diário para a família', createdAt: today },
    { id: 'exp_07', userId, description: 'Matabicho', amount: 40000, date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-08`, categoryId: 'cat_alim', personId: 'per_casa', accountId: 'acc_bai_01', paymentMethod: 'multicaixa', status: 'pago', recurrence: 'mensal', location: 'Supermercado Deskontão', notes: 'Queijo, leite, fiambre, cereais e ovos', createdAt: today },
    { id: 'exp_08', userId, description: 'Universidade Roseth', amount: 45000, date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-09`, categoryId: 'cat_univ', personId: 'per_roseth', accountId: 'acc_bfa_02', paymentMethod: 'transferencia', status: 'pago', recurrence: 'mensal', location: 'Universidade Católica de Angola', notes: 'Propina universitária do mês', createdAt: today },
    { id: 'exp_09', userId, description: 'Internet', amount: 24500, date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-10`, categoryId: 'cat_net', personId: 'per_casa', accountId: 'acc_mcx_03', paymentMethod: 'multicaixa', status: 'pago', recurrence: 'mensal', location: 'Zap Fibra / Unitel Net@Casa', notes: 'Mensalidade de Internet Residencial Fibra', createdAt: today },
    { id: 'exp_10', userId, description: 'TV', amount: 5000, date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-11`, categoryId: 'cat_tv', personId: 'per_casa', accountId: 'acc_mcx_03', paymentMethod: 'multicaixa', status: 'pago', recurrence: 'mensal', location: 'DStv / Zap', notes: 'Pacote Família de televisão por satélite', createdAt: today },
    { id: 'exp_11', userId, description: 'Comando do descodificador', amount: 5000, date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-12`, categoryId: 'cat_tec', personId: 'per_casa', accountId: 'acc_cash_04', paymentMethod: 'dinheiro', status: 'pago', recurrence: 'nenhuma', location: 'Mercado do Rocha', notes: 'Substituição de comando avariado', createdAt: today },
    { id: 'exp_12', userId, description: 'Reparação do ar condicionado', amount: 20000, date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-13`, categoryId: 'cat_manut', personId: 'per_casa', accountId: 'acc_cash_04', paymentMethod: 'dinheiro', status: 'pago', recurrence: 'nenhuma', location: 'Técnico de Frio', notes: 'Carga de gás e limpeza do split da sala', createdAt: today },
    { id: 'exp_13', userId, description: 'Meia', amount: 20000, date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-14`, categoryId: 'cat_vest', personId: 'per_manuel', accountId: 'acc_mcx_03', paymentMethod: 'multicaixa', status: 'pago', recurrence: 'nenhuma', location: 'Belas Shopping', notes: 'Pack de meias executivas e desportivas', createdAt: today },
    { id: 'exp_14', userId, description: 'Escova', amount: 1000, date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-15`, categoryId: 'cat_saude', personId: 'per_casa', accountId: 'acc_cash_04', paymentMethod: 'dinheiro', status: 'pago', recurrence: 'nenhuma', location: 'Farmácia Popular', notes: 'Escova de dentes suave', createdAt: today },
    { id: 'exp_15', userId, description: 'Mochila', amount: 20000, date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-16`, categoryId: 'cat_educ', personId: 'per_marilson', accountId: 'acc_mcx_03', paymentMethod: 'multicaixa', status: 'pago', recurrence: 'nenhuma', location: 'Kero Talatona', notes: 'Mochila escolar resistente', createdAt: today },
    { id: 'exp_16', userId, description: 'Marilson', amount: 10000, date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-17`, categoryId: 'cat_fam', personId: 'per_marilson', accountId: 'acc_cash_04', paymentMethod: 'dinheiro', status: 'pago', recurrence: 'mensal', location: 'Mesada', notes: 'Mesada e lanches semanais', createdAt: today },
    { id: 'exp_17', userId, description: 'Maribel', amount: 10000, date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-18`, categoryId: 'cat_fam', personId: 'per_maribel', accountId: 'acc_cash_04', paymentMethod: 'dinheiro', status: 'pago', recurrence: 'mensal', location: 'Mesada', notes: 'Mesada e lanches escolares', createdAt: today },
    { id: 'exp_18', userId, description: 'IA', amount: 15000, date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-19`, categoryId: 'cat_tec', personId: 'per_manuel', accountId: 'acc_bfa_02', paymentMethod: 'cartao', status: 'pago', recurrence: 'mensal', location: 'Subscrição Digital', notes: 'Subscrição de ferramentas de Inteligência Artificial', createdAt: today },
    { id: 'exp_19', userId, description: 'Cozer', amount: 2000, date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-20`, categoryId: 'cat_vest', personId: 'per_casa', accountId: 'acc_cash_04', paymentMethod: 'dinheiro', status: 'pago', recurrence: 'nenhuma', location: 'Alfaiataria do Bairro', notes: 'Ajuste e costura de calças e fardas', createdAt: today }
  ];

  const income = [
    { id: 'inc_01', userId, description: 'Salário Mensal Principal', amount: 650000, date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`, categoryId: 'cat_salario', source: 'Empresa de Tecnologia e Telecomunicações', accountId: 'acc_bai_01', personId: 'per_manuel', recurrence: 'mensal', notes: 'Vencimento mensal líquido com subsídio de transporte', createdAt: today },
    { id: 'inc_02', userId, description: 'Consultoria e Trabalho Extra', amount: 150000, date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-15`, categoryId: 'cat_extra', source: 'Cliente Empresarial Luanda', accountId: 'acc_bfa_02', personId: 'per_manuel', recurrence: 'mensal', notes: 'Prestação de serviços de consultoria informática', createdAt: today },
    { id: 'inc_03', userId, description: 'Negócio de Confeitaria Roseth', amount: 80000, date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-18`, categoryId: 'cat_negocio', source: 'Encomendas de Bolos e Doces', accountId: 'acc_mcx_03', personId: 'per_roseth', recurrence: 'mensal', notes: 'Vendas da semana', createdAt: today }
  ];

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

  const savingsGoals = [
    { id: 'sav_01', userId, name: 'Fundo de Emergência Familiar', targetAmount: 2000000, initialAmount: 400000, currentAmount: 850000, startDate: `${currentYear}-01-01`, deadline: `${currentYear + 1}-12-31`, monthlyTarget: 100000, frequency: 'mensal', accountId: 'acc_sav_05', notes: 'Garantia de 6 meses de custo fixo familiar em Angola', status: 'em_andamento', color: '#10B981' },
    { id: 'sav_02', userId, name: 'Fundo para Viatura Familiar', targetAmount: 5000000, initialAmount: 500000, currentAmount: 1800000, startDate: `${currentYear}-01-01`, deadline: `${currentYear + 2}-06-30`, monthlyTarget: 150000, frequency: 'mensal', accountId: 'acc_sav_05', notes: 'Aquisição de viatura SUV para a família', status: 'em_andamento', color: '#3B82F6' },
    { id: 'sav_03', userId, name: 'Férias em Benguela / Namibe', targetAmount: 600000, initialAmount: 100000, currentAmount: 350000, startDate: `${currentYear}-03-01`, deadline: `${currentYear}-12-15`, monthlyTarget: 50000, frequency: 'mensal', accountId: 'acc_bai_01', notes: 'Viagem de fim de ano com as crianças', status: 'em_andamento', color: '#F59E0B' }
  ];

  const savingsTransactions = [
    { id: 'sav_tx_01', userId, goalId: 'sav_01', date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-05`, amount: 100000, accountId: 'acc_bai_01', type: 'deposito', notes: 'Reforço mensal automático' }
  ];

  const investments = [
    { id: 'inv_01', userId, name: 'Obrigações do Tesouro Não Reajustáveis (OT-NR)', type: 'obrigacoes', institution: 'BODIVA / BAI Invest', investedAmount: 1500000, currentValue: 1725000, expectedValue: 1800000, startDate: `${currentYear - 1}-06-15`, maturityDate: `${currentYear + 2}-06-15`, returnRate: 17.5, returnsReceived: 225000, status: 'ativo', notes: 'Juros semestrais pagos em conta BAI' },
    { id: 'inv_02', userId, name: 'Depósito a Prazo Rendimento Máximo', type: 'deposito_prazo', institution: 'Banco de Fomento Angola (BFA)', investedAmount: 800000, currentValue: 896000, expectedValue: 920000, startDate: `${currentYear}-01-10`, maturityDate: `${currentYear}-12-31`, returnRate: 14.0, returnsReceived: 96000, status: 'ativo', notes: 'Prazo de 365 dias com taxa garantida' },
    { id: 'inv_03', userId, name: 'Participação Micro-Negócio Agro', type: 'negocios', institution: 'Cooperativa Agrícola Kwanza Sul', investedAmount: 500000, currentValue: 580000, expectedValue: 650000, startDate: `${currentYear}-02-01`, maturityDate: `${currentYear + 1}-02-01`, returnRate: 16.0, returnsReceived: 80000, status: 'ativo', notes: 'Produção hortícola distribuída em Luanda' }
  ];

  const investmentTransactions = [
    { id: 'inv_tx_01', userId, investmentId: 'inv_01', date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-02`, amount: 112500, type: 'juros', notes: 'Pagamento de cupão semestral' }
  ];

  const debts = [
    { id: 'deb_01', userId, creditor: 'Banco BAI', description: 'Crédito Automóvel', originalAmount: 1200000, paidAmount: 800000, remainingAmount: 400000, startDate: `${currentYear - 1}-01-15`, dueDate: `${currentYear}-${String(currentMonth).padStart(2, '0')}-28`, installmentAmount: 80000, interestRate: 12.0, status: 'ativa', notes: 'Restam 5 prestações mensais' },
    { id: 'deb_02', userId, creditor: 'Loja de Eletrodomésticos', description: 'Geleira e Fogão em Prestações', originalAmount: 250000, paidAmount: 200000, remainingAmount: 50000, startDate: `${currentYear}-01-10`, dueDate: `${currentYear}-${String(currentMonth).padStart(2, '0')}-25`, installmentAmount: 25000, interestRate: 0, status: 'ativa', notes: 'Últimas 2 mensalidades sem juros' }
  ];

  const assets = [
    { id: 'ast_01', userId, name: 'Apartamento T3 Centralidade do Kilamba', type: 'imoveis', estimatedValue: 28000000, purchaseDate: `${currentYear - 4}-05-20`, notes: 'Habitação própria familiar' },
    { id: 'ast_02', userId, name: 'Viatura Hyundai Tucson', type: 'viaturas', estimatedValue: 7500000, purchaseDate: `${currentYear - 2}-11-10`, notes: 'Viatura de uso familiar' },
    { id: 'ast_03', userId, name: 'Equipamentos Informáticos & Trabalho', type: 'equipamentos', estimatedValue: 1200000, purchaseDate: `${currentYear - 1}-08-15`, notes: 'MacBook Pro, monitores e escritório' },
    { id: 'ast_04', userId, name: 'Terreno / Parcela no Benfica', type: 'imoveis', estimatedValue: 4500000, purchaseDate: `${currentYear - 2}-03-12`, notes: 'Parcela de 20x30m com vedação' }
  ];

  const financialGoals = [
    { id: 'fg_01', userId, title: 'Educação Universitária dos Filhos', category: 'educacao', targetAmount: 6000000, currentAmount: 2100000, deadline: `${currentYear + 4}-12-31`, monthlyContribution: 85000, status: 'em_andamento', notes: 'Garantir custos superiores para Mariel, Marilson e Maribel' },
    { id: 'fg_02', userId, title: 'Construção da Vivenda no Benfica', category: 'casa', targetAmount: 15000000, currentAmount: 3200000, deadline: `${currentYear + 5}-06-30`, monthlyContribution: 180000, status: 'em_andamento', notes: 'Fase de fundações e alvenaria' }
  ];

  const recurringTransactions = [
    { id: 'rec_01', userId, description: 'Internet Residencial Fibra', amount: 24500, type: 'expense', categoryId: 'cat_net', accountId: 'acc_mcx_03', personId: 'per_casa', frequency: 'mensal', startDate: `${currentYear}-01-10`, nextDueDate: `${currentYear}-${String(currentMonth + 1 > 12 ? 1 : currentMonth + 1).padStart(2, '0')}-10`, isActive: true },
    { id: 'rec_02', userId, description: 'Creche Mariel', amount: 55000, type: 'expense', categoryId: 'cat_creche', accountId: 'acc_bai_01', personId: 'per_mariel', frequency: 'mensal', startDate: `${currentYear}-01-02`, nextDueDate: `${currentYear}-${String(currentMonth + 1 > 12 ? 1 : currentMonth + 1).padStart(2, '0')}-02`, isActive: true },
    { id: 'rec_03', userId, description: 'Universidade Roseth', amount: 45000, type: 'expense', categoryId: 'cat_univ', accountId: 'acc_bfa_02', personId: 'per_roseth', frequency: 'mensal', startDate: `${currentYear}-01-09`, nextDueDate: `${currentYear}-${String(currentMonth + 1 > 12 ? 1 : currentMonth + 1).padStart(2, '0')}-09`, isActive: true }
  ];

  const plannedExpenses = [
    { id: 'plan_01', userId, description: 'Seguro Automóvel Contra Terceiros', amount: 65000, plannedDate: `${currentYear}-${String(currentMonth).padStart(2, '0')}-28`, categoryId: 'cat_trans', personId: 'per_manuel', status: 'pendente', notes: 'Renovação anual ENSA' },
    { id: 'plan_02', userId, description: 'Material Escolar e Livros', amount: 35000, plannedDate: `${currentYear}-${String(currentMonth).padStart(2, '0')}-30`, categoryId: 'cat_educ', personId: 'per_marilson', status: 'planeado', notes: 'Cadernos e manuais adicionais' }
  ];

  const transfers = [
    { id: 'trf_01', userId, fromAccountId: 'acc_bai_01', toAccountId: 'acc_sav_05', amount: 100000, date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-05`, notes: 'Transferência para Fundo Poupança Mais BAI' }
  ];

  const notifications = [
    { id: 'notif_01', userId, title: 'Orçamento Familiar sob Controlo', message: 'Gastou 470.500 Kz de um orçamento mensal de 550.000 Kz (85,5%). Restam 79.500 Kz para despesas.', type: 'orcamento_alerta', isRead: false, date: today },
    { id: 'notif_02', userId, title: 'Prestação do Crédito Automóvel', message: 'Prestação de 80.000 Kz vence dia 28 no Banco BAI.', type: 'despesa_vencendo', isRead: false, date: today },
    { id: 'notif_03', userId, title: 'Meta de Poupança em Crescimento!', message: 'O seu Fundo de Emergência atingiu 850.000 Kz (42,5% do alvo de 2.000.000 Kz).', type: 'meta_progresso', isRead: true, date: today }
  ];

  const users = [
    {
      id: userId,
      name: 'Manuel Umbavumbi',
      email: 'manuelumbavumbi2@gmail.com',
      password: 'password123',
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

class ClientStorageEngine {
  private data: any;

  constructor() {
    this.init();
  }

  private init() {
    try {
      const stored = localStorage.getItem(CLIENT_DB_KEY);
      if (stored) {
        this.data = JSON.parse(stored);
        // Integrity check: if data structure is missing users or categories, repair with seed data
        if (
          !this.data ||
          !Array.isArray(this.data.users) ||
          this.data.users.length === 0 ||
          !Array.isArray(this.data.categories) ||
          this.data.categories.length === 0
        ) {
          const fresh = getInitialSeedData();
          this.data = { ...fresh, ...(this.data || {}) };
          if (!this.data.users || this.data.users.length === 0) {
            this.data.users = fresh.users;
          }
          if (!this.data.categories || this.data.categories.length === 0) {
            this.data.categories = fresh.categories;
          }
          if (!this.data.accounts || this.data.accounts.length === 0) {
            this.data.accounts = fresh.accounts;
          }
          this.save();
        }
      } else {
        this.data = getInitialSeedData();
        this.save();
      }
    } catch {
      this.data = getInitialSeedData();
      this.save();
    }
  }

  private save() {
    try {
      localStorage.setItem(CLIENT_DB_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  public getData() {
    if (!this.data) this.init();
    return this.data;
  }

  public login(email: string, pass: string) {
    this.init();
    const normalizedEmail = (email || '').toLowerCase().trim();
    const cleanPass = (pass || '').trim();

    // 1. Manuel Umbavumbi (Demo Account) - Always succeed smoothly
    if (
      normalizedEmail === 'manuelumbavumbi2@gmail.com' ||
      normalizedEmail === 'demo' ||
      normalizedEmail === 'demo@fincontrol.ao'
    ) {
      let demoUser = (this.data.users || []).find(
        (u: any) => u.email && u.email.toLowerCase() === 'manuelumbavumbi2@gmail.com'
      );
      if (!demoUser) {
        demoUser = {
          id: 'usr_manuel_01',
          name: 'Manuel Umbavumbi',
          email: 'manuelumbavumbi2@gmail.com',
          password: 'password123',
          currency: 'Kz',
          phone: '+244 923 456 789',
          createdAt: new Date().toISOString()
        };
        if (!this.data.users) this.data.users = [];
        this.data.users.unshift(demoUser);
        this.save();
      }
      return { token: demoUser.id, user: demoUser };
    }

    // 2. Look for existing user
    let found = (this.data.users || []).find((u: any) => u.email && u.email.toLowerCase() === normalizedEmail);

    // If user does not exist yet (e.g. user entered their personal email directly on Netlify):
    // Smoothly auto-create their account with full Angolan templates so they are never blocked!
    if (!found) {
      const derivedName = normalizedEmail.split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());

      const newUser = {
        id: 'usr_' + Date.now(),
        name: derivedName || 'Utilizador FinControl',
        email: normalizedEmail,
        password: cleanPass || 'password123',
        currency: 'Kz',
        createdAt: new Date().toISOString()
      };
      if (!this.data.users) this.data.users = [];
      this.data.users.push(newUser);
      this.save();
      found = newUser;
    }

    const safeUser = {
      id: found.id,
      name: found.name,
      email: found.email,
      currency: found.currency || 'Kz',
      phone: found.phone || '',
      createdAt: found.createdAt
    };
    return { token: found.id, user: safeUser };
  }

  public register(name: string, email: string, pass: string) {
    this.init();
    const normalizedEmail = (email || '').toLowerCase().trim();
    let existing = (this.data.users || []).find((u: any) => u.email && u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      // If user already exists, update password and log in
      existing.password = pass;
      this.save();
      return { token: existing.id, user: existing };
    }

    const newUser = {
      id: 'usr_' + Date.now(),
      name: name || 'Novo Utilizador',
      email: normalizedEmail,
      password: pass,
      currency: 'Kz',
      createdAt: new Date().toISOString()
    };
    if (!this.data.users) this.data.users = [];
    this.data.users.push(newUser);
    this.save();
    return { token: newUser.id, user: newUser };
  }

  public getMe(token?: string) {
    this.init();
    const targetId = token || 'usr_manuel_01';
    const user = (this.data.users || []).find((u: any) => u.id === targetId) || this.data.users[0];
    return { user };
  }

  public getAllData(userId: string = 'usr_manuel_01') {
    this.init();

    // Ensure user has default categories
    let userCategories = (this.data.categories || []).filter((item: any) => item.userId === userId);
    if (userCategories.length === 0) {
      const seed = getInitialSeedData();
      userCategories = seed.categories.map(c => ({ ...c, userId }));
      this.data.categories = [...(this.data.categories || []), ...userCategories];
    }

    // Ensure user has default accounts
    let userAccounts = (this.data.accounts || []).filter((item: any) => item.userId === userId);
    if (userAccounts.length === 0) {
      const seed = getInitialSeedData();
      userAccounts = seed.accounts.map(a => ({ ...a, userId }));
      this.data.accounts = [...(this.data.accounts || []), ...userAccounts];
    }

    // Filter by user or return demo items if list is empty for demo/new account
    const filterUser = (list: any[]) => {
      const userList = (list || []).filter(item => item.userId === userId);
      if (userList.length > 0) return userList;
      // Default to demo data if user is Manuel or if user has no data yet
      return (list || []).filter(item => item.userId === 'usr_manuel_01' || !item.userId);
    };

    const userSettings = (this.data.settings || []).find((s: any) => s.userId === userId) || this.data.settings[0] || {
      userId,
      appName: 'FinControl Angola',
      currency: 'Kz',
      darkMode: false,
      savingsRuleType: 'percent',
      savingsRuleValue: 15,
      notificationBudgetThreshold: 80,
      language: 'pt-AO'
    };

    return {
      accounts: filterUser(this.data.accounts),
      categories: filterUser(this.data.categories),
      people: filterUser(this.data.people),
      expenses: filterUser(this.data.expenses),
      income: filterUser(this.data.income),
      budgets: filterUser(this.data.budgets),
      savingsGoals: filterUser(this.data.savingsGoals),
      savingsTransactions: filterUser(this.data.savingsTransactions),
      investments: filterUser(this.data.investments),
      investmentTransactions: filterUser(this.data.investmentTransactions),
      debts: filterUser(this.data.debts),
      assets: filterUser(this.data.assets),
      financialGoals: filterUser(this.data.financialGoals),
      recurringTransactions: filterUser(this.data.recurringTransactions),
      plannedExpenses: filterUser(this.data.plannedExpenses),
      transfers: filterUser(this.data.transfers),
      notifications: filterUser(this.data.notifications),
      settings: [userSettings]
    };
  }

  public createItem(collection: string, item: any, userId: string = 'usr_manuel_01') {
    this.init();
    if (!this.data[collection]) this.data[collection] = [];
    const newItem = {
      ...item,
      id: item.id || `${collection.substring(0, 3)}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: item.userId || userId,
      createdAt: item.createdAt || new Date().toISOString()
    };
    this.data[collection].unshift(newItem);

    // Adjust balances locally
    if (collection === 'expenses' && newItem.accountId && newItem.amount && newItem.status === 'pago') {
      const acc = this.data.accounts.find((a: any) => a.id === newItem.accountId);
      if (acc) acc.balance = (Number(acc.balance) || 0) - Number(newItem.amount);
    }
    if (collection === 'income' && newItem.accountId && newItem.amount) {
      const acc = this.data.accounts.find((a: any) => a.id === newItem.accountId);
      if (acc) acc.balance = (Number(acc.balance) || 0) + Number(newItem.amount);
    }

    this.save();
    return newItem;
  }

  public updateItem(collection: string, id: string, updates: any) {
    this.init();
    const list = this.data[collection] || [];
    const index = list.findIndex((i: any) => i.id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...updates };
    this.save();
    return list[index];
  }

  public deleteItem(collection: string, id: string) {
    this.init();
    const list = this.data[collection] || [];
    const index = list.findIndex((i: any) => i.id === id);
    if (index !== -1) {
      list.splice(index, 1);
      this.save();
    }
    return { success: true, id };
  }

  public transfer(data: { fromAccountId: string; toAccountId: string; amount: number; notes?: string; date?: string }, userId: string = 'usr_manuel_01') {
    this.init();
    const fromAcc = this.data.accounts.find((a: any) => a.id === data.fromAccountId);
    const toAcc = this.data.accounts.find((a: any) => a.id === data.toAccountId);
    if (fromAcc && toAcc) {
      const amt = Number(data.amount);
      fromAcc.balance = (Number(fromAcc.balance) || 0) - amt;
      toAcc.balance = (Number(toAcc.balance) || 0) + amt;

      const record = {
        id: `trf_${Date.now()}`,
        userId,
        fromAccountId: data.fromAccountId,
        toAccountId: data.toAccountId,
        amount: amt,
        date: data.date || new Date().toISOString().split('T')[0],
        notes: data.notes || 'Transferência entre contas'
      };
      if (!this.data.transfers) this.data.transfers = [];
      this.data.transfers.unshift(record);
      this.save();
    }
    return { success: true };
  }

  public addSavingsTransaction(data: { goalId: string; amount: number; type: 'deposito' | 'resgate'; accountId?: string; notes?: string; date?: string }, userId: string = 'usr_manuel_01') {
    this.init();
    const goal = this.data.savingsGoals.find((g: any) => g.id === data.goalId);
    if (goal) {
      const amt = Number(data.amount);
      const curr = Number(goal.currentAmount) || 0;
      goal.currentAmount = data.type === 'deposito' ? curr + amt : Math.max(0, curr - amt);

      if (data.accountId) {
        const acc = this.data.accounts.find((a: any) => a.id === data.accountId);
        if (acc) {
          const accBal = Number(acc.balance) || 0;
          acc.balance = data.type === 'deposito' ? accBal - amt : accBal + amt;
        }
      }

      if (!this.data.savingsTransactions) this.data.savingsTransactions = [];
      this.data.savingsTransactions.unshift({
        id: `sav_tx_${Date.now()}`,
        userId,
        ...data,
        date: data.date || new Date().toISOString().split('T')[0]
      });
      this.save();
    }
    return { success: true };
  }

  public addInvestmentTransaction(data: { investmentId: string; amount: number; type: string; notes?: string; date?: string }, userId: string = 'usr_manuel_01') {
    this.init();
    const inv = this.data.investments.find((i: any) => i.id === data.investmentId);
    if (inv) {
      const amt = Number(data.amount);
      if (data.type === 'aporte') {
        inv.investedAmount = (Number(inv.investedAmount) || 0) + amt;
        inv.currentValue = (Number(inv.currentValue) || 0) + amt;
      } else if (data.type === 'resgate') {
        inv.currentValue = Math.max(0, (Number(inv.currentValue) || 0) - amt);
      } else {
        inv.returnsReceived = (Number(inv.returnsReceived) || 0) + amt;
        inv.currentValue = (Number(inv.currentValue) || 0) + amt;
      }

      if (!this.data.investmentTransactions) this.data.investmentTransactions = [];
      this.data.investmentTransactions.unshift({
        id: `inv_tx_${Date.now()}`,
        userId,
        ...data,
        date: data.date || new Date().toISOString().split('T')[0]
      });
      this.save();
    }
    return { success: true };
  }

  public payDebt(debtId: string, amount: number, accountId?: string, userId: string = 'usr_manuel_01') {
    this.init();
    const debt = this.data.debts.find((d: any) => d.id === debtId);
    if (debt) {
      const amt = Number(amount);
      debt.paidAmount = (Number(debt.paidAmount) || 0) + amt;
      debt.remainingAmount = Math.max(0, Number(debt.originalAmount) - debt.paidAmount);
      if (debt.remainingAmount === 0) debt.status = 'paga';

      if (accountId) {
        const acc = this.data.accounts.find((a: any) => a.id === accountId);
        if (acc) acc.balance = (Number(acc.balance) || 0) - amt;
      }

      this.createItem('expenses', {
        userId,
        description: `Pagamento Dívida: ${debt.creditor} (${debt.description})`,
        amount: amt,
        date: new Date().toISOString().split('T')[0],
        categoryId: 'cat_dividas',
        accountId: accountId || 'acc_bai_01',
        paymentMethod: 'transferencia',
        status: 'pago',
        recurrence: 'nenhuma',
        notes: `Amortização de dívida. Restam ${debt.remainingAmount} Kz.`
      });
      this.save();
    }
    return { success: true };
  }

  public askAI(question: string, userId: string = 'usr_manuel_01') {
    const data = this.getAllData(userId);
    const expenses = data.expenses;
    const incomes = data.income;
    const savings = data.savingsGoals;
    const investments = data.investments;
    const debts = data.debts;
    const budgets = data.budgets;
    const categories = data.categories;
    const cur = 'Kz';

    const catMap = new Map(categories.map((c: any) => [c.id, c.name]));
    const totalReceitas = incomes.reduce((acc: number, i: any) => acc + (Number(i.amount) || 0), 0);
    const totalDespesas = expenses
      .filter((e: any) => e.status !== 'cancelado')
      .reduce((acc: number, e: any) => acc + (Number(e.amount) || 0), 0);
    const totalPoupancas = savings.reduce((acc: number, s: any) => acc + (Number(s.currentAmount) || 0), 0);
    const totalInvestido = investments.reduce((acc: number, i: any) => acc + (Number(i.currentValue) || 0), 0);
    const capitalInvestidoOriginal = investments.reduce((acc: number, i: any) => acc + (Number(i.investedAmount) || 0), 0);
    const totalLucroInvestimentos = totalInvestido - capitalInvestidoOriginal;
    const totalDividasPendentes = debts
      .filter((d: any) => d.status !== 'paga')
      .reduce((acc: number, d: any) => acc + (Number(d.remainingAmount) || 0), 0);
    const totalActivos = data.assets.reduce((acc: number, a: any) => acc + (Number(a.estimatedValue) || 0), 0);
    const patrimonioLiquido = (totalActivos + totalPoupancas + totalInvestido) - totalDividasPendentes;

    const budgetLimit = budgets[0]?.overallLimit || 550000;
    const budgetRemaining = budgetLimit - totalDespesas;
    const budgetPercent = budgetLimit > 0 ? (totalDespesas / budgetLimit) * 100 : 0;

    const expensesByCategory: Record<string, number> = {};
    for (const e of expenses) {
      if (e.status === 'cancelado') continue;
      const catName = catMap.get(e.categoryId) || 'Outros';
      expensesByCategory[catName] = (expensesByCategory[catName] || 0) + Number(e.amount);
    }
    const sortedCategories = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]);
    const maiorCategoria = sortedCategories[0] || ['Nenhuma', 0];
    const sortedExpenses = [...expenses].sort((a: any, b: any) => b.amount - a.amount);
    const maiorDespesa = sortedExpenses[0] || { description: 'Nenhuma', amount: 0 };

    const q = question.toLowerCase();

    if (q.includes('quanto gastei este mês') || q.includes('total de despesas') || q.includes('quanto já gastei')) {
      return {
        answer: `Este mês gastou um total de **${formatCurrency(totalDespesas, cur)}** distribuídos por ${expenses.length} despesas registadas. O seu orçamento mensal é de **${formatCurrency(budgetLimit, cur)}**, tendo já utilizado **${budgetPercent.toFixed(1)}%** do limite.`
      };
    }
    if (q.includes('alimentação') || q.includes('comida') || q.includes('matabicho')) {
      const totalAlim = expensesByCategory['Alimentação'] || 0;
      return {
        answer: `Com Alimentação já gastou um total de **${formatCurrency(totalAlim, cur)}** este mês (compras de casa, almoços em serviço, pão e matabicho). Representa **${totalDespesas > 0 ? ((totalAlim / totalDespesas) * 100).toFixed(1) : 0}%** do seu total de despesas.`
      };
    }
    if (q.includes('quanto poupei') || q.includes('poupança') || q.includes('fundo de emergência')) {
      return {
        answer: `Actualmente tem um total acumulado em poupança de **${formatCurrency(totalPoupancas, cur)}**. O seu Fundo de Emergência conta com **${formatCurrency(savings[0]?.currentAmount || 0, cur)}** (meta de ${formatCurrency(savings[0]?.targetAmount || 0, cur)}).`
      };
    }
    if (q.includes('quanto investi') || q.includes('investimentos')) {
      return {
        answer: `O seu valor actualmente investido é de **${formatCurrency(totalInvestido, cur)}** (capital original aplicado: ${formatCurrency(capitalInvestidoOriginal, cur)}). O lucro acumulado é de **${formatCurrency(totalLucroInvestimentos, cur)}**.`
      };
    }
    if (q.includes('quanto devo') || q.includes('dívida') || q.includes('dividas')) {
      return {
        answer: `O saldo devedor actual em dívidas activas é de **${formatCurrency(totalDividasPendentes, cur)}**, distribuído por ${debts.length} obrigações (${debts.map((d: any) => `${d.creditor}: ${formatCurrency(d.remainingAmount, cur)}`).join(', ')}).`
      };
    }
    if (q.includes('quanto tenho disponível') || q.includes('saldo disponível')) {
      return {
        answer: `Do seu orçamento mensal (${formatCurrency(budgetLimit, cur)}), ainda pode gastar **${formatCurrency(Math.max(0, budgetRemaining), cur)}**. No total das suas contas bancárias e dinheiro físico tem um saldo líquido confortável.`
      };
    }
    if (q.includes('maior despesa')) {
      return {
        answer: `A sua maior despesa individual registada foi **${maiorDespesa.description}** no valor de **${formatCurrency(maiorDespesa.amount, cur)}**. A categoria com maior peso global é **${maiorCategoria[0]}** (${formatCurrency(maiorCategoria[1], cur)}).`
      };
    }
    if (q.includes('património') || q.includes('patrimonio')) {
      return {
        answer: `O seu Património Líquido actual é de **${formatCurrency(patrimonioLiquido, cur)}**.\nCálculo: Activos (${formatCurrency(totalActivos, cur)}) + Poupanças (${formatCurrency(totalPoupancas, cur)}) + Investimentos (${formatCurrency(totalInvestido, cur)}) − Dívidas (${formatCurrency(totalDividasPendentes, cur)}).`
      };
    }
    if (q.includes('posso gastar 50.000') || q.includes('posso gastar')) {
      if (budgetRemaining >= 50000) {
        return {
          answer: `Sim! Tem actualmente **${formatCurrency(budgetRemaining, cur)}** disponível no seu orçamento deste mês. Uma despesa de 50.000 Kz deixará ainda **${formatCurrency(budgetRemaining - 50000, cur)}** de margem orçamental de segurança.`
        };
      } else {
        return {
          answer: `Atenção: Apenas lhe restam **${formatCurrency(budgetRemaining, cur)}** de orçamento este mês. Gastar 50.000 Kz fará com que ultrapasse o seu orçamento planeado.`
        };
      }
    }

    return {
      answer: `Com base nos seus dados financeiros actuais:\n• Receitas do mês: **${formatCurrency(totalReceitas, cur)}**\n• Despesas do mês: **${formatCurrency(totalDespesas, cur)}**\n• Poupança acumulada: **${formatCurrency(totalPoupancas, cur)}**\n• Património líquido: **${formatCurrency(patrimonioLiquido, cur)}**\n\nPode perguntar-me sobre despesas por categoria, pessoas da família, orçamento ou viabilidade de novas compras!`
    };
  }

  public exportBackup() {
    this.init();
    return this.data;
  }

  public importBackup(backupData: any) {
    if (!backupData || !Array.isArray(backupData.expenses)) {
      throw new Error('Ficheiro de backup JSON inválido.');
    }
    this.data = backupData;
    this.save();
    return { success: true };
  }
}

export const clientDb = new ClientStorageEngine();
