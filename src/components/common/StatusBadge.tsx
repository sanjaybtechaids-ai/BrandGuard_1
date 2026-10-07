import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle2, Clock, ShieldAlert, Eye } from 'lucide-react';

export type SecurityStatusType =
  | 'Verified'
  | 'Trusted'
  | 'Suspicious'
  | 'High'
  | 'High Risk'
  | 'Critical'
  | 'Investigating'
  | 'Under Review'
  | 'Resolved'
  | 'New'
  | 'Active'
  | 'Pending'
  | 'Low'
  | 'Low Risk';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({ status, size = 'md', showIcon = true, className = '' }: StatusBadgeProps) {
  const norm = status.toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  let icon = <Clock className="w-3 h-3" />;

  if (norm === 'verified') {
    styles = 'bg-[#EAF3FF] text-[#007AFF] dark:bg-blue-950/60 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/60 font-semibold';
    icon = <CheckCircle2 className="w-3 h-3 text-[#007AFF] dark:text-blue-400" />;
  } else if (norm === 'trusted' || norm === 'active' || norm === 'resolved' || norm === 'low' || norm === 'low risk') {
    styles = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/60 font-medium';
    icon = <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />;
  } else if (norm === 'critical' || norm === 'high' || norm === 'high risk') {
    styles = 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 border-red-200/80 dark:border-red-900/60 font-semibold';
    icon = <AlertOctagon className="w-3 h-3 text-red-600 dark:text-red-400" />;
  } else if (norm === 'medium' || norm === 'medium risk' || norm === 'suspicious') {
    styles = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200/80 dark:border-amber-900/60 font-medium';
    icon = <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />;
  } else if (norm === 'investigating' || norm === 'under review') {
    styles = 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200/80 dark:border-blue-900/60 font-medium';
    icon = <Eye className="w-3 h-3 text-blue-600 dark:text-blue-400" />;
  } else if (norm === 'new') {
    styles = 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200/80 dark:border-purple-900/60';
    icon = <Clock className="w-3 h-3 text-purple-600 dark:text-purple-400" />;
  } else if (norm === 'pending') {
    styles = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    icon = <Clock className="w-3 h-3 text-slate-500" />;
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border tracking-tight transition-colors ${sizeClasses[size]} ${styles} ${className}`}
    >
      {showIcon && icon}
      <span>{status}</span>
    </span>
  );
}
