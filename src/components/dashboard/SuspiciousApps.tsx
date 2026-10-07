'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Smartphone, ChevronRight, ShieldCheck, Flag } from 'lucide-react';
import { MonitoredApp } from '@/types/app';
import { Brand } from '@/types/brand';
import { monitoredApps as fallbackApps } from '@/data/apps';

interface SuspiciousAppsProps {
  brand?: Brand | null;
  apps?: MonitoredApp[];
}

export function SuspiciousApps({ brand, apps }: SuspiciousAppsProps) {
  const [appsList, setAppsList] = useState<MonitoredApp[]>(() => {
    if (apps) return apps.filter((a) => !a.isOfficial || a.verificationStatus === 'SUSPICIOUS');
    if (brand) {
      const bId = brand.id.toLowerCase();
      const bName = brand.name.toLowerCase();
      return fallbackApps.filter(
        (a) =>
          (!a.isOfficial || a.verificationStatus === 'SUSPICIOUS') &&
          (a.brandId.toLowerCase() === bId || a.brandName.toLowerCase() === bName)
      );
    }
    return fallbackApps.filter((a) => !a.isOfficial || a.verificationStatus === 'SUSPICIOUS');
  });

  useEffect(() => {
    if (apps) {
      setAppsList(apps.filter((a) => !a.isOfficial || a.verificationStatus === 'SUSPICIOUS'));
      return;
    }

    const currentBrand = brand;
    if (!currentBrand) return;
    const brandId = currentBrand.id;

    let isCancelled = false;
    async function loadSuspicious() {
      try {
        const res = await fetch(`/api/brands/${encodeURIComponent(brandId)}/apps`);
        if (res.ok) {
          const json = await res.json();
          if (!isCancelled && json.success && json.data) {
            setAppsList(json.data.suspiciousApps || []);
          }
        }
      } catch {
        // Fallback
      }
    }
    loadSuspicious();
    return () => {
      isCancelled = true;
    };
  }, [brand, apps]);

  const displayApps = appsList.slice(0, 4);

  return (
    <div className="apple-card p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#007AFF] flex items-center justify-center">
            <Smartphone className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Suspicious Apps Detected
            </h3>
            {brand && (
              <p className="text-[11px] text-slate-400">
                Targeting {brand.name} ecosystem
              </p>
            )}
          </div>
        </div>

        <Link
          href={brand ? `/apps?brand=${encodeURIComponent(brand.id)}&filter=suspicious` : '/apps?filter=suspicious'}
          className="text-xs font-semibold text-[#007AFF] hover:underline flex items-center gap-1"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Rows or Clean Empty State */}
      {displayApps.length === 0 ? (
        <div className="py-10 text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            No suspicious applications detected
          </p>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
            {brand ? `${brand.name}` : 'Selected brand'} catalog currently has zero rogue or look-alike APK alerts.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {displayApps.map((app) => (
            <div
              key={app.id}
              className="py-4 flex items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                {app.icon ? (
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 p-1 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs overflow-hidden">
                    <img
                      src={app.icon}
                      alt={app.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-contain rounded-xl"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div className="hidden w-full h-full items-center justify-center bg-slate-100 dark:bg-slate-850 text-slate-400 rounded-xl">
                      <Smartphone className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs text-slate-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {app.name}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        app.riskScore >= 80
                          ? 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 border-red-200/80'
                          : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200/80'
                      }`}
                    >
                      {app.riskScore >= 80 ? 'High Risk' : 'Medium Risk'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                    Developer: <span className="font-semibold text-slate-700 dark:text-slate-300">{app.developer}</span>
                  </p>

                  <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                    {app.downloads ? `${app.downloads} • ` : ''}{app.packageId}
                  </p>

                  {app.reasons && app.reasons.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {app.reasons.slice(0, 3).map((r, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100/90 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                          <span>{r}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="shrink-0 flex items-center gap-2 self-center">
                <Link
                  href={`/reports/create?brandId=${encodeURIComponent(brand?.id || app.brandId || '')}&candidateName=${encodeURIComponent(app.name)}&type=APP&riskScore=${app.riskScore}`}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-xl border border-rose-200/80 dark:border-rose-900/60 transition-colors shadow-2xs whitespace-nowrap flex items-center gap-1"
                >
                  <Flag className="w-3 h-3" />
                  <span>Report</span>
                </Link>
                <Link
                  href={`/apps?brand=${encodeURIComponent(brand?.id || app.brandId || '')}`}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200/80 dark:border-slate-700 transition-colors shadow-2xs whitespace-nowrap hidden sm:block"
                >
                  Inspect
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
