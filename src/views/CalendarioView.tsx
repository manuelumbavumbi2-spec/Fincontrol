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
  X,
  CheckCircle2,
  Clock,
  Filter,
  Check,
  AlertCircle,
  ArrowRight,
  Plus,
  Trash2,
  Edit,
  Repeat
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate, MONTH_NAMES_PT } from '../utils/formatters';
import { Expense, ExpenseStatus, ActiveView } from '../types';

interface CalendarioViewProps {
  onSelectView?: (view: ActiveView) => void;
  onOpenQuickAdd?: (tab?: 'despesa') => void;
}

export const CalendarioView: React.FC<CalendarioViewProps> = ({ onSelectView, onOpenQuickAdd }) => {
  const { expenses, incomes, updateExpense, deleteExpense, addExpense, categories, accounts, settings } = useFinance();
  const cur = settings.currency || 'Kz';

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-11
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ date: string; expenses: Expense[]; incomes: any[] } | null>(null);
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pago' | 'previsto'>('todos');
  const [isEditDateModalOpen, setIsEditDateModalOpen] = useState(false);
  const [editingExpenseForDate, setEditingExpenseForDate] = useState<Expense | null>(null);
  const [newExpenseDate, setNewExpenseDate] = useState('');

  const categoryMap = new Map(categories.map(c => [c.id, c.name]));
  const accountMap = new Map(accounts.map(a => [a.id, a.name]));

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

  // Filter expenses strictly according to the user request:
  // "As datas do calendário deve depender dos dados do menu despesa no campo pago ou previsto"
  const expensesForMonth = useMemo(() => {
    const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    return expenses.filter(e => e.date && e.date.startsWith(monthStr) && e.status !== 'cancelado');
  }, [expenses, currentYear, currentMonth]);

  // Monthly totals for Pago vs Previsto
  const monthStats = useMemo(() => {
    let totalPago = 0;
    let countPago = 0;
    let totalPrevisto = 0;
    let countPrevisto = 0;

    for (const exp of expensesForMonth) {
      if (exp.status === 'pago') {
        totalPago += Number(exp.amount) || 0;
        countPago++;
      } else {
        // pendente ou previsto
        totalPrevisto += Number(exp.amount) || 0;
        countPrevisto++;
      }
    }

    return {
      totalPago,
      countPago,
      totalPrevisto,
      countPrevisto,
      totalGeral: totalPago + totalPrevisto
    };
  }, [expensesForMonth]);

  // Group expenses and incomes by exact date (YYYY-MM-DD)
  const dataByDate = useMemo(() => {
    const map: Record<string, { expenses: Expense[]; incomes: any[] }> = {};

    expenses.forEach(e => {
      if (!e.date || e.status === 'cancelado') return;
      const key = e.date.split('T')[0];
      if (!map[key]) map[key] = { expenses: [], incomes: [] };
      map[key].expenses.push(e);
    });

    incomes.forEach(inc => {
      if (!inc.date) return;
      const key = inc.date.split('T')[0];
      if (!map[key]) map[key] = { expenses: [], incomes: [] };
      map[key].incomes.push(inc);
    });

    return map;
  }, [expenses, incomes]);

  // 1-click status switch between Pago and Previsto (Synchronized directly with Despesas menu)
  const handleToggleStatus = async (exp: Expense) => {
    const newStatus: ExpenseStatus = exp.status === 'pago' ? 'previsto' : 'pago';
    await updateExpense(exp.id, { status: newStatus });
    
    // Update local state if modal is open
    if (selectedDayEvents) {
      setSelectedDayEvents(prev => {
        if (!prev) return null;
        return {
          ...prev,
          expenses: prev.expenses.map(item => item.id === exp.id ? { ...item, status: newStatus } : item)
        };
      });
    }
  };

  const handleOpenDateChange = (exp: Expense) => {
    setEditingExpenseForDate(exp);
    setNewExpenseDate(exp.date);
    setIsEditDateModalOpen(true);
  };

  const handleSaveDateChange = async () => {
    if (!editingExpenseForDate || !newExpenseDate) return;
    await updateExpense(editingExpenseForDate.id, { date: newExpenseDate });
    setIsEditDateModalOpen(false);
    setEditingExpenseForDate(null);
    setSelectedDayEvents(null);
  };

  const handleDeleteExpenseFromCalendar = async (id: string, description: string) => {
    if (window.confirm(`Eliminar a despesa "${description}" do calendário e do sistema?`)) {
      await deleteExpense(id);
      if (selectedDayEvents) {
        setSelectedDayEvents(prev => {
          if (!prev) return null;
          return {
            ...prev,
            expenses: prev.expenses.filter(item => item.id !== id)
          };
        });
      }
    }
  };

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  return (
    <div className="space-y-6">
      {/* Month Header Navigation & Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {MONTH_NAMES_PT[currentMonth]} {currentYear}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Datas e compromissos sincronizados com os campos <strong>Pago</strong> e <strong>Previsto</strong> do menu Despesas.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={prevMonth}
              className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Mês Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setCurrentYear(new Date().getFullYear());
                setCurrentMonth(new Date().getMonth());
              }}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              Mês Actual
            </button>
            <button
              onClick={nextMonth}
              className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Mês Seguinte"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Month Stats Cards: Pago vs Previsto */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Despesas Pagas ({monthStats.countPago})
              </span>
              <p className="text-lg font-black text-emerald-900 dark:text-emerald-200 mt-0.5">
                {formatCurrency(monthStats.totalPago, cur)}
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-200/70 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 rounded-md">
              Liquidadas
            </span>
          </div>

          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/50 rounded-2xl border border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Despesas Previstas ({monthStats.countPrevisto})
              </span>
              <p className="text-lg font-black text-amber-900 dark:text-amber-200 mt-0.5">
                {formatCurrency(monthStats.totalPrevisto, cur)}
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-200/70 dark:bg-amber-900 text-amber-900 dark:text-amber-100 rounded-md">
              A Liquidar
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Total de Compromissos no Mês
              </span>
              <p className="text-lg font-black text-slate-950 dark:text-white mt-0.5">
                {formatCurrency(monthStats.totalGeral, cur)}
              </p>
            </div>
            <span className="text-[10px] font-bold text-slate-500">
              {monthStats.countPago + monthStats.countPrevisto} despesas
            </span>
          </div>
        </div>

        {/* Filter bar & Legend */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2">
          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 text-xs font-bold">
            <span className="text-slate-400 text-[11px] mr-1">Filtrar:</span>
            <button
              type="button"
              onClick={() => setStatusFilter('todos')}
              className={`px-3 py-1 rounded-xl transition-colors cursor-pointer ${
                statusFilter === 'todos'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pago')}
              className={`px-3 py-1 rounded-xl transition-colors cursor-pointer ${
                statusFilter === 'pago'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
              }`}
            >
              ✓ Apenas Pagas
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('previsto')}
              className={`px-3 py-1 rounded-xl transition-colors cursor-pointer ${
                statusFilter === 'previsto'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-100'
              }`}
            >
              ⏰ Apenas Previstas
            </button>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs" />
              <span>Verde = Pago</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-2xs" />
              <span>Âmbar = Previsto</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-2xs" />
              <span>Azul = Receita</span>
            </span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-center text-xs font-black text-slate-700 dark:text-slate-200 py-3">
          <span>Domingo</span>
          <span>Segunda</span>
          <span>Terça</span>
          <span>Quarta</span>
          <span>Quinta</span>
          <span>Sexta</span>
          <span>Sábado</span>
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800">
          {blanks.map(b => (
            <div key={`blank-${b}`} className="min-h-[110px] sm:min-h-[130px] bg-slate-50/50 dark:bg-slate-950/20 p-2" />
          ))}

          {daysArray.map(day => {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayData = dataByDate[dateStr] || { expenses: [], incomes: [] };
            
            // Calculate paid vs previsto on this day
            const paidOnDay = dayData.expenses.filter(e => e.status === 'pago');
            const previstoOnDay = dayData.expenses.filter(e => e.status !== 'pago');
            const paidSum = paidOnDay.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
            const previstoSum = previstoOnDay.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            return (
              <div
                key={`day-${day}`}
                onClick={() => {
                  setSelectedDayEvents({ date: dateStr, expenses: dayData.expenses, incomes: dayData.incomes });
                }}
                className={`min-h-[110px] sm:min-h-[130px] p-2 transition-all relative cursor-pointer hover:bg-blue-50/60 dark:hover:bg-slate-800/60 flex flex-col justify-between ${
                  isToday ? 'bg-blue-50/80 dark:bg-blue-950/40 ring-2 ring-inset ring-blue-500' : ''
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-black w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-900 dark:text-slate-200'
                    }`}>
                      {day}
                    </span>

                    {/* Small badges indicators */}
                    <div className="flex items-center space-x-1">
                      {paidOnDay.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" title={`${paidOnDay.length} despesa(s) paga(s)`} />
                      )}
                      {previstoOnDay.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title={`${previstoOnDay.length} despesa(s) prevista(s)`} />
                      )}
                    </div>
                  </div>

                  {/* Day expenses list */}
                  <div className="space-y-1">
                    {/* Paid expenses badge */}
                    {paidSum > 0 && (statusFilter === 'todos' || statusFilter === 'pago') && (
                      <div className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200 text-[10px] font-black flex items-center justify-between">
                        <span className="flex items-center gap-0.5 truncate">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                          <span className="truncate">Pago:</span>
                        </span>
                        <span className="shrink-0">{formatCurrency(paidSum, cur)}</span>
                      </div>
                    )}

                    {/* Previsto expenses badge */}
                    {previstoSum > 0 && (statusFilter === 'todos' || statusFilter === 'previsto') && (
                      <div className="p-1 rounded-lg bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-200 text-[10px] font-black flex items-center justify-between">
                        <span className="flex items-center gap-0.5 truncate">
                          <Clock className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                          <span className="truncate">Previsto:</span>
                        </span>
                        <span className="shrink-0">{formatCurrency(previstoSum, cur)}</span>
                      </div>
                    )}

                    {/* Incomes on day */}
                    {dayData.incomes.length > 0 && (
                      <div className="p-0.5 px-1 rounded-lg bg-blue-100 dark:bg-blue-950/80 border border-blue-300 dark:border-blue-700 text-blue-950 dark:text-blue-200 text-[9px] font-black truncate">
                        +{formatCurrency(dayData.incomes.reduce((acc, i) => acc + (Number(i.amount) || 0), 0), cur)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-[9px] text-right font-bold text-slate-400 pt-1">
                  {dayData.expenses.length > 0 && (
                    <span>{dayData.expenses.length} desp.</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DAY EVENTS MODAL: Detail, toggle Pago/Previsto, move date */}
      {selectedDayEvents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
                  {formatDate(selectedDayEvents.date)}
                </h3>
                <p className="text-xs text-slate-500">
                  Gerir despesas, liquidar compromissos ou alterar datas para este dia.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDayEvents(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Expenses on this day */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Despesas do Dia ({selectedDayEvents.expenses.length})
                </span>
                {onOpenQuickAdd && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDayEvents(null);
                      onOpenQuickAdd('despesa');
                    }}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Adicionar Despesa</span>
                  </button>
                )}
              </div>

              {selectedDayEvents.expenses.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  Nenhuma despesa agendada ou registada nesta data.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedDayEvents.expenses.map(exp => (
                    <div
                      key={exp.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-bold text-slate-900 dark:text-white">{exp.description}</strong>
                          {exp.recurrence && exp.recurrence !== 'nenhuma' && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 flex items-center gap-0.5">
                              <Repeat className="w-2.5 h-2.5" />
                              {exp.recurrence}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{categoryMap.get(exp.categoryId) || 'Geral'}</span>
                          <span>•</span>
                          <span>{accountMap.get(exp.accountId) || 'Conta'}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                          {formatCurrency(exp.amount, cur)}
                        </span>

                        {/* Interactive Toggle between Pago and Previsto */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(exp)}
                          title="Clique para alternar o estado entre Pago e Previsto"
                          className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
                            exp.status === 'pago'
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-amber-500 hover:bg-amber-600 text-white'
                          }`}
                        >
                          {exp.status === 'pago' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          <span>{exp.status === 'pago' ? 'Pago' : 'Previsto'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDateChange(exp)}
                          title="Alterar data desta despesa no calendário"
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteExpenseFromCalendar(exp.id, exp.description)}
                          title="Eliminar esta despesa"
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Incomes on this day */}
            {selectedDayEvents.incomes.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Receitas Recebidas Neste Dia ({selectedDayEvents.incomes.length})
                </span>
                <div className="space-y-1.5">
                  {selectedDayEvents.incomes.map(inc => (
                    <div key={inc.id} className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-xs flex justify-between items-center">
                      <div>
                        <strong className="text-emerald-900 dark:text-emerald-200">{inc.description}</strong>
                        {inc.source && <span className="text-slate-400 text-[11px] block">{inc.source}</span>}
                      </div>
                      <span className="font-black text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(inc.amount, cur)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDayEvents(null)}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOVE DATE MODAL */}
      {isEditDateModalOpen && editingExpenseForDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Alterar Data da Despesa
            </h3>
            <p className="text-xs text-slate-500">
              Deslocar <strong>{editingExpenseForDate.description}</strong> para outro dia no calendário financeiro.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nova Data</label>
              <input
                type="date"
                value={newExpenseDate}
                onChange={e => setNewExpenseDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditDateModalOpen(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveDateChange}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
              >
                Guardar Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
