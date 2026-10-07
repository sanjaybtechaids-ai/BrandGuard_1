'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Smartphone,
  Share2,
  RefreshCw,
  ExternalLink,
  Activity,
  CheckCircle2,
  ArrowRight,
  Clock,
  Building,
} from 'lucide-react';
import { Brand } from '@/types/brand';
import { Threat } from '@/types/threat';
import { DerivedBrandStats } from './BrandStats';
import { BrandLogo } from '@/components/common/BrandLogo';

interface BrandDetailOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  brand: Brand;
  stats: DerivedBrandStats;
  threats: Threat[];
  onScanNow: (brand: Brand) => void;
}

export function BrandDetailOverlay({
  isOpen,
  onClose,
  brand,
  stats,
  threats,
  onScanNow,
}: BrandDetailOverlayProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter threats for this brand
  const brandThreats = threats.filter(
    (t) =>
      t.brandId?.toLowerCase() === brand.id?.toLowerCase() ||
      t.brandName?.toLowerCase() === brand.name?.toLowerCase()
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/60 backdrop-blur-md transition-all duration-300 animate-in fade-in overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="brand-detail-title"
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col overflow-hidden my-auto transition-all duration-300 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar with Close */}
        <div className="p-6 sm:p-8 pb-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-4 sm:gap-5 min-w-0">
            {/* Brand Logo Avatar */}
            <BrandLogo
              brandName={brand.name}
              domain={brand.logo_domain || brand.logoDomain || brand.website}
              logoUrl={brand.logo_url || brand.logoUrl || brand.logo}
              size="lg"
              className="rounded-2xl shrink-0 shadow-sm"
            />

            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2
                  id="brand-detail-title"
                  className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight"
                >
                  {brand.name}
                </h2>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#007AFF] dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Trusted Identity ({brand.verificationConfidence || 98}%)</span>
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">
                {brand.company || brand.legalName} • {brand.category || 'Monitored Organization Brand'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close brand details"
            className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Quick Threat Status & Risk Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Threats */}
            <div
              className={`p-5 rounded-2xl border ${
                stats.threats > 0
                  ? 'bg-red-500/5 dark:bg-red-950/20 border-red-200/80 dark:border-red-900/40'
                  : 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Threat Status
                </span>
                {stats.threats > 0 ? (
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                )}
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {stats.threats > 0 ? (
                  <span className="text-red-600 dark:text-red-400">
                    {stats.criticalThreats + stats.highThreats} High-Risk
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400">Zero Threats</span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {stats.threats > 0
                  ? 'Impersonation targets detected in live wild scans'
                  : 'Brand digital namespace clean & protected'}
              </p>
            </div>

            {/* Risk Score */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Risk Score
                </span>
                <Activity className="w-4 h-4 text-[#007AFF]" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                <span
                  className={
                    stats.riskScore >= 70
                      ? 'text-red-600 dark:text-red-400'
                      : stats.riskScore >= 40
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }
                >
                  {stats.riskScore}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-normal ml-1">
                  / 100
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Multi-vector algorithmic exposure coefficient
              </p>
            </div>

            {/* Last Verified / Scan */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Scan Status
                </span>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-white truncate">
                {brand.lastScan || 'Active Continuous'}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Status: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{brand.status || 'Active'}</span>
              </p>
            </div>
          </div>

          {/* Official Assets Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Verified Digital Assets
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Official Website */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                  <Globe className="w-4 h-4 text-[#007AFF]" />
                  <span>Official Website</span>
                </div>
                <a
                  href={`https://${brand.website.replace(/^https?:\/\//, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-slate-900 dark:text-white text-sm hover:text-[#007AFF] inline-flex items-center gap-1.5 truncate"
                >
                  <span className="truncate">{brand.website}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-60" />
                </a>
              </div>

              {/* Official Apps */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                  <Smartphone className="w-4 h-4 text-[#007AFF]" />
                  <span>Official Applications</span>
                </div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  {stats.apps} Verified Apps
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  Google Play & Apple App Store
                </p>
              </div>

              {/* Official Social Accounts */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                  <Share2 className="w-4 h-4 text-[#007AFF]" />
                  <span>Social Channels</span>
                </div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  {stats.socialAccounts} Verified Handles
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  Instagram, X, YouTube, LinkedIn
                </p>
              </div>
            </div>
          </div>

          {/* Recent Threats for this Brand */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Recent Detected Threats
              </h3>
              {brandThreats.length > 0 && (
                <Link
                  href={`/threats?brand=${encodeURIComponent(brand.name)}`}
                  className="text-xs font-semibold text-[#007AFF] hover:underline"
                >
                  View All ({brandThreats.length})
                </Link>
              )}
            </div>

            {brandThreats.length > 0 ? (
              <div className="space-y-2.5">
                {brandThreats.slice(0, 3).map((threat) => (
                  <div
                    key={threat.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                        <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                          {threat.candidateName || threat.name}
                        </span>
                      </div>
                      {threat.url && (
                        <span className="text-[11px] font-mono text-slate-400 truncate block mt-0.5">
                          {threat.url}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                        {threat.riskScore} — {threat.riskLevel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                No active threats detected for {brand.name}.
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Brand baseline: <span className="font-semibold text-slate-600 dark:text-slate-300">{brand.headquarters || 'Enterprise Protected'}</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                onClose();
                onScanNow(brand);
              }}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Scan Now</span>
            </button>

            <Link
              href={`/brands/${brand.id}`}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#007AFF] hover:bg-[#0066D6] text-white text-xs font-semibold transition-all shadow-xs active:scale-95"
            >
              <span>Open Brand Profile</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="hidden sm:inline-flex px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
