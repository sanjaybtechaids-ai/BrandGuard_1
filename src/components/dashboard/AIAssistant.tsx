'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useToast } from '../common/ToastProvider';

export function AIAssistant() {
  const [query, setQuery] = useState('');
  const toast = useToast();

  const quickPrompts = [
    {
      text: 'Show me high-risk impersonators',
      action: () => toast.info('AI Filter Applied', 'Filtering down to 3 Critical impersonators (Nike Official Store, Nike Support, Nike Shop Pro).'),
    },
    {
      text: 'Generate a protection report for Nike',
      action: () => toast.success('Report Ready', 'Drafted Q3 Nike Brand Protection Briefing in Reports.'),
    },
    {
      text: 'What actions should we take next?',
      action: () => toast.info('Recommended Actions', '1. Dispatch DMCA takedown to Google Play for com.xyzapps.nikestore.vip.\n2. Flag @nike_support on Instagram.'),
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    toast.success('BrandGuard AI Analysis', `Evaluating threat inquiry: "${query}" across brand identity vector baseline.`);
    setQuery('');
  };

  return (
    <div className="apple-card p-6 bg-white dark:bg-slate-900 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-[#007AFF] dark:text-blue-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              AI Assistant
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-[#007AFF] dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
            Beta
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
          Get insights and recommendations for brand protection.
        </p>

        {/* Quick action prompt pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {quickPrompts.map((p) => (
            <button
              key={p.text}
              type="button"
              onClick={p.action}
              className="text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 transition-colors text-left"
            >
              {p.text}
            </button>
          ))}
        </div>
      </div>

      {/* Input box with send button */}
      <form onSubmit={handleSubmit} className="relative mt-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything about brand threats..."
          className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] transition-all"
        />
        <button
          type="submit"
          className="w-7 h-7 rounded-lg bg-[#007AFF] hover:bg-[#0066D6] text-white flex items-center justify-center absolute right-1.5 top-1/2 -translate-y-1/2 transition-colors shadow-2xs"
          aria-label="Send prompt"
        >
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </form>
    </div>
  );
}
