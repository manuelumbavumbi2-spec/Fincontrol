import React, { useState, useEffect, useRef } from 'react';
import {
  Calculator,
  Keyboard,
  X,
  Minimize2,
  Maximize2,
  Copy,
  Check,
  RotateCcw,
  Percent,
  Delete,
  Clock,
  Sparkles,
  Banknote,
  Coins
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface CalcHistoryItem {
  id: string;
  expression: string;
  result: number;
  time: string;
}

export const FloatingCalculatorKeypad: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'calc' | 'keypad'>('calc');
  
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
      // Sanitize equation for safe math
      const sanitized = fullExpr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/[^0-9+\-*/().]/g, '');

      // Evaluate safely
      // eslint-disable-next-line no-eval
      const result = Function(`'use strict'; return (${sanitized})`)();
      const numResult = Number(result);
      if (isNaN(numResult) || !isFinite(numResult)) {
        setCalcDisplay('Erro');
        return;
      }

      const formattedResult = Number.isInteger(numResult) ? String(numResult) : numResult.toFixed(2);
      
      // Save history
      const historyItem: CalcHistoryItem = {
        id: String(Date.now()),
        expression: fullExpr,
        result: numResult,
        time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
      };
      setCalcHistory(prev => [historyItem, ...prev.slice(0, 9)]);

      setCalcDisplay(formattedResult);
      setCalcEquation('');
      setNewNumberExpected(true);
    } catch {
      setCalcDisplay('Erro');
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

  // Quick Angolan Financial Presets
  const applyPreset = (type: 'iva' | 'poupanca' | 'extra' | 'irt') => {
    const val = Number(calcDisplay) || 0;
    let res = 0;
    if (type === 'iva') {
      res = val * 1.14; // +14% IVA Angola
    } else if (type === 'poupanca') {
      res = val * 0.90; // -10% Poupança
    } else if (type === 'extra') {
      res = val * 1.10; // +10% Extra
    } else if (type === 'irt') {
      res = val * 0.85; // -15% IRT médio
    }
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
            className="flex items-center space-x-2 px-3.5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-105 transition-all cursor-pointer font-bold text-xs border border-white/20 backdrop-blur-md"
            title="Abrir Calculadora Financeira e Teclado Numérico"
          >
            <div className="flex items-center space-x-1">
              <Calculator className="w-4 h-4" />
              <Keyboard className="w-3.5 h-3.5 opacity-80" />
            </div>
            <span className="hidden sm:inline">Calculadora & Teclado</span>
          </button>
        )}
      </div>

      {/* 2. FLOATING CALCULATOR & KEYPAD WINDOW */}
      {isOpen && (
        <div className={`fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl transition-all duration-300 overflow-hidden flex flex-col ${
          isMinimized ? 'w-72 h-14' : 'w-[320px] sm:w-[360px] h-[520px]'
        }`}>
          {/* Header Bar */}
          <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between shrink-0">
            {/* Tabs */}
            <div className="flex items-center space-x-1 bg-slate-200/80 dark:bg-slate-950 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('calc');
                  setIsMinimized(false);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'calc'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Calculadora</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('keypad');
                  setIsMinimized(false);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'keypad'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span>Teclado</span>
              </button>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title={isMinimized ? 'Expandir' : 'Minimizar'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Window Body (when not minimized) */}
          {!isMinimized && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* TAB 1: CALCULADORA FINANCEIRA */}
              {activeTab === 'calc' && (
                <div className="flex-1 flex flex-col justify-between p-3.5 space-y-2.5">
                  {/* Display */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-right space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold min-h-[18px]">
                      <button
                        type="button"
                        onClick={() => setShowHistory(!showHistory)}
                        className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        <Clock className="w-3 h-3" />
                        <span>{showHistory ? 'Ocultar Histórico' : 'Histórico'}</span>
                      </button>
                      <span className="truncate max-w-[180px]">{calcEquation}</span>
                    </div>

                    <div className="flex items-baseline justify-end space-x-1">
                      <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white truncate">
                        {calcDisplay}
                      </span>
                      <span className="text-xs font-bold text-slate-400">Kz</span>
                    </div>
                  </div>

                  {/* History Tray Modal */}
                  {showHistory ? (
                    <div className="flex-1 overflow-y-auto space-y-1.5 p-2 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800 font-bold text-[11px] text-slate-500">
                        <span>Cálculos Recentes</span>
                        <button
                          type="button"
                          onClick={() => setCalcHistory([])}
                          className="text-rose-500 hover:underline"
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
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-100 dark:border-slate-800 cursor-pointer flex justify-between items-center"
                        >
                          <span className="text-slate-500 dark:text-slate-400 truncate max-w-[160px]">{item.expression}</span>
                          <span className="font-extrabold text-blue-600 dark:text-blue-400">{formatCurrency(item.result, 'Kz')}</span>
                        </div>
                      ))}
                      {calcHistory.length === 0 && (
                        <p className="text-center text-slate-400 py-6 text-xs">Nenhum cálculo no histórico.</p>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Quick Angolan Financial Presets */}
                      <div className="grid grid-cols-4 gap-1.5">
                        <button
                          type="button"
                          onClick={() => applyPreset('iva')}
                          className="py-1 px-1.5 text-[10px] font-bold bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800 transition-colors cursor-pointer text-center"
                          title="Acrescentar 14% de IVA de Angola"
                        >
                          +14% IVA
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPreset('poupanca')}
                          className="py-1 px-1.5 text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer text-center"
                          title="Separar 10% para poupança"
                        >
                          -10% Poup.
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPreset('extra')}
                          className="py-1 px-1.5 text-[10px] font-bold bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer text-center"
                        >
                          +10% Extra
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPreset('irt')}
                          className="py-1 px-1.5 text-[10px] font-bold bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 rounded-lg border border-purple-200 dark:border-purple-800 transition-colors cursor-pointer text-center"
                          title="Descontar 15% IRT"
                        >
                          -15% IRT
                        </button>
                      </div>

                      {/* Calculator Buttons Grid */}
                      <div className="grid grid-cols-4 gap-1.5 text-sm font-bold">
                        <button
                          type="button"
                          onClick={handleCalcClear}
                          className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-400 rounded-xl transition-colors cursor-pointer"
                        >
                          C
                        </button>
                        <button
                          type="button"
                          onClick={handleCalcToggleSign}
                          className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors cursor-pointer"
                        >
                          ±
                        </button>
                        <button
                          type="button"
                          onClick={handleCalcBackspace}
                          className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                        >
                          ⌫
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCalcOperator('÷')}
                          className="py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 rounded-xl transition-colors cursor-pointer text-base"
                        >
                          ÷
                        </button>

                        {/* Digits 7, 8, 9, x */}
                        <button type="button" onClick={() => handleCalcDigit('7')} className="py-2.5 bg-white hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl transition-colors cursor-pointer">7</button>
                        <button type="button" onClick={() => handleCalcDigit('8')} className="py-2.5 bg-white hover:bg-slate-100 dark:bg-slate-855 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl transition-colors cursor-pointer">8</button>
                        <button type="button" onClick={() => handleCalcDigit('9')} className="py-2.5 bg-white hover:bg-slate-100 dark:bg-slate-855 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl transition-colors cursor-pointer">9</button>
                        <button
                          type="button"
                          onClick={() => handleCalcOperator('×')}
                          className="py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 rounded-xl transition-colors cursor-pointer text-base"
                        >
                          ×
                        </button>

                        {/* Digits 4, 5, 6, - */}
                        <button type="button" onClick={() => handleCalcDigit('4')} className="py-2.5 bg-white hover:bg-slate-100 dark:bg-slate-855 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl transition-colors cursor-pointer">4</button>
                        <button type="button" onClick={() => handleCalcDigit('5')} className="py-2.5 bg-white hover:bg-slate-100 dark:bg-slate-855 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl transition-colors cursor-pointer">5</button>
                        <button type="button" onClick={() => handleCalcDigit('6')} className="py-2.5 bg-white hover:bg-slate-100 dark:bg-slate-855 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl transition-colors cursor-pointer">6</button>
                        <button
                          type="button"
                          onClick={() => handleCalcOperator('-')}
                          className="py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 rounded-xl transition-colors cursor-pointer text-base"
                        >
                          -
                        </button>

                        {/* Digits 1, 2, 3, + */}
                        <button type="button" onClick={() => handleCalcDigit('1')} className="py-2.5 bg-white hover:bg-slate-100 dark:bg-slate-855 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl transition-colors cursor-pointer">1</button>
                        <button type="button" onClick={() => handleCalcDigit('2')} className="py-2.5 bg-white hover:bg-slate-100 dark:bg-slate-855 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl transition-colors cursor-pointer">2</button>
                        <button type="button" onClick={() => handleCalcDigit('3')} className="py-2.5 bg-white hover:bg-slate-100 dark:bg-slate-855 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl transition-colors cursor-pointer">3</button>
                        <button
                          type="button"
                          onClick={() => handleCalcOperator('+')}
                          className="py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 rounded-xl transition-colors cursor-pointer text-base"
                        >
                          +
                        </button>

                        {/* Digits 0, 00, ., = */}
                        <button type="button" onClick={() => handleCalcDigit('0')} className="py-2.5 bg-white hover:bg-slate-100 dark:bg-slate-855 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl transition-colors cursor-pointer">0</button>
                        <button type="button" onClick={() => handleCalcDigit('00')} className="py-2.5 bg-white hover:bg-slate-100 dark:bg-slate-855 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl transition-colors cursor-pointer">00</button>
                        <button type="button" onClick={handleCalcDecimal} className="py-2.5 bg-white hover:bg-slate-100 dark:bg-slate-855 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl transition-colors cursor-pointer">.</button>
                        <button
                          type="button"
                          onClick={handleCalcEqual}
                          className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer text-base font-black"
                        >
                          =
                        </button>
                      </div>
                    </>
                  )}

                  {/* Actions Footer */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400">
                      Calculadora Financeira Kz
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(calcDisplay)}
                      className="flex items-center space-x-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
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
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>Total Acumulado em Caixa:</span>
                      <button
                        type="button"
                        onClick={handleKeypadClear}
                        className="text-rose-500 hover:underline cursor-pointer"
                      >
                        Reiniciar
                      </button>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(keypadTotal, 'Kz')}
                      </span>

                      <button
                        type="button"
                        onClick={copyKeypadTotal}
                        className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800"
                      >
                        {keypadCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{keypadCopied ? 'Copiado!' : 'Copiar Total'}</span>
                      </button>
                    </div>

                    {/* Current Input bar */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500">Entrada Actual:</span>
                      <strong className="text-sm text-slate-900 dark:text-white">
                        {keypadCurrentInput ? `${formatCurrency(Number(keypadCurrentInput), 'Kz')}` : '0 Kz'}
                      </strong>
                    </div>
                  </div>

                  {/* Fast Kwanza Cash Denomination Buttons */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Notas & Valores Rápidos de Angola:
                    </span>
                    <div className="grid grid-cols-4 gap-1 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => handleKeypadAddCash(1000)}
                        className="py-1 px-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                      >
                        +1.000
                      </button>
                      <button
                        type="button"
                        onClick={() => handleKeypadAddCash(2000)}
                        className="py-1 px-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                      >
                        +2.000
                      </button>
                      <button
                        type="button"
                        onClick={() => handleKeypadAddCash(5000)}
                        className="py-1 px-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                      >
                        +5.000
                      </button>
                      <button
                        type="button"
                        onClick={() => handleKeypadAddCash(10000)}
                        className="py-1 px-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-lg transition-colors cursor-pointer border border-blue-200 dark:border-blue-800"
                      >
                        +10.000
                      </button>
                      <button
                        type="button"
                        onClick={() => handleKeypadAddCash(20000)}
                        className="py-1 px-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-lg transition-colors cursor-pointer border border-blue-200 dark:border-blue-800"
                      >
                        +20.000
                      </button>
                      <button
                        type="button"
                        onClick={() => handleKeypadAddCash(50000)}
                        className="py-1 px-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-lg transition-colors cursor-pointer border border-indigo-200 dark:border-indigo-800"
                      >
                        +50.000
                      </button>
                      <button
                        type="button"
                        onClick={() => handleKeypadAddCash(100000)}
                        className="col-span-2 py-1 px-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-lg transition-colors cursor-pointer border border-indigo-200 dark:border-indigo-800 font-extrabold"
                      >
                        +100.000 Kz
                      </button>
                    </div>
                  </div>

                  {/* Ergonomic Keypad Grid */}
                  <div className="grid grid-cols-4 gap-1.5 text-sm font-bold">
                    <button type="button" onClick={() => handleKeypadDigit('7')} className="py-2 bg-white hover:bg-slate-100 dark:bg-slate-855 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl cursor-pointer">7</button>
                    <button type="button" onClick={() => handleKeypadDigit('8')} className="py-2 bg-white hover:bg-slate-100 dark:bg-slate-855 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl cursor-pointer">8</button>
                    <button type="button" onClick={() => handleKeypadDigit('9')} className="py-2 bg-white hover:bg-slate-100 dark:bg-slate-855 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl cursor-pointer">9</button>
                    <button
                      type="button"
                      onClick={() => setKeypadCurrentInput(prev => prev.slice(0, -1))}
                      className="py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl flex items-center justify-center cursor-pointer"
                    >
                      ⌫
                    </button>

                    <button type="button" onClick={() => handleKeypadDigit('4')} className="py-2 bg-white hover:bg-slate-100 dark:bg-slate-855 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl cursor-pointer">4</button>
                    <button type="button" onClick={() => handleKeypadDigit('5')} className="py-2 bg-white hover:bg-slate-100 dark:bg-slate-855 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl cursor-pointer">5</button>
                    <button type="button" onClick={() => handleKeypadDigit('6')} className="py-2 bg-white hover:bg-slate-100 dark:bg-slate-855 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl cursor-pointer">6</button>
                    <button
                      type="button"
                      onClick={handleKeypadSubtractCurrent}
                      className="py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-xl font-black text-base cursor-pointer"
                      title="Subtrair valor digitado"
                    >
                      -
                    </button>

                    <button type="button" onClick={() => handleKeypadDigit('1')} className="py-2 bg-white hover:bg-slate-100 dark:bg-slate-855 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl cursor-pointer">1</button>
                    <button type="button" onClick={() => handleKeypadDigit('2')} className="py-2 bg-white hover:bg-slate-100 dark:bg-slate-855 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl cursor-pointer">2</button>
                    <button type="button" onClick={() => handleKeypadDigit('3')} className="py-2 bg-white hover:bg-slate-100 dark:bg-slate-855 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl cursor-pointer">3</button>
                    <button
                      type="button"
                      onClick={handleKeypadAddCurrent}
                      className="row-span-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xl flex items-center justify-center shadow-xs cursor-pointer"
                      title="Somar valor digitado"
                    >
                      +
                    </button>

                    <button type="button" onClick={() => handleKeypadDigit('0')} className="py-2 bg-white hover:bg-slate-100 dark:bg-slate-855 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl cursor-pointer">0</button>
                    <button type="button" onClick={() => handleKeypadDigit('00')} className="py-2 bg-white hover:bg-slate-100 dark:bg-slate-855 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl cursor-pointer">00</button>
                    <button type="button" onClick={() => handleKeypadDigit('000')} className="py-2 bg-white hover:bg-slate-100 dark:bg-slate-855 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-black cursor-pointer">000</button>
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
