'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Threat } from '@/types/threat';
import { StatusBadge } from '@/components/common/StatusBadge';
import { SearchBar } from '@/components/common/SearchBar';
import { EmptyState } from '@/components/common/EmptyState';
import {
  Smartphone,
  Share2,
  Globe,
  ArrowUpDown,
  ChevronRight,
  Flag,
} from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';

interface ThreatTableProps {
  initialThreats: Threat[];
  initialBrandFilter?: string;
}

export function ThreatTable({ initialThreats, initialBrandFilter }: ThreatTableProps) {
  const [threats] = useState<Threat[]>(initialThreats);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState(initialBrandFilter || 'all');

  React.useEffect(() => {
    if (initialBrandFilter) {
      setBrandFilter(initialBrandFilter);
    }
  }, [initialBrandFilter]);
  const [platformFilter, setPlatformFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<'riskScore' | 'detectedAt' | 'name'>('riskScore');
  const [sortAsc, setSortAsc] = useState(false);

  // Extract unique brands and platforms for filters
  const uniqueBrands = useMemo(() => {
    return Array.from(new Set(initialThreats.map((t) => t.brandName)));
  }, [initialThreats]);

  const uniquePlatforms = useMemo(() => {
    return Array.from(new Set(initialThreats.map((t) => t.platform)));
  }, [initialThreats]);

  const filteredThreats = useMemo(() => {
    let list = [...threats];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.candidateName.toLowerCase().includes(q) ||
          t.brandName.toLowerCase().includes(q) ||
          t.candidateDeveloper.toLowerCase().includes(q)
      );
    }

    if (brandFilter !== 'all') {
      list = list.filter((t) => t.brandName === brandFilter);
    }

    if (platformFilter !== 'all') {
      list = list.filter((t) => t.platform === platformFilter);
    }

    if (riskFilter !== 'all') {
      list = list.filter((t) => t.riskLevel.toLowerCase() === riskFilter.toLowerCase());
    }

    if (statusFilter !== 'all') {
      list = list.filter((t) => t.status.toLowerCase() === statusFilter.toLowerCase());
    }

    list.sort((a, b) => {
      if (sortField === 'riskScore') {
        return sortAsc ? a.riskScore - b.riskScore : b.riskScore - a.riskScore;
      }
      if (sortField === 'name') {
        return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      return 0;
    });

    return list;
  }, [threats, search, brandFilter, platformFilter, riskFilter, statusFilter, sortField, sortAsc]);

  const toggleSort = (field: 'riskScore' | 'name') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

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

  return (
    <div className="apple-card overflow-hidden">
      {/* Controls & Filters Bar */}
      <div className="p-5 border-b border-slate-100 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search threats, candidate names, developers..."
            className="w-full md:max-w-md"
          />

          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-900">{filteredThreats.length}</strong> of{' '}
            {initialThreats.length} detected threats
          </div>
        </div>

        {/* Filter dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {/* Brand */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Brand
            </label>
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-[#F9FAFB] border border-slate-200/80 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF]"
            >
              <option value="all">All Brands ({uniqueBrands.length})</option>
              {uniqueBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Platform */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Platform
            </label>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-[#F9FAFB] border border-slate-200/80 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF]"
            >
              <option value="all">All Platforms</option>
              {uniquePlatforms.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Level */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Risk Level
            </label>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-[#F9FAFB] border border-slate-200/80 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF]"
            >
              <option value="all">All Risk Levels</option>
              <option value="critical">Critical (&gt;85)</option>
              <option value="high">High (70-84)</option>
              <option value="medium">Medium (50-69)</option>
              <option value="low">Low (&lt;50)</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-[#F9FAFB] border border-slate-200/80 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF]"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table view */}
      {filteredThreats.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAFBFD] border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th
                  onClick={() => toggleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Threat</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Platform</th>
                <th className="py-3 px-4">Brand</th>
                <th
                  onClick={() => toggleSort('riskScore')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Risk Score</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Detected</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredThreats.map((threat) => (
                <tr
                  key={threat.id}
                  className="hover:bg-[#F9FAFB] transition-colors"
                >
                  {/* Threat */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={threat.candidateLogo}
                        alt={threat.candidateName}
                        className="w-9 h-9 rounded-xl object-cover border border-slate-200/80 shrink-0 shadow-xs"
                      />
                      <div className="min-w-0 max-w-[220px]">
                        <p className="font-semibold text-slate-900 truncate">
                          {threat.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {threat.candidateDeveloper || threat.candidateWebsite}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Platform */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                      {getPlatformIcon(threat.platform)}
                      <span>{threat.platform}</span>
                    </div>
                  </td>

                  {/* Brand */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <BrandLogo
                        brandName={threat.brandName}
                        domain={threat.officialWebsite}
                        logoUrl={threat.officialLogo}
                        size={20}
                        className="w-5 h-5 rounded-md border border-slate-200/60 shrink-0"
                      />
                      <span className="font-semibold text-slate-800">
                        {threat.brandName}
                      </span>
                    </div>
                  </td>

                  {/* Risk Score */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${
                        threat.riskScore >= 85
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : threat.riskScore >= 70
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {threat.riskScore} / 100
                    </span>
                  </td>

                  {/* Risk Level */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusBadge status={threat.riskLevel} size="sm" />
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusBadge status={threat.status} size="sm" />
                  </td>

                  {/* Detected */}
                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                    {threat.detectedAt}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <Link
                        href={`/reports/create?threatId=${threat.id}&brandId=${threat.brandId}&brandName=${encodeURIComponent(threat.brandName)}&url=${encodeURIComponent(threat.candidateWebsite || threat.url || '')}&riskScore=${threat.riskScore}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-lg border border-amber-200/80 dark:border-amber-900/60 transition-colors"
                        title="Report Unofficial Website / Threat"
                      >
                        <Flag className="w-3 h-3 text-amber-600" />
                        Report
                      </Link>
                      <Link
                        href={`/threats/${threat.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#007AFF] bg-[#EAF3FF] hover:bg-[#D5E8FF] rounded-lg transition-colors"
                      >
                        View Details
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No matching threats found"
          description="Adjust your search query or filter settings to expand results."
          actionText="Reset Filters"
          onAction={() => {
            setSearch('');
            setBrandFilter('all');
            setPlatformFilter('all');
            setRiskFilter('all');
            setStatusFilter('all');
          }}
        />
      )}
    </div>
  );
}
