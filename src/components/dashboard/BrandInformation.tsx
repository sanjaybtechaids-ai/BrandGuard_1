'use client';

import React from 'react';
import { FileText, Edit2, ExternalLink } from 'lucide-react';
import { useToast } from '../common/ToastProvider';

import { Brand } from '@/types/brand';

interface BrandInformationProps {
  brand?: Brand;
}

export function BrandInformation({ brand }: BrandInformationProps) {
  const toast = useToast();

  const brandName = brand?.name || 'Nike';
  const legalName = brand?.company || brand?.legalName || `${brandName}, Inc.`;
  const website = brand?.website || 'nike.com';
  const cleanWebsite = website.startsWith('http') ? website : `https://${website}`;

  const details = [
    { label: 'Legal Name', value: legalName },
    { label: 'Headquarters', value: brand?.headquarters || 'Beaverton, Oregon, USA' },
    { label: 'Founded', value: brand?.foundedYear?.toString() || '1964' },
    { label: 'Category', value: brand?.category || 'Enterprise & Consumer Goods' },
    {
      label: 'Official Website',
      value: cleanWebsite,
      isLink: true,
      href: cleanWebsite,
    },
    { label: 'Status', value: `${brand?.verificationStatus || 'Verified'} Baseline` },
  ];

  return (
    <div className="apple-card p-6 bg-white dark:bg-slate-900 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#007AFF] flex items-center justify-center">
              <FileText className="w-4 h-4 stroke-[2]" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Official Brand Information
            </h3>
          </div>

          <button
            onClick={() => toast.info('Edit Baseline', 'Brand anchor records are verified via organizational certificate.')}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-lg border border-slate-200/60 dark:border-slate-700 transition-colors"
          >
            <Edit2 className="w-3 h-3 text-slate-400" />
            <span>Edit</span>
          </button>
        </div>

        {/* Data Rows */}
        <div className="space-y-2.5 text-xs">
          {details.map((item) => (
            <div key={item.label} className="flex items-baseline justify-between py-1">
              <span className="text-slate-400 dark:text-slate-500 font-medium w-32 shrink-0">
                {item.label}
              </span>
              <div className="text-right font-semibold text-slate-800 dark:text-slate-200 truncate flex-1">
                {item.isLink ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#007AFF] hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    <span>{item.value}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span>{item.value}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
