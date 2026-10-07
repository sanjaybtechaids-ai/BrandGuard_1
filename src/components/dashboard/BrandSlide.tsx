'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Brand } from '@/types/brand';
import { DerivedBrandStats } from './BrandStats';
import { BrandLogo } from '@/components/common/BrandLogo';

import { BrandAssetService } from '@/services/brand-asset.service';

interface BrandSlideProps {
  brand: Brand;
  stats: DerivedBrandStats;
  isActive: boolean;
  slideIndex: number;
  totalSlides: number;
  onPrev?: () => void;
  onNext?: () => void;
}

export function BrandSlide({
  brand,
  stats,
  isActive,
  slideIndex,
  totalSlides,
  onPrev,
  onNext,
}: BrandSlideProps) {
  const [imageError, setImageError] = useState(false);

  // Background visual candidate (Part 17: relevant brand image)
  const heroVisualUrl = BrandAssetService.getBrandHeroImage(brand) || brand.heroImage || brand.brandVisual || brand.logo;

  // Fallback gradient if hero image fails or is missing
  const getFallbackGradient = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 40) % 360;
    return `linear-gradient(135deg, hsl(${hue1}, 65%, 93%) 0%, hsl(${hue2}, 60%, 88%) 100%)`;
  };

  // Threat status calculation conforming strictly to Part 25:
  // - activeThreats === 0: 🟢 No Active Threats
  // - criticalThreats > 0: 🔴 Critical Threats
  // - highThreats > 0: 🟠 High-Risk Threats
  // - activeThreats > 0: 🟡 Active Threats
  const totalActiveThreats = stats.threats;
  const criticalThreats = stats.criticalThreats;
  const highThreats = stats.highThreats;

  let threatConfig = {
    dotColor: 'bg-emerald-500',
    pulseColor: 'bg-emerald-400',
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
    label: 'No Active Threats',
    iconEmoji: '🟢',
  };

  if (criticalThreats > 0) {
    threatConfig = {
      dotColor: 'bg-rose-500',
      pulseColor: 'bg-rose-400',
      badgeBg: 'bg-rose-500/10 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/25',
      label: `${criticalThreats} Critical Threat${criticalThreats > 1 ? 's' : ''}`,
      iconEmoji: '🔴',
    };
  } else if (highThreats > 0) {
    threatConfig = {
      dotColor: 'bg-orange-500',
      pulseColor: 'bg-orange-400',
      badgeBg: 'bg-orange-500/10 dark:bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/25',
      label: `${highThreats} High-Risk Threat${highThreats > 1 ? 's' : ''}`,
      iconEmoji: '🟠',
    };
  } else if (totalActiveThreats > 0) {
    threatConfig = {
      dotColor: 'bg-amber-500',
      pulseColor: 'bg-amber-400',
      badgeBg: 'bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/25',
      label: `${totalActiveThreats} Active Threat${totalActiveThreats > 1 ? 's' : ''}`,
      iconEmoji: '🟡',
    };
  }

  // Display counter: e.g. "01 / 07"
  const formattedIndex = (slideIndex + 1).toString().padStart(2, '0');
  const formattedTotal = totalSlides.toString().padStart(2, '0');

  // Clean canonical brand link (Part 10, 11, 13)
  const brandDetailHref = `/brands/${encodeURIComponent(brand.id)}`;

  // Display website
  const displayWebsite = brand.website
    ? brand.website.replace(/^https?:\/\//, '').replace(/\/$/, '')
    : null;

  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`${brand.name} protection showcase`}
      aria-hidden={!isActive}
      className={`absolute inset-0 w-full h-full rounded-[24px] sm:rounded-[28px] overflow-hidden border border-slate-200/80 dark:border-slate-800 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] select-none motion-reduce:transition-opacity motion-reduce:transform-none ${
        isActive
          ? 'opacity-100 scale-100 z-10 pointer-events-auto'
          : 'opacity-0 scale-[0.98] z-0 pointer-events-none'
      }`}
      style={{
        background: imageError ? getFallbackGradient(brand.name) : undefined,
      }}
    >
      {/* 1. Subtle Background Visual */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {heroVisualUrl && !imageError ? (
          <img
            src={heroVisualUrl}
            alt=""
            aria-hidden="true"
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover object-center transition-all duration-1000 ease-out motion-reduce:transform-none ${
              isActive ? 'scale-105 opacity-90' : 'scale-100 opacity-60'
            }`}
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: getFallbackGradient(brand.name) }}
          />
        )}

        {/* 2. Apple Multilayer Contrast Gradient Overlays (Part 22) */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/98 via-white/85 to-white/20 dark:from-slate-950/98 dark:via-slate-950/85 dark:to-slate-950/25 w-full md:w-4/5 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-white/40 dark:from-slate-950/90 dark:via-transparent dark:to-slate-950/40 z-10" />
      </div>

      {/* 3. Slide Content (Part 2 & Part 24: ONLY Logo, Name, Verification, Threat Status, View Brand, Counter) */}
      <div className="relative z-20 h-full flex flex-col justify-between p-6 sm:p-8 lg:p-10 max-w-2xl">
        {/* Top: Brand Logo + Brand Name + Verification Badge */}
        <div className="flex items-center gap-4">
          <div className="shrink-0 p-1 bg-white/90 dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-md">
            <BrandLogo
              brandId={brand.id}
              brandName={brand.name}
              domain={brand.canonical_domain || brand.canonicalDomain || brand.logo_domain || brand.logoDomain || brand.website}
              logoUrl={brand.logo_url || brand.logoUrl || brand.logo}
              size="lg"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                {brand.name}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50/90 text-[#007AFF] dark:bg-blue-950/80 dark:text-blue-400 text-[11px] font-bold border border-blue-200/70 dark:border-blue-800/60 shadow-2xs backdrop-blur-xs">
                <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                <span>Verified Brand</span>
              </span>
            </div>

            {displayWebsite && (
              <a
                href={`https://${displayWebsite}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                <span>{displayWebsite}</span>
                <ArrowUpRight className="w-3 h-3 opacity-60" />
              </a>
            )}
          </div>
        </div>

        {/* Center: Threat Status Indicator Pill (Part 8 & 25) */}
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

        {/* Bottom: View Brand Action & Controls */}
        <div className="flex items-center justify-between gap-4 pt-1">
          {/* Primary View Brand Action Button */}
          <Link
            href={brandDetailHref}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 text-xs sm:text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95 group"
          >
            <span>View Brand</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* Minimal Bottom Right Pagination & Subtle ‹ › Navigation (Part 24 & 26) */}
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">
              <strong className="text-slate-900 dark:text-white">{formattedIndex}</strong>
              <span className="mx-1 text-slate-300 dark:text-slate-600">/</span>
              <span>{formattedTotal}</span>
            </span>

            {totalSlides > 1 && (
              <div className="flex items-center gap-0.5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-lg p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onPrev) onPrev();
                  }}
                  aria-label="Previous brand"
                  className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onNext) onNext();
                  }}
                  aria-label="Next brand"
                  className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
