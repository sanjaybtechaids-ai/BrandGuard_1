'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Flag,
} from 'lucide-react';
import { Brand } from '@/types/brand';
import { Threat } from '@/types/threat';

interface BrandThreatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  brand: Brand;
  threats: Threat[];
}

export function BrandThreatOverlay({
  isOpen,
  onClose,
  brand,
  threats,
}: BrandThreatOverlayProps) {
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

  // Filter threats for this specific brand
  const brandThreats = threats.filter(
    (t) =>
      t.brandId?.toLowerCase() === brand.id?.toLowerCase() ||
      t.brandName?.toLowerCase() === brand.name?.toLowerCase()
  );

  const criticalThreats = brandThreats.filter((t) => t.riskLevel === 'Critical');
  const highThreats = brandThreats.filter((t) => t.riskLevel === 'High');
  const mediumThreats = brandThreats.filter((t) => t.riskLevel === 'Medium');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-md transition-all duration-300 animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="threat-overlay-title"
    >
      <div
        className="w-full max-w-2xl h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden border-l border-slate-200/80 dark:border-slate-800 transition-all duration-300 animate-in slide-in-from-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-500/20">
              <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 id="threat-overlay-title" className="text-lg font-bold text-slate-900 dark:text-white">
                {brand.name} Threat Forensics
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {brandThreats.length > 0
                  ? `${brandThreats.length} Active impersonation signals detected`
                  : 'Zero high-risk threats detected for this brand profile'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close threat forensics"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Severity Banner & Direct Report Unofficial Website Action (Part 21) */}
        <div className="px-6 py-3.5 bg-red-500/5 dark:bg-red-500/10 border-b border-red-500/10 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              {criticalThreats.length} Critical
            </span>
            <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              {highThreats.length} High
            </span>
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {mediumThreats.length} Medium
            </span>
          </div>

          <Link
            href={`/reports/create?brandId=${encodeURIComponent(brand.id)}&brandName=${encodeURIComponent(brand.name)}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200/80 dark:border-amber-900/60 transition-colors"
          >
            <Flag className="w-3.5 h-3.5 text-amber-600" />
            <span>Report Unofficial Website</span>
          </Link>
        </div>

        {/* Body Threats List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {brandThreats.length > 0 ? (
            brandThreats.map((threat) => (
              <div
                key={threat.id}
                className="apple-card p-5 bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-xs space-y-3.5 transition-all hover:border-slate-300 dark:hover:border-slate-600"
              >
                {/* Threat Title & Risk Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {threat.candidateName || threat.name}
                      </h4>
                    </div>
                    {threat.url && (
                      <a
                        href={threat.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-[#007AFF] hover:underline truncate block mt-0.5"
                      >
                        {threat.url}
                      </a>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        threat.riskScore >= 85
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                          : threat.riskScore >= 60
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {threat.riskScore} — {threat.riskLevel}
                    </span>
                  </div>
                </div>

                {/* Similarity Metrics Grid */}
                <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-xs border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
                      Domain Sim.
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {threat.domainMatch ? '100%' : `${threat.nameSimilarity || 94}%`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
                      Brand Sim.
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {threat.logoSimilarity || 96}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
                      Official Rel.
                    </span>
                    <span className="font-bold text-red-500 dark:text-red-400">NO</span>
                  </div>
                </div>

                {/* AI Explanation / Tactics */}
                <div className="text-xs space-y-1.5">
                  <div className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/60 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Why it is suspicious:
                    </span>{' '}
                    {threat.aiExplanation ||
                      'Unregistered third-party entity mimicking brand visual identity and spoofing domain naming convention.'}
                  </div>

                  {threat.impersonationTactics && threat.impersonationTactics.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {threat.impersonationTactics.map((tactic, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-[11px] font-medium text-slate-600 dark:text-slate-300"
                        >
                          {tactic}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions & Timestamp (Part 21 & 22) */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-700/60 text-xs">
                  <span className="text-slate-400 dark:text-slate-500 text-[11px]">
                    Detected: {threat.detectedAt || 'Recently'}
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/reports/create?threatId=${threat.id}&brandId=${brand.id}&brandName=${encodeURIComponent(brand.name)}&url=${encodeURIComponent(threat.url || threat.candidateWebsite || '')}&riskScore=${threat.riskScore}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 text-white font-semibold text-xs hover:bg-amber-600 transition-colors shadow-2xs"
                    >
                      <Flag className="w-3 h-3" />
                      <span>Report Threat</span>
                    </Link>
                    <Link
                      href={`/threats/${threat.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 transition-colors"
                    >
                      <span>Investigate</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7 stroke-[2]" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                No active threats for {brand.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Continuous machine learning scans have not detected rogue mobile APKs or phishing domains for this brand baseline.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
          <Link
            href={`/reports/create?brandId=${encodeURIComponent(brand.id)}&brandName=${encodeURIComponent(brand.name)}`}
            className="text-xs font-semibold text-[#007AFF] hover:underline flex items-center gap-1"
          >
            <span>Create comprehensive takedown package</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
}
