import React from 'react';

export function LoadingState({ message = 'Loading security data...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="relative">
        <div className="w-10 h-10 border-2 border-slate-200 dark:border-slate-800 border-t-[#007AFF] rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-[#007AFF] rounded-full animate-ping" />
        </div>
      </div>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 animate-pulse">
        {message}
      </p>
    </div>
  );
}

export default LoadingState;
