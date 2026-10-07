'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Shield, Plus, ArrowRight, Sparkles } from 'lucide-react';
import { Brand } from '@/types/brand';
import { Threat } from '@/types/threat';
import { BrandSlide } from './BrandSlide';
import { DerivedBrandStats } from './BrandStats';

// Configuration: EXACTLY 3000ms per slide (Part 3 & 27)
export const BRAND_SLIDE_INTERVAL = 3000;

interface BrandShowcaseProps {
  brands: Brand[];
  threats: Threat[];
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  onRescanBrand?: (brand: Brand) => void;
  className?: string;
}

export function BrandShowcase({
  brands,
  threats,
  activeIndex: controlledIndex,
  onActiveIndexChange,
  className = '',
}: BrandShowcaseProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const activeIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;

  const setActiveIndex = useCallback(
    (index: number) => {
      if (brands.length === 0) return;
      const target = (index + brands.length) % brands.length;
      if (onActiveIndexChange) {
        onActiveIndexChange(target);
      } else {
        setInternalIndex(target);
      }
    },
    [brands.length, onActiveIndexChange]
  );

  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Swipe / Drag tracking refs
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Check prefers-reduced-motion (Part 4 & 28)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Calculate live threat & asset metrics for each brand
  const brandStatsMap = useMemo<Record<string, DerivedBrandStats>>(() => {
    const map: Record<string, DerivedBrandStats> = {};

    brands.forEach((b) => {
      const brandIdLower = b.id?.toLowerCase() || '';
      const brandNameLower = b.name?.toLowerCase() || '';

      const matchedThreats = threats.filter(
        (t) =>
          t.brandId?.toLowerCase() === brandIdLower ||
          t.brandName?.toLowerCase() === brandNameLower
      );

      const criticalCount =
        matchedThreats.filter((t) => t.riskLevel === 'Critical').length || b.criticalCount || 0;
      const highCount =
        matchedThreats.filter((t) => t.riskLevel === 'High').length || b.highCount || 0;
      const mediumCount =
        matchedThreats.filter((t) => t.riskLevel === 'Medium').length || b.mediumCount || 0;
      const totalThreats = matchedThreats.length > 0 ? matchedThreats.length : b.threatCount || 0;

      let riskScore = 15;
      if (matchedThreats.length > 0) {
        riskScore = Math.max(...matchedThreats.map((t) => t.riskScore));
      } else if (b.threatCount > 0) {
        riskScore = criticalCount > 0 ? 88 : highCount > 0 ? 72 : 45;
      }

      map[b.id] = {
        threats: totalThreats,
        criticalThreats: criticalCount,
        highThreats: highCount,
        mediumThreats: mediumCount,
        apps: b.officialApps?.length ?? b.officialAppsCount ?? 0,
        socialAccounts: b.officialSocials?.length ?? b.officialSocialsCount ?? 0,
        riskScore,
      };
    });

    return map;
  }, [brands, threats]);

  // Slideshow auto-rotation timer: EXACTLY 3000ms (Part 3 & 27)
  // Pauses on hover, touch, or prefers-reduced-motion (Part 5 & 28)
  useEffect(() => {
    if (brands.length <= 1) return;
    if (isPaused || prefersReducedMotion) return;

    const timer = setInterval(() => {
      setActiveIndex(activeIndex + 1);
    }, BRAND_SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [brands.length, isPaused, prefersReducedMotion, activeIndex, setActiveIndex]);

  // Keyboard navigation: ArrowLeft, ArrowRight (Part 26)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveIndex(activeIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveIndex(activeIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, setActiveIndex]);

  // Touch Swipe Handlers (Part 26)
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    if (distance > 45) {
      setActiveIndex(activeIndex + 1);
    } else if (distance < -45) {
      setActiveIndex(activeIndex - 1);
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // 1. EMPTY STATE: When organization has 0 brands (Part 41 Test 10)
  if (brands.length === 0) {
    return (
      <div className="relative w-full h-[300px] sm:h-[320px] rounded-[24px] sm:rounded-[28px] overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-900/50 dark:to-slate-900 flex items-center justify-center p-6 sm:p-8 text-center shadow-xs">
        <div className="max-w-md space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-[#007AFF] flex items-center justify-center mx-auto border border-blue-500/20 shadow-xs">
            <Shield className="w-7 h-7 stroke-[2]" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Protect Your First Brand
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Activate continuous brand protection and monitoring for your organization.
            </p>
          </div>

          <div>
            <Link
              href="/brands/add"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#007AFF] hover:bg-[#0066D6] text-white font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Brand</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const defaultStats: DerivedBrandStats = {
    threats: 0,
    criticalThreats: 0,
    highThreats: 0,
    mediumThreats: 0,
    apps: 0,
    socialAccounts: 0,
    riskScore: 15,
  };

  return (
    <div
      className={`relative w-full select-none ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Compact Viewport: Height 250px–330px */}
      <div className="relative w-full h-[250px] sm:h-[290px] lg:h-[320px] rounded-[24px] sm:rounded-[28px] overflow-hidden shadow-sm">
        {brands.map((brand, idx) => (
          <BrandSlide
            key={brand.id || idx}
            brand={brand}
            stats={brandStatsMap[brand.id] || defaultStats}
            isActive={idx === activeIndex}
            slideIndex={idx}
            totalSlides={brands.length}
            onPrev={() => setActiveIndex(activeIndex - 1)}
            onNext={() => setActiveIndex(activeIndex + 1)}
          />
        ))}

        {/* Carousel indicator dots */}
        {brands.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-30 pointer-events-auto">
            {brands.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                  i === activeIndex
                    ? 'w-4 bg-[#007AFF]'
                    : 'w-1 bg-slate-400/50 dark:bg-slate-600/50 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
