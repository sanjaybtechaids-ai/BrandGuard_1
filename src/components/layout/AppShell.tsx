'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ScanModal } from '../dashboard/ScanModal';
import { useBrandContext } from '@/context/BrandContext';
import { X } from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const { selectedBrand } = useBrandContext();

  return (
    <div className="min-h-screen flex bg-[#F5F7FA] dark:bg-[#0D1117] text-slate-900 dark:text-slate-100 antialiased selection:bg-[#007AFF]/20 selection:text-[#007AFF]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0 h-screen sticky top-0 z-40">
        <Sidebar onOpenScanModal={() => setScanModalOpen(true)} />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex flex-col w-72 max-w-xs h-full bg-white dark:bg-slate-900 z-50 animate-in slide-in-from-left duration-200 shadow-2xl">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar
              onCloseMobile={() => setMobileMenuOpen(false)}
              onOpenScanModal={() => {
                setMobileMenuOpen(false);
                setScanModalOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <Topbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-3 pb-12 w-full max-w-[1600px] mx-auto overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Global Scan Modal */}
      <ScanModal
        isOpen={scanModalOpen}
        onClose={() => setScanModalOpen(false)}
        brandId={selectedBrand?.id}
        brandName={selectedBrand?.name}
      />
    </div>
  );
}
