'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useBrandContext } from '@/context/BrandContext';
import { BrandLogo } from './BrandLogo';
import { Brand } from '@/types/brand';
import { ChevronDown, Check, ShieldCheck, Globe, Layers, AlertCircle } from 'lucide-react';

export interface BrandSelectorProps {
  value?: string | null;
  onChange?: (brandId: string | null) => void;
  showAllOption?: boolean;
  placeholder?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function BrandSelector({
  value,
  onChange,
  showAllOption = false,
  placeholder = 'Select a protected brand...',
  size = 'md',
  className = '',
}: BrandSelectorProps) {
  const { availableBrands, selectedBrandId, setSelectedBrandId } = useBrandContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Active brand ID either from prop value or context
  const activeId = value !== undefined ? value : selectedBrandId;

  // Selected brand object
  const currentBrand = activeId
    ? availableBrands.find(
        (b) =>
          b.id.toLowerCase() === activeId.toLowerCase() ||
          b.name.toLowerCase() === activeId.toLowerCase()
      ) || null
    : null;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (brandId: string | null) => {
    if (onChange) {
      onChange(brandId);
    } else {
      setSelectedBrandId(brandId);
    }
    setIsOpen(false);
  };

  const isSmall = size === 'sm';

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl transition-all shadow-2xs hover:border-blue-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100 ${
          isSmall ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {activeId === 'ALL' ? (
            <div className="w-5 h-5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0">
              <Layers className="w-3.5 h-3.5" />
            </div>
          ) : currentBrand ? (
            <BrandLogo
              brandId={currentBrand.id}
              brandName={currentBrand.name}
              domain={currentBrand.canonicalDomain || currentBrand.website}
              size={isSmall ? 18 : 22}
              className="shrink-0 rounded-lg shadow-2xs"
            />
          ) : (
            <div className="w-5 h-5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
              <Globe className="w-3.5 h-3.5" />
            </div>
          )}

          <div className="flex flex-col text-left truncate">
            {activeId === 'ALL' ? (
              <span className="font-bold text-blue-600 dark:text-blue-400 truncate">All Brands (Organization-Wide)</span>
            ) : currentBrand ? (
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-bold truncate">{currentBrand.name}</span>
                <span className="inline-flex items-center px-1.5 py-0.2 text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-200/60 dark:border-emerald-800/60 shrink-0">
                  Verified
                </span>
              </div>
            ) : (
              <span className="text-slate-400 dark:text-slate-500 font-medium truncate">{placeholder}</span>
            )}
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-72 max-h-80 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-1.5 animate-in fade-in-50 zoom-in-95 duration-100">
          <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800/80 mb-1">
            Protected Brands ({availableBrands.length})
          </div>

          {showAllOption && (
            <button
              type="button"
              onClick={() => handleSelect('ALL')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors mb-1 ${
                activeId === 'ALL'
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <span>All Brands (Organization-Wide)</span>
              </div>
              {activeId === 'ALL' && <Check className="w-4 h-4 text-blue-600" />}
            </button>
          )}

          {availableBrands.map((brand) => {
            const isSelected = activeId?.toLowerCase() === brand.id.toLowerCase();
            return (
              <button
                key={brand.id}
                type="button"
                onClick={() => handleSelect(brand.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-colors ${
                  isSelected
                    ? 'bg-blue-50/80 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300 font-bold'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <BrandLogo
                    brandId={brand.id}
                    brandName={brand.name}
                    domain={brand.canonicalDomain || brand.website}
                    size={20}
                    className="shrink-0 rounded-lg shadow-2xs"
                  />
                  <div className="flex flex-col text-left truncate">
                    <span className="font-bold truncate text-slate-800 dark:text-slate-100">{brand.name}</span>
                    <span className="text-[10px] text-slate-400 truncate">
                      {brand.canonicalDomain || brand.website || 'Official domain'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-200/60 dark:border-emerald-800/60">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    Verified
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 ml-1" />}
                </div>
              </button>
            );
          })}

          {availableBrands.length === 0 && (
            <div className="px-3 py-4 text-center text-xs text-slate-400">
              No protected brands found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
