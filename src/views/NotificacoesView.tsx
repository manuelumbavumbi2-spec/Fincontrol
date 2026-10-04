import React from 'react';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Clock,
  PiggyBank,
  Check
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatDate } from '../utils/formatters';

export const NotificacoesView: React.FC = () => {
  const { notifications, markNotificationRead } = useFinance();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Notificações & Alertas Inteligentes ({notifications.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Avisos preventivos sobre tectos orçamentais, vencimentos e metas financeiras.
          </p>
        </div>

        <button
          onClick={() => {
            notifications.forEach(n => markNotificationRead(n.id));
          }}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
        >
          Marcar todas como lidas
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map(n => (
          <div
            key={n.id}
            onClick={() => markNotificationRead(n.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              n.isRead
                ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80'
                : 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 shadow-xs'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-xl mt-0.5 ${
                  n.type === 'orcamento_alerta'
                    ? 'bg-amber-100 text-amber-700'
                    : n.type === 'despesa_vencendo'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{n.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{n.message}</p>
                  <span className="text-[10px] text-slate-400 block mt-2 font-medium">{formatDate(n.date)}</span>
                </div>
              </div>

              {!n.isRead && (
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 mt-1" />
              )}
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-xs">
            Não tem notificações pendentes no momento.
          </div>
        )}
      </div>
    </div>
  );
};
