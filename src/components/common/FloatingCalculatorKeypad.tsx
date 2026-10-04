import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Keyboard,
  FileText,
  X,
  Minimize2,
  Maximize2,
  Copy,
  Check,
  RotateCcw,
  Clock,
  Sparkles,
  Banknote,
  Coins,
  Plus,
  Trash2,
  Search,
  Save,
  CheckCircle2,
  Download
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface CalcHistoryItem {
  id: string;
  expression: string;
  result: number;
  time: string;
}

interface FinancialNote {
  id: string;
  title: string;
  content: string;
  tag: string;
  updatedAt: string;
}

const STORAGE_NOTES_KEY = 'fincontrol_financial_notes_v2';

const DEFAULT_NOTES: FinancialNote[] = [
  {
    id: 'note_1',
    title: 'Lista de Compras Kero / Candando',
    content: '- Arroz 25kg (15.000 Kz)\n- Óleo de cozinha alimentar (4.500 Kz)\n- Leite Nido & Cereais (12.000 Kz)\n- Carne e Frango para o mês (28.000 Kz)\n- Vegetais frescos e frutas (10.500 Kz)\n- Produtos de higiene e limpeza (8.500 Kz)',
    tag: 'Compras',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'note_2',
    title: 'Compromissos Financeiros Fixos',
    content: '- Creche Mariel: dia 02 (55.000 Kz)\n- Propina Universidade Roseth: dia 09 (45.000 Kz)\n- Internet Net@Casa Fibra: dia 10 (24.500 Kz)\n- Zap TV Satélite: dia 11 (5.000 Kz)\n- Condomínio / Segurança: dia 15 (18.000 Kz)',
    tag: 'Pagamentos',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'note_3',
    title: 'Planeamento de Poupança & Investimento',
    content: '- Reforço Mensal Fundo de Emergência BAI: 50.000 Kz\n- Subscrição Obrigações do Tesouro BODIVA: 100.000 Kz\n- Objectivo: Manter taxa de poupança acima de 20% das receitas.',
    tag: 'Metas',
    updatedAt: new Date().toISOString()
  }
];

export const FloatingCalculatorKeypad: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'calc' | 'keypad' | 'notes'>('calc');
  
  // Calculator State
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcEquation, setCalcEquation] = useState('');
  const [calcHistory, setCalcHistory] = useState<CalcHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newNumberExpected, setNewNumberExpected] = useState(false);

  // Keypad / Cash Accumulator State
  const [keypadTotal, setKeypadTotal] = useState(0);
  const [keypadCurrentInput, setKeypadCurrentInput] = useState('');
  const [keypadHistory, setKeypadHistory] = useState<string[]>([]);
  const [keypadCopied, setKeypadCopied] = useState(false);

  // Notes State
  const [notes, setNotes] = useState<FinancialNote[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_NOTES_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_NOTES;
  });
  const [activeNoteId, setActiveNoteId] = useState<string | null>(notes[0]?.id || null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTag, setNoteTag] = useState('Geral');
  const [notesSearch, setNotesSearch] = useState('');
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [noteCopied, setNoteCopied] = useState(false);
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);

  // Save notes to localStorage
  const saveNotes = (updated: FinancialNote[]) => {
    setNotes(updated);
    try {
      localStorage.setItem(STORAGE_NOTES_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Sync selected note to form
  useEffect(() => {
    if (activeNoteId) {
      const found = notes.find(n => n.id === activeNoteId);
      if (found) {
        setNoteTitle(found.title);
        setNoteContent(found.content);
        setNoteTag(found.tag);
        setIsCreatingNote(false);
      }
    }
  }, [activeNoteId, notes]);

  // Listen to custom global events
  useEffect(() => {
    const handleOpen = (e: any) => {
      setIsOpen(true);
      setIsMinimized(false);
      if (e.detail?.tab) {
        setActiveTab(e.detail.tab);
      }
    };

    window.addEventListener('open-calculator-keypad', handleOpen);
    return () => window.removeEventListener('open-calculator-keypad', handleOpen);
  }, []);

  // --- Calculator Logic ---
  const handleCalcDigit = (digit: string) => {
    if (newNumberExpected || calcDisplay === '0') {
      setCalcDisplay(digit);
      setNewNumberExpected(false);
    } else {
      setCalcDisplay(prev => prev + digit);
    }
  };

  const handleCalcDecimal = () => {
    if (newNumberExpected) {
      setCalcDisplay('0.');
      setNewNumberExpected(false);
      return;
    }
    if (!calcDisplay.includes('.')) {
      setCalcDisplay(prev => prev + '.');
    }
  };

  const handleCalcOperator = (op: string) => {
    setCalcEquation(`${calcDisplay} ${op} `);
    setNewNumberExpected(true);
  };

  const handleCalcEqual = () => {
    if (!calcEquation) return;
    try {
      const fullExpr = calcEquation + calcDisplay;
      const sanitized = fullExpr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/,/g, '.')
        .replace(/[^0-9+\-*/.]/g, '');

      // Evaluate safely
      const result = Function(`'use strict'; return (${sanitized})`)();
      if (!isNaN(result) && isFinite(result)) {
        const rounded = Number(Math.round(Number(result + 'e+4')) + 'e-4');
        const formattedResult = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
        
        setCalcHistory(prev => [
          {
            id: String(Date.now()),
            expression: fullExpr,
            result: Number(formattedResult),
            time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
          },
          ...prev.slice(0, 15)
        ]);

        setCalcDisplay(formattedResult);
        setCalcEquation('');
        setNewNumberExpected(true);
      }
    } catch (e) {
      setCalcDisplay('Erro');
      setNewNumberExpected(true);
    }
  };

  const handleCalcClear = () => {
    setCalcDisplay('0');
    setCalcEquation('');
    setNewNumberExpected(false);
  };

  const handleCalcBackspace = () => {
    if (calcDisplay.length > 1) {
      setCalcDisplay(prev => prev.slice(0, -1));
    } else {
      setCalcDisplay('0');
    }
  };

  const handleCalcToggleSign = () => {
    const num = Number(calcDisplay);
    if (!isNaN(num)) {
      setCalcDisplay(String(-num));
    }
  };

  const applyPreset = (type: 'iva' | 'poupanca' | 'extra' | 'irt') => {
    const val = Number(calcDisplay) || 0;
    let res = 0;
    if (type === 'iva') res = val * 1.14; // +14% IVA Angola
    else if (type === 'poupanca') res = val * 0.90; // -10% Poupança
    else if (type === 'extra') res = val * 1.10; // +10% Extra
    else if (type === 'irt') res = val * 0.85; // -15% IRT médio
    const formatted = Number.isInteger(res) ? String(res) : res.toFixed(2);
    setCalcDisplay(formatted);
    setNewNumberExpected(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Keypad / Cash Accumulator Logic ---
  const handleKeypadDigit = (digit: string) => {
    setKeypadCurrentInput(prev => prev + digit);
  };

  const handleKeypadAddCash = (amount: number) => {
    setKeypadTotal(prev => prev + amount);
    setKeypadHistory(prev => [`+ ${formatCurrency(amount, 'Kz')}`, ...prev.slice(0, 7)]);
  };

  const handleKeypadAddCurrent = () => {
    const num = Number(keypadCurrentInput) || 0;
    if (num > 0) {
      setKeypadTotal(prev => prev + num);
      setKeypadHistory(prev => [`+ ${formatCurrency(num, 'Kz')}`, ...prev.slice(0, 7)]);
      setKeypadCurrentInput('');
    }
  };

  const handleKeypadSubtractCurrent = () => {
    const num = Number(keypadCurrentInput) || 0;
    if (num > 0) {
      setKeypadTotal(prev => Math.max(0, prev - num));
      setKeypadHistory(prev => [`- ${formatCurrency(num, 'Kz')}`, ...prev.slice(0, 7)]);
      setKeypadCurrentInput('');
    }
  };

  const handleKeypadClear = () => {
    setKeypadTotal(0);
    setKeypadCurrentInput('');
    setKeypadHistory([]);
  };

  const copyKeypadTotal = () => {
    navigator.clipboard.writeText(String(keypadTotal));
    setKeypadCopied(true);
    setTimeout(() => setKeypadCopied(false), 2000);
  };

  // --- Notes Management ---
  const handleSaveCurrentNote = () => {
    if (!noteTitle.trim()) return;

    if (isCreatingNote || !activeNoteId) {
      const newNote: FinancialNote = {
        id: 'note_' + Date.now(),
        title: noteTitle.trim(),
        content: noteContent,
        tag: noteTag,
        updatedAt: new Date().toISOString()
      };
      const updated = [newNote, ...notes];
      saveNotes(updated);
      setActiveNoteId(newNote.id);
      setIsCreatingNote(false);
    } else {
      const updated = notes.map(n => {
        if (n.id === activeNoteId) {
          return {
            ...n,
            title: noteTitle.trim(),
            content: noteContent,
            tag: noteTag,
            updatedAt: new Date().toISOString()
          };
        }
        return n;
      });
      saveNotes(updated);
    }
    setNoteSavedFeedback(true);
    setTimeout(() => setNoteSavedFeedback(false), 2000);
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    saveNotes(updated);
    if (activeNoteId === id) {
      setActiveNoteId(updated[0]?.id || null);
    }
  };

  const handleStartNewNote = () => {
    setIsCreatingNote(true);
    setActiveNoteId(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteTag('Geral');
  };

  const insertSnippet = (snippet: string) => {
    setNoteContent(prev => (prev ? prev + '\n' + snippet : snippet));
  };

  const copyNoteContent = () => {
    navigator.clipboard.writeText(`${noteTitle}\n\n${noteContent}`);
    setNoteCopied(true);
    setTimeout(() => setNoteCopied(false), 2000);
  };

  const filteredNotes = notes.filter(n => {
    if (!notesSearch.trim()) return true;
    const q = notesSearch.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tag.toLowerCase().includes(q);
  });

  return (
    <>
      {/* 1. PERSISTENT FLOATING TRIGGER - Always visible in the entire system */}
      <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40 flex items-center">
        {!isOpen && (
          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="flex items-center space-x-2 px-3.5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-2xl shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-105 transition-all cursor-pointer font-bold text-xs border border-white/20 backdrop-blur-md"
            title="Abrir Ferramentas: Calculadora, Teclado Numérico & Bloco de Notas"
          >
            <div className="flex items-center space-x-1.5">
              <Calculator className="w-4 h-4 text-white" />
              <Keyboard className="w-3.5 h-3.5 text-white/90" />
              <FileText className="w-3.5 h-3.5 text-white/90" />
            </div>
            <span className="hidden sm:inline font-bold">Calculadora, Teclado & Notas</span>
          </button>
        )}
      </div>

      {/* 2. FLOATING TOOL SUITE WINDOW */}
      {isOpen && (
        <div className={`fixed bottom-20 lg:bottom-6 right-3 sm:right-6 z-50 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-3xl shadow-2xl transition-all duration-300 overflow-hidden flex flex-col ${
          isMinimized ? 'w-80 h-14' : 'w-[335px] sm:w-[390px] h-[550px]'
        }`}>
          {/* Header Bar */}
          <div className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
            {/* 3 Tabs: Calculadora, Teclado, Bloco de Notas */}
            <div className="flex items-center space-x-1 bg-slate-200 dark:bg-slate-950 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('calc');
                  setIsMinimized(false);
                }}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'calc'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-800 dark:text-slate-200 hover:text-black dark:hover:text-white'
                }`}
                title="Calculadora Financeira"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">Calculadora</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('keypad');
                  setIsMinimized(false);
                }}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'keypad'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-800 dark:text-slate-200 hover:text-black dark:hover:text-white'
                }`}
                title="Teclado Numérico & Caixa"
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">Teclado</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('notes');
                  setIsMinimized(false);
                }}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'notes'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-800 dark:text-slate-200 hover:text-black dark:hover:text-white'
                }`}
                title="Bloco de Notas Financeiras"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">Notas</span>
              </button>
            </div>

            {/* Window Controls */}
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-slate-700 hover:text-slate-950 dark:text-slate-200 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title={isMinimized ? 'Expandir' : 'Minimizar'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-600 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Window Body */}
          {!isMinimized && (
            <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
              
              {/* TAB 1: CALCULADORA FINANCEIRA */}
              {activeTab === 'calc' && (
                <div className="flex-1 flex flex-col justify-between p-3.5 space-y-2.5">
                  {/* High-Contrast Display */}
                  <div className="bg-slate-100 dark:bg-slate-950 p-3 rounded-2xl border-2 border-slate-300 dark:border-slate-700 text-right space-y-1 shadow-inner">
                    <div className="flex items-center justify-between text-[11px] font-bold min-h-[18px]">
                      <button
                        type="button"
                        onClick={() => setShowHistory(!showHistory)}
                        className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        <Clock className="w-3 h-3" />
                        <span>{showHistory ? 'Ocultar Histórico' : 'Histórico'}</span>
                      </button>
                      <span className="truncate max-w-[190px] font-mono text-slate-700 dark:text-slate-300 font-bold">{calcEquation}</span>
                    </div>

                    <div className="flex items-baseline justify-end space-x-1">
                      <span className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white truncate tracking-tight font-mono">
                        {calcDisplay}
                      </span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Kz</span>
                    </div>
                  </div>

                  {/* History Tray */}
                  {showHistory ? (
                    <div className="flex-1 overflow-y-auto space-y-1.5 p-2 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800 font-bold text-[11px] text-slate-700 dark:text-slate-300">
                        <span>Cálculos Recentes</span>
                        <button
                          type="button"
                          onClick={() => setCalcHistory([])}
                          className="text-rose-600 dark:text-rose-400 hover:underline cursor-pointer font-bold"
                        >
                          Limpar
                        </button>
                      </div>
                      {calcHistory.map(item => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setCalcDisplay(String(item.result));
                            setShowHistory(false);
                          }}
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 cursor-pointer flex justify-between items-center"
                        >
                          <span className="text-slate-800 dark:text-slate-200 truncate max-w-[160px] font-mono font-medium">{item.expression}</span>
                          <span className="font-extrabold text-blue-600 dark:text-blue-400 font-mono">{formatCurrency(item.result, 'Kz')}</span>
                        </div>
                      ))}
                      {calcHistory.length === 0 && (
                        <p className="text-center text-slate-500 py-6 text-xs">Nenhum cálculo no histórico.</p>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Angolan Financial Presets Bar */}
                      <div className="grid grid-cols-4 gap-1.5">
                        <button
                          type="button"
                          onClick={() => applyPreset('iva')}
                          className="py-1 px-1 text-[10px] font-black bg-amber-200 hover:bg-amber-300 dark:bg-amber-900/80 dark:hover:bg-amber-800 text-amber-950 dark:text-amber-100 rounded-lg border border-amber-400 dark:border-amber-600 transition-colors cursor-pointer text-center"
                          title="Acrescentar 14% de IVA de Angola"
                        >
                          +14% IVA
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPreset('poupanca')}
                          className="py-1 px-1 text-[10px] font-black bg-emerald-200 hover:bg-emerald-300 dark:bg-emerald-900/80 dark:hover:bg-emerald-800 text-emerald-950 dark:text-emerald-100 rounded-lg border border-emerald-400 dark:border-emerald-600 transition-colors cursor-pointer text-center"
                          title="Separar 10% para poupança"
                        >
                          -10% Poup.
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPreset('extra')}
                          className="py-1 px-1 text-[10px] font-black bg-blue-200 hover:bg-blue-300 dark:bg-blue-900/80 dark:hover:bg-blue-800 text-blue-950 dark:text-blue-100 rounded-lg border border-blue-400 dark:border-blue-600 transition-colors cursor-pointer text-center"
                        >
                          +10% Extra
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPreset('irt')}
                          className="py-1 px-1 text-[10px] font-black bg-purple-200 hover:bg-purple-300 dark:bg-purple-900/80 dark:hover:bg-purple-800 text-purple-950 dark:text-purple-100 rounded-lg border border-purple-400 dark:border-purple-600 transition-colors cursor-pointer text-center"
                          title="Descontar 15% IRT médio"
                        >
                          -15% IRT
                        </button>
                      </div>

                      {/* Calculator Buttons Grid - High Contrast & Crisp Visibility */}
                      <div className="grid grid-cols-4 gap-1.5 text-base font-black">
                        {/* Row 1: C, ±, ⌫, ÷ */}
                        <button
                          type="button"
                          onClick={handleCalcClear}
                          className="py-2.5 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white border border-rose-600 rounded-xl transition-all cursor-pointer font-black text-base shadow-xs"
                          title="Limpar (Clear)"
                        >
                          C
                        </button>
                        <button
                          type="button"
                          onClick={handleCalcToggleSign}
                          className="py-2.5 bg-slate-300 hover:bg-slate-400 active:scale-95 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-950 dark:text-white border border-slate-400 dark:border-slate-600 rounded-xl transition-all cursor-pointer font-black text-base shadow-xs"
                          title="Alternar Sinal Positivo/Negativo"
                        >
                          ±
                        </button>
                        <button
                          type="button"
                          onClick={handleCalcBackspace}
                          className="py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white border border-amber-600 rounded-xl flex items-center justify-center transition-all cursor-pointer font-black text-base shadow-xs"
                          title="Apagar último caractere"
                        >
                          ⌫
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCalcOperator('÷')}
                          className="py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white border border-blue-700 rounded-xl shadow-xs transition-all cursor-pointer text-xl font-black"
                          title="Dividir"
                        >
                          ÷
                        </button>

                        {/* Row 2: 7, 8, 9, × */}
                        <button type="button" onClick={() => handleCalcDigit('7')} className="py-2.5 bg-slate-200 hover:bg-slate-300 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-950 dark:text-white rounded-xl transition-all cursor-pointer font-black text-lg shadow-xs">7</button>
                        <button type="button" onClick={() => handleCalcDigit('8')} className="py-2.5 bg-slate-200 hover:bg-slate-300 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-950 dark:text-white rounded-xl transition-all cursor-pointer font-black text-lg shadow-xs">8</button>
                        <button type="button" onClick={() => handleCalcDigit('9')} className="py-2.5 bg-slate-200 hover:bg-slate-300 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-950 dark:text-white rounded-xl transition-all cursor-pointer font-black text-lg shadow-xs">9</button>
                        <button
                          type="button"
                          onClick={() => handleCalcOperator('×')}
                          className="py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white border border-blue-700 rounded-xl shadow-xs transition-all cursor-pointer text-xl font-black"
                          title="Multiplicar"
                        >
                          ×
                        </button>

                        {/* Row 3: 4, 5, 6, - */}
                        <button type="button" onClick={() => handleCalcDigit('4')} className="py-2.5 bg-slate-200 hover:bg-slate-300 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-950 dark:text-white rounded-xl transition-all cursor-pointer font-black text-lg shadow-xs">4</button>
                        <button type="button" onClick={() => handleCalcDigit('5')} className="py-2.5 bg-slate-200 hover:bg-slate-300 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-950 dark:text-white rounded-xl transition-all cursor-pointer font-black text-lg shadow-xs">5</button>
                        <button type="button" onClick={() => handleCalcDigit('6')} className="py-2.5 bg-slate-200 hover:bg-slate-300 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-950 dark:text-white rounded-xl transition-all cursor-pointer font-black text-lg shadow-xs">6</button>
                        <button
                          type="button"
                          onClick={() => handleCalcOperator('-')}
                          className="py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white border border-blue-700 rounded-xl shadow-xs transition-all cursor-pointer text-xl font-black"
                          title="Subtrair"
                        >
                          −
                        </button>

                        {/* Row 4: 1, 2, 3, + */}
                        <button type="button" onClick={() => handleCalcDigit('1')} className="py-2.5 bg-slate-200 hover:bg-slate-300 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-950 dark:text-white rounded-xl transition-all cursor-pointer font-black text-lg shadow-xs">1</button>
                        <button type="button" onClick={() => handleCalcDigit('2')} className="py-2.5 bg-slate-200 hover:bg-slate-300 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-950 dark:text-white rounded-xl transition-all cursor-pointer font-black text-lg shadow-xs">2</button>
                        <button type="button" onClick={() => handleCalcDigit('3')} className="py-2.5 bg-slate-200 hover:bg-slate-300 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-950 dark:text-white rounded-xl transition-all cursor-pointer font-black text-lg shadow-xs">3</button>
                        <button
                          type="button"
                          onClick={() => handleCalcOperator('+')}
                          className="py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white border border-blue-700 rounded-xl shadow-xs transition-all cursor-pointer text-xl font-black"
                          title="Somar"
                        >
                          +
                        </button>

                        {/* Row 5: 0, 00, ., = */}
                        <button type="button" onClick={() => handleCalcDigit('0')} className="py-2.5 bg-slate-200 hover:bg-slate-300 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-950 dark:text-white rounded-xl transition-all cursor-pointer font-black text-lg shadow-xs">0</button>
                        <button type="button" onClick={() => handleCalcDigit('00')} className="py-2.5 bg-slate-200 hover:bg-slate-300 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-950 dark:text-white rounded-xl transition-all cursor-pointer font-bold text-sm shadow-xs">00</button>
                        <button type="button" onClick={handleCalcDecimal} className="py-2.5 bg-slate-200 hover:bg-slate-300 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-950 dark:text-white rounded-xl transition-all cursor-pointer font-black text-lg shadow-xs">.</button>
                        <button
                          type="button"
                          onClick={handleCalcEqual}
                          className="py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white border border-emerald-700 rounded-xl shadow-xs transition-all cursor-pointer text-xl font-black"
                          title="Calcular Total (=)"
                        >
                          =
                        </button>
                      </div>
                    </>
                  )}

                  {/* Actions Footer */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      Cálculos em Kwanzas (Kz)
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(calcDisplay)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-blue-200 dark:border-blue-800"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copiado!' : 'Copiar Valor'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: TECLADO NUMÉRICO & CONTADOR DE CAIXA */}
              {activeTab === 'keypad' && (
                <div className="flex-1 flex flex-col justify-between p-3.5 space-y-2.5">
                  {/* Accumulator Display */}
                  <div className="bg-slate-100 dark:bg-slate-950 p-3 rounded-2xl border-2 border-slate-300 dark:border-slate-700 space-y-1 shadow-inner">
                    <div className="flex justify-between items-center text-[10px] text-slate-700 dark:text-slate-300 font-extrabold uppercase tracking-wider">
                      <span>Total de Caixa Acumulado:</span>
                      <button
                        type="button"
                        onClick={handleKeypadClear}
                        className="text-rose-600 dark:text-rose-400 hover:underline cursor-pointer font-bold"
                      >
                        Reiniciar
                      </button>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        {formatCurrency(keypadTotal, 'Kz')}
                      </span>

                      <button
                        type="button"
                        onClick={copyKeypadTotal}
                        className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800"
                      >
                        {keypadCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{keypadCopied ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>

                    {/* Current Input */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Valor em Digitação:</span>
                      <strong className="text-sm font-black text-slate-950 dark:text-white font-mono">
                        {keypadCurrentInput ? `${formatCurrency(Number(keypadCurrentInput), 'Kz')}` : '0 Kz'}
                      </strong>
                    </div>
                  </div>

                  {/* Kwanza Banknotes Denomination Bar */}
                  <div>
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                      Denominações em Kwanzas:
                    </span>
                    <div className="grid grid-cols-4 gap-1 text-[11px] font-black">
                      <button
                        type="button"
                        onClick={() => handleKeypadAddCash(1000)}
                        className="py-1 px-1 bg-slate-200 hover:bg-slate-300 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-950 dark:text-white border border-slate-300 dark:border-slate-600 cursor-pointer text-center"
                      >
                        +1.000
                      </button>
                      <button
                        type="button"
                        onClick={() => handleKeypadAddCash(2000)}
                        className="py-1 px-1 bg-slate-200 hover:bg-slate-300 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-950 dark:text-white border border-slate-300 dark:border-slate-600 cursor-pointer text-center"
                      >
                        +2.000
                      </button>
                      <button
                        type="button"
                        onClick={() => handleKeypadAddCash(5000)}
                        className="py-1 px-1 bg-slate-200 hover:bg-slate-300 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-950 dark:text-white border border-slate-300 dark:border-slate-600 cursor-pointer text-center"
                      >
                        +5.000
                      </button>
                      <button
                        type="button"
                        onClick={() => handleKeypadAddCash(10000)}
                        className="py-1 px-1 bg-blue-100 hover:bg-blue-200 active:scale-95 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-950 dark:text-blue-200 rounded-lg border border-blue-300 dark:border-blue-700 cursor-pointer text-center"
                      >
                        +10.000
                      </button>
                      <button
                        type="button"
                        onClick={() => handleKeypadAddCash(20000)}
                        className="py-1 px-1 bg-blue-100 hover:bg-blue-200 active:scale-95 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-950 dark:text-blue-200 rounded-lg border border-blue-300 dark:border-blue-700 cursor-pointer text-center"
                      >
                        +20.000
                      </button>
                      <button
                        type="button"
                        onClick={() => handleKeypadAddCash(50000)}
                        className="py-1 px-1 bg-indigo-100 hover:bg-indigo-200 active:scale-95 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-950 dark:text-indigo-200 rounded-lg border border-indigo-300 dark:border-indigo-700 cursor-pointer text-center"
                      >
                        +50.000
                      </button>
                      <button
                        type="button"
                        onClick={() => handleKeypadAddCash(100000)}
                        className="col-span-2 py-1 px-1 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-lg cursor-pointer font-black text-center shadow-xs"
                      >
                        +100.000 Kz
                      </button>
                    </div>
                  </div>

                  {/* Ergonomic Keypad Grid - High Contrast */}
                  <div className="grid grid-cols-4 gap-1.5 text-base font-black">
                    <button type="button" onClick={() => handleKeypadDigit('7')} className="py-2 bg-slate-200 hover:bg-slate-300 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-950 dark:text-white rounded-xl cursor-pointer font-black text-lg">7</button>
                    <button type="button" onClick={() => handleKeypadDigit('8')} className="py-2 bg-slate-200 hover:bg-slate-300 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-950 dark:text-white rounded-xl cursor-pointer font-black text-lg">8</button>
                    <button type="button" onClick={() => handleKeypadDigit('9')} className="py-2 bg-slate-200 hover:bg-slate-300 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-950 dark:text-white rounded-xl cursor-pointer font-black text-lg">9</button>
                    <button
                      type="button"
                      onClick={() => setKeypadCurrentInput(prev => prev.slice(0, -1))}
                      className="py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white border border-amber-600 rounded-xl flex items-center justify-center cursor-pointer font-bold text-base shadow-xs"
                      title="Apagar dígito"
                    >
                      ⌫
                    </button>

                    <button type="button" onClick={() => handleKeypadDigit('4')} className="py-2 bg-slate-200 hover:bg-slate-300 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-950 dark:text-white rounded-xl cursor-pointer font-black text-lg">4</button>
                    <button type="button" onClick={() => handleKeypadDigit('5')} className="py-2 bg-slate-200 hover:bg-slate-300 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-950 dark:text-white rounded-xl cursor-pointer font-black text-lg">5</button>
                    <button type="button" onClick={() => handleKeypadDigit('6')} className="py-2 bg-slate-200 hover:bg-slate-300 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-950 dark:text-white rounded-xl cursor-pointer font-black text-lg">6</button>
                    <button
                      type="button"
                      onClick={handleKeypadSubtractCurrent}
                      className="py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl font-black text-xl flex items-center justify-center cursor-pointer shadow-xs border border-rose-700"
                      title="Subtrair valor digitado do total de caixa"
                    >
                      −
                    </button>

                    <button type="button" onClick={() => handleKeypadDigit('1')} className="py-2 bg-slate-200 hover:bg-slate-300 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-950 dark:text-white rounded-xl cursor-pointer font-black text-lg">1</button>
                    <button type="button" onClick={() => handleKeypadDigit('2')} className="py-2 bg-slate-200 hover:bg-slate-300 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-950 dark:text-white rounded-xl cursor-pointer font-black text-lg">2</button>
                    <button type="button" onClick={() => handleKeypadDigit('3')} className="py-2 bg-slate-200 hover:bg-slate-300 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-950 dark:text-white rounded-xl cursor-pointer font-black text-lg">3</button>
                    <button
                      type="button"
                      onClick={handleKeypadAddCurrent}
                      className="row-span-2 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-black text-2xl flex items-center justify-center shadow-xs cursor-pointer border border-emerald-700"
                      title="Somar valor digitado ao total de caixa"
                    >
                      +
                    </button>

                    <button type="button" onClick={() => handleKeypadDigit('0')} className="py-2 bg-slate-200 hover:bg-slate-300 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-950 dark:text-white rounded-xl cursor-pointer font-black text-lg">0</button>
                    <button type="button" onClick={() => handleKeypadDigit('00')} className="py-2 bg-slate-200 hover:bg-slate-300 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-950 dark:text-white rounded-xl cursor-pointer font-bold text-sm">00</button>
                    <button type="button" onClick={() => handleKeypadDigit('000')} className="py-2 bg-slate-200 hover:bg-slate-300 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-950 dark:text-white rounded-xl text-xs font-black cursor-pointer">000</button>
                  </div>
                </div>
              )}

              {/* TAB 3: BLOCO DE NOTAS FINANCEIRAS */}
              {activeTab === 'notes' && (
                <div className="flex-1 flex flex-col p-3 space-y-2.5 overflow-hidden">
                  {/* Top Bar: Search & New Note Button */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Pesquisar notas financeiras..."
                        value={notesSearch}
                        onChange={e => setNotesSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-950 dark:text-white font-medium focus:outline-hidden"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleStartNewNote}
                      className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-1 cursor-pointer shrink-0 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nova Nota</span>
                    </button>
                  </div>

                  {/* Notes Horizontal List / Tabs */}
                  <div className="flex space-x-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none">
                    {filteredNotes.map(n => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => {
                          setActiveNoteId(n.id);
                          setIsCreatingNote(false);
                        }}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer border ${
                          activeNoteId === n.id && !isCreatingNote
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {n.title || 'Sem Título'}
                      </button>
                    ))}
                  </div>

                  {/* Active Note Editor */}
                  <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 p-2.5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 space-y-2 overflow-hidden">
                    <div className="flex items-center space-x-2 shrink-0">
                      <input
                        type="text"
                        placeholder="Título da nota (Ex: Compras Kero, Pagamentos...)"
                        value={noteTitle}
                        onChange={e => setNoteTitle(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-850 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-black text-slate-950 dark:text-white focus:outline-hidden"
                      />
                      <select
                        value={noteTag}
                        onChange={e => setNoteTag(e.target.value)}
                        className="px-2 py-1.5 bg-white dark:bg-slate-850 border border-slate-300 dark:border-slate-700 rounded-lg text-[11px] font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
                      >
                        <option value="Geral">Geral</option>
                        <option value="Compras">Compras</option>
                        <option value="Pagamentos">Pagamentos</option>
                        <option value="Dívidas">Dívidas</option>
                        <option value="Metas">Metas</option>
                        <option value="Investimentos">Investimentos</option>
                      </select>
                    </div>

                    {/* Quick Snippets Bar */}
                    <div className="flex items-center space-x-1 text-[10px] shrink-0 overflow-x-auto pb-0.5 scrollbar-none font-bold">
                      <span className="text-slate-400">Inserir:</span>
                      <button
                        type="button"
                        onClick={() => insertSnippet(`- [ ] Item (0 Kz) - ${new Date().toLocaleDateString('pt-AO')}`)}
                        className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-md cursor-pointer whitespace-nowrap"
                      >
                        + Item Lista
                      </button>
                      <button
                        type="button"
                        onClick={() => insertSnippet(`Data: ${new Date().toLocaleDateString('pt-AO')}`)}
                        className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-md cursor-pointer whitespace-nowrap"
                      >
                        + Data
                      </button>
                      <button
                        type="button"
                        onClick={() => insertSnippet(`Total Previsto: ${calcDisplay} Kz`)}
                        className="px-2 py-0.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-950 text-blue-800 dark:text-blue-200 rounded-md cursor-pointer whitespace-nowrap"
                      >
                        + Valor Calculadora ({calcDisplay} Kz)
                      </button>
                    </div>

                    <textarea
                      placeholder="Escreva as suas notas financeiras, listas de compras, contas familiares ou orçamentos aqui..."
                      value={noteContent}
                      onChange={e => setNoteContent(e.target.value)}
                      className="flex-1 w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-950 dark:text-white leading-relaxed font-mono resize-none focus:outline-hidden"
                    />

                    {/* Note Action Buttons */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800 text-xs shrink-0">
                      <div className="flex items-center space-x-1">
                        {activeNoteId && !isCreatingNote && (
                          <button
                            type="button"
                            onClick={() => handleDeleteNote(activeNoteId)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                            title="Eliminar esta nota"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={copyNoteContent}
                          className="flex items-center space-x-1 px-2 py-1 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-[11px] font-bold cursor-pointer"
                        >
                          {noteCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          <span>{noteCopied ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveCurrentNote}
                        disabled={!noteTitle.trim()}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {noteSavedFeedback ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                        <span>{noteSavedFeedback ? 'Guardada!' : 'Guardar Nota'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}
    </>
  );
};
