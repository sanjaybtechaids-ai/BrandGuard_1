import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, actions, badge, className = '' }: PageHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200/60 mb-6 ${className}`}>
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
}
