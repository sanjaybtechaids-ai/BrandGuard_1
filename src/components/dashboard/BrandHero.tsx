'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Brand } from '@/types/brand';
import { Threat } from '@/types/threat';
import { BrandLogo } from '@/components/common/BrandLogo';
import { BrandAssetService } from '@/services/brand-asset.service';

interface BrandHeroProps {
  brand: Brand;
  threats?: Threat[];
  className?: string;
}

export function BrandHero({ brand, threats = [], className = '' }: BrandHeroProps) {
  // Derive threats for this brand
  const brandThreats = threats.filter(
    (t) =>
      t.brandId?.toLowerCase() === brand.id?.toLowerCase() ||
      t.brandName?.toLowerCase() === brand.name?.toLowerCase()
  );

  const criticalCount = brandThreats.filter((t) => t.riskLevel === 'Critical').length || brand.criticalCount || 0;
  const highCount = brandThreats.filter((t) => t.riskLevel === 'High').length || brand.highCount || 0;
  const totalThreats = brandThreats.length > 0 ? brandThreats.length : brand.threatCount || 0;

  let threatConfig = {
    badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
    dotColor: 'bg-emerald-500',
    pulseColor: 'bg-emerald-400',
    label: 'No Active Threats',
  };

  if (criticalCount > 0) {
    threatConfig = {
      badgeBg: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25',
      dotColor: 'bg-rose-500',
      pulseColor: 'bg-rose-400',
      label: `${criticalCount} Critical Threat${criticalCount > 1 ? 's' : ''}`,
    };
  } else if (highCount > 0) {
    threatConfig = {
      badgeBg: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/25',
      dotColor: 'bg-orange-500',
      pulseColor: 'bg-orange-400',
      label: `${highCount} High-Risk Threat${highCount > 1 ? 's' : ''}`,
    };
  } else if (totalThreats > 0) {
    threatConfig = {
      badgeBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25',
      dotColor: 'bg-amber-500',
      pulseColor: 'bg-amber-400',
      label: `${totalThreats} Active Threat${totalThreats > 1 ? 's' : ''}`,
    };
  }

  const heroVisualUrl = BrandAssetService.getBrandHeroImage(brand) || brand.heroImage || brand.logo;

  return (
    <div
      className={`relative w-full h-[280px] sm:h-[320px] lg:h-[340px] rounded-[24px] sm:rounded-[30px] overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm ${className}`}
    >
      {/* Background Image with contrast overlays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {heroVisualUrl ? (
          <img
            src={heroVisualUrl}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-white/98 via-white/85 to-white/20 dark:from-slate-950/98 dark:via-slate-950/85 dark:to-slate-950/25 w-full md:w-4/5 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-white/40 dark:from-slate-950/90 dark:via-transparent dark:to-slate-950/40 z-10" />
      </div>

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col justify-between p-6 sm:p-8 lg:p-10 max-w-2xl">
        {/* Top: Logo + Brand Name + Verified */}
        <div className="flex items-center gap-4">
          <div className="shrink-0 p-1 bg-white/90 dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-md">
            <BrandLogo
              brandName={brand.name}
              domain={brand.logo_domain || brand.logoDomain || brand.website}
              logoUrl={brand.logo_url || brand.logoUrl || brand.logo}
              size="lg"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                {brand.name}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50/90 text-[#007AFF] dark:bg-blue-950/80 dark:text-blue-400 text-[11px] font-bold border border-blue-200/70 dark:border-blue-800/60 shadow-2xs backdrop-blur-xs">
                <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                <span>Trusted Brand</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
              {brand.company || brand.legalName || 'Protected Enterprise Entity'}
            </p>
          </div>
        </div>

        {/* Center: Threat Status Pill */}
        <div className="my-auto py-2">
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md shadow-2xs ${threatConfig.badgeBg}`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 motion-reduce:hidden ${threatConfig.pulseColor}`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${threatConfig.dotColor}`}
              />
            </span>
            <span>{threatConfig.label}</span>
          </div>
        </div>

        {/* Bottom: View Brand Action */}
        <div>
          <Link
            href={`/brands/${encodeURIComponent(brand.id)}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 group"
          >
            <span>View Brand</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
