import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  ArrowRightLeft,
  Building2,
  Smartphone,
  Coins,
  CheckCircle,
  CreditCard
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Account, AccountType } from '../types';

export const ContasView: React.FC = () => {
  const { accounts, addAccount, deleteAccount, transferMoney, transfers, settings } = useFinance();
  const cur = settings.currency || 'Kz';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // New account form
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('banco');
  const [bankName, setBankName] = useState('Banco BAI');
  const [balance, setBalance] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [color, setColor] = useState('#1E3A8A');

  // Transfer form
  const [fromId, setFromId] = useState(accounts[0]?.id || '');
  const [toId, setToId] = useState(accounts[1]?.id || '');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNotes, setTransferNotes] = useState('');

  const totalSaldoGeral = accounts.reduce((acc, a) => acc + a.balance, 0);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !balance) return;

    const initial = Number(balance);
    await addAccount({
      name,
      type,
      bankName: type === 'banco' ? bankName : undefined,
      accountNumber,
      balance: initial,
      initialBalance: initial,
      color,
      isActive: true
    });

    setIsModalOpen(false);
    setName('');
    setBalance('');
    setAccountNumber('');
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferAmount || Number(transferAmount) <= 0 || fromId === toId) return;

    await transferMoney({
      fromAccountId: fromId,
      toAccountId: toId,
      amount: Number(transferAmount),
      notes: transferNotes || 'Transferência entre contas'
    });

    setIsTransferModalOpen(false);
    setTransferAmount('');
    setTransferNotes('');
  };

  const getAccountIcon = (t: AccountType) => {
    switch (t) {
      case 'banco': return <Building2 className="w-5 h-5 text-blue-500" />;
      case 'multicaixa_express': return <Smartphone className="w-5 h-5 text-red-500" />;
      case 'dinheiro': return <Coins className="w-5 h-5 text-emerald-500" />;
      default: return <Wallet className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Saldo Consolidado em Todas as Contas</span>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalSaldoGeral, cur)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {accounts.length} contas activas cadastradas
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Transferir Dinheiro</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Conta</span>
          </button>
        </div>
      </div>

      {/* Grid of Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {accounts.map(acc => (
          <div
            key={acc.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                    {getAccountIcon(acc.type)}
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">{acc.name}</h4>
                    <span className="text-[11px] text-slate-400 capitalize">
                      {acc.bankName || acc.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: acc.color || '#3B82F6' }}
                />
              </div>

              <div className="mt-5 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-xs text-slate-400">Saldo Disponível</span>
                <p className={`text-2xl font-black mt-0.5 ${acc.balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600'}`}>
                  {formatCurrency(acc.balance, cur)}
                </p>
              </div>

              {acc.accountNumber && (
                <p className="text-[11px] font-mono text-slate-400 mt-2 truncate">
                  IBAN / N.º: {acc.accountNumber}
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  if (window.confirm(`Eliminar conta "${acc.name}"?`)) {
                    deleteAccount(acc.id);
                  }
                }}
                className="text-xs text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Transfers History */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
          Histórico de Transferências Recentes
        </h4>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {transfers.slice(0, 5).map(t => {
            const fromAcc = accounts.find(a => a.id === t.fromAccountId);
            const toAcc = accounts.find(a => a.id === t.toAccountId);

            return (
              <div key={t.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {fromAcc?.name || 'Conta Origem'} → {toAcc?.name || 'Conta Destino'}
                  </p>
                  <span className="text-[10px] text-slate-400">{formatDate(t.date)} • {t.notes || 'Transferência'}</span>
                </div>
                <span className="font-black text-amber-600 dark:text-amber-400">
                  {formatCurrency(t.amount, cur)}
                </span>
              </div>
            );
          })}
          {transfers.length === 0 && (
            <p className="text-xs text-slate-400 py-3 text-center">Nenhuma transferência recente registada.</p>
          )}
        </div>
      </div>

      {/* Modal Nova Conta */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Adicionar Conta Financeira</h3>

            <form onSubmit={handleCreateAccount} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome da Conta *</label>
                <input
                  type="text"
                  placeholder="Ex: Banco BAI Ordem, BFA Poupança, Multicaixa Express..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipo de Conta</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as AccountType)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="banco">Conta Bancária</option>
                    <option value="multicaixa_express">Multicaixa Express</option>
                    <option value="dinheiro">Dinheiro Físico</option>
                    <option value="carteira_digital">Carteira Digital</option>
                    <option value="poupanca">Conta Poupança</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Instituição Bancária</label>
                  <input
                    type="text"
                    placeholder="Ex: BAI, BFA, BIC, Standard Bank..."
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Saldo Inicial ({cur}) *</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Ex: 500000"
                    value={balance}
                    onChange={e => setBalance(e.target.value)}
                    required
                    className="w-full px-2 py-1.5 text-base font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">IBAN / Número de Conta</label>
                  <input
                    type="text"
                    placeholder="AO06..."
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
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
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl cursor-pointer shadow-sm"
                >
                  Guardar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Transferência */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Transferência entre Contas</h3>

            <form onSubmit={handleTransfer} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Conta de Origem</label>
                <select
                  value={fromId}
                  onChange={e => setFromId(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.balance, cur)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Conta de Destino</label>
                <select
                  value={toId}
                  onChange={e => setToId(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.balance, cur)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Valor ({cur}) *</label>
                <input
                  type="number"
                  step="any"
                  placeholder="Ex: 100000"
                  value={transferAmount}
                  onChange={e => setTransferAmount(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-3 py-2 text-xl font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Observações</label>
                <input
                  type="text"
                  placeholder="Ex: Reforço de Poupança"
                  value={transferNotes}
                  onChange={e => setTransferNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={fromId === toId}
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl cursor-pointer shadow-sm disabled:opacity-50"
                >
                  Transferir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
