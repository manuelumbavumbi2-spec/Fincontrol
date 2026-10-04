import React, { useState } from 'react';
import {
  Landmark,
  Plus,
  Home,
  Car,
  Laptop,
  Briefcase,
  DollarSign,
  TrendingUp,
  Shield,
  Layers
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatPercent, formatDate } from '../utils/formatters';
import { Asset, AssetType } from '../types';

export const PatrimonioView: React.FC = () => {
  const { assets, addAsset, deleteAsset, accounts, savingsGoals, investments, debts, settings } = useFinance();
  const cur = settings.currency || 'Kz';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<AssetType>('imoveis');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Asset totals
  const totalBensFisicos = assets.reduce((acc, a) => acc + a.estimatedValue, 0);
  const totalContas = accounts.reduce((acc, a) => acc + a.balance, 0);
  const totalPoupancas = savingsGoals.reduce((acc, s) => acc + s.currentAmount, 0);
  const totalInvestimentos = investments.reduce((acc, i) => acc + i.currentValue, 0);

  const totalActivos = totalBensFisicos + totalContas + totalPoupancas + totalInvestimentos;
  const totalDividas = debts.filter(d => d.status !== 'paga').reduce((acc, d) => acc + d.remainingAmount, 0);
  const patrimonioLiquido = totalActivos - totalDividas;

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !estimatedValue) return;

    await addAsset({
      name,
      type,
      estimatedValue: Number(estimatedValue),
      purchaseDate,
      notes
    });

    setIsModalOpen(false);
    setName('');
    setEstimatedValue('');
    setNotes('');
  };

  const getAssetIcon = (t: AssetType) => {
    switch (t) {
      case 'imoveis': return <Home className="w-4 h-4 text-blue-500" />;
      case 'viaturas': return <Car className="w-4 h-4 text-emerald-500" />;
      case 'equipamentos': return <Laptop className="w-4 h-4 text-purple-500" />;
      case 'negocios': return <Briefcase className="w-4 h-4 text-amber-500" />;
      default: return <Layers className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 19. PATRIMÓNIO: Net Worth Hero Card */}
      <div className="bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-700/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
              <Shield className="w-4 h-4" /> Balanço Patrimonial Líquido
            </span>
            <p className="text-3xl sm:text-5xl font-black tracking-tight mt-2 text-white">
              {formatCurrency(patrimonioLiquido, cur)}
            </p>
            <p className="text-xs text-slate-300 mt-2 font-medium">
              Fórmula: Activos Totais ({formatCurrency(totalActivos, cur)}) − Passivos / Dívidas ({formatCurrency(totalDividas, cur)})
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="self-start md:self-center px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl text-xs shadow-lg shadow-emerald-500/30 transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Registar Novo Activo</span>
          </button>
        </div>

        {/* Breakdown bar */}
        <div className="mt-8 pt-6 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400">Bens Físicos & Imóveis</span>
            <p className="text-base font-bold text-white mt-0.5">{formatCurrency(totalBensFisicos, cur)}</p>
          </div>
          <div>
            <span className="text-slate-400">Contas Bancárias & Dinheiro</span>
            <p className="text-base font-bold text-white mt-0.5">{formatCurrency(totalContas, cur)}</p>
          </div>
          <div>
            <span className="text-slate-400">Poupanças & Reservas</span>
            <p className="text-base font-bold text-white mt-0.5">{formatCurrency(totalPoupancas, cur)}</p>
          </div>
          <div>
            <span className="text-slate-400">Investimentos & Portfólio</span>
            <p className="text-base font-bold text-white mt-0.5">{formatCurrency(totalInvestimentos, cur)}</p>
          </div>
        </div>
      </div>

      {/* Assets List */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
          Bens Físicos, Imóveis e Equipamentos Cadastrados ({assets.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {assets.map(asset => (
            <div
              key={asset.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                      {getAssetIcon(asset.type)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{asset.name}</h4>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold capitalize">{asset.type}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm(`Eliminar activo "${asset.name}"?`)) {
                        deleteAsset(asset.id);
                      }
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-lg cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <span className="text-xs text-slate-400">Valor Estimado de Mercado</span>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    {formatCurrency(asset.estimatedValue, cur)}
                  </p>
                </div>

                {asset.purchaseDate && (
                  <p className="text-[11px] text-slate-400 mt-2">
                    Adquirido em: {formatDate(asset.purchaseDate)}
                  </p>
                )}
                {asset.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-1">{asset.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Novo Activo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Registar Activo Patrimonial</h3>

            <form onSubmit={handleCreateAsset} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome do Bem / Activo *</label>
                <input
                  type="text"
                  placeholder="Ex: Apartamento no Kilamba, Viatura, Terreno..."
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
                    onChange={e => setType(e.target.value as AssetType)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="imoveis">Imóvel / Habitação</option>
                    <option value="viaturas">Viatura</option>
                    <option value="equipamentos">Equipamentos</option>
                    <option value="negocios">Negócio / Empresa</option>
                    <option value="outros">Outros Bens</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Valor Estimado ({cur}) *</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Ex: 28000000"
                    value={estimatedValue}
                    onChange={e => setEstimatedValue(e.target.value)}
                    required
                    className="w-full px-2 py-1.5 text-base font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Data de Aquisição</label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={e => setPurchaseDate(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
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
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl cursor-pointer shadow-sm"
                >
                  Registar Activo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
