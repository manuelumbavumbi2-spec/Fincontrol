import React, { useState } from 'react';
import {
  Tags,
  Plus,
  Trash2,
  Edit,
  Utensils,
  Home,
  Car,
  GraduationCap,
  Baby,
  BookOpen,
  HeartPulse,
  Shirt,
  Wifi,
  Tv,
  Zap,
  Droplets,
  Users,
  Laptop,
  Sparkles,
  Wrench,
  CreditCard,
  Briefcase,
  Store,
  TrendingUp,
  PiggyBank
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Category } from '../types';

export const CategoriasView: React.FC = () => {
  const { categories, addCategory, deleteCategory } = useFinance();

  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');

  const filtered = categories.filter(c => c.type === activeTab);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    await addCategory({
      name,
      type: activeTab,
      icon: 'Tag',
      color
    });

    setIsModalOpen(false);
    setName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Categorias Financeiras ({categories.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Personalize a árvore de categorias de receitas e despesas adaptadas à sua família.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Categoria</span>
        </button>
      </div>

      {/* Type toggle */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('expense')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'expense'
              ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Despesas ({categories.filter(c => c.type === 'expense').length})
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'income'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Receitas ({categories.filter(c => c.type === 'income').length})
        </button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filtered.map(cat => (
          <div
            key={cat.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between items-center text-center space-y-2 group hover:border-blue-500 transition-colors"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: cat.color || '#3B82F6' }}
            >
              <Tags className="w-5 h-5" />
            </div>

            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                {cat.name}
              </p>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">{cat.type}</span>
            </div>

            <button
              onClick={() => {
                if (window.confirm(`Eliminar categoria "${cat.name}"?`)) {
                  deleteCategory(cat.id);
                }
              }}
              className="opacity-0 group-hover:opacity-100 text-xs text-slate-400 hover:text-rose-600 transition-opacity cursor-pointer"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      {/* Modal Nova Categoria */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Criar Nova Categoria</h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome da Categoria *</label>
                <input
                  type="text"
                  placeholder="Ex: Seguros, Lazer, Tecnologia..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipo</label>
                <select
                  value={activeTab}
                  onChange={e => setActiveTab(e.target.value as any)}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="expense">Despesa</option>
                  <option value="income">Receita</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Cor da Categoria</label>
                <div className="flex flex-wrap gap-2">
                  {['#F97316', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#EF4444', '#14B8A6', '#06B6D4', '#EAB308', '#64748B'].map(c => (
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
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
