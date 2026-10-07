'use client';

import React, { useState } from 'react';
import { Brand } from '@/types/brand';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Globe, RefreshCw, Building2, CheckCircle2, ExternalLink, Calendar, ShieldCheck } from 'lucide-react';
import { ScanModal } from '../dashboard/ScanModal';
import { UrlVerificationModal } from '@/components/verification/UrlVerificationModal';
import { BrandLogo } from '@/components/common/BrandLogo';

interface BrandHeaderProps {
  brand: Brand;
  onScanDone?: () => void;
}

export function BrandHeader({ brand, onScanDone }: BrandHeaderProps) {
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);

  return (
    <>
      <div className="apple-card p-6 sm:p-7 bg-white dark:bg-slate-900 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Brand Info Left */}
          <div className="flex items-start sm:items-center gap-4">
            <BrandLogo
              brandName={brand.name}
              domain={brand.logo_domain || brand.logoDomain || brand.website}
              logoUrl={brand.logo_url || brand.logoUrl || brand.logo}
              size="lg"
              className="rounded-2xl shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {brand.name}
                </h1>
                <StatusBadge status={brand.verificationStatus} size="sm" />
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                  {brand.company}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
                <a
                  href={`https://${brand.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[#007AFF] hover:underline font-medium"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{brand.website}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  Official Entity Profile
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Last scanned: {brand.lastScan}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons Right */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsVerifyOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all"
              title="Verify domain ownership"
            >
              <Globe className="w-3.5 h-3.5 text-[#007AFF]" />
              <span>Verify Domain</span>
            </button>

            <button
              onClick={() => setIsScanOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#007AFF] hover:bg-[#0066D6] rounded-xl shadow-xs shadow-blue-500/20 transition-all active:scale-98"
            >
              <RefreshCw className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Rescan Brand</span>
            </button>
          </div>
        </div>
      </div>

      <ScanModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        brandId={brand.id}
        brandName={brand.name}
        onScanComplete={onScanDone}
      />

      <UrlVerificationModal
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
        initialUrl={`https://${brand.website}`}
      />
    </>
  );
}

