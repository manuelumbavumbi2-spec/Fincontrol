import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  FileText,
  FileCode,
  Calendar,
  Filter,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  PieChart
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatPercent, formatDate } from '../utils/formatters';
import { exportToPDF, exportToExcel, exportToCSV } from '../utils/exports';

export const RelatoriosView: React.FC = () => {
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
    summary,
    settings
  } = useFinance();

  const cur = settings.currency || 'Kz';
  const [reportPeriod, setReportPeriod] = useState<'mensal' | 'trimestral' | 'anual' | 'geral'>('mensal');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const triggerFeedback = (format: string) => {
    setDownloadSuccess(`Relatório ${format} gerado e descarregado com sucesso!`);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  const handleExportPDF = () => {
    exportToPDF({
      appName: settings.appName,
      currency: cur,
      userName: user?.name || 'Manuel Umbavumbi',
      periodLabel: reportPeriod === 'mensal' ? 'Mês Corrente' : reportPeriod === 'anual' ? 'Ano Completo' : 'Visão Geral',
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
    triggerFeedback('PDF');
  };

  const handleExportExcel = () => {
    exportToExcel({
      appName: settings.appName,
      currency: cur,
      userName: user?.name || 'Manuel Umbavumbi',
      periodLabel: reportPeriod === 'mensal' ? 'Mês Corrente' : reportPeriod === 'anual' ? 'Ano Completo' : 'Visão Geral',
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
    triggerFeedback('Excel (.xlsx)');
  };

  const handleExportCSV = () => {
    exportToCSV(expenses, categories, people, accounts);
    triggerFeedback('CSV');
  };

  return (
    <div className="space-y-6">
      {/* Export Options Banner */}
      <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Centro de Relatórios & Exportações
            </span>
            <h3 className="text-2xl sm:text-3xl font-black mt-1 text-white">
              Relatório Financeiro Executivo
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl">
              Exporte todos os seus dados contábeis, receitas, despesas categorizadas, balanço patrimonial e histórico familiar em formatos prontos para impressão ou análise avançada.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={handleExportPDF}
              className="flex items-center space-x-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Descarregar PDF</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Descarregar Excel (.xlsx)</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
            >
              <FileCode className="w-4 h-4" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{downloadSuccess}</span>
          </div>
        )}
      </div>

      {/* Summary Tables for Review */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Balanço Executivo */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h4 className="font-bold text-base text-slate-900 dark:text-white mb-4">
            Quadro Resumo Contábil
          </h4>
          <div className="space-y-3 text-xs divide-y divide-slate-100 dark:divide-slate-800">
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500">Receitas Totais</span>
              <strong className="text-sm font-bold text-emerald-600">{formatCurrency(summary.receitas, cur)}</strong>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500">Despesas Totais</span>
              <strong className="text-sm font-bold text-rose-600">{formatCurrency(summary.despesas, cur)}</strong>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500">Saldo Líquido</span>
              <strong className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(summary.saldo, cur)}</strong>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500">Total em Poupança Acumulada</span>
              <strong className="text-sm font-bold text-blue-600">{formatCurrency(summary.poupanca, cur)}</strong>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500">Portfólio de Investimentos</span>
              <strong className="text-sm font-bold text-indigo-600">{formatCurrency(summary.investimentos, cur)}</strong>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500">Obrigações & Dívidas Restantes</span>
              <strong className="text-sm font-bold text-red-600">{formatCurrency(summary.dividasPendentes, cur)}</strong>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500 font-bold">Património Líquido Total</span>
              <strong className="text-base font-black text-teal-600">{formatCurrency(summary.patrimonioLiquido, cur)}</strong>
            </div>
          </div>
        </div>

        {/* Indicadores & Métricas Chave */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h4 className="font-bold text-base text-slate-900 dark:text-white mb-4">
            Indicadores de Desempenho Familiar
          </h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-500">Taxa de Poupança sobre Receita</span>
                <span className="text-blue-600 font-bold">{formatPercent(summary.taxaPoupanca)}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(100, summary.taxaPoupanca)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-500">Taxa de Investimento sobre Receita</span>
                <span className="text-indigo-600 font-bold">{formatPercent(summary.taxaInvestimento)}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${Math.min(100, summary.taxaInvestimento)}%` }} />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Maior Despesa Registada:</span>
                <strong className="text-slate-900 dark:text-white">
                  {summary.maiorDespesa?.description} ({formatCurrency(summary.maiorDespesa?.amount || 0, cur)})
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Maior Categoria de Custo:</span>
                <strong className="text-slate-900 dark:text-white">
                  {summary.maiorCategoria?.name} ({formatCurrency(summary.maiorCategoria?.amount || 0, cur)})
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
