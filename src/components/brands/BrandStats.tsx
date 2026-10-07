'use client';

import React, { useState } from 'react';
import { Brand } from '@/types/brand';
import { ShieldAlert, Play, Clock, AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { ScanModal } from '../dashboard/ScanModal';

interface BrandStatsProps {
  brand: Brand;
}

export function BrandStats({ brand }: BrandStatsProps) {
  const [isScanOpen, setIsScanOpen] = useState(false);

  return (
    <>
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Brand Protection Status
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Current vulnerability posture and active detected anomalies
            </p>
          </div>
          <button
            onClick={() => setIsScanOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Start Scan
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {/* Threats */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Threats</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {brand.threatCount}
            </p>
            <span className="text-[10px] text-slate-400">Flagged across channels</span>
          </div>

          {/* Critical */}
          <div className="p-3.5 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40">
            <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-semibold">
              <AlertOctagon className="w-3.5 h-3.5" />
              Critical
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
              {brand.criticalCount}
            </p>
            <span className="text-[10px] text-red-500/80">Immediate risk</span>
          </div>

          {/* High */}
          <div className="p-3.5 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/40">
            <div className="flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              High
            </div>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
              {brand.highCount}
            </p>
            <span className="text-[10px] text-orange-500/80">Under investigation</span>
          </div>

          {/* Medium */}
          <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold">
              <ShieldAlert className="w-3.5 h-3.5" />
              Medium
            </div>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {brand.mediumCount}
            </p>
            <span className="text-[10px] text-amber-500/80">Review recommended</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Last Scan: <strong>{brand.lastScan}</strong></span>
          </div>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Autonomous Monitoring Active
          </span>
        </div>
      </div>

      <ScanModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        brandId={brand.id}
        brandName={brand.name}
      />
    </>
  );
}
