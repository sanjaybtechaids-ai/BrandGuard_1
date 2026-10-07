'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { useToast } from '@/components/common/ToastProvider';
import { alertsList as initialAlerts } from '@/data/alerts';
import { Alert } from '@/types/alert';
import { useBrandContext } from '@/context/BrandContext';
import { BrandSelector } from '@/components/common/BrandSelector';
import {
  Bell,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  Info,
  Clock,
  ArrowRight,
  CheckCheck,
  Filter,
} from 'lucide-react';

export default function AlertsPage() {
  const { selectedBrand, availableBrands } = useBrandContext();
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [filterSeverity, setFilterSeverity] = useState<'All' | 'Critical' | 'High' | 'Medium'>('All');
  const [brandFilter, setBrandFilter] = useState<string>(() => selectedBrand?.id || 'ALL');
  const toast = useToast();

  useEffect(() => {
    if (selectedBrand) {
      setBrandFilter(selectedBrand.id);
    }
  }, [selectedBrand]);

  const handleMarkAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    toast.success('All Alerts Cleared', 'Marked all current notifications as acknowledged.');
  };

  const handleToggleRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, read: !a.read } : a))
    );
  };

  const filteredAlerts = alerts.filter((alert) => {
    // 1. Brand filtering
    if (brandFilter !== 'ALL') {
      const matchBrand = availableBrands.find(
        (b) => b.id.toLowerCase() === brandFilter.toLowerCase() || b.name.toLowerCase() === brandFilter.toLowerCase()
      );
      const targetName = matchBrand ? matchBrand.name.toLowerCase() : brandFilter.toLowerCase();
      if (alert.brandName.toLowerCase() !== targetName && !alert.title.toLowerCase().includes(targetName)) {
        return false;
      }
    }

    // 2. Severity filtering
    if (filterSeverity === 'All') return true;
    return alert.severity.toLowerCase() === filterSeverity.toLowerCase();
  });

  const getAlertIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'Critical':
        return <AlertOctagon className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />;
      case 'High':
        return <AlertTriangle className="w-5 h-5 text-orange-500 dark:text-orange-400 shrink-0" />;
      case 'Medium':
        return <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0" />;
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Alerts & Notifications"
        subtitle="Realtime incident feed of detected brand impersonations, rogue APKs, and scanning events."
        actions={
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl shadow-xs transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All as Read</span>
          </button>
        }
      />

      {/* Brand Scope Filter & Severity Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Brand Scope:</span>
          <BrandSelector
            value={brandFilter}
            onChange={(id) => setBrandFilter(id || 'ALL')}
            showAllOption={true}
            size="sm"
          />
        </div>

        {/* Severity Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-medium">
          {(['All', 'Critical', 'High', 'Medium'] as const).map((lvl) => {
            const count =
              lvl === 'All'
                ? alerts.length
                : alerts.filter((a) => a.severity.toLowerCase() === lvl.toLowerCase()).length;

          return (
            <button
              key={lvl}
              onClick={() => setFilterSeverity(lvl)}
              className={`px-3.5 py-1.5 rounded-xl border transition-all ${
                filterSeverity === lvl
                  ? 'bg-[#007AFF] text-white border-[#007AFF] shadow-sm font-semibold'
                  : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <span>{lvl}</span>
              <span
                className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                  filterSeverity === lvl
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
        </div>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length > 0 ? (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`apple-card p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                !alert.read
                  ? 'border-[#007AFF]/30 bg-[#F4F8FF]'
                  : ''
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-2.5 rounded-2xl shrink-0 ${
                    alert.severity === 'Critical'
                      ? 'bg-rose-50 border border-rose-200'
                      : alert.severity === 'High'
                      ? 'bg-amber-50 border border-amber-200'
                      : 'bg-amber-50 border border-amber-200'
                  }`}
                >
                  {getAlertIcon(alert.severity)}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-slate-900">
                      {alert.title}
                    </h3>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        alert.severity === 'Critical'
                          ? 'bg-rose-100 text-rose-700'
                          : alert.severity === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    {!alert.read && (
                      <span className="w-2 h-2 rounded-full bg-[#007AFF] animate-pulse" />
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                    {alert.description}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {alert.timestamp}
                    </span>
                    <span>•</span>
                    <span>Brand: <strong className="text-slate-700 font-medium">{alert.brandName}</strong></span>
                    {alert.platform && (
                      <>
                        <span>•</span>
                        <span>{alert.platform}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => handleToggleRead(alert.id)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium"
                >
                  {alert.read ? 'Mark unread' : 'Acknowledge'}
                </button>
                <Link
                  href={alert.targetUrl}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#007AFF] bg-[#EAF3FF] hover:bg-[#D5E8FF] rounded-xl transition-colors"
                >
                  <span>Investigate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No alerts matching this filter"
          description="You are caught up on all alerts in this category."
          actionText="Show All Alerts"
          onAction={() => setFilterSeverity('All')}
        />
      )}
    </AppShell>
  );
}
