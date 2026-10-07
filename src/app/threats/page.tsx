'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/common/PageHeader';
import { ThreatTable } from '@/components/threats/ThreatTable';
import { ScanModal } from '@/components/dashboard/ScanModal';
import { getThreats } from '@/services/threats.service';
import { Threat } from '@/types/threat';
import { threats as seedThreats } from '@/data/threats';
import { Play, Download, Globe } from 'lucide-react';
import { useToast } from '@/components/common/ToastProvider';
import { UrlVerificationModal } from '@/components/verification/UrlVerificationModal';
import { useBrandContext } from '@/context/BrandContext';

function ThreatCenterContent() {
  const searchParams = useSearchParams();
  const { selectedBrand, availableBrands } = useBrandContext();
  const [threatsList, setThreatsList] = useState<Threat[]>(seedThreats);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const toast = useToast();

  const brandParam = searchParams.get('brand') || searchParams.get('search');

  // Compute initialBrandFilter: match against available brands, default to active brand context
  const initialBrandFilter = useMemo(() => {
    if (brandParam) {
      const match = availableBrands.find(
        (b) => b.id.toLowerCase() === brandParam.toLowerCase() || b.name.toLowerCase() === brandParam.toLowerCase()
      );
      if (match) return match.name;
    }
    return selectedBrand?.name || 'all';
  }, [brandParam, selectedBrand?.name, availableBrands]);

  useEffect(() => {
    async function load() {
      const data = await getThreats();
      setThreatsList(data);
    }
    load();
  }, []);

  const handleExportCSV = () => {
    toast.success('Threat Ledger Exported', 'Downloaded complete threat intelligence dataset in CSV format.');
  };

  return (
    <>
      <PageHeader
        title="Threat Center"
        subtitle="Review, prioritize, and investigate detected brand impersonation threats across global app stores and social ecosystems."
        badge={
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-semibold border border-rose-200 dark:border-rose-900/60">
            {threatsList.length} Active Candidates
          </span>
        }
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsVerifyOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#007AFF] bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 dark:text-blue-300 rounded-xl border border-blue-200/60 dark:border-blue-900/60 transition-colors shadow-xs"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Verify URL</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 rounded-xl shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setIsScanOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#007AFF] hover:bg-[#0066D6] rounded-xl shadow-sm shadow-[#007AFF]/20 transition-all active:scale-98"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Initiate Scan</span>
            </button>
          </div>
        }
      />

      <ThreatTable initialThreats={threatsList} initialBrandFilter={initialBrandFilter} />

      <ScanModal
        isOpen={isScanOpen}
        onClose={() => {
          setIsScanOpen(false);
          getThreats(selectedBrand?.id).then(setThreatsList);
        }}
        brandId={selectedBrand?.id}
        brandName={selectedBrand?.name}
      />

      <UrlVerificationModal
        isOpen={isVerifyOpen}
        onClose={() => {
          setIsVerifyOpen(false);
          getThreats().then(setThreatsList);
        }}
      />
    </>
  );
}

export default function ThreatCenterPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading threat center...</div>}>
        <ThreatCenterContent />
      </Suspense>
    </AppShell>
  );
}
