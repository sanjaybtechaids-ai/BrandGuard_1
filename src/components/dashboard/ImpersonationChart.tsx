'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieIcon, ShieldCheck } from 'lucide-react';
import { Brand } from '@/types/brand';
import { Threat } from '@/types/threat';

interface ImpersonationChartProps {
  brand?: Brand | null;
  threats?: Threat[];
}

export function ImpersonationChart({ brand, threats = [] }: ImpersonationChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter threats for the specific brand
  const brandThreats = useMemo(() => {
    if (!brand) return threats;
    const brandIdLower = brand.id?.toLowerCase() || '';
    const brandNameLower = brand.name?.toLowerCase() || '';

    return threats.filter((t) => {
      const tBrandId = t.brandId?.toLowerCase() || '';
      const tBrandName = t.brandName?.toLowerCase() || '';
      return (
        tBrandId === brandIdLower ||
        tBrandName === brandNameLower ||
        t.name?.toLowerCase().includes(brandNameLower)
      );
    });
  }, [brand, threats]);

  const { data, total } = useMemo(() => {
    let fakeApps = 0;
    let fakeSocials = 0;
    let phishingWeb = 0;
    let fakeReviews = 0;
    let others = 0;

    brandThreats.forEach((t) => {
      const type = ((t as any).threatType || t.type || t.backendType || '').toUpperCase();
      const plat = (t.platform || '').toLowerCase();

      if (type === 'APP_CLONE' || plat.includes('play') || plat.includes('app') || plat.includes('apk')) {
        fakeApps++;
      } else if (
        type === 'SOCIAL_IMPERSONATION' ||
        plat.includes('instagram') ||
        plat.includes('x') ||
        plat.includes('twitter') ||
        plat.includes('social')
      ) {
        fakeSocials++;
      } else if (
        type === 'DOMAIN_TYPOSQUAT' ||
        plat.includes('web') ||
        plat.includes('domain') ||
        plat.includes('site')
      ) {
        phishingWeb++;
      } else if (type === 'IMPERSONATION' || type === 'BRAND_IMPERSONATION') {
        fakeReviews++;
      } else {
        others++;
      }
    });

    const sum = fakeApps + fakeSocials + phishingWeb + fakeReviews + others;

    if (sum === 0) {
      return {
        total: 0,
        data: [
          { name: 'Fake Apps', count: 0, value: 0, color: '#007AFF' },
          { name: 'Fake Social Accounts', count: 0, value: 0, color: '#FF9500' },
          { name: 'Phishing Websites', count: 0, value: 0, color: '#FF3B30' },
          { name: 'Brand Infringement', count: 0, value: 0, color: '#AF52DE' },
          { name: 'Others', count: 0, value: 0, color: '#34C759' },
        ],
      };
    }

    return {
      total: sum,
      data: [
        { name: 'Fake Apps', count: fakeApps, value: Math.round((fakeApps / sum) * 100), color: '#007AFF' },
        { name: 'Fake Social Accounts', count: fakeSocials, value: Math.round((fakeSocials / sum) * 100), color: '#FF9500' },
        { name: 'Phishing Websites', count: phishingWeb, value: Math.round((phishingWeb / sum) * 100), color: '#FF3B30' },
        { name: 'Brand Infringement', count: fakeReviews, value: Math.round((fakeReviews / sum) * 100), color: '#AF52DE' },
        { name: 'Others', count: others, value: Math.round((others / sum) * 100), color: '#34C759' },
      ].filter((item) => item.count > 0 || sum === 0),
    };
  }, [brandThreats]);

  return (
    <div className="apple-card p-6 bg-white dark:bg-slate-900 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#007AFF] flex items-center justify-center">
            <PieIcon className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Detected Impersonation Types
            </h3>
            {brand && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Scoped to <span className="font-semibold text-slate-800 dark:text-slate-200">{brand.name}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Donut and Legend */}
      {total === 0 ? (
        <div className="h-56 flex flex-col items-center justify-center text-center p-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6 stroke-[2]" />
          </div>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            No Active Impersonations Detected
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">
            {brand ? `${brand.name} is currently clean.` : 'Protected telemetry active.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 h-56">
          {/* Donut with center text */}
          <div className="relative w-40 h-40 shrink-0">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Share']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '10px',
                      borderColor: '#e2e8f0',
                      fontSize: '11px',
                    }}
                  />
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full rounded-full border-4 border-slate-100 animate-pulse" />
            )}

            {/* Center counter */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-slate-900 dark:text-white leading-none">
                {total}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                Total
              </span>
            </div>
          </div>

          {/* Legend List */}
          <div className="flex-1 space-y-2 text-xs w-full max-w-xs pl-2">
            {data.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-600 dark:text-slate-300 font-medium truncate">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="text-slate-400 text-[10px]">({item.count})</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {item.value}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
