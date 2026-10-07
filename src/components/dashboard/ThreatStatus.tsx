import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ChevronRight } from 'lucide-react';

interface ThreatStatusProps {
  criticalCount?: number;
}

export function ThreatStatus({ criticalCount = 3 }: ThreatStatusProps) {
  return (
    <Link
      href="/threats"
      className="apple-card p-6 flex items-start gap-4 bg-gradient-to-br from-[#FFF5F5] to-[#FFF1F2] dark:from-red-950/20 dark:to-red-900/10 border border-red-100/90 dark:border-red-900/30 hover:border-red-200 transition-all group"
    >
      <div className="w-12 h-12 rounded-2xl bg-red-500/10 dark:bg-red-500/20 text-red-500 flex items-center justify-center shrink-0 border border-red-500/20 group-hover:scale-105 transition-transform">
        <ShieldAlert className="w-6 h-6 stroke-[2]" />
      </div>

      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
          Threat Status
        </span>
        <div className="flex items-center gap-1 text-sm sm:text-base font-extrabold text-red-600 dark:text-red-400 tracking-tight">
          <span>{criticalCount} High-Risk Impersonators Found</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          Take action to protect your brand
        </p>
      </div>
    </Link>
  );
}
