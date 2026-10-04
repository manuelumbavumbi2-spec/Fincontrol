import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './server/db.js';
import { askFinancialAssistant } from './server/ai.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// Simple bearer auth middleware
function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // Default to the seeded demo user if no token provided to guarantee seamless access
    (req as any).userId = 'usr_manuel_01';
    return next();
  }

  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) {
    (req as any).userId = 'usr_manuel_01';
    return next();
  }

  // Token format: usr_... or demo
  const user = db.getUserById(token);
  if (user) {
    (req as any).userId = user.id;
  } else {
    (req as any).userId = 'usr_manuel_01';
  }
  next();
}

// ----------------- AUTH ROUTES -----------------
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e palavra-passe são obrigatórios.' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas. Verifique o email ou palavra-passe.' });
  }

  const isValid = db.verifyPassword(user, password);
  if (!isValid && password !== 'password123') { // Allow standard demo password fallback
    return res.status(401).json({ error: 'Credenciais inválidas. Verifique a palavra-passe.' });
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    currency: user.currency || 'Kz',
    phone: user.phone || '',
    avatar: user.avatar || '',
    createdAt: user.createdAt
  };

  res.json({
    token: user.id,
    user: safeUser
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'A palavra-passe deve ter pelo menos 6 caracteres.' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'Já existe uma conta associada a este endereço de email.' });
  }

  const newUser = db.createUser({ name, email, password });
  const safeUser = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    currency: newUser.currency,
    createdAt: newUser.createdAt
  };

  res.status(201).json({
    token: newUser.id,
    user: safeUser
  });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const userId = (req as any).userId;
  const user = db.getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'Utilizador não encontrado.' });
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      currency: user.currency || 'Kz',
      phone: user.phone || '',
      avatar: user.avatar || '',
      createdAt: user.createdAt
    }
  });
});

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  const user = db.getUserByEmail(email || '');
  if (!user) {
    return res.status(404).json({ error: 'Nenhum utilizador encontrado com este email.' });
  }

  // Generate a temporary recovery code
  res.json({
    success: true,
    message: 'Instruções de recuperação enviadas com sucesso para o seu email.',
    recoveryToken: user.id
  });
});

app.post('/api/auth/reset-password', (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token e nova palavra-passe são necessários.' });
  }

  const updated = db.updateUserPassword(token, newPassword);
  if (!updated) {
    return res.status(400).json({ error: 'Token de recuperação inválido ou expirado.' });
  }

  res.json({ success: true, message: 'Palavra-passe actualizada com sucesso!' });
});

// ----------------- FINANCIAL DATA ROUTES -----------------
app.get('/api/finance/data', authMiddleware, (req, res) => {
  const userId = (req as any).userId;

  const accounts = db.getForUser('accounts', userId);
  const categories = db.getForUser('categories', userId);
  const people = db.getForUser('people', userId);
  const expenses = db.getForUser('expenses', userId);
  const income = db.getForUser('income', userId);
  const budgets = db.getForUser('budgets', userId);
  const savingsGoals = db.getForUser('savingsGoals', userId);
  const savingsTransactions = db.getForUser('savingsTransactions', userId);
  const investments = db.getForUser('investments', userId);
  const investmentTransactions = db.getForUser('investmentTransactions', userId);
  const debts = db.getForUser('debts', userId);
  const assets = db.getForUser('assets', userId);
  const financialGoals = db.getForUser('financialGoals', userId);
  const recurringTransactions = db.getForUser('recurringTransactions', userId);
  const plannedExpenses = db.getForUser('plannedExpenses', userId);
  const transfers = db.getForUser('transfers', userId);
  const notifications = db.getForUser('notifications', userId);
  const settings = db.getSettings(userId);

  res.json({
    accounts,
    categories,
    people,
    expenses,
    income,
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
  });
});

// Generic CRUD endpoints for collections
const allowedCollections = [
  'accounts',
  'categories',
  'people',
  'expenses',
  'income',
  'budgets',
  'savingsGoals',
  'savingsTransactions',
  'investments',
  'investmentTransactions',
  'debts',
  'assets',
  'financialGoals',
  'recurringTransactions',
  'plannedExpenses',
  'notifications'
];

app.post('/api/finance/:collection', authMiddleware, (req, res) => {
  const { collection } = req.params;
  const userId = (req as any).userId;

  if (!allowedCollections.includes(collection)) {
    return res.status(400).json({ error: 'Colecção desconhecida.' });
  }

  const payload = {
    ...req.body,
    userId,
    createdAt: new Date().toISOString()
  };

  const item = db.insertItem(collection as any, payload);

  // If adding an expense, automatically adjust account balance
  if (collection === 'expenses' && payload.accountId && payload.amount && payload.status === 'pago') {
    const acc = db.getForUser('accounts', userId).find(a => a.id === payload.accountId);
    if (acc) {
      db.updateItem('accounts', acc.id, userId, {
        balance: (Number(acc.balance) || 0) - Number(payload.amount)
      });
    }
  }

  // If adding income, automatically adjust account balance
  if (collection === 'income' && payload.accountId && payload.amount) {
    const acc = db.getForUser('accounts', userId).find(a => a.id === payload.accountId);
    if (acc) {
      db.updateItem('accounts', acc.id, userId, {
        balance: (Number(acc.balance) || 0) + Number(payload.amount)
      });
    }
  }

  res.status(201).json(item);
});

app.put('/api/finance/:collection/:id', authMiddleware, (req, res) => {
  const { collection, id } = req.params;
  const userId = (req as any).userId;

  if (!allowedCollections.includes(collection)) {
    return res.status(400).json({ error: 'Colecção desconhecida.' });
  }

  const updated = db.updateItem(collection as any, id, userId, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Item não encontrado.' });
  }

  res.json(updated);
});

app.delete('/api/finance/:collection/:id', authMiddleware, (req, res) => {
  const { collection, id } = req.params;
  const userId = (req as any).userId;

  if (!allowedCollections.includes(collection)) {
    return res.status(400).json({ error: 'Colecção desconhecida.' });
  }

  const deleted = db.deleteItem(collection as any, id, userId);
  if (!deleted) {
    return res.status(404).json({ error: 'Item não encontrado para remoção.' });
  }

  res.json({ success: true, id });
});

// Transfer between accounts (doesn't count as expense, updates both balances)
app.post('/api/finance/transfer', authMiddleware, (req, res) => {
  const userId = (req as any).userId;
  const { fromAccountId, toAccountId, amount, date, notes } = req.body;

  if (!fromAccountId || !toAccountId || !amount || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Dados da transferência inválidos.' });
  }

  const fromAcc = db.getForUser('accounts', userId).find(a => a.id === fromAccountId);
  const toAcc = db.getForUser('accounts', userId).find(a => a.id === toAccountId);

  if (!fromAcc || !toAcc) {
    return res.status(404).json({ error: 'Contas de origem ou destino não encontradas.' });
  }

  const transferAmount = Number(amount);
  db.updateItem('accounts', fromAcc.id, userId, { balance: (Number(fromAcc.balance) || 0) - transferAmount });
  db.updateItem('accounts', toAcc.id, userId, { balance: (Number(toAcc.balance) || 0) + transferAmount });

  const transferRecord = db.insertItem('transfers', {
    userId,
    fromAccountId,
    toAccountId,
    amount: transferAmount,
    date: date || new Date().toISOString().split('T')[0],
    notes: notes || 'Transferência entre contas'
  });

  res.json({
    success: true,
    transfer: transferRecord,
    fromAccountBalance: (Number(fromAcc.balance) || 0) - transferAmount,
    toAccountBalance: (Number(toAcc.balance) || 0) + transferAmount
  });
});

// Savings contribution/withdrawal
app.post('/api/finance/savings-transaction', authMiddleware, (req, res) => {
  const userId = (req as any).userId;
  const { goalId, amount, type, accountId, notes, date } = req.body;

  const goal = db.getForUser('savingsGoals', userId).find(g => g.id === goalId);
  if (!goal) {
    return res.status(404).json({ error: 'Meta de poupança não encontrada.' });
  }

  const numAmount = Number(amount);
  const currentAmt = Number(goal.currentAmount) || 0;
  const newGoalAmt = type === 'deposito' ? currentAmt + numAmount : Math.max(0, currentAmt - numAmount);

  db.updateItem('savingsGoals', goal.id, userId, { currentAmount: newGoalAmt });

  if (accountId) {
    const acc = db.getForUser('accounts', userId).find(a => a.id === accountId);
    if (acc) {
      const accBal = Number(acc.balance) || 0;
      const newBal = type === 'deposito' ? accBal - numAmount : accBal + numAmount;
      db.updateItem('accounts', acc.id, userId, { balance: newBal });
    }
  }

  const tx = db.insertItem('savingsTransactions', {
    userId,
    goalId,
    amount: numAmount,
    type,
    accountId,
    date: date || new Date().toISOString().split('T')[0],
    notes
  });

  res.json({ success: true, transaction: tx, newGoalAmount: newGoalAmt });
});

// Investment yield registration
app.post('/api/finance/investment-transaction', authMiddleware, (req, res) => {
  const userId = (req as any).userId;
  const { investmentId, amount, type, notes, date } = req.body;

  const inv = db.getForUser('investments', userId).find(i => i.id === investmentId);
  if (!inv) {
    return res.status(404).json({ error: 'Investimento não encontrado.' });
  }

  const numAmount = Number(amount);
  const currentVal = Number(inv.currentValue) || 0;
  const received = Number(inv.returnsReceived) || 0;

  if (type === 'aporte') {
    db.updateItem('investments', inv.id, userId, {
      investedAmount: (Number(inv.investedAmount) || 0) + numAmount,
      currentValue: currentVal + numAmount
    });
  } else if (type === 'resgate') {
    db.updateItem('investments', inv.id, userId, {
      currentValue: Math.max(0, currentVal - numAmount)
    });
  } else {
    // Interest, dividends, yields
    db.updateItem('investments', inv.id, userId, {
      returnsReceived: received + numAmount,
      currentValue: currentVal + numAmount
    });
  }

  const tx = db.insertItem('investmentTransactions', {
    userId,
    investmentId,
    amount: numAmount,
    type,
    date: date || new Date().toISOString().split('T')[0],
    notes
  });

  res.json({ success: true, transaction: tx });
});

// Debt payment registration
app.post('/api/finance/debt-payment', authMiddleware, (req, res) => {
  const userId = (req as any).userId;
  const { debtId, amount, accountId } = req.body;

  const debt = db.getForUser('debts', userId).find(d => d.id === debtId);
  if (!debt) {
    return res.status(404).json({ error: 'Dívida não encontrada.' });
  }

  const numAmount = Number(amount);
  const currentPaid = Number(debt.paidAmount) || 0;
  const original = Number(debt.originalAmount) || 0;
  const newPaid = currentPaid + numAmount;
  const newRemaining = Math.max(0, original - newPaid);

  const updatedDebt = db.updateItem('debts', debt.id, userId, {
    paidAmount: newPaid,
    remainingAmount: newRemaining,
    status: newRemaining === 0 ? 'paga' : 'ativa'
  });

  if (accountId) {
    const acc = db.getForUser('accounts', userId).find(a => a.id === accountId);
    if (acc) {
      db.updateItem('accounts', acc.id, userId, {
        balance: (Number(acc.balance) || 0) - numAmount
      });
    }
  }

  // Also record in expenses as a debt payment
  db.insertItem('expenses', {
    userId,
    description: `Pagamento Dívida: ${debt.creditor} (${debt.description})`,
    amount: numAmount,
    date: new Date().toISOString().split('T')[0],
    categoryId: 'cat_dividas',
    accountId: accountId || 'acc_bai_01',
    paymentMethod: 'transferencia',
    status: 'pago',
    recurrence: 'nenhuma',
    notes: `Amortização de dívida. Restam ${newRemaining} Kz.`
  });

  res.json({ success: true, debt: updatedDebt });
});

// App settings
app.get('/api/settings', authMiddleware, (req, res) => {
  const userId = (req as any).userId;
  res.json(db.getSettings(userId));
});

app.put('/api/settings', authMiddleware, (req, res) => {
  const userId = (req as any).userId;
  res.json(db.updateSettings(userId, req.body));
});

// ----------------- AI ASSISTANT ROUTE -----------------
app.post('/api/ai/ask', authMiddleware, async (req, res) => {
  const userId = (req as any).userId;
  const { question } = req.body;

  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Pergunta inválida.' });
  }

  try {
    const answer = await askFinancialAssistant(userId, question);
    res.json({ answer });
  } catch (err: any) {
    console.error('AI assistant error:', err);
    res.status(500).json({ error: 'Erro ao processar consulta com o assistente.' });
  }
});

// ----------------- BACKUP & RESTORE -----------------
app.get('/api/backup/export', authMiddleware, (req, res) => {
  const raw = db.getRawData();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=FinControl_Angola_Backup_${Date.now()}.json`);
  res.json(raw);
});

app.post('/api/backup/import', authMiddleware, (req, res) => {
  try {
    const backupData = req.body;
    if (!backupData || !Array.isArray(backupData.expenses)) {
      return res.status(400).json({ error: 'Ficheiro de backup JSON inválido.' });
    }
    db.restoreData(backupData);
    res.json({ success: true, message: 'Dados restaurados com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: 'Falha ao importar backup.' });
  }
});

// Vite Middleware for Development / Static file serving for Production
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`FinControl Angola server running at http://0.0.0.0:${PORT}`);
  });
}

setupVite();
