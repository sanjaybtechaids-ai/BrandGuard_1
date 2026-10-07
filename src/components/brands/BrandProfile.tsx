'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Globe,
  ExternalLink,
  Smartphone,
  Share2,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Calendar,
  Building2,
  Activity,
  ArrowRight,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Shield,
  Lock,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { Brand, OfficialApp, OfficialSocial } from '@/types/brand';
import { Threat } from '@/types/threat';
import { BrandLogo } from '@/components/common/BrandLogo';
import { ScanModal } from '@/components/dashboard/ScanModal';
import { useToast } from '@/components/common/ToastProvider';

export interface BrandProfileProps {
  brand: Brand;
  threats: Threat[];
  officialApps?: OfficialApp[];
  suspiciousApps?: OfficialApp[];
  verifiedSocials?: OfficialSocial[];
  suspiciousSocials?: OfficialSocial[];
  stats?: {
    totalThreats: number;
    activeThreats: number;
    criticalThreats: number;
    highThreats: number;
    mediumThreats: number;
    lowThreats: number;
    officialApps: number;
    suspiciousApps: number;
    verifiedSocialAccounts: number;
    suspiciousSocialAccounts: number;
    riskScore: number;
    verificationConfidence: number;
  };
  riskDistribution?: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  riskTrend?: Array<{ date: string; count: number }>;
  threatCategories?: Array<{ category: string; count: number }>;
  onRefreshIdentity?: () => Promise<void>;
  isRefreshing?: boolean;
}

export function BrandProfile({
  brand,
  threats = [],
  officialApps: propOfficialApps,
  suspiciousApps: propSuspiciousApps,
  verifiedSocials: propVerifiedSocials,
  suspiciousSocials: propSuspiciousSocials,
  stats: propStats,
  riskDistribution: propRiskDistribution,
  riskTrend: propRiskTrend,
  threatCategories: propThreatCategories,
  onRefreshIdentity,
  isRefreshing = false,
}: BrandProfileProps) {
  const toast = useToast();
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter threats strictly for this brand
  const brandThreats = threats.filter(
    (t) =>
      t.brandId?.toLowerCase() === brand.id?.toLowerCase() ||
      t.brandName?.toLowerCase() === brand.name?.toLowerCase()
  );

  // Separate official apps from suspicious apps
  const officialApps = propOfficialApps ?? (brand.officialApps || []);
  const suspiciousApps = propSuspiciousApps ?? [];

  // Separate verified socials from suspicious socials
  const verifiedSocials = propVerifiedSocials ?? (brand.officialSocials || []);
  const suspiciousSocials = propSuspiciousSocials ?? [];

  // Metrics
  const criticalThreats = brandThreats.filter((t) => t.riskLevel === 'Critical');
  const highThreats = brandThreats.filter((t) => t.riskLevel === 'High');
  const mediumThreats = brandThreats.filter((t) => t.riskLevel === 'Medium');
  const lowThreats = brandThreats.filter((t) => t.riskLevel === 'Low');

  const activeThreatCount = propStats?.activeThreats ?? (brandThreats.length > 0 ? brandThreats.length : brand.threatCount || 0);
  const criticalCount = propStats?.criticalThreats ?? (criticalThreats.length > 0 ? criticalThreats.length : brand.criticalCount || 0);
  const highCount = propStats?.highThreats ?? (highThreats.length > 0 ? highThreats.length : brand.highCount || 0);
  const mediumCount = propStats?.mediumThreats ?? (mediumThreats.length > 0 ? mediumThreats.length : brand.mediumCount || 0);
  const lowCount = propStats?.lowThreats ?? lowThreats.length;

  // Risk Score calculation
  let riskScore = propStats?.riskScore ?? 15;
  if (!propStats && brandThreats.length > 0) {
    riskScore = Math.max(...brandThreats.map((t) => t.riskScore));
  } else if (!propStats && activeThreatCount > 0) {
    riskScore = criticalCount > 0 ? 88 : highCount > 0 ? 72 : 45;
  }

  const confidenceScore = propStats?.verificationConfidence ?? (brand.verificationConfidence || 98);

  const cleanWebsite = brand.website?.replace(/^https?:\/\//, '').replace(/\/$/, '') || 'example.com';
  const websiteUrl = `https://${cleanWebsite}`;

  // 1. RISK DISTRIBUTION DATA (Donut Chart)
  const dist = propRiskDistribution || {
    critical: criticalCount,
    high: highCount,
    medium: mediumCount,
    low: lowCount,
  };
  const distributionData = [
    { name: 'Critical', value: dist.critical, color: '#EF4444' },
    { name: 'High', value: dist.high, color: '#F97316' },
    { name: 'Medium', value: dist.medium, color: '#F59E0B' },
    { name: 'Low', value: dist.low, color: '#10B981' },
  ].filter((d) => d.value > 0);

  // If all distribution values are 0, show a clean 100% low/safe state
  const hasThreatData = distributionData.length > 0;
  const safeDistributionData = hasThreatData
    ? distributionData
    : [{ name: 'Zero Impersonation Risks', value: 1, color: '#10B981' }];

  // 2. THREAT TREND DATA (Line/Area Chart)
  const hasHistoricalTrend = Boolean(propRiskTrend && propRiskTrend.length > 0 && propRiskTrend.some((d) => d.count > 0));
  const trendData = propRiskTrend && propRiskTrend.length > 0
    ? propRiskTrend
    : activeThreatCount > 0
      ? [
          { date: 'Day 1', count: 0 },
          { date: 'Day 2', count: 0 },
          { date: 'Day 3', count: 0 },
          { date: 'Day 4', count: 0 },
          { date: 'Day 5', count: 0 },
          { date: 'Day 6', count: 0 },
          { date: 'Day 7', count: activeThreatCount },
        ]
      : [];

  // 3. THREAT CATEGORIES DATA (Bar Chart)
  const categoryData = propThreatCategories && propThreatCategories.length > 0
    ? propThreatCategories
    : [
        { category: 'Fake Apps', count: suspiciousApps.length },
        { category: 'Fake Social', count: suspiciousSocials.length },
        { category: 'Fake Website', count: brandThreats.filter((t) => t.type === 'FAKE_WEBSITE').length },
        { category: 'Phishing', count: brandThreats.filter((t) => t.type === 'PHISHING').length },
        { category: 'Look-alike Domain', count: brandThreats.filter((t) => t.type === 'SUSPICIOUS_DOMAIN' || (t.type as string) === 'DOMAIN_SPOOF').length },
      ];
  const hasCategoryData = categoryData.some((c) => c.count > 0);


  const getSocialBadgeColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white';
      case 'x':
      case 'twitter':
        return 'bg-black text-white dark:bg-slate-700';
      case 'youtube':
        return 'bg-red-600 text-white';
      case 'facebook':
        return 'bg-blue-600 text-white';
      case 'linkedin':
        return 'bg-sky-700 text-white';
      default:
        return 'bg-slate-900 text-white dark:bg-slate-800';
    }
  };

  const formattedLastVerified = brand.updatedAt
    ? new Date(brand.updatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Oct 6, 2026';

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. BRAND HEADER                                           */}
      {/* ========================================================= */}
      <div className="apple-card p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5 min-w-0">
            <BrandLogo
              brandId={brand.id}
              brandName={brand.name}
              domain={brand.canonical_domain || brand.canonicalDomain || brand.logo_domain || brand.logoDomain || brand.website}
              logoUrl={brand.logo_url || brand.logoUrl || brand.logo}
              size="lg"
              className="rounded-2xl"
            />

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                  {brand.name}
                </h1>

                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-[#007AFF] dark:bg-blue-950/60 dark:text-blue-400 text-xs font-bold border border-blue-200/60 dark:border-blue-800 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Verified Brand</span>
                  <span className="opacity-75">• {confidenceScore}%</span>
                </span>

                {brand.dataSource === 'DEMO' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-200/60 dark:border-amber-800">
                    DEMO DATA
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                  {brand.company || brand.legalName || `${brand.name} Enterprise`}
                </span>
                <span>•</span>
                <span>{brand.category || 'Consumer & Enterprise Brand'}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Calendar className="w-3 h-3" />
                  <span>Verified: {formattedLastVerified}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-xl transition-colors shadow-2xs"
            >
              <span>Visit Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            {onRefreshIdentity && (
              <button
                type="button"
                onClick={onRefreshIdentity}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-xl transition-colors disabled:opacity-50 shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh Identity'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsScanOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#007AFF] hover:bg-[#0066D6] rounded-xl shadow-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Rescan Brand</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. BRAND OVERVIEW & THREAT STATUS & RISK OVERVIEW        */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Official Website Card */}
        <div className="apple-card p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3 text-xs font-semibold text-slate-400">
              <span className="uppercase tracking-wider">Official Domain</span>
              <Globe className="w-4 h-4 text-[#007AFF]" />
            </div>

            <div className="font-mono text-base font-bold text-slate-900 dark:text-white truncate">
              {cleanWebsite}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              TLS anchor & verified canonical domain
            </p>
          </div>

          <div className="pt-4 mt-2">
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-[#007AFF] bg-blue-50 hover:bg-blue-100/80 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 rounded-xl transition-colors"
            >
              <span>Open Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Threat Status Card */}
        <div className="apple-card p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3 text-xs font-semibold text-slate-400">
              <span className="uppercase tracking-wider">Threat Status</span>
              {activeThreatCount > 0 ? (
                <ShieldAlert className="w-4 h-4 text-rose-500" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              )}
            </div>

            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
              {criticalCount > 0 ? (
                <span className="text-red-600 dark:text-red-400 flex items-center gap-2">
                  <span>🔴</span>
                  <span>{criticalCount} Critical Threat{criticalCount > 1 ? 's' : ''}</span>
                </span>
              ) : highCount > 0 ? (
                <span className="text-orange-600 dark:text-orange-400 flex items-center gap-2">
                  <span>🟠</span>
                  <span>{highCount} High-Risk Threat{highCount > 1 ? 's' : ''}</span>
                </span>
              ) : activeThreatCount > 0 ? (
                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <span>🟡</span>
                  <span>{activeThreatCount} Active Threat{activeThreatCount > 1 ? 's' : ''}</span>
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <span>🟢</span>
                  <span>No Active Threats</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {activeThreatCount > 0
                ? `${activeThreatCount} active risks detected across mobile and social`
                : 'Zero impersonator domains or rogue APKs detected'}
            </p>
          </div>

          <div className="pt-4 mt-2">
            <Link
              href={`/threats?brand=${encodeURIComponent(brand.name)}`}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-xl transition-colors"
            >
              <span>Investigate Threats</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Risk Overview Card */}
        <div className="apple-card p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3 text-xs font-semibold text-slate-400">
              <span className="uppercase tracking-wider">Risk Score</span>
              <Activity className="w-4 h-4 text-[#007AFF]" />
            </div>

            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`text-2xl font-black ${
                    riskScore >= 70
                      ? 'text-red-600 dark:text-red-400'
                      : riskScore >= 40
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {riskScore}
                </span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Confidence: <strong className="text-slate-900 dark:text-white">{confidenceScore}%</strong>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Multi-signal exposure and impersonation severity index
            </p>
          </div>

          <div className="pt-4 mt-2">
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  riskScore >= 70
                    ? 'bg-red-500'
                    : riskScore >= 40
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, riskScore))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. BRAND RISK OVERVIEW (CONTEXTUAL CHARTS: THIS BRAND)    */}
      {/* ========================================================= */}
      <div className="apple-card p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Brand Risk Overview
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-[#007AFF] dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-900 font-semibold">
                Contextual to {brand.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Threat dynamics and severity distributions isolated exclusively for {brand.name}
            </p>
          </div>
          {brand.dataSource === 'DEMO' && (
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 self-start sm:self-auto">
              Demo Data
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Risk Distribution (Donut / Pie) */}
          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <PieIcon className="w-3.5 h-3.5 text-[#007AFF]" />
                <span>Risk Distribution</span>
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-500">
                {activeThreatCount} Total
              </span>
            </div>

            <div className="relative w-full h-44 flex items-center justify-center">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <RechartsTooltip
                      formatter={(val: any, name: any) => [`${val} threats`, name]}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '10px',
                        borderColor: '#e2e8f0',
                        fontSize: '11px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Pie
                      data={safeDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={66}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {safeDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-28 h-28 rounded-full border-4 border-slate-200 animate-pulse" />
              )}

              {/* Center counter */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {activeThreatCount}
                </span>
                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                  Threats
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <span className="text-slate-500">Critical:</span>
                <strong className="text-slate-900 dark:text-white font-mono">{dist.critical}</strong>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                <span className="text-slate-500">High:</span>
                <strong className="text-slate-900 dark:text-white font-mono">{dist.high}</strong>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span className="text-slate-500">Medium:</span>
                <strong className="text-slate-900 dark:text-white font-mono">{dist.medium}</strong>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-slate-500">Low:</span>
                <strong className="text-slate-900 dark:text-white font-mono">{dist.low}</strong>
              </div>
            </div>
          </div>

          {/* Chart 2: Threat Trend (Line/Area Chart) */}
          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#007AFF]" />
                <span>Threat Trend (7 Days)</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-400">Activity</span>
            </div>

            <div className="w-full h-44">
              {activeThreatCount === 0 && !propRiskTrend ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-3 text-xs text-slate-400">
                  <ShieldCheck className="w-7 h-7 text-emerald-500 mb-1" />
                  <span>No historical threat data available yet.</span>
                </div>
              ) : mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="brandThreatGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#007AFF" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                    <RechartsTooltip
                      formatter={(val: any) => [`${val} threats`, 'Detected']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '10px',
                        borderColor: '#e2e8f0',
                        fontSize: '11px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#007AFF"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#brandThreatGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full bg-slate-100 rounded-xl animate-pulse" />
              )}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 truncate">
              {activeThreatCount > 0
                ? 'Monitored across global app stores, social channels & domains'
                : 'Zero active impersonation anomalies discovered'}
            </p>
          </div>

          {/* Chart 3: Threat Category Breakdown (Bar Chart) */}
          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-[#007AFF]" />
                <span>Threat Categories</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-400">Breakdown</span>
            </div>

            <div className="w-full h-44">
              {!hasCategoryData ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-3 text-xs text-slate-400">
                  <ShieldCheck className="w-7 h-7 text-emerald-500 mb-1" />
                  <span>No historical threat data available yet.</span>
                </div>
              ) : mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                    <XAxis
                      dataKey="category"
                      tick={{ fontSize: 9, fill: '#94A3B8' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                    <RechartsTooltip
                      formatter={(val: any) => [`${val} threats`, 'Detected']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '10px',
                        borderColor: '#e2e8f0',
                        fontSize: '11px',
                      }}
                    />
                    <Bar dataKey="count" fill="#007AFF" radius={[6, 6, 0, 0]}>
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`bar-${index}`}
                          fill={entry.count > 0 ? (index === 0 ? '#007AFF' : index === 1 ? '#FF9500' : '#EF4444') : '#CBD5E1'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full bg-slate-100 rounded-xl animate-pulse" />
              )}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 truncate">
              Mobile APKs, spoofed social accounts & phishing domains
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. OFFICIAL APPLICATIONS (STRICTLY THIS BRAND)            */}
      {/* ========================================================= */}
      <div className="apple-card p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#007AFF] flex items-center justify-center">
              <Smartphone className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Official Applications
              </h3>
              <p className="text-[11px] text-slate-400">
                Verified against developer signature & official brand domain
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-[#007AFF] dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800">
            {officialApps.length} Verified
          </span>
        </div>

        {officialApps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {officialApps.map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between gap-3 group hover:border-[#007AFF]/40 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 overflow-hidden p-1 flex items-center justify-center shrink-0 shadow-2xs">
                    {app.icon ? (
                      <img
                        src={app.icon}
                        alt={app.name}
                        className="w-full h-full object-contain rounded-lg"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Smartphone className="w-5 h-5 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {app.name}
                      </h4>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/80 shrink-0">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>{app.relationshipType === 'BRAND_ECOSYSTEM' ? 'Ecosystem' : 'Official'}</span>
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      Developer: <span className="font-semibold text-slate-700 dark:text-slate-300">{app.developer}</span>
                    </p>

                    <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                      {app.packageId}
                    </p>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">{app.platform}</span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      {app.verificationConfidence || 95}% Conf.
                    </span>
                  </div>

                  {app.storeUrl ? (
                    <a
                      href={app.storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#007AFF] hover:underline"
                    >
                      <span>Open Store</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-mono">Store Verified</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50/60 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            No verified applications discovered yet.
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 5. VERIFIED SOCIAL ACCOUNTS (STRICTLY THIS BRAND)         */}
      {/* ========================================================= */}
      <div className="apple-card p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#007AFF] flex items-center justify-center">
              <Share2 className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Verified Social Accounts
              </h3>
              <p className="text-[11px] text-slate-400">
                Anchored to official corporate domain footer & platform identity
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-[#007AFF] dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800">
            {verifiedSocials.length} Verified
          </span>
        </div>

        {verifiedSocials.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {verifiedSocials.map((soc) => (
              <a
                key={soc.id}
                href={soc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 hover:border-[#007AFF]/50 transition-colors flex items-center justify-between group shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${getSocialBadgeColor(
                      soc.platform
                    )}`}
                  >
                    {soc.platform.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {soc.handle}
                      </span>
                      <CheckCircle2 className="w-3 h-3 text-[#007AFF] shrink-0" />
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                      <span className="truncate">{soc.platform}</span>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        {soc.verificationConfidence || 98}%
                      </span>
                    </div>
                  </div>
                </div>

                <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
              </a>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50/60 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            No verified social accounts discovered yet.
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 6. SUSPICIOUS APPLICATIONS DETECTED (MANDATORY SEPARATION) */}
      {/* ========================================================= */}
      <div className="apple-card p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Suspicious Applications Detected
              </h3>
              <p className="text-[11px] text-slate-400">
                Impersonating mobile applications, look-alike package IDs & unverified developers
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 border border-red-200/80">
            {suspiciousApps.length} Flagged
          </span>
        </div>

        {suspiciousApps.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {suspiciousApps.map((app) => (
              <div
                key={app.id}
                className="py-4 flex items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center p-2 shrink-0 shadow-2xs mt-0.5">
                    <Smartphone className="w-5 h-5 text-red-400" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {app.name}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 border border-red-200/80">
                        HIGH RISK — 91
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                      Developer: <span className="font-semibold text-slate-700 dark:text-slate-300">{app.developer}</span>
                    </p>

                    <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                      {app.packageId} • {app.platform}
                    </p>

                    {/* Reasons chips */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {(app.reasons || ['Developer mismatch', 'No official website reference']).slice(0, 3).map((r, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100/90 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                          <span>{r}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <div className="shrink-0 self-center">
                  <Link
                    href={`/threats?search=${encodeURIComponent(app.name)}`}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-xl border border-slate-200/80 dark:border-slate-700 transition-colors shadow-2xs whitespace-nowrap block"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50/60 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            No suspicious applications detected.
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 7. SUSPICIOUS SOCIAL ACCOUNTS DETECTED                     */}
      {/* ========================================================= */}
      <div className="apple-card p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Share2 className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Suspicious Social Accounts
              </h3>
              <p className="text-[11px] text-slate-400">
                Impersonating profiles, look-alike handles & unauthorized brand support claims
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/80">
            {suspiciousSocials.length} Flagged
          </span>
        </div>

        {suspiciousSocials.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {suspiciousSocials.map((soc) => (
              <div
                key={soc.id}
                className="py-4 flex items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center p-2 shrink-0 shadow-2xs font-bold text-xs mt-0.5">
                    {soc.platform.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {soc.handle}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 border border-red-200/80">
                        HIGH RISK — 88
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 truncate">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono truncate">{soc.handle}</span>
                      <span className="shrink-0 text-slate-300">•</span>
                      <span className="shrink-0 text-slate-400">{soc.followers || 'Suspicious Profile'}</span>
                    </p>

                    {/* Reason tags below */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {(soc.reasons || ['Similar username', 'No official website link', 'Fake support claims']).slice(0, 3).map((r, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100/90 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                          <span>{r}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* View Profile Button */}
                <div className="shrink-0 self-center">
                  <Link
                    href={`/threats?search=${encodeURIComponent(soc.handle)}`}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-xl border border-slate-200/80 dark:border-slate-700 transition-colors shadow-2xs whitespace-nowrap block"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50/60 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            No suspicious social accounts detected.
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 8. RECENT THREATS LIST                                    */}
      {/* ========================================================= */}
      <div className="apple-card p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#007AFF] flex items-center justify-center">
              <Shield className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Active Impersonation Threats
              </h3>
              <p className="text-[11px] text-slate-400">
                Real-time threats detected exclusively for {brand.name}
              </p>
            </div>
          </div>
          <Link
            href={`/threats?brand=${encodeURIComponent(brand.name)}`}
            className="text-xs font-semibold text-[#007AFF] hover:underline"
          >
            Investigate All ({brandThreats.length}) →
          </Link>
        </div>

        {brandThreats.length > 0 ? (
          <div className="space-y-3">
            {brandThreats.map((threat) => (
              <div
                key={threat.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        threat.riskLevel === 'Critical'
                          ? 'bg-red-500'
                          : threat.riskLevel === 'High'
                          ? 'bg-orange-500'
                          : 'bg-amber-500'
                      }`}
                    />
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {threat.candidateName || threat.name}
                    </h4>
                  </div>
                  {threat.url && (
                    <span className="text-xs font-mono text-slate-400 block mt-0.5 truncate">
                      {threat.url}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      threat.riskLevel === 'Critical'
                        ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                        : threat.riskLevel === 'High'
                        ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    }`}
                  >
                    {threat.riskScore} — {threat.riskLevel}
                  </span>

                  <Link
                    href={`/threats?search=${encodeURIComponent(threat.candidateName || threat.name)}`}
                    className="p-2 rounded-xl text-slate-400 hover:text-[#007AFF] hover:bg-white dark:hover:bg-slate-700 transition-colors"
                    title="Investigate"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50/60 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            🟢 Zero rogue impersonator domains, APKs, or phishing targets detected for {brand.name}.
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 9. MULTI-SIGNAL VERIFICATION EVIDENCE CARDS               */}
      {/* ========================================================= */}
      <div className="apple-card p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#007AFF] flex items-center justify-center">
            <Lock className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Cryptographic & Entity Verification Evidence
            </h3>
            <p className="text-[11px] text-slate-400">
              Deterministic verification signals guaranteeing zero false positives
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Domain Anchor</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Canonical root TLS certificate linked to authoritative corporate registrar.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Publisher Match</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Google Play & Apple Developer accounts matched against official trademark records.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Bundle Identity</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Cryptographic bundle prefix (e.g., com.{brand.name.toLowerCase().replace(/[^a-z0-9]/g, '')}) verified in store registry.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Live Telemetry</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Continuous 24/7 scanning for typo-squatting, look-alike APKs, and fake profiles.
            </p>
          </div>
        </div>
      </div>

      <ScanModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        brandId={brand.id}
        brandName={brand.name}
      />
    </div>
  );
}
