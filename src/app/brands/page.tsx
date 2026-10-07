'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/common/PageHeader';
import { BrandCard } from '@/components/brands/BrandCard';
import { SearchBar } from '@/components/common/SearchBar';
import { EmptyState } from '@/components/common/EmptyState';
import { brands as initialBrands } from '@/data/brands';
import { Brand } from '@/types/brand';
import { Plus, Shield, Grid, List } from 'lucide-react';
import { StatusBadge } from '@/components/common/StatusBadge';
import { BrandLogo } from '@/components/common/BrandLogo';

export default function BrandsPage() {
  const [brandsList, setBrandsList] = useState<Brand[]>(() =>
    initialBrands.filter((b) => !b.organizationId || b.organizationId === 'a0000000-0000-0000-0000-000000000001')
  );
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    async function loadBrands() {
      try {
        const res = await fetch('/api/brands');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setBrandsList(json.data);
        }
      } catch (err) {
        console.warn('Failed to load brands from API, using fallback:', err);
      }
    }
    loadBrands();

    const handleFocus = () => loadBrands();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const filteredBrands = brandsList.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.website.toLowerCase().includes(search.toLowerCase()) ||
      b.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <PageHeader
        title="Protected Brands"
        subtitle="Manage the brands monitored by your organization for rogue impersonation."
        badge={
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EAF3FF] text-[#007AFF] dark:bg-blue-950/60 dark:text-blue-400 font-semibold border border-blue-200/60 dark:border-blue-900">
            {brandsList.length} Monitored
          </span>
        }
        actions={
          <Link
            href="/brands/add"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#007AFF] hover:bg-[#0066D6] rounded-xl shadow-xs shadow-blue-500/20 transition-all active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[2.2]" />
            <span>Add Brand</span>
          </Link>
        }
      />

      {/* Search & Layout toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search protected brand profiles..."
          className="w-full sm:max-w-md"
        />

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs shadow-2xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-slate-100 dark:bg-slate-800 text-[#007AFF] dark:text-white font-semibold'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-slate-100 dark:bg-slate-800 text-[#007AFF] dark:text-white font-semibold'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
              title="Table View"
              aria-label="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Brands listing */}
      {filteredBrands.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBrands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        ) : (
          <div className="apple-card overflow-hidden bg-white dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Brand</th>
                    <th className="py-3 px-4">Domain</th>
                    <th className="py-3 px-4">Official Assets</th>
                    <th className="py-3 px-4">Threats</th>
                    <th className="py-3 px-4">Last Scan</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredBrands.map((brand) => (
                    <tr
                      key={brand.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <BrandLogo
                            brandId={brand.id}
                            brandName={brand.name}
                            domain={brand.canonical_domain || brand.canonicalDomain || brand.logo_domain || brand.logoDomain || brand.website}
                            logoUrl={brand.logo_url || brand.logoUrl || brand.logo}
                            size="md"
                          />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {brand.name}
                            </span>
                            <p className="text-[11px] text-slate-400">{brand.company}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                        {brand.website}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {brand.officialAppsCount} apps • {brand.officialSocialsCount} socials
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {brand.threatCount}
                        </span>
                        {brand.criticalCount > 0 && (
                          <span className="ml-1 text-[10px] text-red-600 dark:text-red-400 font-bold">
                            ({brand.criticalCount} crit)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        {brand.lastScan}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={brand.verificationStatus} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/brands/${brand.id}`}
                          className="px-3 py-1.5 text-xs font-semibold text-[#007AFF] hover:bg-[#EAF3FF] dark:hover:bg-blue-950/40 rounded-xl transition-colors"
                        >
                          View Profile →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <EmptyState
          title="No brands found"
          description="Try adjusting your brand search or add a new brand profile."
          actionText="Clear Search"
          onAction={() => setSearch('')}
        />
      )}
    </AppShell>
  );
}
