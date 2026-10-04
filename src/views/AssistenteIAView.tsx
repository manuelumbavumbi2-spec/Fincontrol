import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  ArrowRight,
  TrendingDown,
  PieChart,
  Wallet
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AssistenteIAView: React.FC = () => {
  const { user } = useAuth();
  const { settings } = useFinance();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: `Olá, ${user?.name ? user.name.split(' ')[0] : 'Manuel'}! Sou o seu **Assistente Financeiro Inteligente** do FinControl Angola. Analiso em tempo real todas as suas receitas, despesas, orçamento, poupanças, investimentos e dívidas para lhe dar respostas precisas. Como posso ajudar as suas finanças hoje?`,
      timestamp: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Quanto gastei este mês?',
    'Quanto gastei com alimentação?',
    'Quanto poupei?',
    'Quanto investi?',
    'Quanto devo?',
    'Quanto tenho disponível?',
    'Qual foi a minha maior despesa?',
    'Quanto preciso poupar por mês para chegar a 1.000.000 Kz?',
    'Posso gastar 50.000 Kz este mês?',
    'Como estão as minhas finanças?',
    'Onde estou a gastar mais?',
    'Quanto cresceu o meu património?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (questionText?: string) => {
    const q = (questionText || input).trim();
    if (!q || loading) return;

    const userMsg: Message = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.askAI(q);
      const assistantMsg: Message = {
        id: 'ai_' + Date.now(),
        sender: 'assistant',
        text: res.answer,
        timestamp: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: 'ai_err_' + Date.now(),
          sender: 'assistant',
          text: 'Pedimos desculpa, ocorreu uma falha ao consultar os dados financeiros. Por favor tente novamente.',
          timestamp: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[500px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              Assistente Financeiro IA
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                Online • Dados Reais
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Respostas analíticas baseadas exclusivamente nos seus registos contábeis</p>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map(msg => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-violet-600 text-white shadow-xs'
                }`}
              >
                {isUser ? 'EU' : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-xs whitespace-pre-wrap'
                }`}
              >
                {msg.text}
                <span
                  className={`block text-[10px] mt-1 text-right ${
                    isUser ? 'text-blue-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs pl-11">
            <span className="w-2 h-2 rounded-full bg-violet-600 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-violet-600 animate-bounce delay-100" />
            <span className="w-2 h-2 rounded-full bg-violet-600 animate-bounce delay-200" />
            <span className="italic ml-2">A analisar dados financeiros...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 bg-slate-50/80 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 overflow-x-auto flex gap-1.5 scrollbar-none">
        {quickPrompts.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(chip)}
            className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium whitespace-nowrap hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer shrink-0"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input box */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Pergunte sobre despesas, alimentação, poupança, dívidas ou património..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-violet-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-2xl transition-colors shadow-md cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
