'use client';

import React from 'react';
import { Smartphone, Share2, Activity } from 'lucide-react';
import { Brand } from '@/types/brand';

export interface DerivedBrandStats {
  threats: number;
  criticalThreats: number;
  highThreats: number;
  mediumThreats: number;
  apps: number;
  socialAccounts: number;
  riskScore: number;
}

interface BrandStatsProps {
  brand: Brand;
  stats: DerivedBrandStats;
  onThreatClick?: () => void;
  className?: string;
}

export function BrandStats({
  brand,
  stats,
  onThreatClick,
  className = '',
}: BrandStatsProps) {
  const hasHighRisk = stats.criticalThreats > 0 || stats.highThreats > 0;
  const hasMediumOnly = !hasHighRisk && stats.mediumThreats > 0;

  return (
    <div className={`flex flex-wrap items-center gap-2.5 sm:gap-3.5 ${className}`}>
      {/* Threat Status Pill (Interactive) */}
      <button
        type="button"
        onClick={onThreatClick}
        aria-label={`View threats for ${brand.name}`}
        className={`group inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-xs ${
          hasHighRisk
            ? 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/25 hover:bg-red-500/15 hover:border-red-500/40'
            : hasMediumOnly
            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25 hover:bg-amber-500/15'
            : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/15'
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              hasHighRisk ? 'bg-red-500' : hasMediumOnly ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              hasHighRisk ? 'bg-red-600' : hasMediumOnly ? 'bg-amber-600' : 'bg-emerald-600'
            }`}
          />
        </span>

        <span className="font-bold tracking-tight">
          {hasHighRisk
            ? `${stats.criticalThreats + stats.highThreats} High-Risk Threats`
            : hasMediumOnly
            ? `${stats.mediumThreats} Medium-Risk Threats`
            : 'No Active Threats'}
        </span>

        <span className="text-[11px] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
          ›
        </span>
      </button>

      {/* Official Apps Count */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-md text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold shadow-xs">
        <Smartphone className="w-3.5 h-3.5 text-[#007AFF] stroke-[2]" />
        <span>{stats.apps} Official Apps</span>
      </div>

      {/* Official Social Accounts Count */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-md text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold shadow-xs">
        <Share2 className="w-3.5 h-3.5 text-[#007AFF] stroke-[2]" />
        <span>{stats.socialAccounts} Social Accounts</span>
      </div>

      {/* Live Risk Score */}
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full backdrop-blur-md text-xs font-bold border shadow-xs ${
          stats.riskScore >= 70
            ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
            : stats.riskScore >= 40
            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
        }`}
      >
        <Activity className="w-3.5 h-3.5 stroke-[2.2]" />
        <span>Risk: {stats.riskScore} / 100</span>
      </div>
    </div>
  );
}
