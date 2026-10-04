import React from 'react';
import {
  HeartPulse,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Award
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatPercent } from '../utils/formatters';

export const SaudeFinanceiraView: React.FC = () => {
  const { healthScore, summary, settings } = useFinance();
  const cur = settings.currency || 'Kz';

  const metricsList = [
    { label: 'Cumprimento do Orçamento Mensal', score: healthScore.metrics.orcamento, max: 15, tip: 'Manter os gastos abaixo de 90% do tecto orçamentado' },
    { label: 'Taxa de Poupança Familiar', score: healthScore.metrics.taxaPoupanca, max: 20, tip: 'Ideal guardar 15% a 20% das receitas mensais' },
    { label: 'Diversificação de Investimentos', score: healthScore.metrics.investimentos, max: 15, tip: 'Ter capital aplicado em BODIVA, OT ou Depósitos a Prazo' },
    { label: 'Gestão de Dívidas & Passivos', score: healthScore.metrics.gestaoDividas, max: 15, tip: 'Manter dívidas sob controlo e sem prestações em mora' },
    { label: 'Controlo Geral de Despesas', score: healthScore.metrics.controleDespesas, max: 15, tip: 'Registar fielmente todos os movimentos diários' },
    { label: 'Crescimento Patrimonial', score: healthScore.metrics.patrimonio, max: 10, tip: 'Acumular bens e património líquido superior aos passivos' },
    { label: 'Cumprimento de Metas de Vida', score: healthScore.metrics.metas, max: 10, tip: 'Estar no rumo certo para atingir os objectivos de prazo' },
  ];

  const getScoreColor = (sc: number) => {
    if (sc >= 85) return 'from-emerald-500 to-teal-600 text-emerald-600';
    if (sc >= 70) return 'from-blue-500 to-indigo-600 text-blue-600';
    if (sc >= 50) return 'from-amber-500 to-orange-600 text-amber-600';
    return 'from-rose-500 to-red-600 text-rose-600';
  };

  return (
    <div className="space-y-6">
      {/* Hero Score Badge */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
          {/* Radial score circle */}
          <div className="relative w-32 h-32 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-blue-600 p-1.5 shadow-lg shadow-emerald-500/20 shrink-0">
            <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-slate-900 dark:text-white leading-none">
                {healthScore.score}
              </span>
              <span className="text-xs text-slate-400 font-bold uppercase mt-1">/ 100</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Diagnóstico de Inteligência Financeira</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              Saúde Financeira: <span className="text-emerald-600 dark:text-emerald-400">{healthScore.score}/100 — {healthScore.rating}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl">
              A sua pontuação mede a capacidade de geração de poupança, equilíbrio das despesas, peso das dívidas e expansão do património da sua família em Angola.
            </p>
          </div>
        </div>
      </div>

      {/* 7 Dimensions Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h4 className="font-bold text-base text-slate-900 dark:text-white">
          Desagregação das 7 Dimensões Financeiras
        </h4>

        <div className="space-y-4">
          {metricsList.map((m, idx) => {
            const pct = (m.score / m.max) * 100;
            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-baseline text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{m.label}</span>
                    <span className="text-slate-400 hidden sm:inline ml-2">• {m.tip}</span>
                  </div>
                  <strong className="text-slate-800 dark:text-slate-200">{m.score} / {m.max} pts</strong>
                </div>

                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct >= 85 ? 'bg-emerald-500' : pct >= 65 ? 'bg-blue-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h4 className="font-bold text-base text-slate-900 dark:text-white">
            Recomendações Personalizadas para o seu Perfil
          </h4>
        </div>

        <div className="space-y-2.5 pt-2">
          {healthScore.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start space-x-3 p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/50 text-xs">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-slate-800 dark:text-slate-200">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
