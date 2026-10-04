import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  CreditCard,
  PiggyBank,
  Briefcase,
  Calendar as CalendarIcon,
  X
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate, MONTH_NAMES_PT } from '../utils/formatters';

export const CalendarioView: React.FC = () => {
  const { expenses, incomes, debts, investments, savingsTransactions, settings } = useFinance();
  const cur = settings.currency || 'Kz';

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-11
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ date: string; events: any[] } | null>(null);

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Calendar dates generation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

  // Group events by YYYY-MM-DD
  const eventsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};

    const addEvent = (dateStr: string, item: any, type: string) => {
      if (!dateStr) return;
      const key = dateStr.split('T')[0];
      if (!map[key]) map[key] = [];
      map[key].push({ ...item, calendarType: type });
    };

    expenses.forEach(e => addEvent(e.date, e, 'expense'));
    incomes.forEach(i => addEvent(i.date, i, 'income'));
    debts.forEach(d => addEvent(d.dueDate, d, 'debt'));
    investments.forEach(inv => {
      if (inv.maturityDate) addEvent(inv.maturityDate, inv, 'investment');
    });
    savingsTransactions.forEach(s => addEvent(s.date, s, 'savings'));

    return map;
  }, [expenses, incomes, debts, investments, savingsTransactions]);

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  return (
    <div className="space-y-6">
      {/* Month Header Navigation */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {MONTH_NAMES_PT[currentMonth]} {currentYear}
            </h3>
            <p className="text-xs text-slate-400">Visão geral de vencimentos, receitas e pagamentos</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] font-medium text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Receitas</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Despesas</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-600" /> Vencimento Dívidas</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Poupanças</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={prevMonth}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setCurrentYear(new Date().getFullYear());
              setCurrentMonth(new Date().getMonth());
            }}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            Hoje
          </button>
          <button
            onClick={nextMonth}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Days of week */}
        <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-center text-xs font-bold text-slate-500 dark:text-slate-400 py-2.5">
          <span>Dom</span>
          <span>Seg</span>
          <span>Ter</span>
          <span>Qua</span>
          <span>Qui</span>
          <span>Sex</span>
          <span>Sáb</span>
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800">
          {blanks.map(b => (
            <div key={`blank-${b}`} className="min-h-[90px] sm:min-h-[110px] bg-slate-50/50 dark:bg-slate-950/20 p-2" />
          ))}

          {daysArray.map(day => {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = eventsByDate[dateStr] || [];
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            return (
              <div
                key={`day-${day}`}
                onClick={() => {
                  if (dayEvents.length > 0) {
                    setSelectedDayEvents({ date: dateStr, events: dayEvents });
                  }
                }}
                className={`min-h-[90px] sm:min-h-[110px] p-2 transition-colors relative cursor-pointer hover:bg-blue-50/40 dark:hover:bg-slate-800/40 ${
                  isToday ? 'bg-blue-50/60 dark:bg-blue-950/30' : ''
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    isToday ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {day}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] text-slate-400 font-semibold">{dayEvents.length}</span>
                  )}
                </div>

                {/* Event tags */}
                <div className="space-y-1 overflow-hidden">
                  {dayEvents.slice(0, 3).map((ev, idx) => {
                    let bg = 'bg-slate-100 text-slate-700';
                    if (ev.calendarType === 'expense') bg = 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300';
                    else if (ev.calendarType === 'income') bg = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300';
                    else if (ev.calendarType === 'debt') bg = 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
                    else if (ev.calendarType === 'savings') bg = 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300';

                    return (
                      <div
                        key={idx}
                        className={`px-1.5 py-0.5 rounded text-[10px] truncate font-medium ${bg}`}
                      >
                        {ev.description || ev.name || ev.creditor}
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <span className="text-[9px] text-slate-400 block pl-1">+{dayEvents.length - 3} mais</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Events Modal / Details */}
      {selectedDayEvents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs text-slate-400">Movimentos em</span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {formatDate(selectedDayEvents.date)}
                </h4>
              </div>
              <button
                onClick={() => setSelectedDayEvents(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto space-y-2">
              {selectedDayEvents.events.map((ev, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {ev.description || ev.name || ev.creditor}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {ev.calendarType} • {ev.paymentMethod || ev.institution || ''}
                    </span>
                  </div>
                  <span className={`text-sm font-black ${
                    ev.calendarType === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                  }`}>
                    {ev.calendarType === 'income' ? '+' : '-'}{formatCurrency(ev.amount || ev.installmentAmount, cur)}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedDayEvents(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
