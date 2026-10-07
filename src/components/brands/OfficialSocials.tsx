import React from 'react';
import { OfficialSocial } from '@/types/brand';
import { CheckCircle2, Share2, ExternalLink } from 'lucide-react';

interface OfficialSocialsProps {
  socials: OfficialSocial[];
}

export function OfficialSocials({ socials }: OfficialSocialsProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Official Social Accounts
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 font-semibold border border-blue-200 dark:border-blue-800/50">
              {socials.length} Connected
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verified social channels used to calibrate legitimate impersonation thresholds
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {socials.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800/70 transition-all group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                {item.platform.slice(0, 2)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    {item.platform}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  {item.handle}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/80 dark:border-emerald-800/60">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Verified
              </span>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label={`Open ${item.platform} link`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
