'use client';

import React, { useState } from 'react';
import { Search, X, Globe, ShieldCheck, ArrowRight } from 'lucide-react';
import { UrlVerificationModal } from '@/components/verification/UrlVerificationModal';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onVerifyUrlClick?: (url: string) => void;
}

export type SearchInputType = 'URL' | 'DOMAIN' | 'BRAND_NAME' | 'USERNAME' | 'SEARCH_TERM';

export function detectSearchInputType(input: string): SearchInputType {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return 'SEARCH_TERM';

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return 'URL';
  }

  if (
    trimmed.includes('.') &&
    !trimmed.includes(' ') &&
    (trimmed.endsWith('.com') ||
      trimmed.endsWith('.org') ||
      trimmed.endsWith('.net') ||
      trimmed.endsWith('.shop') ||
      trimmed.endsWith('.io') ||
      trimmed.endsWith('.co') ||
      trimmed.endsWith('.app'))
  ) {
    return 'DOMAIN';
  }

  if (trimmed.startsWith('@')) {
    return 'USERNAME';
  }

  const knownBrands = ['nike', 'adidas', 'apple', 'samsung', 'microsoft', 'amazon', 'google', 'tata', 'infosys', 'flipkart'];
  if (knownBrands.includes(trimmed)) {
    return 'BRAND_NAME';
  }

  return 'SEARCH_TERM';
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search threats, brands, or paste URL to verify...',
  className = '',
  onVerifyUrlClick,
}: SearchBarProps) {
  const router = useRouter();
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [verifyTarget, setVerifyTarget] = useState('');

  const inputType = detectSearchInputType(value);
  const isUrlOrDomain = inputType === 'URL' || inputType === 'DOMAIN';

  const handleAction = () => {
    if (isUrlOrDomain) {
      if (onVerifyUrlClick) {
        onVerifyUrlClick(value);
      } else {
        setVerifyTarget(value);
        setVerificationModalOpen(true);
      }
    } else if (inputType === 'BRAND_NAME') {
      const brandId = value.trim().toLowerCase();
      router.push(`/brands/${brandId}`);
    } else {
      router.push(`/threats?search=${encodeURIComponent(value)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAction();
    }
  };

  return (
    <>
      <div className={`relative flex items-center ${className}`}>
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-24 py-2 text-xs bg-[#F9FAFB] dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] transition-all font-medium"
        />

        {/* Dynamic type pill indicator / Action button */}
        {value.trim() && (
          <div className="absolute right-2 flex items-center gap-1.5">
            {isUrlOrDomain ? (
              <button
                type="button"
                onClick={handleAction}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-[#007AFF] hover:bg-[#0066D6] rounded-lg shadow-xs transition-colors"
                title="Verify this URL against trusted brand profile"
              >
                <Globe className="w-3 h-3" />
                <span>Verify</span>
              </button>
            ) : inputType === 'BRAND_NAME' ? (
              <button
                type="button"
                onClick={handleAction}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-[#007AFF] hover:bg-[#0066D6] rounded-lg shadow-xs transition-colors"
                title="Discover official digital identity"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Discover</span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-sm"
              title="Clear search"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <UrlVerificationModal
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        initialUrl={verifyTarget}
      />
    </>
  );
}
