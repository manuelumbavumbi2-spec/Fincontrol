import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  User,
  Heart,
  Baby,
  Home,
  TrendingDown,
  PieChart
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { Person, RelationshipType } from '../types';

export const FamiliaView: React.FC = () => {
  const { people, addPerson, deletePerson, filteredExpenses, settings } = useFinance();
  const cur = settings.currency || 'Kz';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<RelationshipType>('filho');
  const [color, setColor] = useState('#2563EB');

  // Calculate expenses per family member
  const expensesByPerson = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    for (const p of people) {
      map[p.id] = { total: 0, count: 0 };
    }
    // Also include default/casa
    map['per_casa'] = map['per_casa'] || { total: 0, count: 0 };

    for (const exp of filteredExpenses) {
      if (exp.status === 'cancelado') continue;
      const pid = exp.personId || 'per_casa';
      if (!map[pid]) map[pid] = { total: 0, count: 0 };
      map[pid].total += exp.amount;
      map[pid].count += 1;
    }

    return map;
  }, [people, filteredExpenses]);

  const totalGastoFamilia = filteredExpenses
    .filter(e => e.status !== 'cancelado')
    .reduce((acc, e) => acc + e.amount, 0);

  const handleCreatePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    await addPerson({
      name,
      relationship,
      avatarColor: color
    });

    setIsModalOpen(false);
    setName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Controlo Familiar ({people.length} membros)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Acompanhe exactamente quanto foi gasto por cada pessoa da família no período.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Membro Familiar</span>
        </button>
      </div>

      {/* Grid of Family Members */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {people.map(person => {
          const stats = expensesByPerson[person.id] || { total: 0, count: 0 };
          const pct = totalGastoFamilia > 0 ? (stats.total / totalGastoFamilia) * 100 : 0;

          return (
            <div
              key={person.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-extrabold text-base shadow-sm"
                      style={{ backgroundColor: person.avatarColor || '#3B82F6' }}
                    >
                      {person.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">{person.name}</h4>
                      <span className="text-[11px] text-slate-400 font-medium capitalize">{person.relationship}</span>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {pct.toFixed(1)}%
                  </span>
                </div>

                <div className="mt-5 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                  <span className="text-xs text-slate-400">Total Gasto no Período</span>
                  <p className="text-xl font-black text-slate-900 dark:text-white">
                    {formatCurrency(stats.total, cur)}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">{stats.count} despesas associadas</p>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, pct)}%`,
                      backgroundColor: person.avatarColor || '#3B82F6'
                    }}
                  />
                </div>
              </div>

              {person.relationship !== 'usuario' && person.relationship !== 'casa' && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => {
                      if (window.confirm(`Remover "${person.name}" do controlo familiar?`)) {
                        deletePerson(person.id);
                      }
                    }}
                    className="text-xs text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Novo Membro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Adicionar Membro Familiar</h3>

            <form onSubmit={handleCreatePerson} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome *</label>
                <input
                  type="text"
                  placeholder="Ex: Roseth, Mariel, Marilson..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Grau de Parentesco</label>
                <select
                  value={relationship}
                  onChange={e => setRelationship(e.target.value as RelationshipType)}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="conjuge">Cônjuge / Esposa / Marido</option>
                  <option value="filho">Filho</option>
                  <option value="filha">Filha</option>
                  <option value="pai">Pai</option>
                  <option value="mae">Mãe</option>
                  <option value="familiar">Outro Familiar</option>
                  <option value="casa">Despesa Geral da Casa</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Cor do Identificador</label>
                <div className="flex items-center space-x-2">
                  {['#2563EB', '#EC4899', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#64748B'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                        color === c ? 'scale-125 ring-2 ring-slate-900 dark:ring-white' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
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
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl cursor-pointer shadow-sm"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
