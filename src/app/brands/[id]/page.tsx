'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { BrandProfile } from '@/components/brands/BrandProfile';
import { LoadingState } from '@/components/common/LoadingState';
import { Brand, OfficialApp, OfficialSocial } from '@/types/brand';
import { Threat } from '@/types/threat';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { useToast } from '@/components/common/ToastProvider';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BrandDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const toast = useToast();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [officialApps, setOfficialApps] = useState<OfficialApp[]>([]);
  const [suspiciousApps, setSuspiciousApps] = useState<OfficialApp[]>([]);
  const [verifiedSocials, setVerifiedSocials] = useState<OfficialSocial[]>([]);
  const [suspiciousSocials, setSuspiciousSocials] = useState<OfficialSocial[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [riskDistribution, setRiskDistribution] = useState<any>(null);
  const [riskTrend, setRiskTrend] = useState<Array<{ date: string; count: number }>>([]);
  const [threatCategories, setThreatCategories] = useState<Array<{ category: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadBrandData() {
      setLoading(true);
      try {
        const brandId = resolvedParams.id;
        const brandRes = await fetch(`/api/brands/${encodeURIComponent(brandId)}`);
        const brandJson = await brandRes.json();

        if (brandJson.success && brandJson.data) {
          if (!isMounted) return;
          const currentBrand: Brand = brandJson.data;
          setBrand(currentBrand);

          // Concurrently fetch isolated brand datasets
          const [appsRes, socialRes, threatsRes, statsRes, trendRes, distRes, catRes] = await Promise.all([
            fetch(`/api/brands/${encodeURIComponent(brandId)}/apps`).catch(() => null),
            fetch(`/api/brands/${encodeURIComponent(brandId)}/social`).catch(() => null),
            fetch(`/api/brands/${encodeURIComponent(brandId)}/threats`).catch(() => null),
            fetch(`/api/brands/${encodeURIComponent(brandId)}/stats`).catch(() => null),
            fetch(`/api/brands/${encodeURIComponent(brandId)}/risk-trend`).catch(() => null),
            fetch(`/api/brands/${encodeURIComponent(brandId)}/risk-distribution`).catch(() => null),
            fetch(`/api/brands/${encodeURIComponent(brandId)}/threat-categories`).catch(() => null),
          ]);

          if (!isMounted) return;

          if (appsRes?.ok) {
            const appsJson = await appsRes.json();
            if (appsJson.success && appsJson.data) {
              setOfficialApps(
                (appsJson.data.officialApps && appsJson.data.officialApps.length > 0)
                  ? appsJson.data.officialApps
                  : (currentBrand.officialApps || [])
              );
              setSuspiciousApps(appsJson.data.suspiciousApps || []);
            } else {
              setOfficialApps(currentBrand.officialApps || []);
            }
          } else {
            setOfficialApps(currentBrand.officialApps || []);
          }

          if (socialRes?.ok) {
            const socialJson = await socialRes.json();
            if (socialJson.success && socialJson.data) {
              setVerifiedSocials(
                (socialJson.data.verifiedSocials && socialJson.data.verifiedSocials.length > 0)
                  ? socialJson.data.verifiedSocials
                  : (currentBrand.officialSocials || [])
              );
              setSuspiciousSocials(socialJson.data.suspiciousSocials || []);
            } else {
              setVerifiedSocials(currentBrand.officialSocials || []);
            }
          } else {
            setVerifiedSocials(currentBrand.officialSocials || []);
          }

          if (threatsRes?.ok) {
            const threatsJson = await threatsRes.json();
            if (threatsJson.success && Array.isArray(threatsJson.data)) {
              setThreats(threatsJson.data);
            }
          }

          if (statsRes?.ok) {
            const statsJson = await statsRes.json();
            if (statsJson.success) setStats(statsJson.data);
          }

          if (trendRes?.ok) {
            const trendJson = await trendRes.json();
            if (trendJson.success && Array.isArray(trendJson.data)) {
              setRiskTrend(trendJson.data);
            }
          }

          if (distRes?.ok) {
            const distJson = await distRes.json();
            if (distJson.success) setRiskDistribution(distJson.data);
          }

          if (catRes?.ok) {
            const catJson = await catRes.json();
            if (catJson.success && Array.isArray(catJson.data)) {
              setThreatCategories(catJson.data);
            }
          }
        } else {
          if (isMounted) setBrand(null);
        }
      } catch (err) {
        console.error('[BrandDetailPage] Error loading brand profile:', err);
        if (isMounted) setBrand(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadBrandData();

    return () => {
      isMounted = false;
    };
  }, [resolvedParams.id]);

  const handleRefreshIdentity = async () => {
    if (!brand) return;
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/brands/${encodeURIComponent(brand.id)}/refresh-identity`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success && data.data) {
        // Reload brand profile and sub-resources
        const [refreshedRes, appsRes, socialRes] = await Promise.all([
          fetch(`/api/brands/${encodeURIComponent(brand.id)}`),
          fetch(`/api/brands/${encodeURIComponent(brand.id)}/apps`),
          fetch(`/api/brands/${encodeURIComponent(brand.id)}/social`),
        ]);
        const refreshedJson = await refreshedRes.json();
        if (refreshedJson.success && refreshedJson.data) {
          setBrand(refreshedJson.data);
        }
        if (appsRes.ok) {
          const appsJson = await appsRes.json();
          if (appsJson.success && appsJson.data) {
            setOfficialApps(appsJson.data.officialApps || []);
            setSuspiciousApps(appsJson.data.suspiciousApps || []);
          }
        }
        if (socialRes.ok) {
          const socialJson = await socialRes.json();
          if (socialJson.success && socialJson.data) {
            setVerifiedSocials(socialJson.data.verifiedSocials || []);
            setSuspiciousSocials(socialJson.data.suspiciousSocials || []);
          }
        }
        toast.success(
          'Identity Refreshed',
          `Re-evaluated multi-source evidence signals. Confidence: ${data.data.confidenceScore}%`
        );
      } else {
        throw new Error(data.error?.message || 'Refresh failed');
      }
    } catch (err: unknown) {
      toast.error('Refresh Failed', (err as Error).message);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <LoadingState message="Retrieving trusted brand identity signatures..." />
      </AppShell>
    );
  }

  if (!brand) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto text-center py-20 px-6 apple-card bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm my-10">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
            <ShieldAlert className="w-8 h-8 stroke-[2]" />
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Brand Not Found
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            This brand could not be found in your organization&apos;s protected registry.
          </p>

          <div className="mt-6">
            <Link
              href="/brands"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#007AFF] hover:bg-[#0066D6] rounded-xl shadow-xs transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Protected Brands</span>
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Back button */}
      <div className="mb-4">
        <Link
          href="/brands"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Protected Brands</span>
        </Link>
      </div>

      {/* Brand Profile Template */}
      <BrandProfile
        brand={brand}
        threats={threats}
        officialApps={officialApps}
        suspiciousApps={suspiciousApps}
        verifiedSocials={verifiedSocials}
        suspiciousSocials={suspiciousSocials}
        stats={stats}
        riskDistribution={riskDistribution}
        riskTrend={riskTrend}
        threatCategories={threatCategories}
        onRefreshIdentity={handleRefreshIdentity}
        isRefreshing={isRefreshing}
      />
    </AppShell>
  );
}
