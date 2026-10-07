'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, ChevronRight } from 'lucide-react';
import { Brand } from '@/types/brand';
import { BrandLogo } from '@/components/common/BrandLogo';

interface BrandPreviewStripProps {
  brands: Brand[];
  activeIndex: number;
  onSelectBrand: (index: number) => void;
  brandThreatCounts?: Record<string, number>;
  className?: string;
}

export function BrandPreviewStrip({
  brands,
  activeIndex,
  onSelectBrand,
  brandThreatCounts = {},
  className = '',
}: BrandPreviewStripProps) {
  if (brands.length === 0) return null;

  return (
    <div className={`space-y-3.5 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Your Protected Brands
          </h3>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {brands.length} Enrolled
          </span>
        </div>

        <Link
          href="/brands"
          className="text-xs font-semibold text-[#007AFF] hover:underline inline-flex items-center gap-1"
        >
          <span>Manage Directory</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Cards list */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {brands.map((brand, idx) => {
          const isActive = idx === activeIndex;
          const threatCount =
            brandThreatCounts[brand.id] ??
            brandThreatCounts[brand.name.toLowerCase()] ??
            brand.threatCount ??
            0;

          return (
            <button
              key={brand.id || idx}
              type="button"
              onClick={() => onSelectBrand(idx)}
              aria-label={`Select brand ${brand.name}`}
              className={`group relative text-left p-3.5 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-white dark:bg-slate-800 border-2 border-[#007AFF] shadow-md scale-[1.02]'
                  : 'bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-850 shadow-2xs'
              }`}
            >
              {/* Top row: Logo & Verified badge */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <BrandLogo
                  brandId={brand.id}
                  brandName={brand.name}
                  domain={brand.canonical_domain || brand.canonicalDomain || brand.logo_domain || brand.logoDomain || brand.website}
                  logoUrl={brand.logo_url || brand.logoUrl || brand.logo}
                  size="sm"
                  className="shrink-0"
                />

                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-[#007AFF] animate-ping" />
                )}
              </div>

              {/* Middle: Brand name */}
              <div className="min-w-0 mb-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#007AFF] transition-colors">
                  {brand.name}
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">Verified</span>
                </div>
              </div>

              {/* Bottom: Threats count */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                <span
                  className={`font-semibold truncate ${
                    threatCount > 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {threatCount > 0 ? `${threatCount} Threats` : '0 Threats'}
                </span>
                <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  View
                </span>
              </div>
            </button>
          );
        })}

        {/* Add Brand card */}
        <Link
          href="/brands/add"
          className="p-3.5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-[#007AFF] hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all flex flex-col items-center justify-center text-center gap-1.5 group text-slate-500 hover:text-[#007AFF] min-h-[110px]"
        >
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-[#007AFF]/10 flex items-center justify-center text-slate-500 group-hover:text-[#007AFF] transition-colors">
            <Plus className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="text-xs font-bold truncate">Add Brand</span>
          <span className="text-[10px] text-slate-400 group-hover:text-blue-500/80 truncate">
            Auto-Discovery
          </span>
        </Link>
      </div>
    </div>
  );
}
