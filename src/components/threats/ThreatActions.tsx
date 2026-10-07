'use client';

import React, { useState } from 'react';
import { Threat } from '@/types/threat';
import { useToast } from '../common/ToastProvider';
import { Eye, CheckCircle2, FileText, Loader2, ShieldCheck } from 'lucide-react';
import { updateThreatStatus } from '@/services/threats.service';
import { generateNewReport } from '@/services/reports.service';

interface ThreatActionsProps {
  threat: Threat;
  onStatusChange?: (newStatus: Threat['status']) => void;
}

export function ThreatActions({ threat, onStatusChange }: ThreatActionsProps) {
  const [currentStatus, setCurrentStatus] = useState<Threat['status']>(threat.status);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const toast = useToast();

  const handleInvestigate = async () => {
    setLoadingAction('investigate');
    toast.loading('Updating threat workflow status...');
    try {
      await updateThreatStatus(threat.id, 'Investigating');
      setCurrentStatus('Investigating');
      onStatusChange?.('Investigating');
      toast.success(
        'Marked as Investigating',
        `Assigned threat #${threat.id} to active SOC security analyst investigation queue.`
      );
    } catch {
      toast.error('Failed to update status');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleResolve = async () => {
    setLoadingAction('resolve');
    toast.loading('Resolving threat incident...');
    try {
      await updateThreatStatus(threat.id, 'Resolved');
      setCurrentStatus('Resolved');
      onStatusChange?.('Resolved');
      toast.success(
        'Threat Marked as Resolved',
        `Incident marked resolved. Takedown notice successfully logged and verified.`
      );
    } catch {
      toast.error('Failed to resolve threat');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGenerateReport = async () => {
    setLoadingAction('report');
    toast.loading('Compiling forensic evidence dossier...');
    try {
      await generateNewReport(threat.brandName, 'Takedown Evidence Pack');
      toast.success(
        'Evidence Pack Generated',
        `PDF evidence dossier for "${threat.name}" compiled and stored in Reports.`
      );
    } catch {
      toast.error('Report compilation failed');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="apple-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Remediation & Incident Response
        </span>
        <p className="text-sm font-semibold text-slate-900 mt-0.5">
          Current Incident Status:{' '}
          <span
            className={`font-bold ${
              currentStatus === 'Resolved'
                ? 'text-emerald-600'
                : currentStatus === 'Investigating'
                ? 'text-[#007AFF]'
                : 'text-amber-600'
            }`}
          >
            {currentStatus}
          </span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <button
          onClick={handleInvestigate}
          disabled={loadingAction !== null || currentStatus === 'Investigating'}
          className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl border transition-all ${
            currentStatus === 'Investigating'
              ? 'bg-blue-50 text-[#007AFF] border-blue-200 opacity-60 cursor-not-allowed'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80 shadow-xs'
          }`}
        >
          {loadingAction === 'investigate' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#007AFF]" />
          ) : (
            <Eye className="w-3.5 h-3.5 text-[#007AFF]" />
          )}
          <span>Mark as Investigating</span>
        </button>

        <button
          onClick={handleResolve}
          disabled={loadingAction !== null || currentStatus === 'Resolved'}
          className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl border transition-all ${
            currentStatus === 'Resolved'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 opacity-60 cursor-not-allowed'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80 shadow-xs'
          }`}
        >
          {loadingAction === 'resolve' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          )}
          <span>Mark as Resolved</span>
        </button>

        <button
          onClick={handleGenerateReport}
          disabled={loadingAction !== null}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#007AFF] hover:bg-[#0066D6] rounded-xl shadow-sm shadow-[#007AFF]/20 transition-all active:scale-98"
        >
          {loadingAction === 'report' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <FileText className="w-3.5 h-3.5" />
          )}
          <span>Generate Report</span>
        </button>
      </div>
    </div>
  );
}
