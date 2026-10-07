'use client';

import React from 'react';
import { LayoutGrid, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Brand } from '@/types/brand';
import { Threat } from '@/types/threat';

interface RiskStatsProps {
  brand?: Brand | null;
  threats?: Threat[];
}

export function RiskStats({ brand, threats = [] }: RiskStatsProps) {
  const brandThreats = threats;

  const highCount = brandThreats.filter(
    (t) => t.riskLevel === 'Critical' || t.riskLevel === 'High'
  ).length;
  const mediumCount = brandThreats.filter((t) => t.riskLevel === 'Medium').length;
  const lowCount = brandThreats.filter((t) => t.riskLevel === 'Low').length;
  const verifiedAssets = (brand?.officialApps?.length || 0) + (brand?.officialSocials?.length || 0);

  const cards = [
    {
      id: 'total',
      value: brandThreats.length,
      label: brand ? `${brand.name} Threats Found` : 'Total Issues Found',
      change: brandThreats.length > 0 ? `${brandThreats.length} active candidates` : 'All clear',
      isChangePositive: brandThreats.length === 0,
      icon: LayoutGrid,
      iconBg: 'bg-blue-50 text-[#007AFF] dark:bg-blue-950/60 dark:text-blue-400 border border-blue-100 dark:border-blue-900/60',
      bars: brandThreats.length > 0 ? [30, 45, 60, 40, 75, 55, 90] : [10, 10, 10, 10, 10, 10, 10],
      barColor: 'bg-[#007AFF]',
    },
    {
      id: 'high',
      value: highCount,
      label: 'Critical / High Risk',
      note: highCount > 0 ? 'Needs immediate action' : 'Zero critical threats',
      icon: AlertTriangle,
      iconBg: 'bg-red-50 text-red-500 dark:bg-red-950/60 dark:text-red-400 border border-red-100 dark:border-red-900/60',
      bars: highCount > 0 ? [40, 60, 30, 80, 50, 70, 85] : [5, 5, 5, 5, 5, 5, 5],
      barColor: 'bg-red-500',
    },
    {
      id: 'medium',
      value: mediumCount,
      label: 'Medium Risk',
      note: mediumCount > 0 ? 'Monitor closely' : 'No medium risks',
      icon: AlertCircle,
      iconBg: 'bg-amber-50 text-amber-500 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-100 dark:border-amber-900/60',
      bars: mediumCount > 0 ? [30, 50, 45, 65, 55, 75, 60] : [5, 5, 5, 5, 5, 5, 5],
      barColor: 'bg-amber-500',
    },
    {
      id: 'low',
      value: lowCount + verifiedAssets,
      label: 'Verified & Low Risk',
      note: verifiedAssets > 0 ? `${verifiedAssets} verified assets` : 'Baseline protected',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/60',
      bars: [25, 40, 60, 55, 70, 85, 95],
      barColor: 'bg-emerald-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="apple-card p-5 sm:p-6 bg-white dark:bg-slate-900 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${card.iconBg}`}
              >
                <Icon className="w-6 h-6 stroke-[2]" />
              </div>

              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {card.value}
                </span>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  {card.label}
                </p>

                {card.change && (
                  <span
                    className={`text-[11px] font-semibold mt-1 block ${
                      card.isChangePositive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {card.change}
                  </span>
                )}

                {card.note && (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5 block">
                    {card.note}
                  </span>
                )}
              </div>
            </div>

            {/* Sparkline Visual */}
            <div className="hidden sm:flex items-end gap-1 h-8 opacity-70">
              {card.bars.map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full ${card.barColor} transition-all duration-500`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
