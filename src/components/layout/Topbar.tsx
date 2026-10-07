'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, ChevronDown, Menu, Globe, Sparkles, Shield } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { alertsList } from '@/data/alerts';
import { currentUser } from '@/data/users';
import { UrlVerificationModal } from '@/components/verification/UrlVerificationModal';
import { detectSearchInputType } from '@/components/common/SearchBar';
import { useBrandContext } from '@/context/BrandContext';
import { BrandLogo } from '@/components/common/BrandLogo';
import { BrandSelector } from '@/components/common/BrandSelector';

interface TopbarProps {
  onOpenMobileMenu: () => void;
}

export function Topbar({ onOpenMobileMenu }: TopbarProps) {
  const router = useRouter();
  const { mode, setMode, selectedBrand } = useBrandContext();
  const [searchValue, setSearchValue] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [urlVerificationModalOpen, setUrlVerificationModalOpen] = useState(false);
  const [verificationTargetUrl, setVerificationTargetUrl] = useState('');

  const unreadAlerts = alertsList.filter((a) => !a.read);
  const inputType = detectSearchInputType(searchValue);
  const isUrlOrDomain = inputType === 'URL' || inputType === 'DOMAIN';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    if (!q) return;

    if (isUrlOrDomain) {
      setVerificationTargetUrl(q);
      setUrlVerificationModalOpen(true);
    } else if (inputType === 'BRAND_NAME') {
      router.push(`/brands/${encodeURIComponent(q.toLowerCase())}`);
    } else {
      router.push(`/threats?search=${encodeURIComponent(q)}`);
    }
  };

  const handleLaunchVerification = (urlToVerify?: string) => {
    setVerificationTargetUrl(urlToVerify || searchValue);
    setUrlVerificationModalOpen(true);
  };

  return (
    <>
      <header className="h-16 px-4 sm:px-8 bg-transparent flex items-center justify-between sticky top-0 z-30 select-none">
        {/* Left: Mobile hamburger menu toggle + Search bar */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-xl lg:hidden hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-xs"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Bar with URL recognition */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search brand, threat, or paste URL (e.g. nike.com)..."
              className="w-full pl-10 pr-24 py-2 text-[13px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all font-medium"
            />
            {isUrlOrDomain ? (
              <button
                type="button"
                onClick={() => handleLaunchVerification()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-semibold text-white bg-[#007AFF] hover:bg-[#0066D6] rounded-lg shadow-xs transition-colors flex items-center gap-1"
              >
                <Globe className="w-3 h-3" />
                <span>Verify</span>
              </button>
            ) : inputType === 'BRAND_NAME' ? (
              <button
                type="button"
                onClick={() => router.push('/brands/add')}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-semibold text-white bg-[#007AFF] hover:bg-[#0066D6] rounded-lg shadow-xs transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Discover</span>
              </button>
            ) : null}
          </form>
        </div>

        {/* Right: Brand Indicator, Mode Selector, Quick URL Verify Button, Notifications, User Avatar pill & Theme toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-3">
          {/* Active Brand Scope Selector & Indicator (Part 50, 53) */}
          <div className="hidden xl:flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Monitoring
            </span>
            <BrandSelector size="sm" showAllOption={false} placeholder="Select Brand..." />
          </div>

          {/* Top-Right Mode Selector (Part 28) */}
          <div
            className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-semibold shadow-2xs"
            role="group"
            aria-label="Mode selection"
          >
            <button
              type="button"
              onClick={() => setMode('user')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                mode === 'user'
                  ? 'bg-white dark:bg-slate-900 text-[#007AFF] shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="User Mode (Default public monitoring)"
            >
              User
            </button>
            <button
              type="button"
              onClick={() => setMode('organization')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                mode === 'organization'
                  ? 'bg-white dark:bg-slate-900 text-[#007AFF] shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="Organization Mode (Enterprise security management)"
            >
              Organization
            </button>
          </div>

          {/* Quick "Verify Brand URL" Button */}
          <button
            onClick={() => handleLaunchVerification('')}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#007AFF] bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 dark:text-blue-300 rounded-xl border border-blue-200/60 dark:border-blue-900/60 transition-colors shadow-xs"
            title="Verify an external domain against trusted brand profile"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Verify URL</span>
          </button>

          {/* Notification Bell */}
          <Link
            href="/alerts"
            className="relative p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-sm transition-all"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4 stroke-[1.8]" />
            {unreadAlerts.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </Link>

          {/* User Pill Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-sm transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-teal-800 dark:bg-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                S
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-white hidden sm:inline">
                {currentUser.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl shadow-xl z-40 p-1.5 text-xs">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700/60 mb-1">
                  <p className="font-bold text-slate-900 dark:text-white">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-400">{currentUser.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                    {mode === 'organization' ? 'Security Analyst' : 'User'}
                  </span>
                </div>
                <Link
                  href="/settings"
                  onClick={() => setUserDropdownOpen(false)}
                  className="block px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                >
                  Account Settings
                </Link>
                {mode === 'organization' && (
                  <Link
                    href="/team"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                  >
                    Team Access
                  </Link>
                )}
                <Link
                  href="/login"
                  onClick={() => setUserDropdownOpen(false)}
                  className="block px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                >
                  Sign Out
                </Link>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </header>

      <UrlVerificationModal
        isOpen={urlVerificationModalOpen}
        onClose={() => setUrlVerificationModalOpen(false)}
        initialUrl={verificationTargetUrl}
      />
    </>
  );
}
