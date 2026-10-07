'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/common/PageHeader';
import { useToast } from '@/components/common/ToastProvider';
import { reportStats, reportsList as initialReports } from '@/data/reports';
import { Report } from '@/types/report';
import {
  FileText,
  Download,
  Plus,
  Eye,
  CheckCircle2,
  Calendar,
  X,
  FileCheck,
  Shield,
  Loader2,
  Filter,
  Flag,
} from 'lucide-react';
import { generateNewReport } from '@/services/reports.service';
import { BrandLogo } from '@/components/common/BrandLogo';
import { useBrandContext } from '@/context/BrandContext';

export default function ReportsPage() {
  const { selectedBrand, availableBrands, setSelectedBrandId } = useBrandContext();
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);

  // Brand filter: default to selectedBrand's name, or 'ALL' if explicitly set
  const [activeBrandFilter, setActiveBrandFilter] = useState<string>(() => selectedBrand?.name || 'Apple');
  const [selectedType, setSelectedType] = useState<Report['type']>('Full Brand Audit');
  const [isGenerating, setIsGenerating] = useState(false);
  const toast = useToast();

  // Sync filter when selectedBrand changes from context
  useEffect(() => {
    if (selectedBrand?.name) {
      setActiveBrandFilter(selectedBrand.name);
    }
  }, [selectedBrand?.name]);

  // Fetch reports from API if available
  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch('/api/reports');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.reports) {
            setReports(json.data.reports);
          }
        }
      } catch {
        // Fallback
      }
    }
    loadReports();
  }, []);

  const handleBrandFilterChange = (val: string) => {
    setActiveBrandFilter(val);
    if (val !== 'ALL') {
      const match = availableBrands.find((b) => b.name.toLowerCase() === val.toLowerCase());
      if (match) setSelectedBrandId(match.id);
    }
  };

  // Filtered reports strictly per brand context (Part 20 & 48)
  const filteredReports = useMemo(() => {
    if (activeBrandFilter === 'ALL') {
      return reports;
    }
    const filterLower = activeBrandFilter.toLowerCase();
    return reports.filter(
      (r) =>
        r.brand.toLowerCase() === filterLower ||
        (r as any).brandId?.toLowerCase() === filterLower
    );
  }, [reports, activeBrandFilter]);

  // Derived stats strictly for current filter scope
  const stats = useMemo(() => {
    const total = filteredReports.length;
    const threatReps = filteredReports.filter(
      (r) => r.type === 'Threat Summary' || r.type === 'Takedown Evidence Pack'
    ).length;
    const monthlyReps = filteredReports.filter(
      (r) => r.type === 'Monthly Executive Briefing' || r.type === 'Full Brand Audit'
    ).length;
    return {
      totalReports: total,
      threatReports: threatReps,
      monthlyReports: monthlyReps,
      generatedReports: total,
    };
  }, [filteredReports]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const targetBrandName = activeBrandFilter !== 'ALL' ? activeBrandFilter : selectedBrand?.name || 'Apple';
    toast.loading('Generating executive report...', `Compiling telemetry for ${targetBrandName}`);

    try {
      const rep = await generateNewReport(targetBrandName, selectedType);
      setReports((prev) => [rep, ...prev]);
      setIsGenerating(false);
      setIsGenerateOpen(false);
      setSelectedReport(rep);
      toast.success('Report Generated Successfully', `${rep.name} is ready for preview & download.`);
    } catch {
      setIsGenerating(false);
      toast.error('Failed to generate report');
    }
  };

  const handleDownload = (rep: Report) => {
    toast.success('Report Downloaded', `Saved "${rep.name}.pdf" (${rep.fileSize}) to local drive.`);
  };

  return (
    <AppShell>
      <PageHeader
        title="Reports & Takedown Dossiers"
        subtitle="Generate executive security briefings and legal takedown evidence packages for DMCA enforcement."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/reports/create?brandName=${encodeURIComponent(activeBrandFilter !== 'ALL' ? activeBrandFilter : selectedBrand?.name || 'Apple')}`}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-xl border border-amber-200/80 dark:border-amber-900/60 transition-colors shadow-2xs"
            >
              <Flag className="w-4 h-4 text-amber-600" />
              <span>Report Threat</span>
            </Link>
            <button
              onClick={() => setIsGenerateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#007AFF] hover:bg-[#0066D6] rounded-xl shadow-sm shadow-[#007AFF]/20 transition-all active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Dossier</span>
            </button>
          </div>
        }
      />

      {/* Brand Context Scope Filter Bar (Part 20 & 49) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs mb-6">
        <div className="flex items-center gap-2.5">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Brand Scope:
          </span>
          <select
            value={activeBrandFilter}
            onChange={(e) => handleBrandFilterChange(e.target.value)}
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
          Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filteredReports.length}</span> reports scoped to{' '}
          <span className="font-bold text-[#007AFF]">{activeBrandFilter === 'ALL' ? 'All Protected Brands' : activeBrandFilter}</span>
        </div>
      </div>

      {/* Report Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="apple-card p-5">
          <span className="text-xs font-semibold text-slate-500">Total Reports</span>
          <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
            {stats.totalReports}
          </p>
          <span className="text-xs text-slate-400 mt-1 block">Active brand dossiers</span>
        </div>

        <div className="apple-card p-5">
          <span className="text-xs font-semibold text-slate-500">Threat Reports</span>
          <p className="text-3xl font-bold text-[#007AFF] tracking-tight mt-1">
            {stats.threatReports}
          </p>
          <span className="text-xs text-[#007AFF]/80 mt-1 block">Targeted takedown files</span>
        </div>

        <div className="apple-card p-5">
          <span className="text-xs font-semibold text-slate-500">Audit Reports</span>
          <p className="text-3xl font-bold text-emerald-600 tracking-tight mt-1">
            {stats.monthlyReports}
          </p>
          <span className="text-xs text-emerald-600/80 mt-1 block">Executive reviews</span>
        </div>

        <div className="apple-card p-5">
          <span className="text-xs font-semibold text-slate-500">Generated Reports</span>
          <p className="text-3xl font-bold text-indigo-600 tracking-tight mt-1">
            {stats.generatedReports}
          </p>
          <span className="text-xs text-indigo-600/80 mt-1 block">On-demand export batches</span>
        </div>
      </div>

      {/* Reports Table Card */}
      <div className="apple-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Generated Reports Archive
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cryptographically timestamped compliance reports ready for legal distribution
            </p>
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6 stroke-[1.8]" />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No reports generated for {activeBrandFilter} yet
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Compile a brand audit or takedown evidence package to create your first archival dossier.
            </p>
            <button
              onClick={() => setIsGenerateOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#007AFF] hover:bg-[#0066D6] rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Generate Dossier Now</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAFBFD] dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Report Name</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Threats</th>
                  <th className="py-3 px-4">Created By</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredReports.map((rep) => (
                  <tr
                    key={rep.id}
                    className="hover:bg-[#F9FAFB] dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#EAF3FF] dark:bg-blue-950/50 text-[#007AFF] flex items-center justify-center shrink-0 border border-[#007AFF]/20">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {rep.name}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="font-semibold text-[#007AFF]">{rep.format}</span>
                            <span>•</span>
                            <span>{rep.fileSize}</span>
                            <span>•</span>
                            <span>{rep.type}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <BrandLogo
                          brandName={rep.brand}
                          size="sm"
                          className="shrink-0"
                        />
                        <span>{rep.brand}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {rep.date}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {rep.threatsCount}
                      </span>{' '}
                      <span className="text-slate-400">threats</span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {rep.createdBy}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedReport(rep)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 rounded-lg transition-colors"
                        >
                          <Eye className="w-3 h-3 text-slate-500" />
                          Preview
                        </button>
                        <button
                          onClick={() => handleDownload(rep)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#007AFF] bg-[#EAF3FF] dark:bg-blue-950/60 hover:bg-[#D5E8FF] rounded-lg transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Report Modal */}
      {isGenerateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EAF3FF] dark:bg-blue-950/60 text-[#007AFF] flex items-center justify-center">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Generate Security Report
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Configure report criteria and scope</p>
                </div>
              </div>
              <button
                onClick={() => setIsGenerateOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Brand
                </label>
                <select
                  value={activeBrandFilter !== 'ALL' ? activeBrandFilter : selectedBrand?.name || 'Apple'}
                  onChange={(e) => setActiveBrandFilter(e.target.value)}
                  className="w-full text-xs p-2.5 bg-[#F9FAFB] dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] outline-none"
                >
                  {availableBrands.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Report Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as Report['type'])}
                  className="w-full text-xs p-2.5 bg-[#F9FAFB] dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] outline-none"
                >
                  <option value="Full Brand Audit">Full Brand Audit (Executive overview & all channels)</option>
                  <option value="Takedown Evidence Pack">Takedown Evidence Pack (Forensic artifacts & legal hashes)</option>
                  <option value="Threat Summary">Threat Summary (Condensed risk score breakdown)</option>
                  <option value="Monthly Executive Briefing">Monthly Executive Briefing (Board deck summary)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Export Format
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded-xl border border-[#007AFF] bg-[#EAF3FF] dark:bg-blue-950/60 text-[#007AFF] font-bold text-center">
                    PDF Document
                  </div>
                  <div className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-700 text-slate-500 text-center font-medium">
                    CSV Raw Data
                  </div>
                  <div className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-700 text-slate-500 text-center font-medium">
                    JSON API Payload
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsGenerateOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center gap-2 px-5 py-2 text-xs font-medium text-white bg-[#007AFF] hover:bg-[#0066D6] rounded-xl shadow-sm shadow-[#007AFF]/20 disabled:opacity-60 transition-all active:scale-98"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Compiling...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5" />
                    <span>Compile Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Report Preview Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Report Preview ({selectedReport.format})
                </span>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Header */}
            <div className="p-6 rounded-2xl bg-[#FAFBFD] dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 mb-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#007AFF] flex items-center justify-center text-white">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                    BrandGuard AI Dossier
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                  DOC ID: #{selectedReport.id.toUpperCase()}
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedReport.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Compiled for official brand stakeholders & legal enforcement counsel.
                  </p>
                </div>
                <BrandLogo
                  brandName={selectedReport.brand}
                  size="md"
                  className="rounded-xl border border-slate-200/80 dark:border-slate-700 shrink-0"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-700 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Target</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedReport.brand}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Date</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedReport.date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Analyst</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedReport.createdBy}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Close Preview
              </button>
              <button
                onClick={() => handleDownload(selectedReport)}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#007AFF] hover:bg-[#0066D6] rounded-xl shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download {selectedReport.format}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
