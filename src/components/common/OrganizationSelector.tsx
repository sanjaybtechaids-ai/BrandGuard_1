'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useBrandContext } from '@/context/BrandContext';
import { Building2, ChevronDown, Check, ShieldCheck } from 'lucide-react';

export interface OrganizationSelectorProps {
  value?: string;
  onChange?: (orgId: string) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function OrganizationSelector({
  value,
  onChange,
  size = 'md',
  className = '',
}: OrganizationSelectorProps) {
  const { availableOrganizations, selectedOrganizationId, setSelectedOrganizationId } = useBrandContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeId = value || selectedOrganizationId;
  const currentOrg = availableOrganizations.find((o) => o.id === activeId) || availableOrganizations[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (orgId: string) => {
    if (onChange) {
      onChange(orgId);
    } else {
      setSelectedOrganizationId(orgId);
    }
    setIsOpen(false);
  };

  const isSmall = size === 'sm';

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl transition-all shadow-2xs hover:border-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100 ${
          isSmall ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/40 dark:border-indigo-800/40">
            <Building2 className="w-3.5 h-3.5" />
          </div>

          <div className="flex flex-col text-left truncate">
            <span className="font-bold truncate text-slate-900 dark:text-slate-100">{currentOrg.name}</span>
            <span className="text-[10px] text-slate-400 truncate">{currentOrg.domain}</span>
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-64 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-1.5 animate-in fade-in-50 zoom-in-95 duration-100">
          <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800/80 mb-1">
            Authorized Organizations
          </div>

          {availableOrganizations.map((org) => {
            const isSelected = activeId === org.id;
            return (
              <button
                key={org.id}
                type="button"
                onClick={() => handleSelect(org.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center shrink-0">
                    <Building2 className="w-3 h-3" />
                  </div>
                  <div className="flex flex-col text-left truncate">
                    <span className="truncate">{org.name}</span>
                    <span className="text-[10px] text-slate-400 truncate">{org.domain}</span>
                  </div>
                </div>

                {isSelected && <Check className="w-4 h-4 text-indigo-600 ml-2 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
