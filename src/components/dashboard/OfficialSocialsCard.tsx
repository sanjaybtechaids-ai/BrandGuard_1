'use client';

import React from 'react';
import Link from 'next/link';
import { Share2, CheckCircle2, ExternalLink } from 'lucide-react';

import { Brand } from '@/types/brand';

interface OfficialSocialsCardProps {
  brand?: Brand;
}

export function OfficialSocialsCard({ brand }: OfficialSocialsCardProps) {
  const getBadgeColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white';
      case 'x':
        return 'bg-black text-white dark:bg-slate-700';
      case 'youtube':
        return 'bg-red-600 text-white';
      case 'facebook':
        return 'bg-blue-600 text-white';
      case 'linkedin':
        return 'bg-sky-700 text-white';
      default:
        return 'bg-slate-900 text-white dark:bg-slate-800';
    }
  };

  const getLetter = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return 'ig';
      case 'x':
        return '𝕏';
      case 'youtube':
        return 'yt';
      case 'facebook':
        return 'fb';
      case 'linkedin':
        return 'in';
      default:
        return platform.substring(0, 2).toLowerCase();
    }
  };

  const socials =
    brand?.officialSocials && brand.officialSocials.length > 0
      ? brand.officialSocials.map((s) => ({
          platform: s.platform,
          handle: s.handle,
          url: s.url,
          badgeColor: getBadgeColor(s.platform),
          letter: getLetter(s.platform),
        }))
      : [
          {
            platform: 'Instagram',
            handle: `@${brand?.name?.toLowerCase() || 'nike'}`,
            url: `https://instagram.com/${brand?.name?.toLowerCase() || 'nike'}`,
            badgeColor: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white',
            letter: 'ig',
          },
          {
            platform: 'X',
            handle: `@${brand?.name || 'Nike'}`,
            url: `https://x.com/${brand?.name || 'Nike'}`,
            badgeColor: 'bg-black text-white dark:bg-slate-700',
            letter: '𝕏',
          },
          {
            platform: 'LinkedIn',
            handle: `${brand?.name || 'Nike'} Official`,
            url: `https://linkedin.com/company/${brand?.name?.toLowerCase() || 'nike'}`,
            badgeColor: 'bg-sky-700 text-white',
            letter: 'in',
          },
        ];

  return (
    <div className="apple-card p-6 bg-white dark:bg-slate-900 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#007AFF] flex items-center justify-center">
              <Share2 className="w-4 h-4 stroke-[2]" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Official Social Media Accounts
            </h3>
          </div>

          <Link
            href="/social?filter=trusted"
            className="text-xs font-semibold text-[#007AFF] hover:underline"
          >
            View All
          </Link>
        </div>

        {/* Social Accounts Rows */}
        <div className="space-y-2.5 text-xs">
          {socials.map((item) => (
            <div
              key={item.platform}
              className="flex items-center justify-between py-1 group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 shadow-2xs ${item.badgeColor}`}
                >
                  {item.letter}
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-bold text-slate-900 dark:text-white truncate">
                    {item.handle}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 fill-current text-white stroke-[#007AFF] stroke-[2.5] shrink-0" />
                </div>
              </div>

              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 group-hover:text-[#007AFF] flex items-center gap-1 ml-2 font-mono text-[11px] truncate max-w-[140px] transition-colors"
              >
                <span className="truncate">{item.url}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
