import React, { useState, useRef } from 'react';
import {
  DatabaseBackup,
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  FileCode,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { exportToPDF, exportToExcel, exportToCSV, exportJSONBackup } from '../utils/exports';

export const BackupView: React.FC = () => {
  const { user } = useAuth();
  const {
    expenses,
    incomes,
    budgets,
    savingsGoals,
    investments,
    debts,
    assets,
    categories,
    people,
    accounts,
    refreshData,
    settings
  } = useFinance();

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleExportJSON = async () => {
    try {
      const data = await api.exportBackup();
      exportJSONBackup(data);
      showMsg('Cópia de segurança JSON completa descarregada com sucesso!');
    } catch (err: any) {
      showMsg('Falha ao exportar cópia de segurança: ' + err.message, 'error');
    }
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      await api.importBackup(parsed);
      await refreshData();
      showMsg('Base de dados restaurada com sucesso!');
    } catch (err: any) {
      showMsg('Erro ao restaurar ficheiro de backup JSON: ' + err.message, 'error');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <DatabaseBackup className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Cópia de Segurança & Recuperação de Dados</h3>
            <p className="text-xs text-slate-500">Mantenha os dados financeiros da sua família sempre seguros e exportáveis.</p>
          </div>
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            <CheckCircle className="w-4 h-4" />
            <span>{message.text}</span>
          </div>
        )}
      </div>

      {/* Backup and Restore Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-blue-600" />
            <h4 className="font-bold text-base text-slate-900 dark:text-white">Exportação & Backup Completo</h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Faça download do arquivo integral contendo todas as contas, receitas, despesas categorizadas, orçamentos, metas de poupança e histórico patrimonial.
          </p>

          <div className="space-y-2 pt-2">
            <button
              onClick={handleExportJSON}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <DatabaseBackup className="w-4 h-4" />
              <span>Descarregar Backup Completo (JSON)</span>
            </button>

            <button
              onClick={() => {
                exportToExcel({
                  appName: settings.appName,
                  currency: settings.currency || 'Kz',
                  userName: user?.name || 'Manuel Umbavumbi',
                  periodLabel: 'Histórico Completo',
                  expenses,
                  incomes,
                  budgets,
                  savings: savingsGoals,
                  investments,
                  debts,
                  assets,
                  categories,
                  people,
                  accounts
                });
                showMsg('Caderno Excel exportado com sucesso!');
              }}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Livro Excel (.xlsx)</span>
            </button>

            <button
              onClick={() => {
                exportToCSV(expenses, categories, people, accounts);
                showMsg('Ficheiro CSV exportado com sucesso!');
              }}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileCode className="w-4 h-4" />
              <span>Exportar Ficheiro CSV</span>
            </button>
          </div>
        </div>

        {/* Import & Restore Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <Upload className="w-5 h-5 text-amber-600" />
              <h4 className="font-bold text-base text-slate-900 dark:text-white">Restaurar Cópia de Segurança</h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
              Restaure a sua base de dados financeira a partir de um ficheiro JSON anteriormente guardado. Esta acção sincronizará as suas despesas, contas e metas.
            </p>

            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Atenção: Ao restaurar um backup, a base de dados actual será substituída pelos dados do ficheiro.</span>
            </div>
          </div>

          <div className="pt-4">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
            <button
              disabled={loading}
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{loading ? 'A restaurar dados...' : 'Seleccionar Ficheiro de Backup JSON'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
