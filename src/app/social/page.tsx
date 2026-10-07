'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchBar } from '@/components/common/SearchBar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ScanModal } from '@/components/dashboard/ScanModal';
import { monitoredSocials as fallbackSocials } from '@/data/social';
import { MonitoredSocial } from '@/types/social';
import { useBrandContext } from '@/context/BrandContext';
import {
  Share2,
  RefreshCw,
  CheckCircle2,
  AlertOctagon,
  ChevronRight,
  ShieldCheck,
  Flag,
  Filter,
} from 'lucide-react';

function SocialMonitoringContent() {
  const searchParams = useSearchParams();
  const { selectedBrand, availableBrands, setSelectedBrandId } = useBrandContext();

  const brandParam = searchParams.get('brand');
  const [activeBrandName, setActiveBrandName] = useState<string>(() => {
    if (brandParam) {
      const match = availableBrands.find(
        (b) => b.id.toLowerCase() === brandParam.toLowerCase() || b.name.toLowerCase() === brandParam.toLowerCase()
      );
      if (match) return match.name;
    }
    return selectedBrand?.name || 'Apple';
  });

  const [search, setSearch] = useState('');
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [socials, setSocials] = useState<MonitoredSocial[]>(fallbackSocials);

  // Sync activeBrandName when context or query changes
  useEffect(() => {
    if (brandParam) {
      const match = availableBrands.find(
        (b) => b.id.toLowerCase() === brandParam.toLowerCase() || b.name.toLowerCase() === brandParam.toLowerCase()
      );
      if (match) {
        setActiveBrandName(match.name);
        return;
      }
    }
    if (selectedBrand?.name) {
      setActiveBrandName(selectedBrand.name);
    }
  }, [brandParam, selectedBrand?.name, availableBrands]);

  // Load socials from API if available
  useEffect(() => {
    async function loadSocials() {
      try {
        const res = await fetch('/api/social');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setSocials(json.data);
          }
        }
      } catch {
        // Fallback
      }
    }
    loadSocials();
  }, []);

  const handleBrandChange = (brandName: string) => {
    setActiveBrandName(brandName);
    if (brandName !== 'ALL') {
      const match = availableBrands.find((b) => b.name.toLowerCase() === brandName.toLowerCase());
      if (match) setSelectedBrandId(match.id);
    }
  };

  // Filter socials strictly for active brand context (Part 16 & 18)
  const scopedSocials = useMemo(() => {
    let list = socials;
    if (activeBrandName !== 'ALL') {
      const bLower = activeBrandName.toLowerCase();
      list = list.filter(
        (s) =>
          s.brandName.toLowerCase() === bLower ||
          s.brandId.toLowerCase() === bLower ||
          s.displayName.toLowerCase().includes(bLower) ||
          s.username.toLowerCase().includes(bLower)
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.username.toLowerCase().includes(q) ||
          s.displayName.toLowerCase().includes(q) ||
          s.brandName.toLowerCase().includes(q) ||
          s.platform.toLowerCase().includes(q)
      );
    }

    return list;
  }, [socials, activeBrandName, search]);

  // Separate strictly into Verified vs Suspicious (Part 18)
  const verifiedSocials = useMemo(() => {
    return scopedSocials.filter(
      (s) => s.isOfficial || s.verificationStatus === 'VERIFIED_OFFICIAL' || s.verificationStatus === 'LIKELY_OFFICIAL'
    );
  }, [scopedSocials]);

  const suspiciousSocials = useMemo(() => {
    return scopedSocials.filter(
      (s) => !s.isOfficial && s.verificationStatus !== 'VERIFIED_OFFICIAL' && s.verificationStatus !== 'LIKELY_OFFICIAL'
    );
  }, [scopedSocials]);

  const stats = useMemo(() => {
    return {
      accountsScanned: scopedSocials.length,
      verifiedCount: verifiedSocials.length,
      potentialImpersonations: suspiciousSocials.length,
      critical: suspiciousSocials.filter((s) => s.riskScore >= 80).length,
    };
  }, [scopedSocials, verifiedSocials, suspiciousSocials]);

  return (
    <AppShell>
      <PageHeader
        title="Social Monitoring"
        subtitle="Monitor official handles and detect rogue impersonation accounts across Instagram, X, TikTok, YouTube, and Telegram."
        actions={
          <button
            onClick={() => setIsScanOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#007AFF] hover:bg-[#0066D6] rounded-xl shadow-xs shadow-blue-500/20 transition-all active:scale-98"
          >
            <RefreshCw className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Scan Social Feeds</span>
          </button>
        }
      />

      {/* Brand Context Scope Filter Bar (Part 16 & 18) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs mb-6">
        <div className="flex items-center gap-2.5">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Brand Scope:
          </span>
          <select
            value={activeBrandName}
            onChange={(e) => handleBrandChange(e.target.value)}
            className="text-xs font-bold p-1.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
          >
            {availableBrands.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name} {selectedBrand?.id === b.id ? ' (Active)' : ''}
              </option>
            ))}
            <option value="ALL">All Brands (Consolidated Overview)</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Monitoring <span className="font-bold text-[#007AFF]">{activeBrandName === 'ALL' ? 'All Protected Brands' : activeBrandName}</span>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="apple-card p-5 bg-white dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Monitored Profiles</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {stats.accountsScanned}
          </p>
          <span className="text-[11px] text-slate-400">X, Instagram, YouTube</span>
        </div>

        <div className="apple-card p-5 bg-white dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Verified Channels</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {stats.verifiedCount}
          </p>
          <span className="text-[11px] text-emerald-600/80">Trusted identity</span>
        </div>

        <div className="apple-card p-5 bg-white dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Impersonators</span>
          <p className="text-2xl font-black text-amber-500 mt-1">
            {stats.potentialImpersonations}
          </p>
          <span className="text-[11px] text-amber-500">Fake support accounts</span>
        </div>

        <div className="apple-card p-5 bg-white dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Critical Phishing</span>
          <p className="text-2xl font-black text-red-500 mt-1">
            {stats.critical}
          </p>
          <span className="text-[11px] text-red-500">Malicious bio links</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search handles, display names, or platforms..."
          className="w-full sm:max-w-md"
        />
      </div>

      {/* SECTION A: VERIFIED SOCIAL ACCOUNTS (Part 18) */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Verified Social Accounts ({verifiedSocials.length})
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60">
              Official Channels
            </span>
          </div>
        </div>

        {verifiedSocials.length === 0 ? (
          <div className="apple-card p-8 text-center bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              No verified social accounts discovered yet.
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Add or discover verified handles for {activeBrandName} to monitor spoofing attempts.
            </p>
          </div>
        ) : (
          <div className="apple-card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Handle</th>
                    <th className="py-3 px-4">Brand</th>
                    <th className="py-3 px-4">Display Name</th>
                    <th className="py-3 px-4">Platform</th>
                    <th className="py-3 px-4">Classification</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {verifiedSocials.map((soc) => (
                    <tr key={soc.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {soc.username.replace('@', '').charAt(0).toUpperCase()}
                          </div>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">{soc.username}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">{soc.brandName}</td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">{soc.displayName}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{soc.platform}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/80">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          VERIFIED
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Protected Baseline</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SECTION B: SUSPICIOUS / CANDIDATE SOCIAL ACCOUNTS (Part 18) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Suspicious Social Accounts ({suspiciousSocials.length})
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60">
              Active Impersonators
            </span>
          </div>
        </div>

        {suspiciousSocials.length === 0 ? (
          <div className="apple-card p-8 text-center bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              Zero suspicious social accounts detected for {activeBrandName}.
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Social graph scanners report zero active handle typosquatting or spoofing.
            </p>
          </div>
        ) : (
          <div className="apple-card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Candidate Profile</th>
                    <th className="py-3 px-4">Target Brand</th>
                    <th className="py-3 px-4">Platform</th>
                    <th className="py-3 px-4">Similarity</th>
                    <th className="py-3 px-4">Risk</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {suspiciousSocials.map((soc) => (
                    <tr key={soc.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-rose-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {soc.username.replace('@', '').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{soc.displayName || soc.username}</p>
                            <code className="text-[10px] text-slate-400 font-mono">{soc.username}</code>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">{soc.brandName}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{soc.platform}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">{soc.similarityScore}%</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${
                            soc.riskScore >= 80
                              ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400'
                              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400'
                          }`}
                        >
                          {soc.riskScore} / 100
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={soc.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/reports/create?brandId=${encodeURIComponent(soc.brandId)}&brandName=${encodeURIComponent(soc.brandName)}&candidateName=${encodeURIComponent(soc.username)}&type=SOCIAL&riskScore=${soc.riskScore}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 rounded-lg border border-amber-200/80 transition-colors"
                            title="Report Impersonation Profile"
                          >
                            <Flag className="w-3 h-3 text-amber-600" />
                            Report
                          </Link>
                          {soc.threatId && (
                            <Link
                              href={`/threats/${soc.threatId}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              Details
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <ScanModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        brandId={selectedBrand?.id}
        brandName={activeBrandName !== 'ALL' ? activeBrandName : selectedBrand?.name}
        scanType="SOCIAL"
      />
    </AppShell>
  );
}

export default function SocialMonitoringPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading social account monitoring...</div>}>
      <SocialMonitoringContent />
    </Suspense>
  );
}
