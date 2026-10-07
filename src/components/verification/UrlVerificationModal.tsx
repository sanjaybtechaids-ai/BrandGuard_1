'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Globe,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  X,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Search,
  Flag,
} from 'lucide-react';
import { useToast } from '@/components/common/ToastProvider';
import { UrlVerificationResult, VerificationEvidence } from '@/types/verification';

interface UrlVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUrl?: string;
}

const VERIFICATION_STEPS = [
  'Validating URL syntax & SSRF safety barriers...',
  'Resolving DNS & verifying safe address space...',
  'Inspecting website reachability & SSL TLS state...',
  'Querying official brand profile & trusted registry...',
  'Evaluating visual & lexical domain similarity vectors...',
  'Synthesizing deterministic risk intelligence score...',
];

const QUICK_TEST_URLS = [
  { label: 'Official Nike', url: 'https://nike.com' },
  { label: 'Suspicious Support', url: 'https://nike-support-example.com' },
  { label: 'Outlet Typosquat', url: 'https://n1ke-deals.com' },
  { label: 'Official Apple', url: 'https://apple.com' },
];

export function UrlVerificationModal({ isOpen, onClose, initialUrl = '' }: UrlVerificationModalProps) {
  const router = useRouter();
  const toast = useToast();
  const [urlInput, setUrlInput] = useState(initialUrl);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState<UrlVerificationResult | null>(null);
  const [isCreatingThreat, setIsCreatingThreat] = useState(false);
  const [threatCreated, setThreatCreated] = useState(false);

  // Sync initialUrl
  React.useEffect(() => {
    if (initialUrl) {
      setUrlInput(initialUrl);
    }
  }, [initialUrl]);

  if (!isOpen) return null;

  const handleVerify = async (targetUrlToVerify?: string) => {
    const target = (targetUrlToVerify || urlInput).trim();
    if (!target) return;

    setUrlInput(target);
    setIsAnalyzing(true);
    setResult(null);
    setStepIndex(0);
    setThreatCreated(false);

    // Step progress animation
    const stepInterval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < VERIFICATION_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 280);

    try {
      const response = await fetch('/api/verify-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target }),
      });

      const json = await response.json();
      clearInterval(stepInterval);

      if (json.success && json.data) {
        setResult(json.data);
      } else {
        toast.error('Verification Error', json.error?.message || 'Could not verify URL.');
      }
    } catch (err: unknown) {
      clearInterval(stepInterval);
      toast.error('Network Error', 'Failed to reach verification endpoint.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateThreat = async () => {
    if (!result?.id) return;
    setIsCreatingThreat(true);

    try {
      const response = await fetch('/api/verify-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_THREAT',
          verificationId: result.id,
          customTitle: `Flagged Impersonation: ${result.rootDomain}`,
        }),
      });

      const json = await response.json();
      if (json.success) {
        setThreatCreated(true);
        toast.success(
          'Threat Created Successfully',
          `Incident added to Threat Center and Dashboard for ${result.brand}.`
        );
      } else {
        toast.error('Escalation Failed', json.error?.message || 'Failed to create threat.');
      }
    } catch {
      toast.error('Error', 'Could not create threat record.');
    } finally {
      setIsCreatingThreat(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF3FF] dark:bg-blue-950/60 text-[#007AFF] flex items-center justify-center shadow-xs">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Brand URL Verification
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verify whether an external domain represents official brand identity or impersonation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5 pr-1">
          {/* Input Form */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Paste website or brand URL to verify:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                  placeholder="https://example.com or nike-support-example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] font-medium"
                />
              </div>
              <button
                onClick={() => handleVerify()}
                disabled={isAnalyzing || !urlInput.trim()}
                className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#007AFF] hover:bg-[#0066D6] disabled:opacity-50 disabled:hover:bg-[#007AFF] rounded-2xl shadow-sm shadow-blue-500/20 transition-all active:scale-98 flex items-center gap-2 shrink-0"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <span>Verify</span>
                )}
              </button>
            </div>

            {/* Quick Demo Target Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-medium text-slate-400">Quick tests:</span>
              {QUICK_TEST_URLS.map((test) => (
                <button
                  key={test.url}
                  onClick={() => handleVerify(test.url)}
                  disabled={isAnalyzing}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {test.label}
                </button>
              ))}
            </div>
          </div>

          {/* Progress Animation State */}
          {isAnalyzing && (
            <div className="p-4 rounded-2xl border border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-[#007AFF]">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span className="animate-pulse">{VERIFICATION_STEPS[stepIndex]}</span>
              </div>
              <div className="w-full bg-blue-200/50 dark:bg-blue-900/40 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#007AFF] h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, ((stepIndex + 1) / VERIFICATION_STEPS.length) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Result Card */}
          {result && !isAnalyzing && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              {/* Classification Banner */}
              <ResultClassificationHeader result={result} />

              {/* Forensic Evidence Signals */}
              <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Explainable Forensic Evidence:
                </h4>
                <div className="space-y-1.5">
                  {result.evidence.map((ev, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      {ev.status === 'passed' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      )}
                      {ev.status === 'failed' && (
                        <X className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      )}
                      {ev.status === 'warning' && (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      )}
                      {ev.status === 'neutral' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <span className="text-slate-700 dark:text-slate-300">{ev.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safe Metadata Preview */}
              {result.metadata && (result.metadata.title || result.metadata.httpStatus) && (
                <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white truncate max-w-sm">
                      {result.metadata.title || result.hostname}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      HTTP {result.metadata.httpStatus || 200} • {result.metadata.sslValid ? 'TLS Valid' : 'No SSL'}
                    </span>
                  </div>
                  {result.metadata.description && (
                    <p className="line-clamp-2 text-[11px] text-slate-500 leading-relaxed">
                      {result.metadata.description}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-[11px] text-slate-400">
                  Target: <span className="font-mono text-slate-600 dark:text-slate-300">{result.normalizedUrl}</span>
                </div>

                <div className="flex items-center gap-2">
                  {result.status === 'SUSPICIOUS' && (
                    <>
                      <button
                        onClick={() => {
                          onClose();
                          router.push(`/reports/create?url=${encodeURIComponent(result.normalizedUrl)}&brand=${encodeURIComponent(result.brand || '')}&brandId=${encodeURIComponent(result.brandId || '')}&riskScore=${result.riskScore}`);
                        }}
                        className="px-3.5 py-2 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100"
                        title="Open incident reporting workflow"
                      >
                        <Flag className="w-3.5 h-3.5" />
                        <span>Report Unofficial Website</span>
                      </button>
                      <button
                        onClick={handleCreateThreat}
                        disabled={isCreatingThreat || threatCreated}
                        className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5 ${
                          threatCreated
                            ? 'bg-emerald-600 text-white'
                            : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 active:scale-98'
                        }`}
                      >
                        {isCreatingThreat ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Creating Incident...</span>
                          </>
                        ) : threatCreated ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Threat Created ✓</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Create Threat</span>
                          </>
                        )}
                      </button>
                    </>
                  )}

                  {threatCreated && (
                    <button
                      onClick={() => {
                        onClose();
                        router.push('/threats');
                      }}
                      className="px-3 py-2 text-xs font-semibold text-[#007AFF] hover:underline flex items-center gap-1"
                    >
                      <span>View in Threats</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {result.status === 'VERIFIED_OFFICIAL' && (
                    <button
                      onClick={() => {
                        onClose();
                        router.push(`/brands/${result.brandId || 'nike'}`);
                      }}
                      className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <span>View Official Brand Profile</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {result.status === 'LIKELY_OFFICIAL' && (
                    <button
                      onClick={() => {
                        onClose();
                        router.push(`/brands/${result.brandId || 'nike'}`);
                      }}
                      className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <span>Verify Domain</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultClassificationHeader({ result }: { result: UrlVerificationResult }) {
  if (result.status === 'VERIFIED_OFFICIAL') {
    return (
      <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/30 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-600 text-white uppercase tracking-wider">
                ✓ VERIFIED OFFICIAL
              </span>
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                Confidence: {result.confidenceScore}%
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
              {result.brand} • <span className="font-mono text-emerald-700 dark:text-emerald-400">{result.rootDomain}</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
              {result.explanation}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (result.status === 'LIKELY_OFFICIAL') {
    return (
      <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/30 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-amber-600 text-white uppercase tracking-wider">
                LIKELY OFFICIAL
              </span>
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                Confidence: {result.confidenceScore}%
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
              {result.brand} • <span className="font-mono text-amber-700 dark:text-amber-400">{result.rootDomain}</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
              {result.explanation}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (result.status === 'SUSPICIOUS') {
    return (
      <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-rose-600 text-white uppercase tracking-wider">
                ⚠ POTENTIAL IMPERSONATION
              </span>
              <span className="text-xs font-bold text-rose-700 dark:text-rose-400">
                Risk Score: {result.riskScore}/100
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
              Target: <span className="font-mono text-rose-700 dark:text-rose-300">{result.rootDomain}</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
              {result.explanation}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (result.status === 'INVALID') {
    return (
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs">
        <div className="flex items-center gap-2 text-rose-600 font-bold mb-1">
          <X className="w-4 h-4" />
          <span>INVALID URL</span>
        </div>
        <p className="text-slate-600 dark:text-slate-400">{result.explanation}</p>
      </div>
    );
  }

  // UNVERIFIED
  return (
    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
          <Globe className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-600 text-white uppercase tracking-wider">
              UNVERIFIED
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Risk: {result.riskScore}/100
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
            <span className="font-mono text-slate-700 dark:text-slate-300">{result.rootDomain}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
            {result.explanation}
          </p>
        </div>
      </div>
    </div>
  );
}
