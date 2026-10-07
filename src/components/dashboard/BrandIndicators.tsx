'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Brand } from '@/types/brand';

interface BrandIndicatorsProps {
  brands: Brand[];
  activeIndex: number;
  isPlaying: boolean;
  onSelectIndex: (index: number) => void;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
}

export function BrandIndicators({
  brands,
  activeIndex,
  isPlaying,
  onSelectIndex,
  onTogglePlay,
  onPrev,
  onNext,
  className = '',
}: BrandIndicatorsProps) {
  if (brands.length <= 1) return null;

  const currentCount = (activeIndex + 1).toString().padStart(2, '0');
  const totalCount = brands.length.toString().padStart(2, '0');

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-3 sm:px-6 sm:py-3.5 bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/80 rounded-2xl shadow-sm ${className}`}
    >
      {/* Brand indicators / segment pills */}
      <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1 scrollbar-none">
        {brands.map((brand, idx) => {
          const isActive = idx === activeIndex;
          const displayNum = (idx + 1).toString().padStart(2, '0');

          return (
            <button
              key={brand.id || idx}
              type="button"
              onClick={() => onSelectIndex(idx)}
              aria-label={`Slide ${idx + 1}: ${brand.name}`}
              aria-current={isActive ? 'true' : 'false'}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs scale-100'
                  : 'bg-slate-100/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/60'
              }`}
            >
              <span className="text-[10px] font-mono opacity-60 group-hover:opacity-100">
                {displayNum}
              </span>
              <span className="truncate max-w-[100px] sm:max-w-[120px]">{brand.name}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF] animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Numerical Counter & Minimal Controls */}
      <div className="flex items-center gap-3 shrink-0 self-center">
        {/* Counter */}
        <div className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">
          <span className="text-slate-900 dark:text-white">{currentCount}</span>
          <span className="mx-1 text-slate-300 dark:text-slate-600">/</span>
          <span>{totalCount}</span>
        </div>

        {/* Minimal Divider */}
        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-750" />

        {/* Prev / Play / Next Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous brand slide"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2]" />
          </button>

          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={isPlaying ? 'Pause slideshow' : 'Resume slideshow'}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
          </button>

          <button
            type="button"
            onClick={onNext}
            aria-label="Next brand slide"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </div>
    </div>
  );
}
