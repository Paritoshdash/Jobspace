import React from 'react';

export default function JobCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="h-5 w-2/5 bg-slate-200 rounded" />
          <div className="h-4 w-1/4 bg-slate-100 rounded" />
        </div>
        <div className="h-8 w-8 bg-slate-100 rounded-lg" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <div className="h-6 w-20 bg-slate-100 rounded-md" />
        <div className="h-6 w-24 bg-slate-100 rounded-md" />
        <div className="h-6 w-16 bg-slate-100 rounded-md" />
      </div>

      <div className="mt-4 space-y-2">
        <div className="h-3 w-full bg-slate-100 rounded" />
        <div className="h-3 w-4/5 bg-slate-100 rounded" />
      </div>

      <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex gap-1.5">
          <div className="h-5 w-14 bg-slate-100 rounded" />
          <div className="h-5 w-16 bg-slate-100 rounded" />
          <div className="h-5 w-12 bg-slate-100 rounded" />
        </div>
        <div className="h-4 w-20 bg-slate-200 rounded" />
      </div>
    </div>
  );
}
