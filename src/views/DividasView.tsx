import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Debt } from '../types';

export const DividasView: React.FC = () => {
  const { debts, accounts, addDebt, payDebt, deleteDebt, settings } = useFinance();
  const cur = settings.currency || 'Kz';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);

  // New debt form
  const [creditor, setCreditor] = useState('');
  const [description, setDescription] = useState('');
  const [originalAmount, setOriginalAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('0');
  const [dueDate, setDueDate] = useState(`${new Date().getFullYear()}-12-31`);
  const [installmentAmount, setInstallmentAmount] = useState('');
  const [interestRate, setInterestRate] = useState('0');
  const [notes, setNotes] = useState('');

  // Payment form
  const [payAmount, setPayAmount] = useState('');
  const [payAccountId, setPayAccountId] = useState(accounts[0]?.id || '');

  const totalOriginal = debts.reduce((acc, d) => acc + d.originalAmount, 0);
  const totalAmortizado = debts.reduce((acc, d) => acc + d.paidAmount, 0);
  const totalPendente = debts.filter(d => d.status !== 'paga').reduce((acc, d) => acc + d.remainingAmount, 0);

  const handleCreateDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditor || !originalAmount) return;

    const orig = Number(originalAmount);
    const paid = Number(paidAmount) || 0;
    const rem = Math.max(0, orig - paid);

    await addDebt({
      creditor,
      description: description || 'Empréstimo / Crédito',
      originalAmount: orig,
      paidAmount: paid,
      remainingAmount: rem,
      startDate: new Date().toISOString().split('T')[0],
      dueDate,
      installmentAmount: Number(installmentAmount) || Math.round(rem / 12),
      interestRate: Number(interestRate) || 0,
      status: rem === 0 ? 'paga' : 'ativa',
      notes
    });

    setIsModalOpen(false);
    setCreditor('');
    setDescription('');
    setOriginalAmount('');
  };

  const handlePayDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebt || !payAmount || Number(payAmount) <= 0) return;

    await payDebt(selectedDebt.id, Number(payAmount), payAccountId);
    setIsPayModalOpen(false);
    setPayAmount('');
  };

  return (
    <div className="space-y-6">
      {/* 18. MÓDULO DE DÍVIDAS: Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total de Dívidas Contraídas</span>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalOriginal, cur)}
          </p>
          <span className="text-[11px] text-slate-500">Valor original total</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Já Amortizado</span>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totalAmortizado, cur)}
          </p>
          <span className="text-[11px] text-slate-500">Total pago até hoje</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saldo Devedor Pendente</span>
          <p className="text-xl font-black text-red-600 dark:text-red-400 mt-1">
            {formatCurrency(totalPendente, cur)}
          </p>
          <span className="text-[11px] text-slate-500">Passivo financeiro actual</span>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Registo de Dívidas & Empréstimos ({debts.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Mantenha o controlo de datas de vencimento, prestações e planos de liquidação.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registar Nova Dívida</span>
        </button>
      </div>

      {/* Debts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {debts.map(debt => {
          const pct = debt.originalAmount > 0 ? (debt.paidAmount / debt.originalAmount) * 100 : 0;
          const isPaid = debt.remainingAmount <= 0;

          return (
            <div
              key={debt.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">{debt.creditor}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{debt.description}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {isPaid ? 'Paga' : debt.status}
                  </span>
                </div>

                <div className="mt-4 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Valor Original:</span>
                    <strong className="text-slate-700 dark:text-slate-300">{formatCurrency(debt.originalAmount, cur)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Amortizado:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(debt.paidAmount, cur)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Em Falta:</span>
                    <strong className="text-red-600 dark:text-red-400 text-sm font-black">{formatCurrency(debt.remainingAmount, cur)}</strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                    <span className="text-slate-500">Prestação Mensal:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(debt.installmentAmount, cur)}</strong>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2">
                  <span>{pct.toFixed(0)}% pago</span>
                  <span>Vencimento: {formatDate(debt.dueDate)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex space-x-2">
                {!isPaid && (
                  <button
                    onClick={() => {
                      setSelectedDebt(debt);
                      setPayAmount(String(debt.installmentAmount));
                      setIsPayModalOpen(true);
                    }}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Pagar Prestação</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    if (window.confirm(`Eliminar registo da dívida "${debt.creditor}"?`)) {
                      deleteDebt(debt.id);
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Nova Dívida */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Registar Nova Dívida / Crédito</h3>

            <form onSubmit={handleCreateDebt} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Credor *</label>
                <input
                  type="text"
                  placeholder="Ex: Banco BAI, Loja, Particular..."
                  value={creditor}
                  onChange={e => setCreditor(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Crédito Automóvel, Mobília..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Valor Original ({cur}) *</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Ex: 1200000"
                    value={originalAmount}
                    onChange={e => setOriginalAmount(e.target.value)}
                    required
                    className="w-full px-2 py-1.5 text-base font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Valor Já Pago ({cur})</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Ex: 0"
                    value={paidAmount}
                    onChange={e => setPaidAmount(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Prestação Mensal</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Ex: 80000"
                    value={installmentAmount}
                    onChange={e => setInstallmentAmount(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Data de Vencimento</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Observações</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl cursor-pointer shadow-sm"
                >
                  Registar Dívida
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pagar Prestação */}
      {isPayModalOpen && selectedDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Amortizar / Pagar Prestação</h3>
            <p className="text-xs text-red-600 font-bold">{selectedDebt.creditor} ({selectedDebt.description})</p>

            <form onSubmit={handlePayDebt} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Valor do Pagamento ({cur}) *</label>
                <input
                  type="number"
                  step="any"
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-3 py-2 text-xl font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Saldo devedor restante actual: {formatCurrency(selectedDebt.remainingAmount, cur)}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Conta de Pagamento</label>
                <select
                  value={payAccountId}
                  onChange={e => setPayAccountId(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.balance, cur)})</option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl cursor-pointer shadow-sm"
                >
                  Confirmar Pagamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
