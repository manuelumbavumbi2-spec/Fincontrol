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
  Award,
  Trash2,
  Edit,
  ArrowRight
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatPercent, formatDate } from '../utils/formatters';
import { Investment, InvestmentType, ActiveView } from '../types';

interface InvestimentosViewProps {
  onOpenQuickAdd?: (tab?: 'investimento') => void;
  onSelectView?: (view: ActiveView) => void;
}

export const InvestimentosView: React.FC<InvestimentosViewProps> = ({ onOpenQuickAdd, onSelectView }) => {
  const {
    investments,
    investmentTransactions,
    addInvestment,
    updateInvestment,
    addInvestmentYield,
    deleteInvestment,
    settings
  } = useFinance();

  const cur = settings.currency || 'Kz';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isYieldModalOpen, setIsYieldModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedInv, setSelectedInv] = useState<Investment | null>(null);

  // New investment form
  const [name, setName] = useState('');
  const [type, setType] = useState<InvestmentType>('obrigacoes');
  const [institution, setInstitution] = useState('');
  const [investedAmount, setInvestedAmount] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [maturityDate, setMaturityDate] = useState('');
  const [returnRate, setReturnRate] = useState('17.5');
  const [notes, setNotes] = useState('');

  // Yield form
  const [yieldAmount, setYieldAmount] = useState('');
  const [yieldType, setYieldType] = useState('juros');
  const [yieldNotes, setYieldNotes] = useState('');

  // Calculations
  const totalInvestido = investments.reduce((acc, i) => acc + (Number(i.investedAmount) || 0), 0);
  const totalActual = investments.reduce((acc, i) => acc + (Number(i.currentValue) || 0), 0);
  const totalLucro = totalActual - totalInvestido;
  const rentabilidadeGeral = totalInvestido > 0 ? (totalLucro / totalInvestido) * 100 : 0;

  const handleOpenCreateModal = () => {
    setSelectedInv(null);
    setName('');
    setType('obrigacoes');
    setInstitution('');
    setInvestedAmount('');
    setCurrentValue('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setMaturityDate('');
    setReturnRate('17.5');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (inv: Investment) => {
    setSelectedInv(inv);
    setName(inv.name);
    setType(inv.type);
    setInstitution(inv.institution || '');
    setInvestedAmount(String(inv.investedAmount));
    setCurrentValue(String(inv.currentValue));
    setStartDate(inv.startDate);
    setMaturityDate(inv.maturityDate || '');
    setReturnRate(String(inv.returnRate));
    setNotes(inv.notes || '');
    setIsEditModalOpen(true);
  };

  const handleCreateInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !investedAmount) return;

    const invested = Number(investedAmount);
    const current = Number(currentValue) || invested;

    await addInvestment({
      name: name.trim(),
      type,
      institution: institution.trim() || 'BODIVA / Banco Comercial',
      investedAmount: invested,
      currentValue: current,
      expectedValue: invested * (1 + (Number(returnRate) || 15) / 100),
      startDate,
      maturityDate: maturityDate || undefined,
      returnRate: Number(returnRate) || 15,
      returnsReceived: 0,
      status: 'ativo',
      notes: notes.trim() || undefined
    });

    setIsModalOpen(false);
  };

  const handleSaveEditInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInv || !name.trim()) return;

    const invested = Number(investedAmount) || selectedInv.investedAmount;
    const current = Number(currentValue) || selectedInv.currentValue;

    await updateInvestment(selectedInv.id, {
      name: name.trim(),
      type,
      institution: institution.trim() || selectedInv.institution,
      investedAmount: invested,
      currentValue: current,
      startDate,
      maturityDate: maturityDate || undefined,
      returnRate: Number(returnRate) || selectedInv.returnRate,
      notes: notes.trim() || undefined
    });

    setIsEditModalOpen(false);
    setSelectedInv(null);
  };

  const handleDeleteInvestment = async (inv: Investment) => {
    if (window.confirm(`Tem a certeza que deseja eliminar o investimento "${inv.name}"? Esta acção removerá o registo do portfólio.`)) {
      await deleteInvestment(inv.id);
    }
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
    setSelectedInv(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP CARDS */}
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
          <p className={`text-xl font-black mt-1 ${totalLucro >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
            {totalLucro >= 0 ? '+' : ''}{formatCurrency(totalLucro, cur)}
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

      {/* 2. ACTION HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            Portfólio de Investimentos ({investments.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Adicione, acompanhe rendimentos e elimine activos financeiros (Obrigações BODIVA, Depósitos a Prazo, etc.).
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Adicionar Novo Investimento</span>
        </button>
      </div>

      {/* 3. INVESTMENTS GRID */}
      {investments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-3xl w-16 h-16 mx-auto flex items-center justify-center">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Nenhum investimento registado</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Comece a construir o seu património adicionando Obrigações do Tesouro, Depósitos a Prazo bancários ou participações em negócios.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Primeiro Investimento</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {investments.map(inv => {
            const lucro = inv.currentValue - inv.investedAmount;
            const rentabilidade = inv.investedAmount > 0 ? (lucro / inv.investedAmount) * 100 : 0;

            return (
              <div
                key={inv.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {inv.type.replace('_', ' ')}
                      </span>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white mt-0.5">{inv.name}</h4>
                      <p className="text-xs text-slate-500">{inv.institution || 'BODIVA / Banco'}</p>
                    </div>
                    <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                      +{formatPercent(inv.returnRate, 1)} a.a.
                    </span>
                  </div>

                  <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Capital Investido:</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-mono">{formatCurrency(inv.investedAmount, cur)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Valor Corrente:</span>
                      <strong className="text-indigo-600 dark:text-indigo-400 font-black font-mono">{formatCurrency(inv.currentValue, cur)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ganhos / Lucro:</span>
                      <strong className={`font-bold font-mono ${lucro >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                        {lucro >= 0 ? '+' : ''}{formatCurrency(lucro, cur)} ({formatPercent(rentabilidade, 1)})
                      </strong>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700 text-[11px]">
                      <span className="text-slate-400">Rendimentos Pagos:</span>
                      <strong className="text-slate-700 dark:text-slate-300 font-mono">{formatCurrency(inv.returnsReceived, cur)}</strong>
                    </div>
                  </div>

                  {inv.maturityDate && (
                    <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Vencimento: {formatDate(inv.maturityDate)}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedInv(inv);
                      setIsYieldModalOpen(true);
                    }}
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>+ Rendimento</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(inv)}
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                    title="Editar investimento"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteInvestment(inv)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                    title="Eliminar este investimento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. MODAL NOVO INVESTIMENTO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Registar Novo Investimento</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvestment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nome do Investimento *</label>
                <input
                  type="text"
                  placeholder="Ex: Obrigações do Tesouro 2028, Depósito a Prazo BAI..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tipo de Activo *</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as InvestmentType)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  >
                    <option value="obrigacoes">Obrigações do Tesouro (OT)</option>
                    <option value="deposito_prazo">Depósito a Prazo</option>
                    <option value="accoes">Acções / BODIVA</option>
                    <option value="fundos">Fundos de Investimento</option>
                    <option value="imobiliario">Imobiliário</option>
                    <option value="negocios">Negócios / Cooperativa</option>
                    <option value="outro">Outro Activo</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Instituição</label>
                  <input
                    type="text"
                    placeholder="Ex: BODIVA, BAI, BFA..."
                    value={institution}
                    onChange={e => setInstitution(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Capital Investido ({cur}) *</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Ex: 500000"
                    value={investedAmount}
                    onChange={e => setInvestedAmount(e.target.value)}
                    required
                    className="w-full px-2.5 py-2 text-base font-black bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Taxa Estimada (% a.a.)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Ex: 17.5"
                    value={returnRate}
                    onChange={e => setReturnRate(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Data de Aplicação</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Data de Vencimento</label>
                  <input
                    type="date"
                    value={maturityDate}
                    onChange={e => setMaturityDate(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Observações</label>
                <textarea
                  rows={2}
                  placeholder="Informações sobre periodicidade de cupão ou custódia..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  Guardar Investimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL EDITAR INVESTIMENTO */}
      {isEditModalOpen && selectedInv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Editar Investimento</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditInvestment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nome do Investimento *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Capital Investido ({cur})</label>
                  <input
                    type="number"
                    step="any"
                    value={investedAmount}
                    onChange={e => setInvestedAmount(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Valor Corrente ({cur})</label>
                  <input
                    type="number"
                    step="any"
                    value={currentValue}
                    onChange={e => setCurrentValue(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-indigo-600 dark:text-indigo-400 font-mono font-black"
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  Actualizar Dados
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL REGISTAR RENDIMENTO / CUPÃO */}
      {isYieldModalOpen && selectedInv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Registar Rendimento / Cupão</h3>
            <p className="text-xs text-indigo-600 font-bold">{selectedInv.name}</p>

            <form onSubmit={handleRegisterYield} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipo de Rendimento</label>
                <select
                  value={yieldType}
                  onChange={e => setYieldType(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
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
                  placeholder="Ex: 85000"
                  value={yieldAmount}
                  onChange={e => setYieldAmount(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-3 py-2 text-xl font-black bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Observações</label>
                <input
                  type="text"
                  placeholder="Ex: Pagamento do 1º cupão semestral 2026"
                  value={yieldNotes}
                  onChange={e => setYieldNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsYieldModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer shadow-xs"
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
