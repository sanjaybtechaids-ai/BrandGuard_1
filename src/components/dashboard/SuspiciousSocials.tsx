'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, ChevronRight, ShieldCheck, Flag } from 'lucide-react';
import { MonitoredSocial } from '@/types/social';
import { Brand } from '@/types/brand';
import { monitoredSocials as fallbackSocials } from '@/data/social';

interface SuspiciousSocialsProps {
  brand?: Brand | null;
  socials?: MonitoredSocial[];
}

export function SuspiciousSocials({ brand, socials }: SuspiciousSocialsProps) {
  const [socialsList, setSocialsList] = useState<MonitoredSocial[]>(() => {
    if (socials) return socials.filter((s) => !s.isOfficial || s.verificationStatus === 'SUSPICIOUS');
    if (brand) {
      const bId = brand.id.toLowerCase();
      const bName = brand.name.toLowerCase();
      return fallbackSocials.filter(
        (s) =>
          (!s.isOfficial || s.verificationStatus === 'SUSPICIOUS') &&
          (s.brandId.toLowerCase() === bId || s.brandName.toLowerCase() === bName)
      );
    }
    return fallbackSocials.filter((s) => !s.isOfficial || s.verificationStatus === 'SUSPICIOUS');
  });

  useEffect(() => {
    if (socials) {
      setSocialsList(socials.filter((s) => !s.isOfficial || s.verificationStatus === 'SUSPICIOUS'));
      return;
    }

    const currentBrand = brand;
    if (!currentBrand) return;
    const brandId = currentBrand.id;

    let isCancelled = false;
    async function loadSuspicious() {
      try {
        const res = await fetch(`/api/brands/${encodeURIComponent(brandId)}/social`);
        if (res.ok) {
          const json = await res.json();
          if (!isCancelled && json.success && json.data) {
            setSocialsList(json.data.suspiciousSocials || []);
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
  }, [brand, socials]);

  const displaySocials = socialsList.slice(0, 4);

  return (
    <div className="apple-card p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#007AFF] flex items-center justify-center">
            <Users className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Suspicious Social Accounts
            </h3>
            {brand && (
              <p className="text-[11px] text-slate-400">
                Impersonating {brand.name} official channels
              </p>
            )}
          </div>
        </div>

        <Link
          href={brand ? `/social?brand=${encodeURIComponent(brand.id)}&filter=suspicious` : '/social?filter=suspicious'}
          className="text-xs font-semibold text-[#007AFF] hover:underline flex items-center gap-1"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Rows or Clean Empty State */}
      {displaySocials.length === 0 ? (
        <div className="py-10 text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            No suspicious social accounts detected
          </p>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
            {brand ? `${brand.name}` : 'Selected brand'} has no detected spoofing or rogue customer support profiles.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {displaySocials.map((acc) => (
            <div
              key={acc.id}
              className="py-4 flex items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                {/* Profile Avatar */}
                <div
                  className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs mt-0.5"
                >
                  {acc.username.replace('@', '').charAt(0).toUpperCase()}
                </div>

                {/* Name, Handle, Meta */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {acc.displayName || acc.username}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        acc.riskScore >= 80
                          ? 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 border-red-200/80'
                          : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200/80'
                      }`}
                    >
                      {acc.riskScore >= 80 ? 'High Risk' : 'Medium Risk'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 truncate">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono truncate">{acc.username}</span>
                    <span className="shrink-0 text-slate-300">•</span>
                    <span className="shrink-0 text-slate-400 font-medium">{acc.platform}</span>
                  </p>

                  {/* Reason tags below */}
                  {acc.reasons && acc.reasons.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {acc.reasons.slice(0, 3).map((b, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100/90 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                          <span>{b}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="shrink-0 flex items-center gap-2 self-center">
                <Link
                  href={`/reports/create?brandId=${encodeURIComponent(brand?.id || acc.brandId || '')}&candidateName=${encodeURIComponent(acc.username)}&type=SOCIAL&riskScore=${acc.riskScore}`}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-xl border border-rose-200/80 dark:border-rose-900/60 transition-colors shadow-2xs whitespace-nowrap flex items-center gap-1"
                >
                  <Flag className="w-3 h-3" />
                  <span>Report</span>
                </Link>
                {acc.profileUrl && (
                  <a
                    href={acc.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200/80 dark:border-slate-700 transition-colors shadow-2xs whitespace-nowrap hidden sm:block"
                  >
                    Inspect
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
