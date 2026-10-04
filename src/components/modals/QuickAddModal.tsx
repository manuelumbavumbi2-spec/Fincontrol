import React, { useState } from 'react';
import { X, TrendingDown, TrendingUp, PiggyBank, Briefcase, ArrowRightLeft, Check, Plus, Repeat } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { PaymentMethod, RecurrenceType, ExpenseStatus, InvestmentType } from '../../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'despesa' | 'receita' | 'poupanca' | 'investimento' | 'transferencia';
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose, initialTab = 'despesa' }) => {
  const {
    accounts, categories, people, savingsGoals, investments,
    addExpense, addIncome, contributeSavings, addSavingsGoal, addInvestment, addInvestmentYield, transferMoney,
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

  // Savings form
  const [savMode, setSavMode] = useState<'contribuir' | 'criar'>(savingsGoals.length > 0 ? 'contribuir' : 'criar');
  const [savGoalId, setSavGoalId] = useState(savingsGoals[0]?.id || '');
  const [savAmount, setSavAmount] = useState('');
  const [savAccount, setSavAccount] = useState(accounts[0]?.id || 'acc_bai_01');
  const [savType, setSavType] = useState<'deposito' | 'resgate'>('deposito');
  const [newSavName, setNewSavName] = useState('');
  const [newSavTarget, setNewSavTarget] = useState('');
  const [newSavInitial, setNewSavInitial] = useState('');

  // Transfer form
  const [trfFrom, setTrfFrom] = useState(accounts[0]?.id || '');
  const [trfTo, setTrfTo] = useState(accounts[1]?.id || '');
  const [trfAmount, setTrfAmount] = useState('');

  // Investment form
  const [invMode, setInvMode] = useState<'rendimento' | 'criar'>(investments.length > 0 ? 'rendimento' : 'criar');
  const [invId, setInvId] = useState(investments[0]?.id || '');
  const [invAmount, setInvAmount] = useState('');
  const [invType, setInvType] = useState('juros');
  const [newInvName, setNewInvName] = useState('');
  const [newInvType, setNewInvType] = useState<InvestmentType>('obrigacoes');
  const [newInvAmount, setNewInvAmount] = useState('');
  const [newInvInstitution, setNewInvInstitution] = useState('');
  const [newInvReturnRate, setNewInvReturnRate] = useState('17.5');

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
    setLoading(true);
    try {
      if (savMode === 'criar') {
        if (!newSavName.trim() || !newSavTarget) return;
        const target = Number(newSavTarget);
        const initial = Number(newSavInitial) || 0;
        await addSavingsGoal({
          name: newSavName.trim(),
          targetAmount: target,
          initialAmount: initial,
          currentAmount: initial,
          startDate: new Date().toISOString().split('T')[0],
          deadline: `${new Date().getFullYear() + 1}-12-31`,
          monthlyTarget: Math.round(target / 12),
          frequency: 'mensal',
          accountId: savAccount,
          status: 'em_andamento'
        });
        showSuccess('Nova meta de poupança criada com sucesso!');
      } else {
        if (!savAmount || Number(savAmount) <= 0 || !savGoalId) return;
        await contributeSavings({
          goalId: savGoalId,
          amount: Number(savAmount),
          type: savType,
          accountId: savAccount,
        });
        showSuccess('Operação de poupança efectuada com sucesso!');
      }
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
    setLoading(true);
    try {
      if (invMode === 'criar') {
        if (!newInvName.trim() || !newInvAmount) return;
        const invested = Number(newInvAmount);
        await addInvestment({
          name: newInvName.trim(),
          type: newInvType,
          institution: newInvInstitution.trim() || 'BODIVA / Banco Comercial',
          investedAmount: invested,
          currentValue: invested,
          expectedValue: invested * (1 + (Number(newInvReturnRate) || 15) / 100),
          startDate: new Date().toISOString().split('T')[0],
          returnRate: Number(newInvReturnRate) || 15,
          returnsReceived: 0,
          status: 'ativo'
        });
        showSuccess('Novo investimento registado com sucesso!');
      } else {
        if (!invAmount || Number(invAmount) <= 0 || !invId) return;
        await addInvestmentYield({
          investmentId: invId,
          amount: Number(invAmount),
          type: invType,
          notes: 'Registo rápido de rendimento'
        });
        showSuccess('Rendimento de investimento registado!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-black text-slate-900 dark:text-white">Movimento Rápido</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex p-2 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 overflow-x-auto gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('despesa')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
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
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
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
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
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
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
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
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
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
              <p className="text-base font-bold">{successMsg}</p>
            </div>
          ) : (
            <>
              {/* TAB DESPESA */}
              {activeTab === 'despesa' && (
                <form onSubmit={handleExpenseSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Valor ({settings.currency || 'Kz'}) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="Ex: 25000"
                      value={expAmount}
                      onChange={e => setExpAmount(e.target.value)}
                      required
                      autoFocus
                      className="w-full text-2xl font-black px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Descrição *</label>
                    <input
                      type="text"
                      placeholder="Ex: Almoço familiar, Gasolina, Supermercado..."
                      value={expDescription}
                      onChange={e => setExpDescription(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden"
                    />
                  </div>

                  {/* Recurrence Classification */}
                  <div className="p-2.5 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800/60">
                    <label className="block text-xs font-bold text-blue-900 dark:text-blue-300 mb-1 flex items-center gap-1">
                      <Repeat className="w-3.5 h-3.5" />
                      Classificação de Recorrência
                    </label>
                    <select
                      value={expRecurrence}
                      onChange={e => setExpRecurrence(e.target.value as RecurrenceType)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-850 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value="nenhuma">🔹 Despesa Pontual (Única vez)</option>
                      <option value="mensal">🔁 Recorrente Mensal (Renda, Propina, Fibra...)</option>
                      <option value="semanal">🔁 Recorrente Semanal</option>
                      <option value="anual">🔁 Recorrente Anual</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
                      <select
                        value={expCategory}
                        onChange={e => setExpCategory(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                      >
                        {categories.filter(c => c.type === 'expense').map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Conta Bancária</label>
                      <select
                        value={expAccount}
                        onChange={e => setExpAccount(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                      >
                        {accounts.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Data</label>
                      <input
                        type="date"
                        value={expDate}
                        onChange={e => setExpDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Estado</label>
                      <select
                        value={expStatus}
                        onChange={e => setExpStatus(e.target.value as ExpenseStatus)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                      >
                        <option value="pago">✓ Pago</option>
                        <option value="previsto">⏰ Previsto</option>
                        <option value="pendente">⏳ Pendente</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 mt-4 cursor-pointer"
                  >
                    {loading ? 'A registar...' : 'Guardar Despesa'}
                  </button>
                </form>
              )}

              {/* TAB RECEITA */}
              {activeTab === 'receita' && (
                <form onSubmit={handleIncomeSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Valor ({settings.currency || 'Kz'}) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="Ex: 500000"
                      value={incAmount}
                      onChange={e => setIncAmount(e.target.value)}
                      required
                      autoFocus
                      className="w-full text-2xl font-black px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Descrição *</label>
                    <input
                      type="text"
                      placeholder="Ex: Salário Mensal, Subsídio, Consultoria..."
                      value={incDescription}
                      onChange={e => setIncDescription(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
                      <select
                        value={incCategory}
                        onChange={e => setIncCategory(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                      >
                        {categories.filter(c => c.type === 'income').map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Conta Creditada</label>
                      <select
                        value={incAccount}
                        onChange={e => setIncAccount(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                      >
                        {accounts.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Fonte / Entidade</label>
                      <input
                        type="text"
                        placeholder="Ex: Empresa, Cliente..."
                        value={incSource}
                        onChange={e => setIncSource(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Data</label>
                      <input
                        type="date"
                        value={incDate}
                        onChange={e => setIncDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 mt-4 cursor-pointer"
                  >
                    {loading ? 'A registar...' : 'Guardar Receita'}
                  </button>
                </form>
              )}

              {/* TAB POUPANÇA (Adicionar ou Contribuir) */}
              {activeTab === 'poupanca' && (
                <form onSubmit={handleSavingsSubmit} className="space-y-3.5 text-xs">
                  {/* Mode Selector */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setSavMode('contribuir')}
                      className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                        savMode === 'contribuir'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Contribuir / Resgatar
                    </button>
                    <button
                      type="button"
                      onClick={() => setSavMode('criar')}
                      className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                        savMode === 'criar'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      + Nova Meta de Poupança
                    </button>
                  </div>

                  {savMode === 'criar' ? (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nome da Meta *</label>
                        <input
                          type="text"
                          placeholder="Ex: Fundo de Emergência, Compra de Casa..."
                          value={newSavName}
                          onChange={e => setNewSavName(e.target.value)}
                          required
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Valor-Alvo ({settings.currency || 'Kz'}) *</label>
                          <input
                            type="number"
                            step="any"
                            placeholder="Ex: 2000000"
                            value={newSavTarget}
                            onChange={e => setNewSavTarget(e.target.value)}
                            required
                            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Valor Inicial ({settings.currency || 'Kz'})</label>
                          <input
                            type="number"
                            step="any"
                            placeholder="Ex: 50000"
                            value={newSavInitial}
                            onChange={e => setNewSavInitial(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Meta de Poupança *</label>
                        <select
                          value={savGoalId}
                          onChange={e => setSavGoalId(e.target.value)}
                          required
                          className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                        >
                          {savingsGoals.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setSavType('deposito')}
                          className={`py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                            savType === 'deposito'
                              ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                              : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          + Reforçar (Depósito)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSavType('resgate')}
                          className={`py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                            savType === 'resgate'
                              ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                              : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          − Retirar (Resgate)
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Valor ({settings.currency || 'Kz'}) *
                        </label>
                        <input
                          type="number"
                          step="any"
                          placeholder="Ex: 50000"
                          value={savAmount}
                          onChange={e => setSavAmount(e.target.value)}
                          required
                          className="w-full text-xl font-black px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Conta Bancária Associada</label>
                    <select
                      value={savAccount}
                      onChange={e => setSavAccount(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    >
                      {accounts.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 mt-4 cursor-pointer"
                  >
                    {loading ? 'A registar...' : savMode === 'criar' ? 'Criar Meta de Poupança' : 'Confirmar Operação'}
                  </button>
                </form>
              )}

              {/* TAB TRANSFERÊNCIA */}
              {activeTab === 'transferencia' && (
                <form onSubmit={handleTransferSubmit} className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Conta de Origem *</label>
                      <select
                        value={trfFrom}
                        onChange={e => setTrfFrom(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                      >
                        {accounts.map(a => (
                          <option key={a.id} value={a.id}>{a.name} ({a.balance.toLocaleString()} Kz)</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Conta de Destino *</label>
                      <select
                        value={trfTo}
                        onChange={e => setTrfTo(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                      >
                        {accounts.map(a => (
                          <option key={a.id} value={a.id}>{a.name} ({a.balance.toLocaleString()} Kz)</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Valor a Transferir ({settings.currency || 'Kz'}) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="Ex: 100000"
                      value={trfAmount}
                      onChange={e => setTrfAmount(e.target.value)}
                      required
                      className="w-full text-xl font-black px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                    />
                    <p className="text-xs text-slate-400 mt-1">Transferências entre contas não impactam a contabilidade de despesas.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || trfFrom === trfTo}
                    className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 mt-4 cursor-pointer"
                  >
                    {loading ? 'A transferir...' : 'Realizar Transferência'}
                  </button>
                </form>
              )}

              {/* TAB INVESTIMENTO (Adicionar ou Registar Rendimento) */}
              {activeTab === 'investimento' && (
                <form onSubmit={handleInvestmentSubmit} className="space-y-3.5 text-xs">
                  {/* Mode Selector */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setInvMode('rendimento')}
                      className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                        invMode === 'rendimento'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Registar Rendimento
                    </button>
                    <button
                      type="button"
                      onClick={() => setInvMode('criar')}
                      className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                        invMode === 'criar'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      + Novo Investimento
                    </button>
                  </div>

                  {invMode === 'criar' ? (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nome do Investimento *</label>
                        <input
                          type="text"
                          placeholder="Ex: Obrigações do Tesouro BODIVA, DP BAI Rendimento..."
                          value={newInvName}
                          onChange={e => setNewInvName(e.target.value)}
                          required
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tipo de Activo</label>
                          <select
                            value={newInvType}
                            onChange={e => setNewInvType(e.target.value as InvestmentType)}
                            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                          >
                            <option value="obrigacoes">Obrigações do Tesouro (OT)</option>
                            <option value="deposito_prazo">Depósito a Prazo</option>
                            <option value="accoes">Acções BODIVA</option>
                            <option value="fundos">Fundos</option>
                            <option value="imobiliario">Imobiliário</option>
                            <option value="negocios">Negócios</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Instituição</label>
                          <input
                            type="text"
                            placeholder="Ex: BODIVA, BAI, BFA..."
                            value={newInvInstitution}
                            onChange={e => setNewInvInstitution(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Capital Investido ({settings.currency || 'Kz'}) *</label>
                          <input
                            type="number"
                            step="any"
                            placeholder="Ex: 500000"
                            value={newInvAmount}
                            onChange={e => setNewInvAmount(e.target.value)}
                            required
                            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Taxa Estimada (% a.a.)</label>
                          <input
                            type="number"
                            step="any"
                            placeholder="Ex: 17.5"
                            value={newInvReturnRate}
                            onChange={e => setNewInvReturnRate(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Investimento Activo *</label>
                        <select
                          value={invId}
                          onChange={e => setInvId(e.target.value)}
                          required
                          className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                        >
                          {investments.map(i => (
                            <option key={i.id} value={i.id}>{i.name} ({i.institution})</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tipo de Rendimento</label>
                          <select
                            value={invType}
                            onChange={e => setInvType(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                          >
                            <option value="juros">Juros / Cupão</option>
                            <option value="dividendos">Dividendos</option>
                            <option value="rendimentos">Rendimentos</option>
                            <option value="mais_valias">Mais-Valias</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Valor ({settings.currency || 'Kz'}) *</label>
                          <input
                            type="number"
                            step="any"
                            placeholder="Ex: 85000"
                            value={invAmount}
                            onChange={e => setInvAmount(e.target.value)}
                            required
                            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 mt-4 cursor-pointer"
                  >
                    {loading ? 'A registar...' : invMode === 'criar' ? 'Registar Investimento' : 'Guardar Rendimento'}
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
