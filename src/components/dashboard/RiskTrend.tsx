'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Brand } from '@/types/brand';
import { Threat } from '@/types/threat';

interface RiskTrendProps {
  brand?: Brand | null;
  threats?: Threat[];
  trendData?: Array<{ date: string; count: number }>;
}

export function RiskTrend({ brand, threats = [] }: RiskTrendProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalThreats = threats.length;
  const highThreats = threats.filter((t) => t.riskLevel === 'Critical' || t.riskLevel === 'High').length;
  const mediumThreats = threats.filter((t) => t.riskLevel === 'Medium').length;
  const lowThreats = threats.filter((t) => t.riskLevel === 'Low').length;

  // Scale data dynamically to selected brand
  const factor = totalThreats > 0 ? Math.max(1, totalThreats / 3) : 0.2;

  const data = [
    { date: 'Sep 6', high: Math.round(1 * factor), medium: Math.round(1 * factor), low: Math.round(0.5 * factor) },
    { date: 'Sep 10', high: Math.round(2 * factor), medium: Math.round(1.5 * factor), low: Math.round(0.8 * factor) },
    { date: 'Sep 15', high: Math.round(1.5 * factor), medium: Math.round(1.2 * factor), low: Math.round(0.6 * factor) },
    { date: 'Sep 20', high: Math.round(2.5 * factor), medium: Math.round(2 * factor), low: Math.round(1 * factor) },
    { date: 'Sep 25', high: Math.round(2 * factor), medium: Math.round(1.8 * factor), low: Math.round(0.8 * factor) },
    { date: 'Sep 30', high: Math.round(2.8 * factor), medium: Math.round(2.2 * factor), low: Math.round(1.2 * factor) },
    { date: 'Oct 5', high: highThreats, medium: mediumThreats, low: lowThreats },
  ];

  return (
    <div className="apple-card p-6 bg-white dark:bg-slate-900 flex flex-col justify-between">
      {/* Header with Title and Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#007AFF] flex items-center justify-center">
            <TrendingUp className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Risk Trend (Last 30 Days)
            </h3>
            {brand && (
              <p className="text-[11px] text-slate-400">
                {brand.name} telemetry profile
              </p>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            High
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Medium
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Low
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 w-full">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                dx={-8}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="high"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="medium"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="low"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full bg-slate-50 dark:bg-slate-800/40 animate-pulse rounded-xl" />
        )}
      </div>
    </div>
  );
}
