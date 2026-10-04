import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Moon,
  Sun,
  Coins,
  Shield,
  CheckCircle,
  Bell
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export const ConfiguracoesView: React.FC = () => {
  const { settings, updateAppSettings } = useFinance();

  const [appName, setAppName] = useState(settings.appName || 'FinControl Angola');
  const [currency, setCurrency] = useState(settings.currency || 'Kz');
  const [threshold, setThreshold] = useState(String(settings.notificationBudgetThreshold || 80));
  const [language, setLanguage] = useState(settings.language || 'pt-AO');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateAppSettings({
      appName,
      currency,
      notificationBudgetThreshold: Number(threshold),
      language
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Configurações Gerais da Aplicação</h3>
            <p className="text-xs text-slate-500">Personalize o nome, moeda e regras financeiras da sua conta.</p>
          </div>
        </div>

        {savedSuccess && (
          <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Configurações actualizadas com sucesso!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="mt-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nome da Aplicação (Configurável)
            </label>
            <input
              type="text"
              value={appName}
              onChange={e => setAppName(e.target.value)}
              placeholder="FinControl Angola"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Subtítulo: Controle as suas despesas. Organize o seu dinheiro. Construa o seu futuro.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Moeda Principal
              </label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white"
              >
                <option value="Kz">Kz — Kwanza Angolano (Padrão)</option>
                <option value="AOA">AOA — Kwanza Angolano (ISO)</option>
                <option value="USD">USD — Dólar Americano ($)</option>
                <option value="EUR">EUR — Euro (€)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Idioma Principal
              </label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white"
              >
                <option value="pt-AO">Português (Angola) — Padrão</option>
                <option value="pt-PT">Português (Portugal)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Limite de Alerta de Orçamento (%)
            </label>
            <input
              type="number"
              min="50"
              max="100"
              value={threshold}
              onChange={e => setThreshold(e.target.value)}
              className="w-full sm:w-48 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Receberá notificações inteligentes quando os seus gastos ultrapassarem esta percentagem do orçamento.
            </span>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Configurações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
