'use client';

import React from 'react';
import Link from 'next/link';
import { Smartphone, CheckCircle2, Star, ExternalLink, Play } from 'lucide-react';

import { Brand } from '@/types/brand';

interface OfficialAppsCardProps {
  brand?: Brand;
}

export function OfficialAppsCard({ brand }: OfficialAppsCardProps) {
  const primaryApp = brand?.officialApps?.[0];
  const appName = primaryApp?.name || (brand ? `${brand.name} Official App` : 'Nike: Shop & Discover');
  const developer = primaryApp?.developer || brand?.company || 'Nike, Inc.';
  const packageId = primaryApp?.packageId || (brand ? `com.${brand.id}.app` : 'com.nike.omega');
  const appIcon = primaryApp?.icon || brand?.logo;

  return (
    <div className="apple-card p-6 bg-white dark:bg-slate-900 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#007AFF] flex items-center justify-center">
              <Smartphone className="w-4 h-4 stroke-[2]" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Official Applications
            </h3>
          </div>

          <Link
            href="/apps?filter=trusted"
            className="text-xs font-semibold text-[#007AFF] hover:underline"
          >
            View All ({brand?.officialApps?.length || 4})
          </Link>
        </div>

        {/* App Card Content */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center p-2 shadow-xs shrink-0 overflow-hidden">
            {appIcon ? (
              <img src={appIcon} alt={appName} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <Smartphone className="w-6 h-6 text-white" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {appName}
              </h4>
              <span className="text-[#007AFF] shrink-0" title="Verified Anchor">
                <CheckCircle2 className="w-4 h-4 fill-current text-white stroke-[#007AFF] stroke-[2.5]" />
              </span>
            </div>

            <div className="space-y-1 mt-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center justify-between">
                <span>Developer</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px] text-right">
                  {developer}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Package ID</span>
                <span className="font-mono text-slate-600 dark:text-slate-300 truncate max-w-[140px] text-right">
                  {packageId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Downloads</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {brand?.id === 'nike' ? '100M+' : '10M+'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Rating</span>
                <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>4.5 (2.1M reviews)</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Button at bottom */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <a
          href="https://play.google.com/store/apps/details?id=com.nike.omega"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 transition-colors"
        >
          <Play className="w-3.5 h-3.5 fill-current text-emerald-600 dark:text-emerald-400" />
          <span>View on Play Store</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>
      </div>
    </div>
  );
}
