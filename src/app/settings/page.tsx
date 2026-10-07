'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/common/PageHeader';
import { useToast } from '@/components/common/ToastProvider';
import { currentOrganization, currentUser } from '@/data/users';
import {
  Building2,
  Lock,
  Bell,
  Palette,
  Sun,
  Moon,
  Laptop,
  ShieldCheck,
  Check,
  Smartphone,
  Key,
} from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'org' | 'security' | 'notifications' | 'appearance'>('org');

  // Org form state
  const [orgName, setOrgName] = useState(currentOrganization.name);
  const [orgWebsite, setOrgWebsite] = useState(currentOrganization.domain);

  // Notifications state
  const [critAlerts, setCritAlerts] = useState(true);
  const [highAlerts, setHighAlerts] = useState(true);
  const [dailySummary, setDailySummary] = useState(true);

  // Security state
  const [mfaEnabled, setMfaEnabled] = useState(true);

  const handleSave = (section: string) => {
    toast.success('Settings Saved', `${section} configuration updated successfully.`);
  };

  return (
    <AppShell>
      <PageHeader
        title="Settings"
        subtitle="Manage organization profiles, threat notification thresholds, and security controls."
      />

      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation Tabs Left */}
        <div className="md:w-64 shrink-0">
          <div className="apple-card p-2 space-y-1">
            <button
              onClick={() => setActiveTab('org')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-left transition-all ${
                activeTab === 'org'
                  ? 'bg-[#EAF3FF] text-[#007AFF] font-semibold'
                  : 'text-slate-600 hover:bg-[#F2F4F7]'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Organization</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-left transition-all ${
                activeTab === 'security'
                  ? 'bg-[#EAF3FF] text-[#007AFF] font-semibold'
                  : 'text-slate-600 hover:bg-[#F2F4F7]'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Security</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-left transition-all ${
                activeTab === 'notifications'
                  ? 'bg-[#EAF3FF] text-[#007AFF] font-semibold'
                  : 'text-slate-600 hover:bg-[#F2F4F7]'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </button>

            <button
              onClick={() => setActiveTab('appearance')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-left transition-all ${
                activeTab === 'appearance'
                  ? 'bg-[#EAF3FF] text-[#007AFF] font-semibold'
                  : 'text-slate-600 hover:bg-[#F2F4F7]'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Appearance</span>
            </button>
          </div>
        </div>

        {/* Content Panel Right */}
        <div className="flex-1">
          {/* Organization Settings */}
          {activeTab === 'org' && (
            <div className="apple-card p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Organization Profile
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Global tenant settings for your cybersecurity operations workspace.
                </p>
              </div>

              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#F9FAFB] border border-slate-200/80 rounded-xl text-slate-900 focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Corporate Domain Website
                  </label>
                  <input
                    type="text"
                    value={orgWebsite}
                    onChange={(e) => setOrgWebsite(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-mono bg-[#F9FAFB] border border-slate-200/80 rounded-xl text-slate-900 focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Organization Logo
                  </label>
                  <div className="flex items-center gap-4">
                    <img
                      src={currentOrganization.logo}
                      alt="Org logo"
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200/80 shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => toast.info('Logo Upload', 'Mock logo upload trigger.')}
                      className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl shadow-xs transition-colors"
                    >
                      Update Logo
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => handleSave('Organization')}
                  className="px-5 py-2 text-xs font-medium text-white bg-[#007AFF] hover:bg-[#0066D6] rounded-xl shadow-sm shadow-[#007AFF]/20 transition-all active:scale-98"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="apple-card p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Security & Authentication Controls
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enforce strict access security for SOC analysts.
                </p>
              </div>

              <div className="space-y-4 max-w-lg">
                <div className="p-4 rounded-2xl border border-slate-100 bg-[#FAFBFD] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-[#007AFF]" />
                      Two-Factor Authentication (2FA)
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Require hardware security keys or authenticator apps (TOTP).
                    </p>
                  </div>
                  <button
                    onClick={() => setMfaEnabled(!mfaEnabled)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      mfaEnabled ? 'bg-[#007AFF]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                        mfaEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-4 rounded-2xl border border-slate-100 bg-[#FAFBFD] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Active SOC Sessions
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Logged in from Windows (Current session) • IP: 103.21.244.0
                    </p>
                  </div>
                  <button
                    onClick={() => toast.success('Sessions Terminated', 'All other analyst sessions revoked.')}
                    className="px-3 py-1.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    Revoke Others
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => handleSave('Security')}
                  className="px-5 py-2 text-xs font-medium text-white bg-[#007AFF] hover:bg-[#0066D6] rounded-xl shadow-sm shadow-[#007AFF]/20 transition-all active:scale-98"
                >
                  Update Security Baseline
                </button>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="apple-card p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Notification & Alert Escalation
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Configure when security alerts trigger Slack, email, or webhook notifications.
                </p>
              </div>

              <div className="space-y-3 max-w-lg">
                <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-100 bg-[#FAFBFD] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={critAlerts}
                    onChange={(e) => setCritAlerts(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-[#007AFF] rounded accent-[#007AFF]"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900">
                      Critical Threat Alerts (Instant SMS / PagerDuty)
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Trigger immediate dispatch when an impersonation score exceeds 85/100.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-100 bg-[#FAFBFD] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={highAlerts}
                    onChange={(e) => setHighAlerts(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-[#007AFF] rounded accent-[#007AFF]"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900">
                      High Risk Impersonations (Email Digest)
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Notify on suspicious apps claiming discounts or impersonating support.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-100 bg-[#FAFBFD] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dailySummary}
                    onChange={(e) => setDailySummary(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-[#007AFF] rounded accent-[#007AFF]"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900">
                      Daily Threat Intelligence Summary
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Morning briefing summarizing scanning counts and legal resolutions.
                    </p>
                  </div>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => handleSave('Notifications')}
                  className="px-5 py-2 text-xs font-medium text-white bg-[#007AFF] hover:bg-[#0066D6] rounded-xl shadow-sm shadow-[#007AFF]/20 transition-all active:scale-98"
                >
                  Save Notification Rules
                </button>
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="apple-card p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Appearance & Theme
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Customize the interface theme for high-contrast day or night operations.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg">
                {/* Light */}
                <button
                  onClick={() => {
                    setTheme('light');
                    toast.success('Theme Changed', 'Switched to Light mode.');
                  }}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    theme === 'light'
                      ? 'border-[#007AFF] bg-[#EAF3FF] ring-2 ring-[#007AFF]/20'
                      : 'border-slate-200/80 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mb-3">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Light</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Clean high-contrast daytime interface</p>
                  </div>
                </button>

                {/* Dark */}
                <button
                  onClick={() => {
                    setTheme('dark');
                    toast.success('Theme Changed', 'Switched to Dark mode.');
                  }}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    theme === 'dark'
                      ? 'border-[#007AFF] bg-[#EAF3FF] ring-2 ring-[#007AFF]/20'
                      : 'border-slate-200/80 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-blue-400 border border-slate-700 flex items-center justify-center mb-3">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Dark</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Deep navy cybersecurity SOC mode</p>
                  </div>
                </button>

                {/* System */}
                <button
                  onClick={() => {
                    setTheme('system');
                    toast.success('Theme Changed', 'Synced with System OS settings.');
                  }}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    theme === 'system'
                      ? 'border-[#007AFF] bg-[#EAF3FF] ring-2 ring-[#007AFF]/20'
                      : 'border-slate-200/80 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center mb-3">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">System</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Match device OS preference</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
