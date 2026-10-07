'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  Search,
  Globe,
  Smartphone,
  Share2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Lock,
  Building2,
  Award,
  Sparkles,
  ArrowRight,
  Edit3,
  XCircle,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import { BrandDiscoveryResult, DiscoveredApp, DiscoveredSocial } from '@/types/brand-discovery';
import { ScanModal } from '@/components/dashboard/ScanModal';
import { useToast } from '@/components/common/ToastProvider';
import { BrandLogo } from '@/components/common/BrandLogo';

const EXAMPLE_BRANDS = [
  'Nike',
  'Apple',
  'Microsoft',
  'Samsung',
  'Tata',
  'Infosys',
  'Amazon',
  'Flipkart',
];

const DISCOVERY_STEPS = [
  { id: 1, label: 'Identifying brand...' },
  { id: 2, label: 'Finding official website...' },
  { id: 3, label: 'Discovering official apps...' },
  { id: 4, label: 'Finding official social accounts...' },
  { id: 5, label: 'Verifying identity...' },
  { id: 6, label: 'Building trusted profile...' },
];

interface BrandDiscoveryProps {
  onBrandCreated?: (brandId: string) => void;
}

export function BrandDiscovery({ onBrandCreated }: BrandDiscoveryProps) {
  const router = useRouter();
  const toast = useToast();

  // Search & Pipeline states
  const [query, setQuery] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [pipelineState, setPipelineState] = useState<'IDLE' | 'DISCOVERING' | 'REVIEW' | 'EDIT' | 'PROTECTING'>('IDLE');
  const [discoveryResult, setDiscoveryResult] = useState<BrandDiscoveryResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Edit overrides
  const [editBrandName, setEditBrandName] = useState('');
  const [editWebsite, setEditWebsite] = useState('');

  // Scan modal post-activation
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [createdBrandId, setCreatedBrandId] = useState<string | null>(null);

  const handleStartDiscovery = async (brandQuery: string) => {
    const q = brandQuery.trim();
    if (!q) return;

    setQuery(q);
    setErrorMessage(null);
    setPipelineState('DISCOVERING');
    setCurrentStep(1);

    // Step progress interval to mirror actual asynchronous backend pipeline stages
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < 6 ? prev + 1 : prev));
    }, 450);

    try {
      const response = await fetch('/api/brands/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      const data = await response.json();
      clearInterval(stepInterval);

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to complete brand auto-discovery.');
      }

      setCurrentStep(6);
      setTimeout(() => {
        setDiscoveryResult(data);
        setEditBrandName(data.brand.name);
        setEditWebsite(data.officialWebsite.domain);
        setPipelineState('REVIEW');
      }, 500);
    } catch (err: unknown) {
      clearInterval(stepInterval);
      const msg = (err as Error).message || 'Brand discovery failed.';
      setErrorMessage(msg);
      setPipelineState('IDLE');
      toast.error('Discovery Error', msg);
    }
  };

  const handleConfirmAndAddBrand = async () => {
    if (!discoveryResult) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/brands/discover/${discoveryResult.discoveryRunId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: editBrandName || discoveryResult.brand.name,
          website: editWebsite || discoveryResult.officialWebsite.domain,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to confirm brand profile.');
      }

      const newId = data.brand?.id || discoveryResult.brand.name.toLowerCase();
      setCreatedBrandId(newId);
      setPipelineState('PROTECTING');
      window.dispatchEvent(new CustomEvent('brandguard:brand-created', { detail: { id: newId } }));
      toast.success(
        'Trusted Identity Created',
        `BrandGuard is now continuously monitoring "${data.brand?.name || discoveryResult.brand.name}".`
      );

      if (onBrandCreated) {
        onBrandCreated(newId);
      } else {
        router.push(`/brands/${newId}`);
      }
    } catch (err: unknown) {
      toast.error('Confirmation Failed', (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectDiscovery = async () => {
    if (discoveryResult) {
      try {
        await fetch(`/api/brands/discover/${discoveryResult.discoveryRunId}/reject`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: 'Rejected by analyst' }),
        });
      } catch {
        // Silently continue
      }
    }
    setDiscoveryResult(null);
    setPipelineState('IDLE');
    setQuery('');
  };

  return (
    <div className="w-full">
      {/* ============================================================== */}
      {/* 1. INITIAL INPUT & SEARCH STATE                               */}
      {/* ============================================================== */}
      {pipelineState === 'IDLE' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.03)] transition-all">
          <div className="max-w-xl mx-auto text-center space-y-3 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#007AFF] text-xs font-semibold border border-blue-100 dark:border-blue-900">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Automated Brand Discovery Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Add a Brand
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Enter your brand name and our multi-source verification engine will automatically discover its official digital identity, mobile apps, and authorized channels.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleStartDiscovery(query);
            }}
            className="max-w-xl mx-auto space-y-4"
          >
            <div className="relative flex items-center shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-2xl">
              <Search className="w-5 h-5 text-slate-400 absolute left-4.5 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter brand name (e.g. Nike, Apple, Microsoft)..."
                className="w-full pl-12 pr-36 py-3.5 text-sm sm:text-base bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/25 focus:border-[#007AFF] transition-all font-medium"
                required
              />
              <button
                type="submit"
                disabled={!query.trim()}
                className="absolute right-2 px-4.5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#007AFF] hover:bg-[#0066D6] disabled:opacity-50 disabled:hover:bg-[#007AFF] rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-98"
              >
                <Sparkles className="w-4 h-4" />
                <span>Discover Brand</span>
              </button>
            </div>

            {/* Quick Example Chips */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2 text-center">
                Quick Discovery Benchmarks
              </span>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {EXAMPLE_BRANDS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setQuery(item);
                      handleStartDiscovery(item);
                    }}
                    className="px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800 hover:bg-blue-50 hover:text-[#007AFF] dark:hover:bg-blue-950/40 dark:hover:text-blue-400 rounded-lg border border-slate-200/60 dark:border-slate-700/60 transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. LIVE PROGRESS STATE                                         */}
      {/* ============================================================== */}
      {pipelineState === 'DISCOVERING' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-[0_4px_24px_rgba(0,0,0,0.03)] max-w-lg mx-auto">
          <div className="text-center space-y-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#007AFF] flex items-center justify-center mx-auto border border-blue-100 dark:border-blue-900">
              <Loader2 className="w-6 h-6 animate-spin stroke-[2.2]" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Discovering {query}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Scanning authoritative registries, TLS certificates, verified domain footprints, and certified app catalogs...
            </p>
          </div>

          <div className="space-y-3.5">
            {DISCOVERY_STEPS.map((step) => {
              const isPast = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-3.5 p-3 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/60 shadow-xs'
                      : isPast
                      ? 'bg-slate-50/50 dark:bg-slate-800/30 border-transparent text-slate-600 dark:text-slate-300'
                      : 'border-transparent text-slate-400 dark:text-slate-600'
                  }`}
                >
                  <div className="shrink-0">
                    {isPast ? (
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
                    ) : isCurrent ? (
                      <span className="w-4.5 h-4.5 rounded-full border-2 border-[#007AFF] border-t-transparent animate-spin block" />
                    ) : (
                      <div className="w-4.5 h-4.5 rounded-full border border-slate-300 dark:border-slate-700" />
                    )}
                  </div>
                  <span className={`text-xs font-semibold ${isCurrent ? 'text-[#007AFF] dark:text-blue-400 font-bold' : ''}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. REVIEW & EDIT DISCOVERED IDENTITY                           */}
      {/* ============================================================== */}
      {pipelineState === 'REVIEW' && discoveryResult && (
        <div className="space-y-6">
          {/* Main Identity Header Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <BrandLogo
                  brandName={discoveryResult.brand.name}
                  domain={discoveryResult.officialWebsite?.domain || discoveryResult.officialWebsite?.url}
                  logoUrl={discoveryResult.brand.logoUrl}
                  size="lg"
                  className="rounded-2xl shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {discoveryResult.brand.name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {discoveryResult.verificationStatus.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {discoveryResult.brand.legalName} • {discoveryResult.brand.category}
                  </p>
                </div>
              </div>

              {/* Confidence Score Pill */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 p-3 sm:p-0 rounded-2xl bg-slate-50 sm:bg-transparent dark:bg-slate-800/40 sm:dark:bg-transparent">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Identity Confidence
                </span>
                <div className="text-2xl font-black text-[#007AFF] flex items-center gap-1.5">
                  <span>{discoveryResult.confidenceScore}%</span>
                  <Award className="w-5 h-5 text-[#007AFF]" />
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  Multi-Source Verified Anchor
                </span>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase block">Official Website</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block truncate">
                  {discoveryResult.officialWebsite.domain}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase block">Official Mobile Apps</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">
                  {discoveryResult.apps.length} Verified Apps
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase block">Official Socials</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">
                  {discoveryResult.socialAccounts.length} Verified Channels
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase block">Evidence Signals</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {discoveryResult.evidence.length} Certified Signals
                </span>
              </div>
            </div>
          </div>

          {/* Section: Discovered Assets Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Col 1: Official Website */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#007AFF]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Official Website
                  </h3>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  {discoveryResult.officialWebsite.confidence}% Match
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                    {discoveryResult.officialWebsite.domain}
                  </span>
                  <a
                    href={discoveryResult.officialWebsite.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {discoveryResult.officialWebsite.description}
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>Valid HTTPS Encryption</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase block">Domain Evidence</span>
                {discoveryResult.officialWebsite.evidence.map((ev, i) => (
                  <div key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                    <span className="text-emerald-600">✓</span>
                    <span>{ev}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Col 2: Official Apps */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#007AFF]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Official Mobile Apps ({discoveryResult.apps.length})
                  </h3>
                </div>
              </div>

              <div className="space-y-3">
                {discoveryResult.apps.map((app, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {app.icon ? (
                        <img src={app.icon} alt={app.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-[#007AFF] flex items-center justify-center shrink-0">
                          <Smartphone className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate" title={app.name}>
                          {app.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate" title={app.developer}>
                          {app.developer}
                        </p>
                        <span className="text-[10px] font-mono text-slate-400 block truncate" title={app.packageId || app.bundleId}>
                          {app.packageId || app.bundleId}
                        </span>
                      </div>
                    </div>

                    {(app.verificationStatus as string) === 'VERIFIED_OFFICIAL' || (app.verificationStatus as string) === 'VERIFIED' ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                        Official
                      </span>
                    ) : app.verificationStatus === 'LIKELY_OFFICIAL' ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shrink-0">
                        Likely Official
                      </span>
                    ) : app.verificationStatus === 'SUSPICIOUS' ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800 shrink-0">
                        Suspicious
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0">
                        Unverified
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Col 3: Official Social Accounts */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-[#007AFF]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Official Social Accounts ({discoveryResult.socialAccounts.length})
                  </h3>
                </div>
              </div>

              <div className="space-y-2.5">
                {discoveryResult.socialAccounts.map((soc, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {soc.platform}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        @{soc.username}
                      </span>
                    </div>

                    <a
                      href={soc.profileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 text-[11px] font-semibold text-[#007AFF] hover:underline flex items-center gap-1"
                    >
                      <span>Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Confidence Breakdown & Verification Signals */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Cryptographic & Multi-Signal Evidence Proof</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {discoveryResult.confidenceBreakdown.map((sig, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                    sig.passed
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/60'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {sig.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                    )}
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-white">
                        {sig.description}
                      </p>
                      <span className="text-[10px] font-mono text-slate-400">
                        {sig.signal}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                    +{sig.score}/{sig.maxScore}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* User Confirmation Action Bar */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Review Discovered Identity
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Confirming will anchor this identity in your organization graph and begin continuous rogue impersonation monitoring.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleRejectDiscovery}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-colors"
              >
                Reject & Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAndAddBrand}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#007AFF] hover:bg-[#0066D6] disabled:opacity-50 rounded-xl shadow-xs transition-all flex items-center gap-2 active:scale-98"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Anchoring Profile...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>VERIFY & ADD BRAND</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. AFTER BRAND CREATION: PROTECTION ACTIVATED (Section 17)     */}
      {/* ============================================================== */}
      {pipelineState === 'PROTECTING' && discoveryResult && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-[0_4px_24px_rgba(0,0,0,0.03)] text-center max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800 shadow-xs">
            <Shield className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Protection Activated
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              BrandGuard is now protecting: {discoveryResult.brand.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Trusted digital identity verified at {discoveryResult.confidenceScore}%. Impersonation surveillance monitors are live across official domains, certified app stores, and social ecosystems.
            </p>
          </div>

          {/* Protected Assets Counter Card */}
          <div className="grid grid-cols-4 gap-3 py-4 max-w-lg mx-auto">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Website</span>
              <span className="text-xl font-black text-slate-900 dark:text-white block mt-1">1</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Apps</span>
              <span className="text-xl font-black text-slate-900 dark:text-white block mt-1">
                {discoveryResult.apps.length}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Social</span>
              <span className="text-xl font-black text-slate-900 dark:text-white block mt-1">
                {discoveryResult.socialAccounts.length}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Threats</span>
              <span className="text-xl font-black text-slate-900 dark:text-white block mt-1">0</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsScanOpen(true)}
              className="w-full sm:w-auto px-6 py-3 text-xs sm:text-sm font-bold text-white bg-[#007AFF] hover:bg-[#0066D6] rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Start Full Scan</span>
            </button>

            <Link
              href={createdBrandId ? `/brands/${createdBrandId}` : '/brands'}
              className="w-full sm:w-auto px-6 py-3 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <span>View Brand Profile</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Full Scan Execution Modal */}
      <ScanModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        brandId={createdBrandId}
        brandName={discoveryResult?.brand.name || 'Discovered Brand'}
        onScanComplete={() => {
          setIsScanOpen(false);
          router.push(createdBrandId ? `/threats?brand=${encodeURIComponent(createdBrandId)}` : '/threats');
        }}
      />
    </div>
  );
}
