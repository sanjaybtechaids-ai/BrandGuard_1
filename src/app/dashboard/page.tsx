'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { BrandShowcase } from '@/components/dashboard/BrandShowcase';
import { BrandPreviewStrip } from '@/components/dashboard/BrandPreviewStrip';
import { RiskStats } from '@/components/dashboard/RiskStats';
import { SuspiciousApps } from '@/components/dashboard/SuspiciousApps';
import { SuspiciousSocials } from '@/components/dashboard/SuspiciousSocials';
import { RiskTrend } from '@/components/dashboard/RiskTrend';
import { ImpersonationChart } from '@/components/dashboard/ImpersonationChart';
import { AIAssistant } from '@/components/dashboard/AIAssistant';
import { RecentThreats } from '@/components/dashboard/RecentThreats';
import { ScanModal } from '@/components/dashboard/ScanModal';
import { useBrandContext } from '@/context/BrandContext';
import { brands as fallbackBrands } from '@/data/brands';
import { threats as fallbackThreats } from '@/data/threats';
import { Brand } from '@/types/brand';
import { Threat } from '@/types/threat';

export default function DashboardPage() {
  const {
    availableBrands,
    selectedBrandId,
    setSelectedBrandId,
    selectedBrand,
  } = useBrandContext();

  const [brands, setBrands] = useState<Brand[]>(() =>
    availableBrands.length > 0
      ? availableBrands
      : fallbackBrands.filter((b) => !b.organizationId || b.organizationId === 'a0000000-0000-0000-0000-000000000001')
  );
  const [threats, setThreats] = useState<Threat[]>(fallbackThreats);
  const [activeBrandData, setActiveBrandData] = useState<Brand | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [scanBrandName, setScanBrandName] = useState('Apple');

  // Race-condition protection refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestCounterRef = useRef<number>(0);

  // Sync availableBrands from context
  useEffect(() => {
    if (availableBrands.length > 0) {
      setBrands(availableBrands);
    }
  }, [availableBrands]);

  // Sync activeIndex with selectedBrandId from context or URL
  useEffect(() => {
    if (brands.length === 0) return;
    if (selectedBrandId) {
      const idx = brands.findIndex(
        (b) =>
          b.id.toLowerCase() === selectedBrandId.toLowerCase() ||
          b.name.toLowerCase() === selectedBrandId.toLowerCase()
      );
      if (idx !== -1 && idx !== activeIndex) {
        setActiveIndex(idx);
      }
    }
  }, [selectedBrandId, brands]);

  // When activeIndex changes from carousel, update selectedBrandId in context
  const handleActiveIndexChange = useCallback(
    (newIndex: number) => {
      setActiveIndex(newIndex);
      const targetBrand = brands[newIndex];
      if (targetBrand) {
        setSelectedBrandId(targetBrand.id);
        setScanBrandName(targetBrand.name);
      }
    },
    [brands, setSelectedBrandId]
  );

  const activeBrand = useMemo(() => {
    return brands[activeIndex] || selectedBrand || brands[0] || null;
  }, [brands, activeIndex, selectedBrand]);

  // Fetch threats & active brand full details with AbortController and race condition cancellation
  useEffect(() => {
    if (!activeBrand) return;

    // Cancel prior in-flight requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const currentRequestId = ++requestCounterRef.current;

    const loadBrandTelemetry = async () => {
      try {
        const [brandRes, threatsRes] = await Promise.allSettled([
          fetch(`/api/brands/${encodeURIComponent(activeBrand.id)}`, {
            signal: controller.signal,
          }),
          fetch('/api/threats', {
            signal: controller.signal,
          }),
        ]);

        // If another request started or this one was aborted, ignore response
        if (requestCounterRef.current !== currentRequestId || controller.signal.aborted) {
          return;
        }

        if (brandRes.status === 'fulfilled' && brandRes.value.ok) {
          const bJson = await brandRes.value.json();
          if (bJson.success && bJson.data) {
            setActiveBrandData(bJson.data);
          } else {
            setActiveBrandData(activeBrand);
          }
        } else {
          setActiveBrandData(activeBrand);
        }

        if (threatsRes.status === 'fulfilled' && threatsRes.value.ok) {
          const tJson = await threatsRes.value.json();
          if (tJson.success && Array.isArray(tJson.data)) {
            setThreats(tJson.data);
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('[Dashboard] Telemetry fetch notice:', err);
        }
      }
    };

    loadBrandTelemetry();

    return () => {
      controller.abort();
    };
  }, [activeBrand?.id]);

  // Filter threats strictly for the active carousel brand
  const activeBrandThreats = useMemo(() => {
    if (!activeBrand) return [];
    const bId = activeBrand.id.toLowerCase();
    const bName = activeBrand.name.toLowerCase();

    return threats.filter((t) => {
      const tId = t.brandId?.toLowerCase() || '';
      const tName = t.brandName?.toLowerCase() || '';
      return tId === bId || tName === bName || t.name?.toLowerCase().includes(bName);
    });
  }, [threats, activeBrand]);

  // Pre-calculate threat counts per brand for the preview strip
  const brandThreatCounts = useMemo(() => {
    return threats.reduce<Record<string, number>>((acc, t) => {
      const idKey = t.brandId?.toLowerCase() || '';
      const nameKey = t.brandName?.toLowerCase() || '';
      if (idKey) acc[idKey] = (acc[idKey] || 0) + 1;
      if (nameKey) acc[nameKey] = (acc[nameKey] || 0) + 1;
      return acc;
    }, {});
  }, [threats]);

  const currentEffectiveBrand = activeBrandData || activeBrand;

  return (
    <AppShell>
      <div className="space-y-6 sm:space-y-8 w-full max-w-full overflow-x-hidden">
        {/* ROW 1: COMPACT BRAND SHOWCASE (280px-340px) */}
        <section aria-label="Brand Showcase" className="w-full">
          <BrandShowcase
            brands={brands}
            threats={threats}
            activeIndex={activeIndex}
            onActiveIndexChange={handleActiveIndexChange}
          />
        </section>

        {/* ROW 2: THREAT OVERVIEW & TELEMETRY FOR ACTIVE BRAND */}
        <section aria-label="Threat Overview">
          <RiskStats brand={currentEffectiveBrand} threats={activeBrandThreats} />
        </section>

        {/* ROW 3: PROTECTED BRANDS DIRECTORY & PREVIEW STRIP */}
        {brands.length > 0 && (
          <section aria-label="Protected Brands Directory" className="w-full">
            <BrandPreviewStrip
              brands={brands}
              activeIndex={activeIndex}
              onSelectBrand={handleActiveIndexChange}
              brandThreatCounts={brandThreatCounts}
            />
          </section>
        )}

        {/* ROW 4: SUSPICIOUS DETECTIONS FOR ACTIVE BRAND */}
        <section aria-label="Wild Detection Monitoring" className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SuspiciousApps brand={currentEffectiveBrand} />
          <SuspiciousSocials brand={currentEffectiveBrand} />
        </section>

        {/* ROW 5: THREAT TREND & IMPERSONATION VECTORS FOR ACTIVE BRAND */}
        <section aria-label="Threat Analytics" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <RiskTrend brand={currentEffectiveBrand} />
          <ImpersonationChart brand={currentEffectiveBrand} threats={activeBrandThreats} />
          <AIAssistant />
        </section>

        {/* ROW 6: ACTIVE IMPERSONATION THREATS FOR ACTIVE BRAND */}
        <section aria-label="Active Threats">
          <RecentThreats brand={currentEffectiveBrand} threats={activeBrandThreats} />
        </section>
      </div>

      {/* Global Scan Modal */}
      <ScanModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        brandId={currentEffectiveBrand?.id}
        brandName={currentEffectiveBrand?.name}
      />
    </AppShell>
  );
}
