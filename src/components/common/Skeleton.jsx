import React from 'react';

export function Skeleton({ className = '', rounded = 'rounded-lg' }) {
  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden bg-white/5 dark:bg-white/5 light:bg-slate-200 ${rounded} ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 dark:via-white/10 light:via-white/40 to-transparent" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Skeleton className="w-24 h-6 rounded-md" />
        <Skeleton className="w-16 h-6 rounded-md" />
      </div>
      <Skeleton className="w-3/4 h-8 rounded-lg" />
      <Skeleton className="w-1/2 h-5 rounded-md" />
      <div className="pt-2 flex flex-col gap-2">
        <Skeleton className="w-full h-4 rounded" />
        <Skeleton className="w-5/6 h-4 rounded" />
      </div>
      <div className="pt-2 flex justify-between items-center">
        <Skeleton className="w-20 h-9 rounded-xl" />
        <Skeleton className="w-28 h-9 rounded-xl" />
      </div>
    </div>
  );
}
