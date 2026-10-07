'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/common/PageHeader';
import { useToast } from '@/components/common/ToastProvider';
import { BrandDiscovery } from '@/components/brands/BrandDiscovery';
import {
  Shield,
  Globe,
  Mail,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Sparkles,
  Smartphone,
  Share2,
} from 'lucide-react';

export default function AddBrandPage() {
  const router = useRouter();
  const toast = useToast();

  const [mode, setMode] = useState<'auto' | 'manual'>('auto');

  // Form states
  const [brandName, setBrandName] = useState('');
  const [website, setWebsite] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [logoPreview, setLogoPreview] = useState(
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80'
  );

  // Social links dynamic list
  const [socialLinks, setSocialLinks] = useState<Array<{ platform: string; handle: string; url: string }>>([
    { platform: 'Instagram', handle: '@brand_official', url: 'https://instagram.com/brand_official' },
    { platform: 'X', handle: '@BrandOfficial', url: 'https://x.com/brandofficial' },
  ]);

  // App links dynamic list
  const [appLinks, setAppLinks] = useState<Array<{ platform: string; name: string; packageId: string }>>([
    { platform: 'Google Play', name: 'Brand Mobile App', packageId: 'com.brand.app' },
  ]);

  // Submission progression states: 'idle' | 'loading' | 'success'
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [createdBrandId, setCreatedBrandId] = useState<string>('');

  const handleAddSocial = () => {
    setSocialLinks((prev) => [
      ...prev,
      { platform: 'LinkedIn', handle: '@brand_corp', url: 'https://linkedin.com/company/brand' },
    ]);
  };

  const handleRemoveSocial = (idx: number) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddApp = () => {
    setAppLinks((prev) => [
      ...prev,
      { platform: 'Apple App Store', name: 'Brand iOS App', packageId: 'com.brand.ios' },
    ]);
  };

  const handleRemoveApp = (idx: number) => {
    setAppLinks((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) {
      toast.error('Validation Error', 'Please enter a valid brand name.');
      return;
    }

    setSubmitState('loading');
    toast.loading('Creating trusted profile...', 'Validating domain records and anchoring cryptographic baseline');

    // Simulate multi-step verification process
    setTimeout(async () => {
      try {
        const res = await fetch('/api/brands', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: brandName,
            website: website || 'company.com',
            company: `${brandName}, Inc.`,
            logo: logoPreview,
            description: `Monitored brand profile for ${brandName}.`,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error?.message || 'Failed to create brand');
        }

        const brand = data.data;
        setCreatedBrandId(brand.id);
        setSubmitState('success');
        window.dispatchEvent(new CustomEvent('brandguard:brand-created', { detail: { id: brand.id } }));
        toast.success(
          'Brand profile created successfully.',
          `Trusted identity profile for "${brandName}" is now active in continuous monitoring.`
        );
      } catch (err: unknown) {
        setSubmitState('idle');
        toast.error('Failed to create brand profile', (err as Error).message);
      }
    }, 1800);
  };

  return (
    <AppShell>
      <PageHeader
        title="Add a Brand"
        subtitle="Create a trusted identity profile for continuous brand protection."
        actions={
          <Link
            href="/brands"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            ← Back to Brands
          </Link>
        }
      />

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-center mb-8">
        <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
          <button
            type="button"
            onClick={() => setMode('auto')}
            className={`flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'auto'
                ? 'bg-white dark:bg-slate-900 text-[#007AFF] shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-Discovery (Recommended)</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'manual'
                ? 'bg-white dark:bg-slate-900 text-[#007AFF] shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Manual Configuration</span>
          </button>
        </div>
      </div>

      {mode === 'auto' ? (
        <div className="max-w-4xl mx-auto">
          <BrandDiscovery onBrandCreated={(id) => router.push(`/brands/${id}`)} />
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          {submitState === 'idle' && (
            <form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6"
            >
            {/* Core Brand Identity Section */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  1. Core Identity & Verification Baseline
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Enter primary corporate information used as the canonical ground truth.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Brand Name */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Brand Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Acme Corporation or Nike"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Official Website */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Official Website <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="e.g. acme.com or nike.com"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Company Email */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Company Security Contact Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      placeholder="security@acme.com"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Logo Upload (Optional) */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Official Brand Logo (Vector Anchor)
              </label>
              <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs"
                />
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                    High-resolution official insignia
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Used to train the visual logo similarity detection neural vector.
                  </p>
                  <button
                    type="button"
                    onClick={() => toast.info('Logo Upload', 'Mock logo upload initialized. Sample visual vector attached.')}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Change Image
                  </button>
                </div>
              </div>
            </div>

            {/* Official Social Links */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Official Social Links (Optional)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Legitimate handles that will not be falsely flagged as impersonators.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSocial}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Link
                </button>
              </div>

              <div className="space-y-2 mt-3">
                {socialLinks.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-24 text-xs font-semibold px-2.5 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 truncate">
                      {item.platform}
                    </span>
                    <input
                      type="text"
                      value={item.handle}
                      onChange={(e) => {
                        const copy = [...socialLinks];
                        copy[idx].handle = e.target.value;
                        setSocialLinks(copy);
                      }}
                      placeholder="@handle"
                      className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSocial(idx)}
                      className="p-2 text-slate-400 hover:text-red-500"
                      aria-label="Remove social link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Official App Links */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Official App Store Links (Optional)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Verified package identifiers and developer signing keys.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddApp}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add App
                </button>
              </div>

              <div className="space-y-2 mt-3">
                {appLinks.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-28 text-xs font-semibold px-2.5 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 truncate">
                      {item.platform}
                    </span>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => {
                        const copy = [...appLinks];
                        copy[idx].name = e.target.value;
                        setAppLinks(copy);
                      }}
                      placeholder="App Name"
                      className="w-1/3 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={item.packageId}
                      onChange={(e) => {
                        const copy = [...appLinks];
                        copy[idx].packageId = e.target.value;
                        setAppLinks(copy);
                      }}
                      placeholder="com.package.id"
                      className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveApp(idx)}
                      className="p-2 text-slate-400 hover:text-red-500"
                      aria-label="Remove app link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <Link
                href="/brands"
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-[#007AFF] hover:bg-[#0066D6] rounded-xl shadow-xs shadow-blue-500/20 transition-all active:scale-98"
              >
                <span>Create Brand Profile</span>
                <ArrowRight className="w-4 h-4 stroke-[2]" />
              </button>
            </div>
          </form>
        )}

        {/* Loading State */}
        {submitState === 'loading' && (
          <div className="apple-card p-10 text-center bg-white dark:bg-slate-900 animate-in fade-in-50">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-[#007AFF] dark:text-blue-400 flex items-center justify-center mx-auto mb-5 shadow-2xs">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
              Creating trusted profile...
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Verifying official domain signatures, vectorizing brand logos, and establishing
              cryptographic baseline for {brandName || 'new brand'}.
            </p>

            <div className="mt-8 max-w-sm mx-auto space-y-2.5 text-left text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Domain DNS & SSL chain verified</span>
              </div>
              <div className="flex items-center gap-2 text-[#007AFF] dark:text-blue-400 font-medium animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating multi-modal visual logo vector...</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[9px]">
                  3
                </span>
                <span>Initializing daily automated app store crawlers</span>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {submitState === 'success' && (
          <div className="apple-card p-8 sm:p-10 text-center bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-900/60 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-200/60 dark:border-emerald-800/60 shadow-2xs">
              <CheckCircle2 className="w-8 h-8 stroke-[2]" />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 text-xs font-semibold mb-3 border border-emerald-200/80">
              <Sparkles className="w-3.5 h-3.5" />
              Trusted Baseline Active
            </span>

            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Brand profile created successfully.
            </h3>

            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
              <strong>{brandName}</strong> has been enrolled into continuous digital risk protection.
              BrandGuard AI will immediately alert your team upon detecting suspicious app or social
              clones.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/brands/${createdBrandId || 'nike'}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-[#007AFF] hover:bg-[#0066D6] rounded-xl shadow-xs shadow-blue-500/20 transition-all active:scale-98"
              >
                <span>View Brand Profile</span>
                <ArrowRight className="w-4 h-4 stroke-[2]" />
              </Link>
              <Link
                href="/brands"
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Return to Brand Directory
              </Link>
            </div>
          </div>
        )}
      </div>
      )}
    </AppShell>
  );
}
