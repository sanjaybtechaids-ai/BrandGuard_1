'use client';

import React, { useState, useEffect } from 'react';
import { LogoService } from '@/services/logo.service';

export interface BrandLogoProps {
  /** Canonical brand name (e.g. "Nike") */
  brandName?: string;
  /** Backwards compatibility prop */
  name?: string;
  /** Brand canonical or UUID identifier */
  brandId?: string;
  /** Backwards compatibility prop */
  id?: string;
  /** Official or verified domain (e.g. "nike.com") */
  domain?: string;
  /** Canonical domain alias */
  canonicalDomain?: string;
  /** Stored or pre-resolved logo URL */
  logoUrl?: string | null;
  /** Backwards compatibility prop */
  src?: string | null;
  /** Size in pixels (number) or semantic tier ('sm' | 'md' | 'lg' | 'xl') */
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  /** Additional CSS class names */
  className?: string;
  /** Custom accessibility alt text */
  alt?: string;
}

export function BrandLogo({
  brandName,
  name,
  brandId,
  id,
  domain,
  canonicalDomain,
  logoUrl,
  src,
  size = 'md',
  className = '',
  alt,
}: BrandLogoProps) {
  const effectiveName = (brandName || name || '').trim();
  const effectiveId = (brandId || id || '').trim();
  const effectiveDomain = domain || canonicalDomain;
  const effectiveStoredLogo = logoUrl !== undefined ? logoUrl : src;

  // Resolve logo and initials via domain-first LogoService
  const resolved = React.useMemo(() => {
    return LogoService.resolveBrandLogo({
      id: effectiveId || undefined,
      name: effectiveName,
      website: effectiveDomain,
      canonical_domain: effectiveDomain,
      logo: effectiveStoredLogo || undefined,
      logo_url: effectiveStoredLogo || undefined,
    });
  }, [effectiveId, effectiveName, effectiveDomain, effectiveStoredLogo]);

  // Determine primary candidate image
  const primaryUrl = React.useMemo(() => {
    // If domain is provided explicitly, compute Logo.dev URL directly
    if (domain && domain.includes('.')) {
      // If user has organization-uploaded custom logo, honor it
      if (effectiveStoredLogo && !effectiveStoredLogo.includes('unsplash.com') && !effectiveStoredLogo.includes('img.logo.dev')) {
        return effectiveStoredLogo;
      }
      return LogoService.getBrandLogoUrl(domain);
    }
    return resolved.url || effectiveStoredLogo || null;
  }, [domain, effectiveStoredLogo, resolved.url]);

  const [currentSrc, setCurrentSrc] = useState<string | null>(primaryUrl);
  const [hasTriedFallback, setHasTriedFallback] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Sync state if props change
  useEffect(() => {
    setCurrentSrc(primaryUrl);
    setHasTriedFallback(false);
    setIsFailed(!primaryUrl);
    setIsLoading(Boolean(primaryUrl));
  }, [primaryUrl]);

  // Clean initials (e.g. Microsoft -> MS, Apple -> A, Nike -> NI, Tata -> TA)
  const initials = resolved.initials || LogoService.getBrandInitials(effectiveName);

  // Deterministic clean enterprise palette for initials container
  const getInitialsColor = (brandText: string) => {
    let hash = 0;
    for (let i = 0; i < brandText.length; i++) {
      hash = brandText.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return {
      bg: `hsl(${hue}, 65%, 96%)`,
      text: `hsl(${hue}, 80%, 32%)`,
      border: `hsl(${hue}, 50%, 86%)`,
    };
  };

  const color = getInitialsColor(effectiveName || 'Brand');

  // Dimension mapping
  const isNumberSize = typeof size === 'number';
  const sizeClasses: Record<string, string> = {
    sm: 'w-8 h-8 rounded-xl text-xs',
    md: 'w-12 h-12 rounded-2xl text-sm',
    lg: 'w-16 h-16 rounded-2xl text-base',
    xl: 'w-20 h-20 rounded-3xl text-xl',
  };

  const styleDimension = isNumberSize
    ? { width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }
    : undefined;

  const containerDimensionClass = isNumberSize ? 'rounded-2xl' : sizeClasses[size] || sizeClasses.md;

  const handleImageError = () => {
    if (!hasTriedFallback) {
      // Tier 1 fallback: try local SVG or domain favicon
      const fallbackUrl = LogoService.getFallbackImageUrl(domain, effectiveName);
      if (fallbackUrl && fallbackUrl !== currentSrc) {
        setHasTriedFallback(true);
        setCurrentSrc(fallbackUrl);
        return;
      }
    }
    // Tier 2 fallback: initials avatar (never show broken image)
    setIsFailed(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // 1. Initials Fallback View
  if (isFailed || !currentSrc) {
    return (
      <div
        className={`flex items-center justify-center font-bold tracking-tight select-none border shrink-0 transition-transform ${containerDimensionClass} ${className}`}
        style={{
          backgroundColor: color.bg,
          color: color.text,
          borderColor: color.border,
          ...styleDimension,
        }}
        title={effectiveName}
        aria-label={`${effectiveName} logo`}
      >
        <span>{initials}</span>
      </div>
    );
  }

  // 2. Active Image with Loading Skeleton
  return (
    <div
      className={`relative flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 overflow-hidden shrink-0 shadow-2xs ${containerDimensionClass} ${className}`}
      style={styleDimension}
    >
      {/* Loading Skeleton (fixed dimensions to eliminate layout shift) */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-100 dark:bg-slate-700/60 animate-pulse rounded-[inherit]" />
      )}

      <img
        src={currentSrc}
        alt={alt || `${effectiveName} logo`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
        decoding="async"
        className={`w-full h-full object-contain p-1 rounded-[inherit] transition-opacity duration-200 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  );
}
