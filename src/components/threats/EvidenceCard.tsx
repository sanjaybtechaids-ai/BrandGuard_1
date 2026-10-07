import React from 'react';
import { Threat } from '@/types/threat';
import {
  Percent,
  CheckCircle2,
  XCircle,
  Type,
  Image as ImageIcon,
  FileText,
  UserX,
  Globe2,
  Package,
} from 'lucide-react';

interface EvidenceCardProps {
  threat: Threat;
}

export function EvidenceCard({ threat }: EvidenceCardProps) {
  const getSimColor = (val: number) => {
    if (val >= 85) return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50';
    if (val >= 70) return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900/50';
    return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50';
  };

  return (
    <div className="apple-card p-6">
      <div className="pb-4 border-b border-slate-100 mb-5">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>Why was this flagged?</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EAF3FF] text-[#007AFF] font-semibold border border-[#007AFF]/20">
            6 Vector Signals
          </span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Automated comparison signals between suspected candidate and trusted official brand profile
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        {/* Name Similarity */}
        <div className="p-3.5 rounded-xl border border-slate-100 bg-[#FAFBFD]">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Type className="w-3.5 h-3.5 text-[#007AFF]" />
              Name Similarity
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900">
              {threat.nameSimilarity}%
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSimColor(threat.nameSimilarity)}`}>
              High Match
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-rose-500 h-1 rounded-full" style={{ width: `${threat.nameSimilarity}%` }} />
          </div>
        </div>

        {/* Logo Similarity */}
        <div className="p-3.5 rounded-xl border border-slate-100 bg-[#FAFBFD]">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
              Logo Similarity
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900">
              {threat.logoSimilarity}%
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSimColor(threat.logoSimilarity)}`}>
              Visual Vector
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-rose-500 h-1 rounded-full" style={{ width: `${threat.logoSimilarity}%` }} />
          </div>
        </div>

        {/* Description Similarity */}
        <div className="p-3.5 rounded-xl border border-slate-100 bg-[#FAFBFD]">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <FileText className="w-3.5 h-3.5 text-purple-500" />
              Description Similarity
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900">
              {threat.descriptionSimilarity}%
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSimColor(threat.descriptionSimilarity)}`}>
              Semantic Match
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-amber-500 h-1 rounded-full" style={{ width: `${threat.descriptionSimilarity}%` }} />
          </div>
        </div>

        {/* Developer Match */}
        <div className="p-3.5 rounded-xl border border-slate-100 bg-[#FAFBFD]">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <UserX className="w-3.5 h-3.5 text-slate-400" />
              Developer Match
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {threat.developerMatch ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Yes (Authorized)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                <XCircle className="w-3.5 h-3.5" /> No (Unverified Dev)
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Zero signing key match</p>
        </div>

        {/* Official Domain */}
        <div className="p-3.5 rounded-xl border border-slate-100 bg-[#FAFBFD]">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Globe2 className="w-3.5 h-3.5 text-slate-400" />
              Official Domain
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {threat.domainMatch ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Yes
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                <XCircle className="w-3.5 h-3.5" /> No (Foreign Domain)
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 mt-2">DNS points to third-party</p>
        </div>

        {/* Package Match */}
        <div className="p-3.5 rounded-xl border border-slate-100 bg-[#FAFBFD]">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Package className="w-3.5 h-3.5 text-slate-400" />
              Package Match
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {threat.packageMatch ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Yes
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                <XCircle className="w-3.5 h-3.5" /> No (Rogue Namespace)
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Namespace spoofing attempt</p>
        </div>
      </div>
    </div>
  );
}
