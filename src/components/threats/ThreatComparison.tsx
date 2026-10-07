import React from 'react';
import { Threat } from '@/types/threat';
import { ShieldCheck, AlertOctagon, Bot, Check, X, ExternalLink } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';

interface ThreatComparisonProps {
  threat: Threat;
}

export function ThreatComparison({ threat }: ThreatComparisonProps) {
  return (
    <div className="space-y-6">
      {/* Side-by-side comparison */}
      <div className="apple-card p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Visual & Cryptographic Identity Comparison
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Side-by-side juxtaposition of official brand anchor against candidate entity
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            Platform: {threat.platform}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          {/* Official Brand Anchor Column */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/20 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-emerald-100 mb-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Official Brand Anchor
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/60 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Trusted Signature
                </span>
              </div>

              {/* Logo & Name */}
              <div className="flex items-center gap-4 mb-5">
                <BrandLogo
                  brandName={threat.officialName}
                  domain={threat.officialWebsite}
                  logoUrl={threat.officialLogo}
                  size={64}
                  className="w-16 h-16 rounded-2xl border border-emerald-300 shadow-xs shrink-0"
                  alt={`${threat.officialName} official logo`}
                />
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Official Name</span>
                  <h4 className="text-base font-bold text-slate-900">
                    {threat.officialName}
                  </h4>
                  <span className="text-xs text-emerald-600 font-medium">
                    Verified Corporate Entity
                  </span>
                </div>
              </div>

              {/* Metadata rows */}
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-white border border-emerald-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Official Developer / Issuer
                  </span>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{threat.officialDeveloper}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-emerald-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Official Registered Domain
                  </span>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <a
                      href={`https://${threat.officialWebsite}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#007AFF] hover:underline flex items-center gap-1 font-medium"
                    >
                      {threat.officialWebsite}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Suspicious Candidate Entity Column */}
          <div className="rounded-2xl border border-rose-200 bg-rose-50/15 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-rose-100 mb-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-700">
                  <AlertOctagon className="w-4 h-4 text-rose-600" />
                  Suspicious Entity Candidate
                </span>
                <span className="text-[11px] font-bold text-rose-700 bg-rose-100/60 px-2.5 py-0.5 rounded-full border border-rose-200">
                  Risk Score: {threat.riskScore}
                </span>
              </div>

              {/* Candidate Logo & Name */}
              <div className="flex items-center gap-4 mb-5">
                <div className="relative">
                  <img
                    src={threat.candidateLogo}
                    alt={threat.candidateName}
                    className="w-16 h-16 rounded-2xl object-cover border border-rose-300 shadow-xs shrink-0"
                  />
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-xs">
                    Spoofed
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Candidate Name</span>
                  <h4 className="text-base font-bold text-slate-900">
                    {threat.candidateName}
                  </h4>
                  <span className="text-xs text-rose-600 font-medium">
                    {threat.nameSimilarity}% Name Similarity Match
                  </span>
                </div>
              </div>

              {/* Metadata rows */}
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-white border border-rose-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Candidate Developer / Account
                  </span>
                  <div className="flex items-center gap-1.5 font-semibold text-rose-600">
                    <X className="w-3.5 h-3.5" />
                    <span>{threat.candidateDeveloper}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-rose-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Candidate Target Website / Host
                  </span>
                  <div className="flex items-center gap-1.5 font-semibold text-rose-600">
                    <X className="w-3.5 h-3.5" />
                    <span className="truncate">{threat.candidateWebsite}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Risk Explanation Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <h4 className="text-sm font-bold tracking-tight text-white">
                AI Risk Explanation
              </h4>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Threat Intel Synthesis
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              &quot;{threat.aiExplanation}&quot;
            </p>

            {/* Impersonation tactics list */}
            {threat.impersonationTactics && (
              <div className="mt-4 pt-4 border-t border-slate-800">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                  Observed Impersonation Vectors:
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  {threat.impersonationTactics.map((tactic, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                      <span>{tactic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
