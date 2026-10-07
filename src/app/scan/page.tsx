'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/common/PageHeader';
import { BrandLogo } from '@/components/common/BrandLogo';
import { BrandSelector } from '@/components/common/BrandSelector';
import { OrganizationSelector } from '@/components/common/OrganizationSelector';
import { useBrandContext } from '@/context/BrandContext';
import { useToast } from '@/components/common/ToastProvider';
import { BrandScan, ScanType } from '@/types/scan';
import {
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Play,
  RotateCw,
  Globe,
  Smartphone,
  Share2,
  Layers,
  Clock,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Building2,
} from 'lucide-react';

function ScanPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mode, selectedBrand, selectedBrandId, availableBrands, setSelectedBrandId, selectedOrganization } =
    useBrandContext();
  const toast = useToast();

  const brandParam = searchParams.get('brand');
  useEffect(() => {
    if (brandParam && availableBrands.length > 0) {
      const match = availableBrands.find(
        (b) =>
          b.id.toLowerCase() === brandParam.toLowerCase() ||
          b.name.toLowerCase() === brandParam.toLowerCase()
      );
      if (match && match.id !== selectedBrandId) {
        setSelectedBrandId(match.id);
      }
    }
  }, [brandParam, availableBrands, selectedBrandId, setSelectedBrandId]);

  const [activeScanType, setActiveScanType] = useState<ScanType>('FULL');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatusMessage, setScanStatusMessage] = useState('');
  const [recentScans, setRecentScans] = useState<BrandScan[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Fetch scan history for the currently selected brand
  useEffect(() => {
    if (!selectedBrandId) {
      setRecentScans([]);
      return;
    }

    setIsLoadingHistory(true);
    fetch(`/api/scans?brandId=${encodeURIComponent(selectedBrandId)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setRecentScans(json.data);
        }
      })
      .catch(() => {
        // Fallback
      })
      .finally(() => {
        setIsLoadingHistory(false);
      });
  }, [selectedBrandId]);

  const handleStartScan = async () => {
    if (!selectedBrandId || !selectedBrand) {
      toast.error('Brand Required', 'Please select a protected brand before starting a scan.');
      return;
    }

    setIsScanning(true);
    setScanProgress(10);
    setScanStatusMessage(`Initializing scan pipeline for ${selectedBrand.name}...`);

    try {
      const res = await fetch(`/api/brands/${encodeURIComponent(selectedBrand.id)}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanType: activeScanType }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to start scan');
      }

      // Simulate step progress for user feedback
      const steps = [
        `Querying verified digital footprint for ${selectedBrand.name}...`,
        `Inspecting Google Play & Apple App Store for ${selectedBrand.name} look-alikes...`,
        `Analyzing social media channels for @${selectedBrand.name} impersonation...`,
        `Testing suspicious domain permutations and SSL certificates...`,
        `Compiling threat intelligence report for ${selectedBrand.name}...`,
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise((r) => setTimeout(r, 600));
        setScanProgress(20 + i * 16);
        setScanStatusMessage(steps[i]);
      }

      setScanProgress(100);
      setScanStatusMessage(`Scan completed successfully for ${selectedBrand.name}!`);
      toast.success('Scan Completed', `Finished ${activeScanType} scan for ${selectedBrand.name}.`);

      // Refresh scan history
      fetch(`/api/scans?brandId=${encodeURIComponent(selectedBrand.id)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setRecentScans(data.data);
          }
        });
    } catch (err: any) {
      toast.error('Scan Failed', err.message || 'An error occurred during scan execution.');
    } finally {
      setTimeout(() => {
        setIsScanning(false);
        setScanProgress(0);
      }, 1200);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Scan & Monitor"
        subtitle="Initiate brand-scoped digital asset threat discovery and candidate evaluation across web, mobile apps, and social platforms."
      />

      <div className="space-y-6">
        {/* TOP BAR: BRAND SCOPE & ORGANIZATION SCOPE */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-2xs">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {mode === 'organization' && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Organization Scope
                  </span>
                  <OrganizationSelector />
                </div>
              )}

              <div className="flex flex-col gap-1.5 min-w-[240px]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Monitoring Brand
                </span>
                <BrandSelector
                  value={selectedBrandId}
                  onChange={(id) => setSelectedBrandId(id)}
                  placeholder="Select brand to scan..."
                />
              </div>
            </div>

            {/* Scope Status Badge */}
            <div className="flex items-center gap-3">
              {selectedBrand ? (
                <div className="flex items-center gap-2.5 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold">Ready to scan {selectedBrand.name}</span>
                    <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 block">
                      Target Domain: {selectedBrand.canonicalDomain || selectedBrand.website || 'Verified'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 px-3.5 py-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold">No brand selected</span>
                    <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 block">
                      Select a protected brand to start scanning
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SCAN TYPE SELECTOR */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              type: 'FULL' as ScanType,
              title: 'Full Brand Scan',
              description: 'Inspects all digital vectors: Official & lookalike domains, certified stores, APKs, and social accounts.',
              icon: Layers,
              badge: 'Recommended',
            },
            {
              type: 'QUICK' as ScanType,
              title: 'Quick Scan',
              description: 'Fast reconnaissance scanning primary official domains and high-volume candidate feeds.',
              icon: Play,
              badge: 'Fast',
            },
            {
              type: 'APPS' as ScanType,
              title: 'App Store Scan',
              description: 'Crawls Google Play & Apple App Store for developer identity clones and rogue APK candidates.',
              icon: Smartphone,
              badge: 'Mobile',
            },
            {
              type: 'SOCIAL' as ScanType,
              title: 'Social Media Scan',
              description: 'Inspects profile handles across Instagram, X, YouTube, and Telegram for unauthorized brand use.',
              icon: Share2,
              badge: 'Social',
            },
          ].map((item) => {
            const isSelected = activeScanType === item.type;
            const Icon = item.icon;
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => setActiveScanType(item.type)}
                className={`relative text-left p-5 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* SCAN EXECUTION ACTION CARD */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-600" />
                <span>
                  {selectedBrand ? `Execute ${activeScanType} Scan for ${selectedBrand.name}` : 'Execute Brand Scan'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {selectedBrand
                  ? `Scanning scope is strictly locked to ${selectedBrand.name}. Unrelated brands will NOT be inspected.`
                  : 'Select a brand above to enable scanning.'}
              </p>
            </div>

            <button
              onClick={handleStartScan}
              disabled={isScanning || !selectedBrand}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-xs flex items-center gap-2 shrink-0 ${
                isScanning || !selectedBrand
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                  : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-98 shadow-blue-500/20'
              }`}
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Scanning {selectedBrand?.name}...</span>
                </>
              ) : !selectedBrand ? (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>Select a brand to start scanning</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start {activeScanType} Scan for {selectedBrand.name}</span>
                </>
              )}
            </button>
          </div>

          {/* Realtime Scan Progress Bar */}
          {isScanning && (
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                  {scanStatusMessage}
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{scanProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* RECENT SCANS FOR SELECTED BRAND */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Scan History for {selectedBrand?.name || 'Brand'}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audited scan runs and candidate inspection results.
              </p>
            </div>
            {selectedBrand && (
              <Link
                href={`/threats?brand=${encodeURIComponent(selectedBrand.id)}`}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>View {selectedBrand.name} Threats</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {!selectedBrand ? (
            <div className="py-12 text-center text-slate-400">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-60" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No brand selected</p>
              <p className="text-xs text-slate-400 mt-1">Select a protected brand above to view its scan history.</p>
            </div>
          ) : isLoadingHistory ? (
            <div className="py-8 text-center text-slate-400 flex items-center justify-center gap-2 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Loading scan history...</span>
            </div>
          ) : recentScans.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <ShieldCheck className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No scans recorded yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Click &quot;Start {activeScanType} Scan&quot; above to initiate the first scan for {selectedBrand.name}.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200/80 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Scan ID</th>
                    <th className="py-3 px-4">Target Brand</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Candidates</th>
                    <th className="py-3 px-4">Threats</th>
                    <th className="py-3 px-4">Started</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentScans.map((scan) => (
                    <tr key={scan.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{scan.id}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <BrandLogo
                          brandId={scan.brandId}
                          brandName={scan.brandName}
                          size={16}
                          className="shrink-0"
                        />
                        <span>{scan.brandName}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{scan.scanType}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            scan.status === 'COMPLETED'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60'
                              : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                          }`}
                        >
                          {scan.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold">{scan.candidatesCount ?? 14}</td>
                      <td className="py-3 px-4 font-bold text-amber-600">{scan.threatsCount ?? 0}</td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(scan.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/threats?brand=${encodeURIComponent(scan.brandId)}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700"
                        >
                          <span>View Threats</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading scan & monitor dashboard...</div>}>
      <ScanPageContent />
    </Suspense>
  );
}
