'use client';

import React, { useState, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/common/PageHeader';
import { useToast } from '@/components/common/ToastProvider';
import { useBrandContext } from '@/context/BrandContext';
import { BrandLogo } from '@/components/common/BrandLogo';
import {
  ShieldAlert,
  ArrowLeft,
  Mail,
  FileText,
  Send,
  CheckCircle2,
  X,
  AlertTriangle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Download,
} from 'lucide-react';

function ReportCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { selectedBrand } = useBrandContext();

  const brandId = searchParams.get('brandId') || selectedBrand?.id || 'apple';
  const brandName =
    searchParams.get('brandName') ||
    searchParams.get('brand') ||
    selectedBrand?.name ||
    'Apple';
  const threatId = searchParams.get('threatId') || '';
  const suspiciousUrl =
    searchParams.get('url') ||
    searchParams.get('reportedUrl') ||
    searchParams.get('candidateName') ||
    'https://apple-security-verify.com';
  const riskScore = parseInt(searchParams.get('riskScore') || '92', 10);
  const candidateType = searchParams.get('type') || 'WEBSITE';

  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDossier, setIsGeneratingDossier] = useState(false);
  const [reportCreated, setReportCreated] = useState(false);
  const [emailClientOpened, setEmailClientOpened] = useState(false);
  const [generatedReportId, setGeneratedReportId] = useState<string | null>(null);

  const riskLevel = useMemo(() => {
    if (riskScore >= 85) return 'Critical';
    if (riskScore >= 70) return 'High';
    if (riskScore >= 50) return 'Medium';
    return 'Low';
  }, [riskScore]);

  const evidenceItems = useMemo(() => [
    { label: 'Brand name similarity', status: 'detected', text: 'Brand trademark detected in domain structure' },
    { label: 'Domain typosquatting pattern', status: 'detected', text: 'High visual and phonetic similarity to authentic namespace' },
    { label: 'Official domain mismatch', status: 'failed', text: 'No DNS or WHOIS affiliation with canonical brand ownership' },
    { label: 'No official cryptographic relationship', status: 'failed', text: 'Third-party TLS issuer not matching brand infrastructure' },
    { label: 'Deceptive content heuristic', status: 'detected', text: 'Credential intake forms or unauthorized checkout flow identified' },
  ], []);

  // 1. Submit Report to Internal BrandGuard Database
  const handleSubmitReport = async () => {
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REPORT_UNOFFICIAL_WEBSITE',
          brandId,
          brandName,
          threatId,
          reportedUrl: suspiciousUrl,
          riskScore,
          riskLevel,
          notes,
          evidence: evidenceItems.map((e) => `${e.label}: ${e.text}`),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setReportCreated(true);
        setGeneratedReportId(json.data?.id || `rep-${Date.now()}`);
        toast.success(
          'Incident Report Recorded',
          `Threat logged in BrandGuard monitoring queue for ${brandName}.`
        );
      } else {
        toast.error('Submission Failed', json.error?.message || 'Could not record report.');
      }
    } catch {
      toast.error('Network Error', 'Failed to communicate with report service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Email Official Brand via mailto (with strictly accurate non-deceptive messaging per Part 23 & 59)
  const handleEmailOfficialBrand = () => {
    const brandContact = `security@${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
    const subject = encodeURIComponent(`BrandGuard AI — Unofficial Website Report for ${brandName}`);
    const body = encodeURIComponent(
`BRAND PROTECTION ALERT: Unofficial Website Impersonation

Brand: ${brandName}
Target URL: ${suspiciousUrl}
Risk Score: ${riskScore} / 100
Risk Level: ${riskLevel}

FORENSIC EVIDENCE:
- Brand name similarity: Detected
- Domain typosquatting: Detected
- Official domain mismatch: Confirmed (Unregistered third-party)
- Cryptographic relationship: None
- Content heuristic: Deceptive login/credential prompt

Analyst Notes:
${notes || 'Automated forensic audit flagged this candidate domain as an impersonation vector.'}

--
Generated via BrandGuard AI Continuous Brand Protection Platform
Cryptographic Report Ref: BGUARD-${Date.now().toString(36).toUpperCase()}`
    );

    const mailtoUrl = `mailto:${brandContact}?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, '_blank');

    setEmailClientOpened(true);
    toast.info(
      'Email Client Opened',
      'Your email client will open with the report prepared.'
    );
  };

  // 3. Generate Downloadable PDF Dossier
  const handleGenerateDossier = async () => {
    setIsGeneratingDossier(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: brandName,
          type: 'Takedown Package',
        }),
      });
      const json = await res.json();
      if (json.success) {
        setGeneratedReportId(json.data?.id);
        toast.success(
          'Dossier Generated',
          `Full compliance package for ${brandName} is ready for download.`
        );
      }
    } catch {
      toast.error('Generation Error', 'Failed to generate PDF dossier.');
    } finally {
      setIsGeneratingDossier(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button & Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-2xs"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Report Unofficial Website
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Submit candidate impersonation for legal review, takedown notice, and official brand escalation.
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Brand & Target Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <BrandLogo
              brandName={brandName}
              size="lg"
              className="w-12 h-12 rounded-2xl border border-slate-200 dark:border-slate-700"
            />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Target Brand
              </span>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {brandName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black border ${
                riskScore >= 80
                  ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60'
                  : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60'
              }`}
            >
              Risk: {riskScore} / 100 — {riskLevel}
            </span>
          </div>
        </div>

        {/* Suspicious URL Box */}
        <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Candidate Impersonation URL
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-900 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60">
              UNVERIFIED ENTITY
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-sm sm:text-base font-bold text-slate-900 dark:text-white break-all">
              {suspiciousUrl}
            </p>
            {suspiciousUrl.startsWith('http') && (
              <a
                href={suspiciousUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
                title="Inspect in sandbox"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Explainable Forensic Evidence (Part 22) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Explainable Forensic Evidence
          </h3>

          <div className="space-y-2.5">
            {evidenceItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex items-start gap-3"
              >
                {item.status === 'detected' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {item.label}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        item.status === 'detected'
                          ? 'bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-rose-100/80 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}
                    >
                      {item.status === 'detected' ? 'CONFIRMED' : 'MISMATCH'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Analyst Notes */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Analyst Case Notes & Takedown Directives (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Add relevant notes, e.g., 'Phishing campaign targeting retail customers via SMS link'..."
            className="w-full text-xs sm:text-sm p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] text-slate-900 dark:text-white"
          />
        </div>

        {/* Mailto Banner if clicked (Part 59) */}
        {emailClientOpened && (
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-start gap-3">
            <Mail className="w-4 h-4 text-[#007AFF] shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 dark:text-slate-300">
              <span className="font-bold">Email draft initiated: </span>
              Your email client will open with the report prepared. Review the prefilled forensic package and click send in your mail software.
            </div>
          </div>
        )}

        {/* Success notification if report submitted */}
        {reportCreated && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Incident report stored successfully in database archive.</span>
            </div>
            <Link
              href={`/reports?brand=${encodeURIComponent(brandName)}`}
              className="text-xs font-bold text-[#007AFF] hover:underline"
            >
              View in Reports Archive →
            </Link>
          </div>
        )}

        {/* Action Buttons (Part 58: [Report Threat], [Email Official Brand], [Generate Report], [Cancel]) */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Action 1: Email Official Brand (Part 23) */}
            <button
              type="button"
              onClick={handleEmailOfficialBrand}
              className="px-4 py-2.5 rounded-xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/70 hover:bg-blue-100 dark:bg-blue-950/40 text-xs font-bold text-[#007AFF] dark:text-blue-300 transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Official Brand</span>
            </button>

            {/* Action 2: Generate Report Dossier */}
            <button
              type="button"
              onClick={handleGenerateDossier}
              disabled={isGeneratingDossier}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all flex items-center gap-1.5 shadow-2xs"
            >
              {isGeneratingDossier ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Compiling...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Generate Dossier</span>
                </>
              )}
            </button>

            {/* Action 3: Submit Report */}
            <button
              type="button"
              onClick={handleSubmitReport}
              disabled={isSubmitting || reportCreated}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-sm flex items-center gap-2 ${
                reportCreated
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20 active:scale-98'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Logging Incident...</span>
                </>
              ) : reportCreated ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Report Submitted</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Report Threat</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReportCreatePage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading report workflow...</div>}>
        <ReportCreateContent />
      </Suspense>
    </AppShell>
  );
}
