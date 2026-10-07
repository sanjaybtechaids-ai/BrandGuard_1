import React from 'react';
import Link from 'next/link';
import { Brand } from '@/types/brand';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Smartphone, Share2, AlertTriangle, ArrowUpRight, Clock, Globe } from 'lucide-react';

import { BrandLogo } from '@/components/common/BrandLogo';

interface BrandCardProps {
  brand: Brand;
}

export function BrandCard({ brand }: BrandCardProps) {
  return (
    <Link
      href={`/brands/${brand.id}`}
      className="apple-card p-6 bg-white dark:bg-slate-900 flex flex-col justify-between group hover:border-[#007AFF]/40"
    >
      <div>
        {/* Header: Logo, Name, Verification, External Arrow */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <BrandLogo
              brandId={brand.id}
              brandName={brand.name}
              domain={brand.canonical_domain || brand.canonicalDomain || brand.logo_domain || brand.logoDomain || brand.website}
              logoUrl={brand.logo_url || brand.logoUrl || brand.logo}
              size="md"
              className="group-hover:scale-105 transition-transform"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#007AFF] transition-colors">
                  {brand.name}
                </h3>
                <StatusBadge status={brand.verificationStatus} size="sm" />
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                <Globe className="w-3 h-3 text-slate-400" />
                <span>{brand.website}</span>
              </div>
            </div>
          </div>
          <div className="p-2 rounded-xl text-slate-400 group-hover:text-[#007AFF] group-hover:bg-[#EAF3FF] dark:group-hover:bg-blue-950/40 transition-colors">
            <ArrowUpRight className="w-4 h-4 stroke-[2]" />
          </div>
        </div>

        {/* Counts summary: Official Apps & Socials */}
        <div className="grid grid-cols-2 gap-2 mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <Smartphone className="w-3.5 h-3.5 text-[#007AFF]" />
            <span className="text-slate-600 dark:text-slate-300">
              <strong className="text-slate-900 dark:text-white">{brand.officialAppsCount}</strong> apps
            </span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <Share2 className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-slate-600 dark:text-slate-300">
              <strong className="text-slate-900 dark:text-white">{brand.officialSocialsCount}</strong> socials
            </span>
          </div>
        </div>
      </div>

      {/* Footer: Threat Status, Last Scan & Open Brand */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          {brand.threatCount === 0 ? (
            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>No Active Threats</span>
            </span>
          ) : (
            <>
              <AlertTriangle
                className={`w-3.5 h-3.5 ${
                  brand.criticalCount > 0 ? 'text-red-500' : 'text-amber-500'
                }`}
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {brand.threatCount} threats
              </span>
              {brand.criticalCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 border border-red-200/60">
                  {brand.criticalCount} crit
                </span>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
            <Clock className="w-3 h-3" />
            <span>{brand.lastScan}</span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#007AFF] group-hover:translate-x-0.5 transition-transform">
            <span>Open Brand</span>
            <span>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
