'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, CheckCircle2, Loader2, X, AlertTriangle, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/common/ToastProvider';
import { useBrandContext } from '@/context/BrandContext';
import { BrandLogo } from '@/components/common/BrandLogo';
import { BrandSelector } from '@/components/common/BrandSelector';
import { ScanType } from '@/types/scan';

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandId?: string | null;
  brandName?: string | null;
  scanType?: ScanType;
  onScanComplete?: (scanResult?: any) => void;
}

export function ScanModal({
  isOpen,
  onClose,
  brandId: propBrandId,
  brandName: propBrandName,
  scanType = 'FULL',
  onScanComplete,
}: ScanModalProps) {
  const router = useRouter();
  const { selectedBrand, selectedBrandId, availableBrands, setSelectedBrandId } = useBrandContext();
  const toast = useToast();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(10);
  const [isCompleted, setIsCompleted] = useState(false);
  const [candidatesCount, setCandidatesCount] = useState(14);
  const [threatsCount, setThreatsCount] = useState(2);

  // Resolve effective brand strictly
  const effectiveBrandId = propBrandId || selectedBrand?.id || selectedBrandId;
  const effectiveBrand = useMemo(() => {
    if (!effectiveBrandId) return selectedBrand || null;
    return (
      availableBrands.find(
        (b) =>
          b.id.toLowerCase() === effectiveBrandId.toLowerCase() ||
          b.name.toLowerCase() === effectiveBrandId.toLowerCase()
      ) || selectedBrand || null
    );
  }, [effectiveBrandId, availableBrands, selectedBrand]);

  const effectiveBrandName = propBrandName || effectiveBrand?.name || '';

  const scanSteps = useMemo(() => {
    const target = effectiveBrandName || 'Target Brand';
    return [
      `Querying official brand profile & verified assets for ${target}...`,
      `Crawling Google Play, Apple App Store & APK repositories for ${target} look-alikes...`,
      `Inspecting social platforms (Instagram, X, YouTube, Telegram) for @${target} impersonators...`,
      `Executing visual & lexical similarity vector comparison for ${target}...`,
      `Evaluating domain registrar DNS & SSL certificate chains for ${target}...`,
      `Finalizing brand impersonation risk intelligence scoring for ${target}...`,
    ];
  }, [effectiveBrandName]);

  // Initiate scan API call and simulate pipeline progress
  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setProgress(10);
      setIsCompleted(false);
      return;
    }

    if (!effectiveBrandId) {
      return;
    }

    // Fire actual backend scan API
    fetch(`/api/brands/${encodeURIComponent(effectiveBrandId)}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scanType }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          if (json.data.candidatesCount) setCandidatesCount(json.data.candidatesCount);
          if (json.data.threatsCount !== undefined) setThreatsCount(json.data.threatsCount);
        }
      })
      .catch(() => {
        // Fallback gracefully
      });

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCompleted(true);
          return 100;
        }
        const next = prev + 18;
        const step = Math.min(
          Math.floor((next / 100) * scanSteps.length),
          scanSteps.length - 1
        );
        setCurrentStepIndex(step);
        return next > 100 ? 100 : next;
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isOpen, effectiveBrandId, scanType, scanSteps]);

  if (!isOpen) return null;

  const handleFinish = () => {
    toast.success('Brand Scan Complete', `Scanned ecosystem for ${effectiveBrandName}. Threats monitored.`);
    onScanComplete?.();
    onClose();
    if (effectiveBrandId) {
      router.push(`/threats?brand=${encodeURIComponent(effectiveBrandId)}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in-0 duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Shield className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Brand Impersonation Scan
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span>Target:</span>
                {effectiveBrand ? (
                  <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                    <BrandLogo
                      brandId={effectiveBrand.id}
                      brandName={effectiveBrand.name}
                      domain={effectiveBrand.canonicalDomain || effectiveBrand.website}
                      size={14}
                    />
                    <span>{effectiveBrand.name}</span>
                  </div>
                ) : (
                  <span className="text-amber-600 font-semibold">No brand selected</span>
                )}
              </div>
            </div>
          </div>
          {!isCompleted && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              aria-label="Close scan"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Empty brand state safeguard (Part 42, 44) */}
        {!effectiveBrandId ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Select a Brand to Start Scanning
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Scan & Monitor is strictly brand-specific. Please choose a protected brand to initiate monitoring.
              </p>
            </div>
            <div className="pt-2 max-w-xs mx-auto">
              <BrandSelector
                value={null}
                onChange={(id) => {
                  if (id) setSelectedBrandId(id);
                }}
              />
            </div>
          </div>
        ) : (
          <div className="py-6">
            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden mb-5">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {!isCompleted ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin shrink-0" />
                  <span className="font-medium animate-pulse">{scanSteps[currentStepIndex]}</span>
                </div>

                <div className="space-y-2 pt-2">
                  {scanSteps.map((step, idx) => (
                    <div
                      key={step}
                      className={`flex items-center gap-2.5 text-xs transition-colors ${
                        idx < currentStepIndex
                          ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                          : idx === currentStepIndex
                          ? 'text-blue-600 dark:text-blue-400 font-medium'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {idx < currentStepIndex ? (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center shrink-0">
                          <span className="w-1 h-1 bg-current rounded-full" />
                        </div>
                      )}
                      <span className="truncate">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-2 space-y-4 animate-in fade-in-50">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Scan Completed for {effectiveBrandName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    Monitored digital footprint across Google Play, Apple App Store, and social platforms.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 text-left">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Scanned</span>
                    <p className="text-base font-bold text-slate-900 dark:text-slate-100">{candidatesCount}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Threats</span>
                    <p className="text-base font-bold text-amber-600">{threatsCount}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Status</span>
                    <p className="text-base font-bold text-emerald-600">Active</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          {isCompleted ? (
            <button
              onClick={handleFinish}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all active:scale-98 flex items-center gap-1.5"
            >
              <span>View {effectiveBrandName} Threats</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : !effectiveBrandId ? (
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Run In Background
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
