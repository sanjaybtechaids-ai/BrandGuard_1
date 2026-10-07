'use client';

import React from 'react';
import Link from 'next/link';
import { Threat } from '@/types/threat';
import { Brand } from '@/types/brand';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ChevronRight, Smartphone, Share2, Globe, ShieldCheck, Flag } from 'lucide-react';

interface RecentThreatsProps {
  threats: Threat[];
  brand?: Brand | null;
}

export function RecentThreats({ threats, brand }: RecentThreatsProps) {
  const getPlatformIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('play') || p.includes('app') || p.includes('apk')) {
      return <Smartphone className="w-3.5 h-3.5 text-slate-500" />;
    }
    if (p.includes('gram') || p.includes('x') || p.includes('tube') || p.includes('book')) {
      return <Share2 className="w-3.5 h-3.5 text-slate-500" />;
    }
    return <Globe className="w-3.5 h-3.5 text-slate-500" />;
  };

  const getScoreBadge = (score: number) => {
    let color = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50';
    if (score < 60) {
      color = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50';
    } else if (score < 75) {
      color = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50';
    } else if (score < 85) {
      color = 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900/50';
    }

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${color}`}>
        {score} / 100
      </span>
    );
  };

  // Filter threats for brand if provided
  const brandThreats = React.useMemo(() => {
    if (!brand) return threats;
    const brandIdLower = brand.id?.toLowerCase() || '';
    const brandNameLower = brand.name?.toLowerCase() || '';

    return threats.filter((t) => {
      const tBrandId = t.brandId?.toLowerCase() || '';
      const tBrandName = t.brandName?.toLowerCase() || '';
      return (
        tBrandId === brandIdLower ||
        tBrandName === brandNameLower ||
        t.name?.toLowerCase().includes(brandNameLower)
      );
    });
  }, [threats, brand]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl shadow-xs overflow-hidden">
      <div className="p-5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Active Impersonation Threats
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {brand ? (
              <>
                Active candidate threats flagged for <span className="font-semibold text-slate-800 dark:text-slate-200">{brand.name}</span>
              </>
            ) : (
              'Realtime candidates flagged by visual & name matching algorithms'
            )}
          </p>
        </div>
        <Link
          href={brand ? `/threats?brand=${brand.id}` : '/threats'}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
        >
          View All Threats
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {brandThreats.length === 0 ? (
        <div className="p-8 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6 stroke-[2]" />
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            No active threats detected for {brand?.name || 'this brand'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visual similarity and domain typosquatting monitors report zero active incidents.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Threat</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Platform</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Detected</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {brandThreats.slice(0, 5).map((threat) => (
                <tr
                  key={threat.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Threat */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={threat.candidateLogo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop'}
                        alt={threat.candidateName}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="min-w-0 max-w-[190px]">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">
                          {threat.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {threat.candidateDeveloper || threat.candidateWebsite || threat.platform}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Brand */}
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {threat.brandName}
                    </span>
                  </td>

                  {/* Platform */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      {getPlatformIcon(threat.platform)}
                      <span>{threat.platform}</span>
                    </div>
                  </td>

                  {/* Risk Score */}
                  <td className="py-3.5 px-4">
                    {getScoreBadge(threat.riskScore)}
                  </td>

                  {/* Risk Level */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={threat.riskLevel} size="sm" />
                  </td>

                  {/* Detected */}
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {threat.detectedAt}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={threat.status} size="sm" />
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/reports/create?threatId=${threat.id}&brandId=${threat.brandId}&url=${encodeURIComponent(threat.candidateWebsite || '')}&riskScore=${threat.riskScore}&brandName=${encodeURIComponent(threat.brandName)}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-lg border border-amber-200/80 dark:border-amber-900/60 transition-colors"
                        title="Report This Unofficial Website / Threat"
                      >
                        <Flag className="w-3 h-3 text-amber-600" />
                        Report
                      </Link>
                      <Link
                        href={`/threats/${threat.id}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg border border-blue-200/80 dark:border-blue-900/60 transition-colors"
                      >
                        Details
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
