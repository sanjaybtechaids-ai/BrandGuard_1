'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, ArrowRight, CheckCircle2, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/common/ToastProvider';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { signIn } from '@/services/auth.service';

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState('security@abc.com');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    toast.loading('Authenticating security credentials...');

    try {
      const res = await signIn(email, password);
      if (res.success) {
        toast.success(`Welcome back, ${res.user.name}`, 'Signed into ABC Technologies security workspace.');
        router.push('/dashboard');
      } else {
        toast.error('Authentication Failed', res.error || 'Invalid security credentials.');
      }
    } catch {
      toast.error('Login Error', 'Failed to authenticate.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    toast.loading('Initiating corporate SSO login...');

    setTimeout(() => {
      setIsLoading(false);
      toast.success('SSO Authenticated', 'Access granted via corporate Google Workspace.');
      router.push('/dashboard');
    }, 900);
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

      {/* Right side: Login Card */}
      <div className="md:w-1/2 p-6 sm:p-12 lg:p-16 flex items-center justify-center">
        <div className="w-full max-w-md apple-card p-8 sm:p-10 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Sign In to BrandGuard
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Enter your enterprise credentials to access your security dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Work Email */}
            <div>
              <label
                htmlFor="email"
                className="text-xs font-semibold text-slate-700 block mb-1.5"
              >
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@organization.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#F9FAFB] border border-slate-200/80 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] transition-all font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold text-slate-700"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => toast.info('Password Reset', 'Password reset instructions dispatched to your email.')}
                  className="text-xs font-medium text-[#007AFF] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#F9FAFB] border border-slate-200/80 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] transition-all font-mono"
                />
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[#007AFF] border-slate-300 rounded focus:ring-[#007AFF] accent-[#007AFF]"
              />
              <label htmlFor="remember" className="text-xs text-slate-600 font-medium">
                Remember me for 30 days
              </label>
            </div>

            {/* Sign In CTA */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-white bg-[#007AFF] hover:bg-[#0066D6] rounded-xl shadow-sm shadow-[#007AFF]/20 transition-all active:scale-98 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/80" />
            </div>
            <span className="relative px-3 bg-white text-xs text-slate-400 uppercase font-medium">
              or
            </span>
          </div>

          {/* Continue with Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl transition-all shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google Workspace</span>
          </button>

          {/* Bottom create organization link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Don&apos;t have an organization? </span>
            <button
              onClick={() => toast.info('Organization Setup', 'Contact enterprise sales or sign in with your company email domain.')}
              className="font-semibold text-[#007AFF] hover:underline"
            >
              Create organization
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
