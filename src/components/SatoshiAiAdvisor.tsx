import React, { useState } from 'react';
import { Bot, Send, Sparkles, Cpu, ShieldCheck, Loader2, ArrowRight } from 'lucide-react';
import { GameState } from '../types';

interface SatoshiAiAdvisorProps {
  gameState: GameState;
  totalHashRate: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const SatoshiAiAdvisor: React.FC<SatoshiAiAdvisorProps> = ({ gameState, totalHashRate }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Greetings miner. I am Satoshi AI, your neural mining strategist and blockchain oracle. Ask me anything about optimizing your hash rate, selecting pools, cracking lost wallets, or sweeping dormant accounts!'
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMsg,
          gameState: {
            ...gameState,
            totalHashRate
          }
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.advice }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: `[AI Error]: ${data.error || 'Failed to fetch advice. Please check your GEMINI_API_KEY in settings.'}` }]);
      }
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `[Network Error]: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'How can I maximize my hash rate efficiently?',
    'Which dormant account should I sweep next?',
    'What is the best overclocking strategy for ASICs?',
    'Analyze my current portfolio and balance.'
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Satoshi AI Strategist & Oracle
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Gemini 2.5 Flash
                </span>
              </h2>
              <p className="text-xs text-zinc-400">Powered by advanced neural models and real-time blockchain telemetry</p>
            </div>
          </div>
        </div>

        {/* Chat log */}
        <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 no-scrollbar">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs font-mono leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-emerald-500 text-zinc-950 font-medium'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-200'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 items-center text-zinc-400 text-xs font-mono">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <span>Satoshi AI is analyzing your rig telemetry...</span>
            </div>
          )}
        </div>

        {/* Quick prompt pills */}
        <div className="flex flex-wrap gap-2 pt-2">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInput(qp);
              }}
              className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-[11px] text-zinc-400 hover:text-white transition-all font-mono flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-emerald-400" />
              {qp}
            </button>
          ))}
        </div>

        {/* Input form */}
        <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-zinc-800">
          <input
            type="text"
            placeholder="Ask Satoshi AI for mining, pooling, or recovery advice..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
