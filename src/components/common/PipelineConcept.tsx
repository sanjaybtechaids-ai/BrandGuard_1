import React from 'react';
import { ShieldCheck, Radar, GitCompare, Gauge, ShieldAlert, ArrowRight } from 'lucide-react';

export function PipelineConcept() {
  const steps = [
    {
      num: '01',
      title: 'TRUSTED BRAND PROFILE',
      desc: 'Official apps, domains, social handles & verified cryptographic anchors',
      icon: ShieldCheck,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      num: '02',
      title: 'DISCOVERY',
      desc: 'Continuous crawling across app stores, APK mirrors & social networks',
      icon: Radar,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    },
    {
      num: '03',
      title: 'COMPARISON',
      desc: 'Visual logo vectors, trademark string distance & package signature analysis',
      icon: GitCompare,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      num: '04',
      title: 'RISK SCORE',
      desc: 'Confidence scoring (0-100) weighing developer discrepancy & malicious signals',
      icon: Gauge,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      num: '05',
      title: 'THREAT ACTION',
      desc: 'Prioritized remediation, analyst investigation & takedown evidence packs',
      icon: ShieldAlert,
      color: 'text-red-500 bg-red-500/10 border-red-500/20',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              BrandGuard AI Defense Architecture
            </h3>
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            End-to-End Digital Brand Impersonation Pipeline
          </p>
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          Autonomous SOC Pipeline
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between group hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${step.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500">
                    {step.num}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                  {step.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
