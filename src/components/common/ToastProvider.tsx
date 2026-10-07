'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, Loader2, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (props: Omit<ToastMessage, 'id'>) => string;
  success: (title: string, description?: string) => string;
  error: (title: string, description?: string) => string;
  warning: (title: string, description?: string) => string;
  info: (title: string, description?: string) => string;
  loading: (title: string, description?: string) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, description, duration = 4000 }: Omit<ToastMessage, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, title, description, duration }]);

      if (type !== 'loading' && duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
      return id;
    },
    [dismissToast]
  );

  const success = useCallback(
    (title: string, description?: string) => showToast({ type: 'success', title, description }),
    [showToast]
  );

  const error = useCallback(
    (title: string, description?: string) => showToast({ type: 'error', title, description }),
    [showToast]
  );

  const warning = useCallback(
    (title: string, description?: string) => showToast({ type: 'warning', title, description }),
    [showToast]
  );

  const info = useCallback(
    (title: string, description?: string) => showToast({ type: 'info', title, description }),
    [showToast]
  );

  const loading = useCallback(
    (title: string, description?: string) =>
      showToast({ type: 'loading', title, description, duration: 0 }),
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{ showToast, success, error, warning, info, loading, dismissToast }}
    >
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4"
      >
        {toasts.map((toast) => {
          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />,
            error: <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />,
            info: <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />,
            loading: <Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0 mt-0.5" />,
          };

          const borders = {
            success: 'border-emerald-200/80 bg-white/95 backdrop-blur-md',
            error: 'border-rose-200/80 bg-white/95 backdrop-blur-md',
            warning: 'border-amber-200/80 bg-white/95 backdrop-blur-md',
            info: 'border-blue-200/80 bg-white/95 backdrop-blur-md',
            loading: 'border-slate-200/80 bg-white/95 backdrop-blur-md',
          };

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl transition-all animate-in slide-in-from-bottom-2 ${borders[toast.type]}`}
            >
              {icons[toast.type]}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  {toast.title}
                </p>
                {toast.description && (
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
