'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Shield,
  Search,
  Smartphone,
  Share2,
  Globe,
  FileText,
  Bell,
  Users,
  Settings,
  Building2,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  User,
} from 'lucide-react';
import { alertsList } from '@/data/alerts';
import { useBrandContext } from '@/context/BrandContext';
import { useUser } from '@/context/UserContext';

interface SidebarProps {
  onCloseMobile?: () => void;
  onOpenScanModal?: () => void;
}

export function Sidebar({ onCloseMobile, onOpenScanModal }: SidebarProps) {
  const pathname = usePathname();
  const { mode, selectedOrganization, setSelectedOrganizationId, availableOrganizations } = useBrandContext();
  const { user } = useUser();
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const unreadAlertsCount = alertsList.filter((a) => !a.read).length;

  const displayName = user?.name || 'User';
  const displayInitial = displayName[0]?.toUpperCase() || 'U';

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Brands', href: '/brands', icon: Shield },
    {
      name: 'Scan & Monitor',
      href: '/scan',
      icon: Search,
    },
    { name: 'Apps Monitoring', href: '/apps', icon: Smartphone },
    { name: 'Social Monitoring', href: '/social', icon: Share2 },
    { name: 'Web Impersonation', href: '/threats', icon: Globe },
    { name: 'Reports', href: '/reports', icon: FileText },
    {
      name: 'Alerts',
      href: '/alerts',
      icon: Bell,
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : undefined,
    },
    ...(mode === 'organization' ? [{ name: 'Team', href: '/team', icon: Users }] : []),
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (itemHref: string, itemName: string) => {
    if (itemName === 'Dashboard') return pathname === '/dashboard' || pathname === '/';
    if (itemHref === '/scan') return pathname.startsWith('/scan');
    if (itemName === 'Web Impersonation') return pathname === '/threats' && false;
    if (itemHref === '/brands') return pathname.startsWith('/brands');
    if (itemHref === '/apps') return pathname.startsWith('/apps');
    if (itemHref === '/social') return pathname.startsWith('/social');
    if (itemHref === '/threats') return pathname.startsWith('/threats');
    if (itemHref === '/reports') return pathname.startsWith('/reports');
    if (itemHref === '/alerts') return pathname.startsWith('/alerts');
    if (itemHref === '/team') return pathname.startsWith('/team');
    if (itemHref === '/settings') return pathname.startsWith('/settings');
    return false;
  };

  return (
    <aside className="w-64 flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 select-none transition-colors">
      {/* BrandGuard AI Top Logo */}
      <div className="p-6 pb-5">
        <Link
          href="/dashboard"
          onClick={onCloseMobile}
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[17px] tracking-tight text-slate-900 dark:text-white">
                BrandGuard AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide">
              Detect • Verify • Protect
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3.5 py-1 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href, item.name);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => {
                onCloseMobile?.();
              }}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all ${
                active
                  ? 'bg-[#EAF3FF] dark:bg-blue-950/60 text-[#007AFF] dark:text-blue-400 font-semibold shadow-[0_1px_3px_rgba(0,122,255,0.06)]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-[19px] h-[19px] stroke-[1.8] ${
                    active
                      ? 'text-[#007AFF] dark:text-blue-400'
                      : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500'
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 border border-red-200/80 dark:border-red-900/60">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Profile and Organization */}
      <div className="p-3.5 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
        {mode === 'organization' ? (
          <>
            {/* Organization Card (Only in Organization Mode) */}
            <div className="relative">
              <button
                onClick={() => setShowOrgDropdown(!showOrgDropdown)}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#007AFF] dark:text-blue-400 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 block font-medium">Organization</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                      {selectedOrganization?.name || 'Select Organization'}
                    </p>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
              </button>

              {showOrgDropdown && (
                <div className="absolute bottom-full left-0 w-full mb-1 p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-30 text-xs space-y-1">
                  <div className="px-2 py-1.5 text-[10px] font-semibold text-slate-400 uppercase">
                    Switch Organization
                  </div>
                  {availableOrganizations.map((org) => {
                    const isSelected = selectedOrganization.id === org.id;
                    return (
                      <button
                        key={org.id}
                        type="button"
                        onClick={() => {
                          setSelectedOrganizationId(org.id);
                          setShowOrgDropdown(false);
                        }}
                        className={`w-full px-2 py-1.5 rounded-lg font-medium flex items-center justify-between text-left transition-colors ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="truncate">{org.name}</span>
                        {isSelected && (
                          <span className="text-[9px] bg-[#007AFF] text-white px-1 py-0.5 rounded">Active</span>
                        )}
                      </button>
                    );
                  })}
                  <Link
                    href="/settings"
                    onClick={() => setShowOrgDropdown(false)}
                    className="w-full block px-2 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-[11px]"
                  >
                    Organization Settings
                  </Link>
                </div>
              )}
            </div>

            {/* User Card with Security Analyst role */}
            <Link
              href="/settings"
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-teal-800 dark:bg-teal-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  {displayInitial}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate font-medium">
                    Security Analyst
                  </p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            </Link>
          </>
        ) : (
          /* User Mode: Clean minimal profile without organization identity */
          <Link
            href="/settings"
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-slate-700">
                <User className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                  {displayName}
                </p>
                <p className="text-[10px] text-slate-400 truncate font-medium">
                  User Mode
                </p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          </Link>
        )}
      </div>
    </aside>
  );
}
