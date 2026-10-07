'use client';

import React, { useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { useUser } from '@/context/UserContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useUser();

  // If already logged in, redirect straight to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleContinue = useCallback(
    (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }
      // Immediately create lightweight local demo session and navigate
      login();
      router.push('/dashboard');
    },
    [login, router]
  );

  // Pressing Enter anywhere triggers Continue
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleContinue();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleContinue]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top right ThemeToggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Left side: Cybersecurity Branding */}
      <div className="md:w-1/2 bg-slate-900 text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden border-r border-slate-800">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-white">BrandGuard</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  AI
                </span>
              </div>
              <p className="text-xs text-slate-400">Digital Risk Protection</p>
            </div>
          </Link>
        </div>

        <div className="relative z-10 my-12 sm:my-20 max-w-lg">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Autonomous Threat Intelligence
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Protect your digital brand identity.
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-4 leading-relaxed font-normal">
            Detect impersonation across apps and social platforms using trusted brand intelligence.
          </p>

          <div className="mt-8 space-y-3 pt-6 border-t border-slate-800/80">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Multi-platform app store crawler (Google Play, iOS & APKs)</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Visual & lexical logo vector similarity analysis</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Cryptographic official anchor vs rogue candidate verification</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500 flex items-center justify-between border-t border-slate-800/60 pt-4">
          <span>Enterprise Grade Security</span>
          <span>SOC 2 Type II Certified</span>
        </div>
      </div>

      {/* Right side: Zero-Input Demo Login Card */}
      <div className="md:w-1/2 p-6 sm:p-12 lg:p-16 flex items-center justify-center">
        <div className="w-full max-w-md apple-card p-8 sm:p-10 shadow-sm">
          {/* Card Brand Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">BrandGuard</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                  AI
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Digital Risk Protection</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Sign in to BrandGuard
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Enter the BrandGuard digital risk protection platform.
            </p>
          </div>

          <form onSubmit={handleContinue} className="space-y-4">
            {/* Prominent Continue CTA */}
            <button
              id="continue-button"
              type="submit"
              className="w-full flex items-center justify-center gap-2.5 py-3 px-4 text-sm font-semibold text-white bg-[#007AFF] hover:bg-[#0066D6] active:scale-[0.98] rounded-xl shadow-md shadow-[#007AFF]/25 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#007AFF]/50"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-xs text-slate-400 dark:text-slate-500 pt-1 font-medium">
              Demo access
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
