'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { RiskScore } from '@/components/threats/RiskScore';
import { EvidenceCard } from '@/components/threats/EvidenceCard';
import { ThreatComparison } from '@/components/threats/ThreatComparison';
import { ThreatActions } from '@/components/threats/ThreatActions';
import { LoadingState } from '@/components/common/LoadingState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { getThreatById } from '@/services/threats.service';
import { Threat } from '@/types/threat';
import {
  ArrowLeft,
  ShieldAlert,
  ExternalLink,
  Calendar,
  Building2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ThreatDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const [threat, setThreat] = useState<Threat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const t = await getThreatById(resolvedParams.id);
      if (t) {
        setThreat(t);
      }
      setLoading(false);
    }
    load();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <AppShell>
        <LoadingState message="Extracting threat evidence and telemetry..." />
      </AppShell>
    );
  }

  if (!threat) {
    return (
      <AppShell>
        <div className="text-center py-16">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Threat Not Found</h2>
          <p className="text-sm text-slate-500 mt-2">The requested incident record does not exist.</p>
          <Link
            href="/threats"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/40 rounded-lg"
          >
            ← Return to Threat Center
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Back button */}
      <div className="mb-4">
        <Link
          href="/threats"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Threat Center</span>
        </Link>
      </div>

      {/* Threat Incident Header */}
      <div className="apple-card p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <img
              src={threat.candidateLogo}
              alt={threat.name}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200/80 shadow-xs shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {threat.name}
                </h1>
                <StatusBadge status={threat.riskLevel} size="md" />
                <StatusBadge status={threat.status} size="md" />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  Target Brand:{' '}
                  <Link
                    href={`/brands/${threat.brandId}`}
                    className="font-semibold text-[#007AFF] hover:underline"
                  >
                    {threat.brandName}
                  </Link>
                </span>
                <span className="text-slate-200">•</span>
                <span>Platform: <strong className="text-slate-700 font-medium">{threat.platform}</strong></span>
                <span className="text-slate-200">•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  Detected: {threat.detectedAt}
                </span>
                {threat.url && (
                  <>
                    <span className="text-slate-200">•</span>
                    <a
                      href={threat.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#007AFF] hover:underline flex items-center gap-1 font-medium"
                    >
                      External URL
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[11px] font-mono font-bold text-slate-400 block bg-slate-100 px-2.5 py-1 rounded-lg">
              INCIDENT ID: #{threat.id.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Top Split: Risk Score Meter & Evidence Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Risk Meter Card */}
        <div className="lg:col-span-1">
          <RiskScore score={threat.riskScore} level={threat.riskLevel} />
        </div>

        {/* Evidence Signals (Why was this flagged?) */}
        <div className="lg:col-span-2">
          <EvidenceCard threat={threat} />
        </div>
      </div>

      {/* Visual Identity Comparison: OFFICIAL BRAND vs SUSPICIOUS ENTITY & AI Risk Explanation */}
      <div className="mb-6">
        <ThreatComparison threat={threat} />
      </div>

      {/* Remediation & Action Toolbar: Mark Investigating, Mark Resolved, Generate Report */}
      <div className="mb-6">
        <ThreatActions
          threat={threat}
          onStatusChange={(newStatus) => {
            setThreat((prev) => (prev ? { ...prev, status: newStatus } : null));
          }}
        />
      </div>
    </AppShell>
  );
}
