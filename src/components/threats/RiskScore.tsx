import React from 'react';
import { StatusBadge } from '../common/StatusBadge';
import { AlertOctagon, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface RiskScoreProps {
  score: number;
  level: 'Critical' | 'High' | 'Medium' | 'Low';
}

export function RiskScore({ score, level }: RiskScoreProps) {
  // SVG circular meter stroke calculation
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 85) return { stroke: '#ef4444', text: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10' };
    if (score >= 70) return { stroke: '#f97316', text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10' };
    if (score >= 50) return { stroke: '#f59e0b', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' };
    return { stroke: '#10b981', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' };
  };

  const theme = getColor();

  return (
    <div className="apple-card p-6 flex flex-col items-center justify-center text-center">
      <div className="relative w-32 h-32 flex items-center justify-center mb-3">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="stroke-slate-100"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={theme.stroke}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold tracking-tight ${theme.text}`}>
            {score}
          </span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            / 100
          </span>
        </div>
      </div>

      <div className="mt-1 flex flex-col items-center gap-1.5">
        <StatusBadge status={level} size="lg" />
        <p className="text-xs text-slate-500 max-w-[200px] mt-1 leading-relaxed font-normal">
          Aggregated Brand Impersonation Risk Score based on multi-vector signature analysis
        </p>
      </div>
    </div>
  );
}
