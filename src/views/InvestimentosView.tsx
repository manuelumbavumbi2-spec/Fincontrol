import React, { useState } from 'react';
import {
  Briefcase,
  TrendingUp,
  Plus,
  Building,
  Calendar,
  Percent,
  Coins,
  ArrowUpRight,
  ShieldCheck,
  Award
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatPercent, formatDate } from '../utils/formatters';
import { Investment, InvestmentType } from '../types';

export const InvestimentosView: React.FC = () => {
  const {
    investments,
    investmentTransactions,
    addInvestment,
    addInvestmentYield,
    deleteInvestment,
    settings
  } = useFinance();

  const cur = settings.currency || 'Kz';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isYieldModalOpen, setIsYieldModalOpen] = useState(false);
  const [selectedInv, setSelectedInv] = useState<Investment | null>(null);

  // New investment form
  const [name, setName] = useState('');
  const [type, setType] = useState<InvestmentType>('obrigacoes');
  const [institution, setInstitution] = useState('');
  const [investedAmount, setInvestedAmount] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [maturityDate, setMaturityDate] = useState('');
  const [returnRate, setReturnRate] = useState('17.5');
  const [notes, setNotes] = useState('');

  // Yield form
  const [yieldAmount, setYieldAmount] = useState('');
  const [yieldType, setYieldType] = useState('juros');
  const [yieldNotes, setYieldNotes] = useState('');

  // Calculations
  const totalInvestido = investments.reduce((acc, i) => acc + i.investedAmount, 0);
  const totalActual = investments.reduce((acc, i) => acc + i.currentValue, 0);
  const totalLucro = totalActual - totalInvestido;
  const rentabilidadeGeral = totalInvestido > 0 ? (totalLucro / totalInvestido) * 100 : 0;
  const totalRendimentosRecebidos = investments.reduce((acc, i) => acc + i.returnsReceived, 0);

  const handleCreateInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !investedAmount) return;

    const invested = Number(investedAmount);
    await addInvestment({
      name,
      type,
      institution: institution || 'BODIVA / Banco Comercial',
      investedAmount: invested,
      currentValue: invested,
      expectedValue: invested * (1 + (Number(returnRate) || 15) / 100),
      startDate,
      maturityDate: maturityDate || undefined,
      returnRate: Number(returnRate) || 15,
      returnsReceived: 0,
      status: 'ativo',
      notes
    });

    setIsModalOpen(false);
    setName('');
    setInvestedAmount('');
    setNotes('');
  };

  const handleRegisterYield = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInv || !yieldAmount || Number(yieldAmount) <= 0) return;

    await addInvestmentYield({
      investmentId: selectedInv.id,
      amount: Number(yieldAmount),
      type: yieldType,
      notes: yieldNotes || 'Rendimento de juros/cupão recebido'
    });

    setIsYieldModalOpen(false);
    setYieldAmount('');
    setYieldNotes('');
  };

  return (
    <div className="space-y-6">
      {/* 16. RENTABILIDADE DOS INVESTIMENTOS: Top 4 Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Capital Investido</span>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalInvestido, cur)}
          </p>
          <span className="text-[11px] text-slate-500">Valor originalmente aplicado</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Valor Actual da Carteira</span>
          <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {formatCurrency(totalActual, cur)}
          </p>
          <span className="text-[11px] text-slate-500">Avaliação corrente dos activos</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lucro / Ganhos</span>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            +{formatCurrency(totalLucro, cur)}
          </p>
          <span className="text-[11px] text-slate-500">Valor actual − Capital investido</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rentabilidade Média</span>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatPercent(rentabilidadeGeral, 2)}
          </p>
          <span className="text-[11px] text-slate-500">Retorno ponderado anual</span>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Portfólio de Investimentos ({investments.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Acompanhe depósitos a prazo, Obrigações do Tesouro na BODIVA e negócios locais.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registar Novo Investimento</span>
        </button>
      </div>

      {/* Investments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {investments.map(inv => {
          const lucro = inv.currentValue - inv.investedAmount;
          const rentabilidade = inv.investedAmount > 0 ? (lucro / inv.investedAmount) * 100 : 0;

          return (
            <div
              key={inv.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {inv.type.replace('_', ' ')}
                    </span>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white mt-0.5">
                      {inv.name}
                    </h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Building className="w-3.5 h-3.5" />
                      {inv.institution}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 shrink-0">
                    +{inv.returnRate}% a.a.
                  </span>
                </div>

                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Capital Investido:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(inv.investedAmount, cur)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Valor Actual:</span>
                    <strong className="text-indigo-600 dark:text-indigo-400 text-sm font-bold">{formatCurrency(inv.currentValue, cur)}</strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400">Lucro Obtido:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                      +{formatCurrency(lucro, cur)} ({rentabilidade.toFixed(1)}%)
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rendimentos Pagos:</span>
                    <strong className="text-slate-700 dark:text-slate-300">{formatCurrency(inv.returnsReceived, cur)}</strong>
                  </div>
                </div>

                {inv.maturityDate && (
                  <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Vencimento: {formatDate(inv.maturityDate)}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedInv(inv);
                    setIsYieldModalOpen(true);
                  }}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Registar Rendimento</span>
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Eliminar registo de "${inv.name}"?`)) {
                      deleteInvestment(inv.id);
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

      {/* Modal Novo Investimento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Novo Investimento</h3>

            <form onSubmit={handleCreateInvestment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome do Investimento *</label>
                <input
                  type="text"
                  placeholder="Ex: Obrigações do Tesouro, Depósito BAI Rendimento..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipo de Activo *</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as InvestmentType)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="obrigacoes">Obrigações do Tesouro (OT)</option>
                    <option value="deposito_prazo">Depósito a Prazo</option>
                    <option value="accoes">Acções / BODIVA</option>
                    <option value="fundos">Fundos de Investimento</option>
                    <option value="imobiliario">Imobiliário</option>
                    <option value="negocios">Negócios / Cooperativa</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Instituição</label>
                  <input
                    type="text"
                    placeholder="Ex: BODIVA, BAI, BFA..."
                    value={institution}
                    onChange={e => setInstitution(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Capital Investido ({cur}) *</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Ex: 1000000"
                    value={investedAmount}
                    onChange={e => setInvestedAmount(e.target.value)}
                    required
                    className="w-full px-2 py-1.5 text-base font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Taxa de Rendimento (% a.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 17.5"
                    value={returnRate}
                    onChange={e => setReturnRate(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Data de Início</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Data de Vencimento</label>
                  <input
                    type="date"
                    value={maturityDate}
                    onChange={e => setMaturityDate(e.target.value)}
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
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl cursor-pointer shadow-sm"
                >
                  Registar Investimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registar Rendimento/Cupão */}
      {isYieldModalOpen && selectedInv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Registar Rendimento / Cupão</h3>
            <p className="text-xs text-indigo-600 font-bold">{selectedInv.name}</p>

            <form onSubmit={handleRegisterYield} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipo de Rendimento</label>
                <select
                  value={yieldType}
                  onChange={e => setYieldType(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="juros">Juros / Cupão Semestral</option>
                  <option value="dividendos">Dividendos</option>
                  <option value="rendimentos">Rendimento Operacional</option>
                  <option value="mais_valias">Mais-Valias</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Valor Recebido ({cur}) *</label>
                <input
                  type="number"
                  step="any"
                  placeholder="Ex: 112500"
                  value={yieldAmount}
                  onChange={e => setYieldAmount(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-3 py-2 text-xl font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Observações</label>
                <input
                  type="text"
                  placeholder="Ex: Pagamento de cupão semestral"
                  value={yieldNotes}
                  onChange={e => setYieldNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsYieldModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl cursor-pointer shadow-sm"
                >
                  Guardar Rendimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
