import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  change: string;
  isPositive?: boolean;
  icon: LucideIcon;
  note?: string;
  accentColor?: 'blue' | 'red' | 'amber' | 'emerald';
}

export function StatCard({
  label,
  value,
  change,
  isPositive = true,
  icon: Icon,
  note,
  accentColor = 'blue',
}: StatCardProps) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border-blue-100 dark:border-blue-900/50',
    red: 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 border-red-100 dark:border-red-900/50',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border-amber-100 dark:border-amber-900/50',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50',
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 shadow-xs hover:shadow-md transition-all group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5 tracking-tight">
            {value}
          </h3>
        </div>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-105 ${colorMap[accentColor]}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          {isPositive ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
          )}
          <span
            className={`font-semibold ${
              isPositive
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {change}
          </span>
        </div>
        {note && (
          <span className="text-[11px] text-slate-400 truncate max-w-[150px]">{note}</span>
        )}
      </div>
    </div>
  );
}
