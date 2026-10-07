'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { threatTrends7Days, threatTrends30Days, threatTrends90Days } from '@/data/dashboard';
import { ShieldAlert, TrendingUp } from 'lucide-react';

export function ThreatChart() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getData = () => {
    switch (timeRange) {
      case '30d':
        return threatTrends30Days;
      case '90d':
        return threatTrends90Days;
      case '7d':
      default:
        return threatTrends7Days;
    }
  };

  const data = getData();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Threat Overview
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-900 font-medium">
              Detection Dynamics
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Impersonation and phishing threats discovered across mobile & social channels
          </p>
        </div>

        {/* Time Filter Controls */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-700/60 self-start sm:self-auto text-xs font-medium">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              timeRange === '7d'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Last 7 days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              timeRange === '30d'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            30 days
          </button>
          <button
            onClick={() => setTimeRange('90d')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              timeRange === '90d'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            90 days
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#94a3b8"
                opacity={0.15}
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                }}
                labelStyle={{ fontWeight: 'bold', color: '#93c5fd' }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }}
                iconType="circle"
              />
              <Area
                type="monotone"
                dataKey="critical"
                name="Critical"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCritical)"
              />
              <Area
                type="monotone"
                dataKey="high"
                name="High"
                stroke="#f97316"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorHigh)"
              />
              <Area
                type="monotone"
                dataKey="medium"
                name="Medium"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorMedium)"
              />
              <Area
                type="monotone"
                dataKey="low"
                name="Low"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorLow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            Rendering chart metrics...
          </div>
        )}
      </div>
    </div>
  );
}
