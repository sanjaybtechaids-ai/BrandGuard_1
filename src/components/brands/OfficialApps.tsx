import React from 'react';
import { OfficialApp } from '@/types/brand';
import { Smartphone, CheckCircle2, ShieldCheck } from 'lucide-react';

interface OfficialAppsProps {
  apps: OfficialApp[];
}

function OfficialAppIcon({ src, alt }: { src?: string; alt: string }) {
  const [error, setError] = React.useState(false);

  if (!src || error) {
    return (
      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
        <Smartphone className="w-5 h-5 text-slate-400" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      loading="lazy"
      decoding="async"
      className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
    />
  );
}

export function OfficialApps({ apps }: OfficialAppsProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Official Applications
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800/50">
              {apps.length} Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cryptographically anchored mobile apps representing ground-truth brand signatures
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {apps.map((app) => (
          <div
            key={app.id}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800/70 transition-all group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <OfficialAppIcon src={app.icon} alt={app.name} />
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {app.name}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  <span className="truncate">{app.developer}</span>
                  <span>•</span>
                  <span>{app.platform}</span>
                </div>
                <code className="text-[10px] text-slate-400 font-mono block truncate mt-0.5">
                  {app.packageId}
                </code>
              </div>
            </div>

            <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/80 dark:border-emerald-800/60 ml-2">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              Official
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
