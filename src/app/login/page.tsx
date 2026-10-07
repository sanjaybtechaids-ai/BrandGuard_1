'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, User as UserIcon, ArrowRight, CheckCircle2, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/common/ToastProvider';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { useUser } from '@/context/UserContext';

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const { login, isAuthenticated } = useUser();
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect straight to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setErrorMessage('Please enter your name.');
      toast.error('Validation Error', 'Please enter your name.');
      return;
    }

    if (trimmed.length < 2) {
      setErrorMessage('Name must be at least 2 characters.');
      toast.error('Validation Error', 'Name must be at least 2 characters.');
      return;
    }

    if (trimmed.length > 60) {
      setErrorMessage('Name must not exceed 60 characters.');
      toast.error('Validation Error', 'Name must not exceed 60 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await login(trimmed);
      if (res.success) {
        toast.success(`Welcome, ${trimmed}`);
        router.push('/dashboard');
      } else {
        setErrorMessage(res.error || 'Failed to sign in.');
        toast.error('Login Error', res.error || 'Failed to sign in.');
        setIsLoading(false);
      }
    } catch {
      setErrorMessage('An unexpected error occurred.');
      toast.error('Login Error', 'Failed to sign in.');
      setIsLoading(false);
    }
  };

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

      {/* Right side: Name-Only Demo Login Card */}
      <div className="md:w-1/2 p-6 sm:p-12 lg:p-16 flex items-center justify-center">
        <div className="w-full max-w-md apple-card p-8 sm:p-10 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Sign In to BrandGuard
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Enter your name to continue to your digital risk dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Your Name */}
            <div>
              <label
                htmlFor="userName"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5"
              >
                Your Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="userName"
                  name="userName"
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Enter your name"
                  aria-describedby={errorMessage ? 'name-error' : undefined}
                  aria-invalid={Boolean(errorMessage)}
                  className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#F9FAFB] dark:bg-slate-900/60 border ${
                    errorMessage
                      ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                      : 'border-slate-200/80 dark:border-slate-800 focus:ring-[#007AFF]/20 focus:border-[#007AFF]'
                  } rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all font-medium`}
                />
              </div>
              {errorMessage && (
                <p id="name-error" className="text-xs text-red-500 dark:text-red-400 mt-1.5 flex items-center gap-1 font-medium" role="alert">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMessage}</span>
                </p>
              )}
            </div>

            {/* Continue CTA */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-white bg-[#007AFF] hover:bg-[#0066D6] rounded-xl shadow-sm shadow-[#007AFF]/20 transition-all active:scale-98 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing you in...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-400 dark:text-slate-500 pt-1">
              Demo access — no password required
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
