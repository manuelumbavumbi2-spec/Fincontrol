import React, { useState } from 'react';
import { X, TrendingDown, TrendingUp, PiggyBank, Briefcase, ArrowRightLeft, Check } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { PaymentMethod, RecurrenceType, ExpenseStatus } from '../../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'despesa' | 'receita' | 'poupanca' | 'investimento' | 'transferencia';
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose, initialTab = 'despesa' }) => {
  const {
    accounts, categories, people, savingsGoals, investments,
    addExpense, addIncome, contributeSavings, addInvestmentYield, transferMoney,
    settings
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'despesa' | 'receita' | 'poupanca' | 'investimento' | 'transferencia'>(initialTab);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Expense form
  const [expAmount, setExpAmount] = useState('');
  const [expDescription, setExpDescription] = useState('');
  const [expCategory, setExpCategory] = useState(categories.find(c => c.type === 'expense')?.id || 'cat_alim');
  const [expAccount, setExpAccount] = useState(accounts[0]?.id || 'acc_bai_01');
  const [expPerson, setExpPerson] = useState(people[0]?.id || 'per_casa');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expPaymentMethod, setExpPaymentMethod] = useState<PaymentMethod>('multicaixa');
  const [expStatus, setExpStatus] = useState<ExpenseStatus>('pago');
  const [expRecurrence, setExpRecurrence] = useState<RecurrenceType>('nenhuma');
  const [expLocation, setExpLocation] = useState('');
  const [expNotes, setExpNotes] = useState('');

  // Income form
  const [incAmount, setIncAmount] = useState('');
  const [incDescription, setIncDescription] = useState('');
  const [incCategory, setIncCategory] = useState(categories.find(c => c.type === 'income')?.id || 'cat_salario');
  const [incAccount, setIncAccount] = useState(accounts[0]?.id || 'acc_bai_01');
  const [incPerson, setIncPerson] = useState(people[0]?.id || 'per_manuel');
  const [incSource, setIncSource] = useState('');
  const [incDate, setIncDate] = useState(new Date().toISOString().split('T')[0]);

  // Savings contribution form
  const [savGoalId, setSavGoalId] = useState(savingsGoals[0]?.id || '');
  const [savAmount, setSavAmount] = useState('');
  const [savAccount, setSavAccount] = useState(accounts[0]?.id || 'acc_bai_01');
  const [savType, setSavType] = useState<'deposito' | 'resgate'>('deposito');

  // Transfer form
  const [trfFrom, setTrfFrom] = useState(accounts[0]?.id || '');
  const [trfTo, setTrfTo] = useState(accounts[1]?.id || '');
  const [trfAmount, setTrfAmount] = useState('');

  // Investment yield form
  const [invId, setInvId] = useState(investments[0]?.id || '');
  const [invAmount, setInvAmount] = useState('');
  const [invType, setInvType] = useState('juros');

  if (!isOpen) return null;

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1200);
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expAmount || Number(expAmount) <= 0 || !expDescription) return;
    setLoading(true);
    try {
      await addExpense({
        amount: Number(expAmount),
        description: expDescription,
        categoryId: expCategory,
        accountId: expAccount,
        personId: expPerson,
        date: expDate,
        paymentMethod: expPaymentMethod,
        status: expStatus,
        recurrence: expRecurrence,
        location: expLocation,
        notes: expNotes,
      });
      showSuccess('Despesa registada com sucesso!');
    } finally {
      setLoading(false);
    }
  };

  const handleIncomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incAmount || Number(incAmount) <= 0 || !incDescription) return;
    setLoading(true);
    try {
      await addIncome({
        amount: Number(incAmount),
        description: incDescription,
        categoryId: incCategory,
        accountId: incAccount,
        personId: incPerson,
        source: incSource || 'Rendimento',
        date: incDate,
        recurrence: 'nenhuma'
      });
      showSuccess('Receita registada com sucesso!');
    } finally {
      setLoading(false);
    }
  };

  const handleSavingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!savAmount || Number(savAmount) <= 0 || !savGoalId) return;
    setLoading(true);
    try {
      await contributeSavings({
        goalId: savGoalId,
        amount: Number(savAmount),
        type: savType,
        accountId: savAccount,
      });
      showSuccess('Operação de poupança efectuada com sucesso!');
    } finally {
      setLoading(false);
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trfAmount || Number(trfAmount) <= 0 || trfFrom === trfTo) return;
    setLoading(true);
    try {
      await transferMoney({
        fromAccountId: trfFrom,
        toAccountId: trfTo,
        amount: Number(trfAmount),
        date: new Date().toISOString().split('T')[0]
      });
      showSuccess('Transferência realizada com sucesso!');
    } finally {
      setLoading(false);
    }
  };

  const handleInvestmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invAmount || Number(invAmount) <= 0 || !invId) return;
    setLoading(true);
    try {
      await addInvestmentYield({
        investmentId: invId,
        amount: Number(invAmount),
        type: invType,
        notes: 'Registo rápido de rendimento'
      });
      showSuccess('Rendimento de investimento registado!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-slate-900 dark:text-white">Novo Movimento Rápido</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex p-2 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 overflow-x-auto gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('despesa')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'despesa'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Despesa</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('receita')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'receita'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Receita</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('poupanca')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'poupanca'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <PiggyBank className="w-3.5 h-3.5" />
            <span>Poupança</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('transferencia')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'transferencia'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Transferência</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('investimento')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'investimento'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Investimento</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {successMsg ? (
            <div className="flex flex-col items-center justify-center py-8 text-emerald-600 dark:text-emerald-400">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center mb-3">
                <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-base font-semibold">{successMsg}</p>
            </div>
          ) : (
            <>
              {/* TAB DESPESA */}
              {activeTab === 'despesa' && (
                <form onSubmit={handleExpenseSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Valor da Despesa ({settings.currency || 'Kz'}) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        placeholder="Ex: 55000"
                        value={expAmount}
                        onChange={e => setExpAmount(e.target.value)}
                        required
                        autoFocus
                        className="w-full text-2xl font-bold px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Descrição *</label>
                    <input
                      type="text"
                      placeholder="Ex: Creche, Alimentação Casa, Matabicho..."
                      value={expDescription}
                      onChange={e => setExpDescription(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Categoria *</label>
                      <select
                        value={expCategory}
                        onChange={e => setExpCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                      >
                        {categories.filter(c => c.type === 'expense').map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Pessoa / Família *</label>
                      <select
                        value={expPerson}
                        onChange={e => setExpPerson(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                      >
                        {people.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.relationship})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Conta / Origem *</label>
                      <select
                        value={expAccount}
                        onChange={e => setExpAccount(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                      >
                        {accounts.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Forma de Pagamento</label>
                      <select
                        value={expPaymentMethod}
                        onChange={e => setExpPaymentMethod(e.target.value as PaymentMethod)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="multicaixa">Multicaixa / Express</option>
                        <option value="dinheiro">Dinheiro Físico</option>
                        <option value="transferencia">Transferência Bancária</option>
                        <option value="cartao">Cartão de Débito/Crédito</option>
                        <option value="debito_directo">Débito Directo</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Data</label>
                      <input
                        type="date"
                        value={expDate}
                        onChange={e => setExpDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Estado</label>
                      <select
                        value={expStatus}
                        onChange={e => setExpStatus(e.target.value as ExpenseStatus)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                      >
                        <option value="pago">Pago</option>
                        <option value="pendente">Pendente</option>
                        <option value="previsto">Previsto</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-md transition-colors disabled:opacity-50 mt-4 cursor-pointer"
                  >
                    {loading ? 'A registar...' : 'Guardar Despesa'}
                  </button>
                </form>
              )}

              {/* TAB RECEITA */}
              {activeTab === 'receita' && (
                <form onSubmit={handleIncomeSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Valor da Receita ({settings.currency || 'Kz'}) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="Ex: 650000"
                      value={incAmount}
                      onChange={e => setIncAmount(e.target.value)}
                      required
                      autoFocus
                      className="w-full text-2xl font-bold px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Descrição *</label>
                    <input
                      type="text"
                      placeholder="Ex: Salário Mensal, Consultoria, Vendas..."
                      value={incDescription}
                      onChange={e => setIncDescription(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Categoria *</label>
                      <select
                        value={incCategory}
                        onChange={e => setIncCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                      >
                        {categories.filter(c => c.type === 'income').map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Conta de Destino *</label>
                      <select
                        value={incAccount}
                        onChange={e => setIncAccount(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                      >
                        {accounts.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Fonte / Entidade Pagadora</label>
                      <input
                        type="text"
                        placeholder="Ex: Empresa, Cliente..."
                        value={incSource}
                        onChange={e => setIncSource(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Data</label>
                      <input
                        type="date"
                        value={incDate}
                        onChange={e => setIncDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md transition-colors disabled:opacity-50 mt-4 cursor-pointer"
                  >
                    {loading ? 'A registar...' : 'Guardar Receita'}
                  </button>
                </form>
              )}

              {/* TAB POUPANÇA */}
              {activeTab === 'poupanca' && (
                <form onSubmit={handleSavingsSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Meta de Poupança *</label>
                    <select
                      value={savGoalId}
                      onChange={e => setSavGoalId(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                    >
                      {savingsGoals.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSavType('deposito')}
                      className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                        savType === 'deposito'
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      + Reforçar (Depósito)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSavType('resgate')}
                      className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                        savType === 'resgate'
                          ? 'bg-amber-600 border-amber-600 text-white'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      - Retirar (Resgate)
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Valor ({settings.currency || 'Kz'}) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="Ex: 50000"
                      value={savAmount}
                      onChange={e => setSavAmount(e.target.value)}
                      required
                      className="w-full text-2xl font-bold px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Conta Bancária Associada</label>
                    <select
                      value={savAccount}
                      onChange={e => setSavAccount(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                    >
                      {accounts.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-colors disabled:opacity-50 mt-4 cursor-pointer"
                  >
                    {loading ? 'A registar...' : 'Confirmar Operação'}
                  </button>
                </form>
              )}

              {/* TAB TRANSFERÊNCIA */}
              {activeTab === 'transferencia' && (
                <form onSubmit={handleTransferSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Conta de Origem *</label>
                      <select
                        value={trfFrom}
                        onChange={e => setTrfFrom(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                      >
                        {accounts.map(a => (
                          <option key={a.id} value={a.id}>{a.name} ({a.balance.toLocaleString()} Kz)</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Conta de Destino *</label>
                      <select
                        value={trfTo}
                        onChange={e => setTrfTo(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                      >
                        {accounts.map(a => (
                          <option key={a.id} value={a.id}>{a.name} ({a.balance.toLocaleString()} Kz)</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Valor a Transferir ({settings.currency || 'Kz'}) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="Ex: 100000"
                      value={trfAmount}
                      onChange={e => setTrfAmount(e.target.value)}
                      required
                      className="w-full text-2xl font-bold px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    />
                    <p className="text-xs text-slate-500 mt-1">Transferências entre contas não são contabilizadas como despesa.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || trfFrom === trfTo}
                    className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-md transition-colors disabled:opacity-50 mt-4 cursor-pointer"
                  >
                    {loading ? 'A transferir...' : 'Realizar Transferência'}
                  </button>
                </form>
              )}

              {/* TAB INVESTIMENTO */}
              {activeTab === 'investimento' && (
                <form onSubmit={handleInvestmentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Investimento Activo *</label>
                    <select
                      value={invId}
                      onChange={e => setInvId(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                    >
                      {investments.map(i => (
                        <option key={i.id} value={i.id}>{i.name} ({i.institution})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Tipo de Movimento</label>
                      <select
                        value={invType}
                        onChange={e => setInvType(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                      >
                        <option value="juros">Juros / Cupão</option>
                        <option value="dividendos">Dividendos</option>
                        <option value="rendimentos">Rendimentos</option>
                        <option value="mais_valias">Mais-Valias</option>
                        <option value="aporte">Novo Aporte de Capital</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Valor ({settings.currency || 'Kz'}) *</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="Ex: 112500"
                        value={invAmount}
                        onChange={e => setInvAmount(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition-colors disabled:opacity-50 mt-4 cursor-pointer"
                  >
                    {loading ? 'A registar...' : 'Guardar Rendimento'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
